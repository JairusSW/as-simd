#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const args = process.argv.slice(2);

let benchName = "";
let mode = "swar";
let filter = "";
let keepLogs = false;
let jsonOutput = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--mode") {
    mode = (args[++i] || "").toLowerCase();
  } else if (arg === "--filter") {
    filter = args[++i] || "";
  } else if (arg === "--keep-logs") {
    keepLogs = true;
  } else if (arg === "--json") {
    jsonOutput = true;
  } else if (!benchName) {
    benchName = arg;
  } else {
    usage(`Unknown argument: ${arg}`);
  }
}

if (!benchName) usage("Missing benchmark name");
if (mode !== "swar" && mode !== "simd") usage("--mode must be swar or simd");

const benchPath = resolveBench(benchName);
const source = readFileSync(benchPath, "utf8");
const labels = [...source.matchAll(/bench\("([^"]+)"/g)].map((m) => m[1]);
const selected = filter
  ? labels.filter((label) => new RegExp(filter).test(label))
  : labels;

if (!labels.length) fail(`No bench(...) calls found in ${benchPath}`);
if (!selected.length) fail(`No benchmark labels matched ${filter}`);

const v8Bin = findBin(process.env.D8_BIN || "", [
  "d8",
  "v8",
  path.join(process.env.HOME || "", ".jsvu/bin/v8"),
]);
if (!v8Bin) fail("Could not find d8 or v8. Set D8_BIN=/path/to/d8.");

const outDir = path.join(
  root,
  "build",
  "v8-score",
  safe(path.basename(benchPath, ".bench.ts")),
  mode,
);
mkdirSync(outDir, { recursive: true });

const rows = [];
const tempSources = [];
for (const label of selected) {
  const base = safe(label);
  const filteredSource = filterSourceToBench(source, label);
  // Keep the temporary source next to the original so relative imports remain valid.
  const srcPath = path.join(
    path.dirname(benchPath),
    `.v8-score-${base}.bench.ts`,
  );
  const wasmPath = path.join(outDir, `${base}.wasm`);
  const logPath = path.join(outDir, `${base}.v8.log`);
  writeFileSync(srcPath, filteredSource);
  tempSources.push(srcPath);

  run("npx", [
    "asc",
    srcPath,
    "-o",
    wasmPath,
    "-O3",
    "--converge",
    "--noAssert",
    "--uncheckedBehavior",
    "always",
    "--runtime",
    "incremental",
    "--use",
    "BENCH_SAMPLES=1",
    "--use",
    "BENCH_PREALLOC_BYTES=0",
    "--use",
    "AS_BENCH_RUNTIME_V8=1",
    "--enable",
    "bulk-memory",
    "--enable",
    "sign-extension",
    ...(mode === "simd"
      ? [
          "--use",
          "AS_BENCH_FORCE_SIMD=1",
          "--enable",
          "simd",
          "--enable",
          "relaxed-simd",
        ]
      : ["--use", "AS_BENCH_FORCE_SWAR=1"]),
    "--exportStart",
    "start",
    "--exportRuntime",
  ]);

  const wasmRelToBuild = path.relative(path.join(root, "build"), wasmPath);
  const v8 = spawnSync(
    v8Bin,
    [
      "--no-liftoff",
      "--no-wasm-tier-up",
      "--trace-wasm-compilation-times",
      "--print-wasm-code",
      "--trace-turbo-stack-accesses",
      "--module",
      "./bench/runners/assemblyscript.js",
      "--",
      wasmRelToBuild,
    ],
    { cwd: root, encoding: "utf8" },
  );
  writeFileSync(logPath, (v8.stdout || "") + (v8.stderr || ""));
  if (v8.status !== 0) {
    process.stderr.write(readFileSync(logPath, "utf8"));
    fail(`V8 failed for ${label}`);
  }

  rows.push({
    label,
    ...parseV8Log(readFileSync(logPath, "utf8")),
    ...parseWasmObjdump(wasmPath),
    log: path.relative(root, logPath),
  });
}

for (const row of rows) {
  // This is intentionally V8-biased. Stack traffic dominates tiny SWAR kernels,
  // while native code size catches register-pressure and lowering differences.
  row.score =
    row.instructionBytes +
    row.stackLoads * 2 +
    row.stackStores * 4 +
    row.staticStores * 16 +
    row.staticLoads * 8;
}

rows.sort((a, b) => a.score - b.score);
const bestScore = rows[0]?.score || 0;
for (let i = 0; i < rows.length; i++) {
  rows[i].rank = i + 1;
  rows[i].delta = rows[i].score - bestScore;
}

if (jsonOutput) {
  process.stdout.write(
    JSON.stringify({
      bench: path.relative(root, benchPath),
      mode,
      v8Bin,
      rows,
    }),
  );
} else {
  console.log(`V8 score for ${path.relative(root, benchPath)} (${mode})`);
  console.log(`d8/v8: ${v8Bin}`);
  console.log("");
  printTable(rows, [
    ["rank", (r) => String(r.rank)],
    ["label", (r) => r.label],
    ["delta", (r) => fmt(r.delta)],
    ["score", (r) => fmt(r.score)],
    ["instrB", (r) => fmt(r.instructionBytes)],
    ["codeB", (r) => fmt(r.codeBytes)],
    ["compileUs", (r) => fmt(r.compileMicros)],
    ["stackL", (r) => fmt(r.stackLoads)],
    ["stackS", (r) => fmt(r.stackStores)],
    ["wasmL", (r) => fmt(r.staticLoads)],
    ["wasmS", (r) => fmt(r.staticStores)],
    ["ops/s", (r) => (r.opsPerSecond ? fmt(r.opsPerSecond) : "-")],
  ]);
}

if (keepLogs && !jsonOutput) {
  console.log("");
  console.log(`Logs kept under ${path.relative(root, outDir)}`);
} else {
  for (const srcPath of tempSources) {
    try {
      rmSync(srcPath);
    } catch {}
  }
  for (const entry of rows) {
    try {
      rmSync(path.join(root, entry.log));
    } catch {}
  }
}

function resolveBench(name) {
  if (existsSync(name)) return path.resolve(root, name);
  const normalized = name.endsWith(".bench.ts") ? name : `${name}.bench.ts`;
  const candidates = [
    path.join(root, normalized),
    path.join(root, "assembly", "__benches__", normalized),
    path.join(
      root,
      "assembly",
      "__benches__",
      "custom",
      normalized.replace(/^custom\//, ""),
    ),
  ];
  for (const candidate of candidates)
    if (existsSync(candidate)) return candidate;
  fail(`Benchmark not found: ${name}`);
}

function filterSourceToBench(src, wanted) {
  const lines = src.split(/\r?\n/);
  let skippingBench = false;
  return lines
    .map((line) => {
      const match = line.match(/bench\("([^"]+)"/);
      if (match) {
        const keep = match[1] === wanted;
        skippingBench = !keep;
        if (!keep) return `// skipped by scripts/v8-score.mjs: ${line}`;
      } else if (skippingBench) {
        if (line.includes("dumpToFile(")) {
          skippingBench = false;
        }
        return `// skipped by scripts/v8-score.mjs: ${line}`;
      }
      return line;
    })
    .join("\n");
}

function parseV8Log(log) {
  let compileMicros = 0;
  let codeBytes = 0;
  let wasmBodyBytes = 0;
  let instructionBytes = 0;
  let compiledFunctions = 0;
  let opsPerSecond = 0;
  let stackLoads = 0;
  let stackStores = 0;

  for (const line of log.split(/\r?\n/)) {
    const compiled = line.match(
      /Compiled function .* took (\d+) μs .* bodysize (\d+) codesize (\d+)/,
    );
    if (compiled) {
      compiledFunctions++;
      compileMicros += Number(compiled[1]);
      wasmBodyBytes += Number(compiled[2]);
      codeBytes += Number(compiled[3]);
      continue;
    }
    const instructions = line.match(/Instructions \(size = (\d+)/);
    if (instructions) {
      instructionBytes += Number(instructions[1]);
      continue;
    }
    const ops = line.match(/median ([\d,]+) ops\/s/);
    if (ops) {
      opsPerSecond = Number(ops[1].replaceAll(",", ""));
      continue;
    }
    const stack = line.match(/Total Loads: ([\d,]+), Total Stores: ([\d,]+)/);
    if (stack) {
      stackLoads = Number(stack[1].replaceAll(",", ""));
      stackStores = Number(stack[2].replaceAll(",", ""));
    }
  }

  return {
    compiledFunctions,
    compileMicros,
    wasmBodyBytes,
    codeBytes,
    instructionBytes,
    opsPerSecond,
    stackLoads,
    stackStores,
  };
}

function parseWasmObjdump(wasmPath) {
  const result = spawnSync("wasm-objdump", ["-d", wasmPath], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) return { staticLoads: 0, staticStores: 0 };
  const out = result.stdout || "";
  return {
    staticLoads: (
      out.match(/\b(?:i32|i64|f32|f64)\.load(?:8|16|32)?(?:_[su])?\b/g) || []
    ).length,
    staticStores: (
      out.match(/\b(?:i32|i64|f32|f64)\.store(?:8|16|32)?\b/g) || []
    ).length,
  };
}

function printTable(rows, columns) {
  const data = rows.map((row, index) =>
    columns.map(([, getter]) => getter(row, index)),
  );
  const widths = columns.map(([name], i) =>
    Math.max(name.length, ...data.map((row) => row[i].length)),
  );
  console.log(columns.map(([name], i) => name.padEnd(widths[i])).join("  "));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of data)
    console.log(row.map((cell, i) => cell.padEnd(widths[i])).join("  "));
}

function run(cmd, argv) {
  const result = spawnSync(cmd, argv, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    fail(`${cmd} ${argv.join(" ")} failed`);
  }
}

function findBin(preferred, names) {
  if (preferred && existsSync(preferred)) return preferred;
  for (const name of names) {
    if (name.includes("/") && existsSync(name)) return name;
    const result = spawnSync("which", [name], { encoding: "utf8" });
    const found = result.stdout.trim();
    if (result.status === 0 && found) return found;
  }
  return "";
}

function safe(value) {
  return (
    value.replace(/[^a-zA-Z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "") || "bench"
  );
}

function fmt(value) {
  return Math.round(value).toLocaleString("en-US");
}

function usage(message) {
  if (message) console.error(message);
  console.error(
    "Usage: node scripts/v8-score.mjs <bench|custom/bench> [--mode swar|simd] [--filter regex] [--keep-logs] [--json]",
  );
  process.exit(2);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

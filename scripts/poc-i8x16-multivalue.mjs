import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const compiler2Asc = path.resolve(root, "../compiler2/bin/asc.js");
const source = path.resolve(root, "prototypes/i8x16-multivalue-poc.ts");
const outDir = path.resolve(root, "build/poc");
const wasmPath = path.join(outDir, "i8x16-multivalue-poc.wasm");
const watPath = path.join(outDir, "i8x16-multivalue-poc.wat");

fs.mkdirSync(outDir, { recursive: true });

const compile = spawnSync(
  process.execPath,
  [
    compiler2Asc,
    source,
    "--enable", "multi-value",
    "--runtime", "stub",
    "--target", "release",
    "--outFile", wasmPath,
    "--textFile", watPath,
  ],
  { cwd: root, stdio: "inherit" },
);

if (compile.status !== 0) process.exit(compile.status ?? 1);

const bytes = fs.readFileSync(wasmPath);
const { instance } = await WebAssembly.instantiate(bytes, {});
const e = instance.exports;

const ITERS = 5_000_000;
const ROUNDS = 5;
const aLo = 0xfedcba9876543210n;
const aHi = 0x0123456789abcdefn;
const bLo = 0x8899aabbccddeeffn;
const bHi = 0x1020304050607080n;

function bench(name, fn) {
  let sink = 0n;
  for (let i = 0; i < 3; i++) sink ^= fn();
  const samples = [];
  for (let i = 0; i < ROUNDS; i++) {
    const start = performance.now();
    sink ^= fn();
    const end = performance.now();
    samples.push(end - start);
  }
  const best = Math.min(...samples);
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const opsPerSec = ITERS / (best / 1000);
  return { name, sink, bestMs: best, avgMs: avg, opsPerSec };
}

const results = [
  bench("add.current", () => e.addCurrentLoop(ITERS, aLo, aHi, bLo, bHi)),
  bench("add.multi", () => e.addMultiLoop(ITERS, aLo, aHi, bLo, bHi)),
  bench("lt_s.current", () => e.ltSCurrentLoop(ITERS, aLo, aHi, bLo, bHi)),
  bench("lt_s.multi", () => e.ltSMultiLoop(ITERS, aLo, aHi, bLo, bHi)),
];

const rawAdd = e.addMultiRaw(aLo, aHi, bLo, bHi);
const rawLt = e.ltSMultiRaw(aLo, aHi, bLo, bHi);

console.log(`compiler: ${compiler2Asc}`);
console.log(`wasm: ${wasmPath}`);
console.log(`wat: ${watPath}`);
console.log("");
for (const result of results) {
  console.log(
    `${result.name.padEnd(13)} best=${result.bestMs.toFixed(3)}ms avg=${result.avgMs.toFixed(3)}ms ops/s=${(result.opsPerSec / 1e6).toFixed(1)}M sink=${result.sink}`,
  );
}
console.log("");
console.log(`addMultiRaw -> [${rawAdd[0]}, ${rawAdd[1]}]`);
console.log(`ltSMultiRaw -> [${rawLt[0]}, ${rawLt[1]}]`);

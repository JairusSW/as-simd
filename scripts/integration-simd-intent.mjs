import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as asc from "assemblyscript/dist/asc.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ascCli = path.join(repoRoot, "node_modules", "assemblyscript", "bin", "asc.js");
const transformPath = path.join(repoRoot, "transform", "index.mjs");
const infoPattern = /\[as-simd\/transform\] info:/;

function runAscCli(args, cwd) {
  return spawnSync(process.execPath, [ascCli, ...args], {
    cwd,
    encoding: "utf8",
  });
}

async function runAscProgrammatic(args) {
  const result = await asc.main(args);
  return {
    status: result.error ? 1 : 0,
    stdout: result.stdout?.toString() ?? "",
    stderr: result.stderr?.toString() ?? "",
  };
}

const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "as-simd-intent-"));

try {
  const entry = path.join(fixtureRoot, "entry.ts");
  await fs.writeFile(entry, ["export function run(a: v128, b: v128): v128 {", "  return i8x16.add(a, b);", "}"].join("\n"));
  const programmaticEntry = path.join(fixtureRoot, "programmatic.ts");
  await fs.writeFile(programmaticEntry, ["export function runProgrammatic(): i32 {", "  return 7;", "}"].join("\n"));
  const swarFlagsEntry = path.join(fixtureRoot, "swar-flags.ts");
  await fs.writeFile(
    swarFlagsEntry,
    [
      "export function simdFeature(): i32 {",
      "  return ASC_FEATURE_SIMD ? 1 : 0;",
      "}",
      "",
      "export function relaxedSimdFeature(): i32 {",
      "  return ASC_FEATURE_RELAXED_SIMD ? 1 : 0;",
      "}",
    ].join("\n")
  );

  // Case 1: explicit CLI --enable simd should not emit fallback warning.
  const case1 = runAscCli([entry, "--config", "none", "--transform", transformPath, "--enable", "simd", "--outFile", path.join(fixtureRoot, "case1.wasm")], fixtureRoot);
  assert.equal(case1.status, 0, `case1 compile failed:\n${case1.stderr}`);
  assert.doesNotMatch(`${case1.stdout}${case1.stderr}`, infoPattern);

  // Case 2: programmatic asc.main should remain compatible with transform wiring.
  const case2 = await runAscProgrammatic([
    programmaticEntry,
    "--config",
    "none",
    "--transform",
    transformPath,
    "--enable",
    "simd",
    "--outFile",
    path.join(fixtureRoot, "case2.wasm"),
  ]);
  assert.equal(case2.status, 0, `case2 compile failed:\n${case2.stderr}`);
  assert.doesNotMatch(`${case2.stdout}${case2.stderr}`, /\[as-simd\/transform\] strict mode does not support/);

  // Case 3: SWAR mode must force ASC_FEATURE_SIMD and ASC_FEATURE_RELAXED_SIMD to 0.
  const case3Wat = path.join(fixtureRoot, "case3.wat");
  const case3 = runAscCli(
    [
      swarFlagsEntry,
      "--config",
      "none",
      "--transform",
      transformPath,
      "--enable",
      "simd,relaxed-simd",
      "--use",
      "AS_BENCH_FORCE_SWAR=1",
      "--textFile",
      case3Wat,
      "--outFile",
      path.join(fixtureRoot, "case3.wasm"),
    ],
    fixtureRoot
  );
  assert.equal(case3.status, 0, `case3 compile failed:\n${case3.stderr}`);
  const wat = await fs.readFile(case3Wat, "utf8");
  assert.match(wat, /\(global \$~lib\/native\/ASC_FEATURE_SIMD i32 \(i32.const 0\)\)/, "ASC_FEATURE_SIMD should be 0 in SWAR mode");
  assert.match(wat, /\(global \$~lib\/native\/ASC_FEATURE_RELAXED_SIMD i32 \(i32.const 0\)\)/, "ASC_FEATURE_RELAXED_SIMD should be 0 in SWAR mode");

  // Case 4: explicit disable + v128-family usage should fail with strict diagnostic.
  const case4 = runAscCli(
    [entry, "--config", "none", "--transform", transformPath, "--disable", "simd", "--outFile", path.join(fixtureRoot, "case4.wasm")],
    fixtureRoot
  );
  assert.notEqual(case4.status, 0, "case4 should fail without explicit SIMD opt-in");
} finally {
  await fs.rm(fixtureRoot, { recursive: true, force: true });
}

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
const packageOwnedConfig = path.join(repoRoot, ".tmp-internal-enable-simd.asconfig.json");

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

  // Case 2: explicit asconfig enables simd via extends chain should not emit warning.
  const baseConfig = path.join(fixtureRoot, "base.asconfig.json");
  const leafConfig = path.join(fixtureRoot, "leaf.asconfig.json");
  await fs.writeFile(baseConfig, JSON.stringify({ options: { enable: ["simd"] } }, null, 2));
  await fs.writeFile(leafConfig, JSON.stringify({ extends: "./base.asconfig.json" }, null, 2));

  const case2 = runAscCli([entry, "--config", leafConfig, "--transform", transformPath, "--outFile", path.join(fixtureRoot, "case2.wasm")], fixtureRoot);
  assert.equal(case2.status, 0, `case2 compile failed:\n${case2.stderr}`);
  assert.doesNotMatch(`${case2.stdout}${case2.stderr}`, infoPattern);

  // Case 3: programmatic asc.main should remain compatible with transform wiring.
  const case3 = await runAscProgrammatic([
    programmaticEntry,
    "--config",
    "none",
    "--transform",
    transformPath,
    "--enable",
    "simd",
    "--outFile",
    path.join(fixtureRoot, "case3.wasm"),
  ]);
  assert.equal(case3.status, 0, `case3 compile failed:\n${case3.stderr}`);
  assert.doesNotMatch(`${case3.stdout}${case3.stderr}`, /\[as-simd\/transform\] strict mode does not support/);

  // Case 4: SWAR mode must force ASC_FEATURE_SIMD and ASC_FEATURE_RELAXED_SIMD to 0.
  const case4Wat = path.join(fixtureRoot, "case4.wat");
  const case4 = runAscCli(
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
      case4Wat,
      "--outFile",
      path.join(fixtureRoot, "case4.wasm"),
    ],
    fixtureRoot
  );
  assert.equal(case4.status, 0, `case4 compile failed:\n${case4.stderr}`);
  const wat = await fs.readFile(case4Wat, "utf8");
  assert.match(wat, /\(global \$~lib\/native\/ASC_FEATURE_SIMD i32 \(i32.const 0\)\)/, "ASC_FEATURE_SIMD should be 0 in SWAR mode");
  assert.match(wat, /\(global \$~lib\/native\/ASC_FEATURE_RELAXED_SIMD i32 \(i32.const 0\)\)/, "ASC_FEATURE_RELAXED_SIMD should be 0 in SWAR mode");

  // Case 5: package-owned enable simd in extends chain is not explicit user intent; must stay SWAR.
  await fs.writeFile(packageOwnedConfig, JSON.stringify({ options: { enable: ["simd"] } }, null, 2));
  const externalLeafNoOptIn = path.join(fixtureRoot, "external-leaf-no-optin.asconfig.json");
  await fs.writeFile(externalLeafNoOptIn, JSON.stringify({ extends: packageOwnedConfig }, null, 2));
  const case5Wat = path.join(fixtureRoot, "case5.wat");
  const case5 = runAscCli(
    [swarFlagsEntry, "--config", externalLeafNoOptIn, "--transform", transformPath, "--textFile", case5Wat, "--outFile", path.join(fixtureRoot, "case5.wasm")],
    fixtureRoot
  );
  assert.equal(case5.status, 0, `case5 compile failed:\n${case5.stderr}`);
  const case5WatText = await fs.readFile(case5Wat, "utf8");
  assert.match(case5WatText, /\(global \$~lib\/native\/ASC_FEATURE_SIMD i32 \(i32.const 0\)\)/, "inherited package enable should not be treated as explicit SIMD opt-in");
  assert.match(case5WatText, /\(global \$~lib\/native\/ASC_FEATURE_RELAXED_SIMD i32 \(i32.const 0\)\)/, "inherited package enable should keep relaxed SIMD off");

  // Case 6: user config explicitly enabling simd should allow SIMD mode.
  const externalLeafOptIn = path.join(fixtureRoot, "external-leaf-optin.asconfig.json");
  await fs.writeFile(externalLeafOptIn, JSON.stringify({ extends: packageOwnedConfig, options: { enable: ["simd"] } }, null, 2));
  const case6Wat = path.join(fixtureRoot, "case6.wat");
  const case6 = runAscCli(
    [swarFlagsEntry, "--config", externalLeafOptIn, "--transform", transformPath, "--textFile", case6Wat, "--outFile", path.join(fixtureRoot, "case6.wasm")],
    fixtureRoot
  );
  assert.equal(case6.status, 0, `case6 compile failed:\n${case6.stderr}`);
  const case6WatText = await fs.readFile(case6Wat, "utf8");
  assert.match(case6WatText, /\(global \$~lib\/native\/ASC_FEATURE_SIMD i32 \(i32.const 1\)\)/, "explicit user enable should keep SIMD on");

  // Case 7: inherited package-owned simd enable is not explicit; v128-family usage still compiles via SWAR fallback wiring.
  const case7 = await runAscProgrammatic([entry, "--config", externalLeafNoOptIn, "--transform", transformPath, "--textFile", path.join(fixtureRoot, "case7.wat"), "--outFile", path.join(fixtureRoot, "case7.wasm")]);
  assert.equal(case7.status, 0, `case7 compile failed:\n${case7.stderr}`);
} finally {
  await fs.rm(packageOwnedConfig, { force: true });
  await fs.rm(fixtureRoot, { recursive: true, force: true });
}

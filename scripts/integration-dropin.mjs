import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ascCli = path.join(repoRoot, "node_modules", "assemblyscript", "bin", "asc.js");
const transformPath = path.join(repoRoot, "transform", "index.mjs");

function compileFixture(entry, nodeModulesPath, extraArgs = []) {
  const outDir = path.dirname(entry);
  const outFile = path.join(outDir, `${path.basename(entry, ".ts")}.wasm`);
  const args = [entry, "--config", "none", "--baseDir", repoRoot, "--path", nodeModulesPath, "--transform", transformPath, "--outFile", outFile, ...extraArgs];

  const result = spawnSync(process.execPath, [ascCli, ...args], {
    cwd: fixtureRootFor(entry),
    encoding: "utf8",
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function fixtureRootFor(entry) {
  return path.dirname(entry);
}

async function withFixtureDir(run) {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "as-simd-integration-"));
  const nodeModulesPath = path.join(fixtureRoot, "node_modules");
  const asSimdLink = path.join(nodeModulesPath, "as-simd");

  await fs.mkdir(nodeModulesPath, { recursive: true });
  await fs.symlink(repoRoot, asSimdLink, "dir");

  try {
    await run({ fixtureRoot, nodeModulesPath });
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
}

await withFixtureDir(async ({ fixtureRoot, nodeModulesPath }) => {
  const globalFull = path.join(fixtureRoot, "global-full.ts");
  await fs.writeFile(globalFull, ["export function runGlobalFull(a: v128, b: v128): v128 {", "  let x = i8x16.add(a, b);", "  x = i16x8.add(x, x);", "  x = i32x4.add(x, x);", "  return i64x2.add(x, x);", "}"].join("\n"));

  const strictGlobal = path.join(fixtureRoot, "global-strict-v128.ts");
  await fs.writeFile(strictGlobal, ["export function runStrictGlobal(a: v128, b: v128): v128 {", "  return i8x16.add(a, b);", "}"].join("\n"));

  const importFull = path.join(fixtureRoot, "import-full.ts");
  await fs.writeFile(importFull, ['import { i8x16 } from "as-simd";', "export function runImportFull(a: v128, b: v128): v128 {", "  return i8x16.add(a, b);", "}"].join("\n"));

  const importStrictNonV128 = path.join(fixtureRoot, "import-strict-non-v128.ts");
  await fs.writeFile(importStrictNonV128, ['import { i8x8 } from "as-simd";', "export function runImportStrictNonV128(a: u64, b: u64): u64 {", "  return i8x8.add(a, b);", "}"].join("\n"));

  const importStrictV128 = path.join(fixtureRoot, "import-strict-v128.ts");
  await fs.writeFile(importStrictV128, ['import { i8x16 } from "as-simd";', "export function runImportStrictV128(a: v128, b: v128): v128 {", "  return i8x16.add(a, b);", "}"].join("\n"));

  const globalFullResult = compileFixture(globalFull, nodeModulesPath, ["--enable", "simd"]);
  assert.equal(globalFullResult.status, 0, `global full preset fixture should compile: ${globalFullResult.stderr}`);

  const strictGlobalResult = compileFixture(strictGlobal, nodeModulesPath);
  assert.notEqual(strictGlobalResult.status, 0, "strict global fallback with v128 usage should fail");

  const importFullResult = compileFixture(importFull, nodeModulesPath, ["--enable", "simd"]);
  assert.equal(importFullResult.status, 0, `explicit import full fixture should compile: ${importFullResult.stderr}`);

  const importStrictNonV128Result = compileFixture(importStrictNonV128, nodeModulesPath);
  assert.equal(importStrictNonV128Result.status, 0, `explicit import strict non-v128 fixture should compile: ${importStrictNonV128Result.stderr}`);
  const importStrictV128Result = compileFixture(importStrictV128, nodeModulesPath);
  assert.notEqual(importStrictV128Result.status, 0, "explicit import strict v128 fallback should fail");
});

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as asc from "assemblyscript/dist/asc.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const transformPath = path.join(repoRoot, "transform", "index.mjs");

async function compileFixture(entry, nodeModulesPath, extraArgs = []) {
  const outDir = path.dirname(entry);
  const outFile = path.join(outDir, `${path.basename(entry, ".ts")}.wasm`);
  const args = [entry, "--baseDir", repoRoot, "--path", nodeModulesPath, "--transform", transformPath, "--outFile", outFile, ...extraArgs];

  const result = await asc.main(args);
  return {
    status: result.error ? 1 : 0,
    stdout: result.stdout?.toString() ?? "",
    stderr: result.stderr?.toString() ?? "",
  };
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

  const globalFullResult = await compileFixture(globalFull, nodeModulesPath, ["--enable", "simd"]);
  assert.equal(globalFullResult.status, 0, `global full preset fixture should compile: ${globalFullResult.stderr}`);

  const strictGlobalResult = await compileFixture(strictGlobal, nodeModulesPath, ["--disable", "simd"]);
  const strictGlobalOutput = `${strictGlobalResult.stdout}${strictGlobalResult.stderr}`;
  assert.notEqual(strictGlobalResult.status, 0, "strict global v128 fixture should fail");
  assert.match(strictGlobalOutput, /\[as-simd\/transform\] strict mode does not support/);

  const importFullResult = await compileFixture(importFull, nodeModulesPath, ["--enable", "simd"]);
  assert.equal(importFullResult.status, 0, `explicit import full fixture should compile: ${importFullResult.stderr}`);

  const importStrictNonV128Result = await compileFixture(importStrictNonV128, nodeModulesPath, ["--disable", "simd"]);
  assert.equal(importStrictNonV128Result.status, 0, `explicit import strict non-v128 fixture should compile: ${importStrictNonV128Result.stderr}`);
  const importStrictV128Result = await compileFixture(importStrictV128, nodeModulesPath, ["--disable", "simd"]);
  const importStrictV128Output = `${importStrictV128Result.stdout}${importStrictV128Result.stderr}`;
  assert.notEqual(importStrictV128Result.status, 0, "explicit import strict v128 fixture should fail");
  assert.match(importStrictV128Output, /\[as-simd\/transform\] strict mode does not support/);
});

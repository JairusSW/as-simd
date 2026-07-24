import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  computeImportBaseRel,
  computeVectorImportSpecifier,
  normalizeAsSimdBaseRel,
  vectorImportSpecifierFromBaseRel,
} from "../lib/imports.js";

assert.equal(normalizeAsSimdBaseRel("../../node_modules/as-simd"), "as-simd");
assert.equal(
  normalizeAsSimdBaseRel(
    "../../node_modules/.pnpm/as-simd@1.2.3/node_modules/as-simd",
  ),
  "as-simd",
);
assert.equal(
  normalizeAsSimdBaseRel("../../as-simd-extra"),
  "../../as-simd-extra",
);
assert.equal(normalizeAsSimdBaseRel("vendor\\as-simd"), "as-simd");
assert.equal(normalizeAsSimdBaseRel("vendor/pkg"), "./vendor/pkg");
assert.equal(normalizeAsSimdBaseRel(""), ".");
assert.equal(normalizeAsSimdBaseRel("."), ".");

const layoutCases = [
  ["flat npm", "/app/src", "/app/node_modules/as-simd", "as-simd"],
  [
    "pnpm realpath",
    "/app/src",
    "/app/node_modules/.pnpm/as-simd@1.2.3/node_modules/as-simd",
    "as-simd",
  ],
  [
    "workspace package",
    "/repo/packages/app/src",
    "/repo/node_modules/as-simd",
    "as-simd",
  ],
  [
    "nested install",
    "/repo/packages/app/src",
    "/repo/packages/app/node_modules/as-simd",
    "as-simd",
  ],
  [
    "in repository",
    "/repo/as-simd/transform/__tests__",
    "/repo/as-simd",
    "../..",
  ],
  ["linked sibling", "/repo/app/src", "/repo/as-simd", "as-simd"],
];

for (const [name, fromDir, packageDir, expected] of layoutCases) {
  assert.equal(
    computeImportBaseRel(fromDir, packageDir, path.posix),
    expected,
    name,
  );
}

const windowsCases = [
  [
    "flat npm on Windows",
    "C:\\app\\src",
    "C:\\app\\node_modules\\as-simd",
    "as-simd",
  ],
  [
    "pnpm on Windows",
    "C:\\app\\src",
    "C:\\app\\node_modules\\.pnpm\\as-simd@1.2.3\\node_modules\\as-simd",
    "as-simd",
  ],
  [
    "in repository on Windows",
    "C:\\repo\\as-simd\\transform\\__tests__",
    "C:\\repo\\as-simd",
    "../..",
  ],
  [
    "linked sibling on Windows",
    "C:\\repo\\app\\src",
    "C:\\repo\\as-simd",
    "as-simd",
  ],
];

for (const [name, fromDir, packageDir, expected] of windowsCases) {
  assert.equal(
    computeImportBaseRel(fromDir, packageDir, path.win32),
    expected,
    name,
  );
}

assert.equal(
  vectorImportSpecifierFromBaseRel("as-simd"),
  "as-simd/assembly/index",
);
assert.equal(vectorImportSpecifierFromBaseRel("../.."), "../../assembly/index");
assert.equal(vectorImportSpecifierFromBaseRel("."), "./assembly/index");

const packageDir = path.resolve(import.meta.dirname, "../..");
assert.equal(
  computeVectorImportSpecifier(
    "transform/__tests__/fixture.ts",
    packageDir,
    packageDir,
  ),
  "../../assembly/index",
);

// Exercise the bare installed-package branch through AssemblyScript's actual
// parser and resolver. A link mirrors npm link/workspace layouts while keeping
// the test independent of a registry and package manager.
const consumerDir = mkdtempSync(path.join(os.tmpdir(), "as-simd-import-"));
try {
  const modulesDir = path.join(consumerDir, "node_modules");
  mkdirSync(modulesDir);
  symlinkSync(
    packageDir,
    path.join(modulesDir, "as-simd"),
    process.platform === "win32" ? "junction" : "dir",
  );
  writeFileSync(
    path.join(consumerDir, "index.ts"),
    "export function twice(value: i32): i32 { const x: v64 = v64.splat<i32>(value); return v64.extract_lane<i32>(v64.add<i32>(x, x), 0); }\n",
  );
  execFileSync(
    path.join(
      packageDir,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "asc.cmd" : "asc",
    ),
    [
      "index.ts",
      "--config",
      "none",
      "--transform",
      path.join(packageDir, "transform"),
      "-o",
      "out.wasm",
    ],
    { cwd: consumerDir, stdio: "pipe" },
  );
} finally {
  rmSync(consumerDir, { recursive: true, force: true });
}

console.log("path-aware portable vector import tests passed");

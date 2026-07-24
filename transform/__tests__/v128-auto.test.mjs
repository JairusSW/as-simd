import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const output = "build/transform-tests";
const fixture = "transform/__tests__/v128-auto-fixture.ts";

function compile(name, simd) {
  const args = [
    fixture,
    "--config",
    "none",
    "-O0",
    "--noAssert",
    "--transform",
    "./transform",
    "--initialMemory",
    "1",
    "-o",
    `${output}/${name}.wasm`,
    "--textFile",
    `${output}/${name}.wat`,
  ];
  if (simd) args.push("--enable", "simd");
  execFileSync("node_modules/.bin/asc", args, { stdio: "inherit" });
}

function compileVectors(name, fixtureName, simd) {
  const args = [
    `transform/__tests__/${fixtureName}`,
    "--config",
    "none",
    "-O0",
    "--noAssert",
    "--transform",
    "./transform",
    "--initialMemory",
    "1",
    "-o",
    `${output}/${name}.wasm`,
    "--textFile",
    `${output}/${name}.wat`,
  ];
  if (simd) args.push("--enable", "simd");
  execFileSync("node_modules/.bin/asc", args, { stdio: "inherit" });
}

compile("v128-fallback", false);
compile("v128-native", true);

const fallbackWat = readFileSync(`${output}/v128-fallback.wat`, "utf8");
const nativeWat = readFileSync(`${output}/v128-native.wat`, "utf8");
assert.doesNotMatch(fallbackWat, /v128\.|i8x16\.|i32x4\./);
assert.match(nativeWat, /i8x16\.|i32x4\./);

const imports = {
  env: {
    abort() {
      throw new Error("fallback aborted");
    },
  },
};
const fallback = (
  await WebAssembly.instantiate(
    readFileSync(`${output}/v128-fallback.wasm`),
    imports,
  )
).instance;
const native = (
  await WebAssembly.instantiate(
    readFileSync(`${output}/v128-native.wasm`),
    imports,
  )
).instance;

for (let a = -128; a < 128; a += 7) {
  for (let b = -128; b < 128; b += 11) {
    assert.equal(
      fallback.exports.autoV128(a, b),
      native.exports.autoV128(a, b),
    );
  }
}

for (let i = 0; i < 1_000; i++) {
  const values = new Uint32Array(native.exports.memory.buffer, 0, 4);
  values.set([i, i * 3, i * 5, i * 7]);
  new Uint32Array(fallback.exports.memory.buffer, 0, 4).set(values);
  assert.equal(
    fallback.exports.autoV128Memory(0, i | 0, (i * 13) | 0),
    native.exports.autoV128Memory(0, i | 0, (i * 13) | 0),
  );
  assert.deepEqual(
    [...new Uint32Array(fallback.exports.memory.buffer, 0, 4)],
    [...new Uint32Array(native.exports.memory.buffer, 0, 4)],
  );
}

console.log("automatic native-v128/SWAR fallback parity tests passed");

compileVectors("vectors-auto-swar", "vectors-auto-fixture.ts", false);
compileVectors("vectors-auto-simd", "vectors-auto-fixture.ts", true);
compileVectors("vectors-import-swar", "vectors-import-fixture.ts", false);
compileVectors("vectors-import-simd", "vectors-import-fixture.ts", true);

const vectorModules = {};
for (const name of [
  "vectors-auto-swar",
  "vectors-auto-simd",
  "vectors-import-swar",
  "vectors-import-simd",
]) {
  vectorModules[name] = (
    await WebAssembly.instantiate(
      readFileSync(`${output}/${name}.wasm`),
      imports,
    )
  ).instance.exports;
}
assert.doesNotMatch(
  readFileSync(`${output}/vectors-auto-swar.wat`, "utf8"),
  /v128\.|i32x4\./,
);
assert.match(
  readFileSync(`${output}/vectors-auto-simd.wat`, "utf8"),
  /i32x4\./,
);
function functionBody(wat, name) {
  const start = wat.indexOf(
    `(func $transform/__tests__/vectors-auto-fixture/${name} `,
  );
  assert.notEqual(start, -1, `${name} body not found`);
  const next = wat.indexOf("\n (func $", start + 1);
  return wat.slice(start, next < 0 ? wat.length : next);
}
for (const mode of ["swar", "simd"]) {
  const wat = readFileSync(`${output}/vectors-auto-${mode}.wat`, "utf8");
  const allocations = (name) =>
    (functionBody(wat, name).match(/call \$~lib\/rt\/itcms\/__new/g) ?? [])
      .length;
  assert.equal(
    allocations("v256Checksum"),
    5,
    `dedicated v256 ${mode} value chain regressed`,
  );
  assert.equal(
    allocations("v512Checksum"),
    5,
    `dedicated v512 ${mode} value chain regressed`,
  );
  assert.equal(allocations("legacyV256Checksum"), 12);
  assert.equal(allocations("legacyV512Checksum"), 16);
}
for (let a = -100; a <= 100; a += 9) {
  for (let b = -100; b <= 100; b += 13) {
    const expected = vectorModules["vectors-auto-swar"].vectorChecksum(a, b);
    for (const exports of Object.values(vectorModules)) {
      assert.equal(exports.vectorChecksum(a, b), expected);
      assert.equal(exports.laneNamespaceChecksum(a, b), 2n * BigInt(a));
      if (exports.v256Checksum) assert.equal(exports.v256Checksum(a, b), a);
      if (exports.v512Checksum) assert.equal(exports.v512Checksum(a, b), a);
    }
  }
}
console.log(
  "explicit and auto-injected generic/lane vector namespace parity tests passed",
);

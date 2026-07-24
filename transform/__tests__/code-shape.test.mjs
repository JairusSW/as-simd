import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdirSync } from "node:fs";

const output = "build/transform-tests";
mkdirSync(output, { recursive: true });

function compile(name, enabled) {
  const env = { ...process.env, AS_SIMD_OPTIMIZE: enabled ? "1" : "0" };
  execFileSync(
    "node_modules/.bin/asc",
    [
      "transform/__tests__/fixture.ts",
      "--config",
      "none",
      "-O0",
      "--noAssert",
      "--transform",
      "./transform",
      "-o",
      `${output}/${name}.wasm`,
      "--textFile",
      `${output}/${name}.wat`,
    ],
    { env, stdio: "inherit" },
  );
}

compile("optimized", true);
compile("plain", false);

const wat = readFileSync(`${output}/optimized.wat`, "utf8");
function functionBody(name) {
  return (
    wat.match(
      new RegExp(`\\(func \\$[^\\s()]*${name}(?=\\s)[\\s\\S]*?\\n \\)`),
    )?.[0] ?? ""
  );
}

assert.match(wat, /i64\.const -256\s+i64\.and/);
assert.match(wat, /i64\.const 4294967295\s+i64\.and/);
assert.match(wat, /i32\.const -32\s+i32\.and/);
const indirectBody = functionBody("indirectBitselect");
assert.ok(indirectBody, "indirectBitselect body not found");
assert.match(indirectBody, /call_indirect/);
assert.equal(
  (indirectBody.match(/i64\.and/g) ?? []).length,
  1,
  "call_indirect operand did not fuse bitselect",
);
assert.doesNotMatch(wat, /i64\.shr_u[\s\S]{0,40}i64\.shl/);
const eqBody = functionBody("eqBitmask8");
assert.ok(eqBody, "eqBitmask8 body not found");
assert.doesNotMatch(eqBody, /i64\.const 255/);
assert.doesNotMatch(functionBody("addDisjointMasks"), /i64\.add/);
assert.match(functionBody("addOverlappingMasks"), /i64\.add/);
assert.equal(
  (functionBody("xorOverlappingMasks").match(/i64\.and/g) ?? []).length,
  1,
);
assert.doesNotMatch(functionBody("xorOverlappingMasks"), /i64\.xor/);
assert.equal(
  (functionBody("factorAndMask").match(/i64\.and/g) ?? []).length,
  1,
);
assert.equal((functionBody("factorOrMask").match(/i64\.or/g) ?? []).length, 0);
assert.equal(
  (functionBody("mismatchedMasks").match(/i64\.and/g) ?? []).length,
  2,
);
for (const name of [
  "anyEq8",
  "anyNe8",
  "allEq8",
  "allNe8",
  "anyEq16",
  "anyNe16",
  "allEq16",
  "allNe16",
  "anyEq32",
  "anyNe32",
  "allEq32",
  "allNe32",
]) {
  const body = functionBody(name);
  assert.ok(body, `${name} body not found`);
  assert.doesNotMatch(
    body,
    /i64\.mul/,
    `${name} still expands a compact lane mask`,
  );
}
for (const name of [
  "anyEq8",
  "allNe8",
  "anyEq16",
  "allNe16",
  "anyEq32",
  "allNe32",
]) {
  const body = functionBody(name);
  assert.match(
    body,
    /i64\.sub/,
    `${name} does not use the reduced has-zero predicate`,
  );
  assert.doesNotMatch(
    body,
    /i64\.add/,
    `${name} still builds an exact nonzero-lane mask`,
  );
  assert.doesNotMatch(
    body,
    /i64\.or/,
    `${name} still builds an exact nonzero-lane mask`,
  );
}

const imports = {
  env: {
    abort() {
      throw new Error("unexpected abort");
    },
  },
};
const optimized = await WebAssembly.instantiate(
  readFileSync(`${output}/optimized.wasm`),
  imports,
);
const plain = await WebAssembly.instantiate(
  readFileSync(`${output}/plain.wasm`),
  imports,
);
const a = optimized.instance.exports;
const b = plain.instance.exports;

let state = 1n;
function next64() {
  state = BigInt.asUintN(
    64,
    state * 6364136223846793005n + 1442695040888963407n,
  );
  return BigInt.asIntN(64, state);
}

for (let i = 0; i < 100_000; i++) {
  const x = next64();
  const y = next64();
  const mask = next64();
  assert.equal(a.bitselect(x, y, mask), b.bitselect(x, y, mask));
  assert.equal(a.repack(x), b.repack(x));
  assert.equal(a.mergeMasks(x), b.mergeMasks(x));
  assert.equal(a.addDisjointMasks(x), b.addDisjointMasks(x));
  assert.equal(a.addOverlappingMasks(x), b.addOverlappingMasks(x));
  assert.equal(a.xorOverlappingMasks(x), b.xorOverlappingMasks(x));
  assert.equal(a.factorAndMask(x, y), b.factorAndMask(x, y));
  assert.equal(a.factorOrMask(x, y), b.factorOrMask(x, y));
  assert.equal(a.mismatchedMasks(x, y), b.mismatchedMasks(x, y));
  assert.equal(a.eqBitmask8(x, y), b.eqBitmask8(x, y));
  assert.equal(a.neBitmask8(x, y), b.neBitmask8(x, y));
  assert.equal(a.anyEq8(x, y), b.anyEq8(x, y));
  assert.equal(a.anyNe8(x, y), b.anyNe8(x, y));
  assert.equal(a.allEq8(x, y), b.allEq8(x, y));
  assert.equal(a.allNe8(x, y), b.allNe8(x, y));
  assert.equal(a.anyEq16(x, y), b.anyEq16(x, y));
  assert.equal(a.anyNe16(x, y), b.anyNe16(x, y));
  assert.equal(a.allEq16(x, y), b.allEq16(x, y));
  assert.equal(a.allNe16(x, y), b.allNe16(x, y));
  assert.equal(a.anyEq32(x, y), b.anyEq32(x, y));
  assert.equal(a.anyNe32(x, y), b.anyNe32(x, y));
  assert.equal(a.allEq32(x, y), b.allEq32(x, y));
  assert.equal(a.allNe32(x, y), b.allNe32(x, y));

  const x32 = Number(BigInt.asUintN(32, x));
  const y32 = Number(BigInt.asUintN(32, y));
  const mask32 = Number(BigInt.asUintN(32, mask));
  assert.equal(
    a.bitselect32(x32, y32, mask32),
    b.bitselect32(x32, y32, mask32),
  );
  assert.equal(a.repack32(x32), b.repack32(x32));
  assert.equal(a.mergeMasks32(x32), b.mergeMasks32(x32));
}

assert.equal(a.anyEqLoop(10_000, 1n, 2n), b.anyEqLoop(10_000, 1n, 2n));
assert.equal(a.anyEq16Loop(10_000, 1n, 2n), b.anyEq16Loop(10_000, 1n, 2n));
assert.equal(a.anyEq32Loop(10_000, 1n, 2n), b.anyEq32Loop(10_000, 1n, 2n));
assert.equal(a.allNe8Loop(10_000, 1n, 2n), b.allNe8Loop(10_000, 1n, 2n));
assert.equal(a.allNe16Loop(10_000, 1n, 2n), b.allNe16Loop(10_000, 1n, 2n));
assert.equal(a.allNe32Loop(10_000, 1n, 2n), b.allNe32Loop(10_000, 1n, 2n));
assert.equal(a.allEqLoop(10_000, 1n, 2n), b.allEqLoop(10_000, 1n, 2n));

console.log("SWAR transform code-shape and 100,000-case parity tests passed");

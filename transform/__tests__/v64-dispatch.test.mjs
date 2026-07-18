import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const output = "build/transform-tests";
const fixture = "transform/__tests__/v64-dispatch-fixture.ts";
mkdirSync(output, { recursive: true });
execFileSync("node_modules/.bin/asc", [fixture, "--runtime", "stub", "-O3", "--converge", "--enable", "simd", "--textFile", `${output}/v64-dispatch.wat`, "-o", `${output}/v64-dispatch.wasm`], { stdio: "inherit" });
const wat = readFileSync(`${output}/v64-dispatch.wat`, "utf8");

function body(name) {
  const start = wat.indexOf(`(func $transform/__tests__/v64-dispatch-fixture/${name} `);
  assert.notEqual(start, -1, `${name} body not found`);
  const next = wat.indexOf("\n (func $", start + 1);
  return wat.slice(start, next < 0 ? wat.length : next);
}

const vectorOpcode = /(?:v128|i8x16|i16x8|i32x4|i64x2)\./;
for (const name of ["i8Min", "i8AddSat", "i8Shift", "i8Shuffle", "i8Laneselect", "i16Min", "i16LtU", "i32Mul", "i32Min", "i32Dot", "i32Abs", "i32LtU"]) {
  assert.doesNotMatch(body(name), vectorOpcode, `${name} reintroduced a scalar/SIMD crossing`);
}
assert.match(body("i8Mul"), /i16x8\.extmul_low_i8x16_u/);
assert.match(body("i8Swizzle"), /i8x16\.swizzle/);
assert.match(body("i16Abs"), /i16x8\.abs/);
assert.match(body("i32Neg"), /i32x4\.neg/);
assert.match(body("i32Max"), /i32x4\.max_s/);

console.log("measured v64 scalar/SIMD dispatch code-shape tests passed");

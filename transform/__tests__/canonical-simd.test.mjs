import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const output = "build/transform-tests";
const fixture = "transform/__tests__/canonical-simd-fixture.ts";
mkdirSync(output, { recursive: true });

function compile(name, simd) {
  const args = [
    fixture,
    "--config",
    "none",
    "--runtime",
    "stub",
    "-O3",
    "--converge",
    "--textFile",
    `${output}/${name}.wat`,
    "-o",
    `${output}/${name}.wasm`,
  ];
  if (simd) args.push("--enable", "simd");
  execFileSync("node_modules/.bin/asc", args, { stdio: "inherit" });
  return readFileSync(`${output}/${name}.wat`, "utf8");
}

function body(wat, name) {
  const start = wat.indexOf(
    `(func $transform/__tests__/canonical-simd-fixture/${name} `,
  );
  assert.notEqual(start, -1, `${name} body not found`);
  const next = wat.indexOf("\n (func $", start + 1);
  return wat.slice(start, next < 0 ? wat.length : next);
}

const swar = compile("canonical-swar", false);
const simd = compile("canonical-simd", true);
const vectorOpcode = /(?:v128|i8x16|i16x8|i32x4|i64x2)\./;

assert.doesNotMatch(
  swar,
  vectorOpcode,
  "canonical SWAR modules emitted SIMD instructions",
);

const nativeInstructions = new Map([
  ["v32ValueMulI8", /i16x8\.extmul_low_i8x16_u/],
  ["v32KernelAbsI16", /i16x8\.abs/],
  ["v64ValueMulI8", /i16x8\.extmul_low_i8x16_u/],
  ["v64KernelAbsI16", /i16x8\.abs/],
  ["v128ValueMulI8", /i8x16\.shuffle/],
  ["v128KernelMulI8", /i8x16\.shuffle/],
]);

for (const [name, instruction] of nativeInstructions) {
  assert.match(
    body(simd, name),
    instruction,
    `${name} did not emit its native v128 kernel`,
  );
}

console.log("canonical v32/v64/v128 SIMD dispatch code-shape tests passed");

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const output = "build/transform-tests";
mkdirSync(output, { recursive: true });

for (const suite of ["i8x16", "i16x8", "i32x4", "i64x2", "v128"]) {
  const wasm = `${output}/${suite}-strict-swar.wasm`;
  const wat = `${output}/${suite}-strict-swar.wat`;
  execFileSync(
    "node_modules/.bin/asc",
    [
      `assembly/__benches__/${suite}-swar.bench.ts`,
      "--runtime",
      "stub",
      "--transform",
      "./transform",
      "-O3",
      "--converge",
      "--noAssert",
      "--use",
      "BENCH_SAMPLES=1",
      "--use",
      "AS_BENCH_RUNTIME_V8=1",
      "--use",
      "AS_BENCH_FORCE_SWAR=1",
      "--enable",
      "bulk-memory",
      "--enable",
      "sign-extension",
      "--exportStart",
      "start",
      "-o",
      wasm,
      "--textFile",
      wat,
    ],
    { stdio: "inherit" },
  );
  const text = readFileSync(wat, "utf8");
  assert.doesNotMatch(
    text,
    /(^|[\s(])(?:v128\.|i8x16\.|i16x8\.|i32x4\.|i64x2\.|f32x4\.|f64x2\.)/m,
    `${suite} SWAR benchmark contains a SIMD opcode`,
  );
  assert.doesNotMatch(
    text,
    /[\s(]v128[\s)]/,
    `${suite} SWAR benchmark contains a v128 type`,
  );
}

console.log("strict SWAR benchmark code-shape tests passed");

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const output = "build/transform-tests";
mkdirSync(output, { recursive: true });

function compile(mode) {
  const args = ["bench/wide/bench.ts", "--runtime", "stub", "--transform", "./transform", "-O3", "--converge", "-o", `${output}/wide-${mode}.wasm`, "--textFile", `${output}/wide-${mode}.wat`];
  if (mode === "simd" || mode === "native" || mode === "relaxed") args.push("--enable", "simd");
  if (mode === "relaxed") args.push("--enable", "relaxed-simd");
  const env = { ...process.env };
  delete env.WAGO_PLUGINS;
  if (mode === "native") env.WAGO_PLUGINS = "wide";
  execFileSync("node_modules/.bin/asc", args, { env, stdio: "inherit" });
  return readFileSync(`${output}/wide-${mode}.wat`, "utf8");
}

function body(wat, name) {
  const start = wat.indexOf(`(func $bench/wide/bench/${name} `);
  assert.notEqual(start, -1, `${name} body not found`);
  const next = wat.indexOf("\n (func $", start + 1);
  return wat.slice(start, next < 0 ? wat.length : next);
}

const swar = compile("swar");
const simd = compile("simd");
const relaxed = compile("relaxed");
const native = compile("native");
assert.doesNotMatch(simd, /\(import "as-simd" "(?:v256|v512)\./, "ordinary SIMD builds must not require Wide");
assert.match(body(native, "v256AddI8"), /call \$__as_simd_instruction_v256_fd_110/);
assert.match(native, /\(import "as-simd" "i8x32\.add"/);
assert.match(native, /\(import "as-simd" "v256\.load" \(func \$[^ ]+ \(param i32\) \(result externref\)\)\)/);
assert.match(native, /\(import "as-simd" "i8x32\.add" \(func \$[^ ]+ \(param externref externref\) \(result externref\)\)\)/);
assert.match(native, /\(import "as-simd" "v256\.store" \(func \$[^ ]+ \(param externref i32\)\)\)/);
assert.match(body(native, "v256AddI8"), /call \$__as_simd_instruction_v256_load[\s\S]*call \$__as_simd_instruction_v256_fd_110[\s\S]*call \$__as_simd_instruction_v256_store/);
assert.match(body(native, "v512AddI8"), /call \$__as_simd_instruction_v512_fd_110/);
assert.match(native, /\(import "as-simd" "i8x64\.add"/);
assert.doesNotMatch(native, /\(import "as-simd" "[^"]+\.memory"/);
assert.doesNotMatch(body(native, "v512AddI8"), /call \$__as_simd_instruction_v256_fd_110/);
assert.match(body(native, "v512NegI32"), /call \$__as_simd_instruction_v512_fd_161/);
assert.match(native, /\(import "as-simd" "i32x16\.neg"/);
assert.doesNotMatch(native, /\(import "[^"]*" "v(?:256|512)\.fd\./);
const nativeModule = new WebAssembly.Module(readFileSync(`${output}/wide-native.wasm`));
assert.equal(WebAssembly.Module.customSections(nativeModule, "metadata.code.wago.intrinsics").length, 0);
for (const wat of [swar, simd, relaxed]) {
  assert.doesNotMatch(wat, /\$assembly\/(?:wide|v128)\/regfile\/(?:w?rf)\._base/, "fixed register files must not reintroduce lazy base globals");
}
assert.match(body(relaxed, "v128RelaxedSwizzle"), /i8x16\.relaxed_swizzle/);
assert.match(body(relaxed, "v128RelaxedMaddF32"), /f32x4\.relaxed_madd/);
assert.match(body(relaxed, "v128RelaxedLaneselectI8"), /i8x16\.laneselect/);
assert.match(body(relaxed, "v128RelaxedMinF32"), /f32x4\.relaxed_min/);
assert.match(body(relaxed, "v128RelaxedQ15"), /i16x8\.relaxed_q15mulr_s/);
assert.match(body(relaxed, "v128RelaxedDot"), /i16x8\.dot_i8x16_i7x16_s/);
assert.match(body(relaxed, "v128RelaxedDotAdd"), /i32x4\.dot_i8x16_i7x16_add_s/);
for (const name of ["v256AddI8", "v256MinI8", "v256Bitselect", "v256And", "v256Or", "v256Xor", "v256Not", "v256MulI8", "v256MulI64", "v256AddI64", "v256SubI64", "v256MinI32", "v256MinI64", "v256LtI32", "v256LtI64", "v256LtU64", "v256EqI64", "v256NegI64", "v256AbsI64", "v256ShlI64", "v256ShrI64", "v256NegI32", "v256AbsI32", "v256ShlI32", "v256ShrI32", "v256NegI8", "v256AbsI8", "v256ShlI8", "v256ShrI8", "v256NegI16", "v256AbsI16", "v256ShlI16", "v256ShrI16", "v256Load", "v256Store", "v256ReplaceLane"]) {
  assert.equal((body(swar, name).match(/\n  loop /g) ?? []).length, 2, `${name} SWAR kernel was not fully unrolled`);
  assert.equal((body(simd, name).match(/\n  loop /g) ?? []).length, 2, `${name} SIMD kernel was not fully unrolled`);
}
assert.equal((body(simd, "v256AddI8").match(/i8x16\.add/g) ?? []).length, 2);
assert.equal((body(simd, "v256MinI8").match(/i8x16\.min_s/g) ?? []).length, 2);
assert.equal((body(simd, "v256Bitselect").match(/i64\.and/g) ?? []).length, 4);
assert.doesNotMatch(body(simd, "v256Bitselect"), /v128\.bitselect/);
for (const name of ["v256And", "v256Or", "v256Xor", "v256Not"]) {
  assert.doesNotMatch(body(simd, name), /v128\.(?:and|or|xor|not)/, `${name} must retain the measured scalar-word path`);
}
assert.equal((body(simd, "v256MulI8").match(/i16x8\.extmul_low_i8x16_u/g) ?? []).length, 2);
assert.equal((body(simd, "v256MulI8").match(/i16x8\.extmul_high_i8x16_u/g) ?? []).length, 2);
assert.equal((body(simd, "v256MulI8").match(/i8x16\.shuffle/g) ?? []).length, 2);
assert.doesNotMatch(body(simd, "v256MulI64"), /i64x2\.mul/);
assert.doesNotMatch(body(simd, "v256AddI64"), /i64x2\.add/);
assert.doesNotMatch(body(simd, "v256SubI64"), /i64x2\.sub/);
assert.doesNotMatch(body(simd, "v256MinI32"), /i32x4\.min/);
assert.doesNotMatch(body(simd, "v256MinI64"), /i64x2\.min/);
assert.equal((body(simd, "v256LtI32").match(/i32x4\.lt_s/g) ?? []).length, 2);
assert.doesNotMatch(body(simd, "v256LtI64"), /i64x2\.lt_s/);
assert.doesNotMatch(body(simd, "v256LtU64"), /i64x2\./);
assert.doesNotMatch(body(simd, "v256EqI64"), /i64x2\.eq/);
for (const [name, opcode] of [["v256NegI64", /i64x2\.neg/], ["v256AbsI64", /i64x2\.abs/], ["v256ShlI64", /i64x2\.shl/], ["v256ShrI64", /i64x2\.shr_s/]]) {
  assert.doesNotMatch(body(simd, name), opcode, `${name} must retain the measured scalar path`);
}
assert.equal((body(simd, "v256SplatI64").match(/i64x2\.splat/g) ?? []).length, 1);
assert.equal((body(simd, "v256SplatI64").match(/v128\.store/g) ?? []).length, 2);
assert.equal((body(simd, "v256SplatI64").match(/\n  loop /g) ?? []).length, 1);
assert.doesNotMatch(body(simd, "v256NegI32"), /i32x4\.neg/);
assert.equal((body(simd, "v256AbsI32").match(/i32x4\.abs/g) ?? []).length, 2);
assert.doesNotMatch(body(simd, "v256ShlI32"), /i32x4\.shl/);
assert.doesNotMatch(body(simd, "v256ShrI32"), /i32x4\.shr_s/);
for (const [name, opcode] of [["v256NegI8", /i8x16\.neg/], ["v256ShlI8", /i8x16\.shl/], ["v256ShrI8", /i8x16\.shr_s/], ["v256NegI16", /i16x8\.neg/], ["v256ShlI16", /i16x8\.shl/]]) {
  assert.doesNotMatch(body(simd, name), opcode, `${name} must retain the measured scalar path`);
}
assert.equal((body(simd, "v256AbsI8").match(/i8x16\.abs/g) ?? []).length, 2);
assert.equal((body(simd, "v256AbsI16").match(/i16x8\.abs/g) ?? []).length, 2);
assert.equal((body(simd, "v256ShrI16").match(/i16x8\.shr_s/g) ?? []).length, 2);
assert.doesNotMatch(body(simd, "v256AvgrU8"), /i8x16\.avgr_u/);
assert.doesNotMatch(body(simd, "v256AvgrU16"), /i16x8\.avgr_u/);
for (const name of ["v256Load", "v256Store"]) {
  assert.equal((body(simd, name).match(/v128\.load/g) ?? []).length, 2);
  assert.equal((body(simd, name).match(/v128\.store/g) ?? []).length, 2);
  assert.doesNotMatch(body(swar, name), /memory\.copy/);
}
assert.equal((body(simd, "v256ReplaceLane").match(/v128\.load/g) ?? []).length, 2);
assert.equal((body(simd, "v256ReplaceLane").match(/v128\.store/g) ?? []).length, 2);
assert.doesNotMatch(body(swar, "v256ReplaceLane"), /memory\.copy/);
for (const mode of [swar, simd]) {
  const lane = body(mode, "v256ExtractLane");
  assert.equal((lane.match(/i64\.load16_u/g) ?? []).length, 1);
  assert.doesNotMatch(lane, /v128\.(?:load|store)|i64\.(?:shr|shl)/, "v256 lane extraction must remain one direct scalar load");
}
for (const name of ["v512AddI8", "v512MinI8", "v512Xor", "v512And", "v512Or", "v512Not", "v512Bitselect", "v512AnyTrue", "v512ShlI16", "v512LtI16", "v512AddSatI16", "v512MulI8", "v512MulI16", "v512MulI64", "v512AddI64", "v512SubI64", "v512MinI32", "v512MinI64", "v512LtI32", "v512LtI64", "v512LtU64", "v512EqI64", "v512NegI64", "v512AbsI64", "v512ShlI64", "v512NegI32", "v512AbsI32", "v512ShlI32", "v512Load", "v512Store", "v512ReplaceLane"]) {
  // One setup loop and one benchmark loop; the former generic 4-chunk kernel
  // must not reintroduce an inner runtime loop.
  assert.equal((body(swar, name).match(/\n  loop /g) ?? []).length, 2, `${name} SWAR kernel was not fully unrolled`);
  assert.equal((body(simd, name).match(/\n  loop /g) ?? []).length, 2, `${name} SIMD kernel was not fully unrolled`);
}
assert.equal((body(simd, "v512AddI8").match(/i8x16\.add/g) ?? []).length, 4);
assert.equal((body(simd, "v512MinI8").match(/i8x16\.min_s/g) ?? []).length, 4);
assert.equal((body(swar, "v512Xor").match(/i64\.xor/g) ?? []).length, 11);
assert.equal((body(swar, "v512Bitselect").match(/i64\.xor/g) ?? []).length, 19);
assert.equal((body(simd, "v512Xor").match(/i64\.xor/g) ?? []).length, 11);
for (const name of ["v512Xor", "v512And", "v512Or", "v512Not"]) {
  assert.doesNotMatch(body(simd, name), /v128\.(?:and|or|xor|not)/, `${name} must retain the measured scalar-word path`);
}
assert.equal((body(simd, "v512Bitselect").match(/v128\.bitselect/g) ?? []).length, 4);
assert.equal((body(simd, "v512AnyTrue").match(/i64\.or/g) ?? []).length, 6);
assert.equal((body(simd, "v256AnyTrue").match(/i64\.or/g) ?? []).length, 3);
assert.doesNotMatch(body(simd, "v512AnyTrue"), /v128\.any_true/);
assert.doesNotMatch(body(simd, "v256AnyTrue"), /v128\.any_true/);
assert.equal((body(simd, "v256AllTrueI8").match(/i8x16\.all_true/g) ?? []).length, 2);
assert.equal((body(simd, "v256AllTrueI32").match(/i32x4\.all_true/g) ?? []).length, 2);
assert.doesNotMatch(body(simd, "v256AllTrueI64"), /i64x2\.all_true/);
assert.equal((body(simd, "v512AllTrueI8").match(/i8x16\.all_true/g) ?? []).length, 4);
assert.equal((body(simd, "v512AllTrueI32").match(/i32x4\.all_true/g) ?? []).length, 4);
assert.equal((body(simd, "v512AllTrueI64").match(/i64x2\.all_true/g) ?? []).length, 4);
assert.equal((body(simd, "v256BitmaskI8").match(/i8x16\.bitmask/g) ?? []).length, 2);
assert.equal((body(simd, "v256BitmaskI32").match(/i32x4\.bitmask/g) ?? []).length, 2);
assert.equal((body(simd, "v256BitmaskI64").match(/i64x2\.bitmask/g) ?? []).length, 2);
assert.equal((body(simd, "v512BitmaskI8").match(/i8x16\.bitmask/g) ?? []).length, 4);
assert.equal((body(simd, "v512BitmaskI32").match(/i32x4\.bitmask/g) ?? []).length, 4);
assert.equal((body(simd, "v512BitmaskI64").match(/i64x2\.bitmask/g) ?? []).length, 4);
assert.equal((body(simd, "v512ShlI16").match(/i16x8\.shl/g) ?? []).length, 4);
assert.equal((body(simd, "v512LtI16").match(/i16x8\.lt_s/g) ?? []).length, 4);
assert.equal((body(simd, "v512AddSatI16").match(/i16x8\.add_sat_s/g) ?? []).length, 4);
assert.equal((body(simd, "v512SubSatI16").match(/i16x8\.sub_sat_s/g) ?? []).length, 4);
assert.equal((body(simd, "v512AvgrU8").match(/i8x16\.avgr_u/g) ?? []).length, 4);
assert.equal((body(simd, "v512AvgrU16").match(/i16x8\.avgr_u/g) ?? []).length, 4);
assert.equal((body(simd, "v512MulI8").match(/i16x8\.extmul_low_i8x16_u/g) ?? []).length, 4);
assert.equal((body(simd, "v512MulI8").match(/i16x8\.extmul_high_i8x16_u/g) ?? []).length, 4);
assert.equal((body(simd, "v512MulI8").match(/i8x16\.shuffle/g) ?? []).length, 4);
assert.equal((body(simd, "v512MulI16").match(/i16x8\.mul/g) ?? []).length, 4);
assert.equal((body(simd, "v512MulI64").match(/i64x2\.mul/g) ?? []).length, 0);
assert.equal((body(simd, "v512AddI64").match(/i64x2\.add/g) ?? []).length, 4);
assert.equal((body(simd, "v512SubI64").match(/i64x2\.sub/g) ?? []).length, 4);
assert.doesNotMatch(body(simd, "v512MinI32"), /i32x4\.min/);
assert.doesNotMatch(body(simd, "v512MinI64"), /i64x2\.min/);
assert.equal((body(simd, "v512LtI32").match(/i32x4\.lt_s/g) ?? []).length, 4);
assert.equal((body(simd, "v512LtI64").match(/i64x2\.lt_s/g) ?? []).length, 4);
assert.doesNotMatch(body(simd, "v512LtU64"), /i64x2\.(?:lt|le)/);
assert.equal((body(simd, "v512EqI64").match(/i64x2\.eq/g) ?? []).length, 4);
assert.equal((body(simd, "v512NegI64").match(/i64x2\.neg/g) ?? []).length, 4);
assert.equal((body(simd, "v512AbsI64").match(/i64x2\.abs/g) ?? []).length, 4);
assert.equal((body(simd, "v512ShlI64").match(/i64x2\.shl/g) ?? []).length, 4);
assert.equal((body(simd, "v512ShrI64").match(/i64x2\.shr_s/g) ?? []).length, 4);
assert.equal((body(simd, "v512SplatI64").match(/i64x2\.splat/g) ?? []).length, 1);
assert.equal((body(simd, "v512SplatI64").match(/v128\.store/g) ?? []).length, 4);
assert.equal((body(simd, "v512SplatI64").match(/\n  loop /g) ?? []).length, 1);
assert.equal((body(simd, "v512NegI32").match(/i32x4\.neg/g) ?? []).length, 4);
assert.equal((body(simd, "v512AbsI32").match(/i32x4\.abs/g) ?? []).length, 4);
assert.equal((body(simd, "v512ShlI32").match(/i32x4\.shl/g) ?? []).length, 4);
assert.equal((body(simd, "v512ShrI32").match(/i32x4\.shr_s/g) ?? []).length, 4);
for (const name of ["v512Load", "v512Store"]) {
  assert.equal((body(simd, name).match(/v128\.load/g) ?? []).length, 4);
  assert.equal((body(simd, name).match(/v128\.store/g) ?? []).length, 4);
  assert.doesNotMatch(body(swar, name), /memory\.copy/);
}
assert.equal((body(simd, "v512ReplaceLane").match(/v128\.load/g) ?? []).length, 4);
assert.equal((body(simd, "v512ReplaceLane").match(/v128\.store/g) ?? []).length, 4);
assert.doesNotMatch(body(swar, "v512ReplaceLane"), /memory\.copy/);
for (const mode of [swar, simd]) {
  const lane = body(mode, "v512ExtractLane");
  assert.equal((lane.match(/i64\.load16_u/g) ?? []).length, 1);
  assert.doesNotMatch(lane, /v128\.(?:load|store)|i64\.(?:shr|shl)/, "v512 lane extraction must remain one direct scalar load");
}
assert.equal((body(simd, "v128MulI8").match(/i16x8\.extmul_low_i8x16_u/g) ?? []).length, 1);
assert.equal((body(simd, "v128MulI8").match(/i16x8\.extmul_high_i8x16_u/g) ?? []).length, 1);
assert.equal((body(simd, "v128MulI8").match(/i8x16\.shuffle/g) ?? []).length, 1);
assert.equal((body(simd, "v128MulI16").match(/i16x8\.mul/g) ?? []).length, 1);
assert.equal((body(simd, "v128MulI32").match(/i32x4\.mul/g) ?? []).length, 0);
assert.equal((body(simd, "v128MulI64").match(/i64x2\.mul/g) ?? []).length, 0);
assert.equal((body(simd, "v128AddSatI8").match(/i8x16\.add_sat_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128AddSatI16").match(/i16x8\.add_sat_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128SubSatI8").match(/i8x16\.sub_sat_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128SubSatI16").match(/i16x8\.sub_sat_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128AvgrU8").match(/i8x16\.avgr_u/g) ?? []).length, 0);
assert.equal((body(simd, "v128AvgrU16").match(/i16x8\.avgr_u/g) ?? []).length, 0);
assert.equal((body(simd, "v128PopcntI8").match(/i8x16\.popcnt/g) ?? []).length, 0);
assert.equal((body(simd, "v128DotI16").match(/i32x4\.dot_i16x8_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128Swizzle").match(/i8x16\.swizzle/g) ?? []).length, 1);
assert.equal((body(simd, "v128SqrtF32").match(/f32x4\.sqrt/g) ?? []).length, 1);
assert.equal((body(simd, "v128SqrtF64").match(/f64x2\.sqrt/g) ?? []).length, 0);
assert.equal((body(simd, "v128CeilF32").match(/f32x4\.ceil/g) ?? []).length, 0);
assert.equal((body(simd, "v128CeilF64").match(/f64x2\.ceil/g) ?? []).length, 0);
assert.equal((body(simd, "v128NearestF32").match(/f32x4\.nearest/g) ?? []).length, 0);
assert.equal((body(simd, "v128NearestF64").match(/f64x2\.nearest/g) ?? []).length, 0);
assert.equal((body(simd, "v128ConvertI32").match(/f32x4\.convert_i32x4_s/g) ?? []).length, 0);
assert.equal((body(simd, "v128ConvertLowI32").match(/f64x2\.convert_low_i32x4_s/g) ?? []).length, 0);
assert.equal((body(simd, "v128TruncSatI32").match(/i32x4\.trunc_sat_f32x4_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128NarrowI16").match(/i8x16\.narrow_i16x8_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128NarrowI32").match(/i16x8\.narrow_i32x4_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128ExtendLowI8").match(/i16x8\.extend_low_i8x16_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128ExtaddI8").match(/i16x8\.extadd_pairwise_i8x16_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128ExtmulI8").match(/i16x8\.extmul_low_i8x16_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128Q15Mulr").match(/i16x8\.q15mulr_sat_s/g) ?? []).length, 1);
for (const name of ["v128ExtendLowI16", "v128ExtendLowI32", "v128ExtmulI16", "v128ExtmulI32", "v128TruncSatZeroI32", "v128ExtaddI16", "v128DemoteF64", "v128PromoteF32"]) {
  assert.doesNotMatch(body(simd, name), /(?:i8x16|i16x8|i32x4|i64x2|f32x4|f64x2)\.(?:extend|extmul|extadd|trunc_sat|demote|promote)/, `${name} reintroduced a scalar/SIMD crossing`);
}
assert.equal((body(simd, "v128LtI8").match(/i8x16\.lt_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128LtI32").match(/i32x4\.lt_s/g) ?? []).length, 0);
assert.equal((body(simd, "v128LeI32").match(/i32x4\.le_s/g) ?? []).length, 0);
assert.equal((body(simd, "v128LtI64").match(/i64x2\.lt_s/g) ?? []).length, 0);
assert.equal((body(simd, "v128EqI64").match(/i64x2\.eq/g) ?? []).length, 0);
assert.equal((body(simd, "v128AnyTrue").match(/v128\.any_true/g) ?? []).length, 0);
assert.equal((body(simd, "v128AllTrueI8").match(/i8x16\.all_true/g) ?? []).length, 1);
assert.equal((body(simd, "v128AllTrueI32").match(/i32x4\.all_true/g) ?? []).length, 0);
assert.equal((body(simd, "v128AllTrueI64").match(/i64x2\.all_true/g) ?? []).length, 0);
assert.equal((body(simd, "v128BitmaskI32").match(/i32x4\.bitmask/g) ?? []).length, 1);
for (const name of ["v128MinI32", "v128MaxI32", "v128AbsI32", "v128NegI32", "v128ShlI32", "v128ShrI32", "v128AbsI64", "v128NegI64"]) {
  assert.equal((body(simd, name).match(/(?:i32x4|i64x2)\.(?:min|max|abs|neg|shl|shr)/g) ?? []).length, 0, `${name} reintroduced a scalar/SIMD crossing`);
}
assert.equal((body(simd, "v128AbsI8").match(/i8x16\.abs/g) ?? []).length, 1);
for (const name of ["v128NegI8", "v128NegI16", "v128AbsI16", "v128ShlI8", "v128ShlI16", "v128ShrI8", "v128ShrI16"]) {
  assert.equal((body(simd, name).match(/(?:i8x16|i16x8)\.(?:neg|abs|shl|shr_[su])/g) ?? []).length, 0, `${name} reintroduced a scalar/SIMD crossing`);
}
for (const name of ["v128AddI8", "v128AddI16", "v128SubI16", "v128AddI32", "v128SubI32", "v128AddI64", "v128SubI64"]) {
  assert.equal((body(simd, name).match(/(?:i8x16|i16x8|i32x4|i64x2)\.(?:add|sub)/g) ?? []).length, 0, `${name} reintroduced a scalar/SIMD crossing`);
}

// The register-backed API can remain in the native vector domain, unlike the
// pair-return API above. Lock down the measured direct paths independently.
assert.equal((body(simd, "v128rMinI8").match(/i8x16\.min_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128rMulI8").match(/i8x16\.shuffle/g) ?? []).length, 1);
assert.equal((body(simd, "v128rAddSatI16").match(/i16x8\.add_sat_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128rBitmaskI8").match(/i8x16\.bitmask/g) ?? []).length, 1);
assert.equal((body(simd, "v128rSwizzle").match(/i8x16\.swizzle/g) ?? []).length, 1);
assert.equal((body(simd, "v128rNarrowI16").match(/i8x16\.narrow_i16x8_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128rLoadExtI8").match(/v128\.load8x8_s/g) ?? []).length, 1);
assert.equal((body(simd, "v128rLoadZeroI32").match(/v128\.load32_zero/g) ?? []).length, 1);
assert.equal((body(simd, "v128rLoadSplatI8").match(/v128\.load8_splat/g) ?? []).length, 1);
assert.equal((body(simd, "v128rAbsI16").match(/i16x8\.abs/g) ?? []).length, 1);
assert.equal((body(simd, "v128rAllTrueI32").match(/i32x4\.all_true/g) ?? []).length, 1);
for (const [name, opcode] of [
  ["v128rMulI32", /i32x4\.mul/],
  ["v128rAbsI32", /i32x4\.abs/],
  ["v128rEqI32", /i32x4\.eq/],
  ["v128rLtI32", /i32x4\.lt_s/],
  ["v128rExtendLowI16", /i32x4\.extend_low_i16x8_s/],
  ["v128rExtendLowI32", /i64x2\.extend_low_i32x4_s/],
  ["v128rExtaddI16", /i32x4\.extadd_pairwise_i16x8_s/],
  ["v128rExtmulI16", /i32x4\.extmul_low_i16x8_s/],
  ["v128rExtmulI32", /i64x2\.extmul_low_i32x4_s/],
]) {
  assert.doesNotMatch(body(simd, name), opcode, `${name} reintroduced a measured scalar/SIMD crossing`);
}
for (const mode of [swar, simd]) {
  const lane = body(mode, "v128rExtractLane");
  assert.equal((lane.match(/i64\.load16_u/g) ?? []).length, 1);
  assert.doesNotMatch(lane, /v128\.(?:load|store)|i64\.(?:shr|shl)/);
}

console.log("dedicated v512 kernel unrolling tests passed");

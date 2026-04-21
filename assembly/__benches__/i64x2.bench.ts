import { i64x2_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);

// @ts-expect-error: decorator
@inline function nextA(): u64 { return blackbox(bench_common.nextA()); }
// @ts-expect-error: decorator
@inline function nextB(): u64 { return blackbox(bench_common.nextB()); }
// @ts-expect-error: decorator
@inline function nextM(): u64 { return blackbox(bench_common.nextM()); }
// @ts-expect-error: decorator
@inline function next128(): u64 { return bench_common.next128(); }
// @ts-expect-error: decorator
@inline function next128Hi(): u64 { return bench_common.next128Hi(); }
// @ts-expect-error: decorator
@inline function nextI64(): i64 { return nextA() as i64; }
// @ts-expect-error: decorator
@inline function nextLane2(): u8 { return (nextA() & 1) as u8; }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return (nextA() & 63) as i32; }
// @ts-expect-error: decorator
@inline function nextLen2(): i32 { return (nextA() & 3) as i32 - 1; }
// @ts-expect-error: decorator
@inline function nextPtr16(): usize { return IO_PTR + ((nextA() as usize) & 0xf0); }
// @ts-expect-error: decorator
@inline function nextVec(): v128 { return i64x2(nextI64(), nextI64()); }

bench("i64x2.ctor", () => { if (ASC_FEATURE_SIMD) blackbox(nextVec()); else { blackbox(i64x2_swar(nextI64(), nextI64())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "ctor");
bench("i64x2.splat", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.splat(nextI64())); else { blackbox(i64x2_swar.splat(nextI64())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "splat");
bench("i64x2.extract_lane", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.extract_lane(nextVec(), 0)); else blackbox(i64x2_swar.extract_lane(next128(), next128Hi(), nextLane2())); }, OPS, 8); dumpToFile("i64x2", "extract-lane");
bench("i64x2.replace_lane", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.replace_lane(nextVec(), 0, nextI64())); else { blackbox(i64x2_swar.replace_lane(next128(), next128Hi(), nextLane2(), nextI64())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "replace-lane");
bench("i64x2.add", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.add(nextVec(), nextVec())); else { blackbox(i64x2_swar.add(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "add");
bench("i64x2.sub", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.sub(nextVec(), nextVec())); else { blackbox(i64x2_swar.sub(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "sub");
bench("i64x2.mul", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.mul(nextVec(), nextVec())); else { blackbox(i64x2_swar.mul(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "mul");
bench("i64x2.abs", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.abs(nextVec())); else { blackbox(i64x2_swar.abs(next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "abs");
bench("i64x2.neg", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.neg(nextVec())); else { blackbox(i64x2_swar.neg(next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "neg");
bench("i64x2.shl", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.shl(nextVec(), nextShift())); else { blackbox(i64x2_swar.shl(next128(), next128Hi(), nextShift())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "shl");
bench("i64x2.shr_s", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.shr_s(nextVec(), nextShift())); else { blackbox(i64x2_swar.shr_s(next128(), next128Hi(), nextShift())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "shr-s");
bench("i64x2.shr_u", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.shr_u(nextVec(), nextShift())); else { blackbox(i64x2_swar.shr_u(next128(), next128Hi(), nextShift())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "shr-u");
bench("i64x2.all_true", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.all_true(nextVec())); else blackbox(i64x2_swar.all_true(next128(), next128Hi())); }, OPS, 8); dumpToFile("i64x2", "all-true");
bench("i64x2.bitmask", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.bitmask(nextVec())); else blackbox(i64x2_swar.bitmask(next128(), next128Hi())); }, OPS, 8); dumpToFile("i64x2", "bitmask");
bench("i64x2.eq", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.eq(nextVec(), nextVec())); else { blackbox(i64x2_swar.eq(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "eq");
bench("i64x2.ne", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.ne(nextVec(), nextVec())); else { blackbox(i64x2_swar.ne(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "ne");
bench("i64x2.lt_s", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.lt_s(nextVec(), nextVec())); else { blackbox(i64x2_swar.lt_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "lt-s");
bench("i64x2.le_s", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.le_s(nextVec(), nextVec())); else { blackbox(i64x2_swar.le_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "le-s");
bench("i64x2.gt_s", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.gt_s(nextVec(), nextVec())); else { blackbox(i64x2_swar.gt_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "gt-s");
bench("i64x2.ge_s", () => { if (ASC_FEATURE_SIMD) blackbox(i64x2.ge_s(nextVec(), nextVec())); else { blackbox(i64x2_swar.ge_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); } }, OPS, 8); dumpToFile("i64x2", "ge-s");
bench("i64x2.extend_low_i32x4_s", () => { blackbox(i64x2_swar.extend_low_i32x4_s(next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "extend-low-i32x4-s");
bench("i64x2.extend_low_i32x4_u", () => { blackbox(i64x2_swar.extend_low_i32x4_u(next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "extend-low-i32x4-u");
bench("i64x2.extend_high_i32x4_s", () => { blackbox(i64x2_swar.extend_high_i32x4_s(next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "extend-high-i32x4-s");
bench("i64x2.extend_high_i32x4_u", () => { blackbox(i64x2_swar.extend_high_i32x4_u(next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "extend-high-i32x4-u");
bench("i64x2.extmul_low_i32x4_s", () => { blackbox(i64x2_swar.extmul_low_i32x4_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "extmul-low-i32x4-s");
bench("i64x2.extmul_low_i32x4_u", () => { blackbox(i64x2_swar.extmul_low_i32x4_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "extmul-low-i32x4-u");
bench("i64x2.extmul_high_i32x4_s", () => { blackbox(i64x2_swar.extmul_high_i32x4_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "extmul-high-i32x4-s");
bench("i64x2.extmul_high_i32x4_u", () => { blackbox(i64x2_swar.extmul_high_i32x4_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "extmul-high-i32x4-u");
bench("i64x2.shuffle", () => { blackbox(i64x2_swar.shuffle(next128(), next128Hi(), next128(), next128Hi(), 1, 0)); blackbox(i64x2_swar.take_hi()); }, OPS, 8); dumpToFile("i64x2", "shuffle");
bench("i64x2.relaxed_laneselect", () => { blackbox(i64x2_swar.relaxed_laneselect(next128(), next128Hi(), next128(), next128Hi(), nextM(), nextB())); blackbox(i64x2_swar.take_hi()); }, OPS, 24); dumpToFile("i64x2", "relaxed-laneselect");

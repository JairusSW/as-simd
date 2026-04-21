import { i16x8_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);

// @ts-expect-error: decorator
@inline function next128(): u64 { return bench_common.next128(); }
// @ts-expect-error: decorator
@inline function next128Hi(): u64 { return bench_common.next128Hi(); }
// @ts-expect-error: decorator
@inline function nextA(): u64 { return blackbox(bench_common.nextA()); }
// @ts-expect-error: decorator
@inline function nextB(): u64 { return blackbox(bench_common.nextB()); }
// @ts-expect-error: decorator
@inline function nextM(): u64 { return blackbox(bench_common.nextM()); }
// @ts-expect-error: decorator
@inline function nextI16(): i16 { return nextA() as i16; }
// @ts-expect-error: decorator
@inline function nextLane8(): u8 { return (nextA() & 7) as u8; }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return (nextA() & 15) as i32; }
// @ts-expect-error: decorator
@inline function nextLen8(): i32 { return (nextA() & 15) as i32 - 4; }
// @ts-expect-error: decorator
@inline function nextPtr16(): usize { return IO_PTR + ((nextA() as usize) & 0xf0); }
// @ts-expect-error: decorator
@inline function nextVec(): v128 {
  return i16x8(nextI16(), nextI16(), nextI16(), nextI16(), nextI16(), nextI16(), nextI16(), nextI16());
}

bench("i16x8.ctor", () => { if (ASC_FEATURE_SIMD) blackbox(nextVec()); else { blackbox(i16x8_swar(nextI16(), nextI16(), nextI16(), nextI16(), nextI16(), nextI16(), nextI16(), nextI16())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "ctor");
bench("i16x8.splat", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.splat(nextI16())); else { blackbox(i16x8_swar.splat(nextI16())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "splat");
bench("i16x8.extract_lane_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.extract_lane_s(nextVec(), 0)); else blackbox(i16x8_swar.extract_lane_s(next128(), next128Hi(), nextLane8())); }, OPS, 8); dumpToFile("i16x8", "extract-lane-s");
bench("i16x8.extract_lane_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.extract_lane_u(nextVec(), 0)); else blackbox(i16x8_swar.extract_lane_u(next128(), next128Hi(), nextLane8())); }, OPS, 8); dumpToFile("i16x8", "extract-lane-u");
bench("i16x8.replace_lane", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.replace_lane(nextVec(), 0, nextI16())); else { blackbox(i16x8_swar.replace_lane(next128(), next128Hi(), nextLane8(), nextI16())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "replace-lane");
bench("i16x8.add", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.add(nextVec(), nextVec())); else { blackbox(i16x8_swar.add(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "add");
bench("i16x8.sub", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.sub(nextVec(), nextVec())); else { blackbox(i16x8_swar.sub(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "sub");
bench("i16x8.mul", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.mul(nextVec(), nextVec())); else { blackbox(i16x8_swar.mul(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "mul");
bench("i16x8.min_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.min_s(nextVec(), nextVec())); else { blackbox(i16x8_swar.min_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "min-s");
bench("i16x8.min_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.min_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.min_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "min-u");
bench("i16x8.max_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.max_s(nextVec(), nextVec())); else { blackbox(i16x8_swar.max_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "max-s");
bench("i16x8.max_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.max_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.max_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "max-u");
bench("i16x8.avgr_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.avgr_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.avgr_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "avgr-u");
bench("i16x8.abs", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.abs(nextVec())); else { blackbox(i16x8_swar.abs(next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "abs");
bench("i16x8.neg", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.neg(nextVec())); else { blackbox(i16x8_swar.neg(next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "neg");
bench("i16x8.add_sat_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.add_sat_s(nextVec(), nextVec())); else { blackbox(i16x8_swar.add_sat_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "add-sat-s");
bench("i16x8.add_sat_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.add_sat_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.add_sat_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "add-sat-u");
bench("i16x8.sub_sat_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.sub_sat_s(nextVec(), nextVec())); else { blackbox(i16x8_swar.sub_sat_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "sub-sat-s");
bench("i16x8.sub_sat_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.sub_sat_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.sub_sat_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "sub-sat-u");
bench("i16x8.shl", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.shl(nextVec(), nextShift())); else { blackbox(i16x8_swar.shl(next128(), next128Hi(), nextShift())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "shl");
bench("i16x8.shr_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.shr_s(nextVec(), nextShift())); else { blackbox(i16x8_swar.shr_s(next128(), next128Hi(), nextShift())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "shr-s");
bench("i16x8.shr_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.shr_u(nextVec(), nextShift())); else { blackbox(i16x8_swar.shr_u(next128(), next128Hi(), nextShift())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "shr-u");
bench("i16x8.all_true", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.all_true(nextVec())); else blackbox(i16x8_swar.all_true(next128(), next128Hi())); }, OPS, 8); dumpToFile("i16x8", "all-true");
bench("i16x8.bitmask", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.bitmask(nextVec())); else blackbox(i16x8_swar.bitmask(next128(), next128Hi())); }, OPS, 8); dumpToFile("i16x8", "bitmask");
bench("i16x8.eq", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.eq(nextVec(), nextVec())); else { blackbox(i16x8_swar.eq(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "eq");
bench("i16x8.ne", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.ne(nextVec(), nextVec())); else { blackbox(i16x8_swar.ne(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "ne");
bench("i16x8.lt_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.lt_s(nextVec(), nextVec())); else { blackbox(i16x8_swar.lt_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "lt-s");
bench("i16x8.lt_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.lt_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.lt_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "lt-u");
bench("i16x8.le_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.le_s(nextVec(), nextVec())); else { blackbox(i16x8_swar.le_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "le-s");
bench("i16x8.le_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.le_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.le_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "le-u");
bench("i16x8.gt_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.gt_s(nextVec(), nextVec())); else { blackbox(i16x8_swar.gt_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "gt-s");
bench("i16x8.gt_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.gt_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.gt_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "gt-u");
bench("i16x8.ge_s", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.ge_s(nextVec(), nextVec())); else { blackbox(i16x8_swar.ge_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "ge-s");
bench("i16x8.ge_u", () => { if (ASC_FEATURE_SIMD) blackbox(i16x8.ge_u(nextVec(), nextVec())); else { blackbox(i16x8_swar.ge_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); } }, OPS, 8); dumpToFile("i16x8", "ge-u");
bench("i16x8.narrow_i32x4_s", () => { blackbox(i16x8_swar.narrow_i32x4_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "narrow-i32x4-s");
bench("i16x8.narrow_i32x4_u", () => { blackbox(i16x8_swar.narrow_i32x4_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "narrow-i32x4-u");
bench("i16x8.extend_low_i8x16_s", () => { blackbox(i16x8_swar.extend_low_i8x16_s(next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "extend-low-i8x16-s");
bench("i16x8.extend_low_i8x16_u", () => { blackbox(i16x8_swar.extend_low_i8x16_u(next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "extend-low-i8x16-u");
bench("i16x8.extend_high_i8x16_s", () => { blackbox(i16x8_swar.extend_high_i8x16_s(next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "extend-high-i8x16-s");
bench("i16x8.extend_high_i8x16_u", () => { blackbox(i16x8_swar.extend_high_i8x16_u(next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "extend-high-i8x16-u");
bench("i16x8.q15mulr_sat_s", () => { blackbox(i16x8_swar.q15mulr_sat_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "q15mulr-sat-s");
bench("i16x8.extmul_low_i8x16_s", () => { blackbox(i16x8_swar.extmul_low_i8x16_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "extmul-low-i8x16-s");
bench("i16x8.extmul_low_i8x16_u", () => { blackbox(i16x8_swar.extmul_low_i8x16_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "extmul-low-i8x16-u");
bench("i16x8.extmul_high_i8x16_s", () => { blackbox(i16x8_swar.extmul_high_i8x16_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "extmul-high-i8x16-s");
bench("i16x8.extmul_high_i8x16_u", () => { blackbox(i16x8_swar.extmul_high_i8x16_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "extmul-high-i8x16-u");
bench("i16x8.shuffle", () => { blackbox(i16x8_swar.shuffle(next128(), next128Hi(), next128(), next128Hi(), 7,6,5,4,3,2,1,0)); blackbox(i16x8_swar.take_hi()); }, OPS, 8); dumpToFile("i16x8", "shuffle");
bench("i16x8.relaxed_laneselect", () => { blackbox(i16x8_swar.relaxed_laneselect(next128(), next128Hi(), next128(), next128Hi(), nextM(), nextB())); blackbox(i16x8_swar.take_hi()); }, OPS, 24); dumpToFile("i16x8", "relaxed-laneselect");

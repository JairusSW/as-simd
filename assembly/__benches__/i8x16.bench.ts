import { i8x16_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);

// @ts-expect-error: decorator
@inline function next64(): u64 { return bench_common.next64(); }
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
@inline function nextI8(): i8 { return nextA() as i8; }
// @ts-expect-error: decorator
@inline function nextLane16(): u8 { return (nextA() & 15) as u8; }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return (nextA() & 7) as i32; }
// @ts-expect-error: decorator
@inline function nextVec(): v128 {
  return i8x16(
    nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8(),
    nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8(),
  );
}

bench("i8x16.splat", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.splat(nextI8()));
  else { blackbox(i8x16_swar.splat(nextI8())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "splat");

bench("i8x16.extract_lane_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.extract_lane_s(nextVec(), 0));
  else blackbox(i8x16_swar.extract_lane_s(next128(), next128Hi(), nextLane16()));
}, OPS, 8);
dumpToFile("i8x16", "extract-lane-s");

bench("i8x16.extract_lane_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.extract_lane_u(nextVec(), 0));
  else blackbox(i8x16_swar.extract_lane_u(next128(), next128Hi(), nextLane16()));
}, OPS, 8);
dumpToFile("i8x16", "extract-lane-u");

bench("i8x16.replace_lane", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.replace_lane(nextVec(), 0, nextI8()));
  else { blackbox(i8x16_swar.replace_lane(next128(), next128Hi(), nextLane16(), nextI8())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "replace-lane");

bench("i8x16.add", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.add(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.add(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "add");

bench("i8x16.sub", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.sub(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.sub(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "sub");

bench("i8x16.mul", () => {
  blackbox(i8x16_swar.mul(next128(), next128Hi(), next128(), next128Hi()));
  blackbox(i8x16_swar.take_hi());
}, OPS, 8);
dumpToFile("i8x16", "mul");

bench("i8x16.min_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.min_s(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.min_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "min-s");

bench("i8x16.min_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.min_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.min_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "min-u");

bench("i8x16.max_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.max_s(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.max_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "max-s");

bench("i8x16.max_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.max_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.max_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "max-u");

bench("i8x16.avgr_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.avgr_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.avgr_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "avgr-u");

bench("i8x16.abs", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.abs(nextVec()));
  else { blackbox(i8x16_swar.abs(next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "abs");

bench("i8x16.neg", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.neg(nextVec()));
  else { blackbox(i8x16_swar.neg(next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "neg");

bench("i8x16.add_sat_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.add_sat_s(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.add_sat_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "add-sat-s");

bench("i8x16.add_sat_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.add_sat_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.add_sat_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "add-sat-u");

bench("i8x16.sub_sat_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.sub_sat_s(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.sub_sat_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "sub-sat-s");

bench("i8x16.sub_sat_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.sub_sat_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.sub_sat_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "sub-sat-u");

bench("i8x16.shl", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.shl(nextVec(), nextShift()));
  else { blackbox(i8x16_swar.shl(next128(), next128Hi(), nextShift())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "shl");

bench("i8x16.shr_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.shr_s(nextVec(), nextShift()));
  else { blackbox(i8x16_swar.shr_s(next128(), next128Hi(), nextShift())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "shr-s");

bench("i8x16.shr_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.shr_u(nextVec(), nextShift()));
  else { blackbox(i8x16_swar.shr_u(next128(), next128Hi(), nextShift())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "shr-u");

bench("i8x16.all_true", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.all_true(nextVec()));
  else blackbox(i8x16_swar.all_true(next128(), next128Hi()));
}, OPS, 8);
dumpToFile("i8x16", "all-true");

bench("i8x16.bitmask", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.bitmask(nextVec()));
  else blackbox(i8x16_swar.bitmask(next128(), next128Hi()));
}, OPS, 8);
dumpToFile("i8x16", "bitmask");

bench("i8x16.eq", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.eq(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.eq(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "eq");

bench("i8x16.ne", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.ne(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.ne(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "ne");

bench("i8x16.lt_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.lt_s(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.lt_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "lt-s");

bench("i8x16.lt_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.lt_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.lt_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "lt-u");

bench("i8x16.le_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.le_s(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.le_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "le-s");

bench("i8x16.le_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.le_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.le_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "le-u");

bench("i8x16.gt_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.gt_s(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.gt_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "gt-s");

bench("i8x16.gt_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.gt_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.gt_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "gt-u");

bench("i8x16.ge_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.ge_s(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.ge_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "ge-s");

bench("i8x16.ge_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.ge_u(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.ge_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "ge-u");

bench("i8x16.narrow_i16x8_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.narrow_i16x8_s(i16x8.splat(nextI8() as i16), i16x8.splat(nextI8() as i16)));
  else { blackbox(i8x16_swar.narrow_i16x8_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "narrow-i16x8-s");

bench("i8x16.narrow_i16x8_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.narrow_i16x8_u(i16x8.splat(nextI8() as i16), i16x8.splat(nextI8() as i16)));
  else { blackbox(i8x16_swar.narrow_i16x8_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "narrow-i16x8-u");

bench("i8x16.shuffle", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.shuffle(nextVec(), nextVec(), 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0));
  else {
    blackbox(i8x16_swar.shuffle(next128(), next128Hi(), next128(), next128Hi(), 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0));
    blackbox(i8x16_swar.take_hi());
  }
}, OPS, 16);
dumpToFile("i8x16", "shuffle");

bench("i8x16.swizzle", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.swizzle(nextVec(), nextVec()));
  else { blackbox(i8x16_swar.swizzle(next128(), next128Hi(), next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "swizzle");

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i8x16.relaxed_swizzle", () => {
    blackbox(i8x16.relaxed_swizzle(nextVec(), nextVec()));
  }, OPS, 8);
  dumpToFile("i8x16", "relaxed-swizzle");

  bench("i8x16.relaxed_laneselect", () => {
    blackbox(i8x16.relaxed_laneselect(nextVec(), nextVec(), nextVec()));
  }, OPS, 24);
  dumpToFile("i8x16", "relaxed-laneselect");
} else {
  bench("i8x16.relaxed_swizzle", () => {
    blackbox(i8x16_swar.relaxed_swizzle(next128(), next128Hi(), next128(), next128Hi()));
    blackbox(i8x16_swar.take_hi());
  }, OPS, 8);
  dumpToFile("i8x16", "relaxed-swizzle");

  bench("i8x16.relaxed_laneselect", () => {
    blackbox(i8x16_swar.relaxed_laneselect(next128(), next128Hi(), next128(), next128Hi(), nextM(), nextB()));
    blackbox(i8x16_swar.take_hi());
  }, OPS, 24);
  dumpToFile("i8x16", "relaxed-laneselect");
}

bench("i8x16.popcnt", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.popcnt(nextVec()));
  else { blackbox(i8x16_swar.popcnt(next128(), next128Hi())); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "popcnt");

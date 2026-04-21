import { i16x4 } from "../v64/i16x4";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(96);

// @ts-expect-error: decorator
@inline function next64(): u64 { return bench_common.next64(); }
// @ts-expect-error: decorator
@inline function next128(): u64 { return bench_common.next128(); }
// @ts-expect-error: decorator
@inline function next128Hi(): u64 { return bench_common.next128Hi(); }

// @ts-expect-error: decorator
@inline function nextA(): u64 {
  return blackbox(bench_common.nextA());
}

// @ts-expect-error: decorator
@inline function nextB(): u64 {
  return blackbox(bench_common.nextB());
}

// @ts-expect-error: decorator
@inline function nextM(): u64 {
  return blackbox(bench_common.nextM());
}

// @ts-expect-error: decorator
@inline function nextShift(): i32 {
  return <i32>(nextA() & 15);
}

// @ts-expect-error: decorator
@inline function nextLane4(): u8 {
  return <u8>(nextA() & 3);
}

// @ts-expect-error: decorator
@inline function nextLane8(): u8 {
  return <u8>(nextA() & 7);
}

// @ts-expect-error: decorator
@inline function nextI16(): i16 {
  return <i16>(nextA() & 0xffff);
}

// @ts-expect-error: decorator
@inline function nextPtr8(): usize {
  return IO_PTR + ((nextA() as usize) & 0x38);
}

// @ts-expect-error: decorator
@inline function nextLen4(): i32 {
  return <i32>(nextA() & 7) - 2;
}

bench("i16x4.ctor", () => {
  blackbox(i16x4(nextI16(), nextI16(), nextI16(), nextI16()));
}, OPS, 8);
dumpToFile("i16x4", "ctor");

bench("i16x4.splat", () => {
  blackbox(i16x4.splat(nextI16()));
}, OPS, 8);
dumpToFile("i16x4", "splat");

bench("i16x4.load", () => {
  blackbox(load<u64>(nextPtr8()));
}, OPS, 8);
dumpToFile("i16x4", "load");

bench("i16x4.store", () => {
  store<u64>(nextPtr8(), nextA());
  blackbox(load<u64>(IO_PTR));
}, OPS, 8);
dumpToFile("i16x4", "store");

bench("i16x4.loadPartial", () => {
  blackbox(i16x4.loadPartial(nextPtr8(), nextLen4(), 0, 2, nextI16()));
}, OPS, 8);
dumpToFile("i16x4", "load-partial");

bench("i16x4.storePartial", () => {
  i16x4.storePartial(nextPtr8(), nextA(), nextLen4(), 0, 2);
  blackbox(load<u64>(IO_PTR));
}, OPS, 8);
dumpToFile("i16x4", "store-partial");

bench("i16x4.extract_lane_s", () => {
  blackbox(i16x4.extract_lane_s(nextA(), nextLane4()));
}, OPS, 8);
dumpToFile("i16x4", "extract-lane-s");

bench("i16x4.extract_lane_u", () => {
  blackbox(i16x4.extract_lane_u(nextA(), nextLane4()));
}, OPS, 8);
dumpToFile("i16x4", "extract-lane-u");

bench("i16x4.replace_lane", () => {
  blackbox(i16x4.replace_lane(nextA(), nextLane4(), nextI16()));
}, OPS, 8);
dumpToFile("i16x4", "replace-lane");

bench("i16x4.add", () => {
  blackbox(i16x4.add(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "add");

bench("i16x4.sub", () => {
  blackbox(i16x4.sub(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "sub");

bench("i16x4.mul", () => {
  blackbox(i16x4.mul(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "mul");

bench("i16x4.min_s", () => {
  blackbox(i16x4.min_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "min-s");

bench("i16x4.min_u", () => {
  blackbox(i16x4.min_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "min-u");

bench("i16x4.max_s", () => {
  blackbox(i16x4.max_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "max-s");

bench("i16x4.max_u", () => {
  blackbox(i16x4.max_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "max-u");

bench("i16x4.avgr_u", () => {
  blackbox(i16x4.avgr_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "avgr-u");

bench("i16x4.abs", () => {
  blackbox(i16x4.abs(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "abs");

bench("i16x4.neg", () => {
  blackbox(i16x4.neg(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "neg");

bench("i16x4.add_sat_s", () => {
  blackbox(i16x4.add_sat_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "add-sat-s");

bench("i16x4.add_sat_u", () => {
  blackbox(i16x4.add_sat_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "add-sat-u");

bench("i16x4.sub_sat_s", () => {
  blackbox(i16x4.sub_sat_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "sub-sat-s");

bench("i16x4.sub_sat_u", () => {
  blackbox(i16x4.sub_sat_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "sub-sat-u");

bench("i16x4.shl", () => {
  blackbox(i16x4.shl(nextA(), nextShift()));
}, OPS, 8);
dumpToFile("i16x4", "shl");

bench("i16x4.shr_s", () => {
  blackbox(i16x4.shr_s(nextA(), nextShift()));
}, OPS, 8);
dumpToFile("i16x4", "shr-s");

bench("i16x4.shr_u", () => {
  blackbox(i16x4.shr_u(nextA(), nextShift()));
}, OPS, 8);
dumpToFile("i16x4", "shr-u");

bench("i16x4.all_true", () => {
  blackbox(i16x4.all_true(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "all-true");

bench("i16x4.bitmask", () => {
  blackbox(i16x4.bitmask(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "bitmask");

bench("i16x4.eq", () => {
  blackbox(i16x4.eq(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "eq");

bench("i16x4.ne", () => {
  blackbox(i16x4.ne(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "ne");

bench("i16x4.lt_s", () => {
  blackbox(i16x4.lt_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "lt-s");

bench("i16x4.lt_u", () => {
  blackbox(i16x4.lt_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "lt-u");

bench("i16x4.le_s", () => {
  blackbox(i16x4.le_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "le-s");

bench("i16x4.le_u", () => {
  blackbox(i16x4.le_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "le-u");

bench("i16x4.gt_s", () => {
  blackbox(i16x4.gt_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "gt-s");

bench("i16x4.gt_u", () => {
  blackbox(i16x4.gt_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "gt-u");

bench("i16x4.ge_s", () => {
  blackbox(i16x4.ge_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "ge-s");

bench("i16x4.ge_u", () => {
  blackbox(i16x4.ge_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "ge-u");

bench("i16x4.narrow_i32x2_s", () => {
  blackbox(i16x4.narrow_i32x2_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "narrow-i32x2-s");

bench("i16x4.narrow_i32x2_u", () => {
  blackbox(i16x4.narrow_i32x2_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "narrow-i32x2-u");

bench("i16x4.extend_low_i8x8_s", () => {
  blackbox(i16x4.extend_low_i8x8_s(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "extend-low-i8x8-s");

bench("i16x4.extend_low_i8x8_u", () => {
  blackbox(i16x4.extend_low_i8x8_u(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "extend-low-i8x8-u");

bench("i16x4.extend_high_i8x8_s", () => {
  blackbox(i16x4.extend_high_i8x8_s(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "extend-high-i8x8-s");

bench("i16x4.extend_high_i8x8_u", () => {
  blackbox(i16x4.extend_high_i8x8_u(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "extend-high-i8x8-u");

bench("i16x4.extadd_pairwise_i8x8_s", () => {
  blackbox(i16x4.extadd_pairwise_i8x8_s(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "extadd-pairwise-i8x8-s");

bench("i16x4.extadd_pairwise_i8x8_u", () => {
  blackbox(i16x4.extadd_pairwise_i8x8_u(nextA()));
}, OPS, 8);
dumpToFile("i16x4", "extadd-pairwise-i8x8-u");

bench("i16x4.q15mulr_sat_s", () => {
  blackbox(i16x4.q15mulr_sat_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "q15mulr-sat-s");

bench("i16x4.extmul_low_i8x8_s", () => {
  blackbox(i16x4.extmul_low_i8x8_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "extmul-low-i8x8-s");

bench("i16x4.extmul_low_i8x8_u", () => {
  blackbox(i16x4.extmul_low_i8x8_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "extmul-low-i8x8-u");

bench("i16x4.extmul_high_i8x8_s", () => {
  blackbox(i16x4.extmul_high_i8x8_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "extmul-high-i8x8-s");

bench("i16x4.extmul_high_i8x8_u", () => {
  blackbox(i16x4.extmul_high_i8x8_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i16x4", "extmul-high-i8x8-u");

bench("i16x4.shuffle", () => {
  blackbox(i16x4.shuffle(nextA(), nextB(), nextLane8(), nextLane8(), nextLane8(), nextLane8()));
}, OPS, 8);
dumpToFile("i16x4", "shuffle");

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i16x4.relaxed_laneselect", () => {
    blackbox(i16x4.relaxed_laneselect(nextA(), nextB(), nextM()));
  }, OPS, 24);
  dumpToFile("i16x4", "relaxed-laneselect");

  bench("i16x4.relaxed_q15mulr_s", () => {
    blackbox(i16x4.relaxed_q15mulr_s(nextA(), nextB()));
  }, OPS, 8);
  dumpToFile("i16x4", "relaxed-q15mulr-s");

  bench("i16x4.relaxed_dot_i8x8_i7x8_s", () => {
    blackbox(i16x4.relaxed_dot_i8x8_i7x8_s(nextA(), nextB()));
  }, OPS, 8);
  dumpToFile("i16x4", "relaxed-dot-i8x8-i7x8-s");
} else {
  bench("i16x4.relaxed_laneselect", () => {
    blackbox(i16x4.relaxed_laneselect(nextA(), nextB(), nextM()));
  }, OPS, 24);
  dumpToFile("i16x4", "relaxed-laneselect");

  bench("i16x4.relaxed_q15mulr_s", () => {
    blackbox(i16x4.q15mulr_sat_s(nextA(), nextB()));
  }, OPS, 8);
  dumpToFile("i16x4", "relaxed-q15mulr-s");

  bench("i16x4.relaxed_dot_i8x8_i7x8_s", () => {
    blackbox(i16x4.relaxed_dot_i8x8_i7x8_s(nextA(), nextB()));
  }, OPS, 8);
  dumpToFile("i16x4", "relaxed-dot-i8x8-i7x8-s");
}

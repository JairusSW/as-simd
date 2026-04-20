import { i16x8_swar } from "../v128/i16x8";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = 25_000_000;

// @ts-expect-error: decorator
@inline function make128(lo: u64, hi: u64): v128 {
  return i64x2(lo as i64, hi as i64);
}

let s0: v128 = make128(0x0123456789abcdef, 0x8899aabbccddeeff);
let s1: v128 = make128(0xfedcba9876543210, 0x7766554433221100);
let s2: v128 = make128(0xaa55aa55aa55aa55, 0x55aa55aa55aa55aa);
const IO_PTR: usize = memory.data(160);

// @ts-expect-error: decorator
@inline function next128(x: v128): v128 {
  x = v128.xor(x, i64x2.shl(x, 13));
  x = v128.xor(x, i64x2.shr_u(x, 7));
  x = v128.xor(x, i64x2.shl(x, 17));
  return x;
}

// @ts-expect-error: decorator
@inline function nextVecA(): v128 {
  s0 = next128(s0);
  s1 = next128(s1);
  return blackbox(v128.xor(s0, i64x2.shr_u(s1, 17)));
}

// @ts-expect-error: decorator
@inline function nextVecB(): v128 {
  s1 = next128(s1);
  s2 = next128(s2);
  return blackbox(v128.xor(s1, i64x2.shl(s2, 13)));
}

// @ts-expect-error: decorator
@inline function nextVecM(): v128 {
  s2 = next128(s2);
  return blackbox(v128.xor(s2, i16x8.splat(0x5555)));
}

// @ts-expect-error: decorator
@inline function nextA64(): u64 {
  return <u64>i64x2.extract_lane(nextVecA(), 0);
}

// @ts-expect-error: decorator
@inline function nextI16(): i16 {
  return <i16>(nextA64() & 0xffff);
}

// @ts-expect-error: decorator
@inline function nextShift(): i32 {
  return <i32>(nextA64() & 15);
}

// @ts-expect-error: decorator
@inline function nextPtr16(): usize {
  return IO_PTR + ((nextA64() as usize) & 0x70);
}

// @ts-expect-error: decorator
@inline function nextLen8(): i32 {
  return <i32>(nextA64() & 15) - 4;
}

bench("i16x8.splat", () => {
  blackbox(i16x8.splat(nextI16()));
}, OPS, 8);
dumpToFile("i16x8", "splat");

bench("i16x8.load", () => {
  blackbox(load<v128>(nextPtr16()));
}, OPS, 16);
dumpToFile("i16x8", "load");

bench("i16x8.store", () => {
  store<v128>(nextPtr16(), nextVecA());
  blackbox(load<u64>(IO_PTR));
}, OPS, 16);
dumpToFile("i16x8", "store");

bench("i16x8.loadPartial", () => {
  blackbox(i16x8_swar.loadPartial(nextPtr16(), nextLen8(), 0, 2, nextI16()));
}, OPS, 16);
dumpToFile("i16x8", "load-partial");

bench("i16x8.storePartial", () => {
  i16x8_swar.storePartial(nextPtr16(), nextVecA(), nextLen8(), 0, 2);
  blackbox(load<u64>(IO_PTR));
}, OPS, 16);
dumpToFile("i16x8", "store-partial");

bench("i16x8.extract_lane_s", () => {
  blackbox(i16x8.extract_lane_s(nextVecA(), 3));
}, OPS, 8);
dumpToFile("i16x8", "extract-lane-s");

bench("i16x8.extract_lane_u", () => {
  blackbox(i16x8.extract_lane_u(nextVecA(), 3));
}, OPS, 8);
dumpToFile("i16x8", "extract-lane-u");

bench("i16x8.replace_lane", () => {
  blackbox(i16x8.replace_lane(nextVecA(), 3, nextI16()));
}, OPS, 8);
dumpToFile("i16x8", "replace-lane");

bench("i16x8.add", () => {
  blackbox(i16x8.add(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "add");

bench("i16x8.sub", () => {
  blackbox(i16x8.sub(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "sub");

bench("i16x8.mul", () => {
  blackbox(i16x8.mul(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "mul");

bench("i16x8.min_s", () => {
  blackbox(i16x8.min_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "min-s");

bench("i16x8.min_u", () => {
  blackbox(i16x8.min_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "min-u");

bench("i16x8.max_s", () => {
  blackbox(i16x8.max_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "max-s");

bench("i16x8.max_u", () => {
  blackbox(i16x8.max_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "max-u");

bench("i16x8.avgr_u", () => {
  blackbox(i16x8.avgr_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "avgr-u");

bench("i16x8.abs", () => {
  blackbox(i16x8.abs(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "abs");

bench("i16x8.neg", () => {
  blackbox(i16x8.neg(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "neg");

bench("i16x8.add_sat_s", () => {
  blackbox(i16x8.add_sat_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "add-sat-s");

bench("i16x8.add_sat_u", () => {
  blackbox(i16x8.add_sat_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "add-sat-u");

bench("i16x8.sub_sat_s", () => {
  blackbox(i16x8.sub_sat_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "sub-sat-s");

bench("i16x8.sub_sat_u", () => {
  blackbox(i16x8.sub_sat_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "sub-sat-u");

bench("i16x8.shl", () => {
  blackbox(i16x8.shl(nextVecA(), nextShift()));
}, OPS, 8);
dumpToFile("i16x8", "shl");

bench("i16x8.shr_s", () => {
  blackbox(i16x8.shr_s(nextVecA(), nextShift()));
}, OPS, 8);
dumpToFile("i16x8", "shr-s");

bench("i16x8.shr_u", () => {
  blackbox(i16x8.shr_u(nextVecA(), nextShift()));
}, OPS, 8);
dumpToFile("i16x8", "shr-u");

bench("i16x8.all_true", () => {
  blackbox(i16x8.all_true(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "all-true");

bench("i16x8.bitmask", () => {
  blackbox(i16x8.bitmask(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "bitmask");

bench("i16x8.eq", () => {
  blackbox(i16x8.eq(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "eq");

bench("i16x8.ne", () => {
  blackbox(i16x8.ne(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "ne");

bench("i16x8.lt_s", () => {
  blackbox(i16x8.lt_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "lt-s");

bench("i16x8.lt_u", () => {
  blackbox(i16x8.lt_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "lt-u");

bench("i16x8.le_s", () => {
  blackbox(i16x8.le_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "le-s");

bench("i16x8.le_u", () => {
  blackbox(i16x8.le_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "le-u");

bench("i16x8.gt_s", () => {
  blackbox(i16x8.gt_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "gt-s");

bench("i16x8.gt_u", () => {
  blackbox(i16x8.gt_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "gt-u");

bench("i16x8.ge_s", () => {
  blackbox(i16x8.ge_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "ge-s");

bench("i16x8.ge_u", () => {
  blackbox(i16x8.ge_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "ge-u");

bench("i16x8.narrow_i32x4_s", () => {
  blackbox(i16x8.narrow_i32x4_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "narrow-i32x4-s");

bench("i16x8.narrow_i32x4_u", () => {
  blackbox(i16x8.narrow_i32x4_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "narrow-i32x4-u");

bench("i16x8.extend_low_i8x16_s", () => {
  blackbox(i16x8.extend_low_i8x16_s(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "extend-low-i8x16-s");

bench("i16x8.extend_low_i8x16_u", () => {
  blackbox(i16x8.extend_low_i8x16_u(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "extend-low-i8x16-u");

bench("i16x8.extend_high_i8x16_s", () => {
  blackbox(i16x8.extend_high_i8x16_s(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "extend-high-i8x16-s");

bench("i16x8.extend_high_i8x16_u", () => {
  blackbox(i16x8.extend_high_i8x16_u(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "extend-high-i8x16-u");

bench("i16x8.extadd_pairwise_i8x16_s", () => {
  blackbox(i16x8.extadd_pairwise_i8x16_s(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "extadd-pairwise-i8x16-s");

bench("i16x8.extadd_pairwise_i8x16_u", () => {
  blackbox(i16x8.extadd_pairwise_i8x16_u(nextVecA()));
}, OPS, 8);
dumpToFile("i16x8", "extadd-pairwise-i8x16-u");

bench("i16x8.q15mulr_sat_s", () => {
  blackbox(i16x8.q15mulr_sat_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "q15mulr-sat-s");

bench("i16x8.extmul_low_i8x16_s", () => {
  blackbox(i16x8.extmul_low_i8x16_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "extmul-low-i8x16-s");

bench("i16x8.extmul_low_i8x16_u", () => {
  blackbox(i16x8.extmul_low_i8x16_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "extmul-low-i8x16-u");

bench("i16x8.extmul_high_i8x16_s", () => {
  blackbox(i16x8.extmul_high_i8x16_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "extmul-high-i8x16-s");

bench("i16x8.extmul_high_i8x16_u", () => {
  blackbox(i16x8.extmul_high_i8x16_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i16x8", "extmul-high-i8x16-u");

bench("i16x8.shuffle", () => {
  blackbox(i16x8.shuffle(nextVecA(), nextVecB(), 0, 9, 2, 11, 4, 13, 6, 15));
}, OPS, 8);
dumpToFile("i16x8", "shuffle");

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i16x8.relaxed_laneselect", () => {
    blackbox(i16x8.relaxed_laneselect(nextVecA(), nextVecB(), nextVecM()));
  }, OPS, 24);
  dumpToFile("i16x8", "relaxed-laneselect");

  bench("i16x8.relaxed_q15mulr_s", () => {
    blackbox(i16x8.relaxed_q15mulr_s(nextVecA(), nextVecB()));
  }, OPS, 8);
  dumpToFile("i16x8", "relaxed-q15mulr-s");

  bench("i16x8.relaxed_dot_i8x16_i7x16_s", () => {
    blackbox(i16x8.relaxed_dot_i8x16_i7x16_s(nextVecA(), nextVecB()));
  }, OPS, 8);
  dumpToFile("i16x8", "relaxed-dot-i8x16-i7x16-s");
}

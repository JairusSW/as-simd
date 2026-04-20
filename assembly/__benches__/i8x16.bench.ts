import { i8x16_swar } from "../v128/i8x16";
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
  return blackbox(v128.xor(s2, i8x16.splat(0x55)));
}

// @ts-expect-error: decorator
@inline function nextA64(): u64 {
  let v = nextVecA();
  return <u64>i64x2.extract_lane(v, 0);
}

// @ts-expect-error: decorator
@inline function nextI8(): i8 {
  return <i8>(nextA64() & 0xff);
}

// @ts-expect-error: decorator
@inline function nextShift(): i32 {
  return <i32>(nextA64() & 7);
}

// @ts-expect-error: decorator
@inline function nextPtr16(): usize {
  return IO_PTR + ((nextA64() as usize) & 0x70);
}

// @ts-expect-error: decorator
@inline function nextLen16(): i32 {
  return <i32>(nextA64() & 31) - 8;
}

bench("i8x16.splat", () => {
  blackbox(i8x16.splat(nextI8()));
}, OPS, 8);
dumpToFile("i8x16", "splat");

bench("i8x16.load", () => {
  blackbox(load<v128>(nextPtr16()));
}, OPS, 16);
dumpToFile("i8x16", "load");

bench("i8x16.store", () => {
  store<v128>(nextPtr16(), nextVecA());
  blackbox(load<u64>(IO_PTR));
}, OPS, 16);
dumpToFile("i8x16", "store");

bench("i8x16.loadPartial", () => {
  blackbox(i8x16_swar.loadPartial(nextPtr16(), nextLen16(), 0, 1, nextI8()));
}, OPS, 16);
dumpToFile("i8x16", "load-partial");

bench("i8x16.storePartial", () => {
  i8x16_swar.storePartial(nextPtr16(), nextVecA(), nextLen16(), 0, 1);
  blackbox(load<u64>(IO_PTR));
}, OPS, 16);
dumpToFile("i8x16", "store-partial");

bench("i8x16.extract_lane_s", () => {
  blackbox(i8x16.extract_lane_s(nextVecA(), 7));
}, OPS, 8);
dumpToFile("i8x16", "extract-lane-s");

bench("i8x16.extract_lane_u", () => {
  blackbox(i8x16.extract_lane_u(nextVecA(), 7));
}, OPS, 8);
dumpToFile("i8x16", "extract-lane-u");

bench("i8x16.replace_lane", () => {
  blackbox(i8x16.replace_lane(nextVecA(), 7, nextI8()));
}, OPS, 8);
dumpToFile("i8x16", "replace-lane");

bench("i8x16.add", () => {
  blackbox(i8x16.add(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "add");

bench("i8x16.sub", () => {
  blackbox(i8x16.sub(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "sub");

bench("i8x16.min_s", () => {
  blackbox(i8x16.min_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "min-s");

bench("i8x16.min_u", () => {
  blackbox(i8x16.min_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "min-u");

bench("i8x16.max_s", () => {
  blackbox(i8x16.max_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "max-s");

bench("i8x16.max_u", () => {
  blackbox(i8x16.max_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "max-u");

bench("i8x16.avgr_u", () => {
  blackbox(i8x16.avgr_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "avgr-u");

bench("i8x16.abs", () => {
  blackbox(i8x16.abs(nextVecA()));
}, OPS, 8);
dumpToFile("i8x16", "abs");

bench("i8x16.neg", () => {
  blackbox(i8x16.neg(nextVecA()));
}, OPS, 8);
dumpToFile("i8x16", "neg");

bench("i8x16.add_sat_s", () => {
  blackbox(i8x16.add_sat_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "add-sat-s");

bench("i8x16.add_sat_u", () => {
  blackbox(i8x16.add_sat_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "add-sat-u");

bench("i8x16.sub_sat_s", () => {
  blackbox(i8x16.sub_sat_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "sub-sat-s");

bench("i8x16.sub_sat_u", () => {
  blackbox(i8x16.sub_sat_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "sub-sat-u");

bench("i8x16.shl", () => {
  blackbox(i8x16.shl(nextVecA(), nextShift()));
}, OPS, 8);
dumpToFile("i8x16", "shl");

bench("i8x16.shr_s", () => {
  blackbox(i8x16.shr_s(nextVecA(), nextShift()));
}, OPS, 8);
dumpToFile("i8x16", "shr-s");

bench("i8x16.shr_u", () => {
  blackbox(i8x16.shr_u(nextVecA(), nextShift()));
}, OPS, 8);
dumpToFile("i8x16", "shr-u");

bench("i8x16.all_true", () => {
  blackbox(i8x16.all_true(nextVecA()));
}, OPS, 8);
dumpToFile("i8x16", "all-true");

bench("i8x16.bitmask", () => {
  blackbox(i8x16.bitmask(nextVecA()));
}, OPS, 8);
dumpToFile("i8x16", "bitmask");

bench("i8x16.eq", () => {
  blackbox(i8x16.eq(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "eq");

bench("i8x16.ne", () => {
  blackbox(i8x16.ne(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "ne");

bench("i8x16.lt_s", () => {
  blackbox(i8x16.lt_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "lt-s");

bench("i8x16.lt_u", () => {
  blackbox(i8x16.lt_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "lt-u");

bench("i8x16.le_s", () => {
  blackbox(i8x16.le_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "le-s");

bench("i8x16.le_u", () => {
  blackbox(i8x16.le_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "le-u");

bench("i8x16.gt_s", () => {
  blackbox(i8x16.gt_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "gt-s");

bench("i8x16.gt_u", () => {
  blackbox(i8x16.gt_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "gt-u");

bench("i8x16.ge_s", () => {
  blackbox(i8x16.ge_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "ge-s");

bench("i8x16.ge_u", () => {
  blackbox(i8x16.ge_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "ge-u");

bench("i8x16.narrow_i16x8_s", () => {
  blackbox(i8x16.narrow_i16x8_s(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "narrow-i16x8-s");

bench("i8x16.narrow_i16x8_u", () => {
  blackbox(i8x16.narrow_i16x8_u(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "narrow-i16x8-u");

bench("i8x16.shuffle", () => {
  blackbox(i8x16.shuffle(
    nextVecA(), nextVecB(),
    0, 17, 2, 19, 4, 21, 6, 23,
    8, 25, 10, 27, 12, 29, 14, 31
  ));
}, OPS, 8);
dumpToFile("i8x16", "shuffle");

bench("i8x16.swizzle", () => {
  blackbox(i8x16.swizzle(nextVecA(), nextVecB()));
}, OPS, 8);
dumpToFile("i8x16", "swizzle");

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i8x16.relaxed_swizzle", () => {
    blackbox(i8x16.relaxed_swizzle(nextVecA(), nextVecB()));
  }, OPS, 8);
  dumpToFile("i8x16", "relaxed-swizzle");

  bench("i8x16.relaxed_laneselect", () => {
    blackbox(i8x16.relaxed_laneselect(nextVecA(), nextVecB(), nextVecM()));
  }, OPS, 48);
  dumpToFile("i8x16", "relaxed-laneselect");
}

bench("i8x16.popcnt", () => {
  blackbox(i8x16.popcnt(nextVecA()));
}, OPS, 8);
dumpToFile("i8x16", "popcnt");

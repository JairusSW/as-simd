// Native-SIMD half of the physically split generic-v128 benchmark suite.
import { v128_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);
const LANES_I8 = StaticArray.fromArray<u8>([15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]);
const LANES_I16 = StaticArray.fromArray<u8>([7,6,5,4,3,2,1,0]);
const LANES_I32 = StaticArray.fromArray<u8>([3,2,1,0]);
const LANES_I64 = StaticArray.fromArray<u8>([1,0]);
const BENCH_A: u64 = 0xfedcba9876543210;
const BENCH_B: u64 = 0x7766554433221100;
const BENCH_M: u64 = 0x80ff00ff80ff00ff;
const BENCH_I8: i8 = -37;
const BENCH_I16: i16 = -12345;
const BENCH_I32: i32 = -123456789;
const BENCH_I64: i64 = -81985529216486896;
const BENCH_F32: f32 = 1.25;
const BENCH_F64: f64 = 1.25;
const BENCH_F32_VEC: u64 = 0x3fa000003fa00000;
const BENCH_F64_VEC: u64 = 0x3ff4000000000000;
const BENCH_SHIFT: i32 = 3;
const BENCH_LANE16: u8 = 11;
const BENCH_LANE8: u8 = 5;
const BENCH_LANE4: u8 = 3;
const BENCH_LANE2: u8 = 1;
const BENCH_PTR: usize = IO_PTR + 0x20;
const BENCH_128_LO: u64 = 0xfedcba9876543210;
const BENCH_128_HI: u64 = 0x0123456789abcdef;

bench("v128.splat", () => { if (ASC_FEATURE_SIMD) blackbox(v128.splat<i8>(blackbox(BENCH_I8))); else { blackbox(v128_swar.splat<i8>(blackbox(BENCH_I8))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "splat");
bench("v128.extract-lane", () => { if (ASC_FEATURE_SIMD) blackbox(v128.extract_lane<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), 0)); else blackbox(v128_swar.extract_lane<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_LANE16))); }, OPS, 8); dumpToFile("v128", "extract-lane");
bench("v128.replace-lane", () => { if (ASC_FEATURE_SIMD) blackbox(v128.replace_lane<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), 0, blackbox(BENCH_I8))); else { blackbox(v128_swar.replace_lane<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_LANE16), blackbox(BENCH_I8))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "replace-lane");
bench("v128.shuffle-i8", () => { blackbox(v128_swar.shuffle<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), LANES_I8)); blackbox(v128_swar.take_hi()); }, OPS, 16); dumpToFile("v128", "shuffle-i8");
bench("v128.shuffle-i16", () => { blackbox(v128_swar.shuffle<i16>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), LANES_I16)); blackbox(v128_swar.take_hi()); }, OPS, 16); dumpToFile("v128", "shuffle-i16");
bench("v128.shuffle-i32", () => { blackbox(v128_swar.shuffle<i32>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), LANES_I32)); blackbox(v128_swar.take_hi()); }, OPS, 16); dumpToFile("v128", "shuffle-i32");
bench("v128.shuffle-i64", () => { blackbox(v128_swar.shuffle<i64>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), LANES_I64)); blackbox(v128_swar.take_hi()); }, OPS, 16); dumpToFile("v128", "shuffle-i64");
bench("v128.swizzle", () => { if (ASC_FEATURE_SIMD) blackbox(v128.swizzle(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.swizzle(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "swizzle");

bench("v128.add-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.add<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.add<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "add-i8");
bench("v128.sub-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.sub<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.sub<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "sub-i8");
bench("v128.mul-i8", () => { blackbox(v128_swar.mul<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); }, OPS, 8); dumpToFile("v128", "mul-i8");
bench("v128.div-f32", () => {
  if (ASC_FEATURE_SIMD) {
    blackbox(v128.div<f32>(v128.splat<f32>(blackbox(BENCH_F32)), v128.splat<f32>(blackbox(BENCH_F32))));
  } else {
    const aLo = v128_swar.splat<f32>(blackbox(BENCH_F32));
    const aHi = v128_swar.take_hi();
    const bLo = v128_swar.splat<f32>(blackbox(BENCH_F32));
    const bHi = v128_swar.take_hi();
    blackbox(v128_swar.div<f32>(aLo, aHi, bLo, bHi));
    blackbox(v128_swar.take_hi());
  }
}, OPS, 8);
dumpToFile("v128", "div-f32");
bench("v128.neg-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.neg<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.neg<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "neg-i8");
bench("v128.add-sat-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.add_sat<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.add_sat<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "add-sat-i8");
bench("v128.sub-sat-u8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.sub_sat<u8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.sub_sat<u8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "sub-sat-u8");
bench("v128.shl-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.shl<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(BENCH_SHIFT))); else { blackbox(v128_swar.shl<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_SHIFT))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "shl-i8");
bench("v128.shr-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.shr<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(BENCH_SHIFT))); else { blackbox(v128_swar.shr<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_SHIFT))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "shr-i8");

bench("v128.and", () => { if (ASC_FEATURE_SIMD) blackbox(v128.and(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.and(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "and");
bench("v128.or", () => { if (ASC_FEATURE_SIMD) blackbox(v128.or(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.or(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "or");
bench("v128.xor", () => { if (ASC_FEATURE_SIMD) blackbox(v128.xor(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.xor(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "xor");
bench("v128.andnot", () => { if (ASC_FEATURE_SIMD) blackbox(v128.andnot(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.andnot(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "andnot");
bench("v128.not", () => { if (ASC_FEATURE_SIMD) blackbox(v128.not(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.not(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "not");
bench("v128.bitselect", () => { if (ASC_FEATURE_SIMD) blackbox(v128.bitselect(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.bitselect(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 24); dumpToFile("v128", "bitselect");
bench("v128.any-true", () => { if (ASC_FEATURE_SIMD) blackbox(v128.any_true(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else blackbox(v128_swar.any_true(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); }, OPS, 8); dumpToFile("v128", "any-true");
bench("v128.all-true-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.all_true<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else blackbox(v128_swar.all_true<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); }, OPS, 8); dumpToFile("v128", "all-true-i8");
bench("v128.bitmask-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.bitmask<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else blackbox(v128_swar.bitmask<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); }, OPS, 8); dumpToFile("v128", "bitmask-i8");
bench("v128.popcnt-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.popcnt<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.popcnt<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "popcnt-i8");
bench("v128.min-i16", () => { if (ASC_FEATURE_SIMD) blackbox(v128.min<i16>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.min<i16>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "min-i16");
bench("v128.max-i16", () => { if (ASC_FEATURE_SIMD) blackbox(v128.max<i16>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.max<i16>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "max-i16");
bench("v128.dot-i16", () => { blackbox(v128_swar.dot<i16>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); }, OPS, 8); dumpToFile("v128", "dot-i16");
bench("v128.avgr-u8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.avgr<u8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.avgr<u8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "avgr-u8");
bench("v128.abs-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.abs<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.abs<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "abs-i8");
bench("v128.eq-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.eq<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.eq<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "eq-i8");
bench("v128.ne-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.ne<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.ne<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "ne-i8");
bench("v128.lt-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.lt<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.lt<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "lt-i8");
bench("v128.le-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.le<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.le<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "le-i8");
bench("v128.gt-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.gt<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.gt<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "gt-i8");
bench("v128.ge-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.ge<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); else { blackbox(v128_swar.ge<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "ge-i8");

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("v128.relaxed-swizzle", () => { blackbox(v128.relaxed_swizzle(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); }, OPS, 8); dumpToFile("v128", "relaxed-swizzle");
  bench("v128.relaxed-laneselect", () => { blackbox(v128.relaxed_laneselect<i8>(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)), blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)))); }, OPS, 24); dumpToFile("v128", "relaxed-laneselect");
} else {
  bench("v128.relaxed-swizzle", () => { blackbox(v128_swar.relaxed_swizzle(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); }, OPS, 8); dumpToFile("v128", "relaxed-swizzle");
  bench("v128.relaxed-laneselect", () => { blackbox(v128_swar.relaxed_laneselect<i8>(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI), blackbox(BENCH_128_LO), blackbox(BENCH_128_HI))); blackbox(v128_swar.take_hi()); }, OPS, 24); dumpToFile("v128", "relaxed-laneselect");
}

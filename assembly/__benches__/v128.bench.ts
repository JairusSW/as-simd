import { v128_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);
const LANES_I8 = StaticArray.fromArray<u8>([15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]);
const LANES_I16 = StaticArray.fromArray<u8>([7,6,5,4,3,2,1,0]);
const LANES_I32 = StaticArray.fromArray<u8>([3,2,1,0]);
const LANES_I64 = StaticArray.fromArray<u8>([1,0]);

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
@inline function nextI8(): i8 { return nextA() as i8; }
// @ts-expect-error: decorator
@inline function nextI16(): i16 { return nextA() as i16; }
// @ts-expect-error: decorator
@inline function nextI32(): i32 { return nextA() as i32; }
// @ts-expect-error: decorator
@inline function nextI64(): i64 { return nextA() as i64; }
// @ts-expect-error: decorator
@inline function nextF32(): f32 { return reinterpret<f32>(nextA() as u32); }
// @ts-expect-error: decorator
@inline function nextF64(): f64 { return reinterpret<f64>(nextA()); }
// @ts-expect-error: decorator
@inline function nextLane16(): u8 { return (nextA() & 15) as u8; }
// @ts-expect-error: decorator
@inline function nextShift8(): i32 { return (nextA() & 7) as i32; }
// @ts-expect-error: decorator
@inline function nextPtr16(): usize { return IO_PTR + ((nextA() as usize) & 0xf0); }
// @ts-expect-error: decorator
@inline function nextVec(): v128 { return bench_common.nextV128(); }

bench("v128.splat", () => { if (ASC_FEATURE_SIMD) blackbox(v128.splat<i8>(nextI8())); else { blackbox(v128_swar.splat<i8>(nextI8())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "splat");
bench("v128.extract-lane", () => { if (ASC_FEATURE_SIMD) blackbox(v128.extract_lane<i8>(nextVec(), 0)); else blackbox(v128_swar.extract_lane<i8>(next128(), next128Hi(), nextLane16())); }, OPS, 8); dumpToFile("v128", "extract-lane");
bench("v128.replace-lane", () => { if (ASC_FEATURE_SIMD) blackbox(v128.replace_lane<i8>(nextVec(), 0, nextI8())); else { blackbox(v128_swar.replace_lane<i8>(next128(), next128Hi(), nextLane16(), nextI8())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "replace-lane");
bench("v128.shuffle-i8", () => { blackbox(v128_swar.shuffle<i8>(next128(), next128Hi(), next128(), next128Hi(), LANES_I8)); blackbox(v128_swar.take_hi()); }, OPS, 16); dumpToFile("v128", "shuffle-i8");
bench("v128.shuffle-i16", () => { blackbox(v128_swar.shuffle<i16>(next128(), next128Hi(), next128(), next128Hi(), LANES_I16)); blackbox(v128_swar.take_hi()); }, OPS, 16); dumpToFile("v128", "shuffle-i16");
bench("v128.shuffle-i32", () => { blackbox(v128_swar.shuffle<i32>(next128(), next128Hi(), next128(), next128Hi(), LANES_I32)); blackbox(v128_swar.take_hi()); }, OPS, 16); dumpToFile("v128", "shuffle-i32");
bench("v128.shuffle-i64", () => { blackbox(v128_swar.shuffle<i64>(next128(), next128Hi(), next128(), next128Hi(), LANES_I64)); blackbox(v128_swar.take_hi()); }, OPS, 16); dumpToFile("v128", "shuffle-i64");
bench("v128.swizzle", () => { if (ASC_FEATURE_SIMD) blackbox(v128.swizzle(nextVec(), nextVec())); else { blackbox(v128_swar.swizzle(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "swizzle");

bench("v128.add-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.add<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.add<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "add-i8");
bench("v128.sub-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.sub<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.sub<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "sub-i8");
bench("v128.mul-i8", () => { blackbox(v128_swar.mul<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); }, OPS, 8); dumpToFile("v128", "mul-i8");
bench("v128.div-f32", () => {
  if (ASC_FEATURE_SIMD) {
    blackbox(v128.div<f32>(v128.splat<f32>(nextF32()), v128.splat<f32>(nextF32())));
  } else {
    const aLo = v128_swar.splat<f32>(nextF32());
    const aHi = v128_swar.take_hi();
    const bLo = v128_swar.splat<f32>(nextF32());
    const bHi = v128_swar.take_hi();
    blackbox(v128_swar.div<f32>(aLo, aHi, bLo, bHi));
    blackbox(v128_swar.take_hi());
  }
}, OPS, 8);
dumpToFile("v128", "div-f32");
bench("v128.neg-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.neg<i8>(nextVec())); else { blackbox(v128_swar.neg<i8>(next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "neg-i8");
bench("v128.add-sat-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.add_sat<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.add_sat<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "add-sat-i8");
bench("v128.sub-sat-u8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.sub_sat<u8>(nextVec(), nextVec())); else { blackbox(v128_swar.sub_sat<u8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "sub-sat-u8");
bench("v128.shl-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.shl<i8>(nextVec(), nextShift8())); else { blackbox(v128_swar.shl<i8>(next128(), next128Hi(), nextShift8())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "shl-i8");
bench("v128.shr-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.shr<i8>(nextVec(), nextShift8())); else { blackbox(v128_swar.shr<i8>(next128(), next128Hi(), nextShift8())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "shr-i8");

bench("v128.and", () => { if (ASC_FEATURE_SIMD) blackbox(v128.and(nextVec(), nextVec())); else { blackbox(v128_swar.and(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "and");
bench("v128.or", () => { if (ASC_FEATURE_SIMD) blackbox(v128.or(nextVec(), nextVec())); else { blackbox(v128_swar.or(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "or");
bench("v128.xor", () => { if (ASC_FEATURE_SIMD) blackbox(v128.xor(nextVec(), nextVec())); else { blackbox(v128_swar.xor(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "xor");
bench("v128.andnot", () => { if (ASC_FEATURE_SIMD) blackbox(v128.andnot(nextVec(), nextVec())); else { blackbox(v128_swar.andnot(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "andnot");
bench("v128.not", () => { if (ASC_FEATURE_SIMD) blackbox(v128.not(nextVec())); else { blackbox(v128_swar.not(next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "not");
bench("v128.bitselect", () => { if (ASC_FEATURE_SIMD) blackbox(v128.bitselect(nextVec(), nextVec(), nextVec())); else { blackbox(v128_swar.bitselect(next128(), next128Hi(), next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 24); dumpToFile("v128", "bitselect");
bench("v128.any-true", () => { if (ASC_FEATURE_SIMD) blackbox(v128.any_true(nextVec())); else blackbox(v128_swar.any_true(next128(), next128Hi())); }, OPS, 8); dumpToFile("v128", "any-true");
bench("v128.all-true-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.all_true<i8>(nextVec())); else blackbox(v128_swar.all_true<i8>(next128(), next128Hi())); }, OPS, 8); dumpToFile("v128", "all-true-i8");
bench("v128.bitmask-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.bitmask<i8>(nextVec())); else blackbox(v128_swar.bitmask<i8>(next128(), next128Hi())); }, OPS, 8); dumpToFile("v128", "bitmask-i8");
bench("v128.popcnt-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.popcnt<i8>(nextVec())); else { blackbox(v128_swar.popcnt<i8>(next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "popcnt-i8");
bench("v128.min-i16", () => { if (ASC_FEATURE_SIMD) blackbox(v128.min<i16>(nextVec(), nextVec())); else { blackbox(v128_swar.min<i16>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "min-i16");
bench("v128.max-i16", () => { if (ASC_FEATURE_SIMD) blackbox(v128.max<i16>(nextVec(), nextVec())); else { blackbox(v128_swar.max<i16>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "max-i16");
bench("v128.dot-i16", () => { blackbox(v128_swar.dot<i16>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); }, OPS, 8); dumpToFile("v128", "dot-i16");
bench("v128.avgr-u8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.avgr<u8>(nextVec(), nextVec())); else { blackbox(v128_swar.avgr<u8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "avgr-u8");
bench("v128.abs-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.abs<i8>(nextVec())); else { blackbox(v128_swar.abs<i8>(next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "abs-i8");
bench("v128.eq-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.eq<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.eq<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "eq-i8");
bench("v128.ne-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.ne<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.ne<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "ne-i8");
bench("v128.lt-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.lt<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.lt<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "lt-i8");
bench("v128.le-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.le<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.le<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "le-i8");
bench("v128.gt-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.gt<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.gt<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "gt-i8");
bench("v128.ge-i8", () => { if (ASC_FEATURE_SIMD) blackbox(v128.ge<i8>(nextVec(), nextVec())); else { blackbox(v128_swar.ge<i8>(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); } }, OPS, 8); dumpToFile("v128", "ge-i8");

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("v128.relaxed-swizzle", () => { blackbox(v128.relaxed_swizzle(nextVec(), nextVec())); }, OPS, 8); dumpToFile("v128", "relaxed-swizzle");
  bench("v128.relaxed-laneselect", () => { blackbox(v128.relaxed_laneselect<i8>(nextVec(), nextVec(), nextVec())); }, OPS, 24); dumpToFile("v128", "relaxed-laneselect");
} else {
  bench("v128.relaxed-swizzle", () => { blackbox(v128_swar.relaxed_swizzle(next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); }, OPS, 8); dumpToFile("v128", "relaxed-swizzle");
  bench("v128.relaxed-laneselect", () => { blackbox(v128_swar.relaxed_laneselect<i8>(next128(), next128Hi(), next128(), next128Hi(), next128(), next128Hi())); blackbox(v128_swar.take_hi()); }, OPS, 24); dumpToFile("v128", "relaxed-laneselect");
}

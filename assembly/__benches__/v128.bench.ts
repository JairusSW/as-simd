import { v128 } from "../v128";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = 25_000_000;
const IO_PTR: usize = memory.data(320);

const LANES_I8 = StaticArray.fromArray<u8>([15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
const LANES_I16 = StaticArray.fromArray<u8>([7, 6, 5, 4, 3, 2, 1, 0]);
const LANES_I32 = StaticArray.fromArray<u8>([3, 2, 1, 0]);
const LANES_I64 = StaticArray.fromArray<u8>([1, 0]);

// @ts-expect-error: decorator
@inline function make128(lo: u64, hi: u64): v128 {
  return i64x2(lo as i64, hi as i64);
}

let s0: v128 = make128(0x0123456789abcdef, 0x8899aabbccddeeff);
let s1: v128 = make128(0xfedcba9876543210, 0x7766554433221100);

// @ts-expect-error: decorator
@inline function next128(x: v128): v128 {
  x = v128.xor(x, i64x2.shl(x, 13));
  x = v128.xor(x, i64x2.shr_u(x, 7));
  x = v128.xor(x, i64x2.shl(x, 17));
  return x;
}

// @ts-expect-error: decorator
@inline function nextA(): v128 {
  s0 = next128(s0);
  return blackbox(s0);
}

// @ts-expect-error: decorator
@inline function nextB(): v128 {
  s1 = next128(s1);
  return blackbox(s1);
}

// @ts-expect-error: decorator
@inline function nextA64(): u64 {
  return <u64>i64x2.extract_lane(nextA(), 0);
}

// @ts-expect-error: decorator
@inline function nextPtr16(): usize {
  return IO_PTR + ((nextA64() as usize) & 0xf0);
}

// @ts-expect-error: decorator
@inline function nextI8(): i8 { return <i8>(nextA64() & 0xff); }
// @ts-expect-error: decorator
@inline function nextI16(): i16 { return <i16>(nextA64() & 0xffff); }
// @ts-expect-error: decorator
@inline function nextI32(): i32 { return <i32>(nextA64() & 0xffffffff); }
// @ts-expect-error: decorator
@inline function nextI64(): i64 { return i64x2.extract_lane(nextA(), 0); }
// @ts-expect-error: decorator
@inline function nextF32(): f32 { return reinterpret<f32>(<u32>nextA64()); }
// @ts-expect-error: decorator
@inline function nextF64(): f64 { return reinterpret<f64>(nextA64()); }
// @ts-expect-error: decorator
@inline function nextF32Vec(): v128 { return v128.splat<f32>(nextF32()); }
// @ts-expect-error: decorator
@inline function nextF64Vec(): v128 { return v128.splat<f64>(nextF64()); }
// @ts-expect-error: decorator
@inline function nextLane16(): u8 { return <u8>(nextA64() & 15); }
// @ts-expect-error: decorator
@inline function nextShift8(): i32 { return <i32>(nextA64() & 7); }

bench("v128.splat", () => { blackbox(v128.splat<i8>(nextI8())); }, OPS, 16); dumpToFile("v128", "splat");
bench("v128.extract-lane", () => { blackbox(v128.extract_lane<i8>(nextA(), nextLane16())); }, OPS, 16); dumpToFile("v128", "extract-lane");
bench("v128.replace-lane", () => { blackbox(v128.replace_lane<i8>(nextA(), nextLane16(), nextI8())); }, OPS, 16); dumpToFile("v128", "replace-lane");
bench("v128.shuffle-i8", () => { blackbox(v128.shuffle<i8>(nextA(), nextB(), LANES_I8)); }, OPS, 32); dumpToFile("v128", "shuffle-i8");
bench("v128.shuffle-i16", () => { blackbox(v128.shuffle<i16>(nextA(), nextB(), LANES_I16)); }, OPS, 32); dumpToFile("v128", "shuffle-i16");
bench("v128.shuffle-i32", () => { blackbox(v128.shuffle<i32>(nextA(), nextB(), LANES_I32)); }, OPS, 32); dumpToFile("v128", "shuffle-i32");
bench("v128.shuffle-i64", () => { blackbox(v128.shuffle<i64>(nextA(), nextB(), LANES_I64)); }, OPS, 32); dumpToFile("v128", "shuffle-i64");
bench("v128.swizzle", () => { blackbox(v128.swizzle(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "swizzle");

bench("v128.load", () => { blackbox(v128.load(nextPtr16())); }, OPS, 16); dumpToFile("v128", "load");
bench("v128.load-partial", () => { blackbox(v128.loadPartial(nextPtr16(), <i32>(nextA64() & 31) - 8)); }, OPS, 16); dumpToFile("v128", "load-partial");
bench("v128.store", () => { v128.store(nextPtr16(), nextA()); blackbox(v128.load(IO_PTR)); }, OPS, 16); dumpToFile("v128", "store");
bench("v128.store-partial", () => { v128.storePartial(nextPtr16(), nextA(), <i32>(nextA64() & 31) - 8); blackbox(v128.load(IO_PTR)); }, OPS, 16); dumpToFile("v128", "store-partial");
bench("v128.load-ext", () => { blackbox(v128.load_ext<i8>(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load-ext");
bench("v128.load-zero", () => { blackbox(v128.load_zero<i16>(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load-zero");
bench("v128.load-lane", () => { blackbox(v128.load_lane<i8>(nextPtr16(), nextA(), nextLane16())); }, OPS, 16); dumpToFile("v128", "load-lane");
bench("v128.store-lane", () => { v128.store_lane<i8>(nextPtr16(), nextA(), nextLane16()); blackbox(v128.load(IO_PTR)); }, OPS, 16); dumpToFile("v128", "store-lane");
bench("v128.load8x8-s", () => { blackbox(v128.load8x8_s(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load8x8-s");
bench("v128.load8x8-u", () => { blackbox(v128.load8x8_u(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load8x8-u");
bench("v128.load16x4-s", () => { blackbox(v128.load16x4_s(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load16x4-s");
bench("v128.load16x4-u", () => { blackbox(v128.load16x4_u(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load16x4-u");
bench("v128.load32x2-s", () => { blackbox(v128.load32x2_s(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load32x2-s");
bench("v128.load32x2-u", () => { blackbox(v128.load32x2_u(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load32x2-u");
bench("v128.load-splat", () => { blackbox(v128.load_splat<i8>(nextPtr16())); }, OPS, 1); dumpToFile("v128", "load-splat");
bench("v128.load8-splat", () => { blackbox(v128.load8_splat(nextPtr16())); }, OPS, 1); dumpToFile("v128", "load8-splat");
bench("v128.load16-splat", () => { blackbox(v128.load16_splat(nextPtr16())); }, OPS, 2); dumpToFile("v128", "load16-splat");
bench("v128.load32-splat", () => { blackbox(v128.load32_splat(nextPtr16())); }, OPS, 4); dumpToFile("v128", "load32-splat");
bench("v128.load64-splat", () => { blackbox(v128.load64_splat(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load64-splat");
bench("v128.load32-zero", () => { blackbox(v128.load32_zero(nextPtr16())); }, OPS, 4); dumpToFile("v128", "load32-zero");
bench("v128.load64-zero", () => { blackbox(v128.load64_zero(nextPtr16())); }, OPS, 8); dumpToFile("v128", "load64-zero");
bench("v128.load8-lane", () => { blackbox(v128.load8_lane(nextPtr16(), nextA(), nextLane16())); }, OPS, 1); dumpToFile("v128", "load8-lane");
bench("v128.load16-lane", () => { blackbox(v128.load16_lane(nextPtr16(), nextA(), nextLane16() & 7)); }, OPS, 2); dumpToFile("v128", "load16-lane");
bench("v128.load32-lane", () => { blackbox(v128.load32_lane(nextPtr16(), nextA(), nextLane16() & 3)); }, OPS, 4); dumpToFile("v128", "load32-lane");
bench("v128.load64-lane", () => { blackbox(v128.load64_lane(nextPtr16(), nextA(), nextLane16() & 1)); }, OPS, 8); dumpToFile("v128", "load64-lane");
bench("v128.store8-lane", () => { v128.store8_lane(nextPtr16(), nextA(), nextLane16()); blackbox(v128.load(IO_PTR)); }, OPS, 1); dumpToFile("v128", "store8-lane");
bench("v128.store16-lane", () => { v128.store16_lane(nextPtr16(), nextA(), nextLane16() & 7); blackbox(v128.load(IO_PTR)); }, OPS, 2); dumpToFile("v128", "store16-lane");
bench("v128.store32-lane", () => { v128.store32_lane(nextPtr16(), nextA(), nextLane16() & 3); blackbox(v128.load(IO_PTR)); }, OPS, 4); dumpToFile("v128", "store32-lane");
bench("v128.store64-lane", () => { v128.store64_lane(nextPtr16(), nextA(), nextLane16() & 1); blackbox(v128.load(IO_PTR)); }, OPS, 8); dumpToFile("v128", "store64-lane");

bench("v128.add-i8", () => { blackbox(v128.add<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "add-i8");
bench("v128.sub-i8", () => { blackbox(v128.sub<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "sub-i8");
bench("v128.mul-i8", () => { blackbox(v128.mul<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "mul-i8");
bench("v128.div-f32", () => { blackbox(v128.div<f32>(nextF32Vec(), nextF32Vec())); }, OPS, 16); dumpToFile("v128", "div-f32");
bench("v128.neg-i8", () => { blackbox(v128.neg<i8>(nextA())); }, OPS, 16); dumpToFile("v128", "neg-i8");
bench("v128.add-sat-i8", () => { blackbox(v128.add_sat<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "add-sat-i8");
bench("v128.sub-sat-u8", () => { blackbox(v128.sub_sat<u8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "sub-sat-u8");
bench("v128.shl-i8", () => { blackbox(v128.shl<i8>(nextA(), nextShift8())); }, OPS, 16); dumpToFile("v128", "shl-i8");
bench("v128.shr-i8", () => { blackbox(v128.shr<i8>(nextA(), nextShift8())); }, OPS, 16); dumpToFile("v128", "shr-i8");
bench("v128.and", () => { blackbox(v128.and(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "and");
bench("v128.or", () => { blackbox(v128.or(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "or");
bench("v128.xor", () => { blackbox(v128.xor(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "xor");
bench("v128.andnot", () => { blackbox(v128.andnot(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "andnot");
bench("v128.not", () => { blackbox(v128.not(nextA())); }, OPS, 16); dumpToFile("v128", "not");
bench("v128.bitselect", () => { blackbox(v128.bitselect(nextA(), nextB(), nextA())); }, OPS, 48); dumpToFile("v128", "bitselect");
bench("v128.any-true", () => { blackbox(v128.any_true(nextA())); }, OPS, 16); dumpToFile("v128", "any-true");
bench("v128.all-true-i8", () => { blackbox(v128.all_true<i8>(nextA())); }, OPS, 16); dumpToFile("v128", "all-true-i8");
bench("v128.bitmask-i8", () => { blackbox(v128.bitmask<i8>(nextA())); }, OPS, 16); dumpToFile("v128", "bitmask-i8");
bench("v128.popcnt-i8", () => { blackbox(v128.popcnt<i8>(nextA())); }, OPS, 16); dumpToFile("v128", "popcnt-i8");
bench("v128.min-i16", () => { blackbox(v128.min<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "min-i16");
bench("v128.max-i16", () => { blackbox(v128.max<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "max-i16");
bench("v128.pmin-i16", () => { blackbox(v128.pmin<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "pmin-i16");
bench("v128.pmax-i16", () => { blackbox(v128.pmax<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "pmax-i16");
bench("v128.dot-i16", () => { blackbox(v128.dot<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "dot-i16");
bench("v128.avgr-u8", () => { blackbox(v128.avgr<u8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "avgr-u8");
bench("v128.abs-i8", () => { blackbox(v128.abs<i8>(nextA())); }, OPS, 16); dumpToFile("v128", "abs-i8");
bench("v128.sqrt-f32", () => { blackbox(v128.sqrt<f32>(nextF32Vec())); }, OPS, 16); dumpToFile("v128", "sqrt-f32");
bench("v128.ceil-f32", () => { blackbox(v128.ceil<f32>(nextF32Vec())); }, OPS, 16); dumpToFile("v128", "ceil-f32");
bench("v128.floor-f32", () => { blackbox(v128.floor<f32>(nextF32Vec())); }, OPS, 16); dumpToFile("v128", "floor-f32");
bench("v128.trunc-f32", () => { blackbox(v128.trunc<f32>(nextF32Vec())); }, OPS, 16); dumpToFile("v128", "trunc-f32");
bench("v128.nearest-f32", () => { blackbox(v128.nearest<f32>(nextF32Vec())); }, OPS, 16); dumpToFile("v128", "nearest-f32");
bench("v128.eq-i8", () => { blackbox(v128.eq<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "eq-i8");
bench("v128.ne-i8", () => { blackbox(v128.ne<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "ne-i8");
bench("v128.lt-i8", () => { blackbox(v128.lt<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "lt-i8");
bench("v128.le-i8", () => { blackbox(v128.le<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "le-i8");
bench("v128.gt-i8", () => { blackbox(v128.gt<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "gt-i8");
bench("v128.ge-i8", () => { blackbox(v128.ge<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "ge-i8");
bench("v128.convert-i32", () => { blackbox(v128.convert<i32>(nextA())); }, OPS, 16); dumpToFile("v128", "convert-i32");
bench("v128.convert-low-i32", () => { blackbox(v128.convert_low<i32>(nextA())); }, OPS, 16); dumpToFile("v128", "convert-low-i32");
bench("v128.trunc-sat-i32", () => { blackbox(v128.trunc_sat<i32>(nextF32Vec())); }, OPS, 16); dumpToFile("v128", "trunc-sat-i32");
bench("v128.trunc-sat-zero-i32", () => { blackbox(v128.trunc_sat_zero<i32>(nextF64Vec())); }, OPS, 16); dumpToFile("v128", "trunc-sat-zero-i32");
bench("v128.narrow-i16", () => { blackbox(v128.narrow<i16>(nextA(), nextB())); }, OPS, 32); dumpToFile("v128", "narrow-i16");
bench("v128.extend-low-i8", () => { blackbox(v128.extend_low<i8>(nextA())); }, OPS, 16); dumpToFile("v128", "extend-low-i8");
bench("v128.extend-high-i8", () => { blackbox(v128.extend_high<i8>(nextA())); }, OPS, 16); dumpToFile("v128", "extend-high-i8");
bench("v128.extadd-pairwise-i8", () => { blackbox(v128.extadd_pairwise<i8>(nextA())); }, OPS, 16); dumpToFile("v128", "extadd-pairwise-i8");
bench("v128.demote-zero", () => { blackbox(v128.demote_zero<f64>(nextF64Vec())); }, OPS, 16); dumpToFile("v128", "demote-zero");
bench("v128.promote-low", () => { blackbox(v128.promote_low<f32>(nextF32Vec())); }, OPS, 16); dumpToFile("v128", "promote-low");
bench("v128.q15mulr-sat", () => { blackbox(v128.q15mulr_sat<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "q15mulr-sat");
bench("v128.extmul-low-i8", () => { blackbox(v128.extmul_low<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "extmul-low-i8");
bench("v128.extmul-high-i8", () => { blackbox(v128.extmul_high<i8>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "extmul-high-i8");
bench("v128.relaxed-swizzle", () => { blackbox(v128.relaxed_swizzle(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "relaxed-swizzle");
bench("v128.relaxed-trunc", () => { blackbox(v128.relaxed_trunc<i32>(nextF32Vec())); }, OPS, 16); dumpToFile("v128", "relaxed-trunc");
bench("v128.relaxed-trunc-zero", () => { blackbox(v128.relaxed_trunc_zero<i32>(nextF64Vec())); }, OPS, 16); dumpToFile("v128", "relaxed-trunc-zero");
bench("v128.relaxed-madd", () => { blackbox(v128.relaxed_madd<i8>(nextA(), nextB(), nextA())); }, OPS, 48); dumpToFile("v128", "relaxed-madd");
bench("v128.relaxed-nmadd", () => { blackbox(v128.relaxed_nmadd<i8>(nextA(), nextB(), nextA())); }, OPS, 48); dumpToFile("v128", "relaxed-nmadd");
bench("v128.relaxed-laneselect", () => { blackbox(v128.relaxed_laneselect<i8>(nextA(), nextB(), nextA())); }, OPS, 48); dumpToFile("v128", "relaxed-laneselect");
bench("v128.relaxed-min", () => { blackbox(v128.relaxed_min<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "relaxed-min");
bench("v128.relaxed-max", () => { blackbox(v128.relaxed_max<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "relaxed-max");
bench("v128.relaxed-q15mulr", () => { blackbox(v128.relaxed_q15mulr<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "relaxed-q15mulr");
bench("v128.relaxed-dot", () => { blackbox(v128.relaxed_dot<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v128", "relaxed-dot");
bench("v128.relaxed-dot-add", () => { blackbox(v128.relaxed_dot_add<i16>(nextA(), nextB(), nextA())); }, OPS, 48); dumpToFile("v128", "relaxed-dot-add");

import { v64 } from "../v64/v64";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);

const LANES_I8 = StaticArray.fromArray<u8>([7, 6, 5, 4, 3, 2, 1, 0]);
const LANES_I16 = StaticArray.fromArray<u8>([3, 2, 1, 0]);
const LANES_I32 = StaticArray.fromArray<u8>([1, 0]);
const LANES_I64 = StaticArray.fromArray<u8>([0]);

// @ts-expect-error: decorator
@inline function next64(): u64 { return bench_common.next64(); }

// @ts-expect-error: decorator
@inline function next128(): u64 { return bench_common.next128(); }

// @ts-expect-error: decorator
@inline function next128Hi(): u64 { return bench_common.next128Hi(); }

// @ts-expect-error: decorator
@inline function nextA(): v64 {
  return blackbox(next64());
}

// @ts-expect-error: decorator
@inline function nextB(): v64 {
  return blackbox(bench_common.next64Alt());
}

// @ts-expect-error: decorator
@inline function nextU8(): u8 { return <u8>(nextA() & 0xff); }
// @ts-expect-error: decorator
@inline function nextI8(): i8 { return <i8>nextU8(); }
// @ts-expect-error: decorator
@inline function nextU16(): u16 { return <u16>(nextA() & 0xffff); }
// @ts-expect-error: decorator
@inline function nextI16(): i16 { return <i16>nextU16(); }
// @ts-expect-error: decorator
@inline function nextU32(): u32 { return <u32>(nextA() & 0xffffffff); }
// @ts-expect-error: decorator
@inline function nextI32(): i32 { return <i32>nextU32(); }
// @ts-expect-error: decorator
@inline function nextI64(): i64 { return nextA() as i64; }
// @ts-expect-error: decorator
@inline function nextF32(): f32 { return reinterpret<f32>(nextU32()); }
// @ts-expect-error: decorator
@inline function nextF64(): f64 { return reinterpret<f64>(nextA()); }
// @ts-expect-error: decorator
@inline function nextF32Vec(): v64 { return v64.splat<f32>(nextF32()); }
// @ts-expect-error: decorator
@inline function nextF64Vec(): v64 { return v64.splat<f64>(nextF64()); }
// @ts-expect-error: decorator
@inline function nextPtr8(): usize { return IO_PTR + ((nextA() as usize) & 0xf8); }
// @ts-expect-error: decorator
@inline function nextShift8(): i32 { return <i32>(nextA() & 7); }
// @ts-expect-error: decorator
@inline function nextLane8(): u8 { return <u8>(nextA() & 7); }
// @ts-expect-error: decorator
@inline function nextLane4(): u8 { return <u8>(nextA() & 3); }
// @ts-expect-error: decorator
@inline function nextLane2(): u8 { return <u8>(nextA() & 1); }

bench("v64.ctor", () => { blackbox(v64(nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8(), nextI8())); }, OPS, 8); dumpToFile("v64", "ctor");

bench("v64.splat", () => { blackbox(v64.splat<i8>(nextI8())); }, OPS, 8); dumpToFile("v64", "splat");
bench("v64.extract-lane", () => { blackbox(v64.extract_lane<i8>(nextA(), nextLane8())); }, OPS, 8); dumpToFile("v64", "extract-lane");
bench("v64.replace-lane", () => { blackbox(v64.replace_lane<i8>(nextA(), nextLane8(), nextI8())); }, OPS, 8); dumpToFile("v64", "replace-lane");
bench("v64.shuffle-i8", () => { blackbox(v64.shuffle<i8>(nextA(), nextB(), LANES_I8)); }, OPS, 16); dumpToFile("v64", "shuffle-i8");
bench("v64.shuffle-i16", () => { blackbox(v64.shuffle<i16>(nextA(), nextB(), LANES_I16)); }, OPS, 16); dumpToFile("v64", "shuffle-i16");
bench("v64.shuffle-i32", () => { blackbox(v64.shuffle<i32>(nextA(), nextB(), LANES_I32)); }, OPS, 16); dumpToFile("v64", "shuffle-i32");
bench("v64.shuffle-i64", () => { blackbox(v64.shuffle<i64>(nextA(), nextB(), LANES_I64)); }, OPS, 16); dumpToFile("v64", "shuffle-i64");
bench("v64.swizzle", () => { blackbox(v64.swizzle(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "swizzle");

bench("v64.load", () => { blackbox(v64.load(nextPtr8())); }, OPS, 8); dumpToFile("v64", "load");
bench("v64.load-ext", () => { blackbox(v64.load_ext<i8>(nextPtr8())); }, OPS, 8); dumpToFile("v64", "load-ext");
bench("v64.load-zero", () => { blackbox(v64.load_zero<i16>(nextPtr8())); }, OPS, 8); dumpToFile("v64", "load-zero");
bench("v64.load-lane", () => { blackbox(v64.load_lane<i8>(nextPtr8(), nextA(), nextLane8())); }, OPS, 8); dumpToFile("v64", "load-lane");
bench("v64.store-lane", () => { v64.store_lane<i8>(nextPtr8(), nextA(), nextLane8()); blackbox(v64.load(IO_PTR)); }, OPS, 8); dumpToFile("v64", "store-lane");
bench("v64.load8x4-s", () => { blackbox(v64.load8x4_s(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load8x4-s");
bench("v64.load8x4-u", () => { blackbox(v64.load8x4_u(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load8x4-u");
bench("v64.load16x2-s", () => { blackbox(v64.load16x2_s(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load16x2-s");
bench("v64.load16x2-u", () => { blackbox(v64.load16x2_u(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load16x2-u");
bench("v64.load32x1-s", () => { blackbox(v64.load32x1_s(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load32x1-s");
bench("v64.load32x1-u", () => { blackbox(v64.load32x1_u(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load32x1-u");
bench("v64.load8x8-s", () => { blackbox(v64.load8x8_s(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load8x8-s");
bench("v64.load8x8-u", () => { blackbox(v64.load8x8_u(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load8x8-u");
bench("v64.load16x4-s", () => { blackbox(v64.load16x4_s(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load16x4-s");
bench("v64.load16x4-u", () => { blackbox(v64.load16x4_u(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load16x4-u");
bench("v64.load32x2-s", () => { blackbox(v64.load32x2_s(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load32x2-s");
bench("v64.load32x2-u", () => { blackbox(v64.load32x2_u(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load32x2-u");
bench("v64.load-splat", () => { blackbox(v64.load_splat<i8>(nextPtr8())); }, OPS, 1); dumpToFile("v64", "load-splat");
bench("v64.load8-splat", () => { blackbox(v64.load8_splat(nextPtr8())); }, OPS, 1); dumpToFile("v64", "load8-splat");
bench("v64.load16-splat", () => { blackbox(v64.load16_splat(nextPtr8())); }, OPS, 2); dumpToFile("v64", "load16-splat");
bench("v64.load32-splat", () => { blackbox(v64.load32_splat(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load32-splat");
bench("v64.load64-splat", () => { blackbox(v64.load64_splat(nextPtr8())); }, OPS, 8); dumpToFile("v64", "load64-splat");
bench("v64.load32-zero", () => { blackbox(v64.load32_zero(nextPtr8())); }, OPS, 4); dumpToFile("v64", "load32-zero");
bench("v64.load64-zero", () => { blackbox(v64.load64_zero(nextPtr8())); }, OPS, 8); dumpToFile("v64", "load64-zero");
bench("v64.load8-lane", () => { blackbox(v64.load8_lane(nextPtr8(), nextA(), nextLane8())); }, OPS, 1); dumpToFile("v64", "load8-lane");
bench("v64.load16-lane", () => { blackbox(v64.load16_lane(nextPtr8(), nextA(), nextLane4())); }, OPS, 2); dumpToFile("v64", "load16-lane");
bench("v64.load32-lane", () => { blackbox(v64.load32_lane(nextPtr8(), nextA(), nextLane2())); }, OPS, 4); dumpToFile("v64", "load32-lane");
bench("v64.load64-lane", () => { blackbox(v64.load64_lane(nextPtr8(), nextA(), 0)); }, OPS, 8); dumpToFile("v64", "load64-lane");
bench("v64.store8-lane", () => { v64.store8_lane(nextPtr8(), nextA(), nextLane8()); blackbox(v64.load(IO_PTR)); }, OPS, 1); dumpToFile("v64", "store8-lane");
bench("v64.store16-lane", () => { v64.store16_lane(nextPtr8(), nextA(), nextLane4()); blackbox(v64.load(IO_PTR)); }, OPS, 2); dumpToFile("v64", "store16-lane");
bench("v64.store32-lane", () => { v64.store32_lane(nextPtr8(), nextA(), nextLane2()); blackbox(v64.load(IO_PTR)); }, OPS, 4); dumpToFile("v64", "store32-lane");
bench("v64.store64-lane", () => { v64.store64_lane(nextPtr8(), nextA(), 0); blackbox(v64.load(IO_PTR)); }, OPS, 8); dumpToFile("v64", "store64-lane");
bench("v64.store", () => { v64.store(nextPtr8(), nextA()); blackbox(v64.load(IO_PTR)); }, OPS, 8); dumpToFile("v64", "store");

bench("v64.add-i8", () => { blackbox(v64.add<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "add-i8");
bench("v64.sub-i8", () => { blackbox(v64.sub<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "sub-i8");
bench("v64.mul-i8", () => { blackbox(v64.mul<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "mul-i8");
bench("v64.div-f32", () => { blackbox(v64.div<f32>(nextF32Vec(), nextF32Vec())); }, OPS, 8); dumpToFile("v64", "div-f32");
bench("v64.neg-i8", () => { blackbox(v64.neg<i8>(nextA())); }, OPS, 8); dumpToFile("v64", "neg-i8");
bench("v64.add-sat-i8", () => { blackbox(v64.add_sat<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "add-sat-i8");
bench("v64.sub-sat-u8", () => { blackbox(v64.sub_sat<u8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "sub-sat-u8");
bench("v64.shl-i8", () => { blackbox(v64.shl<i8>(nextA(), nextShift8())); }, OPS, 8); dumpToFile("v64", "shl-i8");
bench("v64.shr-i8", () => { blackbox(v64.shr<i8>(nextA(), nextShift8())); }, OPS, 8); dumpToFile("v64", "shr-i8");
bench("v64.and", () => { blackbox(v64.and(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "and");
bench("v64.or", () => { blackbox(v64.or(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "or");
bench("v64.xor", () => { blackbox(v64.xor(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "xor");
bench("v64.andnot", () => { blackbox(v64.andnot(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "andnot");
bench("v64.not", () => { blackbox(v64.not(nextA())); }, OPS, 8); dumpToFile("v64", "not");
bench("v64.bitselect", () => { blackbox(v64.bitselect(nextA(), nextB(), nextA())); }, OPS, 24); dumpToFile("v64", "bitselect");
bench("v64.any-true", () => { blackbox(v64.any_true(nextA())); }, OPS, 8); dumpToFile("v64", "any-true");
bench("v64.all-true-i8", () => { blackbox(v64.all_true<i8>(nextA())); }, OPS, 8); dumpToFile("v64", "all-true-i8");
bench("v64.bitmask-i8", () => { blackbox(v64.bitmask<i8>(nextA())); }, OPS, 8); dumpToFile("v64", "bitmask-i8");
bench("v64.popcnt-i8", () => { blackbox(v64.popcnt<i8>(nextA())); }, OPS, 8); dumpToFile("v64", "popcnt-i8");
bench("v64.min-i16", () => { blackbox(v64.min<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "min-i16");
bench("v64.max-i16", () => { blackbox(v64.max<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "max-i16");
bench("v64.pmin-i16", () => { blackbox(v64.pmin<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "pmin-i16");
bench("v64.pmax-i16", () => { blackbox(v64.pmax<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "pmax-i16");
bench("v64.dot-i16", () => { blackbox(v64.dot<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "dot-i16");
bench("v64.avgr-u8", () => { blackbox(v64.avgr<u8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "avgr-u8");
bench("v64.abs-i8", () => { blackbox(v64.abs<i8>(nextA())); }, OPS, 8); dumpToFile("v64", "abs-i8");
bench("v64.sqrt-f32", () => { blackbox(v64.sqrt<f32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "sqrt-f32");
bench("v64.ceil-f32", () => { blackbox(v64.ceil<f32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "ceil-f32");
bench("v64.floor-f32", () => { blackbox(v64.floor<f32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "floor-f32");
bench("v64.trunc-f32", () => { blackbox(v64.trunc<f32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "trunc-f32");
bench("v64.nearest-f32", () => { blackbox(v64.nearest<f32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "nearest-f32");
bench("v64.eq-i8", () => { blackbox(v64.eq<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "eq-i8");
bench("v64.ne-i8", () => { blackbox(v64.ne<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "ne-i8");
bench("v64.lt-i8", () => { blackbox(v64.lt<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "lt-i8");
bench("v64.le-i8", () => { blackbox(v64.le<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "le-i8");
bench("v64.gt-i8", () => { blackbox(v64.gt<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "gt-i8");
bench("v64.ge-i8", () => { blackbox(v64.ge<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "ge-i8");
bench("v64.convert-i32", () => { blackbox(v64.convert<i32>(nextA())); }, OPS, 8); dumpToFile("v64", "convert-i32");
bench("v64.convert-low-i32", () => { blackbox(v64.convert_low<i32>(nextA())); }, OPS, 8); dumpToFile("v64", "convert-low-i32");
bench("v64.trunc-sat-i32", () => { blackbox(v64.trunc_sat<i32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "trunc-sat-i32");
bench("v64.trunc-sat-zero-i32", () => { blackbox(v64.trunc_sat_zero<i32>(nextF64Vec())); }, OPS, 8); dumpToFile("v64", "trunc-sat-zero-i32");
bench("v64.narrow-i16", () => { blackbox(v64.narrow<i16>(nextA(), nextB())); }, OPS, 16); dumpToFile("v64", "narrow-i16");
bench("v64.extend-low-i8", () => { blackbox(v64.extend_low<i8>(nextA())); }, OPS, 8); dumpToFile("v64", "extend-low-i8");
bench("v64.extend-high-i8", () => { blackbox(v64.extend_high<i8>(nextA())); }, OPS, 8); dumpToFile("v64", "extend-high-i8");
bench("v64.extadd-pairwise-i8", () => { blackbox(v64.extadd_pairwise<i8>(nextA())); }, OPS, 8); dumpToFile("v64", "extadd-pairwise-i8");
bench("v64.demote-zero", () => { blackbox(v64.demote_zero<f64>(nextF64Vec())); }, OPS, 8); dumpToFile("v64", "demote-zero");
bench("v64.promote-low", () => { blackbox(v64.promote_low<f32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "promote-low");
bench("v64.q15mulr-sat", () => { blackbox(v64.q15mulr_sat<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "q15mulr-sat");
bench("v64.extmul-low-i8", () => { blackbox(v64.extmul_low<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "extmul-low-i8");
bench("v64.extmul-high-i8", () => { blackbox(v64.extmul_high<i8>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "extmul-high-i8");
if (ASC_FEATURE_RELAXED_SIMD) {
  bench("v64.relaxed-swizzle", () => { blackbox(v64.relaxed_swizzle(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-swizzle");
  bench("v64.relaxed-trunc", () => { blackbox(v64.relaxed_trunc<i32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "relaxed-trunc");
  bench("v64.relaxed-trunc-zero", () => { blackbox(v64.relaxed_trunc_zero<i32>(nextF64Vec())); }, OPS, 8); dumpToFile("v64", "relaxed-trunc-zero");
  bench("v64.relaxed-madd", () => { blackbox(v64.relaxed_madd<i8>(nextA(), nextB(), nextA())); }, OPS, 24); dumpToFile("v64", "relaxed-madd");
  bench("v64.relaxed-nmadd", () => { blackbox(v64.relaxed_nmadd<i8>(nextA(), nextB(), nextA())); }, OPS, 24); dumpToFile("v64", "relaxed-nmadd");
  bench("v64.relaxed-laneselect", () => { blackbox(v64.relaxed_laneselect<i8>(nextA(), nextB(), nextA())); }, OPS, 24); dumpToFile("v64", "relaxed-laneselect");
  bench("v64.relaxed-min", () => { blackbox(v64.relaxed_min<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-min");
  bench("v64.relaxed-max", () => { blackbox(v64.relaxed_max<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-max");
  bench("v64.relaxed-q15mulr", () => { blackbox(v64.relaxed_q15mulr<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-q15mulr");
  bench("v64.relaxed-dot", () => { blackbox(v64.relaxed_dot<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-dot");
  bench("v64.relaxed-dot-add", () => { blackbox(v64.relaxed_dot_add<i16>(nextA(), nextB(), nextA())); }, OPS, 24); dumpToFile("v64", "relaxed-dot-add");
} else {
  bench("v64.relaxed-swizzle", () => { blackbox(v64.swizzle(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-swizzle");
  bench("v64.relaxed-trunc", () => { blackbox(v64.trunc_sat<i32>(nextF32Vec())); }, OPS, 8); dumpToFile("v64", "relaxed-trunc");
  bench("v64.relaxed-trunc-zero", () => { blackbox(v64.trunc_sat_zero<i32>(nextF64Vec())); }, OPS, 8); dumpToFile("v64", "relaxed-trunc-zero");
  bench("v64.relaxed-madd", () => { blackbox(v64.add<i8>(v64.mul<i8>(nextA(), nextB()), nextA())); }, OPS, 24); dumpToFile("v64", "relaxed-madd");
  bench("v64.relaxed-nmadd", () => { blackbox(v64.add<i8>(v64.neg<i8>(v64.mul<i8>(nextA(), nextB())), nextA())); }, OPS, 24); dumpToFile("v64", "relaxed-nmadd");
  bench("v64.relaxed-laneselect", () => { blackbox(v64.bitselect(nextA(), nextB(), nextA())); }, OPS, 24); dumpToFile("v64", "relaxed-laneselect");
  bench("v64.relaxed-min", () => { blackbox(v64.min<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-min");
  bench("v64.relaxed-max", () => { blackbox(v64.max<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-max");
  bench("v64.relaxed-q15mulr", () => { blackbox(v64.q15mulr_sat<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-q15mulr");
  bench("v64.relaxed-dot", () => { blackbox(v64.dot<i16>(nextA(), nextB())); }, OPS, 8); dumpToFile("v64", "relaxed-dot");
  bench("v64.relaxed-dot-add", () => { blackbox(v64.add<i32>(v64.dot<i16>(nextA(), nextB()), nextA())); }, OPS, 24); dumpToFile("v64", "relaxed-dot-add");
}

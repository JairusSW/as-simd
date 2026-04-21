import { i32x4_swar } from "../v128/i32x4";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = 25_000_000;

// @ts-expect-error: decorator
@inline function make128(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }

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
@inline function nextVecA(): v128 { s0 = next128(s0); s1 = next128(s1); return blackbox(v128.xor(s0, i64x2.shr_u(s1, 17))); }
// @ts-expect-error: decorator
@inline function nextVecB(): v128 { s1 = next128(s1); s2 = next128(s2); return blackbox(v128.xor(s1, i64x2.shl(s2, 13))); }
// @ts-expect-error: decorator
@inline function nextVecM(): v128 { s2 = next128(s2); return blackbox(v128.xor(s2, i32x4.splat(0x55555555))); }
// @ts-expect-error: decorator
@inline function nextA64(): u64 { return <u64>i64x2.extract_lane(nextVecA(), 0); }
// @ts-expect-error: decorator
@inline function nextI32(): i32 { return <i32>nextA64(); }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return <i32>(nextA64() & 31); }
// @ts-expect-error: decorator
@inline function nextPtr16(): usize { return IO_PTR + ((nextA64() as usize) & 0x70); }
// @ts-expect-error: decorator
@inline function nextLen4(): i32 { return <i32>(nextA64() & 7) - 2; }

bench("i32x4.splat", () => { blackbox(i32x4.splat(nextI32())); }, OPS, 8); dumpToFile("i32x4", "splat");
bench("i32x4.load", () => { blackbox(load<v128>(nextPtr16())); }, OPS, 16); dumpToFile("i32x4", "load");
bench("i32x4.store", () => { store<v128>(nextPtr16(), nextVecA()); blackbox(load<u64>(IO_PTR)); }, OPS, 16); dumpToFile("i32x4", "store");
bench("i32x4.loadPartial", () => { blackbox(i32x4_swar.loadPartial(nextPtr16(), nextLen4(), 0, 4, nextI32())); }, OPS, 16); dumpToFile("i32x4", "load-partial");
bench("i32x4.storePartial", () => { i32x4_swar.storePartial(nextPtr16(), nextVecA(), nextLen4(), 0, 4); blackbox(load<u64>(IO_PTR)); }, OPS, 16); dumpToFile("i32x4", "store-partial");
bench("i32x4.extract_lane", () => { blackbox(i32x4.extract_lane(nextVecA(), 1)); }, OPS, 8); dumpToFile("i32x4", "extract-lane");
bench("i32x4.replace_lane", () => { blackbox(i32x4.replace_lane(nextVecA(), 1, nextI32())); }, OPS, 8); dumpToFile("i32x4", "replace-lane");
bench("i32x4.add", () => { blackbox(i32x4.add(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "add");
bench("i32x4.sub", () => { blackbox(i32x4.sub(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "sub");
bench("i32x4.mul", () => { blackbox(i32x4.mul(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "mul");
bench("i32x4.min_s", () => { blackbox(i32x4.min_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "min-s");
bench("i32x4.min_u", () => { blackbox(i32x4.min_u(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "min-u");
bench("i32x4.max_s", () => { blackbox(i32x4.max_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "max-s");
bench("i32x4.max_u", () => { blackbox(i32x4.max_u(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "max-u");
bench("i32x4.dot_i16x8_s", () => { blackbox(i32x4.dot_i16x8_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "dot-i16x8-s");
bench("i32x4.abs", () => { blackbox(i32x4.abs(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "abs");
bench("i32x4.neg", () => { blackbox(i32x4.neg(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "neg");
bench("i32x4.shl", () => { blackbox(i32x4.shl(nextVecA(), nextShift())); }, OPS, 8); dumpToFile("i32x4", "shl");
bench("i32x4.shr_s", () => { blackbox(i32x4.shr_s(nextVecA(), nextShift())); }, OPS, 8); dumpToFile("i32x4", "shr-s");
bench("i32x4.shr_u", () => { blackbox(i32x4.shr_u(nextVecA(), nextShift())); }, OPS, 8); dumpToFile("i32x4", "shr-u");
bench("i32x4.all_true", () => { blackbox(i32x4.all_true(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "all-true");
bench("i32x4.bitmask", () => { blackbox(i32x4.bitmask(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "bitmask");
bench("i32x4.eq", () => { blackbox(i32x4.eq(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "eq");
bench("i32x4.ne", () => { blackbox(i32x4.ne(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "ne");
bench("i32x4.lt_s", () => { blackbox(i32x4.lt_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "lt-s");
bench("i32x4.lt_u", () => { blackbox(i32x4.lt_u(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "lt-u");
bench("i32x4.le_s", () => { blackbox(i32x4.le_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "le-s");
bench("i32x4.le_u", () => { blackbox(i32x4.le_u(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "le-u");
bench("i32x4.gt_s", () => { blackbox(i32x4.gt_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "gt-s");
bench("i32x4.gt_u", () => { blackbox(i32x4.gt_u(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "gt-u");
bench("i32x4.ge_s", () => { blackbox(i32x4.ge_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "ge-s");
bench("i32x4.ge_u", () => { blackbox(i32x4.ge_u(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "ge-u");
bench("i32x4.extend_low_i16x8_s", () => { blackbox(i32x4.extend_low_i16x8_s(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "extend-low-i16x8-s");
bench("i32x4.extend_low_i16x8_u", () => { blackbox(i32x4.extend_low_i16x8_u(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "extend-low-i16x8-u");
bench("i32x4.extend_high_i16x8_s", () => { blackbox(i32x4.extend_high_i16x8_s(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "extend-high-i16x8-s");
bench("i32x4.extend_high_i16x8_u", () => { blackbox(i32x4.extend_high_i16x8_u(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "extend-high-i16x8-u");
bench("i32x4.extadd_pairwise_i16x8_s", () => { blackbox(i32x4.extadd_pairwise_i16x8_s(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "extadd-pairwise-i16x8-s");
bench("i32x4.extadd_pairwise_i16x8_u", () => { blackbox(i32x4.extadd_pairwise_i16x8_u(nextVecA())); }, OPS, 8); dumpToFile("i32x4", "extadd-pairwise-i16x8-u");
bench("i32x4.extmul_low_i16x8_s", () => { blackbox(i32x4.extmul_low_i16x8_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "extmul-low-i16x8-s");
bench("i32x4.extmul_low_i16x8_u", () => { blackbox(i32x4.extmul_low_i16x8_u(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "extmul-low-i16x8-u");
bench("i32x4.extmul_high_i16x8_s", () => { blackbox(i32x4.extmul_high_i16x8_s(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "extmul-high-i16x8-s");
bench("i32x4.extmul_high_i16x8_u", () => { blackbox(i32x4.extmul_high_i16x8_u(nextVecA(), nextVecB())); }, OPS, 8); dumpToFile("i32x4", "extmul-high-i16x8-u");
bench("i32x4.shuffle", () => { blackbox(i32x4.shuffle(nextVecA(), nextVecB(), 0, 5, 2, 7)); }, OPS, 8); dumpToFile("i32x4", "shuffle");
if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i32x4.relaxed_laneselect", () => { blackbox(i32x4_swar.relaxed_laneselect(nextVecA(), nextVecB(), nextVecM())); }, OPS, 24); dumpToFile("i32x4", "relaxed-laneselect");
} else {
  bench("i32x4.relaxed_laneselect", () => { blackbox(i32x4_swar.relaxed_laneselect(nextVecA(), nextVecB(), nextVecM())); }, OPS, 24); dumpToFile("i32x4", "relaxed-laneselect");
}

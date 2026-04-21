import { i64x2_swar } from "../v128/i64x2";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = 25_000_000;
// @ts-expect-error: decorator
@inline function make128(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }
let s0: v128 = make128(0x0123456789abcdef, 0x8899aabbccddeeff);
let s1: v128 = make128(0xfedcba9876543210, 0x7766554433221100);
let s2: v128 = make128(0xaa55aa55aa55aa55, 0x55aa55aa55aa55aa);
const IO_PTR: usize = memory.data(160);
// @ts-expect-error: decorator
@inline function next128(x: v128): v128 { x = v128.xor(x, i64x2.shl(x, 13)); x = v128.xor(x, i64x2.shr_u(x, 7)); x = v128.xor(x, i64x2.shl(x, 17)); return x; }
// @ts-expect-error: decorator
@inline function nextVecA(): v128 { s0 = next128(s0); return blackbox(s0); }
// @ts-expect-error: decorator
@inline function nextVecB(): v128 { s1 = next128(s1); return blackbox(s1); }
// @ts-expect-error: decorator
@inline function nextVecM(): v128 { s2 = next128(s2); return blackbox(v128.xor(s2, i64x2.splat(0x5555555555555555 as i64))); }
// @ts-expect-error: decorator
@inline function nextA64(): u64 { return <u64>i64x2.extract_lane(nextVecA(), 0); }
// @ts-expect-error: decorator
@inline function nextI64(): i64 { return nextA64() as i64; }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return <i32>(nextA64() & 63); }
// @ts-expect-error: decorator
@inline function nextPtr16(): usize { return IO_PTR + ((nextA64() as usize) & 0x70); }
// @ts-expect-error: decorator
@inline function nextLen2(): i32 { return <i32>(nextA64() & 3) - 1; }

bench("i64x2.splat", () => { blackbox(i64x2.splat(nextI64())); }, OPS, 16); dumpToFile("i64x2", "splat");
bench("i64x2.load", () => { blackbox(load<v128>(nextPtr16())); }, OPS, 16); dumpToFile("i64x2", "load");
bench("i64x2.store", () => { store<v128>(nextPtr16(), nextVecA()); blackbox(load<u64>(IO_PTR)); }, OPS, 16); dumpToFile("i64x2", "store");
bench("i64x2.loadPartial", () => { blackbox(i64x2_swar.loadPartial(nextPtr16(), nextLen2(), 0, 8, nextI64())); }, OPS, 16); dumpToFile("i64x2", "load-partial");
bench("i64x2.storePartial", () => { i64x2_swar.storePartial(nextPtr16(), nextVecA(), nextLen2(), 0, 8); blackbox(load<u64>(IO_PTR)); }, OPS, 16); dumpToFile("i64x2", "store-partial");
bench("i64x2.extract_lane", () => { blackbox(i64x2.extract_lane(nextVecA(), 1)); }, OPS, 16); dumpToFile("i64x2", "extract-lane");
bench("i64x2.replace_lane", () => { blackbox(i64x2.replace_lane(nextVecA(), 1, nextI64())); }, OPS, 16); dumpToFile("i64x2", "replace-lane");
bench("i64x2.add", () => { blackbox(i64x2.add(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "add");
bench("i64x2.sub", () => { blackbox(i64x2.sub(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "sub");
bench("i64x2.mul", () => { blackbox(i64x2.mul(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "mul");
bench("i64x2.abs", () => { blackbox(i64x2.abs(nextVecA())); }, OPS, 16); dumpToFile("i64x2", "abs");
bench("i64x2.neg", () => { blackbox(i64x2.neg(nextVecA())); }, OPS, 16); dumpToFile("i64x2", "neg");
bench("i64x2.shl", () => { blackbox(i64x2.shl(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i64x2", "shl");
bench("i64x2.shr_s", () => { blackbox(i64x2.shr_s(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i64x2", "shr-s");
bench("i64x2.shr_u", () => { blackbox(i64x2.shr_u(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i64x2", "shr-u");
bench("i64x2.all_true", () => { blackbox(i64x2.all_true(nextVecA())); }, OPS, 16); dumpToFile("i64x2", "all-true");
bench("i64x2.bitmask", () => { blackbox(i64x2.bitmask(nextVecA())); }, OPS, 16); dumpToFile("i64x2", "bitmask");
bench("i64x2.eq", () => { blackbox(i64x2.eq(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "eq");
bench("i64x2.ne", () => { blackbox(i64x2.ne(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "ne");
bench("i64x2.lt_s", () => { blackbox(i64x2.lt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "lt-s");
bench("i64x2.le_s", () => { blackbox(i64x2.le_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "le-s");
bench("i64x2.gt_s", () => { blackbox(i64x2.gt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "gt-s");
bench("i64x2.ge_s", () => { blackbox(i64x2.ge_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "ge-s");
bench("i64x2.extend_low_i32x4_s", () => { blackbox(i64x2.extend_low_i32x4_s(nextVecA())); }, OPS, 16); dumpToFile("i64x2", "extend-low-i32x4-s");
bench("i64x2.extend_low_i32x4_u", () => { blackbox(i64x2.extend_low_i32x4_u(nextVecA())); }, OPS, 16); dumpToFile("i64x2", "extend-low-i32x4-u");
bench("i64x2.extend_high_i32x4_s", () => { blackbox(i64x2.extend_high_i32x4_s(nextVecA())); }, OPS, 16); dumpToFile("i64x2", "extend-high-i32x4-s");
bench("i64x2.extend_high_i32x4_u", () => { blackbox(i64x2.extend_high_i32x4_u(nextVecA())); }, OPS, 16); dumpToFile("i64x2", "extend-high-i32x4-u");
bench("i64x2.extmul_low_i32x4_s", () => { blackbox(i64x2.extmul_low_i32x4_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "extmul-low-i32x4-s");
bench("i64x2.extmul_low_i32x4_u", () => { blackbox(i64x2.extmul_low_i32x4_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "extmul-low-i32x4-u");
bench("i64x2.extmul_high_i32x4_s", () => { blackbox(i64x2.extmul_high_i32x4_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "extmul-high-i32x4-s");
bench("i64x2.extmul_high_i32x4_u", () => { blackbox(i64x2.extmul_high_i32x4_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2", "extmul-high-i32x4-u");
bench("i64x2.shuffle", () => { blackbox(i64x2.shuffle(nextVecA(), nextVecB(), 0, 3)); }, OPS, 16); dumpToFile("i64x2", "shuffle");
if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i64x2.relaxed_laneselect", () => { blackbox(i64x2_swar.relaxed_laneselect(nextVecA(), nextVecB(), nextVecM())); }, OPS, 48); dumpToFile("i64x2", "relaxed-laneselect");
} else {
  bench("i64x2.relaxed_laneselect", () => { blackbox(i64x2_swar.relaxed_laneselect(nextVecA(), nextVecB(), nextVecM())); }, OPS, 48); dumpToFile("i64x2", "relaxed-laneselect");
}

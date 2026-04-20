import { i32x4_swar } from "../v128/i32x4";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = 25_000_000;
// @ts-expect-error: decorator
@inline function make128(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }
let s0: v128 = make128(0x0123456789abcdef, 0x8899aabbccddeeff);
let s1: v128 = make128(0xfedcba9876543210, 0x7766554433221100);
const IO_PTR: usize = memory.data(160);
// @ts-expect-error: decorator
@inline function next128(x: v128): v128 { x = v128.xor(x, i64x2.shl(x, 13)); x = v128.xor(x, i64x2.shr_u(x, 7)); x = v128.xor(x, i64x2.shl(x, 17)); return x; }
// @ts-expect-error: decorator
@inline function nextVecA(): v128 { s0 = next128(s0); return blackbox(s0); }
// @ts-expect-error: decorator
@inline function nextVecB(): v128 { s1 = next128(s1); return blackbox(s1); }
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

bench("i32x4_swar.splat", () => { blackbox(i32x4_swar.splat(nextI32())); }, OPS, 16); dumpToFile("i32x4-swar", "splat");
bench("i32x4_swar.load", () => { blackbox(load<v128>(nextPtr16())); }, OPS, 16); dumpToFile("i32x4-swar", "load");
bench("i32x4_swar.store", () => { store<v128>(nextPtr16(), nextVecA()); blackbox(load<u64>(IO_PTR)); }, OPS, 16); dumpToFile("i32x4-swar", "store");
bench("i32x4_swar.loadPartial", () => { blackbox(i32x4_swar.loadPartial(nextPtr16(), nextLen4(), 0, 4, nextI32())); }, OPS, 16); dumpToFile("i32x4-swar", "load-partial");
bench("i32x4_swar.storePartial", () => { i32x4_swar.storePartial(nextPtr16(), nextVecA(), nextLen4(), 0, 4); blackbox(load<u64>(IO_PTR)); }, OPS, 16); dumpToFile("i32x4-swar", "store-partial");
bench("i32x4_swar.extract_lane", () => { blackbox(i32x4_swar.extract_lane(nextVecA(), 1)); }, OPS, 16); dumpToFile("i32x4-swar", "extract-lane");
bench("i32x4_swar.replace_lane", () => { blackbox(i32x4_swar.replace_lane(nextVecA(), 1, nextI32())); }, OPS, 16); dumpToFile("i32x4-swar", "replace-lane");
bench("i32x4_swar.add", () => { blackbox(i32x4_swar.add(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "add");
bench("i32x4_swar.sub", () => { blackbox(i32x4_swar.sub(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "sub");
bench("i32x4_swar.mul", () => { blackbox(i32x4_swar.mul(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "mul");
bench("i32x4_swar.min_s", () => { blackbox(i32x4_swar.min_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "min-s");
bench("i32x4_swar.min_u", () => { blackbox(i32x4_swar.min_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "min-u");
bench("i32x4_swar.max_s", () => { blackbox(i32x4_swar.max_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "max-s");
bench("i32x4_swar.max_u", () => { blackbox(i32x4_swar.max_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "max-u");
bench("i32x4_swar.dot_i16x8_s", () => { blackbox(i32x4_swar.dot_i16x8_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "dot-i16x8-s");
bench("i32x4_swar.abs", () => { blackbox(i32x4_swar.abs(nextVecA())); }, OPS, 16); dumpToFile("i32x4-swar", "abs");
bench("i32x4_swar.neg", () => { blackbox(i32x4_swar.neg(nextVecA())); }, OPS, 16); dumpToFile("i32x4-swar", "neg");
bench("i32x4_swar.shl", () => { blackbox(i32x4_swar.shl(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i32x4-swar", "shl");
bench("i32x4_swar.shr_s", () => { blackbox(i32x4_swar.shr_s(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i32x4-swar", "shr-s");
bench("i32x4_swar.shr_u", () => { blackbox(i32x4_swar.shr_u(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i32x4-swar", "shr-u");
bench("i32x4_swar.all_true", () => { blackbox(i32x4_swar.all_true(nextVecA())); }, OPS, 16); dumpToFile("i32x4-swar", "all-true");
bench("i32x4_swar.bitmask", () => { blackbox(i32x4_swar.bitmask(nextVecA())); }, OPS, 16); dumpToFile("i32x4-swar", "bitmask");
bench("i32x4_swar.eq", () => { blackbox(i32x4_swar.eq(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "eq");
bench("i32x4_swar.ne", () => { blackbox(i32x4_swar.ne(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "ne");
bench("i32x4_swar.lt_s", () => { blackbox(i32x4_swar.lt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "lt-s");
bench("i32x4_swar.lt_u", () => { blackbox(i32x4_swar.lt_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "lt-u");
bench("i32x4_swar.le_s", () => { blackbox(i32x4_swar.le_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "le-s");
bench("i32x4_swar.le_u", () => { blackbox(i32x4_swar.le_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "le-u");
bench("i32x4_swar.gt_s", () => { blackbox(i32x4_swar.gt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "gt-s");
bench("i32x4_swar.gt_u", () => { blackbox(i32x4_swar.gt_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "gt-u");
bench("i32x4_swar.ge_s", () => { blackbox(i32x4_swar.ge_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "ge-s");
bench("i32x4_swar.ge_u", () => { blackbox(i32x4_swar.ge_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i32x4-swar", "ge-u");

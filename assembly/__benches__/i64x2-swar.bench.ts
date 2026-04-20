import { i64x2_swar } from "../v128/i64x2";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = 25_000_000;
// @ts-expect-error: decorator
@inline function make128(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }
let s0: v128 = make128(0x0123456789abcdef, 0x8899aabbccddeeff);
let s1: v128 = make128(0xfedcba9876543210, 0x7766554433221100);
// @ts-expect-error: decorator
@inline function next128(x: v128): v128 { x = v128.xor(x, i64x2.shl(x, 13)); x = v128.xor(x, i64x2.shr_u(x, 7)); x = v128.xor(x, i64x2.shl(x, 17)); return x; }
// @ts-expect-error: decorator
@inline function nextVecA(): v128 { s0 = next128(s0); return blackbox(s0); }
// @ts-expect-error: decorator
@inline function nextVecB(): v128 { s1 = next128(s1); return blackbox(s1); }
// @ts-expect-error: decorator
@inline function nextA64(): u64 { return <u64>i64x2.extract_lane(nextVecA(), 0); }
// @ts-expect-error: decorator
@inline function nextI64(): i64 { return nextA64() as i64; }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return <i32>(nextA64() & 63); }

bench("i64x2_swar.splat", () => { blackbox(i64x2_swar.splat(nextI64())); }, OPS, 16); dumpToFile("i64x2-swar", "splat");
bench("i64x2_swar.extract_lane", () => { blackbox(i64x2_swar.extract_lane(nextVecA(), 1)); }, OPS, 16); dumpToFile("i64x2-swar", "extract-lane");
bench("i64x2_swar.replace_lane", () => { blackbox(i64x2_swar.replace_lane(nextVecA(), 1, nextI64())); }, OPS, 16); dumpToFile("i64x2-swar", "replace-lane");
bench("i64x2_swar.add", () => { blackbox(i64x2_swar.add(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2-swar", "add");
bench("i64x2_swar.sub", () => { blackbox(i64x2_swar.sub(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2-swar", "sub");
bench("i64x2_swar.neg", () => { blackbox(i64x2_swar.neg(nextVecA())); }, OPS, 16); dumpToFile("i64x2-swar", "neg");
bench("i64x2_swar.shl", () => { blackbox(i64x2_swar.shl(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i64x2-swar", "shl");
bench("i64x2_swar.shr_s", () => { blackbox(i64x2_swar.shr_s(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i64x2-swar", "shr-s");
bench("i64x2_swar.shr_u", () => { blackbox(i64x2_swar.shr_u(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i64x2-swar", "shr-u");
bench("i64x2_swar.all_true", () => { blackbox(i64x2_swar.all_true(nextVecA())); }, OPS, 16); dumpToFile("i64x2-swar", "all-true");
bench("i64x2_swar.bitmask", () => { blackbox(i64x2_swar.bitmask(nextVecA())); }, OPS, 16); dumpToFile("i64x2-swar", "bitmask");
bench("i64x2_swar.eq", () => { blackbox(i64x2_swar.eq(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2-swar", "eq");
bench("i64x2_swar.ne", () => { blackbox(i64x2_swar.ne(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2-swar", "ne");
bench("i64x2_swar.lt_s", () => { blackbox(i64x2_swar.lt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2-swar", "lt-s");
bench("i64x2_swar.le_s", () => { blackbox(i64x2_swar.le_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2-swar", "le-s");
bench("i64x2_swar.gt_s", () => { blackbox(i64x2_swar.gt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2-swar", "gt-s");
bench("i64x2_swar.ge_s", () => { blackbox(i64x2_swar.ge_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i64x2-swar", "ge-s");

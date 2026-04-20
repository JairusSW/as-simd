import { i8x16_swar } from "../v128/i8x16";
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
@inline function nextI8(): i8 { return <i8>(nextA64() & 0xff); }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return <i32>(nextA64() & 7); }

bench("i8x16_swar.splat", () => { blackbox(i8x16_swar.splat(nextI8())); }, OPS, 16); dumpToFile("i8x16-swar", "splat");
bench("i8x16_swar.extract_lane_s", () => { blackbox(i8x16_swar.extract_lane_s(nextVecA(), 7)); }, OPS, 16); dumpToFile("i8x16-swar", "extract-lane-s");
bench("i8x16_swar.extract_lane_u", () => { blackbox(i8x16_swar.extract_lane_u(nextVecA(), 7)); }, OPS, 16); dumpToFile("i8x16-swar", "extract-lane-u");
bench("i8x16_swar.replace_lane", () => { blackbox(i8x16_swar.replace_lane(nextVecA(), 7, nextI8())); }, OPS, 16); dumpToFile("i8x16-swar", "replace-lane");
bench("i8x16_swar.add", () => { blackbox(i8x16_swar.add(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "add");
bench("i8x16_swar.sub", () => { blackbox(i8x16_swar.sub(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "sub");
bench("i8x16_swar.mul", () => { blackbox(i8x16_swar.mul(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "mul");
bench("i8x16_swar.min_s", () => { blackbox(i8x16_swar.min_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "min-s");
bench("i8x16_swar.min_u", () => { blackbox(i8x16_swar.min_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "min-u");
bench("i8x16_swar.max_s", () => { blackbox(i8x16_swar.max_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "max-s");
bench("i8x16_swar.max_u", () => { blackbox(i8x16_swar.max_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "max-u");
bench("i8x16_swar.avgr_u", () => { blackbox(i8x16_swar.avgr_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "avgr-u");
bench("i8x16_swar.abs", () => { blackbox(i8x16_swar.abs(nextVecA())); }, OPS, 16); dumpToFile("i8x16-swar", "abs");
bench("i8x16_swar.neg", () => { blackbox(i8x16_swar.neg(nextVecA())); }, OPS, 16); dumpToFile("i8x16-swar", "neg");
bench("i8x16_swar.add_sat_s", () => { blackbox(i8x16_swar.add_sat_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "add-sat-s");
bench("i8x16_swar.add_sat_u", () => { blackbox(i8x16_swar.add_sat_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "add-sat-u");
bench("i8x16_swar.sub_sat_s", () => { blackbox(i8x16_swar.sub_sat_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "sub-sat-s");
bench("i8x16_swar.sub_sat_u", () => { blackbox(i8x16_swar.sub_sat_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "sub-sat-u");
bench("i8x16_swar.shl", () => { blackbox(i8x16_swar.shl(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i8x16-swar", "shl");
bench("i8x16_swar.shr_s", () => { blackbox(i8x16_swar.shr_s(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i8x16-swar", "shr-s");
bench("i8x16_swar.shr_u", () => { blackbox(i8x16_swar.shr_u(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i8x16-swar", "shr-u");
bench("i8x16_swar.all_true", () => { blackbox(i8x16_swar.all_true(nextVecA())); }, OPS, 16); dumpToFile("i8x16-swar", "all-true");
bench("i8x16_swar.bitmask", () => { blackbox(i8x16_swar.bitmask(nextVecA())); }, OPS, 16); dumpToFile("i8x16-swar", "bitmask");
bench("i8x16_swar.popcnt", () => { blackbox(i8x16_swar.popcnt(nextVecA())); }, OPS, 16); dumpToFile("i8x16-swar", "popcnt");
bench("i8x16_swar.eq", () => { blackbox(i8x16_swar.eq(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "eq");
bench("i8x16_swar.ne", () => { blackbox(i8x16_swar.ne(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "ne");
bench("i8x16_swar.lt_s", () => { blackbox(i8x16_swar.lt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "lt-s");
bench("i8x16_swar.lt_u", () => { blackbox(i8x16_swar.lt_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "lt-u");
bench("i8x16_swar.le_s", () => { blackbox(i8x16_swar.le_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "le-s");
bench("i8x16_swar.le_u", () => { blackbox(i8x16_swar.le_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "le-u");
bench("i8x16_swar.gt_s", () => { blackbox(i8x16_swar.gt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "gt-s");
bench("i8x16_swar.gt_u", () => { blackbox(i8x16_swar.gt_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "gt-u");
bench("i8x16_swar.ge_s", () => { blackbox(i8x16_swar.ge_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "ge-s");
bench("i8x16_swar.ge_u", () => { blackbox(i8x16_swar.ge_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i8x16-swar", "ge-u");

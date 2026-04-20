import { i16x8_swar } from "../v128/i16x8";
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
@inline function nextI16(): i16 { return <i16>(nextA64() & 0xffff); }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return <i32>(nextA64() & 15); }
// @ts-expect-error: decorator
@inline function nextPtr16(): usize { return IO_PTR + ((nextA64() as usize) & 0x70); }
// @ts-expect-error: decorator
@inline function nextLen8(): i32 { return <i32>(nextA64() & 15) - 4; }

bench("i16x8_swar.splat", () => { blackbox(i16x8_swar.splat(nextI16())); }, OPS, 16); dumpToFile("i16x8-swar", "splat");
bench("i16x8_swar.load", () => { blackbox(load<v128>(nextPtr16())); }, OPS, 16); dumpToFile("i16x8-swar", "load");
bench("i16x8_swar.store", () => { store<v128>(nextPtr16(), nextVecA()); blackbox(load<u64>(IO_PTR)); }, OPS, 16); dumpToFile("i16x8-swar", "store");
bench("i16x8_swar.loadPartial", () => { blackbox(i16x8_swar.loadPartial(nextPtr16(), nextLen8(), 0, 2, nextI16())); }, OPS, 16); dumpToFile("i16x8-swar", "load-partial");
bench("i16x8_swar.storePartial", () => { i16x8_swar.storePartial(nextPtr16(), nextVecA(), nextLen8(), 0, 2); blackbox(load<u64>(IO_PTR)); }, OPS, 16); dumpToFile("i16x8-swar", "store-partial");
bench("i16x8_swar.extract_lane_s", () => { blackbox(i16x8_swar.extract_lane_s(nextVecA(), 3)); }, OPS, 16); dumpToFile("i16x8-swar", "extract-lane-s");
bench("i16x8_swar.extract_lane_u", () => { blackbox(i16x8_swar.extract_lane_u(nextVecA(), 3)); }, OPS, 16); dumpToFile("i16x8-swar", "extract-lane-u");
bench("i16x8_swar.replace_lane", () => { blackbox(i16x8_swar.replace_lane(nextVecA(), 3, nextI16())); }, OPS, 16); dumpToFile("i16x8-swar", "replace-lane");
bench("i16x8_swar.add", () => { blackbox(i16x8_swar.add(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "add");
bench("i16x8_swar.sub", () => { blackbox(i16x8_swar.sub(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "sub");
bench("i16x8_swar.mul", () => { blackbox(i16x8_swar.mul(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "mul");
bench("i16x8_swar.min_s", () => { blackbox(i16x8_swar.min_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "min-s");
bench("i16x8_swar.min_u", () => { blackbox(i16x8_swar.min_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "min-u");
bench("i16x8_swar.max_s", () => { blackbox(i16x8_swar.max_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "max-s");
bench("i16x8_swar.max_u", () => { blackbox(i16x8_swar.max_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "max-u");
bench("i16x8_swar.avgr_u", () => { blackbox(i16x8_swar.avgr_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "avgr-u");
bench("i16x8_swar.abs", () => { blackbox(i16x8_swar.abs(nextVecA())); }, OPS, 16); dumpToFile("i16x8-swar", "abs");
bench("i16x8_swar.neg", () => { blackbox(i16x8_swar.neg(nextVecA())); }, OPS, 16); dumpToFile("i16x8-swar", "neg");
bench("i16x8_swar.add_sat_s", () => { blackbox(i16x8_swar.add_sat_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "add-sat-s");
bench("i16x8_swar.add_sat_u", () => { blackbox(i16x8_swar.add_sat_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "add-sat-u");
bench("i16x8_swar.sub_sat_s", () => { blackbox(i16x8_swar.sub_sat_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "sub-sat-s");
bench("i16x8_swar.sub_sat_u", () => { blackbox(i16x8_swar.sub_sat_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "sub-sat-u");
bench("i16x8_swar.shl", () => { blackbox(i16x8_swar.shl(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i16x8-swar", "shl");
bench("i16x8_swar.shr_s", () => { blackbox(i16x8_swar.shr_s(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i16x8-swar", "shr-s");
bench("i16x8_swar.shr_u", () => { blackbox(i16x8_swar.shr_u(nextVecA(), nextShift())); }, OPS, 16); dumpToFile("i16x8-swar", "shr-u");
bench("i16x8_swar.all_true", () => { blackbox(i16x8_swar.all_true(nextVecA())); }, OPS, 16); dumpToFile("i16x8-swar", "all-true");
bench("i16x8_swar.bitmask", () => { blackbox(i16x8_swar.bitmask(nextVecA())); }, OPS, 16); dumpToFile("i16x8-swar", "bitmask");
bench("i16x8_swar.eq", () => { blackbox(i16x8_swar.eq(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "eq");
bench("i16x8_swar.ne", () => { blackbox(i16x8_swar.ne(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "ne");
bench("i16x8_swar.lt_s", () => { blackbox(i16x8_swar.lt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "lt-s");
bench("i16x8_swar.lt_u", () => { blackbox(i16x8_swar.lt_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "lt-u");
bench("i16x8_swar.le_s", () => { blackbox(i16x8_swar.le_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "le-s");
bench("i16x8_swar.le_u", () => { blackbox(i16x8_swar.le_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "le-u");
bench("i16x8_swar.gt_s", () => { blackbox(i16x8_swar.gt_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "gt-s");
bench("i16x8_swar.gt_u", () => { blackbox(i16x8_swar.gt_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "gt-u");
bench("i16x8_swar.ge_s", () => { blackbox(i16x8_swar.ge_s(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "ge-s");
bench("i16x8_swar.ge_u", () => { blackbox(i16x8_swar.ge_u(nextVecA(), nextVecB())); }, OPS, 16); dumpToFile("i16x8-swar", "ge-u");

import { i16x8_swar } from "../v128/i16x8_swar";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const A_LO: u64 = 0xfedcba9876543210, A_HI: u64 = 0x0123456789abcdef;
const B_LO: u64 = 0x7766554433221100, B_HI: u64 = 0x13579bdf2468ace0;
const MASK_LO: u64 = 0x80ff00ff80ff00ff, MASK_HI: u64 = 0x00ff80ff00ff80ff;
const X: i16 = -12345, SHIFT: i32 = 11;

@inline function sinkPair(lo: u64): void { blackbox(lo); blackbox(i16x8_swar.take_hi()); }

bench("i16x8.splat", () => sinkPair(i16x8_swar.splat(blackbox(X))), OPS, 8); dumpToFile("i16x8", "splat");
bench("i16x8.extract_lane_s", () => blackbox(i16x8_swar.extract_lane_s(blackbox(A_LO), blackbox(A_HI), 5)), OPS, 8); dumpToFile("i16x8", "extract-lane-s");
bench("i16x8.extract_lane_u", () => blackbox(i16x8_swar.extract_lane_u(blackbox(A_LO), blackbox(A_HI), 5)), OPS, 8); dumpToFile("i16x8", "extract-lane-u");
bench("i16x8.replace_lane", () => sinkPair(i16x8_swar.replace_lane(blackbox(A_LO), blackbox(A_HI), 5, blackbox(X))), OPS, 8); dumpToFile("i16x8", "replace-lane");
bench("i16x8.add", () => sinkPair(i16x8_swar.add(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "add");
bench("i16x8.sub", () => sinkPair(i16x8_swar.sub(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "sub");
bench("i16x8.mul", () => sinkPair(i16x8_swar.mul(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "mul");
bench("i16x8.min_s", () => sinkPair(i16x8_swar.min_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "min-s");
bench("i16x8.min_u", () => sinkPair(i16x8_swar.min_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "min-u");
bench("i16x8.max_s", () => sinkPair(i16x8_swar.max_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "max-s");
bench("i16x8.max_u", () => sinkPair(i16x8_swar.max_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "max-u");
bench("i16x8.avgr_u", () => sinkPair(i16x8_swar.avgr_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "avgr-u");
bench("i16x8.abs", () => sinkPair(i16x8_swar.abs(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i16x8", "abs");
bench("i16x8.neg", () => sinkPair(i16x8_swar.neg(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i16x8", "neg");
bench("i16x8.add_sat_s", () => sinkPair(i16x8_swar.add_sat_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "add-sat-s");
bench("i16x8.add_sat_u", () => sinkPair(i16x8_swar.add_sat_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "add-sat-u");
bench("i16x8.sub_sat_s", () => sinkPair(i16x8_swar.sub_sat_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "sub-sat-s");
bench("i16x8.sub_sat_u", () => sinkPair(i16x8_swar.sub_sat_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "sub-sat-u");
bench("i16x8.shl", () => sinkPair(i16x8_swar.shl(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i16x8", "shl");
bench("i16x8.shr_s", () => sinkPair(i16x8_swar.shr_s(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i16x8", "shr-s");
bench("i16x8.shr_u", () => sinkPair(i16x8_swar.shr_u(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i16x8", "shr-u");
bench("i16x8.all_true", () => blackbox(i16x8_swar.all_true(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i16x8", "all-true");
bench("i16x8.bitmask", () => blackbox(i16x8_swar.bitmask(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i16x8", "bitmask");
bench("i16x8.eq", () => sinkPair(i16x8_swar.eq(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "eq");
bench("i16x8.ne", () => sinkPair(i16x8_swar.ne(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "ne");
bench("i16x8.lt_s", () => sinkPair(i16x8_swar.lt_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "lt-s");
bench("i16x8.lt_u", () => sinkPair(i16x8_swar.lt_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "lt-u");
bench("i16x8.le_s", () => sinkPair(i16x8_swar.le_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "le-s");
bench("i16x8.le_u", () => sinkPair(i16x8_swar.le_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i16x8", "le-u");
bench("i16x8.relaxed_laneselect", () => sinkPair(i16x8_swar.relaxed_laneselect(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI), blackbox(MASK_LO), blackbox(MASK_HI))), OPS, 8); dumpToFile("i16x8", "relaxed-laneselect");

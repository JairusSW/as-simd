import { i32x4_swar } from "../v128/i32x4_swar";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const A_LO: u64 = 0xfedcba9876543210, A_HI: u64 = 0x0123456789abcdef;
const B_LO: u64 = 0x7766554433221100, B_HI: u64 = 0x13579bdf2468ace0;
const MASK_LO: u64 = 0x80ff00ff80ff00ff, MASK_HI: u64 = 0x00ff80ff00ff80ff;
const X: i32 = -123456789, SHIFT: i32 = 13;

@inline function sinkPair(lo: u64): void { blackbox(lo); blackbox(i32x4_swar.take_hi()); }

bench("i32x4.splat", () => sinkPair(i32x4_swar.splat(blackbox(X))), OPS, 8); dumpToFile("i32x4", "splat");
bench("i32x4.extract_lane", () => blackbox(i32x4_swar.extract_lane(blackbox(A_LO), blackbox(A_HI), 3)), OPS, 8); dumpToFile("i32x4", "extract-lane");
bench("i32x4.replace_lane", () => sinkPair(i32x4_swar.replace_lane(blackbox(A_LO), blackbox(A_HI), 3, blackbox(X))), OPS, 8); dumpToFile("i32x4", "replace-lane");
bench("i32x4.add", () => sinkPair(i32x4_swar.add(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "add");
bench("i32x4.sub", () => sinkPair(i32x4_swar.sub(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "sub");
bench("i32x4.mul", () => sinkPair(i32x4_swar.mul(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "mul");
bench("i32x4.min_s", () => sinkPair(i32x4_swar.min_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "min-s");
bench("i32x4.min_u", () => sinkPair(i32x4_swar.min_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "min-u");
bench("i32x4.max_s", () => sinkPair(i32x4_swar.max_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "max-s");
bench("i32x4.max_u", () => sinkPair(i32x4_swar.max_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "max-u");
bench("i32x4.dot_i16x8_s", () => sinkPair(i32x4_swar.dot_i16x8_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "dot-i16x8-s");
bench("i32x4.abs", () => sinkPair(i32x4_swar.abs(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i32x4", "abs");
bench("i32x4.neg", () => sinkPair(i32x4_swar.neg(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i32x4", "neg");
bench("i32x4.shl", () => sinkPair(i32x4_swar.shl(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i32x4", "shl");
bench("i32x4.shr_s", () => sinkPair(i32x4_swar.shr_s(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i32x4", "shr-s");
bench("i32x4.shr_u", () => sinkPair(i32x4_swar.shr_u(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i32x4", "shr-u");
bench("i32x4.all_true", () => blackbox(i32x4_swar.all_true(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i32x4", "all-true");
bench("i32x4.bitmask", () => blackbox(i32x4_swar.bitmask(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i32x4", "bitmask");
bench("i32x4.eq", () => sinkPair(i32x4_swar.eq(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "eq");
bench("i32x4.ne", () => sinkPair(i32x4_swar.ne(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "ne");
bench("i32x4.lt_s", () => sinkPair(i32x4_swar.lt_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "lt-s");
bench("i32x4.lt_u", () => sinkPair(i32x4_swar.lt_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "lt-u");
bench("i32x4.le_s", () => sinkPair(i32x4_swar.le_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "le-s");
bench("i32x4.le_u", () => sinkPair(i32x4_swar.le_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "le-u");
bench("i32x4.gt_s", () => sinkPair(i32x4_swar.gt_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "gt-s");
bench("i32x4.gt_u", () => sinkPair(i32x4_swar.gt_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "gt-u");
bench("i32x4.ge_s", () => sinkPair(i32x4_swar.ge_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "ge-s");
bench("i32x4.ge_u", () => sinkPair(i32x4_swar.ge_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i32x4", "ge-u");
bench("i32x4.relaxed_laneselect", () => sinkPair(i32x4_swar.relaxed_laneselect(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI), blackbox(MASK_LO), blackbox(MASK_HI))), OPS, 8); dumpToFile("i32x4", "relaxed-laneselect");

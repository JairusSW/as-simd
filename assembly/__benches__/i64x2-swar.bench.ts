import { i64x2_swar } from "../v128/i64x2_swar";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const A_LO: u64 = 0xfedcba9876543210, A_HI: u64 = 0x0123456789abcdef;
const B_LO: u64 = 0x7766554433221100, B_HI: u64 = 0x13579bdf2468ace0;
const MASK_LO: u64 = 0x80ff00ff80ff00ff, MASK_HI: u64 = 0x00ff80ff00ff80ff;
const X: i64 = -81985529216486896, SHIFT: i32 = 17;

@inline function sinkPair(lo: u64): void { blackbox(lo); blackbox(i64x2_swar.take_hi()); }

bench("i64x2.splat", () => sinkPair(i64x2_swar.splat(blackbox(X))), OPS, 8); dumpToFile("i64x2", "splat");
bench("i64x2.extract_lane", () => blackbox(i64x2_swar.extract_lane(blackbox(A_LO), blackbox(A_HI), 1)), OPS, 8); dumpToFile("i64x2", "extract-lane");
bench("i64x2.replace_lane", () => sinkPair(i64x2_swar.replace_lane(blackbox(A_LO), blackbox(A_HI), 1, blackbox(X))), OPS, 8); dumpToFile("i64x2", "replace-lane");
bench("i64x2.add", () => sinkPair(i64x2_swar.add(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "add");
bench("i64x2.sub", () => sinkPair(i64x2_swar.sub(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "sub");
bench("i64x2.mul", () => sinkPair(i64x2_swar.mul(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "mul");
bench("i64x2.abs", () => sinkPair(i64x2_swar.abs(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i64x2", "abs");
bench("i64x2.neg", () => sinkPair(i64x2_swar.neg(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i64x2", "neg");
bench("i64x2.shl", () => sinkPair(i64x2_swar.shl(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i64x2", "shl");
bench("i64x2.shr_s", () => sinkPair(i64x2_swar.shr_s(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i64x2", "shr-s");
bench("i64x2.shr_u", () => sinkPair(i64x2_swar.shr_u(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT))), OPS, 8); dumpToFile("i64x2", "shr-u");
bench("i64x2.all_true", () => blackbox(i64x2_swar.all_true(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i64x2", "all-true");
bench("i64x2.bitmask", () => blackbox(i64x2_swar.bitmask(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i64x2", "bitmask");
bench("i64x2.eq", () => sinkPair(i64x2_swar.eq(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "eq");
bench("i64x2.ne", () => sinkPair(i64x2_swar.ne(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "ne");
bench("i64x2.lt_s", () => sinkPair(i64x2_swar.lt_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "lt-s");
bench("i64x2.le_s", () => sinkPair(i64x2_swar.le_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "le-s");
bench("i64x2.gt_s", () => sinkPair(i64x2_swar.gt_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "gt-s");
bench("i64x2.ge_s", () => sinkPair(i64x2_swar.ge_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "ge-s");
bench("i64x2.extend_low_i32x4_s", () => sinkPair(i64x2_swar.extend_low_i32x4_s(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i64x2", "extend-low-i32x4-s");
bench("i64x2.extend_low_i32x4_u", () => sinkPair(i64x2_swar.extend_low_i32x4_u(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i64x2", "extend-low-i32x4-u");
bench("i64x2.extend_high_i32x4_s", () => sinkPair(i64x2_swar.extend_high_i32x4_s(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i64x2", "extend-high-i32x4-s");
bench("i64x2.extend_high_i32x4_u", () => sinkPair(i64x2_swar.extend_high_i32x4_u(blackbox(A_LO), blackbox(A_HI))), OPS, 8); dumpToFile("i64x2", "extend-high-i32x4-u");
bench("i64x2.extmul_low_i32x4_s", () => sinkPair(i64x2_swar.extmul_low_i32x4_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "extmul-low-i32x4-s");
bench("i64x2.extmul_low_i32x4_u", () => sinkPair(i64x2_swar.extmul_low_i32x4_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "extmul-low-i32x4-u");
bench("i64x2.extmul_high_i32x4_s", () => sinkPair(i64x2_swar.extmul_high_i32x4_s(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "extmul-high-i32x4-s");
bench("i64x2.extmul_high_i32x4_u", () => sinkPair(i64x2_swar.extmul_high_i32x4_u(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI))), OPS, 8); dumpToFile("i64x2", "extmul-high-i32x4-u");
bench("i64x2.shuffle", () => sinkPair(i64x2_swar.shuffle(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI), 1, 0)), OPS, 8); dumpToFile("i64x2", "shuffle");
bench("i64x2.relaxed_laneselect", () => sinkPair(i64x2_swar.relaxed_laneselect(blackbox(A_LO), blackbox(A_HI), blackbox(B_LO), blackbox(B_HI), blackbox(MASK_LO), blackbox(MASK_HI))), OPS, 8); dumpToFile("i64x2", "relaxed-laneselect");

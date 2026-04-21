import { i32x4_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);

// @ts-expect-error: decorator
@inline function nextA(): u64 { return blackbox(bench_common.nextA()); }
// @ts-expect-error: decorator
@inline function nextB(): u64 { return blackbox(bench_common.nextB()); }
// @ts-expect-error: decorator
@inline function nextM(): u64 { return blackbox(bench_common.nextM()); }
// @ts-expect-error: decorator
@inline function next128(): u64 { return bench_common.next128(); }
// @ts-expect-error: decorator
@inline function next128Hi(): u64 { return bench_common.next128Hi(); }
// @ts-expect-error: decorator
@inline function nextI32(): i32 { return nextA() as i32; }
// @ts-expect-error: decorator
@inline function nextLane4(): u8 { return (nextA() & 3) as u8; }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return (nextA() & 31) as i32; }
// @ts-expect-error: decorator
@inline function nextPtr16(): usize { return IO_PTR + ((nextA() as usize) & 0xf0); }
// @ts-expect-error: decorator
@inline function nextLen4(): i32 { return (nextA() & 7) as i32 - 2; }
// @ts-expect-error: decorator
@inline function nextVec(): v128 { return bench_common.nextV128(); }

bench("i32x4.ctor", () => { if (ASC_FEATURE_SIMD) blackbox(nextVec()); else { blackbox(i32x4_swar(nextI32(), nextI32(), nextI32(), nextI32())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "ctor");
bench("i32x4.splat", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.splat(nextI32())); else { blackbox(i32x4_swar.splat(nextI32())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "splat");
bench("i32x4.extract_lane", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.extract_lane(nextVec(), 0)); else blackbox(i32x4_swar.extract_lane(next128(), next128Hi(), nextLane4())); }, OPS, 8); dumpToFile("i32x4", "extract-lane");
bench("i32x4.replace_lane", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.replace_lane(nextVec(), 0, nextI32())); else { blackbox(i32x4_swar.replace_lane(next128(), next128Hi(), nextLane4(), nextI32())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "replace-lane");
bench("i32x4.add", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.add(nextVec(), nextVec())); else { blackbox(i32x4_swar.add(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "add");
bench("i32x4.sub", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.sub(nextVec(), nextVec())); else { blackbox(i32x4_swar.sub(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "sub");
bench("i32x4.mul", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.mul(nextVec(), nextVec())); else { blackbox(i32x4_swar.mul(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "mul");
bench("i32x4.min_s", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.min_s(nextVec(), nextVec())); else { blackbox(i32x4_swar.min_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "min-s");
bench("i32x4.min_u", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.min_u(nextVec(), nextVec())); else { blackbox(i32x4_swar.min_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "min-u");
bench("i32x4.max_s", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.max_s(nextVec(), nextVec())); else { blackbox(i32x4_swar.max_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "max-s");
bench("i32x4.max_u", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.max_u(nextVec(), nextVec())); else { blackbox(i32x4_swar.max_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "max-u");
bench("i32x4.dot_i16x8_s", () => { blackbox(i32x4_swar.dot_i16x8_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "dot-i16x8-s");
bench("i32x4.abs", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.abs(nextVec())); else { blackbox(i32x4_swar.abs(next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "abs");
bench("i32x4.neg", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.neg(nextVec())); else { blackbox(i32x4_swar.neg(next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "neg");
bench("i32x4.shl", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.shl(nextVec(), nextShift())); else { blackbox(i32x4_swar.shl(next128(), next128Hi(), nextShift())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "shl");
bench("i32x4.shr_s", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.shr_s(nextVec(), nextShift())); else { blackbox(i32x4_swar.shr_s(next128(), next128Hi(), nextShift())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "shr-s");
bench("i32x4.shr_u", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.shr_u(nextVec(), nextShift())); else { blackbox(i32x4_swar.shr_u(next128(), next128Hi(), nextShift())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "shr-u");
bench("i32x4.all_true", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.all_true(nextVec())); else blackbox(i32x4_swar.all_true(next128(), next128Hi())); }, OPS, 8); dumpToFile("i32x4", "all-true");
bench("i32x4.bitmask", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.bitmask(nextVec())); else blackbox(i32x4_swar.bitmask(next128(), next128Hi())); }, OPS, 8); dumpToFile("i32x4", "bitmask");
bench("i32x4.eq", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.eq(nextVec(), nextVec())); else { blackbox(i32x4_swar.eq(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "eq");
bench("i32x4.ne", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.ne(nextVec(), nextVec())); else { blackbox(i32x4_swar.ne(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "ne");
bench("i32x4.lt_s", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.lt_s(nextVec(), nextVec())); else { blackbox(i32x4_swar.lt_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "lt-s");
bench("i32x4.lt_u", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.lt_u(nextVec(), nextVec())); else { blackbox(i32x4_swar.lt_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "lt-u");
bench("i32x4.le_s", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.le_s(nextVec(), nextVec())); else { blackbox(i32x4_swar.le_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "le-s");
bench("i32x4.le_u", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.le_u(nextVec(), nextVec())); else { blackbox(i32x4_swar.le_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "le-u");
bench("i32x4.gt_s", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.gt_s(nextVec(), nextVec())); else { blackbox(i32x4_swar.gt_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "gt-s");
bench("i32x4.gt_u", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.gt_u(nextVec(), nextVec())); else { blackbox(i32x4_swar.gt_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "gt-u");
bench("i32x4.ge_s", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.ge_s(nextVec(), nextVec())); else { blackbox(i32x4_swar.ge_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "ge-s");
bench("i32x4.ge_u", () => { if (ASC_FEATURE_SIMD) blackbox(i32x4.ge_u(nextVec(), nextVec())); else { blackbox(i32x4_swar.ge_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); } }, OPS, 8); dumpToFile("i32x4", "ge-u");
bench("i32x4.extend_low_i16x8_s", () => { blackbox(i32x4_swar.extend_low_i16x8_s(next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extend-low-i16x8-s");
bench("i32x4.extend_low_i16x8_u", () => { blackbox(i32x4_swar.extend_low_i16x8_u(next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extend-low-i16x8-u");
bench("i32x4.extend_high_i16x8_s", () => { blackbox(i32x4_swar.extend_high_i16x8_s(next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extend-high-i16x8-s");
bench("i32x4.extend_high_i16x8_u", () => { blackbox(i32x4_swar.extend_high_i16x8_u(next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extend-high-i16x8-u");
bench("i32x4.extadd_pairwise_i16x8_s", () => { blackbox(i32x4_swar.extadd_pairwise_i16x8_s(next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extadd-pairwise-i16x8-s");
bench("i32x4.extadd_pairwise_i16x8_u", () => { blackbox(i32x4_swar.extadd_pairwise_i16x8_u(next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extadd-pairwise-i16x8-u");
bench("i32x4.extmul_low_i16x8_s", () => { blackbox(i32x4_swar.extmul_low_i16x8_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extmul-low-i16x8-s");
bench("i32x4.extmul_low_i16x8_u", () => { blackbox(i32x4_swar.extmul_low_i16x8_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extmul-low-i16x8-u");
bench("i32x4.extmul_high_i16x8_s", () => { blackbox(i32x4_swar.extmul_high_i16x8_s(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extmul-high-i16x8-s");
bench("i32x4.extmul_high_i16x8_u", () => { blackbox(i32x4_swar.extmul_high_i16x8_u(next128(), next128Hi(), next128(), next128Hi())); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "extmul-high-i16x8-u");
bench("i32x4.shuffle", () => { blackbox(i32x4_swar.shuffle(next128(), next128Hi(), next128(), next128Hi(), 3,2,1,0)); blackbox(i32x4_swar.take_hi()); }, OPS, 8); dumpToFile("i32x4", "shuffle");
bench("i32x4.relaxed_laneselect", () => { blackbox(i32x4_swar.relaxed_laneselect(next128(), next128Hi(), next128(), next128Hi(), nextM(), nextB())); blackbox(i32x4_swar.take_hi()); }, OPS, 24); dumpToFile("i32x4", "relaxed-laneselect");

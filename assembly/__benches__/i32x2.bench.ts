import { i32x2 } from "../v64/i32x2";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(96);

// @ts-expect-error: decorator
@inline function next64(): u64 { return bench_common.next64(); }
// @ts-expect-error: decorator
@inline function next128(): u64 { return bench_common.next128(); }
// @ts-expect-error: decorator
@inline function next128Hi(): u64 { return bench_common.next128Hi(); }
// @ts-expect-error: decorator
@inline function nextA(): u64 { return blackbox(bench_common.nextA()); }
// @ts-expect-error: decorator
@inline function nextB(): u64 { return blackbox(bench_common.nextB()); }
// @ts-expect-error: decorator
@inline function nextM(): u64 { return blackbox(bench_common.nextM()); }
// @ts-expect-error: decorator
@inline function nextShift(): i32 { return <i32>(nextA() & 31); }
// @ts-expect-error: decorator
@inline function nextLane2(): u8 { return <u8>(nextA() & 1); }
// @ts-expect-error: decorator
@inline function nextLane4(): u8 { return <u8>(nextA() & 3); }
// @ts-expect-error: decorator
@inline function nextI32(): i32 { return <i32>nextA(); }
// @ts-expect-error: decorator
@inline function nextPtr8(): usize { return IO_PTR + ((nextA() as usize) & 0x38); }
// @ts-expect-error: decorator
@inline function nextLen2(): i32 { return <i32>(nextA() & 3) - 1; }

bench("i32x2.ctor", () => { blackbox(i32x2(nextI32(), nextI32())); }, OPS, 8); dumpToFile("i32x2", "ctor");
bench("i32x2.splat", () => { blackbox(i32x2.splat(nextI32())); }, OPS, 8); dumpToFile("i32x2", "splat");
bench("i32x2.load", () => { blackbox(load<u64>(nextPtr8())); }, OPS, 8); dumpToFile("i32x2", "load");
bench("i32x2.store", () => { store<u64>(nextPtr8(), nextA()); blackbox(load<u64>(IO_PTR)); }, OPS, 8); dumpToFile("i32x2", "store");
bench("i32x2.loadPartial", () => { blackbox(i32x2.loadPartial(nextPtr8(), nextLen2(), 0, 4, nextI32())); }, OPS, 8); dumpToFile("i32x2", "load-partial");
bench("i32x2.storePartial", () => { i32x2.storePartial(nextPtr8(), nextA(), nextLen2(), 0, 4); blackbox(load<u64>(IO_PTR)); }, OPS, 8); dumpToFile("i32x2", "store-partial");
bench("i32x2.extract_lane", () => { blackbox(i32x2.extract_lane(nextA(), nextLane2())); }, OPS, 8); dumpToFile("i32x2", "extract-lane");
bench("i32x2.replace_lane", () => { blackbox(i32x2.replace_lane(nextA(), nextLane2(), nextI32())); }, OPS, 8); dumpToFile("i32x2", "replace-lane");
bench("i32x2.add", () => { blackbox(i32x2.add(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "add");
bench("i32x2.sub", () => { blackbox(i32x2.sub(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "sub");
bench("i32x2.mul", () => { blackbox(i32x2.mul(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "mul");
bench("i32x2.min_s", () => { blackbox(i32x2.min_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "min-s");
bench("i32x2.min_u", () => { blackbox(i32x2.min_u(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "min-u");
bench("i32x2.max_s", () => { blackbox(i32x2.max_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "max-s");
bench("i32x2.max_u", () => { blackbox(i32x2.max_u(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "max-u");
bench("i32x2.dot_i16x4_s", () => { blackbox(i32x2.dot_i16x4_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "dot-i16x4-s");
bench("i32x2.abs", () => { blackbox(i32x2.abs(nextA())); }, OPS, 8); dumpToFile("i32x2", "abs");
bench("i32x2.neg", () => { blackbox(i32x2.neg(nextA())); }, OPS, 8); dumpToFile("i32x2", "neg");
bench("i32x2.shl", () => { blackbox(i32x2.shl(nextA(), nextShift())); }, OPS, 8); dumpToFile("i32x2", "shl");
bench("i32x2.shr_s", () => { blackbox(i32x2.shr_s(nextA(), nextShift())); }, OPS, 8); dumpToFile("i32x2", "shr-s");
bench("i32x2.shr_u", () => { blackbox(i32x2.shr_u(nextA(), nextShift())); }, OPS, 8); dumpToFile("i32x2", "shr-u");
bench("i32x2.all_true", () => { blackbox(i32x2.all_true(nextA())); }, OPS, 8); dumpToFile("i32x2", "all-true");
bench("i32x2.bitmask", () => { blackbox(i32x2.bitmask(nextA())); }, OPS, 8); dumpToFile("i32x2", "bitmask");
bench("i32x2.eq", () => { blackbox(i32x2.eq(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "eq");
bench("i32x2.ne", () => { blackbox(i32x2.ne(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "ne");
bench("i32x2.lt_s", () => { blackbox(i32x2.lt_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "lt-s");
bench("i32x2.lt_u", () => { blackbox(i32x2.lt_u(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "lt-u");
bench("i32x2.le_s", () => { blackbox(i32x2.le_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "le-s");
bench("i32x2.le_u", () => { blackbox(i32x2.le_u(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "le-u");
bench("i32x2.gt_s", () => { blackbox(i32x2.gt_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "gt-s");
bench("i32x2.gt_u", () => { blackbox(i32x2.gt_u(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "gt-u");
bench("i32x2.ge_s", () => { blackbox(i32x2.ge_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "ge-s");
bench("i32x2.ge_u", () => { blackbox(i32x2.ge_u(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "ge-u");
bench("i32x2.extend_low_i16x4_s", () => { blackbox(i32x2.extend_low_i16x4_s(nextA())); }, OPS, 8); dumpToFile("i32x2", "extend-low-i16x4-s");
bench("i32x2.extend_low_i16x4_u", () => { blackbox(i32x2.extend_low_i16x4_u(nextA())); }, OPS, 8); dumpToFile("i32x2", "extend-low-i16x4-u");
bench("i32x2.extend_high_i16x4_s", () => { blackbox(i32x2.extend_high_i16x4_s(nextA())); }, OPS, 8); dumpToFile("i32x2", "extend-high-i16x4-s");
bench("i32x2.extend_high_i16x4_u", () => { blackbox(i32x2.extend_high_i16x4_u(nextA())); }, OPS, 8); dumpToFile("i32x2", "extend-high-i16x4-u");
bench("i32x2.extadd_pairwise_i16x4_s", () => { blackbox(i32x2.extadd_pairwise_i16x4_s(nextA())); }, OPS, 8); dumpToFile("i32x2", "extadd-pairwise-i16x4-s");
bench("i32x2.extadd_pairwise_i16x4_u", () => { blackbox(i32x2.extadd_pairwise_i16x4_u(nextA())); }, OPS, 8); dumpToFile("i32x2", "extadd-pairwise-i16x4-u");
bench("i32x2.extmul_low_i16x4_s", () => { blackbox(i32x2.extmul_low_i16x4_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "extmul-low-i16x4-s");
bench("i32x2.extmul_low_i16x4_u", () => { blackbox(i32x2.extmul_low_i16x4_u(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "extmul-low-i16x4-u");
bench("i32x2.extmul_high_i16x4_s", () => { blackbox(i32x2.extmul_high_i16x4_s(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "extmul-high-i16x4-s");
bench("i32x2.extmul_high_i16x4_u", () => { blackbox(i32x2.extmul_high_i16x4_u(nextA(), nextB())); }, OPS, 8); dumpToFile("i32x2", "extmul-high-i16x4-u");
bench("i32x2.shuffle", () => { blackbox(i32x2.shuffle(nextA(), nextB(), nextLane4(), nextLane4())); }, OPS, 8); dumpToFile("i32x2", "shuffle");
if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i32x2.relaxed_laneselect", () => { blackbox(i32x2.relaxed_laneselect(nextA(), nextB(), nextM())); }, OPS, 24); dumpToFile("i32x2", "relaxed-laneselect");
} else {
  bench("i32x2.relaxed_laneselect", () => { blackbox(i32x2.relaxed_laneselect(nextA(), nextB(), nextM())); }, OPS, 24); dumpToFile("i32x2", "relaxed-laneselect");
}

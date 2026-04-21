import { i8x8 } from "../v64/i8x8";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(96);

// @ts-expect-error: decorator
@inline function nextA(): u64 {
  return blackbox(bench_common.nextA());
}

// @ts-expect-error: decorator
@inline function nextB(): u64 {
  return blackbox(bench_common.nextB());
}

// @ts-expect-error: decorator
@inline function nextM(): u64 {
  return blackbox(bench_common.nextM());
}

// @ts-expect-error: decorator
@inline function nextShift(): i32 {
  return blackbox((bench_common.nextA() & 7) as i32);
}

// @ts-expect-error: decorator
@inline function nextLane8(): u8 {
  return blackbox((bench_common.nextA() & 7) as u8);
}

// @ts-expect-error: decorator
@inline function nextLane16(): u8 {
  return blackbox((bench_common.nextA() & 15) as u8);
}

// @ts-expect-error: decorator
@inline function nextI8(): i8 {
  return blackbox((bench_common.nextA() & 0xff) as i8);
}

// @ts-expect-error: decorator
@inline function nextPtr8(): usize {
  return blackbox(IO_PTR + ((bench_common.nextA() as usize) & 0x38));
}

// @ts-expect-error: decorator
@inline function nextLen8(): i32 {
  return blackbox(((bench_common.nextA() & 0xf) as i32) - 4);
}

bench("i8x8.splat", () => {
  blackbox(i8x8.splat(nextI8()));
}, OPS, 8);
dumpToFile("i8x8", "splat");

bench("i8x8.load", () => {
  blackbox(load<u64>(nextPtr8()));
}, OPS, 8);
dumpToFile("i8x8", "load");

bench("i8x8.store", () => {
  store<u64>(nextPtr8(), nextA());
  blackbox(load<u64>(IO_PTR));
}, OPS, 8);
dumpToFile("i8x8", "store");

bench("i8x8.loadPartial", () => {
  blackbox(i8x8.loadPartial(nextPtr8(), nextLen8(), 0, 1, nextI8()));
}, OPS, 8);
dumpToFile("i8x8", "load-partial");

bench("i8x8.storePartial", () => {
  i8x8.storePartial(nextPtr8(), nextA(), nextLen8());
  blackbox(load<u64>(IO_PTR));
}, OPS, 8);
dumpToFile("i8x8", "store-partial");

bench("i8x8.extract_lane_s", () => {
  blackbox(i8x8.extract_lane_s(nextA(), nextLane8()));
}, OPS, 8);
dumpToFile("i8x8", "extract-lane-s");

bench("i8x8.extract_lane_u", () => {
  blackbox(i8x8.extract_lane_u(nextA(), nextLane8()));
}, OPS, 8);
dumpToFile("i8x8", "extract-lane-u");

bench("i8x8.replace_lane", () => {
  blackbox(i8x8.replace_lane(nextA(), nextLane8(), nextI8()));
}, OPS, 8);
dumpToFile("i8x8", "replace-lane");

bench("i8x8.add", () => {
  blackbox(i8x8.add(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "add");

bench("i8x8.sub", () => {
  blackbox(i8x8.sub(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "sub");

bench("i8x8.mul", () => {
  blackbox(i8x8.mul(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "mul");

bench("i8x8.min_s", () => {
  blackbox(i8x8.min_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "min-s");

bench("i8x8.min_u", () => {
  blackbox(i8x8.min_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "min-u");

bench("i8x8.max_s", () => {
  blackbox(i8x8.max_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "max-s");

bench("i8x8.max_u", () => {
  blackbox(i8x8.max_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "max-u");

bench("i8x8.avgr_u", () => {
  blackbox(i8x8.avgr_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "avgr-u");

bench("i8x8.abs", () => {
  blackbox(i8x8.abs(nextA()));
}, OPS, 8);
dumpToFile("i8x8", "abs");

bench("i8x8.neg", () => {
  blackbox(i8x8.neg(nextA()));
}, OPS, 8);
dumpToFile("i8x8", "neg");

bench("i8x8.add_sat_s", () => {
  blackbox(i8x8.add_sat_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "add-sat-s");

bench("i8x8.add_sat_u", () => {
  blackbox(i8x8.add_sat_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "add-sat-u");

bench("i8x8.sub_sat_s", () => {
  blackbox(i8x8.sub_sat_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "sub-sat-s");

bench("i8x8.sub_sat_u", () => {
  blackbox(i8x8.sub_sat_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "sub-sat-u");

bench("i8x8.shl", () => {
  blackbox(i8x8.shl(nextA(), nextShift()));
}, OPS, 8);
dumpToFile("i8x8", "shl");

bench("i8x8.shr_s", () => {
  blackbox(i8x8.shr_s(nextA(), nextShift()));
}, OPS, 8);
dumpToFile("i8x8", "shr-s");

bench("i8x8.shr_u", () => {
  blackbox(i8x8.shr_u(nextA(), nextShift()));
}, OPS, 8);
dumpToFile("i8x8", "shr-u");

bench("i8x8.all_true", () => {
  blackbox(i8x8.all_true(nextA()));
}, OPS, 8);
dumpToFile("i8x8", "all-true");

bench("i8x8.bitmask", () => {
  blackbox(i8x8.bitmask(nextA()));
}, OPS, 8);
dumpToFile("i8x8", "bitmask");

bench("i8x8.eq", () => {
  blackbox(i8x8.eq(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "eq");

bench("i8x8.ne", () => {
  blackbox(i8x8.ne(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "ne");

bench("i8x8.lt_s", () => {
  blackbox(i8x8.lt_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "lt-s");

bench("i8x8.lt_u", () => {
  blackbox(i8x8.lt_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "lt-u");

bench("i8x8.le_s", () => {
  blackbox(i8x8.le_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "le-s");

bench("i8x8.le_u", () => {
  blackbox(i8x8.le_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "le-u");

bench("i8x8.gt_s", () => {
  blackbox(i8x8.gt_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "gt-s");

bench("i8x8.gt_u", () => {
  blackbox(i8x8.gt_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "gt-u");

bench("i8x8.ge_s", () => {
  blackbox(i8x8.ge_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "ge-s");

bench("i8x8.ge_u", () => {
  blackbox(i8x8.ge_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "ge-u");

bench("i8x8.narrow_i16x4_s", () => {
  blackbox(i8x8.narrow_i16x4_s(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "narrow-i16x4-s");

bench("i8x8.narrow_i16x4_u", () => {
  blackbox(i8x8.narrow_i16x4_u(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "narrow-i16x4-u");

bench("i8x8.shuffle", () => {
  blackbox(i8x8.shuffle(
    nextA(),
    nextB(),
    nextLane16(),
    nextLane16(),
    nextLane16(),
    nextLane16(),
    nextLane16(),
    nextLane16(),
    nextLane16(),
    nextLane16(),
  ));
}, OPS, 8);
dumpToFile("i8x8", "shuffle");

bench("i8x8.swizzle", () => {
  blackbox(i8x8.swizzle(nextA(), nextB()));
}, OPS, 8);
dumpToFile("i8x8", "swizzle");

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i8x8.relaxed_swizzle", () => {
    blackbox(i8x8.relaxed_swizzle(nextA(), nextB()));
  }, OPS, 8);
  dumpToFile("i8x8", "relaxed-swizzle");

  bench("i8x8.relaxed_laneselect", () => {
    blackbox(i8x8.relaxed_laneselect(nextA(), nextB(), nextM()));
  }, OPS, 24);
  dumpToFile("i8x8", "relaxed-laneselect");
} else {
  // Fallback keeps output shape stable for runtimes without relaxed SIMD.
  bench("i8x8.relaxed_swizzle", () => {
    blackbox(i8x8.swizzle(nextA(), nextB()));
  }, OPS, 8);
  dumpToFile("i8x8", "relaxed-swizzle");

  bench("i8x8.relaxed_laneselect", () => {
    blackbox(i8x8.relaxed_laneselect(nextA(), nextB(), nextM()));
  }, OPS, 24);
  dumpToFile("i8x8", "relaxed-laneselect");
}

bench("i8x8.popcnt", () => {
  blackbox(i8x8.popcnt(nextA()));
}, OPS, 8);
dumpToFile("i8x8", "popcnt");

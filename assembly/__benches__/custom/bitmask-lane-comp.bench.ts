import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;

// @ts-expect-error: decorator
@inline function bitmask_lane_current(a: u64): u64 {
  return (((a & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | a) & 0x8080808080808080;
}

// @ts-expect-error: decorator
@inline function bitmask_lane_from_ne(a: u64): u64 {
  return i8x8.ne(a, 0) & 0x8080808080808080;
}

// @ts-expect-error: decorator
@inline function bitmask_lane_split32(a: u64): u64 {
  const lo = (((a as u32) & 0x7f7f7f7f) + 0x7f7f7f7f) | (a as u32);
  const hi = ((((a >> 32) as u32) & 0x7f7f7f7f) + 0x7f7f7f7f) | ((a >> 32) as u32);
  return ((lo & 0x80808080) as u64) | (((hi & 0x80808080) as u64) << 32);
}

bench("bitmask-lane.lib", () => { blackbox(i8x8.bitmask_lane(blackbox(a))); }, OPS, 8); dumpToFile("bitmask-lane-comp", "lib");
bench("bitmask-lane.current", () => { blackbox(bitmask_lane_current(blackbox(a))); }, OPS, 8); dumpToFile("bitmask-lane-comp", "current");
bench("bitmask-lane.from-ne", () => { blackbox(bitmask_lane_from_ne(blackbox(a))); }, OPS, 8); dumpToFile("bitmask-lane-comp", "from-ne");
bench("bitmask-lane.split32", () => { blackbox(bitmask_lane_split32(blackbox(a))); }, OPS, 8); dumpToFile("bitmask-lane-comp", "split32");

import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const lane: u8 = 5;
const value: i8 = -42;

// @ts-expect-error: decorator
@inline function replace_current(x: u64, idx: u8, value: i8): u64 {
  const shift = idx << 3;
  const mask = (0xff as u64) << shift;
  return (x & ~mask) | (((value as u64) & 0xff) << shift);
}

// @ts-expect-error: decorator
@inline function replace_switch(x: u64, idx: u8, value: i8): u64 {
  const v = (value as u64) & 0xff;
  switch (idx & 7) {
    case 0:
      return (x & 0xffffffffffffff00) | v;
    case 1:
      return (x & 0xffffffffffff00ff) | (v << 8);
    case 2:
      return (x & 0xffffffffff00ffff) | (v << 16);
    case 3:
      return (x & 0xffffffff00ffffff) | (v << 24);
    case 4:
      return (x & 0xffffff00ffffffff) | (v << 32);
    case 5:
      return (x & 0xffff00ffffffffff) | (v << 40);
    case 6:
      return (x & 0xff00ffffffffffff) | (v << 48);
    default:
      return (x & 0x00ffffffffffffff) | (v << 56);
  }
}

bench(
  "replace-lane.lib",
  () => {
    blackbox(i8x8.replace_lane(blackbox(a), blackbox(lane), blackbox(value)));
  },
  OPS,
  8,
);
dumpToFile("replace-lane-comp", "lib");
bench(
  "replace-lane.current",
  () => {
    blackbox(replace_current(blackbox(a), blackbox(lane), blackbox(value)));
  },
  OPS,
  8,
);
dumpToFile("replace-lane-comp", "current");
bench(
  "replace-lane.switch",
  () => {
    blackbox(replace_switch(blackbox(a), blackbox(lane), blackbox(value)));
  },
  OPS,
  8,
);
dumpToFile("replace-lane-comp", "switch");

import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const s: i32 = 3;

// @ts-expect-error: decorator
@inline function shl_current(a: u64, b: i32): u64 {
  const shift = b & 7;
  return (a & (((0xff >> shift) as u64) * 0x0101010101010101)) << shift;
}

// @ts-expect-error: decorator
@inline function shl_switch(a: u64, b: i32): u64 {
  switch (b & 7) {
    case 0:
      return a;
    case 1:
      return (a & 0x7f7f7f7f7f7f7f7f) << 1;
    case 2:
      return (a & 0x3f3f3f3f3f3f3f3f) << 2;
    case 3:
      return (a & 0x1f1f1f1f1f1f1f1f) << 3;
    case 4:
      return (a & 0x0f0f0f0f0f0f0f0f) << 4;
    case 5:
      return (a & 0x0707070707070707) << 5;
    case 6:
      return (a & 0x0303030303030303) << 6;
    default:
      return (a & 0x0101010101010101) << 7;
  }
}

// @ts-expect-error: decorator
@inline function shl_split32(a: u64, b: i32): u64 {
  const shift = b & 7;
  const mask = ((0xff >> shift) as u32) * 0x01010101;
  const lo = ((a as u32) & mask) << shift;
  const hi = (((a >> 32) as u32) & mask) << shift;
  return (lo as u64) | ((hi as u64) << 32);
}

bench(
  "shl.lib",
  () => {
    blackbox(i8x8.shl(blackbox(a), blackbox(s)));
  },
  OPS,
  8,
);
dumpToFile("shl-comp", "lib");
bench(
  "shl.current",
  () => {
    blackbox(shl_current(blackbox(a), blackbox(s)));
  },
  OPS,
  8,
);
dumpToFile("shl-comp", "current");
bench(
  "shl.switch",
  () => {
    blackbox(shl_switch(blackbox(a), blackbox(s)));
  },
  OPS,
  8,
);
dumpToFile("shl-comp", "switch");
bench(
  "shl.split32",
  () => {
    blackbox(shl_split32(blackbox(a), blackbox(s)));
  },
  OPS,
  8,
);
dumpToFile("shl-comp", "split32");

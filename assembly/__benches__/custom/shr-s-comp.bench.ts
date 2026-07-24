import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const s: i32 = 3;

// @ts-expect-error: decorator
@inline function shr_s_current(a: u64, b: i32): u64 {
  const shift = b & 7;
  if (shift == 0) return a;
  const keep = (((0xff >> shift) & 0xff) as u64) * 0x0101010101010101;
  const logical = (a >> shift) & keep;
  return logical | ((((a & 0x8080808080808080) >> 7) * 0xff) & ~keep);
}

// @ts-expect-error: decorator
@inline function shr_s_switch(a: u64, b: i32): u64 {
  const sign = ((a & 0x8080808080808080) >> 7) * 0xff;
  switch (b & 7) {
    case 0:
      return a;
    case 1:
      return ((a >> 1) & 0x7f7f7f7f7f7f7f7f) | (sign & 0x8080808080808080);
    case 2:
      return ((a >> 2) & 0x3f3f3f3f3f3f3f3f) | (sign & 0xc0c0c0c0c0c0c0c0);
    case 3:
      return ((a >> 3) & 0x1f1f1f1f1f1f1f1f) | (sign & 0xe0e0e0e0e0e0e0e0);
    case 4:
      return ((a >> 4) & 0x0f0f0f0f0f0f0f0f) | (sign & 0xf0f0f0f0f0f0f0f0);
    case 5:
      return ((a >> 5) & 0x0707070707070707) | (sign & 0xf8f8f8f8f8f8f8f8);
    case 6:
      return ((a >> 6) & 0x0303030303030303) | (sign & 0xfcfcfcfcfcfcfcfc);
    default:
      return ((a >> 7) & 0x0101010101010101) | (sign & 0xfefefefefefefefe);
  }
}

// @ts-expect-error: decorator
@inline function shr_s_split32(a: u64, b: i32): u64 {
  const shift = b & 7;
  if (shift == 0) return a;
  const keep = (((0xff >> shift) & 0xff) as u32) * 0x01010101;
  const lo = a as u32;
  const hi = (a >> 32) as u32;
  const slo = ((lo & 0x80808080) >> 7) * 0xff;
  const shi = ((hi & 0x80808080) >> 7) * 0xff;
  return (
    ((((lo >> shift) & keep) | (slo & ~keep)) as u64) |
    (((((hi >> shift) & keep) | (shi & ~keep)) as u64) << 32)
  );
}

bench(
  "shr-s.lib",
  () => {
    blackbox(i8x8.shr_s(blackbox(a), blackbox(s)));
  },
  OPS,
  8,
);
dumpToFile("shr-s-comp", "lib");
bench(
  "shr-s.current",
  () => {
    blackbox(shr_s_current(blackbox(a), blackbox(s)));
  },
  OPS,
  8,
);
dumpToFile("shr-s-comp", "current");
bench(
  "shr-s.switch",
  () => {
    blackbox(shr_s_switch(blackbox(a), blackbox(s)));
  },
  OPS,
  8,
);
dumpToFile("shr-s-comp", "switch");
bench(
  "shr-s.split32",
  () => {
    blackbox(shr_s_split32(blackbox(a), blackbox(s)));
  },
  OPS,
  8,
);
dumpToFile("shr-s-comp", "split32");

import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0xfedcba8876543200;

// @ts-expect-error: decorator
@inline function eq_current(a: u64, b: u64): u64 {
  const x = a ^ b;
  return (
    ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) &
      ~x &
      0x8080808080808080) >>
      7) *
    0xff
  );
}

// @ts-expect-error: decorator
@inline function eq_ne_inverse(a: u64, b: u64): u64 {
  const x = a ^ b;
  const mask =
    (((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | x) & 0x8080808080808080;
  return ~((mask >> 7) * 0xff);
}

// @ts-expect-error: decorator
@inline function eq_ne_xor_highbit(a: u64, b: u64): u64 {
  const x = a ^ b;
  const mask =
    ((((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | x) &
      0x8080808080808080) ^
    0x8080808080808080;
  return (mask >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function eq_current_split32(a: u64, b: u64): u64 {
  const x = a ^ b;
  const lo = x as u32;
  const hi = (x >> 32) as u32;
  const ml =
    ((~(((lo & 0x7f7f7f7f) + 0x7f7f7f7f) & 0x80808080) & ~lo & 0x80808080) >>
      7) *
    0xff;
  const mh =
    ((~(((hi & 0x7f7f7f7f) + 0x7f7f7f7f) & 0x80808080) & ~hi & 0x80808080) >>
      7) *
    0xff;
  return (ml as u64) | ((mh as u64) << 32);
}

// @ts-expect-error: decorator
@inline function eq_current_split16(a: u64, b: u64): u64 {
  const x = a ^ b;
  const lo = x & 0x00ff00ff00ff00ff;
  const hi = (x >> 8) & 0x00ff00ff00ff00ff;
  const ml =
    ((~(((lo & 0x007f007f007f007f) + 0x007f007f007f007f) & 0x0080008000800080) &
      ~lo &
      0x0080008000800080) >>
      7) *
    0xff;
  const mh =
    ((~(((hi & 0x007f007f007f007f) + 0x007f007f007f007f) & 0x0080008000800080) &
      ~hi &
      0x0080008000800080) >>
      7) *
    0xff;
  return (ml & 0x00ff00ff00ff00ff) | ((mh & 0x00ff00ff00ff00ff) << 8);
}

// @ts-expect-error: decorator
@inline function eq_split_nonzero(a: u64, b: u64): u64 {
  const x = a ^ b;
  const lo = x as u32;
  const hi = (x >> 32) as u32;
  const ml = ((((lo & 0x7f7f7f7f) + 0x7f7f7f7f) | lo) & 0x80808080) >> 7;
  const mh = ((((hi & 0x7f7f7f7f) + 0x7f7f7f7f) | hi) & 0x80808080) >> 7;
  return ~(((ml * 0xff) as u64) | (((mh * 0xff) as u64) << 32));
}

bench(
  "eq.lib",
  () => {
    blackbox(i8x8.eq(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("eq-comp", "lib");
bench(
  "eq.current",
  () => {
    blackbox(eq_current(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("eq-comp", "current");
bench(
  "eq.ne-inverse",
  () => {
    blackbox(eq_ne_inverse(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("eq-comp", "ne-inverse");
bench(
  "eq.ne-xor-highbit",
  () => {
    blackbox(eq_ne_xor_highbit(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("eq-comp", "ne-xor-highbit");
bench(
  "eq.current-split32",
  () => {
    blackbox(eq_current_split32(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("eq-comp", "current-split32");
bench(
  "eq.current-split16",
  () => {
    blackbox(eq_current_split16(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("eq-comp", "current-split16");
bench(
  "eq.split-nonzero",
  () => {
    blackbox(eq_split_nonzero(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("eq-comp", "split-nonzero");

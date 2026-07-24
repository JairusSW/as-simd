import { i32x2 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;
const l0: u8 = 3;
const l1: u8 = 3;

// @ts-expect-error: decorator
@inline function shuffle_lib(a: u64, b: u64, l0: u8, l1: u8): u64 {
  return i32x2.shuffle(a, b, l0, l1);
}

// current library shape
// @ts-expect-error: decorator
@inline function shuffle_current(a: u64, b: u64, l0: u8, l1: u8): u64 {
  const i0 = (l0 & 1) * 32;
  const i1 = (l1 & 1) * 32;
  const x0 = ((select<u64>(a, b, l0 < 2) >> i0) & 0xffffffff) as u32 as u64;
  const x1 = ((select<u64>(a, b, l1 < 2) >> i1) & 0xffffffff) as u32 as u64;
  return x0 | (x1 << 32);
}

// explicit scalar lane decode
// @ts-expect-error: decorator
@inline function shuffle_branchy(a: u64, b: u64, l0: u8, l1: u8): u64 {
  const x0 =
    l0 == 0
      ? ((a & 0xffffffff) as u32 as u64)
      : l0 == 1
        ? (((a >> 32) & 0xffffffff) as u32 as u64)
        : l0 == 2
          ? ((b & 0xffffffff) as u32 as u64)
          : (((b >> 32) & 0xffffffff) as u32 as u64);
  const x1 =
    l1 == 0
      ? ((a & 0xffffffff) as u32 as u64)
      : l1 == 1
        ? (((a >> 32) & 0xffffffff) as u32 as u64)
        : l1 == 2
          ? ((b & 0xffffffff) as u32 as u64)
          : (((b >> 32) & 0xffffffff) as u32 as u64);
  return x0 | (x1 << 32);
}

// split-source then split-lane
// @ts-expect-error: decorator
@inline function shuffle_nested_select(a: u64, b: u64, l0: u8, l1: u8): u64 {
  const s0 = select<u64>(a, b, l0 < 2);
  const s1 = select<u64>(a, b, l1 < 2);
  const x0 = select<u64>(
    (s0 & 0xffffffff) as u32 as u64,
    ((s0 >> 32) & 0xffffffff) as u32 as u64,
    (l0 & 1) == 0,
  );
  const x1 = select<u64>(
    (s1 & 0xffffffff) as u32 as u64,
    ((s1 >> 32) & 0xffffffff) as u32 as u64,
    (l1 & 1) == 0,
  );
  return x0 | (x1 << 32);
}

// direct low/high choice without shifting full 64-bit source
// @ts-expect-error: decorator
@inline function shuffle_pair_select(a: u64, b: u64, l0: u8, l1: u8): u64 {
  const aLo = (a & 0xffffffff) as u32 as u64;
  const aHi = ((a >> 32) & 0xffffffff) as u32 as u64;
  const bLo = (b & 0xffffffff) as u32 as u64;
  const bHi = ((b >> 32) & 0xffffffff) as u32 as u64;
  const x0 = select<u64>(
    select<u64>(aLo, aHi, (l0 & 1) == 0),
    select<u64>(bLo, bHi, (l0 & 1) == 0),
    l0 < 2,
  );
  const x1 = select<u64>(
    select<u64>(aLo, aHi, (l1 & 1) == 0),
    select<u64>(bLo, bHi, (l1 & 1) == 0),
    l1 < 2,
  );
  return x0 | (x1 << 32);
}

bench(
  "i32x2-shuffle.lib",
  () => {
    blackbox(shuffle_lib(blackbox(a), blackbox(b), blackbox(l0), blackbox(l1)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-shuffle-comp", "lib");
bench(
  "i32x2-shuffle.current",
  () => {
    blackbox(
      shuffle_current(blackbox(a), blackbox(b), blackbox(l0), blackbox(l1)),
    );
  },
  OPS,
  8,
);
dumpToFile("i32x2-shuffle-comp", "current");
bench(
  "i32x2-shuffle.branchy",
  () => {
    blackbox(
      shuffle_branchy(blackbox(a), blackbox(b), blackbox(l0), blackbox(l1)),
    );
  },
  OPS,
  8,
);
dumpToFile("i32x2-shuffle-comp", "branchy");
bench(
  "i32x2-shuffle.nested-select",
  () => {
    blackbox(
      shuffle_nested_select(
        blackbox(a),
        blackbox(b),
        blackbox(l0),
        blackbox(l1),
      ),
    );
  },
  OPS,
  8,
);
dumpToFile("i32x2-shuffle-comp", "nested-select");
bench(
  "i32x2-shuffle.pair-select",
  () => {
    blackbox(
      shuffle_pair_select(blackbox(a), blackbox(b), blackbox(l0), blackbox(l1)),
    );
  },
  OPS,
  8,
);
dumpToFile("i32x2-shuffle-comp", "pair-select");

import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function popcnt_lib(x: u64): u64 {
  return i8x8.popcnt(x);
}
// @ts-expect-error: decorator
@inline function popcnt_current(x: u64): u64 {
  x = x - ((x >> 1) & 0x5555555555555555);
  x = (x & 0x3333333333333333) + ((x >> 2) & 0x3333333333333333);
  return (x + (x >> 4)) & 0x0f0f0f0f0f0f0f0f;
}
// @ts-expect-error: decorator
@inline function popcnt_current3(x: u64): u64 {
  x = x - ((x >> 1) & 0x5555555555555555);
  x = (x & 0x3333333333333333) + ((x >> 2) & 0x3333333333333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f0f0f0f0f;
  return x;
}
// @ts-expect-error: decorator
@inline function popcnt_locals(x: u64): u64 {
  const x1 = x - ((x >> 1) & 0x5555555555555555);
  const x2 = (x1 & 0x3333333333333333) + ((x1 >> 2) & 0x3333333333333333);
  return (x2 + (x2 >> 4)) & 0x0f0f0f0f0f0f0f0f;
}
// @ts-expect-error: decorator
@inline function popcnt_locals3(x: u64): u64 {
  const x1 = x - ((x >> 1) & 0x5555555555555555);
  const x2 = (x1 & 0x3333333333333333) + ((x1 >> 2) & 0x3333333333333333);
  const x3 = (x2 + (x2 >> 4)) & 0x0f0f0f0f0f0f0f0f;
  return x3;
}
// @ts-expect-error: decorator
@inline function popcnt_split32(x: u64): u64 {
  let lo = x as u32;
  let hi = (x >> 32) as u32;
  lo = lo - ((lo >> 1) & 0x55555555);
  hi = hi - ((hi >> 1) & 0x55555555);
  lo = (lo & 0x33333333) + ((lo >> 2) & 0x33333333);
  hi = (hi & 0x33333333) + ((hi >> 2) & 0x33333333);
  return (
    (((lo + (lo >> 4)) & 0x0f0f0f0f) as u64) |
    ((((hi + (hi >> 4)) & 0x0f0f0f0f) as u64) << 32)
  );
}
// @ts-expect-error: decorator
@inline function popcnt_intrinsic_lanes(x: u64): u64 {
  return (
    (<u64>popcnt<u32>((x & 0xff) as u32)) |
    ((<u64>popcnt<u32>(((x >> 8) & 0xff) as u32)) << 8) |
    ((<u64>popcnt<u32>(((x >> 16) & 0xff) as u32)) << 16) |
    ((<u64>popcnt<u32>(((x >> 24) & 0xff) as u32)) << 24) |
    ((<u64>popcnt<u32>(((x >> 32) & 0xff) as u32)) << 32) |
    ((<u64>popcnt<u32>(((x >> 40) & 0xff) as u32)) << 40) |
    ((<u64>popcnt<u32>(((x >> 48) & 0xff) as u32)) << 48) |
    ((<u64>popcnt<u32>(((x >> 56) & 0xff) as u32)) << 56)
  );
}
const a: u64 = 0xfedcba9876543210;
bench(
  "popcnt.lib",
  () => {
    blackbox(popcnt_lib(blackbox(a)));
  },
  OPS,
  8,
);
dumpToFile("popcnt-comp", "lib");
bench(
  "popcnt.current",
  () => {
    blackbox(popcnt_current(blackbox(a)));
  },
  OPS,
  8,
);
dumpToFile("popcnt-comp", "current");
bench(
  "popcnt.current3",
  () => {
    blackbox(popcnt_current3(blackbox(a)));
  },
  OPS,
  8,
);
dumpToFile("popcnt-comp", "current3");
bench(
  "popcnt.locals",
  () => {
    blackbox(popcnt_locals(blackbox(a)));
  },
  OPS,
  8,
);
dumpToFile("popcnt-comp", "locals");
bench(
  "popcnt.locals3",
  () => {
    blackbox(popcnt_locals3(blackbox(a)));
  },
  OPS,
  8,
);
dumpToFile("popcnt-comp", "locals3");
bench(
  "popcnt.split32",
  () => {
    blackbox(popcnt_split32(blackbox(a)));
  },
  OPS,
  8,
);
dumpToFile("popcnt-comp", "split32");
bench(
  "popcnt.intrinsic-lanes",
  () => {
    blackbox(popcnt_intrinsic_lanes(blackbox(a)));
  },
  OPS,
  8,
);
dumpToFile("popcnt-comp", "intrinsic-lanes");

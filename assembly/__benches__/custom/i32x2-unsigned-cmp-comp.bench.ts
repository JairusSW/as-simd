import { i32x2 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function lt_u_lib(a: u64, b: u64): u64 {
  return i32x2.lt_u(a, b);
}
// @ts-expect-error: decorator
@inline function le_u_lib(a: u64, b: u64): u64 {
  return i32x2.le_u(a, b);
}
// @ts-expect-error: decorator
@inline function gt_u_lib(a: u64, b: u64): u64 {
  return i32x2.gt_u(a, b);
}
// @ts-expect-error: decorator
@inline function ge_u_lib(a: u64, b: u64): u64 {
  return i32x2.ge_u(a, b);
}
// @ts-expect-error: decorator
@inline function le_u_via_lt(a: u64, b: u64): u64 {
  return ~i32x2.lt_u(b, a);
}
// @ts-expect-error: decorator
@inline function gt_u_via_lt(a: u64, b: u64): u64 {
  return i32x2.lt_u(b, a);
}
// @ts-expect-error: decorator
@inline function ge_u_via_lt(a: u64, b: u64): u64 {
  return ~i32x2.lt_u(a, b);
}

// @ts-expect-error: decorator
@inline function lt_u_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as u32;
  const a1 = ((a >> 32) & 0xffffffff) as u32;
  const b0 = (b & 0xffffffff) as u32;
  const b1 = ((b >> 32) & 0xffffffff) as u32;
  return (
    select<u64>(0xffffffff, 0, a0 < b0) |
    (select<u64>(0xffffffff, 0, a1 < b1) << 32)
  );
}
// @ts-expect-error: decorator
@inline function le_u_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as u32;
  const a1 = ((a >> 32) & 0xffffffff) as u32;
  const b0 = (b & 0xffffffff) as u32;
  const b1 = ((b >> 32) & 0xffffffff) as u32;
  return (
    select<u64>(0xffffffff, 0, a0 <= b0) |
    (select<u64>(0xffffffff, 0, a1 <= b1) << 32)
  );
}
// @ts-expect-error: decorator
@inline function gt_u_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as u32;
  const a1 = ((a >> 32) & 0xffffffff) as u32;
  const b0 = (b & 0xffffffff) as u32;
  const b1 = ((b >> 32) & 0xffffffff) as u32;
  return (
    select<u64>(0xffffffff, 0, a0 > b0) |
    (select<u64>(0xffffffff, 0, a1 > b1) << 32)
  );
}
// @ts-expect-error: decorator
@inline function ge_u_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as u32;
  const a1 = ((a >> 32) & 0xffffffff) as u32;
  const b0 = (b & 0xffffffff) as u32;
  const b1 = ((b >> 32) & 0xffffffff) as u32;
  return (
    select<u64>(0xffffffff, 0, a0 >= b0) |
    (select<u64>(0xffffffff, 0, a1 >= b1) << 32)
  );
}

bench(
  "i32x2-lt-u.lib",
  () => {
    blackbox(lt_u_lib(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "lt-lib");
bench(
  "i32x2-lt-u.old",
  () => {
    blackbox(lt_u_old(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "lt-old");
bench(
  "i32x2-le-u.lib",
  () => {
    blackbox(le_u_lib(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "le-lib");
bench(
  "i32x2-le-u.via-lt",
  () => {
    blackbox(le_u_via_lt(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "le-via-lt");
bench(
  "i32x2-le-u.old",
  () => {
    blackbox(le_u_old(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "le-old");
bench(
  "i32x2-gt-u.lib",
  () => {
    blackbox(gt_u_lib(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "gt-lib");
bench(
  "i32x2-gt-u.via-lt",
  () => {
    blackbox(gt_u_via_lt(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "gt-via-lt");
bench(
  "i32x2-gt-u.old",
  () => {
    blackbox(gt_u_old(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "gt-old");
bench(
  "i32x2-ge-u.lib",
  () => {
    blackbox(ge_u_lib(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "ge-lib");
bench(
  "i32x2-ge-u.via-lt",
  () => {
    blackbox(ge_u_via_lt(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "ge-via-lt");
bench(
  "i32x2-ge-u.old",
  () => {
    blackbox(ge_u_old(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-unsigned-cmp-comp", "ge-old");

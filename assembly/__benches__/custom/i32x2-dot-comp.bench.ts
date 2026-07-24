import { i32x2 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function dot_lib(a: u64, b: u64): u64 {
  return i32x2.dot_i16x4_s(a, b);
}

// current library shape
// @ts-expect-error: decorator
@inline function dot_current(a: u64, b: u64): u64 {
  const p0 =
    (((a >> 0) & 0xffff) as i16 as i32) * (((b >> 0) & 0xffff) as i16 as i32);
  const p1 =
    (((a >> 16) & 0xffff) as i16 as i32) * (((b >> 16) & 0xffff) as i16 as i32);
  const p2 =
    (((a >> 32) & 0xffff) as i16 as i32) * (((b >> 32) & 0xffff) as i16 as i32);
  const p3 =
    (((a >> 48) & 0xffff) as i16 as i32) * (((b >> 48) & 0xffff) as i16 as i32);
  return (
    (((p0 + p1) as u32 as u64) & 0xffffffff) |
    ((((p2 + p3) as u32 as u64) & 0xffffffff) << 32)
  );
}

// narrower typed locals first
// @ts-expect-error: decorator
@inline function dot_i16_locals(a: u64, b: u64): u64 {
  const a0 = ((a >> 0) & 0xffff) as i16;
  const a1 = ((a >> 16) & 0xffff) as i16;
  const a2 = ((a >> 32) & 0xffff) as i16;
  const a3 = ((a >> 48) & 0xffff) as i16;
  const b0 = ((b >> 0) & 0xffff) as i16;
  const b1 = ((b >> 16) & 0xffff) as i16;
  const b2 = ((b >> 32) & 0xffff) as i16;
  const b3 = ((b >> 48) & 0xffff) as i16;
  return (
    ((a0 * b0 + a1 * b1) as u32 as u64) |
    (((a2 * b2 + a3 * b3) as u32 as u64) << 32)
  );
}

// arithmetic shift sign extension from packed word
// @ts-expect-error: decorator
@inline function dot_shift_sext(a: u64, b: u64): u64 {
  const a0 = (((a << 48) as i64) >> 48) as i32;
  const a1 = (((a << 32) as i64) >> 48) as i32;
  const a2 = (((a << 16) as i64) >> 48) as i32;
  const a3 = ((a as i64) >> 48) as i32;
  const b0 = (((b << 48) as i64) >> 48) as i32;
  const b1 = (((b << 32) as i64) >> 48) as i32;
  const b2 = (((b << 16) as i64) >> 48) as i32;
  const b3 = ((b as i64) >> 48) as i32;
  return (
    ((a0 * b0 + a1 * b1) as u32 as u64) |
    (((a2 * b2 + a3 * b3) as u32 as u64) << 32)
  );
}

// grouped sums first, then multiply-add
// @ts-expect-error: decorator
@inline function dot_grouped(a: u64, b: u64): u64 {
  const lo =
    (((a >> 0) & 0xffff) as i16 as i32) * (((b >> 0) & 0xffff) as i16 as i32) +
    (((a >> 16) & 0xffff) as i16 as i32) * (((b >> 16) & 0xffff) as i16 as i32);
  const hi =
    (((a >> 32) & 0xffff) as i16 as i32) *
      (((b >> 32) & 0xffff) as i16 as i32) +
    (((a >> 48) & 0xffff) as i16 as i32) * (((b >> 48) & 0xffff) as i16 as i32);
  return (lo as u32 as u64) | ((hi as u32 as u64) << 32);
}

bench(
  "i32x2-dot.lib",
  () => {
    blackbox(dot_lib(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-dot-comp", "lib");
bench(
  "i32x2-dot.current",
  () => {
    blackbox(dot_current(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-dot-comp", "current");
bench(
  "i32x2-dot.i16-locals",
  () => {
    blackbox(dot_i16_locals(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-dot-comp", "i16-locals");
bench(
  "i32x2-dot.shift-sext",
  () => {
    blackbox(dot_shift_sext(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-dot-comp", "shift-sext");
bench(
  "i32x2-dot.grouped",
  () => {
    blackbox(dot_grouped(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("i32x2-dot-comp", "grouped");

import { i32x2 } from "../../v64/i32x2";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function min_s_lib(a: u64, b: u64): u64 { return i32x2.min_s(a, b); }
// @ts-expect-error: decorator
@inline function min_u_lib(a: u64, b: u64): u64 { return i32x2.min_u(a, b); }
// @ts-expect-error: decorator
@inline function max_s_lib(a: u64, b: u64): u64 { return i32x2.max_s(a, b); }
// @ts-expect-error: decorator
@inline function max_u_lib(a: u64, b: u64): u64 { return i32x2.max_u(a, b); }

// compare-mask variants using current compare ops
// @ts-expect-error: decorator
@inline function min_s_via_lt(a: u64, b: u64): u64 { const m = i32x2.lt_s(a, b); return b ^ ((a ^ b) & m); }
// @ts-expect-error: decorator
@inline function min_u_via_lt(a: u64, b: u64): u64 { const m = i32x2.lt_u(a, b); return b ^ ((a ^ b) & m); }
// @ts-expect-error: decorator
@inline function max_s_via_lt(a: u64, b: u64): u64 { const m = i32x2.lt_s(a, b); return a ^ ((a ^ b) & m); }
// @ts-expect-error: decorator
@inline function max_u_via_lt(a: u64, b: u64): u64 { const m = i32x2.lt_u(a, b); return a ^ ((a ^ b) & m); }

// explicit per-lane forms
// @ts-expect-error: decorator
@inline function min_s_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as i32;
  const a1 = ((a >> 32) & 0xffffffff) as i32;
  const b0 = (b & 0xffffffff) as i32;
  const b1 = ((b >> 32) & 0xffffffff) as i32;
  return (select<u64>(a0 as u32 as u64, b0 as u32 as u64, a0 < b0))
    | (select<u64>(a1 as u32 as u64, b1 as u32 as u64, a1 < b1) << 32);
}
// @ts-expect-error: decorator
@inline function min_u_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as u32;
  const a1 = ((a >> 32) & 0xffffffff) as u32;
  const b0 = (b & 0xffffffff) as u32;
  const b1 = ((b >> 32) & 0xffffffff) as u32;
  return (select<u64>(a0 as u64, b0 as u64, a0 < b0))
    | (select<u64>(a1 as u64, b1 as u64, a1 < b1) << 32);
}
// @ts-expect-error: decorator
@inline function max_s_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as i32;
  const a1 = ((a >> 32) & 0xffffffff) as i32;
  const b0 = (b & 0xffffffff) as i32;
  const b1 = ((b >> 32) & 0xffffffff) as i32;
  return (select<u64>(b0 as u32 as u64, a0 as u32 as u64, a0 < b0))
    | (select<u64>(b1 as u32 as u64, a1 as u32 as u64, a1 < b1) << 32);
}
// @ts-expect-error: decorator
@inline function max_u_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as u32;
  const a1 = ((a >> 32) & 0xffffffff) as u32;
  const b0 = (b & 0xffffffff) as u32;
  const b1 = ((b >> 32) & 0xffffffff) as u32;
  return (select<u64>(b0 as u64, a0 as u64, a0 < b0))
    | (select<u64>(b1 as u64, a1 as u64, a1 < b1) << 32);
}

// alternate broadword mask shapes
// @ts-expect-error: decorator
@inline function min_s_ge_shape(a: u64, b: u64): u64 {
  const bx = b ^ 0x8000000080000000;
  const ax = a ^ 0x8000000080000000;
  const d = ((bx | 0x8000000080000000) - (ax & 0x7fffffff7fffffff)) ^ ((bx ^ ~ax) & 0x8000000080000000);
  const m = ~(((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8000000080000000) >> 31) * 0xffffffff);
  return b ^ ((a ^ b) & m);
}
// @ts-expect-error: decorator
@inline function max_s_ge_shape(a: u64, b: u64): u64 {
  const bx = b ^ 0x8000000080000000;
  const ax = a ^ 0x8000000080000000;
  const d = ((bx | 0x8000000080000000) - (ax & 0x7fffffff7fffffff)) ^ ((bx ^ ~ax) & 0x8000000080000000);
  const m = ~(((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8000000080000000) >> 31) * 0xffffffff);
  return a ^ ((a ^ b) & m);
}

bench("i32x2-min-s.lib",      () => { blackbox(min_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "min-s-lib");
bench("i32x2-min-s.via-lt",   () => { blackbox(min_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "min-s-via-lt");
bench("i32x2-min-s.old",      () => { blackbox(min_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "min-s-old");
bench("i32x2-min-s.ge-shape", () => { blackbox(min_s_ge_shape(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "min-s-ge-shape");

bench("i32x2-min-u.lib",    () => { blackbox(min_u_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "min-u-lib");
bench("i32x2-min-u.via-lt", () => { blackbox(min_u_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "min-u-via-lt");
bench("i32x2-min-u.old",    () => { blackbox(min_u_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "min-u-old");

bench("i32x2-max-s.lib",      () => { blackbox(max_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "max-s-lib");
bench("i32x2-max-s.via-lt",   () => { blackbox(max_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "max-s-via-lt");
bench("i32x2-max-s.old",      () => { blackbox(max_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "max-s-old");
bench("i32x2-max-s.ge-shape", () => { blackbox(max_s_ge_shape(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "max-s-ge-shape");

bench("i32x2-max-u.lib",    () => { blackbox(max_u_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "max-u-lib");
bench("i32x2-max-u.via-lt", () => { blackbox(max_u_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "max-u-via-lt");
bench("i32x2-max-u.old",    () => { blackbox(max_u_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-minmax-comp", "max-u-old");

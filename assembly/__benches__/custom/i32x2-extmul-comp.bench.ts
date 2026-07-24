import { i32x2 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function low_s_lib(a: u64, b: u64): u64 { return i32x2.extmul_low_i16x4_s(a, b); }
// @ts-expect-error: decorator
@inline function low_u_lib(a: u64, b: u64): u64 { return i32x2.extmul_low_i16x4_u(a, b); }
// @ts-expect-error: decorator
@inline function high_s_lib(a: u64, b: u64): u64 { return i32x2.extmul_high_i16x4_s(a, b); }
// @ts-expect-error: decorator
@inline function high_u_lib(a: u64, b: u64): u64 { return i32x2.extmul_high_i16x4_u(a, b); }

// current plain extraction
// @ts-expect-error: decorator
@inline function low_s_current(a: u64, b: u64): u64 {
  const a0 = ((a >> 0) & 0xffff) as i16;
  const a1 = ((a >> 16) & 0xffff) as i16;
  const b0 = ((b >> 0) & 0xffff) as i16;
  const b1 = ((b >> 16) & 0xffff) as i16;
  return ((a0 * b0) as u32 as u64) | (((a1 * b1) as u32 as u64) << 32);
}
// @ts-expect-error: decorator
@inline function low_u_current(a: u64, b: u64): u64 {
  const a0 = ((a >> 0) & 0xffff) as u16;
  const a1 = ((a >> 16) & 0xffff) as u16;
  const b0 = ((b >> 0) & 0xffff) as u16;
  const b1 = ((b >> 16) & 0xffff) as u16;
  return ((a0 * b0) as u32 as u64) | (((a1 * b1) as u32 as u64) << 32);
}
// @ts-expect-error: decorator
@inline function high_s_current(a: u64, b: u64): u64 {
  const a0 = ((a >> 32) & 0xffff) as i16;
  const a1 = ((a >> 48) & 0xffff) as i16;
  const b0 = ((b >> 32) & 0xffff) as i16;
  const b1 = ((b >> 48) & 0xffff) as i16;
  return ((a0 * b0) as u32 as u64) | (((a1 * b1) as u32 as u64) << 32);
}
// @ts-expect-error: decorator
@inline function high_u_current(a: u64, b: u64): u64 {
  const a0 = ((a >> 32) & 0xffff) as u16;
  const a1 = ((a >> 48) & 0xffff) as u16;
  const b0 = ((b >> 32) & 0xffff) as u16;
  const b1 = ((b >> 48) & 0xffff) as u16;
  return ((a0 * b0) as u32 as u64) | (((a1 * b1) as u32 as u64) << 32);
}

// signed arithmetic shift sign extension
// @ts-expect-error: decorator
@inline function low_s_shift(a: u64, b: u64): u64 {
  const a0 = ((a << 48) as i64 >> 48) as i32;
  const a1 = ((a << 32) as i64 >> 48) as i32;
  const b0 = ((b << 48) as i64 >> 48) as i32;
  const b1 = ((b << 32) as i64 >> 48) as i32;
  return ((a0 * b0) as u32 as u64) | (((a1 * b1) as u32 as u64) << 32);
}
// @ts-expect-error: decorator
@inline function high_s_shift(a: u64, b: u64): u64 {
  const a0 = ((a << 16) as i64 >> 48) as i32;
  const a1 = (a as i64 >> 48) as i32;
  const b0 = ((b << 16) as i64 >> 48) as i32;
  const b1 = (b as i64 >> 48) as i32;
  return ((a0 * b0) as u32 as u64) | (((a1 * b1) as u32 as u64) << 32);
}

// unsigned by splitting 32-bit halves first
// @ts-expect-error: decorator
@inline function low_u_halves(a: u64, b: u64): u64 {
  const al = a & 0xffffffff;
  const bl = b & 0xffffffff;
  return (((al & 0xffff) * (bl & 0xffff)) as u32 as u64) | (((((al >> 16) & 0xffff) * ((bl >> 16) & 0xffff)) as u32 as u64) << 32);
}
// @ts-expect-error: decorator
@inline function high_u_halves(a: u64, b: u64): u64 {
  const ah = a >> 32;
  const bh = b >> 32;
  return (((ah & 0xffff) * (bh & 0xffff)) as u32 as u64) | (((((ah >> 16) & 0xffff) * ((bh >> 16) & 0xffff)) as u32 as u64) << 32);
}

bench("i32x2-extmul-low-s.lib", () => { blackbox(low_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "low-s-lib");
bench("i32x2-extmul-low-s.current", () => { blackbox(low_s_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "low-s-current");
bench("i32x2-extmul-low-s.shift", () => { blackbox(low_s_shift(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "low-s-shift");

bench("i32x2-extmul-low-u.lib", () => { blackbox(low_u_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "low-u-lib");
bench("i32x2-extmul-low-u.current", () => { blackbox(low_u_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "low-u-current");
bench("i32x2-extmul-low-u.halves", () => { blackbox(low_u_halves(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "low-u-halves");

bench("i32x2-extmul-high-s.lib", () => { blackbox(high_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "high-s-lib");
bench("i32x2-extmul-high-s.current", () => { blackbox(high_s_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "high-s-current");
bench("i32x2-extmul-high-s.shift", () => { blackbox(high_s_shift(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "high-s-shift");

bench("i32x2-extmul-high-u.lib", () => { blackbox(high_u_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "high-u-lib");
bench("i32x2-extmul-high-u.current", () => { blackbox(high_u_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "high-u-current");
bench("i32x2-extmul-high-u.halves", () => { blackbox(high_u_halves(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-extmul-comp", "high-u-halves");

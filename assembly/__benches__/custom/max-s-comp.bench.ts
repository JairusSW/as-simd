import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

// @ts-expect-error: decorator
@inline function lt_mask_u_current(a: u64, b: u64): u64 {
  const d = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080);
  return ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function max_s_lib(a: u64, b: u64): u64 { return i8x8.max_s(a, b); }

// @ts-expect-error: decorator
@inline function max_s_current(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const mask = lt_mask_u_current(ax, bx);
  return a ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function lt_mask_u_split16(a: u64, b: u64): u64 {
  const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080);
  const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000);
  const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7;
  return ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
}

// @ts-expect-error: decorator
@inline function max_s_split16(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const mask = lt_mask_u_split16(ax, bx);
  return a ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function max_s_dual16(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const mask = lt_mask_u_split16(bx, ax);
  return b ^ ((a ^ b) & mask);
}

const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

bench("max-s.lib", () => { blackbox(max_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("max-s-comp", "lib");
bench("max-s.current", () => { blackbox(max_s_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("max-s-comp", "current");
bench("max-s.split16", () => { blackbox(max_s_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("max-s-comp", "split16");
bench("max-s.dual16", () => { blackbox(max_s_dual16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("max-s-comp", "dual16");

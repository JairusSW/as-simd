import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function min_s_current(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const d = ((ax | 0x8080808080808080) - (bx & ~0x8080808080808080)) ^ ((ax ^ ~bx) & 0x8080808080808080);
  const mask = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
  return b ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function min_s_split16(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const dlo = ((ax | 0x0080008000800080) - (bx & 0x007f007f007f007f)) ^ ((ax ^ ~bx) & 0x0080008000800080);
  const dhi = ((ax | 0x8000800080008000) - (bx & 0x7f007f007f007f00)) ^ ((ax ^ ~bx) & 0x8000800080008000);
  const ml = (((~ax & bx) | (~(ax ^ bx) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~ax & bx) | (~(ax ^ bx) & dhi)) & 0x8000800080008000) >> 7;
  const mask = ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
  return b ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function min_s_via_lt(a: u64, b: u64): u64 {
  const mask = i8x8.lt_s(a, b);
  return b ^ ((a ^ b) & mask);
}

bench("min-s.lib", () => { blackbox(i8x8.min_s(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("min-s-comp", "lib");
bench("min-s.current", () => { blackbox(min_s_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("min-s-comp", "current");
bench("min-s.split16", () => { blackbox(min_s_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("min-s-comp", "split16");
bench("min-s.via-lt", () => { blackbox(min_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("min-s-comp", "via-lt");

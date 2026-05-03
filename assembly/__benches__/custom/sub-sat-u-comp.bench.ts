import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function sub_sat_u_current(a: u64, b: u64): u64 {
  const diff = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
  const mask = ((((~a & b) | (~(a ^ b) & diff)) & 0x8080808080808080) >> 7) * 0xff;
  return diff & ~mask;
}

// @ts-expect-error: decorator
@inline function sub_sat_u_split16(a: u64, b: u64): u64 {
  const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080);
  const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000);
  const diff = (dlo & 0x00ff00ff00ff00ff) | (dhi & 0xff00ff00ff00ff00);
  const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7;
  const mask = ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
  return diff & ~mask;
}

// @ts-expect-error: decorator
@inline function sub_sat_u_min(a: u64, b: u64): u64 {
  return i8x8.sub(a, i8x8.min_u(a, b));
}

bench("sub-sat-u.lib", () => { blackbox(i8x8.sub_sat_u(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("sub-sat-u-comp", "lib");
bench("sub-sat-u.current", () => { blackbox(sub_sat_u_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("sub-sat-u-comp", "current");
bench("sub-sat-u.split16", () => { blackbox(sub_sat_u_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("sub-sat-u-comp", "split16");
bench("sub-sat-u.min", () => { blackbox(sub_sat_u_min(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("sub-sat-u-comp", "min");

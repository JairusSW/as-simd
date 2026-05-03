import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function add_sat_u_current(a: u64, b: u64): u64 {
  const sum = ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
  const d = ((sum | 0x8080808080808080) - (a & ~0x8080808080808080)) ^ ((sum ^ ~a) & 0x8080808080808080);
  const mask = ((((~sum & a) | (~(sum ^ a) & d)) & 0x8080808080808080) >> 7) * 0xff;
  return sum | mask;
}

// @ts-expect-error: decorator
@inline function add_sat_u_split16(a: u64, b: u64): u64 {
  const lo = (a & 0x00ff00ff00ff00ff) + (b & 0x00ff00ff00ff00ff);
  const hi = ((a >> 8) & 0x00ff00ff00ff00ff) + ((b >> 8) & 0x00ff00ff00ff00ff);
  const loCarry = lo & 0x0100010001000100;
  const hiCarry = hi & 0x0100010001000100;
  const loMask = loCarry - (loCarry >> 8);
  const hiMask = hiCarry * 0xff;
  return (lo & 0x00ff00ff00ff00ff) | ((hi & 0x00ff00ff00ff00ff) << 8) | loMask | hiMask;
}

// @ts-expect-error: decorator
@inline function add_sat_u_split32(a: u64, b: u64): u64 {
  const alo = a as u32;
  const blo = b as u32;
  const ahi = (a >> 32) as u32;
  const bhi = (b >> 32) as u32;
  const lo0 = (alo & 0x00ff00ff) + (blo & 0x00ff00ff);
  const hi0 = ((alo >> 8) & 0x00ff00ff) + ((blo >> 8) & 0x00ff00ff);
  const lo1 = (ahi & 0x00ff00ff) + (bhi & 0x00ff00ff);
  const hi1 = ((ahi >> 8) & 0x00ff00ff) + ((bhi >> 8) & 0x00ff00ff);
  const out0 = (lo0 & 0x00ff00ff) | ((hi0 & 0x00ff00ff) << 8) | ((lo0 & 0x01000100) - ((lo0 & 0x01000100) >> 8)) | ((hi0 & 0x01000100) * 0xff);
  const out1 = (lo1 & 0x00ff00ff) | ((hi1 & 0x00ff00ff) << 8) | ((lo1 & 0x01000100) - ((lo1 & 0x01000100) >> 8)) | ((hi1 & 0x01000100) * 0xff);
  return (out0 as u64) | ((out1 as u64) << 32);
}

bench("add-sat-u.lib", () => { blackbox(i8x8.add_sat_u(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("add-sat-u-comp", "lib");
bench("add-sat-u.current", () => { blackbox(add_sat_u_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("add-sat-u-comp", "current");
bench("add-sat-u.split16", () => { blackbox(add_sat_u_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("add-sat-u-comp", "split16");
bench("add-sat-u.split32", () => { blackbox(add_sat_u_split32(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("add-sat-u-comp", "split32");

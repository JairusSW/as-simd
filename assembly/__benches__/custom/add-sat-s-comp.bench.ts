import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function add_sat_s_current(a: u64, b: u64): u64 {
  const sum = ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
  const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
  const mask = overflow * 0xff;
  const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
  return (sum & ~mask) | (limit & mask);
}

// @ts-expect-error: decorator
@inline function add_sat_s_split16(a: u64, b: u64): u64 {
  const slo = ((a & 0x007f007f007f007f) + (b & 0x007f007f007f007f)) ^ ((a ^ b) & 0x0080008000800080);
  const shi = ((a & 0x7f007f007f007f00) + (b & 0x7f007f007f007f00)) ^ ((a ^ b) & 0x8000800080008000);
  const sum = (slo & 0x00ff00ff00ff00ff) | (shi & 0xff00ff00ff00ff00);
  const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
  const mask = overflow * 0xff;
  const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
  return (sum & ~mask) | (limit & mask);
}

// @ts-expect-error: decorator
@inline function add_sat_s_split32(a: u64, b: u64): u64 {
  const alo = a as u32, blo = b as u32;
  const ahi = (a >> 32) as u32, bhi = (b >> 32) as u32;
  const slo = ((alo & 0x7f7f7f7f) + (blo & 0x7f7f7f7f)) ^ ((alo ^ blo) & 0x80808080);
  const shi = ((ahi & 0x7f7f7f7f) + (bhi & 0x7f7f7f7f)) ^ ((ahi ^ bhi) & 0x80808080);
  const sum = (slo as u64) | ((shi as u64) << 32);
  const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
  const mask = overflow * 0xff;
  const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
  return (sum & ~mask) | (limit & mask);
}

bench("add-sat-s.lib", () => { blackbox(i8x8.add_sat_s(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("add-sat-s-comp", "lib");
bench("add-sat-s.current", () => { blackbox(add_sat_s_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("add-sat-s-comp", "current");
bench("add-sat-s.split16", () => { blackbox(add_sat_s_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("add-sat-s-comp", "split16");
bench("add-sat-s.split32", () => { blackbox(add_sat_s_split32(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("add-sat-s-comp", "split32");

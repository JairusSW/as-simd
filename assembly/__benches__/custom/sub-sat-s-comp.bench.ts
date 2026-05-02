import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function sub_sat_s_lib(a: u64, b: u64): u64 { return i8x8.sub_sat_s(a, b); }
// @ts-expect-error: decorator
@inline function sub_sat_s_current(a: u64, b: u64): u64 { const diff = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080); const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7; const mask = overflow * 0xff; const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f); return (diff & ~mask) | (limit & mask); }
// @ts-expect-error: decorator
@inline function sub_sat_s_split16(a: u64, b: u64): u64 { const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080); const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000); const diff = (dlo & 0x00ff00ff00ff00ff) | (dhi & 0xff00ff00ff00ff00); const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7; const mask = overflow * 0xff; const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f); return (diff & ~mask) | (limit & mask); }
// @ts-expect-error: decorator
@inline function sub_sat_s_split32(a: u64, b: u64): u64 { const alo = a as u32, blo = b as u32; const ahi = (a >> 32) as u32, bhi = (b >> 32) as u32; const dlo = ((alo | 0x80808080) - (blo & 0x7f7f7f7f)) ^ ((alo ^ ~blo) & 0x80808080); const dhi = ((ahi | 0x80808080) - (bhi & 0x7f7f7f7f)) ^ ((ahi ^ ~bhi) & 0x80808080); const diff = (dlo as u64) | ((dhi as u64) << 32); const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7; const mask = overflow * 0xff; const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f); return (diff & ~mask) | (limit & mask); }
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;
bench("sub-sat-s.lib", () => { blackbox(sub_sat_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("sub-sat-s-comp", "lib");
bench("sub-sat-s.current", () => { blackbox(sub_sat_s_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("sub-sat-s-comp", "current");
bench("sub-sat-s.split16", () => { blackbox(sub_sat_s_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("sub-sat-s-comp", "split16");
bench("sub-sat-s.split32", () => { blackbox(sub_sat_s_split32(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("sub-sat-s-comp", "split32");

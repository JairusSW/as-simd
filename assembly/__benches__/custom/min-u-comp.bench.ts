import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function lt_mask_u_current(a: u64, b: u64): u64 { const d = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080); return ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff; }
// @ts-expect-error: decorator
@inline function min_u_lib(a: u64, b: u64): u64 { return i8x8.min_u(a, b); }
// @ts-expect-error: decorator
@inline function min_u_current(a: u64, b: u64): u64 { const mask = lt_mask_u_current(a, b); return b ^ ((a ^ b) & mask); }
// @ts-expect-error: decorator
@inline function lt_mask_u_split32(a: u64, b: u64): u64 { const alo = a as u32, blo = b as u32; const ahi = (a >> 32) as u32, bhi = (b >> 32) as u32; const dlo = ((alo | 0x80808080) - (blo & 0x7f7f7f7f)) ^ ((alo ^ ~blo) & 0x80808080); const dhi = ((ahi | 0x80808080) - (bhi & 0x7f7f7f7f)) ^ ((ahi ^ ~bhi) & 0x80808080); const mlo = (((~alo & blo) | (~(alo ^ blo) & dlo)) & 0x80808080) >> 7; const mhi = (((~ahi & bhi) | (~(ahi ^ bhi) & dhi)) & 0x80808080) >> 7; return ((mlo * 0xff) as u64) | (((mhi * 0xff) as u64) << 32); }
// @ts-expect-error: decorator
@inline function min_u_split32(a: u64, b: u64): u64 { const mask = lt_mask_u_split32(a, b); return b ^ ((a ^ b) & mask); }
// @ts-expect-error: decorator
@inline function min_u_split16(a: u64, b: u64): u64 { const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080); const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000); const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7; const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7; const mask = ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00); return b ^ ((a ^ b) & mask); }
const a: u64 = 0xfedcba9876543210; const b: u64 = 0x7766554433221100;
bench("min-u.lib", () => { blackbox(min_u_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("min-u-comp", "lib");
bench("min-u.current", () => { blackbox(min_u_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("min-u-comp", "current");
bench("min-u.split32", () => { blackbox(min_u_split32(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("min-u-comp", "split32");
bench("min-u.split16", () => { blackbox(min_u_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("min-u-comp", "split16");

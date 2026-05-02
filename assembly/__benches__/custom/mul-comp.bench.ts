import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function mul_lib(a: u64, b: u64): u64 { return i8x8.mul(a, b); }
// @ts-expect-error: decorator
@inline function mul_split32(a: u64, b: u64): u64 { const alo = a as u32; const blo = b as u32; const ahi = (a >> 32) as u32; const bhi = (b >> 32) as u32; const lo = (((alo & 0xff) * (blo & 0xff)) & 0xff) | (((((alo >> 8) & 0xff) * ((blo >> 8) & 0xff)) & 0xff) << 8) | (((((alo >> 16) & 0xff) * ((blo >> 16) & 0xff)) & 0xff) << 16) | (((((alo >> 24) & 0xff) * ((blo >> 24) & 0xff)) & 0xff) << 24); const hi = (((ahi & 0xff) * (bhi & 0xff)) & 0xff) | (((((ahi >> 8) & 0xff) * ((bhi >> 8) & 0xff)) & 0xff) << 8) | (((((ahi >> 16) & 0xff) * ((bhi >> 16) & 0xff)) & 0xff) << 16) | (((((ahi >> 24) & 0xff) * ((bhi >> 24) & 0xff)) & 0xff) << 24); return (lo as u64) | ((hi as u64) << 32); }
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;
bench("mul.lib", () => { blackbox(mul_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("mul-comp", "lib");
bench("mul.split32", () => { blackbox(mul_split32(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("mul-comp", "split32");

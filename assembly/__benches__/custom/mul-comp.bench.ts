import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function mul_lib(a: u64, b: u64): u64 { return i8x8.mul(a, b); }
// @ts-expect-error: decorator
@inline function mul_shift64(a: u64, b: u64): u64 {
  return (
    (((a & 0xff) * (b & 0xff)) & 0xff) |
    (((((a >> 8) & 0xff) * ((b >> 8) & 0xff)) & 0xff) << 8) |
    (((((a >> 16) & 0xff) * ((b >> 16) & 0xff)) & 0xff) << 16) |
    (((((a >> 24) & 0xff) * ((b >> 24) & 0xff)) & 0xff) << 24) |
    (((((a >> 32) & 0xff) * ((b >> 32) & 0xff)) & 0xff) << 32) |
    (((((a >> 40) & 0xff) * ((b >> 40) & 0xff)) & 0xff) << 40) |
    (((((a >> 48) & 0xff) * ((b >> 48) & 0xff)) & 0xff) << 48) |
    (((((a >> 56) & 0xff) * ((b >> 56) & 0xff)) & 0xff) << 56)
  );
}
// @ts-expect-error: decorator
@inline function mul_split32(a: u64, b: u64): u64 { const alo = a as u32; const blo = b as u32; const ahi = (a >> 32) as u32; const bhi = (b >> 32) as u32; const lo = (((alo & 0xff) * (blo & 0xff)) & 0xff) | (((((alo >> 8) & 0xff) * ((blo >> 8) & 0xff)) & 0xff) << 8) | (((((alo >> 16) & 0xff) * ((blo >> 16) & 0xff)) & 0xff) << 16) | (((((alo >> 24) & 0xff) * ((blo >> 24) & 0xff)) & 0xff) << 24); const hi = (((ahi & 0xff) * (bhi & 0xff)) & 0xff) | (((((ahi >> 8) & 0xff) * ((bhi >> 8) & 0xff)) & 0xff) << 8) | (((((ahi >> 16) & 0xff) * ((bhi >> 16) & 0xff)) & 0xff) << 16) | (((((ahi >> 24) & 0xff) * ((bhi >> 24) & 0xff)) & 0xff) << 24); return (lo as u64) | ((hi as u64) << 32); }
// @ts-expect-error: decorator
@inline function mul_split16(a: u64, b: u64): u64 {
  const p0 = (((a & 0xff) * (b & 0xff)) & 0xff) | (((((a >> 8) & 0xff) * ((b >> 8) & 0xff)) & 0xff) << 8);
  const p1 = (((((a >> 16) & 0xff) * ((b >> 16) & 0xff)) & 0xff) | (((((a >> 24) & 0xff) * ((b >> 24) & 0xff)) & 0xff) << 8)) << 16;
  const p2 = (((((a >> 32) & 0xff) * ((b >> 32) & 0xff)) & 0xff) | (((((a >> 40) & 0xff) * ((b >> 40) & 0xff)) & 0xff) << 8)) << 32;
  const p3 = (((((a >> 48) & 0xff) * ((b >> 48) & 0xff)) & 0xff) | (((((a >> 56) & 0xff) * ((b >> 56) & 0xff)) & 0xff) << 8)) << 48;
  return p0 | p1 | p2 | p3;
}
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;
bench("mul.lib", () => { blackbox(mul_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("mul-comp", "lib");
bench("mul.shift64", () => { blackbox(mul_shift64(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("mul-comp", "shift64");
bench("mul.split32", () => { blackbox(mul_split32(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("mul-comp", "split32");
bench("mul.split16", () => { blackbox(mul_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("mul-comp", "split16");

import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

// @ts-expect-error: decorator
@inline function avgr_lib(a: u64, b: u64): u64 { return i8x8.avgr_u(a, b); }
// @ts-expect-error: decorator
@inline function avgr_current(a: u64, b: u64): u64 { return (a | b) - (((a ^ b) & ~0x0101010101010101) >> 1); }
// @ts-expect-error: decorator
@inline function avgr_current_const(a: u64, b: u64): u64 { return (a | b) - (((a ^ b) & 0xfefefefefefefefe) >> 1); }
// @ts-expect-error: decorator
@inline function avgr_and_xor(a: u64, b: u64): u64 { return (a & b) + (((a ^ b) + 0x0101010101010101) >> 1); }
// @ts-expect-error: decorator
@inline function avgr_or_xor_masked(a: u64, b: u64): u64 { const x = a ^ b; return (a | b) - ((x >> 1) & 0x7f7f7f7f7f7f7f7f); }
// @ts-expect-error: decorator
@inline function avgr_split32(a: u64, b: u64): u64 { const alo = a as u32; const blo = b as u32; const ahi = (a >> 32) as u32; const bhi = (b >> 32) as u32; const lo = (alo | blo) - (((alo ^ blo) & 0xfefefefe) >> 1); const hi = (ahi | bhi) - (((ahi ^ bhi) & 0xfefefefe) >> 1); return (lo as u64) | ((hi as u64) << 32); }
// @ts-expect-error: decorator
@inline function avgr_split16(a: u64, b: u64): u64 { const lo = ((a | b) - (((a ^ b) & 0x00fe00fe00fe00fe) >> 1)) & 0x00ff00ff00ff00ff; const hi = ((a | b) - (((a ^ b) & 0xfe00fe00fe00fe00) >> 1)) & 0xff00ff00ff00ff00; return lo | hi; }

const avgr_a: u64 = 0xfedcba9876543210;
const avgr_b: u64 = 0x7766554433221100;
bench("avgr-u.lib", () => { blackbox(avgr_lib(blackbox(avgr_a), blackbox(avgr_b))); }, OPS, 8); dumpToFile("avgr-u-comp", "lib");
bench("avgr-u.current", () => { blackbox(avgr_current(blackbox(avgr_a), blackbox(avgr_b))); }, OPS, 8); dumpToFile("avgr-u-comp", "current");
bench("avgr-u.current-const", () => { blackbox(avgr_current_const(blackbox(avgr_a), blackbox(avgr_b))); }, OPS, 8); dumpToFile("avgr-u-comp", "current-const");
bench("avgr-u.or-xor-masked", () => { blackbox(avgr_or_xor_masked(blackbox(avgr_a), blackbox(avgr_b))); }, OPS, 8); dumpToFile("avgr-u-comp", "or-xor-masked");
bench("avgr-u.split32", () => { blackbox(avgr_split32(blackbox(avgr_a), blackbox(avgr_b))); }, OPS, 8); dumpToFile("avgr-u-comp", "split32");
bench("avgr-u.split16", () => { blackbox(avgr_split16(blackbox(avgr_a), blackbox(avgr_b))); }, OPS, 8); dumpToFile("avgr-u-comp", "split16");

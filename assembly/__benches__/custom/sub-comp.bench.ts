import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

// @ts-expect-error: decorator
@inline function add_nibble(a: u64, b: u64): u64 { const lo = (a & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f); const hi = (a & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010); return (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0); }
// @ts-expect-error: decorator
@inline function sub_lib(a: u64, b: u64): u64 { return i8x8.sub(a, b); }
// @ts-expect-error: decorator
@inline function sub_split32(a: u64, b: u64): u64 { const alo = a as u32, blo = b as u32; const ahi = (a >> 32) as u32, bhi = (b >> 32) as u32; const lo = ((alo | 0x80808080) - (blo & 0x7f7f7f7f)) ^ ((alo ^ ~blo) & 0x80808080); const hi = ((ahi | 0x80808080) - (bhi & 0x7f7f7f7f)) ^ ((ahi ^ ~bhi) & 0x80808080); return (lo as u64) | ((hi as u64) << 32); }
// @ts-expect-error: decorator
@inline function sub_split32_reassoc(a: u64, b: u64): u64 { const alo = a as u32, ahi = (a >> 32) as u32; const blo = b as u32, bhi = (b >> 32) as u32; const bxlo = blo & 0x7f7f7f7f, bxhi = bhi & 0x7f7f7f7f; const lo = ((alo | 0x80808080) - bxlo) ^ ((alo ^ ~blo) & 0x80808080); const hi = ((ahi | 0x80808080) - bxhi) ^ ((ahi ^ ~bhi) & 0x80808080); return (lo as u64) | ((hi as u64) << 32); }
// @ts-expect-error: decorator
@inline function sub_add_neg_nibble(a: u64, b: u64): u64 { return add_nibble(a, add_nibble(~b, 0x0101010101010101)); }
// @ts-expect-error: decorator
@inline function sub_add_neg_nibble_xor(a: u64, b: u64): u64 { return add_nibble(a, add_nibble(b ^ 0xffffffffffffffff, 0x0101010101010101)); }

const sub_a: u64 = 0xfedcba9876543210;
const sub_b: u64 = 0x7766554433221100;
bench("sub.lib", () => { blackbox(sub_lib(blackbox(sub_a), blackbox(sub_b))); }, OPS, 8); dumpToFile("sub-comp", "lib");
bench("sub.split32", () => { blackbox(sub_split32(blackbox(sub_a), blackbox(sub_b))); }, OPS, 8); dumpToFile("sub-comp", "split32");
bench("sub.split32-reassoc", () => { blackbox(sub_split32_reassoc(blackbox(sub_a), blackbox(sub_b))); }, OPS, 8); dumpToFile("sub-comp", "split32-reassoc");
bench("sub.add-neg-nibble", () => { blackbox(sub_add_neg_nibble(blackbox(sub_a), blackbox(sub_b))); }, OPS, 8); dumpToFile("sub-comp", "add-neg-nibble");
bench("sub.add-neg-nibble-xor", () => { blackbox(sub_add_neg_nibble_xor(blackbox(sub_a), blackbox(sub_b))); }, OPS, 8); dumpToFile("sub-comp", "add-neg-nibble-xor");

import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

// @ts-expect-error: decorator
@inline function add_nibble(a: u64, b: u64): u64 { const lo = (a & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f); const hi = (a & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010); return (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0); }
// @ts-expect-error: decorator
@inline function sub_guarded(a: u64, b: u64): u64 { return ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080); }
// @ts-expect-error: decorator
@inline function neg_guarded(a: u64): u64 { return (0x8080808080808080 - (a & 0x7f7f7f7f7f7f7f7f)) ^ (~a & 0x8080808080808080); }
// @ts-expect-error: decorator
@inline function neg_add_nibble(a: u64): u64 { return add_nibble(~a, 0x0101010101010101); }
// @ts-expect-error: decorator
@inline function sign_mask(a: u64): u64 { return ((a & 0x8080808080808080) >> 7) * 0xff; }
// @ts-expect-error: decorator
@inline function abs_lib(a: u64): u64 { return i8x8.abs(a); }
// @ts-expect-error: decorator
@inline function abs_current(a: u64): u64 { const mask = sign_mask(a); const x = a ^ mask; return sub_guarded(x, mask); }
// @ts-expect-error: decorator
@inline function abs_neg_select(a: u64): u64 { const mask = sign_mask(a); const neg = neg_guarded(a); return a ^ ((a ^ neg) & mask); }
// @ts-expect-error: decorator
@inline function abs_neg_add_select(a: u64): u64 { const mask = sign_mask(a); const neg = neg_add_nibble(a); return a ^ ((a ^ neg) & mask); }
// @ts-expect-error: decorator
@inline function abs_xor_add(a: u64): u64 { const mask = sign_mask(a); return add_nibble(a ^ mask, mask & 0x0101010101010101); }
// @ts-expect-error: decorator
@inline function abs_xor_sub(a: u64): u64 { const mask = sign_mask(a); return add_nibble(a ^ mask, add_nibble(~mask, 0x0101010101010101)); }
// @ts-expect-error: decorator
@inline function abs_split32(a: u64): u64 { const alo = a as u32; const ahi = (a >> 32) as u32; const mlo = ((alo & 0x80808080) >> 7) * 0xff; const mhi = ((ahi & 0x80808080) >> 7) * 0xff; const xlo = alo ^ mlo; const xhi = ahi ^ mhi; const lo = ((xlo | 0x80808080) - (mlo & 0x7f7f7f7f)) ^ ((xlo ^ ~mlo) & 0x80808080); const hi = ((xhi | 0x80808080) - (mhi & 0x7f7f7f7f)) ^ ((xhi ^ ~mhi) & 0x80808080); return (lo as u64) | ((hi as u64) << 32); }

const abs_a: u64 = 0xfedcba9876543210;
bench("abs.lib", () => { blackbox(abs_lib(blackbox(abs_a))); }, OPS, 8); dumpToFile("abs-comp", "lib");
bench("abs.current", () => { blackbox(abs_current(blackbox(abs_a))); }, OPS, 8); dumpToFile("abs-comp", "current");
bench("abs.neg-select", () => { blackbox(abs_neg_select(blackbox(abs_a))); }, OPS, 8); dumpToFile("abs-comp", "neg-select");
bench("abs.neg-add-select", () => { blackbox(abs_neg_add_select(blackbox(abs_a))); }, OPS, 8); dumpToFile("abs-comp", "neg-add-select");
bench("abs.xor-add", () => { blackbox(abs_xor_add(blackbox(abs_a))); }, OPS, 8); dumpToFile("abs-comp", "xor-add");
bench("abs.xor-sub", () => { blackbox(abs_xor_sub(blackbox(abs_a))); }, OPS, 8); dumpToFile("abs-comp", "xor-sub");
bench("abs.split32", () => { blackbox(abs_split32(blackbox(abs_a))); }, OPS, 8); dumpToFile("abs-comp", "split32");

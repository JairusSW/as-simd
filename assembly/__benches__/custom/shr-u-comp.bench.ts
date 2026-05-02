import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function shr_u_lib(a: u64, b: i32): u64 { return i8x8.shr_u(a, b); }
// @ts-expect-error: decorator
@inline function shr_u_current(a: u64, b: i32): u64 { const shift = b & 7; return (a & ((((0xff << shift) & 0xff) as u64) * 0x0101010101010101)) >> shift; }
// @ts-expect-error: decorator
@inline function shr_u_logical_mask(a: u64, b: i32): u64 { const shift = b & 7; const keep = (((0xff >> shift) & 0xff) as u64) * 0x0101010101010101; return (a >> shift) & keep; }
// @ts-expect-error: decorator
@inline function shr_u_split32(a: u64, b: i32): u64 { const shift = b & 7; const mask = (((0xff << shift) & 0xff) as u32) * 0x01010101; const lo = ((a as u32) & mask) >> shift; const hi = (((a >> 32) as u32) & mask) >> shift; return (lo as u64) | ((hi as u64) << 32); }
// @ts-expect-error: decorator
@inline function shr_u_switch(a: u64, b: i32): u64 { switch (b & 7) { case 0: return a; case 1: return (a >> 1) & 0x7f7f7f7f7f7f7f7f; case 2: return (a >> 2) & 0x3f3f3f3f3f3f3f3f; case 3: return (a >> 3) & 0x1f1f1f1f1f1f1f1f; case 4: return (a >> 4) & 0x0f0f0f0f0f0f0f0f; case 5: return (a >> 5) & 0x0707070707070707; case 6: return (a >> 6) & 0x0303030303030303; default: return (a >> 7) & 0x0101010101010101; } }
const a: u64 = 0xfedcba9876543210;
const s: i32 = 3;
bench("shr-u.lib", () => { blackbox(shr_u_lib(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("shr-u-comp", "lib");
bench("shr-u.current", () => { blackbox(shr_u_current(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("shr-u-comp", "current");
bench("shr-u.logical-mask", () => { blackbox(shr_u_logical_mask(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("shr-u-comp", "logical-mask");
bench("shr-u.split32", () => { blackbox(shr_u_split32(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("shr-u-comp", "split32");
bench("shr-u.switch", () => { blackbox(shr_u_switch(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("shr-u-comp", "switch");

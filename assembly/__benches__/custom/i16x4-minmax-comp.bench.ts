import { i16x4 } from "../../v64/i16x4";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function min_s_lib(a: u64, b: u64): u64 { return i16x4.min_s(a, b); }
// @ts-expect-error: decorator
@inline function min_s_via_lt(a: u64, b: u64): u64 { const m = i16x4.lt_s(a, b); return b ^ ((a ^ b) & m); }
// @ts-expect-error: decorator
@inline function min_u_lib(a: u64, b: u64): u64 { return i16x4.min_u(a, b); }
// @ts-expect-error: decorator
@inline function min_u_via_lt(a: u64, b: u64): u64 { const m = i16x4.lt_u(a, b); return b ^ ((a ^ b) & m); }
// @ts-expect-error: decorator
@inline function max_s_lib(a: u64, b: u64): u64 { return i16x4.max_s(a, b); }
// @ts-expect-error: decorator
@inline function max_s_via_lt(a: u64, b: u64): u64 { const m = i16x4.lt_s(a, b); return a ^ ((a ^ b) & m); }
// @ts-expect-error: decorator
@inline function max_u_lib(a: u64, b: u64): u64 { return i16x4.max_u(a, b); }
// @ts-expect-error: decorator
@inline function max_u_via_lt(a: u64, b: u64): u64 { const m = i16x4.lt_u(a, b); return a ^ ((a ^ b) & m); }

bench("i16x4-min-s.lib", () => { blackbox(min_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-minmax-comp", "min-s-lib");
bench("i16x4-min-s.via-lt", () => { blackbox(min_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-minmax-comp", "min-s-via-lt");
bench("i16x4-min-u.lib", () => { blackbox(min_u_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-minmax-comp", "min-u-lib");
bench("i16x4-min-u.via-lt", () => { blackbox(min_u_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-minmax-comp", "min-u-via-lt");
bench("i16x4-max-s.lib", () => { blackbox(max_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-minmax-comp", "max-s-lib");
bench("i16x4-max-s.via-lt", () => { blackbox(max_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-minmax-comp", "max-s-via-lt");
bench("i16x4-max-u.lib", () => { blackbox(max_u_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-minmax-comp", "max-u-lib");
bench("i16x4-max-u.via-lt", () => { blackbox(max_u_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-minmax-comp", "max-u-via-lt");

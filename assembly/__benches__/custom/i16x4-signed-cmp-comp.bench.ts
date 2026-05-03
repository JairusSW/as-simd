import { i16x4 } from "../../v64/i16x4";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function lt_s_lib(a: u64, b: u64): u64 { return i16x4.lt_s(a, b); }
// @ts-expect-error: decorator
@inline function lt_s_via_ge(a: u64, b: u64): u64 { return ~i16x4.ge_s(a, b); }
// @ts-expect-error: decorator
@inline function lt_s_old(a: u64, b: u64): u64 { const ax = a ^ 0x8000800080008000; const bx = b ^ 0x8000800080008000; const dlo = ((ax | 0x0000800000008000) - (bx & 0x00007fff00007fff)) ^ ((ax ^ ~bx) & 0x0000800000008000); const dhi = ((ax | 0x8000000080000000) - (bx & 0x7fff00007fff0000)) ^ ((ax ^ ~bx) & 0x8000000080000000); const ml = (((~ax & bx) | (~(ax ^ bx) & dlo)) & 0x0000800000008000) >> 15; const mh = (((~ax & bx) | (~(ax ^ bx) & dhi)) & 0x8000000080000000) >> 15; return ((ml * 0xffff) & 0x0000ffff0000ffff) | ((mh * 0xffff) & 0xffff0000ffff0000); }
// @ts-expect-error: decorator
@inline function le_s_lib(a: u64, b: u64): u64 { return i16x4.le_s(a, b); }
// @ts-expect-error: decorator
@inline function le_s_via_ge(a: u64, b: u64): u64 { return i16x4.ge_s(b, a); }
// @ts-expect-error: decorator
@inline function gt_s_lib(a: u64, b: u64): u64 { return i16x4.gt_s(a, b); }
// @ts-expect-error: decorator
@inline function gt_s_via_le(a: u64, b: u64): u64 { return ~i16x4.le_s(a, b); }
// @ts-expect-error: decorator
@inline function ge_s_lib(a: u64, b: u64): u64 { return i16x4.ge_s(a, b); }
// @ts-expect-error: decorator
@inline function ge_s_via_lt(a: u64, b: u64): u64 { return ~i16x4.lt_s(a, b); }

bench("i16x4-lt-s.lib", () => { blackbox(lt_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "lt-lib");
bench("i16x4-lt-s.via-ge", () => { blackbox(lt_s_via_ge(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "lt-via-ge");
bench("i16x4-lt-s.old", () => { blackbox(lt_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "lt-old");
bench("i16x4-le-s.lib", () => { blackbox(le_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "le-lib");
bench("i16x4-le-s.via-ge", () => { blackbox(le_s_via_ge(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "le-via-ge");
bench("i16x4-gt-s.lib", () => { blackbox(gt_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "gt-lib");
bench("i16x4-gt-s.via-le", () => { blackbox(gt_s_via_le(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "gt-via-le");
bench("i16x4-ge-s.lib", () => { blackbox(ge_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "ge-lib");
bench("i16x4-ge-s.via-lt", () => { blackbox(ge_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-signed-cmp-comp", "ge-via-lt");

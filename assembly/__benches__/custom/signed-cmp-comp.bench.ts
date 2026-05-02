import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function le_s_lib(a: u64, b: u64): u64 { return i8x8.le_s(a, b); }
// @ts-expect-error: decorator
@inline function gt_s_lib(a: u64, b: u64): u64 { return i8x8.gt_s(a, b); }
// @ts-expect-error: decorator
@inline function le_s_via_ge(a: u64, b: u64): u64 { return i8x8.ge_s(b, a); }
// @ts-expect-error: decorator
@inline function gt_s_via_lt(a: u64, b: u64): u64 { return i8x8.lt_s(b, a); }
// @ts-expect-error: decorator
@inline function le_s_old(a: u64, b: u64): u64 { const bx = b ^ 0x8080808080808080; const ax = a ^ 0x8080808080808080; const d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080); return ~(((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff); }
// @ts-expect-error: decorator
@inline function gt_s_old(a: u64, b: u64): u64 { const bx = b ^ 0x8080808080808080; const ax = a ^ 0x8080808080808080; const d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080); return ((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff; }
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;
bench("le-s.lib", () => { blackbox(le_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("signed-cmp-comp", "le-lib");
bench("le-s.via-ge", () => { blackbox(le_s_via_ge(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("signed-cmp-comp", "le-via-ge");
bench("le-s.old", () => { blackbox(le_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("signed-cmp-comp", "le-old");
bench("gt-s.lib", () => { blackbox(gt_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("signed-cmp-comp", "gt-lib");
bench("gt-s.via-lt", () => { blackbox(gt_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("signed-cmp-comp", "gt-via-lt");
bench("gt-s.old", () => { blackbox(gt_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("signed-cmp-comp", "gt-old");

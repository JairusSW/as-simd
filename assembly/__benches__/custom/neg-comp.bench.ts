import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function add8(a: u64, b: u64): u64 { const lo = (a & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f); const hi = (a & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010); return (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0); }
// @ts-expect-error: decorator
@inline function neg_lib(a: u64): u64 { return i8x8.neg(a); }
// @ts-expect-error: decorator
@inline function neg_current(a: u64): u64 { return (0x8080808080808080 - (a & 0x7f7f7f7f7f7f7f7f)) ^ (~a & 0x8080808080808080); }
// @ts-expect-error: decorator
@inline function neg_add(a: u64): u64 { return add8(~a, 0x0101010101010101); }
const a: u64 = 0xfedcba9876543210;
bench("neg.lib", () => { blackbox(neg_lib(blackbox(a))); }, OPS, 8); dumpToFile("neg-comp", "lib");
bench("neg.current", () => { blackbox(neg_current(blackbox(a))); }, OPS, 8); dumpToFile("neg-comp", "current");
bench("neg.add", () => { blackbox(neg_add(blackbox(a))); }, OPS, 8); dumpToFile("neg-comp", "add");

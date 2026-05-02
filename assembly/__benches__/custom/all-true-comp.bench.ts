import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function all_true_lib(a: u64): bool { return i8x8.all_true(a); }
// @ts-expect-error: decorator
@inline function all_true_current(a: u64): bool { return ((((a & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | a) & 0x8080808080808080) == 0x8080808080808080; }
// @ts-expect-error: decorator
@inline function all_true_haszero(a: u64): bool { return (((a - 0x0101010101010101) & ~a & 0x8080808080808080) == 0); }
const a: u64 = 0xfedcba9876543210;
bench("all-true.lib", () => { blackbox(all_true_lib(blackbox(a))); }, OPS, 8); dumpToFile("all-true-comp", "lib");
bench("all-true.current", () => { blackbox(all_true_current(blackbox(a))); }, OPS, 8); dumpToFile("all-true-comp", "current");
bench("all-true.haszero", () => { blackbox(all_true_haszero(blackbox(a))); }, OPS, 8); dumpToFile("all-true-comp", "haszero");

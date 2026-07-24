import { i16x4 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;

// @ts-expect-error: decorator
@inline function popcnt_lib(x: u64): u64 { return i16x4.popcnt(x); }
// @ts-expect-error: decorator
@inline function popcnt_current(x: u64): u64 { x = x - ((x >> 1) & 0x5555555555555555); x = (x & 0x3333333333333333) + ((x >> 2) & 0x3333333333333333); x = (x + (x >> 4)) & 0x0f0f0f0f0f0f0f0f; return (x + (x >> 8)) & 0x001f001f001f001f; }
// @ts-expect-error: decorator
@inline function popcnt_current5(x: u64): u64 { x = x - ((x >> 1) & 0x5555555555555555); x = (x & 0x3333333333333333) + ((x >> 2) & 0x3333333333333333); x = (x + (x >> 4)) & 0x0f0f0f0f0f0f0f0f; x = (x + (x >> 8)) & 0x001f001f001f001f; return x; }
// @ts-expect-error: decorator
@inline function popcnt_split32(x: u64): u64 { let lo = x as u32; let hi = (x >> 32) as u32; lo = lo - ((lo >> 1) & 0x55555555); hi = hi - ((hi >> 1) & 0x55555555); lo = (lo & 0x33333333) + ((lo >> 2) & 0x33333333); hi = (hi & 0x33333333) + ((hi >> 2) & 0x33333333); lo = (lo + (lo >> 4)) & 0x0f0f0f0f; hi = (hi + (hi >> 4)) & 0x0f0f0f0f; return (((lo + (lo >> 8)) & 0x001f001f) as u64) | ((((hi + (hi >> 8)) & 0x001f001f) as u64) << 32); }
// @ts-expect-error: decorator
@inline function popcnt_intrinsic_lanes(x: u64): u64 { return (<u64>popcnt<u32>((x & 0xffff) as u32)) | (<u64>popcnt<u32>(((x >> 16) & 0xffff) as u32) << 16) | (<u64>popcnt<u32>(((x >> 32) & 0xffff) as u32) << 32) | (<u64>popcnt<u32>(((x >> 48) & 0xffff) as u32) << 48); }

bench("i16x4-popcnt.lib", () => { blackbox(popcnt_lib(blackbox(a))); }, OPS, 8); dumpToFile("i16x4-popcnt-comp", "lib");
bench("i16x4-popcnt.current", () => { blackbox(popcnt_current(blackbox(a))); }, OPS, 8); dumpToFile("i16x4-popcnt-comp", "current");
bench("i16x4-popcnt.current5", () => { blackbox(popcnt_current5(blackbox(a))); }, OPS, 8); dumpToFile("i16x4-popcnt-comp", "current5");
bench("i16x4-popcnt.split32", () => { blackbox(popcnt_split32(blackbox(a))); }, OPS, 8); dumpToFile("i16x4-popcnt-comp", "split32");
bench("i16x4-popcnt.intrinsic-lanes", () => { blackbox(popcnt_intrinsic_lanes(blackbox(a))); }, OPS, 8); dumpToFile("i16x4-popcnt-comp", "intrinsic-lanes");

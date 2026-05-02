import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function extract_u_lib(x: u64, idx: u8): u8 { return i8x8.extract_lane_u(x, idx); }
// @ts-expect-error: decorator
@inline function extract_s_lib(x: u64, idx: u8): i8 { return i8x8.extract_lane_s(x, idx); }
// @ts-expect-error: decorator
@inline function extract_u_current(x: u64, idx: u8): u8 { return ((x >> (idx << 3)) & 0xff) as u8; }
// @ts-expect-error: decorator
@inline function extract_u_switch(x: u64, idx: u8): u8 { switch (idx & 7) { case 0: return x as u8; case 1: return (x >> 8) as u8; case 2: return (x >> 16) as u8; case 3: return (x >> 24) as u8; case 4: return (x >> 32) as u8; case 5: return (x >> 40) as u8; case 6: return (x >> 48) as u8; default: return (x >> 56) as u8; } }
const a: u64 = 0xfedcba9876543210;
const lane: u8 = 5;
bench("extract-u.lib", () => { blackbox(extract_u_lib(blackbox(a), blackbox(lane))); }, OPS, 1); dumpToFile("extract-lane-comp", "u-lib");
bench("extract-u.current", () => { blackbox(extract_u_current(blackbox(a), blackbox(lane))); }, OPS, 1); dumpToFile("extract-lane-comp", "u-current");
bench("extract-u.switch", () => { blackbox(extract_u_switch(blackbox(a), blackbox(lane))); }, OPS, 1); dumpToFile("extract-lane-comp", "u-switch");
bench("extract-s.lib", () => { blackbox(extract_s_lib(blackbox(a), blackbox(lane))); }, OPS, 1); dumpToFile("extract-lane-comp", "s-lib");
bench("extract-s.switch", () => { blackbox(extract_u_switch(blackbox(a), blackbox(lane)) as i8); }, OPS, 1); dumpToFile("extract-lane-comp", "s-switch");

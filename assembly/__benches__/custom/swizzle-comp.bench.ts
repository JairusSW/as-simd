import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
const tmp = memory.data(8);
// @ts-expect-error: decorator
@inline function relaxed_lib(a: u64, s: u64): u64 { return i8x8.relaxed_swizzle(a, s); }
// @ts-expect-error: decorator
@inline function swizzle_lib(a: u64, s: u64): u64 { return i8x8.swizzle(a, s); }
// @ts-expect-error: decorator
@inline function relaxed_mem(a: u64, s: u64): u64 { store<u64>(tmp, a); return (load<u8>(tmp + ((s & 7) as usize)) as u64) | ((load<u8>(tmp + (((s >> 8) & 7) as usize)) as u64) << 8) | ((load<u8>(tmp + (((s >> 16) & 7) as usize)) as u64) << 16) | ((load<u8>(tmp + (((s >> 24) & 7) as usize)) as u64) << 24) | ((load<u8>(tmp + (((s >> 32) & 7) as usize)) as u64) << 32) | ((load<u8>(tmp + (((s >> 40) & 7) as usize)) as u64) << 40) | ((load<u8>(tmp + (((s >> 48) & 7) as usize)) as u64) << 48) | ((load<u8>(tmp + (((s >> 56) & 7) as usize)) as u64) << 56); }
// @ts-expect-error: decorator
@inline function swizzle_mem(a: u64, s: u64): u64 { const x = s & 0xf8f8f8f8f8f8f8f8; const valid = ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff; return relaxed_mem(a, s) & valid; }
const a: u64 = 0xfedcba9876543210;
const s: u64 = 0x7766554433221100;
bench("swizzle.lib", () => { blackbox(swizzle_lib(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "lib");
bench("swizzle.mem", () => { blackbox(swizzle_mem(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "mem");
bench("relaxed-swizzle.lib", () => { blackbox(relaxed_lib(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "relaxed-lib");
bench("relaxed-swizzle.mem", () => { blackbox(relaxed_mem(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "relaxed-mem");

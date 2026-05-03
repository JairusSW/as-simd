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
@inline function relaxed_shift(a: u64, s: u64): u64 { const i0 = (s & 0x07) as u64; const i1 = ((s >> 8) & 0x07) as u64; const i2 = ((s >> 16) & 0x07) as u64; const i3 = ((s >> 24) & 0x07) as u64; const i4 = ((s >> 32) & 0x07) as u64; const i5 = ((s >> 40) & 0x07) as u64; const i6 = ((s >> 48) & 0x07) as u64; const i7 = ((s >> 56) & 0x07) as u64; return ((a >> (i0 << 3)) & 0xff) | (((a >> (i1 << 3)) & 0xff) << 8) | (((a >> (i2 << 3)) & 0xff) << 16) | (((a >> (i3 << 3)) & 0xff) << 24) | (((a >> (i4 << 3)) & 0xff) << 32) | (((a >> (i5 << 3)) & 0xff) << 40) | (((a >> (i6 << 3)) & 0xff) << 48) | (((a >> (i7 << 3)) & 0xff) << 56); }
// @ts-expect-error: decorator
@inline function relaxed_mem(a: u64, s: u64): u64 { store<u64>(tmp, a); return (load<u8>(tmp + ((s & 7) as usize)) as u64) | ((load<u8>(tmp + (((s >> 8) & 7) as usize)) as u64) << 8) | ((load<u8>(tmp + (((s >> 16) & 7) as usize)) as u64) << 16) | ((load<u8>(tmp + (((s >> 24) & 7) as usize)) as u64) << 24) | ((load<u8>(tmp + (((s >> 32) & 7) as usize)) as u64) << 32) | ((load<u8>(tmp + (((s >> 40) & 7) as usize)) as u64) << 40) | ((load<u8>(tmp + (((s >> 48) & 7) as usize)) as u64) << 48) | ((load<u8>(tmp + (((s >> 56) & 7) as usize)) as u64) << 56); }
// @ts-expect-error: decorator
@inline function swizzle_mem(a: u64, s: u64): u64 { const x = s & 0xf8f8f8f8f8f8f8f8; const valid = ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff; return relaxed_mem(a, s) & valid; }
// @ts-expect-error: decorator
@inline function swizzle_shift(a: u64, s: u64): u64 { const x = s & 0xf8f8f8f8f8f8f8f8; const valid = ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff; return relaxed_shift(a, s) & valid; }
const a: u64 = 0xfedcba9876543210;
const s: u64 = 0x7766554433221100;
bench("swizzle.lib", () => { blackbox(swizzle_lib(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "lib");
bench("swizzle.mem", () => { blackbox(swizzle_mem(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "mem");
bench("swizzle.shift", () => { blackbox(swizzle_shift(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "shift");
bench("relaxed-swizzle.lib", () => { blackbox(relaxed_lib(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "relaxed-lib");
bench("relaxed-swizzle.mem", () => { blackbox(relaxed_mem(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "relaxed-mem");
bench("relaxed-swizzle.shift", () => { blackbox(relaxed_shift(blackbox(a), blackbox(s))); }, OPS, 8); dumpToFile("swizzle-comp", "relaxed-shift");

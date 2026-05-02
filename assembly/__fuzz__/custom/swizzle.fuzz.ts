import { i8x8 } from "../../v64/i8x8";
import { i8x8_scalar } from "../../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";
let state: u64 = 0;
const tmp = memory.data(8);
// @ts-expect-error: decorator
@inline function nextU32(): u32 { state += 0x9e3779b97f4a7c15; let z = state; z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9; z = (z ^ (z >> 27)) * 0x94d049bb133111eb; return <u32>(z ^ (z >> 31)); }
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function relaxed_shift(a: u64, s: u64): u64 { const i0 = (s & 0x07) as u64; const i1 = ((s >> 8) & 0x07) as u64; const i2 = ((s >> 16) & 0x07) as u64; const i3 = ((s >> 24) & 0x07) as u64; const i4 = ((s >> 32) & 0x07) as u64; const i5 = ((s >> 40) & 0x07) as u64; const i6 = ((s >> 48) & 0x07) as u64; const i7 = ((s >> 56) & 0x07) as u64; const b0 = (a >> (i0 << 3)) & 0xff; const b1 = (a >> (i1 << 3)) & 0xff; const b2 = (a >> (i2 << 3)) & 0xff; const b3 = (a >> (i3 << 3)) & 0xff; const b4 = (a >> (i4 << 3)) & 0xff; const b5 = (a >> (i5 << 3)) & 0xff; const b6 = (a >> (i6 << 3)) & 0xff; const b7 = (a >> (i7 << 3)) & 0xff; return b0 | (b1 << 8) | (b2 << 16) | (b3 << 24) | (b4 << 32) | (b5 << 40) | (b6 << 48) | (b7 << 56); }
// @ts-expect-error: decorator
@inline function relaxed_mem(a: u64, s: u64): u64 { store<u64>(tmp, a); return (load<u8>(tmp + ((s & 7) as usize)) as u64) | ((load<u8>(tmp + (((s >> 8) & 7) as usize)) as u64) << 8) | ((load<u8>(tmp + (((s >> 16) & 7) as usize)) as u64) << 16) | ((load<u8>(tmp + (((s >> 24) & 7) as usize)) as u64) << 24) | ((load<u8>(tmp + (((s >> 32) & 7) as usize)) as u64) << 32) | ((load<u8>(tmp + (((s >> 40) & 7) as usize)) as u64) << 40) | ((load<u8>(tmp + (((s >> 48) & 7) as usize)) as u64) << 48) | ((load<u8>(tmp + (((s >> 56) & 7) as usize)) as u64) << 56); }
// @ts-expect-error: decorator
@inline function swizzle_shift(a: u64, s: u64): u64 { const x = s & 0xf8f8f8f8f8f8f8f8; const valid = ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff; return relaxed_shift(a, s) & valid; }
// @ts-expect-error: decorator
@inline function swizzle_mem(a: u64, s: u64): u64 { const x = s & 0xf8f8f8f8f8f8f8f8; const valid = ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff; return relaxed_mem(a, s) & valid; }
// @ts-expect-error: decorator
@inline function check(a: u64, s: u64): bool { const expected = i8x8_scalar.swizzle(a, s); const lib = i8x8.swizzle(a, s); const shift = swizzle_shift(a, s); const mem = swizzle_mem(a, s); const relaxedExpected = i8x8_scalar.relaxed_swizzle(a, s); const rlib = i8x8.relaxed_swizzle(a, s); const rshift = relaxed_shift(a, s); const rmem = relaxed_mem(a, s); if (lib != expected || shift != expected || mem != expected || rlib != relaxedExpected || rshift != relaxedExpected || rmem != relaxedExpected) { expect<u64>(lib).toBe(expected); expect<u64>(shift).toBe(expected); expect<u64>(mem).toBe(expected); expect<u64>(rlib).toBe(relaxedExpected); expect<u64>(rshift).toBe(relaxedExpected); expect<u64>(rmem).toBe(relaxedExpected); return false; } return true; }
fuzz("i8x8.swizzle candidates", (seedValue: i32): bool => { state = <u64>seedValue; const cases: u64[] = [0, 0xffffffffffffffff, 0x0706050403020100, 0x7766554433221100, 0xfedcba9876543210]; for (let i = 0; i < cases.length; i++) for (let j = 0; j < cases.length; j++) if (!check(cases[i], cases[j])) return false; for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false; return true; }).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

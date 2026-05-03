import { i8x8 } from "../../v64/i8x8";
import { i8x8_scalar } from "../../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";
let state: u64 = 0;
// @ts-expect-error: decorator
@inline function nextU32(): u32 { state += 0x9e3779b97f4a7c15; let z = state; z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9; z = (z ^ (z >> 27)) * 0x94d049bb133111eb; return <u32>(z ^ (z >> 31)); }
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function popcnt_current(x: u64): u64 { x = x - ((x >> 1) & 0x5555555555555555); x = (x & 0x3333333333333333) + ((x >> 2) & 0x3333333333333333); return (x + (x >> 4)) & 0x0f0f0f0f0f0f0f0f; }
// @ts-expect-error: decorator
@inline function popcnt_split32(x: u64): u64 { let lo = x as u32; let hi = (x >> 32) as u32; lo = lo - ((lo >> 1) & 0x55555555); hi = hi - ((hi >> 1) & 0x55555555); lo = (lo & 0x33333333) + ((lo >> 2) & 0x33333333); hi = (hi & 0x33333333) + ((hi >> 2) & 0x33333333); return (((lo + (lo >> 4)) & 0x0f0f0f0f) as u64) | ((((hi + (hi >> 4)) & 0x0f0f0f0f) as u64) << 32); }
// @ts-expect-error: decorator
@inline function popcnt_intrinsic_lanes(x: u64): u64 { return (<u64>popcnt<u32>((x & 0xff) as u32)) | (<u64>popcnt<u32>(((x >> 8) & 0xff) as u32) << 8) | (<u64>popcnt<u32>(((x >> 16) & 0xff) as u32) << 16) | (<u64>popcnt<u32>(((x >> 24) & 0xff) as u32) << 24) | (<u64>popcnt<u32>(((x >> 32) & 0xff) as u32) << 32) | (<u64>popcnt<u32>(((x >> 40) & 0xff) as u32) << 40) | (<u64>popcnt<u32>(((x >> 48) & 0xff) as u32) << 48) | (<u64>popcnt<u32>(((x >> 56) & 0xff) as u32) << 56); }
// @ts-expect-error: decorator
@inline function check(a: u64): bool { const expected = i8x8_scalar.popcnt(a); const lib = i8x8.popcnt(a); const current = popcnt_current(a); const split32 = popcnt_split32(a); const intrinsic = popcnt_intrinsic_lanes(a); if (lib != expected || current != expected || split32 != expected || intrinsic != expected) { expect<u64>(lib).toBe(expected); expect<u64>(current).toBe(expected); expect<u64>(split32).toBe(expected); expect<u64>(intrinsic).toBe(expected); return false; } return true; }
fuzz("i8x8.popcnt candidates", (seedValue: i32): bool => { state = <u64>seedValue; const cases: u64[] = [0, 1, 0xffffffffffffffff, 0x0102040810204080, 0xfedcba9876543210]; for (let i = 0; i < cases.length; i++) if (!check(cases[i])) return false; for (let i = 0; i < 64; i++) if (!check(nextU64())) return false; return true; }).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

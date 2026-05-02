import { i8x8 } from "../../v64/i8x8";
import { i8x8_scalar } from "../../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";
let state: u64 = 0;
// @ts-expect-error: decorator
@inline function nextU32(): u32 { state += 0x9e3779b97f4a7c15; let z = state; z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9; z = (z ^ (z >> 27)) * 0x94d049bb133111eb; return <u32>(z ^ (z >> 31)); }
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function mul_current(a: u64, b: u64): u64 { return (((a & 0xff) * (b & 0xff)) & 0xff) | (((((a >> 8) & 0xff) * ((b >> 8) & 0xff)) & 0xff) << 8) | (((((a >> 16) & 0xff) * ((b >> 16) & 0xff)) & 0xff) << 16) | (((((a >> 24) & 0xff) * ((b >> 24) & 0xff)) & 0xff) << 24) | (((((a >> 32) & 0xff) * ((b >> 32) & 0xff)) & 0xff) << 32) | (((((a >> 40) & 0xff) * ((b >> 40) & 0xff)) & 0xff) << 40) | (((((a >> 48) & 0xff) * ((b >> 48) & 0xff)) & 0xff) << 48) | (((((a >> 56) & 0xff) * ((b >> 56) & 0xff)) & 0xff) << 56); }
// @ts-expect-error: decorator
@inline function mul_split32(a: u64, b: u64): u64 { const alo = a as u32; const blo = b as u32; const ahi = (a >> 32) as u32; const bhi = (b >> 32) as u32; const lo = (((alo & 0xff) * (blo & 0xff)) & 0xff) | (((((alo >> 8) & 0xff) * ((blo >> 8) & 0xff)) & 0xff) << 8) | (((((alo >> 16) & 0xff) * ((blo >> 16) & 0xff)) & 0xff) << 16) | (((((alo >> 24) & 0xff) * ((blo >> 24) & 0xff)) & 0xff) << 24); const hi = (((ahi & 0xff) * (bhi & 0xff)) & 0xff) | (((((ahi >> 8) & 0xff) * ((bhi >> 8) & 0xff)) & 0xff) << 8) | (((((ahi >> 16) & 0xff) * ((bhi >> 16) & 0xff)) & 0xff) << 16) | (((((ahi >> 24) & 0xff) * ((bhi >> 24) & 0xff)) & 0xff) << 24); return (lo as u64) | ((hi as u64) << 32); }
// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool { const expected = i8x8_scalar.mul(a, b); const lib = i8x8.mul(a, b); const current = mul_current(a, b); const split32 = mul_split32(a, b); if (lib != expected || current != expected || split32 != expected) { expect<u64>(lib).toBe(expected); expect<u64>(current).toBe(expected); expect<u64>(split32).toBe(expected); return false; } return true; }
fuzz("i8x8.mul candidates", (seedValue: i32): bool => { state = <u64>seedValue; const cases: u64[] = [0, 1, 0xffffffffffffffff, 0xfedcba9876543210, 0x7766554433221100]; for (let i = 0; i < cases.length; i++) for (let j = 0; j < cases.length; j++) if (!check(cases[i], cases[j])) return false; for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false; return true; }).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

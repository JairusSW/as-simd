import { i8x8 } from "../../v64/i8x8";
import { i8x8_scalar } from "../../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";

let state: u64 = 0;
// @ts-expect-error: decorator
@inline function nextU32(): u32 { state += 0x9e3779b97f4a7c15; let z = state; z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9; z = (z ^ (z >> 27)) * 0x94d049bb133111eb; return <u32>(z ^ (z >> 31)); }
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function sub_sat_s_current(a: u64, b: u64): u64 { const diff = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080); const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7; const mask = overflow * 0xff; const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f); return (diff & ~mask) | (limit & mask); }
// @ts-expect-error: decorator
@inline function sub_sat_s_split16(a: u64, b: u64): u64 { const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080); const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000); const diff = (dlo & 0x00ff00ff00ff00ff) | (dhi & 0xff00ff00ff00ff00); const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7; const mask = overflow * 0xff; const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f); return (diff & ~mask) | (limit & mask); }
// @ts-expect-error: decorator
@inline function sub_sat_s_split32(a: u64, b: u64): u64 { const alo = a as u32, blo = b as u32; const ahi = (a >> 32) as u32, bhi = (b >> 32) as u32; const dlo = ((alo | 0x80808080) - (blo & 0x7f7f7f7f)) ^ ((alo ^ ~blo) & 0x80808080); const dhi = ((ahi | 0x80808080) - (bhi & 0x7f7f7f7f)) ^ ((ahi ^ ~bhi) & 0x80808080); const diff = (dlo as u64) | ((dhi as u64) << 32); const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7; const mask = overflow * 0xff; const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f); return (diff & ~mask) | (limit & mask); }
// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool { const expected = i8x8_scalar.sub_sat_s(a, b); const lib = i8x8.sub_sat_s(a, b); const current = sub_sat_s_current(a, b); const split16 = sub_sat_s_split16(a, b); const split32 = sub_sat_s_split32(a, b); if (lib != expected || current != expected || split16 != expected || split32 != expected) { expect<u64>(lib).toBe(expected); expect<u64>(current).toBe(expected); expect<u64>(split16).toBe(expected); expect<u64>(split32).toBe(expected); return false; } return true; }
fuzz("i8x8.sub_sat_s candidates", (seedValue: i32): bool => { state = <u64>seedValue; const cases: u64[] = [0, 0xffffffffffffffff, 0x8080808080808080, 0x7f7f7f7f7f7f7f7f, 0x00ff00ff00ff00ff, 0xfedcba9876543210, 0x7766554433221100]; for (let i = 0; i < cases.length; i++) for (let j = 0; j < cases.length; j++) if (!check(cases[i], cases[j])) return false; for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false; return true; }).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

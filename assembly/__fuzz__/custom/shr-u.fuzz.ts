import { i8x8 } from "../../v64/i8x8";
import { i8x8_scalar } from "../../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";

let state: u64 = 0;
// @ts-expect-error: decorator
@inline function nextU32(): u32 { state += 0x9e3779b97f4a7c15; let z = state; z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9; z = (z ^ (z >> 27)) * 0x94d049bb133111eb; return <u32>(z ^ (z >> 31)); }
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function shr_u_current(a: u64, b: i32): u64 { const shift = b & 7; return (a & ((((0xff << shift) & 0xff) as u64) * 0x0101010101010101)) >> shift; }
// @ts-expect-error: decorator
@inline function shr_u_logical_mask(a: u64, b: i32): u64 { const shift = b & 7; const keep = (((0xff >> shift) & 0xff) as u64) * 0x0101010101010101; return (a >> shift) & keep; }
// @ts-expect-error: decorator
@inline function shr_u_split32(a: u64, b: i32): u64 { const shift = b & 7; const mask = (((0xff << shift) & 0xff) as u32) * 0x01010101; const lo = ((a as u32) & mask) >> shift; const hi = (((a >> 32) as u32) & mask) >> shift; return (lo as u64) | ((hi as u64) << 32); }
// @ts-expect-error: decorator
@inline function shr_u_switch(a: u64, b: i32): u64 { switch (b & 7) { case 0: return a; case 1: return (a >> 1) & 0x7f7f7f7f7f7f7f7f; case 2: return (a >> 2) & 0x3f3f3f3f3f3f3f3f; case 3: return (a >> 3) & 0x1f1f1f1f1f1f1f1f; case 4: return (a >> 4) & 0x0f0f0f0f0f0f0f0f; case 5: return (a >> 5) & 0x0707070707070707; case 6: return (a >> 6) & 0x0303030303030303; default: return (a >> 7) & 0x0101010101010101; } }
// @ts-expect-error: decorator
@inline function check(a: u64, s: i32): bool { const expected = i8x8_scalar.shr_u(a, s); const lib = i8x8.shr_u(a, s); const current = shr_u_current(a, s); const logical = shr_u_logical_mask(a, s); const split32 = shr_u_split32(a, s); const sw = shr_u_switch(a, s); if (lib != expected || current != expected || logical != expected || split32 != expected || sw != expected) { expect<u64>(lib).toBe(expected); expect<u64>(current).toBe(expected); expect<u64>(logical).toBe(expected); expect<u64>(split32).toBe(expected); expect<u64>(sw).toBe(expected); return false; } return true; }
fuzz("i8x8.shr_u candidates", (seedValue: i32): bool => { state = <u64>seedValue; const cases: u64[] = [0, 0xffffffffffffffff, 0x8080808080808080, 0x0102040810204080, 0xfedcba9876543210]; for (let c = 0; c < cases.length; c++) for (let s = 0; s < 16; s++) if (!check(cases[c], s)) return false; for (let i = 0; i < 64; i++) if (!check(nextU64(), <i32>nextU32())) return false; return true; }).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

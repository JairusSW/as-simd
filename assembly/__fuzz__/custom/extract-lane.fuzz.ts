import { i8x8 } from "../../v64/i8x8";
import { i8x8_scalar } from "../../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";
let state: u64 = 0;
// @ts-expect-error: decorator
@inline function nextU32(): u32 { state += 0x9e3779b97f4a7c15; let z = state; z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9; z = (z ^ (z >> 27)) * 0x94d049bb133111eb; return <u32>(z ^ (z >> 31)); }
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function extract_u_current(x: u64, idx: u8): u8 { return ((x >> (idx << 3)) & 0xff) as u8; }
// @ts-expect-error: decorator
@inline function extract_u_switch(x: u64, idx: u8): u8 { switch (idx & 7) { case 0: return x as u8; case 1: return (x >> 8) as u8; case 2: return (x >> 16) as u8; case 3: return (x >> 24) as u8; case 4: return (x >> 32) as u8; case 5: return (x >> 40) as u8; case 6: return (x >> 48) as u8; default: return (x >> 56) as u8; } }
// @ts-expect-error: decorator
@inline function extract_s_switch(x: u64, idx: u8): i8 { return extract_u_switch(x, idx) as i8; }
// @ts-expect-error: decorator
@inline function check(a: u64, idx: u8): bool { const eu = i8x8_scalar.extract_lane_u(a, idx); const es = i8x8_scalar.extract_lane_s(a, idx); const lu = i8x8.extract_lane_u(a, idx); const ls = i8x8.extract_lane_s(a, idx); const cu = extract_u_current(a, idx); const su = extract_u_switch(a, idx); const ss = extract_s_switch(a, idx); if (lu != eu || ls != es || cu != eu || su != eu || ss != es) { expect<u8>(lu).toBe(eu); expect<i8>(ls).toBe(es); expect<u8>(cu).toBe(eu); expect<u8>(su).toBe(eu); expect<i8>(ss).toBe(es); return false; } return true; }
fuzz("i8x8.extract_lane candidates", (seedValue: i32): bool => { state = <u64>seedValue; const cases: u64[] = [0, 0xffffffffffffffff, 0xfedcba9876543210, 0x7766554433221100]; for (let i = 0; i < cases.length; i++) for (let idx: u8 = 0; idx < 16; idx++) if (!check(cases[i], idx)) return false; for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU32() as u8)) return false; return true; }).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

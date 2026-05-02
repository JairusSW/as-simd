import { i8x8 } from "../../v64/i8x8";
import { i8x8_scalar } from "../../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";
let state: u64 = 0;
// @ts-expect-error: decorator
@inline function nextU32(): u32 { state += 0x9e3779b97f4a7c15; let z = state; z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9; z = (z ^ (z >> 27)) * 0x94d049bb133111eb; return <u32>(z ^ (z >> 31)); }
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function all_true_current(a: u64): bool { return ((((a & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | a) & 0x8080808080808080) == 0x8080808080808080; }
// @ts-expect-error: decorator
@inline function all_true_haszero(a: u64): bool { return (((a - 0x0101010101010101) & ~a & 0x8080808080808080) == 0); }
// @ts-expect-error: decorator
@inline function all_true_bitmask_lane(a: u64): bool { return ((((a & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | a) & 0x8080808080808080) == 0x8080808080808080; }
// @ts-expect-error: decorator
@inline function check(a: u64): bool { const expected = i8x8_scalar.all_true(a); const lib = i8x8.all_true(a); const current = all_true_current(a); const haszero = all_true_haszero(a); const lane = all_true_bitmask_lane(a); if (lib != expected || current != expected || haszero != expected || lane != expected) { expect<bool>(lib).toBe(expected); expect<bool>(current).toBe(expected); expect<bool>(haszero).toBe(expected); expect<bool>(lane).toBe(expected); return false; } return true; }
fuzz("i8x8.all_true candidates", (seedValue: i32): bool => { state = <u64>seedValue; const cases: u64[] = [0, 1, 0xffffffffffffffff, 0x0101010101010101, 0xff00ff00ff00ff00, 0xfedcba9876543210]; for (let i = 0; i < cases.length; i++) if (!check(cases[i])) return false; for (let i = 0; i < 64; i++) if (!check(nextU64())) return false; return true; }).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

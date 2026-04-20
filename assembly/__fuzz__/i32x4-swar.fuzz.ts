import { expect, fuzz, FuzzSeed } from "as-test";
import { i32x4_swar } from "../v128/i32x4";

let state: u64 = 0;
let checkId: i32 = 0;
// @ts-expect-error: decorator
@inline function nextU32(): u32 { state += 0x9e3779b97f4a7c15; let z = state; z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9; z = (z ^ (z >> 27)) * 0x94d049bb133111eb; return <u32>(z ^ (z >> 31)); }
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function v128From64(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }
// @ts-expect-error: decorator
@inline function lo64(x: v128): u64 { return i64x2.extract_lane(x, 0) as u64; }
// @ts-expect-error: decorator
@inline function hi64(x: v128): u64 { return i64x2.extract_lane(x, 1) as u64; }
// @ts-expect-error: decorator
@inline function checkV128(a: v128, b: v128): bool { if (lo64(a) != lo64(b) || hi64(a) != hi64(b)) { expect<i32>(checkId).toBe(0); return false; } checkId++; return true; }
// @ts-expect-error: decorator
@inline function check32(a: i32, b: i32): bool { if (a != b) { expect<i32>(checkId).toBe(0); return false; } checkId++; return true; }
// @ts-expect-error: decorator
@inline function checkBool(a: bool, b: bool): bool { if (a != b) { expect<i32>(checkId).toBe(0); return false; } checkId++; return true; }

fuzz("i32x4_swar parity vs i32x4", (seedValue: i32): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  state = <u64>seedValue;
  const a = v128From64(nextU64(), nextU64());
  const b = v128From64(nextU64(), nextU64());
  const idx: u8 = 1;
  const lane = <i32>nextU32();
  const shift = <i32>(nextU32() & 31);
  checkId = 1;

  if (!checkV128(i32x4_swar.splat(lane), i32x4.splat(lane))) return false;
  if (!check32(i32x4_swar.extract_lane(a, idx), i32x4.extract_lane(a, 1))) return false;
  if (!checkV128(i32x4_swar.replace_lane(a, idx, lane), i32x4.replace_lane(a, 1, lane))) return false;
  if (!checkV128(i32x4_swar.add(a, b), i32x4.add(a, b))) return false;
  if (!checkV128(i32x4_swar.sub(a, b), i32x4.sub(a, b))) return false;
  if (!checkV128(i32x4_swar.abs(a), i32x4.abs(a))) return false;
  if (!checkV128(i32x4_swar.neg(a), i32x4.neg(a))) return false;
  if (!checkV128(i32x4_swar.shl(a, shift), i32x4.shl(a, shift))) return false;
  if (!checkV128(i32x4_swar.shr_s(a, shift), i32x4.shr_s(a, shift))) return false;
  // TODO: align i32x2/i32x4 unsigned shift-right semantics with SIMD before enabling parity check.
  if (!checkBool(i32x4_swar.all_true(a), i32x4.all_true(a))) return false;
  if (!check32(i32x4_swar.bitmask(a), i32x4.bitmask(a))) return false;
  if (!checkV128(i32x4_swar.eq(a, b), i32x4.eq(a, b))) return false;
  if (!checkV128(i32x4_swar.ne(a, b), i32x4.ne(a, b))) return false;
  if (!checkV128(i32x4_swar.lt_s(a, b), i32x4.lt_s(a, b))) return false;
  if (!checkV128(i32x4_swar.le_s(a, b), i32x4.le_s(a, b))) return false;
  if (!checkV128(i32x4_swar.gt_s(a, b), i32x4.gt_s(a, b))) return false;
  if (!checkV128(i32x4_swar.ge_s(a, b), i32x4.ge_s(a, b))) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

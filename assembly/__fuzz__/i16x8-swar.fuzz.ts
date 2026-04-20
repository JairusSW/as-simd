import { expect, fuzz, FuzzSeed } from "as-test";
import { i16x8_swar } from "../v128/i16x8";

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

fuzz("i16x8_swar parity vs i16x8", (seedValue: i32): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  state = <u64>seedValue;
  const a = v128From64(nextU64(), nextU64());
  const b = v128From64(nextU64(), nextU64());
  const idx: u8 = 3;
  const lane = <i16>nextU32();
  const shift = <i32>(nextU32() & 31);
  checkId = 1;

  if (!checkV128(i16x8_swar.splat(lane), i16x8.splat(lane))) return false;
  if (!check32(i16x8_swar.extract_lane_s(a, idx), i16x8.extract_lane_s(a, 3))) return false;
  if (!check32(i16x8_swar.extract_lane_u(a, idx), i16x8.extract_lane_u(a, 3))) return false;
  if (!checkV128(i16x8_swar.replace_lane(a, idx, lane), i16x8.replace_lane(a, 3, lane))) return false;
  if (!checkV128(i16x8_swar.add(a, b), i16x8.add(a, b))) return false;
  if (!checkV128(i16x8_swar.sub(a, b), i16x8.sub(a, b))) return false;
  if (!checkV128(i16x8_swar.mul(a, b), i16x8.mul(a, b))) return false;
  if (!checkV128(i16x8_swar.min_s(a, b), i16x8.min_s(a, b))) return false;
  if (!checkV128(i16x8_swar.min_u(a, b), i16x8.min_u(a, b))) return false;
  if (!checkV128(i16x8_swar.max_s(a, b), i16x8.max_s(a, b))) return false;
  if (!checkV128(i16x8_swar.max_u(a, b), i16x8.max_u(a, b))) return false;
  if (!checkV128(i16x8_swar.avgr_u(a, b), i16x8.avgr_u(a, b))) return false;
  if (!checkV128(i16x8_swar.abs(a), i16x8.abs(a))) return false;
  if (!checkV128(i16x8_swar.neg(a), i16x8.neg(a))) return false;
  if (!checkV128(i16x8_swar.add_sat_s(a, b), i16x8.add_sat_s(a, b))) return false;
  if (!checkV128(i16x8_swar.add_sat_u(a, b), i16x8.add_sat_u(a, b))) return false;
  if (!checkV128(i16x8_swar.sub_sat_s(a, b), i16x8.sub_sat_s(a, b))) return false;
  if (!checkV128(i16x8_swar.sub_sat_u(a, b), i16x8.sub_sat_u(a, b))) return false;
  if (!checkV128(i16x8_swar.shl(a, shift), i16x8.shl(a, shift))) return false;
  if (!checkV128(i16x8_swar.shr_s(a, shift), i16x8.shr_s(a, shift))) return false;
  if (!checkV128(i16x8_swar.shr_u(a, shift), i16x8.shr_u(a, shift))) return false;
  if (!checkBool(i16x8_swar.all_true(a), i16x8.all_true(a))) return false;
  if (!check32(i16x8_swar.bitmask(a), i16x8.bitmask(a))) return false;
  if (!checkV128(i16x8_swar.eq(a, b), i16x8.eq(a, b))) return false;
  if (!checkV128(i16x8_swar.ne(a, b), i16x8.ne(a, b))) return false;
  if (!checkV128(i16x8_swar.lt_s(a, b), i16x8.lt_s(a, b))) return false;
  if (!checkV128(i16x8_swar.lt_u(a, b), i16x8.lt_u(a, b))) return false;
  if (!checkV128(i16x8_swar.le_s(a, b), i16x8.le_s(a, b))) return false;
  if (!checkV128(i16x8_swar.le_u(a, b), i16x8.le_u(a, b))) return false;
  if (!checkV128(i16x8_swar.gt_s(a, b), i16x8.gt_s(a, b))) return false;
  if (!checkV128(i16x8_swar.gt_u(a, b), i16x8.gt_u(a, b))) return false;
  if (!checkV128(i16x8_swar.ge_s(a, b), i16x8.ge_s(a, b))) return false;
  if (!checkV128(i16x8_swar.ge_u(a, b), i16x8.ge_u(a, b))) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

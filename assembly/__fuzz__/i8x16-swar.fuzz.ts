import { expect, fuzz, FuzzSeed } from "as-test";
import { i8x16_swar } from "../v128/i8x16";

let state: u64 = 0;
let checkId: i32 = 0;

// @ts-expect-error: decorator
@inline function nextU32(): u32 {
  state += 0x9e3779b97f4a7c15;
  let z = state;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return <u32>(z ^ (z >> 31));
}
// @ts-expect-error: decorator
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }
// @ts-expect-error: decorator
@inline function v128From64(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }
// @ts-expect-error: decorator
@inline function lo64(x: v128): u64 { return i64x2.extract_lane(x, 0) as u64; }
// @ts-expect-error: decorator
@inline function hi64(x: v128): u64 { return i64x2.extract_lane(x, 1) as u64; }
// @ts-expect-error: decorator
@inline function checkV128(a: v128, b: v128): bool {
  if (lo64(a) != lo64(b) || hi64(a) != hi64(b)) { expect<i32>(checkId).toBe(0); return false; }
  checkId++; return true;
}
// @ts-expect-error: decorator
@inline function check32(a: i32, b: i32): bool {
  if (a != b) { expect<i32>(checkId).toBe(0); return false; }
  checkId++; return true;
}
// @ts-expect-error: decorator
@inline function checkBool(a: bool, b: bool): bool {
  if (a != b) { expect<i32>(checkId).toBe(0); return false; }
  checkId++; return true;
}

fuzz("i8x16_swar parity vs i8x16", (seedValue: i32): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  state = <u64>seedValue;
  const a = v128From64(nextU64(), nextU64());
  const b = v128From64(nextU64(), nextU64());
  const idx: u8 = 7;
  const lane = <i8>nextU32();
  const shift = <i32>(nextU32() & 31);
  checkId = 1;

  if (!checkV128(i8x16_swar.splat(lane), i8x16.splat(lane))) return false;
  if (!check32(i8x16_swar.extract_lane_s(a, idx), i8x16.extract_lane_s(a, 7))) return false;
  if (!check32(i8x16_swar.extract_lane_u(a, idx), i8x16.extract_lane_u(a, 7))) return false;
  if (!checkV128(i8x16_swar.replace_lane(a, idx, lane), i8x16.replace_lane(a, 7, lane))) return false;
  if (!checkV128(i8x16_swar.add(a, b), i8x16.add(a, b))) return false;
  if (!checkV128(i8x16_swar.sub(a, b), i8x16.sub(a, b))) return false;
  if (!checkV128(i8x16_swar.min_s(a, b), i8x16.min_s(a, b))) return false;
  if (!checkV128(i8x16_swar.min_u(a, b), i8x16.min_u(a, b))) return false;
  if (!checkV128(i8x16_swar.max_s(a, b), i8x16.max_s(a, b))) return false;
  if (!checkV128(i8x16_swar.max_u(a, b), i8x16.max_u(a, b))) return false;
  if (!checkV128(i8x16_swar.avgr_u(a, b), i8x16.avgr_u(a, b))) return false;
  if (!checkV128(i8x16_swar.abs(a), i8x16.abs(a))) return false;
  if (!checkV128(i8x16_swar.neg(a), i8x16.neg(a))) return false;
  if (!checkV128(i8x16_swar.add_sat_s(a, b), i8x16.add_sat_s(a, b))) return false;
  if (!checkV128(i8x16_swar.add_sat_u(a, b), i8x16.add_sat_u(a, b))) return false;
  if (!checkV128(i8x16_swar.sub_sat_s(a, b), i8x16.sub_sat_s(a, b))) return false;
  if (!checkV128(i8x16_swar.sub_sat_u(a, b), i8x16.sub_sat_u(a, b))) return false;
  if (!checkV128(i8x16_swar.shl(a, shift), i8x16.shl(a, shift))) return false;
  if (!checkV128(i8x16_swar.shr_s(a, shift), i8x16.shr_s(a, shift))) return false;
  if (!checkV128(i8x16_swar.shr_u(a, shift), i8x16.shr_u(a, shift))) return false;
  if (!checkBool(i8x16_swar.all_true(a), i8x16.all_true(a))) return false;
  if (!check32(i8x16_swar.bitmask(a), i8x16.bitmask(a))) return false;
  if (!checkV128(i8x16_swar.popcnt(a), i8x16.popcnt(a))) return false;
  if (!checkV128(i8x16_swar.eq(a, b), i8x16.eq(a, b))) return false;
  if (!checkV128(i8x16_swar.ne(a, b), i8x16.ne(a, b))) return false;
  if (!checkV128(i8x16_swar.lt_s(a, b), i8x16.lt_s(a, b))) return false;
  if (!checkV128(i8x16_swar.lt_u(a, b), i8x16.lt_u(a, b))) return false;
  if (!checkV128(i8x16_swar.le_s(a, b), i8x16.le_s(a, b))) return false;
  if (!checkV128(i8x16_swar.le_u(a, b), i8x16.le_u(a, b))) return false;
  if (!checkV128(i8x16_swar.gt_s(a, b), i8x16.gt_s(a, b))) return false;
  if (!checkV128(i8x16_swar.gt_u(a, b), i8x16.gt_u(a, b))) return false;
  if (!checkV128(i8x16_swar.ge_s(a, b), i8x16.ge_s(a, b))) return false;
  if (!checkV128(i8x16_swar.ge_u(a, b), i8x16.ge_u(a, b))) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

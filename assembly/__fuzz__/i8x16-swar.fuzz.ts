import { expect, fuzz, FuzzSeed } from "as-test";
import { i8x16_swar } from "../v128/i8x16_swar";

let checkId: i32 = 0;

// @ts-expect-error: decorator
@inline function mix64(seed: u64, stream: u64): u64 {
  let z = seed + stream * 0x9e3779b97f4a7c15 + 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}

// @ts-expect-error: decorator
@inline function mix32(seed: u64, stream: u64): u32 {
  return mix64(seed, stream) as u32;
}

// @ts-expect-error: decorator
@inline function v128From64(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }
// @ts-expect-error: decorator
@inline function lo64(x: v128): u64 { return i64x2.extract_lane(x, 0) as u64; }
// @ts-expect-error: decorator
@inline function hi64(x: v128): u64 { return i64x2.extract_lane(x, 1) as u64; }
// @ts-expect-error: decorator
@inline function pair(lo: u64, hi: u64): v128 { return v128From64(lo, hi); }

// @ts-expect-error: decorator
@inline function checkV128(a: v128, b: v128): bool {
  if (lo64(a) != lo64(b) || hi64(a) != hi64(b)) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

// @ts-expect-error: decorator
@inline function check32(a: i32, b: i32): bool {
  if (a != b) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

// @ts-expect-error: decorator
@inline function checkBool(a: bool, b: bool): bool {
  if (a != b) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

fuzz("i8x16_swar parity vs i8x16", (seedValue: i32): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  const seed = seedValue as u32 as u64;
  const aLo = mix64(seed, 0);
  const aHi = mix64(seed, 1);
  const bLo = mix64(seed, 2);
  const bHi = mix64(seed, 3);
  const lane = <i8>mix32(seed, 4);
  const shift = <i32>(mix32(seed, 5) & 31);
  const a = v128From64(aLo, aHi);
  const b = v128From64(bLo, bHi);
  const idx: u8 = 7;
  let lo: u64 = 0;
  checkId = 1;

  lo = i8x16_swar.splat(lane);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.splat(lane))) return false;
  if (!check32(i8x16_swar.extract_lane_s(aLo, aHi, idx), i8x16.extract_lane_s(a, 7))) return false;
  if (!check32(i8x16_swar.extract_lane_u(aLo, aHi, idx), i8x16.extract_lane_u(a, 7))) return false;
  lo = i8x16_swar.replace_lane(aLo, aHi, idx, lane);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.replace_lane(a, 7, lane))) return false;
  lo = i8x16_swar.add(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.add(a, b))) return false;
  lo = i8x16_swar.sub(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.sub(a, b))) return false;
  lo = i8x16_swar.min_s(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.min_s(a, b))) return false;
  lo = i8x16_swar.min_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.min_u(a, b))) return false;
  lo = i8x16_swar.max_s(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.max_s(a, b))) return false;
  lo = i8x16_swar.max_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.max_u(a, b))) return false;
  lo = i8x16_swar.avgr_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.avgr_u(a, b))) return false;
  lo = i8x16_swar.abs(aLo, aHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.abs(a))) return false;
  lo = i8x16_swar.neg(aLo, aHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.neg(a))) return false;
  lo = i8x16_swar.add_sat_s(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.add_sat_s(a, b))) return false;
  lo = i8x16_swar.add_sat_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.add_sat_u(a, b))) return false;
  lo = i8x16_swar.sub_sat_s(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.sub_sat_s(a, b))) return false;
  lo = i8x16_swar.sub_sat_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.sub_sat_u(a, b))) return false;
  lo = i8x16_swar.shl(aLo, aHi, shift);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.shl(a, shift))) return false;
  lo = i8x16_swar.shr_s(aLo, aHi, shift);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.shr_s(a, shift))) return false;
  lo = i8x16_swar.shr_u(aLo, aHi, shift);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.shr_u(a, shift))) return false;
  if (!checkBool(i8x16_swar.all_true(aLo, aHi), i8x16.all_true(a))) return false;
  if (!check32(i8x16_swar.bitmask(aLo, aHi), i8x16.bitmask(a))) return false;
  lo = i8x16_swar.popcnt(aLo, aHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.popcnt(a))) return false;
  lo = i8x16_swar.eq(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.eq(a, b))) return false;
  lo = i8x16_swar.ne(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.ne(a, b))) return false;
  lo = i8x16_swar.lt_s(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.lt_s(a, b))) return false;
  lo = i8x16_swar.lt_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.lt_u(a, b))) return false;
  lo = i8x16_swar.le_s(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.le_s(a, b))) return false;
  lo = i8x16_swar.le_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.le_u(a, b))) return false;
  lo = i8x16_swar.gt_s(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.gt_s(a, b))) return false;
  lo = i8x16_swar.gt_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.gt_u(a, b))) return false;
  lo = i8x16_swar.ge_s(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.ge_s(a, b))) return false;
  lo = i8x16_swar.ge_u(aLo, aHi, bLo, bHi);
  if (!checkV128(pair(lo, i8x16_swar.take_hi()), i8x16.ge_u(a, b))) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(seed.i32());
});

import { i8x8 } from "../v64/i8x8";
import { i8x8_scalar } from "../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";

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
@inline function nextU64(): u64 {
  return (<u64>nextU32() << 32) | <u64>nextU32();
}

// @ts-expect-error: decorator
@inline function check64(actual: u64, expected: u64): bool {
  if (actual != expected) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

// @ts-expect-error: decorator
@inline function check32(actual: i32, expected: i32): bool {
  if (actual != expected) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

// @ts-expect-error: decorator
@inline function checkBool(actual: bool, expected: bool): bool {
  if (actual != expected) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

fuzz("i8x8 scalar reference parity", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const a = nextU64();
  const b = nextU64();
  const c = nextU64();
  const d = nextU64();
  const s = nextU64();
  const m = nextU64();
  const idx = <u8>(nextU32() & 7);
  const shift = <i32>(nextU32() & 31);
  const laneVal = <i8>nextU32();
  const l0 = <u8>(nextU32() & 15);
  const l1 = <u8>(nextU32() & 15);
  const l2 = <u8>(nextU32() & 15);
  const l3 = <u8>(nextU32() & 15);
  const l4 = <u8>(nextU32() & 15);
  const l5 = <u8>(nextU32() & 15);
  const l6 = <u8>(nextU32() & 15);
  const l7 = <u8>(nextU32() & 15);

  checkId = 1;

  if (!check64(i8x8.splat(laneVal), i8x8_scalar.splat(laneVal))) return false;
  if (!check32(i8x8.extract_lane_s(a, idx), i8x8_scalar.extract_lane_s(a, idx))) return false;
  if (!check32(i8x8.extract_lane_u(a, idx), i8x8_scalar.extract_lane_u(a, idx))) return false;
  if (!check64(i8x8.replace_lane(a, idx, laneVal), i8x8_scalar.replace_lane(a, idx, laneVal))) return false;
  if (!check64(i8x8.add(a, b), i8x8_scalar.add(a, b))) return false;
  if (!check64(i8x8.sub(a, b), i8x8_scalar.sub(a, b))) return false;
  if (!check64(i8x8.mul(a, b), i8x8_scalar.mul(a, b))) return false;
  if (!check64(i8x8.min_s(a, b), i8x8_scalar.min_s(a, b))) return false;
  if (!check64(i8x8.min_u(a, b), i8x8_scalar.min_u(a, b))) return false;
  if (!check64(i8x8.max_s(a, b), i8x8_scalar.max_s(a, b))) return false;
  if (!check64(i8x8.max_u(a, b), i8x8_scalar.max_u(a, b))) return false;
  if (!check64(i8x8.avgr_u(a, b), i8x8_scalar.avgr_u(a, b))) return false;
  if (!check64(i8x8.abs(a), i8x8_scalar.abs(a))) return false;
  if (!check64(i8x8.neg(a), i8x8_scalar.neg(a))) return false;
  if (!check64(i8x8.add_sat_s(a, b), i8x8_scalar.add_sat_s(a, b))) return false;
  if (!check64(i8x8.add_sat_u(a, b), i8x8_scalar.add_sat_u(a, b))) return false;
  if (!check64(i8x8.sub_sat_s(a, b), i8x8_scalar.sub_sat_s(a, b))) return false;
  if (!check64(i8x8.sub_sat_u(a, b), i8x8_scalar.sub_sat_u(a, b))) return false;
  if (!check64(i8x8.shl(a, shift), i8x8_scalar.shl(a, shift))) return false;
  if (!check64(i8x8.shr_s(a, shift), i8x8_scalar.shr_s(a, shift))) return false;
  if (!check64(i8x8.shr_u(a, shift), i8x8_scalar.shr_u(a, shift))) return false;
  if (!checkBool(i8x8.all_true(a), i8x8_scalar.all_true(a))) return false;
  if (!check32(i8x8.bitmask(a), i8x8_scalar.bitmask(a))) return false;
  if (!check64(i8x8.popcnt(a), i8x8_scalar.popcnt(a))) return false;
  if (!check64(i8x8.eq(a, b), i8x8_scalar.eq(a, b))) return false;
  if (!check64(i8x8.ne(a, b), i8x8_scalar.ne(a, b))) return false;
  if (!check64(i8x8.lt_s(a, b), i8x8_scalar.lt_s(a, b))) return false;
  if (!check64(i8x8.lt_u(a, b), i8x8_scalar.lt_u(a, b))) return false;
  if (!check64(i8x8.le_s(a, b), i8x8_scalar.le_s(a, b))) return false;
  if (!check64(i8x8.le_u(a, b), i8x8_scalar.le_u(a, b))) return false;
  if (!check64(i8x8.gt_s(a, b), i8x8_scalar.gt_s(a, b))) return false;
  if (!check64(i8x8.gt_u(a, b), i8x8_scalar.gt_u(a, b))) return false;
  if (!check64(i8x8.ge_s(a, b), i8x8_scalar.ge_s(a, b))) return false;
  if (!check64(i8x8.ge_u(a, b), i8x8_scalar.ge_u(a, b))) return false;
  if (!check64(i8x8.narrow_i16x4_s(c, d), i8x8_scalar.narrow_i16x4_s(c, d))) return false;
  if (!check64(i8x8.narrow_i16x4_u(c, d), i8x8_scalar.narrow_i16x4_u(c, d))) return false;
  if (!check64(i8x8.shuffle(a, b, l0, l1, l2, l3, l4, l5, l6, l7), i8x8_scalar.shuffle(a, b, l0, l1, l2, l3, l4, l5, l6, l7))) return false;
  if (!check64(i8x8.swizzle(a, s), i8x8_scalar.swizzle(a, s))) return false;
  if (!check64(i8x8.relaxed_swizzle(a, s), i8x8_scalar.relaxed_swizzle(a, s))) return false;
  if (!check64(i8x8.relaxed_laneselect(a, b, m), i8x8_scalar.relaxed_laneselect(a, b, m))) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

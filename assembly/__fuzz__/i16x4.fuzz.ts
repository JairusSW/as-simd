import { i16x4 } from "../v64/i16x4";
import { i16x4_scalar } from "../scalar/i16x4";
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

fuzz("i16x4 scalar reference parity", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const a = nextU64();
  const b = nextU64();
  const c = nextU64();
  const d = nextU64();
  const m = nextU64();
  const idx = <u8>(nextU32() & 3);
  const shift = <i32>(nextU32() & 31);
  const laneVal = <i16>nextU32();
  const l0 = <u8>(nextU32() & 7);
  const l1 = <u8>(nextU32() & 7);
  const l2 = <u8>(nextU32() & 7);
  const l3 = <u8>(nextU32() & 7);

  checkId = 1;

  if (!check64(i16x4.splat(laneVal), i16x4_scalar.splat(laneVal))) return false;
  if (!check32(i16x4.extract_lane_s(a, idx), i16x4_scalar.extract_lane_s(a, idx))) return false;
  if (!check32(i16x4.extract_lane_u(a, idx), i16x4_scalar.extract_lane_u(a, idx))) return false;
  if (!check64(i16x4.replace_lane(a, idx, laneVal), i16x4_scalar.replace_lane(a, idx, laneVal))) return false;
  if (!check64(i16x4.add(a, b), i16x4_scalar.add(a, b))) return false;
  if (!check64(i16x4.sub(a, b), i16x4_scalar.sub(a, b))) return false;
  if (!check64(i16x4.mul(a, b), i16x4_scalar.mul(a, b))) return false;
  if (!check64(i16x4.min_s(a, b), i16x4_scalar.min_s(a, b))) return false;
  if (!check64(i16x4.min_u(a, b), i16x4_scalar.min_u(a, b))) return false;
  if (!check64(i16x4.max_s(a, b), i16x4_scalar.max_s(a, b))) return false;
  if (!check64(i16x4.max_u(a, b), i16x4_scalar.max_u(a, b))) return false;
  if (!check64(i16x4.avgr_u(a, b), i16x4_scalar.avgr_u(a, b))) return false;
  if (!check64(i16x4.abs(a), i16x4_scalar.abs(a))) return false;
  if (!check64(i16x4.neg(a), i16x4_scalar.neg(a))) return false;
  if (!check64(i16x4.add_sat_s(a, b), i16x4_scalar.add_sat_s(a, b))) return false;
  if (!check64(i16x4.add_sat_u(a, b), i16x4_scalar.add_sat_u(a, b))) return false;
  if (!check64(i16x4.sub_sat_s(a, b), i16x4_scalar.sub_sat_s(a, b))) return false;
  if (!check64(i16x4.sub_sat_u(a, b), i16x4_scalar.sub_sat_u(a, b))) return false;
  if (!check64(i16x4.shl(a, shift), i16x4_scalar.shl(a, shift))) return false;
  if (!check64(i16x4.shr_s(a, shift), i16x4_scalar.shr_s(a, shift))) return false;
  if (!check64(i16x4.shr_u(a, shift), i16x4_scalar.shr_u(a, shift))) return false;
  if (!checkBool(i16x4.all_true(a), i16x4_scalar.all_true(a))) return false;
  if (!check32(i16x4.bitmask(a), i16x4_scalar.bitmask(a))) return false;
  if (!check64(i16x4.eq(a, b), i16x4_scalar.eq(a, b))) return false;
  if (!check64(i16x4.ne(a, b), i16x4_scalar.ne(a, b))) return false;
  if (!check64(i16x4.lt_s(a, b), i16x4_scalar.lt_s(a, b))) return false;
  if (!check64(i16x4.lt_u(a, b), i16x4_scalar.lt_u(a, b))) return false;
  if (!check64(i16x4.le_s(a, b), i16x4_scalar.le_s(a, b))) return false;
  if (!check64(i16x4.le_u(a, b), i16x4_scalar.le_u(a, b))) return false;
  if (!check64(i16x4.gt_s(a, b), i16x4_scalar.gt_s(a, b))) return false;
  if (!check64(i16x4.gt_u(a, b), i16x4_scalar.gt_u(a, b))) return false;
  if (!check64(i16x4.ge_s(a, b), i16x4_scalar.ge_s(a, b))) return false;
  if (!check64(i16x4.ge_u(a, b), i16x4_scalar.ge_u(a, b))) return false;
  if (!check64(i16x4.narrow_i32x2_s(c, d), i16x4_scalar.narrow_i32x2_s(c, d))) return false;
  if (!check64(i16x4.narrow_i32x2_u(c, d), i16x4_scalar.narrow_i32x2_u(c, d))) return false;
  if (!check64(i16x4.extend_low_i8x8_s(a), i16x4_scalar.extend_low_i8x8_s(a))) return false;
  if (!check64(i16x4.extend_low_i8x8_u(a), i16x4_scalar.extend_low_i8x8_u(a))) return false;
  if (!check64(i16x4.extend_high_i8x8_s(a), i16x4_scalar.extend_high_i8x8_s(a))) return false;
  if (!check64(i16x4.extend_high_i8x8_u(a), i16x4_scalar.extend_high_i8x8_u(a))) return false;
  if (!check64(i16x4.extadd_pairwise_i8x8_s(a), i16x4_scalar.extadd_pairwise_i8x8_s(a))) return false;
  if (!check64(i16x4.extadd_pairwise_i8x8_u(a), i16x4_scalar.extadd_pairwise_i8x8_u(a))) return false;
  if (!check64(i16x4.q15mulr_sat_s(a, b), i16x4_scalar.q15mulr_sat_s(a, b))) return false;
  if (!check64(i16x4.extmul_low_i8x8_s(a, b), i16x4_scalar.extmul_low_i8x8_s(a, b))) return false;
  if (!check64(i16x4.extmul_low_i8x8_u(a, b), i16x4_scalar.extmul_low_i8x8_u(a, b))) return false;
  if (!check64(i16x4.extmul_high_i8x8_s(a, b), i16x4_scalar.extmul_high_i8x8_s(a, b))) return false;
  if (!check64(i16x4.extmul_high_i8x8_u(a, b), i16x4_scalar.extmul_high_i8x8_u(a, b))) return false;
  if (!check64(i16x4.shuffle(a, b, l0, l1, l2, l3), i16x4_scalar.shuffle(a, b, l0, l1, l2, l3))) return false;
  if (!check64(i16x4.relaxed_laneselect(a, b, m), i16x4_scalar.relaxed_laneselect(a, b, m))) return false;
  if (!check64(i16x4.relaxed_q15mulr_s(a, b), i16x4_scalar.relaxed_q15mulr_s(a, b))) return false;
  if (!check64(i16x4.relaxed_dot_i8x8_i7x8_s(a, b), i16x4_scalar.relaxed_dot_i8x8_i7x8_s(a, b))) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

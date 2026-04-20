import { describe, expect, test } from "as-test";
import { i32x2 } from "../v64/i32x2";
import { i32x2_scalar } from "../scalar/i32x2";

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

describe("i32x2", () => {
  test("full scalar parity", () => {
    state = 0x243f6a8885a308d3;
    let completedRuns = 0;
    for (let run = 0; run < 256; run++) {
      const a = nextU64();
      const b = nextU64();
      const m = nextU64();
      const idx = <u8>(nextU32() & 1);
      const shift = <i32>(nextU32() & 63);
      const laneVal = <i32>nextU32();
      const l0 = <u8>(nextU32() & 3);
      const l1 = <u8>(nextU32() & 3);
      checkId = 1;

      if (!check64(i32x2.splat(laneVal), i32x2_scalar.splat(laneVal))) return;
      if (!check32(i32x2.extract_lane(a, idx), i32x2_scalar.extract_lane(a, idx))) return;
      if (!check64(i32x2.replace_lane(a, idx, laneVal), i32x2_scalar.replace_lane(a, idx, laneVal))) return;
      if (!check64(i32x2.add(a, b), i32x2_scalar.add(a, b))) return;
      if (!check64(i32x2.sub(a, b), i32x2_scalar.sub(a, b))) return;
      if (!check64(i32x2.mul(a, b), i32x2_scalar.mul(a, b))) return;
      if (!check64(i32x2.min_s(a, b), i32x2_scalar.min_s(a, b))) return;
      if (!check64(i32x2.min_u(a, b), i32x2_scalar.min_u(a, b))) return;
      if (!check64(i32x2.max_s(a, b), i32x2_scalar.max_s(a, b))) return;
      if (!check64(i32x2.max_u(a, b), i32x2_scalar.max_u(a, b))) return;
      if (!check64(i32x2.dot_i16x4_s(a, b), i32x2_scalar.dot_i16x4_s(a, b))) return;
      if (!check64(i32x2.abs(a), i32x2_scalar.abs(a))) return;
      if (!check64(i32x2.neg(a), i32x2_scalar.neg(a))) return;
      if (!check64(i32x2.shl(a, shift), i32x2_scalar.shl(a, shift))) return;
      if (!check64(i32x2.shr_s(a, shift), i32x2_scalar.shr_s(a, shift))) return;
      if (!check64(i32x2.shr_u(a, shift), i32x2_scalar.shr_u(a, shift))) return;
      if (!checkBool(i32x2.all_true(a), i32x2_scalar.all_true(a))) return;
      if (!check32(i32x2.bitmask(a), i32x2_scalar.bitmask(a))) return;
      if (!check64(i32x2.eq(a, b), i32x2_scalar.eq(a, b))) return;
      if (!check64(i32x2.ne(a, b), i32x2_scalar.ne(a, b))) return;
      if (!check64(i32x2.lt_s(a, b), i32x2_scalar.lt_s(a, b))) return;
      if (!check64(i32x2.lt_u(a, b), i32x2_scalar.lt_u(a, b))) return;
      if (!check64(i32x2.le_s(a, b), i32x2_scalar.le_s(a, b))) return;
      if (!check64(i32x2.le_u(a, b), i32x2_scalar.le_u(a, b))) return;
      if (!check64(i32x2.gt_s(a, b), i32x2_scalar.gt_s(a, b))) return;
      if (!check64(i32x2.gt_u(a, b), i32x2_scalar.gt_u(a, b))) return;
      if (!check64(i32x2.ge_s(a, b), i32x2_scalar.ge_s(a, b))) return;
      if (!check64(i32x2.ge_u(a, b), i32x2_scalar.ge_u(a, b))) return;
      if (!check64(i32x2.extend_low_i16x4_s(a), i32x2_scalar.extend_low_i16x4_s(a))) return;
      if (!check64(i32x2.extend_low_i16x4_u(a), i32x2_scalar.extend_low_i16x4_u(a))) return;
      if (!check64(i32x2.extend_high_i16x4_s(a), i32x2_scalar.extend_high_i16x4_s(a))) return;
      if (!check64(i32x2.extend_high_i16x4_u(a), i32x2_scalar.extend_high_i16x4_u(a))) return;
      if (!check64(i32x2.extadd_pairwise_i16x4_s(a), i32x2_scalar.extadd_pairwise_i16x4_s(a))) return;
      if (!check64(i32x2.extadd_pairwise_i16x4_u(a), i32x2_scalar.extadd_pairwise_i16x4_u(a))) return;
      if (!check64(i32x2.extmul_low_i16x4_s(a, b), i32x2_scalar.extmul_low_i16x4_s(a, b))) return;
      if (!check64(i32x2.extmul_low_i16x4_u(a, b), i32x2_scalar.extmul_low_i16x4_u(a, b))) return;
      if (!check64(i32x2.extmul_high_i16x4_s(a, b), i32x2_scalar.extmul_high_i16x4_s(a, b))) return;
      if (!check64(i32x2.extmul_high_i16x4_u(a, b), i32x2_scalar.extmul_high_i16x4_u(a, b))) return;
      if (!check64(i32x2.shuffle(a, b, l0, l1), i32x2_scalar.shuffle(a, b, l0, l1))) return;
      if (!check64(i32x2.relaxed_laneselect(a, b, m), i32x2_scalar.relaxed_laneselect(a, b, m))) return;
      completedRuns++;
    }
    expect<i32>(completedRuns).toBe(256);
  });
});

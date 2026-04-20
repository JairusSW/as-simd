import { describe, expect, test } from "as-test";
import { i16x4 } from "../v64/i16x4";
import { i16x4_scalar } from "../scalar/i16x4";

type FnSplat = (x: i16) => u64;
type FnExtractS = (x: u64, idx: u8) => i16;
type FnExtractU = (x: u64, idx: u8) => u16;
type FnReplace = (x: u64, idx: u8, value: i16) => u64;
type FnUnaryVec = (a: u64) => u64;
type FnUnaryBool = (a: u64) => bool;
type FnUnaryI32 = (a: u64) => i32;
type FnBinaryVec = (a: u64, b: u64) => u64;
type FnShift = (a: u64, b: i32) => u64;
type FnShuffle = (a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8) => u64;
type FnLaneSelect = (a: u64, b: u64, m: u64) => u64;

function assertApiSync(): void {
  const splatFns: FnSplat[] = [i16x4.splat, i16x4_scalar.splat];
  const extractSFns: FnExtractS[] = [i16x4.extract_lane_s, i16x4_scalar.extract_lane_s];
  const extractUFns: FnExtractU[] = [i16x4.extract_lane_u, i16x4_scalar.extract_lane_u];
  const replaceFns: FnReplace[] = [i16x4.replace_lane, i16x4_scalar.replace_lane];
  const unaryVecFns: FnUnaryVec[] = [
    i16x4.abs, i16x4_scalar.abs, i16x4.neg, i16x4_scalar.neg,
    i16x4.extend_low_i8x8_s, i16x4_scalar.extend_low_i8x8_s, i16x4.extend_low_i8x8_u, i16x4_scalar.extend_low_i8x8_u,
    i16x4.extend_high_i8x8_s, i16x4_scalar.extend_high_i8x8_s, i16x4.extend_high_i8x8_u, i16x4_scalar.extend_high_i8x8_u,
    i16x4.extadd_pairwise_i8x8_s, i16x4_scalar.extadd_pairwise_i8x8_s, i16x4.extadd_pairwise_i8x8_u, i16x4_scalar.extadd_pairwise_i8x8_u,
  ];
  const unaryBoolFns: FnUnaryBool[] = [i16x4.all_true, i16x4_scalar.all_true];
  const unaryI32Fns: FnUnaryI32[] = [i16x4.bitmask, i16x4_scalar.bitmask];
  const binaryVecFns: FnBinaryVec[] = [
    i16x4.add, i16x4_scalar.add, i16x4.sub, i16x4_scalar.sub, i16x4.mul, i16x4_scalar.mul,
    i16x4.min_s, i16x4_scalar.min_s, i16x4.min_u, i16x4_scalar.min_u, i16x4.max_s, i16x4_scalar.max_s, i16x4.max_u, i16x4_scalar.max_u,
    i16x4.avgr_u, i16x4_scalar.avgr_u, i16x4.add_sat_s, i16x4_scalar.add_sat_s, i16x4.add_sat_u, i16x4_scalar.add_sat_u,
    i16x4.sub_sat_s, i16x4_scalar.sub_sat_s, i16x4.sub_sat_u, i16x4_scalar.sub_sat_u,
    i16x4.eq, i16x4_scalar.eq, i16x4.ne, i16x4_scalar.ne,
    i16x4.lt_s, i16x4_scalar.lt_s, i16x4.lt_u, i16x4_scalar.lt_u, i16x4.le_s, i16x4_scalar.le_s, i16x4.le_u, i16x4_scalar.le_u,
    i16x4.gt_s, i16x4_scalar.gt_s, i16x4.gt_u, i16x4_scalar.gt_u, i16x4.ge_s, i16x4_scalar.ge_s, i16x4.ge_u, i16x4_scalar.ge_u,
    i16x4.narrow_i32x2_s, i16x4_scalar.narrow_i32x2_s, i16x4.narrow_i32x2_u, i16x4_scalar.narrow_i32x2_u,
    i16x4.q15mulr_sat_s, i16x4_scalar.q15mulr_sat_s, i16x4.extmul_low_i8x8_s, i16x4_scalar.extmul_low_i8x8_s,
    i16x4.extmul_low_i8x8_u, i16x4_scalar.extmul_low_i8x8_u, i16x4.extmul_high_i8x8_s, i16x4_scalar.extmul_high_i8x8_s,
    i16x4.extmul_high_i8x8_u, i16x4_scalar.extmul_high_i8x8_u, i16x4.relaxed_q15mulr_s, i16x4_scalar.relaxed_q15mulr_s,
    i16x4.relaxed_dot_i8x8_i7x8_s, i16x4_scalar.relaxed_dot_i8x8_i7x8_s,
  ];
  const shiftFns: FnShift[] = [i16x4.shl, i16x4_scalar.shl, i16x4.shr_s, i16x4_scalar.shr_s, i16x4.shr_u, i16x4_scalar.shr_u];
  const shuffleFns: FnShuffle[] = [i16x4.shuffle, i16x4_scalar.shuffle];
  const laneSelectFns: FnLaneSelect[] = [i16x4.relaxed_laneselect, i16x4_scalar.relaxed_laneselect];

  expect<i32>(splatFns.length + extractSFns.length + extractUFns.length + replaceFns.length).toBe(8);
  expect<i32>(unaryVecFns.length + unaryBoolFns.length + unaryI32Fns.length).toBe(20);
  expect<i32>(binaryVecFns.length + shiftFns.length + shuffleFns.length + laneSelectFns.length).toBe(72);
}

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

describe("i16x4", () => {
  test("api sync", () => {
    assertApiSync();
  });

  test("partial load/store", () => {
    const src = new Int16Array(6);
    src[0] = 1000;
    src[1] = 2000;
    src[2] = -3000;
    src[3] = 4000;
    src[4] = 5000;
    src[5] = 6000;
    const loaded = i16x4.loadPartial(changetype<usize>(src.dataStart), 3, 2, 2, -1);
    expect<i32>(i16x4.extract_lane_s(loaded, 0)).toBe(2000);
    expect<i32>(i16x4.extract_lane_s(loaded, 1)).toBe(-3000);
    expect<i32>(i16x4.extract_lane_s(loaded, 2)).toBe(4000);
    expect<i32>(i16x4.extract_lane_s(loaded, 3)).toBe(-1);

    const dst = new Int16Array(6);
    for (let i = 0; i < dst.length; i++) dst[i] = 0x7777;
    i16x4.storePartial(changetype<usize>(dst.dataStart), i16x4(11, 22, 33, 44), 2, 4, 2);
    expect<i32>(dst[1]).toBe(0x7777);
    expect<i32>(dst[2]).toBe(11);
    expect<i32>(dst[3]).toBe(22);
    expect<i32>(dst[4]).toBe(0x7777);
  });

  test("full scalar parity", () => {
    state = 0x243f6a8885a308d3;
    let completedRuns = 0;

    for (let run = 0; run < 256; run++) {
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

      if (!check64(i16x4.splat(laneVal), i16x4_scalar.splat(laneVal))) return;
      if (!check32(i16x4.extract_lane_s(a, idx), i16x4_scalar.extract_lane_s(a, idx))) return;
      if (!check32(i16x4.extract_lane_u(a, idx), i16x4_scalar.extract_lane_u(a, idx))) return;
      if (!check64(i16x4.replace_lane(a, idx, laneVal), i16x4_scalar.replace_lane(a, idx, laneVal))) return;
      if (!check64(i16x4.add(a, b), i16x4_scalar.add(a, b))) return;
      if (!check64(i16x4.sub(a, b), i16x4_scalar.sub(a, b))) return;
      if (!check64(i16x4.mul(a, b), i16x4_scalar.mul(a, b))) return;
      if (!check64(i16x4.min_s(a, b), i16x4_scalar.min_s(a, b))) return;
      if (!check64(i16x4.min_u(a, b), i16x4_scalar.min_u(a, b))) return;
      if (!check64(i16x4.max_s(a, b), i16x4_scalar.max_s(a, b))) return;
      if (!check64(i16x4.max_u(a, b), i16x4_scalar.max_u(a, b))) return;
      if (!check64(i16x4.avgr_u(a, b), i16x4_scalar.avgr_u(a, b))) return;
      if (!check64(i16x4.abs(a), i16x4_scalar.abs(a))) return;
      if (!check64(i16x4.neg(a), i16x4_scalar.neg(a))) return;
      if (!check64(i16x4.add_sat_s(a, b), i16x4_scalar.add_sat_s(a, b))) return;
      if (!check64(i16x4.add_sat_u(a, b), i16x4_scalar.add_sat_u(a, b))) return;
      if (!check64(i16x4.sub_sat_s(a, b), i16x4_scalar.sub_sat_s(a, b))) return;
      if (!check64(i16x4.sub_sat_u(a, b), i16x4_scalar.sub_sat_u(a, b))) return;
      if (!check64(i16x4.shl(a, shift), i16x4_scalar.shl(a, shift))) return;
      if (!check64(i16x4.shr_s(a, shift), i16x4_scalar.shr_s(a, shift))) return;
      if (!check64(i16x4.shr_u(a, shift), i16x4_scalar.shr_u(a, shift))) return;
      if (!checkBool(i16x4.all_true(a), i16x4_scalar.all_true(a))) return;
      if (!check32(i16x4.bitmask(a), i16x4_scalar.bitmask(a))) return;
      if (!check64(i16x4.eq(a, b), i16x4_scalar.eq(a, b))) return;
      if (!check64(i16x4.ne(a, b), i16x4_scalar.ne(a, b))) return;
      if (!check64(i16x4.lt_s(a, b), i16x4_scalar.lt_s(a, b))) return;
      if (!check64(i16x4.lt_u(a, b), i16x4_scalar.lt_u(a, b))) return;
      if (!check64(i16x4.le_s(a, b), i16x4_scalar.le_s(a, b))) return;
      if (!check64(i16x4.le_u(a, b), i16x4_scalar.le_u(a, b))) return;
      if (!check64(i16x4.gt_s(a, b), i16x4_scalar.gt_s(a, b))) return;
      if (!check64(i16x4.gt_u(a, b), i16x4_scalar.gt_u(a, b))) return;
      if (!check64(i16x4.ge_s(a, b), i16x4_scalar.ge_s(a, b))) return;
      if (!check64(i16x4.ge_u(a, b), i16x4_scalar.ge_u(a, b))) return;
      if (!check64(i16x4.narrow_i32x2_s(c, d), i16x4_scalar.narrow_i32x2_s(c, d))) return;
      if (!check64(i16x4.narrow_i32x2_u(c, d), i16x4_scalar.narrow_i32x2_u(c, d))) return;
      if (!check64(i16x4.extend_low_i8x8_s(a), i16x4_scalar.extend_low_i8x8_s(a))) return;
      if (!check64(i16x4.extend_low_i8x8_u(a), i16x4_scalar.extend_low_i8x8_u(a))) return;
      if (!check64(i16x4.extend_high_i8x8_s(a), i16x4_scalar.extend_high_i8x8_s(a))) return;
      if (!check64(i16x4.extend_high_i8x8_u(a), i16x4_scalar.extend_high_i8x8_u(a))) return;
      if (!check64(i16x4.extadd_pairwise_i8x8_s(a), i16x4_scalar.extadd_pairwise_i8x8_s(a))) return;
      if (!check64(i16x4.extadd_pairwise_i8x8_u(a), i16x4_scalar.extadd_pairwise_i8x8_u(a))) return;
      if (!check64(i16x4.q15mulr_sat_s(a, b), i16x4_scalar.q15mulr_sat_s(a, b))) return;
      if (!check64(i16x4.extmul_low_i8x8_s(a, b), i16x4_scalar.extmul_low_i8x8_s(a, b))) return;
      if (!check64(i16x4.extmul_low_i8x8_u(a, b), i16x4_scalar.extmul_low_i8x8_u(a, b))) return;
      if (!check64(i16x4.extmul_high_i8x8_s(a, b), i16x4_scalar.extmul_high_i8x8_s(a, b))) return;
      if (!check64(i16x4.extmul_high_i8x8_u(a, b), i16x4_scalar.extmul_high_i8x8_u(a, b))) return;
      if (!check64(i16x4.shuffle(a, b, l0, l1, l2, l3), i16x4_scalar.shuffle(a, b, l0, l1, l2, l3))) return;
      if (!check64(i16x4.relaxed_laneselect(a, b, m), i16x4_scalar.relaxed_laneselect(a, b, m))) return;
      if (!check64(i16x4.relaxed_q15mulr_s(a, b), i16x4_scalar.relaxed_q15mulr_s(a, b))) return;
      if (!check64(i16x4.relaxed_dot_i8x8_i7x8_s(a, b), i16x4_scalar.relaxed_dot_i8x8_i7x8_s(a, b))) return;
      completedRuns++;
    }

    expect<i32>(completedRuns).toBe(256);
  });
});

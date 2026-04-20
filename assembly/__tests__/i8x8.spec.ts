import { describe, expect, test } from "as-test";
import { i8x8 } from "../v64/i8x8";
import { i8x8_scalar } from "../scalar/i8x8";

type FnSplat = (x: i8) => u64;
type FnExtractS = (x: u64, idx: u8) => i8;
type FnExtractU = (x: u64, idx: u8) => u8;
type FnReplace = (x: u64, idx: u8, value: i8) => u64;
type FnUnaryVec = (a: u64) => u64;
type FnUnaryBool = (a: u64) => bool;
type FnUnaryI32 = (a: u64) => i32;
type FnBinaryVec = (a: u64, b: u64) => u64;
type FnShift = (a: u64, b: i32) => u64;
type FnNarrow = (a: u64, b: u64) => u64;
type FnShuffle = (a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8) => u64;
type FnSwizzle = (a: u64, s: u64) => u64;
type FnLaneSelect = (a: u64, b: u64, m: u64) => u64;

function assertApiSync(): void {
  const splatFns: FnSplat[] = [i8x8.splat, i8x8_scalar.splat];
  const extractSFns: FnExtractS[] = [i8x8.extract_lane_s, i8x8_scalar.extract_lane_s];
  const extractUFns: FnExtractU[] = [i8x8.extract_lane_u, i8x8_scalar.extract_lane_u];
  const replaceFns: FnReplace[] = [i8x8.replace_lane, i8x8_scalar.replace_lane];
  const unaryVecFns: FnUnaryVec[] = [i8x8.abs, i8x8_scalar.abs, i8x8.neg, i8x8_scalar.neg, i8x8.popcnt, i8x8_scalar.popcnt];
  const unaryBoolFns: FnUnaryBool[] = [i8x8.all_true, i8x8_scalar.all_true];
  const unaryI32Fns: FnUnaryI32[] = [i8x8.bitmask, i8x8_scalar.bitmask];
  const binaryVecFns: FnBinaryVec[] = [
    i8x8.add, i8x8_scalar.add, i8x8.sub, i8x8_scalar.sub, i8x8.mul, i8x8_scalar.mul,
    i8x8.min_s, i8x8_scalar.min_s, i8x8.min_u, i8x8_scalar.min_u, i8x8.max_s, i8x8_scalar.max_s, i8x8.max_u, i8x8_scalar.max_u,
    i8x8.avgr_u, i8x8_scalar.avgr_u, i8x8.add_sat_s, i8x8_scalar.add_sat_s, i8x8.add_sat_u, i8x8_scalar.add_sat_u,
    i8x8.sub_sat_s, i8x8_scalar.sub_sat_s, i8x8.sub_sat_u, i8x8_scalar.sub_sat_u,
    i8x8.eq, i8x8_scalar.eq, i8x8.ne, i8x8_scalar.ne,
    i8x8.lt_s, i8x8_scalar.lt_s, i8x8.lt_u, i8x8_scalar.lt_u, i8x8.le_s, i8x8_scalar.le_s, i8x8.le_u, i8x8_scalar.le_u,
    i8x8.gt_s, i8x8_scalar.gt_s, i8x8.gt_u, i8x8_scalar.gt_u, i8x8.ge_s, i8x8_scalar.ge_s, i8x8.ge_u, i8x8_scalar.ge_u,
    i8x8.narrow_i16x4_s, i8x8_scalar.narrow_i16x4_s, i8x8.narrow_i16x4_u, i8x8_scalar.narrow_i16x4_u,
  ];
  const shiftFns: FnShift[] = [i8x8.shl, i8x8_scalar.shl, i8x8.shr_s, i8x8_scalar.shr_s, i8x8.shr_u, i8x8_scalar.shr_u];
  const shuffleFns: FnShuffle[] = [i8x8.shuffle, i8x8_scalar.shuffle];
  const swizzleFns: FnSwizzle[] = [i8x8.swizzle, i8x8_scalar.swizzle, i8x8.relaxed_swizzle, i8x8_scalar.relaxed_swizzle];
  const laneSelectFns: FnLaneSelect[] = [i8x8.relaxed_laneselect, i8x8_scalar.relaxed_laneselect];

  expect<i32>(splatFns.length + extractSFns.length + extractUFns.length + replaceFns.length).toBe(8);
  expect<i32>(unaryVecFns.length + unaryBoolFns.length + unaryI32Fns.length).toBe(10);
  expect<i32>(binaryVecFns.length + shiftFns.length + shuffleFns.length + swizzleFns.length + laneSelectFns.length).toBe(62);
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

describe("i8x8", () => {
  test("api sync", () => {
    assertApiSync();
  });

  test("narrow saturation edge cases", () => {
    // lanes: [200, -200, 127, -128]
    const aS: u64 = 0xff80007fff3800c8;
    // lanes: [300, -300, 1, -1]
    const bS: u64 = 0xffff0001fed4012c;
    const outS = i8x8.narrow_i16x4_s(aS, bS);
    const expectedS: u64 = 0xff01807f807f807f; // [127,-128,127,-128,127,-128,1,-1]
    expect<u64>(outS).toBe(expectedS);
    expect<u64>(outS).toBe(i8x8_scalar.narrow_i16x4_s(aS, bS));

    // lanes: [-1, 0, 255, 256]
    const aU: u64 = 0x010000ff0000ffff;
    // lanes: [300, -300, 1, 42]
    const bU: u64 = 0x002a0001fed4012c;
    const outU = i8x8.narrow_i16x4_u(aU, bU);
    const expectedU: u64 = 0x2a0100ffffff0000; // [0,0,255,255,255,0,1,42]
    expect<u64>(outU).toBe(expectedU);
    expect<u64>(outU).toBe(i8x8_scalar.narrow_i16x4_u(aU, bU));
  });

  test("partial load/store", () => {
    const src = new Uint8Array(12);
    for (let i = 0; i < src.length; i++) src[i] = <u8>(10 + i);
    const loaded = i8x8.loadPartial(changetype<usize>(src.dataStart), 5, 2, 1, -1);
    expect<i32>(i8x8.extract_lane_s(loaded, 0)).toBe(12);
    expect<i32>(i8x8.extract_lane_s(loaded, 1)).toBe(13);
    expect<i32>(i8x8.extract_lane_s(loaded, 2)).toBe(14);
    expect<i32>(i8x8.extract_lane_s(loaded, 3)).toBe(15);
    expect<i32>(i8x8.extract_lane_s(loaded, 4)).toBe(16);
    expect<i32>(i8x8.extract_lane_s(loaded, 5)).toBe(-1);
    expect<i32>(i8x8.extract_lane_s(loaded, 6)).toBe(-1);
    expect<i32>(i8x8.extract_lane_s(loaded, 7)).toBe(-1);

    const dst = new Uint8Array(12);
    for (let i = 0; i < dst.length; i++) dst[i] = 0xaa;
    i8x8.storePartial(changetype<usize>(dst.dataStart), i8x8(1, 2, 3, 4, 5, 6, 7, 8), 3, 4, 1);
    expect<i32>(dst[3]).toBe(0xaa);
    expect<i32>(dst[4]).toBe(1);
    expect<i32>(dst[5]).toBe(2);
    expect<i32>(dst[6]).toBe(3);
    expect<i32>(dst[7]).toBe(0xaa);
  });

  test("full scalar parity", () => {
    state = 0x243f6a8885a308d3;
    let completedRuns = 0;

    for (let run = 0; run < 256; run++) {
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

      if (!check64(i8x8.splat(laneVal), i8x8_scalar.splat(laneVal))) return;
      if (!check32(i8x8.extract_lane_s(a, idx), i8x8_scalar.extract_lane_s(a, idx))) return;
      if (!check32(i8x8.extract_lane_u(a, idx), i8x8_scalar.extract_lane_u(a, idx))) return;
      if (!check64(i8x8.replace_lane(a, idx, laneVal), i8x8_scalar.replace_lane(a, idx, laneVal))) return;
      if (!check64(i8x8.add(a, b), i8x8_scalar.add(a, b))) return;
      if (!check64(i8x8.sub(a, b), i8x8_scalar.sub(a, b))) return;
      if (!check64(i8x8.mul(a, b), i8x8_scalar.mul(a, b))) return;
      if (!check64(i8x8.min_s(a, b), i8x8_scalar.min_s(a, b))) return;
      if (!check64(i8x8.min_u(a, b), i8x8_scalar.min_u(a, b))) return;
      if (!check64(i8x8.max_s(a, b), i8x8_scalar.max_s(a, b))) return;
      if (!check64(i8x8.max_u(a, b), i8x8_scalar.max_u(a, b))) return;
      if (!check64(i8x8.avgr_u(a, b), i8x8_scalar.avgr_u(a, b))) return;
      if (!check64(i8x8.abs(a), i8x8_scalar.abs(a))) return;
      if (!check64(i8x8.neg(a), i8x8_scalar.neg(a))) return;
      if (!check64(i8x8.add_sat_s(a, b), i8x8_scalar.add_sat_s(a, b))) return;
      if (!check64(i8x8.add_sat_u(a, b), i8x8_scalar.add_sat_u(a, b))) return;
      if (!check64(i8x8.sub_sat_s(a, b), i8x8_scalar.sub_sat_s(a, b))) return;
      if (!check64(i8x8.sub_sat_u(a, b), i8x8_scalar.sub_sat_u(a, b))) return;
      if (!check64(i8x8.shl(a, shift), i8x8_scalar.shl(a, shift))) return;
      if (!check64(i8x8.shr_s(a, shift), i8x8_scalar.shr_s(a, shift))) return;
      if (!check64(i8x8.shr_u(a, shift), i8x8_scalar.shr_u(a, shift))) return;
      if (!checkBool(i8x8.all_true(a), i8x8_scalar.all_true(a))) return;
      if (!check32(i8x8.bitmask(a), i8x8_scalar.bitmask(a))) return;
      if (!check64(i8x8.popcnt(a), i8x8_scalar.popcnt(a))) return;
      if (!check64(i8x8.eq(a, b), i8x8_scalar.eq(a, b))) return;
      if (!check64(i8x8.ne(a, b), i8x8_scalar.ne(a, b))) return;
      if (!check64(i8x8.lt_s(a, b), i8x8_scalar.lt_s(a, b))) return;
      if (!check64(i8x8.lt_u(a, b), i8x8_scalar.lt_u(a, b))) return;
      if (!check64(i8x8.le_s(a, b), i8x8_scalar.le_s(a, b))) return;
      if (!check64(i8x8.le_u(a, b), i8x8_scalar.le_u(a, b))) return;
      if (!check64(i8x8.gt_s(a, b), i8x8_scalar.gt_s(a, b))) return;
      if (!check64(i8x8.gt_u(a, b), i8x8_scalar.gt_u(a, b))) return;
      if (!check64(i8x8.ge_s(a, b), i8x8_scalar.ge_s(a, b))) return;
      if (!check64(i8x8.ge_u(a, b), i8x8_scalar.ge_u(a, b))) return;
      if (!check64(i8x8.narrow_i16x4_s(c, d), i8x8_scalar.narrow_i16x4_s(c, d))) return;
      if (!check64(i8x8.narrow_i16x4_u(c, d), i8x8_scalar.narrow_i16x4_u(c, d))) return;
      if (!check64(i8x8.shuffle(a, b, l0, l1, l2, l3, l4, l5, l6, l7), i8x8_scalar.shuffle(a, b, l0, l1, l2, l3, l4, l5, l6, l7))) return;
      if (!check64(i8x8.swizzle(a, s), i8x8_scalar.swizzle(a, s))) return;
      if (!check64(i8x8.relaxed_swizzle(a, s), i8x8_scalar.relaxed_swizzle(a, s))) return;
      if (!check64(i8x8.relaxed_laneselect(a, b, m), i8x8_scalar.relaxed_laneselect(a, b, m))) return;
      completedRuns++;
    }

    expect<i32>(completedRuns).toBe(256);
  });
});

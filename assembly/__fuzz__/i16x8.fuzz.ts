import { expect, fuzz, FuzzSeed } from "as-test";
import { i16x4_scalar } from "../scalar/i16x4";

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
@inline function lo64(x: v128): u64 { return <u64>i64x2.extract_lane(x, 0); }
// @ts-expect-error: decorator
@inline function hi64(x: v128): u64 { return <u64>i64x2.extract_lane(x, 1); }
// @ts-expect-error: decorator
@inline function v128From64(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }

// @ts-expect-error: decorator
@inline function checkV128(actual: v128, expectedLo: u64, expectedHi: u64): bool {
  if (lo64(actual) != expectedLo || hi64(actual) != expectedHi) {
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

fuzz("i16x8 scalar-vs-simd parity", (seedValue: i32): bool => {
  if (!ASC_FEATURE_SIMD) return true;

  state = <u64>seedValue;
  const aLo = nextU64();
  const aHi = nextU64();
  const bLo = nextU64();
  const bHi = nextU64();
  const shift = <i32>(nextU32() & 31);
  const laneVal = <i16>nextU32();

  const a = v128From64(aLo, aHi);
  const b = v128From64(bLo, bHi);

  checkId = 1;

  if (!checkV128(i16x8.splat(laneVal), i16x4_scalar.splat(laneVal), i16x4_scalar.splat(laneVal))) return false;
  if (!checkV128(i16x8.add(a, b), i16x4_scalar.add(aLo, bLo), i16x4_scalar.add(aHi, bHi))) return false;
  if (!checkV128(i16x8.sub(a, b), i16x4_scalar.sub(aLo, bLo), i16x4_scalar.sub(aHi, bHi))) return false;
  if (!checkV128(i16x8.mul(a, b), i16x4_scalar.mul(aLo, bLo), i16x4_scalar.mul(aHi, bHi))) return false;
  if (!checkV128(i16x8.min_s(a, b), i16x4_scalar.min_s(aLo, bLo), i16x4_scalar.min_s(aHi, bHi))) return false;
  if (!checkV128(i16x8.max_s(a, b), i16x4_scalar.max_s(aLo, bLo), i16x4_scalar.max_s(aHi, bHi))) return false;
  if (!checkV128(i16x8.abs(a), i16x4_scalar.abs(aLo), i16x4_scalar.abs(aHi))) return false;
  if (!checkV128(i16x8.neg(a), i16x4_scalar.neg(aLo), i16x4_scalar.neg(aHi))) return false;
  if (!checkV128(i16x8.add_sat_s(a, b), i16x4_scalar.add_sat_s(aLo, bLo), i16x4_scalar.add_sat_s(aHi, bHi))) return false;
  if (!checkV128(i16x8.sub_sat_s(a, b), i16x4_scalar.sub_sat_s(aLo, bLo), i16x4_scalar.sub_sat_s(aHi, bHi))) return false;
  if (!checkV128(i16x8.shl(a, shift), i16x4_scalar.shl(aLo, shift), i16x4_scalar.shl(aHi, shift))) return false;
  if (!checkV128(i16x8.shr_s(a, shift), i16x4_scalar.shr_s(aLo, shift), i16x4_scalar.shr_s(aHi, shift))) return false;
  if (!checkBool(i16x8.all_true(a), i16x4_scalar.all_true(aLo) && i16x4_scalar.all_true(aHi))) return false;
  if (!check32(i16x8.bitmask(a), i16x4_scalar.bitmask(aLo) | (i16x4_scalar.bitmask(aHi) << 4))) return false;
  if (!checkV128(i16x8.eq(a, b), i16x4_scalar.eq(aLo, bLo), i16x4_scalar.eq(aHi, bHi))) return false;
  if (!checkV128(i16x8.ne(a, b), i16x4_scalar.ne(aLo, bLo), i16x4_scalar.ne(aHi, bHi))) return false;
  if (!checkV128(i16x8.lt_s(a, b), i16x4_scalar.lt_s(aLo, bLo), i16x4_scalar.lt_s(aHi, bHi))) return false;
  if (!checkV128(i16x8.le_s(a, b), i16x4_scalar.le_s(aLo, bLo), i16x4_scalar.le_s(aHi, bHi))) return false;
  if (!checkV128(i16x8.gt_s(a, b), i16x4_scalar.gt_s(aLo, bLo), i16x4_scalar.gt_s(aHi, bHi))) return false;
  if (!checkV128(i16x8.ge_s(a, b), i16x4_scalar.ge_s(aLo, bLo), i16x4_scalar.ge_s(aHi, bHi))) return false;

  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

import { expect, fuzz, FuzzSeed } from "as-test";
import { i8x8_scalar } from "../scalar/i8x8";

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

fuzz("i8x16 scalar-vs-simd parity", (seedValue: i32): bool => {
  if (!ASC_FEATURE_SIMD) return true;

  state = <u64>seedValue;
  const aLo = nextU64();
  const aHi = nextU64();
  const bLo = nextU64();
  const bHi = nextU64();
  const shift = <i32>(nextU32() & 31);
  const laneVal = <i8>nextU32();

  const a = v128From64(aLo, aHi);
  const b = v128From64(bLo, bHi);

  checkId = 1;

  if (!checkV128(i8x16.splat(laneVal), i8x8_scalar.splat(laneVal), i8x8_scalar.splat(laneVal))) return false;
  if (!checkV128(i8x16.add(a, b), i8x8_scalar.add(aLo, bLo), i8x8_scalar.add(aHi, bHi))) return false;
  if (!checkV128(i8x16.sub(a, b), i8x8_scalar.sub(aLo, bLo), i8x8_scalar.sub(aHi, bHi))) return false;
  if (!checkV128(i8x16.min_s(a, b), i8x8_scalar.min_s(aLo, bLo), i8x8_scalar.min_s(aHi, bHi))) return false;
  if (!checkV128(i8x16.max_s(a, b), i8x8_scalar.max_s(aLo, bLo), i8x8_scalar.max_s(aHi, bHi))) return false;
  if (!checkV128(i8x16.abs(a), i8x8_scalar.abs(aLo), i8x8_scalar.abs(aHi))) return false;
  if (!checkV128(i8x16.neg(a), i8x8_scalar.neg(aLo), i8x8_scalar.neg(aHi))) return false;
  if (!checkV128(i8x16.add_sat_s(a, b), i8x8_scalar.add_sat_s(aLo, bLo), i8x8_scalar.add_sat_s(aHi, bHi))) return false;
  if (!checkV128(i8x16.sub_sat_s(a, b), i8x8_scalar.sub_sat_s(aLo, bLo), i8x8_scalar.sub_sat_s(aHi, bHi))) return false;
  if (!checkV128(i8x16.shl(a, shift), i8x8_scalar.shl(aLo, shift), i8x8_scalar.shl(aHi, shift))) return false;
  if (!checkV128(i8x16.shr_s(a, shift), i8x8_scalar.shr_s(aLo, shift), i8x8_scalar.shr_s(aHi, shift))) return false;
  if (!checkBool(i8x16.all_true(a), i8x8_scalar.all_true(aLo) && i8x8_scalar.all_true(aHi))) return false;
  if (!check32(i8x16.bitmask(a), i8x8_scalar.bitmask(aLo) | (i8x8_scalar.bitmask(aHi) << 8))) return false;
  if (!checkV128(i8x16.popcnt(a), i8x8_scalar.popcnt(aLo), i8x8_scalar.popcnt(aHi))) return false;
  if (!checkV128(i8x16.eq(a, b), i8x8_scalar.eq(aLo, bLo), i8x8_scalar.eq(aHi, bHi))) return false;
  if (!checkV128(i8x16.ne(a, b), i8x8_scalar.ne(aLo, bLo), i8x8_scalar.ne(aHi, bHi))) return false;
  if (!checkV128(i8x16.lt_s(a, b), i8x8_scalar.lt_s(aLo, bLo), i8x8_scalar.lt_s(aHi, bHi))) return false;
  if (!checkV128(i8x16.le_s(a, b), i8x8_scalar.le_s(aLo, bLo), i8x8_scalar.le_s(aHi, bHi))) return false;
  if (!checkV128(i8x16.gt_s(a, b), i8x8_scalar.gt_s(aLo, bLo), i8x8_scalar.gt_s(aHi, bHi))) return false;
  if (!checkV128(i8x16.ge_s(a, b), i8x8_scalar.ge_s(aLo, bLo), i8x8_scalar.ge_s(aHi, bHi))) return false;

  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

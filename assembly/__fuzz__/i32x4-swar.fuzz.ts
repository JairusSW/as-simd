import { expect, fuzz, FuzzSeed } from "as-test";
import { i32x4_swar } from "../v128/i32x4_swar";

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
@inline function v128From64(lo: u64, hi: u64): v128 {
  return i64x2(lo as i64, hi as i64);
}

// @ts-expect-error: decorator
@inline function lo64(x: v128): u64 {
  return i64x2.extract_lane(x, 0) as u64;
}

// @ts-expect-error: decorator
@inline function hi64(x: v128): u64 {
  return i64x2.extract_lane(x, 1) as u64;
}

// @ts-expect-error: decorator
@inline function pair(lo: u64): v128 {
  return v128From64(lo, i32x4_swar.take_hi());
}

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

fuzz("i32x4_swar parity vs i32x4", (seedValue: i32): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  state = <u64>seedValue;
  const a = v128From64(nextU64(), nextU64());
  const b = v128From64(nextU64(), nextU64());
  const aLo = lo64(a);
  const aHi = hi64(a);
  const bLo = lo64(b);
  const bHi = hi64(b);
  const idx: u8 = 1;
  const lane = <i32>nextU32();
  const shift = <i32>(nextU32() & 31);
  checkId = 1;

  if (!checkV128(pair(i32x4_swar.splat(lane)), i32x4.splat(lane))) return false;
  if (!check32(i32x4_swar.extract_lane(aLo, aHi, idx), i32x4.extract_lane(a, 1))) return false;
  if (!checkV128(pair(i32x4_swar.replace_lane(aLo, aHi, idx, lane)), i32x4.replace_lane(a, 1, lane))) return false;
  if (!checkV128(pair(i32x4_swar.add(aLo, aHi, bLo, bHi)), i32x4.add(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.sub(aLo, aHi, bLo, bHi)), i32x4.sub(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.abs(aLo, aHi)), i32x4.abs(a))) return false;
  if (!checkV128(pair(i32x4_swar.neg(aLo, aHi)), i32x4.neg(a))) return false;
  if (!checkV128(pair(i32x4_swar.shl(aLo, aHi, shift)), i32x4.shl(a, shift))) return false;
  if (!checkV128(pair(i32x4_swar.shr_s(aLo, aHi, shift)), i32x4.shr_s(a, shift))) return false;
  if (!checkBool(i32x4_swar.all_true(aLo, aHi), i32x4.all_true(a))) return false;
  if (!check32(i32x4_swar.bitmask(aLo, aHi), i32x4.bitmask(a))) return false;
  if (!checkV128(pair(i32x4_swar.eq(aLo, aHi, bLo, bHi)), i32x4.eq(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.ne(aLo, aHi, bLo, bHi)), i32x4.ne(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.lt_s(aLo, aHi, bLo, bHi)), i32x4.lt_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.le_s(aLo, aHi, bLo, bHi)), i32x4.le_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.gt_s(aLo, aHi, bLo, bHi)), i32x4.gt_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.ge_s(aLo, aHi, bLo, bHi)), i32x4.ge_s(a, b))) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

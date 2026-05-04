import { expect, fuzz, FuzzSeed } from "as-test";
import { i32x4_swar } from "../v128/i32x4_swar";

let checkId: i32 = 0;

// @ts-expect-error: decorator
@inline function u64At(words: u32[], index: i32): u64 {
  return (<u64>unchecked(words[index]) << 32) | <u64>unchecked(words[index + 1]);
}

// @ts-expect-error: decorator
@inline function v128From64(lo: u64, hi: u64): v128 { return i64x2(lo as i64, hi as i64); }
// @ts-expect-error: decorator
@inline function lo64(x: v128): u64 { return i64x2.extract_lane(x, 0) as u64; }
// @ts-expect-error: decorator
@inline function hi64(x: v128): u64 { return i64x2.extract_lane(x, 1) as u64; }
// @ts-expect-error: decorator
@inline function pair(lo: u64): v128 { return v128From64(lo, i32x4_swar.take_hi()); }

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
@inline function checkBool(a: bool, b: bool): bool {
  if (a != b) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

fuzz("i32x4_swar parity vs i32x4", (words: u32[]): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  const aLo = u64At(words, 0);
  const aHi = u64At(words, 2);
  const bLo = u64At(words, 4);
  const bHi = u64At(words, 6);
  const lane = <i32>unchecked(words[8]);
  const shift = <i32>(unchecked(words[9]) & 31);
  const a = v128From64(aLo, aHi);
  const b = v128From64(bLo, bHi);
  const idx: u8 = 1;
  checkId = 1;

  if (!checkV128(pair(i32x4_swar.splat(lane)), i32x4.splat(lane))) return false;
  if (!checkBool(i32x4_swar.extract_lane(aLo, aHi, idx) == i32x4.extract_lane(a, 1), true)) return false;
  if (!checkV128(pair(i32x4_swar.replace_lane(aLo, aHi, idx, lane)), i32x4.replace_lane(a, 1, lane))) return false;
  if (!checkV128(pair(i32x4_swar.add(aLo, aHi, bLo, bHi)), i32x4.add(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.sub(aLo, aHi, bLo, bHi)), i32x4.sub(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.mul(aLo, aHi, bLo, bHi)), i32x4.mul(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.min_s(aLo, aHi, bLo, bHi)), i32x4.min_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.min_u(aLo, aHi, bLo, bHi)), i32x4.min_u(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.max_s(aLo, aHi, bLo, bHi)), i32x4.max_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.max_u(aLo, aHi, bLo, bHi)), i32x4.max_u(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.abs(aLo, aHi)), i32x4.abs(a))) return false;
  if (!checkV128(pair(i32x4_swar.neg(aLo, aHi)), i32x4.neg(a))) return false;
  if (!checkV128(pair(i32x4_swar.shl(aLo, aHi, shift)), i32x4.shl(a, shift))) return false;
  if (!checkV128(pair(i32x4_swar.shr_s(aLo, aHi, shift)), i32x4.shr_s(a, shift))) return false;
  if (!checkV128(pair(i32x4_swar.shr_u(aLo, aHi, shift)), i32x4.shr_u(a, shift))) return false;
  if (!checkBool(i32x4_swar.all_true(aLo, aHi), i32x4.all_true(a))) return false;
  if (!checkV128(pair(i32x4_swar.eq(aLo, aHi, bLo, bHi)), i32x4.eq(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.ne(aLo, aHi, bLo, bHi)), i32x4.ne(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.lt_s(aLo, aHi, bLo, bHi)), i32x4.lt_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.le_s(aLo, aHi, bLo, bHi)), i32x4.le_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.gt_s(aLo, aHi, bLo, bHi)), i32x4.gt_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.ge_s(aLo, aHi, bLo, bHi)), i32x4.ge_s(a, b))) return false;
  if (!checkV128(pair(i32x4_swar.relaxed_laneselect(aLo, aHi, bLo, bHi, aLo, aHi)), i32x4.relaxed_laneselect(a, b, a))) return false;
  return true;
}).generate((seed: FuzzSeed, run: (words: u32[]) => bool): void => {
  run(seed.array<u32>((s: FuzzSeed): u32 => s.u32(), { min: 10, max: 10 }));
});

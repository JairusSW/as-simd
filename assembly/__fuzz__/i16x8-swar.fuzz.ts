import { expect, fuzz, FuzzSeed } from "as-test";
import { i16x8_swar } from "../v128/lanes";

let checkId: i32 = 0;

// @ts-expect-error: decorator
@inline function u64At(words: u32[], index: i32): u64 {
  return (
    ((<u64>unchecked(words[index])) << 32) | (<u64>unchecked(words[index + 1]))
  );
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
  return v128From64(lo, i16x8_swar.take_hi());
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

fuzz("i16x8_swar parity vs i16x8", (words: u32[]): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  const aLo = u64At(words, 0);
  const aHi = u64At(words, 2);
  const bLo = u64At(words, 4);
  const bHi = u64At(words, 6);
  const lane = <i16>unchecked(words[8]);
  const shift = <i32>(unchecked(words[9]) & 31);
  const a = v128From64(aLo, aHi);
  const b = v128From64(bLo, bHi);
  const idx: u8 = 3;
  checkId = 1;

  if (!checkV128(pair(i16x8_swar.splat(lane)), i16x8.splat(lane))) return false;
  if (
    !check32(
      i16x8_swar.extract_lane_s(aLo, aHi, idx),
      i16x8.extract_lane_s(a, 3),
    )
  )
    return false;
  if (
    !check32(
      i16x8_swar.extract_lane_u(aLo, aHi, idx),
      i16x8.extract_lane_u(a, 3),
    )
  )
    return false;
  if (
    !checkV128(
      pair(i16x8_swar.replace_lane(aLo, aHi, idx, lane)),
      i16x8.replace_lane(a, 3, lane),
    )
  )
    return false;
  if (!checkV128(pair(i16x8_swar.add(aLo, aHi, bLo, bHi)), i16x8.add(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.sub(aLo, aHi, bLo, bHi)), i16x8.sub(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.mul(aLo, aHi, bLo, bHi)), i16x8.mul(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.min_s(aLo, aHi, bLo, bHi)), i16x8.min_s(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.min_u(aLo, aHi, bLo, bHi)), i16x8.min_u(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.max_s(aLo, aHi, bLo, bHi)), i16x8.max_s(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.max_u(aLo, aHi, bLo, bHi)), i16x8.max_u(a, b)))
    return false;
  if (
    !checkV128(pair(i16x8_swar.avgr_u(aLo, aHi, bLo, bHi)), i16x8.avgr_u(a, b))
  )
    return false;
  if (!checkV128(pair(i16x8_swar.abs(aLo, aHi)), i16x8.abs(a))) return false;
  if (!checkV128(pair(i16x8_swar.neg(aLo, aHi)), i16x8.neg(a))) return false;
  if (
    !checkV128(
      pair(i16x8_swar.add_sat_s(aLo, aHi, bLo, bHi)),
      i16x8.add_sat_s(a, b),
    )
  )
    return false;
  if (
    !checkV128(
      pair(i16x8_swar.add_sat_u(aLo, aHi, bLo, bHi)),
      i16x8.add_sat_u(a, b),
    )
  )
    return false;
  if (
    !checkV128(
      pair(i16x8_swar.sub_sat_s(aLo, aHi, bLo, bHi)),
      i16x8.sub_sat_s(a, b),
    )
  )
    return false;
  if (
    !checkV128(
      pair(i16x8_swar.sub_sat_u(aLo, aHi, bLo, bHi)),
      i16x8.sub_sat_u(a, b),
    )
  )
    return false;
  if (!checkV128(pair(i16x8_swar.shl(aLo, aHi, shift)), i16x8.shl(a, shift)))
    return false;
  if (
    !checkV128(pair(i16x8_swar.shr_s(aLo, aHi, shift)), i16x8.shr_s(a, shift))
  )
    return false;
  if (
    !checkV128(pair(i16x8_swar.shr_u(aLo, aHi, shift)), i16x8.shr_u(a, shift))
  )
    return false;
  if (!checkBool(i16x8_swar.all_true(aLo, aHi), i16x8.all_true(a)))
    return false;
  if (!check32(i16x8_swar.bitmask(aLo, aHi), i16x8.bitmask(a))) return false;
  if (!checkV128(pair(i16x8_swar.eq(aLo, aHi, bLo, bHi)), i16x8.eq(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.ne(aLo, aHi, bLo, bHi)), i16x8.ne(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.lt_s(aLo, aHi, bLo, bHi)), i16x8.lt_s(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.lt_u(aLo, aHi, bLo, bHi)), i16x8.lt_u(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.le_s(aLo, aHi, bLo, bHi)), i16x8.le_s(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.le_u(aLo, aHi, bLo, bHi)), i16x8.le_u(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.gt_s(aLo, aHi, bLo, bHi)), i16x8.gt_s(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.gt_u(aLo, aHi, bLo, bHi)), i16x8.gt_u(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.ge_s(aLo, aHi, bLo, bHi)), i16x8.ge_s(a, b)))
    return false;
  if (!checkV128(pair(i16x8_swar.ge_u(aLo, aHi, bLo, bHi)), i16x8.ge_u(a, b)))
    return false;
  return true;
}).generate((seed: FuzzSeed, run: (words: u32[]) => bool): void => {
  run(seed.array<u32>((s: FuzzSeed): u32 => s.u32(), { min: 10, max: 10 }));
});

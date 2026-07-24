import { expect, fuzz, FuzzSeed } from "as-test";
import { i64x2_swar } from "../v128/lanes";

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
  return v128From64(lo, i64x2_swar.take_hi());
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
@inline function checkBool(a: bool, b: bool): bool {
  if (a != b) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

fuzz("i64x2_swar parity vs i64x2", (words: u32[]): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  const aLo = u64At(words, 0);
  const aHi = u64At(words, 2);
  const bLo = u64At(words, 4);
  const bHi = u64At(words, 6);
  const lane = u64At(words, 8) as i64;
  const shift = <i32>(unchecked(words[10]) & 63);
  const a = v128From64(aLo, aHi);
  const b = v128From64(bLo, bHi);
  const idx: u8 = 1;
  checkId = 1;

  if (!checkV128(pair(i64x2_swar.splat(lane)), i64x2.splat(lane))) return false;
  if (
    !checkBool(
      i64x2_swar.extract_lane(aLo, aHi, idx) == i64x2.extract_lane(a, 1),
      true,
    )
  )
    return false;
  if (
    !checkV128(
      pair(i64x2_swar.replace_lane(aLo, aHi, idx, lane)),
      i64x2.replace_lane(a, 1, lane),
    )
  )
    return false;
  if (!checkV128(pair(i64x2_swar.add(aLo, aHi, bLo, bHi)), i64x2.add(a, b)))
    return false;
  if (!checkV128(pair(i64x2_swar.sub(aLo, aHi, bLo, bHi)), i64x2.sub(a, b)))
    return false;
  if (!checkV128(pair(i64x2_swar.neg(aLo, aHi)), i64x2.neg(a))) return false;
  if (!checkV128(pair(i64x2_swar.shl(aLo, aHi, shift)), i64x2.shl(a, shift)))
    return false;
  if (
    !checkV128(pair(i64x2_swar.shr_s(aLo, aHi, shift)), i64x2.shr_s(a, shift))
  )
    return false;
  if (
    !checkV128(pair(i64x2_swar.shr_u(aLo, aHi, shift)), i64x2.shr_u(a, shift))
  )
    return false;
  if (!checkBool(i64x2_swar.all_true(aLo, aHi), i64x2.all_true(a)))
    return false;
  if (!checkBool(i64x2_swar.bitmask(aLo, aHi) == i64x2.bitmask(a), true))
    return false;
  if (!checkV128(pair(i64x2_swar.eq(aLo, aHi, bLo, bHi)), i64x2.eq(a, b)))
    return false;
  if (!checkV128(pair(i64x2_swar.ne(aLo, aHi, bLo, bHi)), i64x2.ne(a, b)))
    return false;
  if (!checkV128(pair(i64x2_swar.lt_s(aLo, aHi, bLo, bHi)), i64x2.lt_s(a, b)))
    return false;
  if (!checkV128(pair(i64x2_swar.le_s(aLo, aHi, bLo, bHi)), i64x2.le_s(a, b)))
    return false;
  if (!checkV128(pair(i64x2_swar.gt_s(aLo, aHi, bLo, bHi)), i64x2.gt_s(a, b)))
    return false;
  if (!checkV128(pair(i64x2_swar.ge_s(aLo, aHi, bLo, bHi)), i64x2.ge_s(a, b)))
    return false;
  return true;
}).generate((seed: FuzzSeed, run: (words: u32[]) => bool): void => {
  run(seed.array<u32>((s: FuzzSeed): u32 => s.u32(), { min: 11, max: 11 }));
});

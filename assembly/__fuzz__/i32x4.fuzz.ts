import { expect, fuzz, FuzzSeed } from "as-test";
import { i32x2_scalar } from "../scalar/i32x2";

let checkId: i32 = 0;

// @ts-expect-error: decorator
@inline function u64At(words: u32[], index: i32): u64 {
  return (
    ((<u64>unchecked(words[index])) << 32) | (<u64>unchecked(words[index + 1]))
  );
}

// @ts-expect-error: decorator
@inline function lo64(x: v128): u64 {
  return <u64>i64x2.extract_lane(x, 0);
}
// @ts-expect-error: decorator
@inline function hi64(x: v128): u64 {
  return <u64>i64x2.extract_lane(x, 1);
}
// @ts-expect-error: decorator
@inline function v128From64(lo: u64, hi: u64): v128 {
  return i64x2(lo as i64, hi as i64);
}

// @ts-expect-error: decorator
@inline function checkV128(
  actual: v128,
  expectedLo: u64,
  expectedHi: u64,
): bool {
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

fuzz("i32x4 scalar-vs-simd parity", (words: u32[]): bool => {
  if (!ASC_FEATURE_SIMD) return true;
  const aLo = u64At(words, 0);
  const aHi = u64At(words, 2);
  const bLo = u64At(words, 4);
  const bHi = u64At(words, 6);
  const shift = <i32>(unchecked(words[8]) & 31);
  const laneVal = <i32>unchecked(words[9]);
  const a = v128From64(aLo, aHi);
  const b = v128From64(bLo, bHi);

  checkId = 1;

  if (
    !checkV128(
      i32x4.splat(laneVal),
      i32x2_scalar.splat(laneVal),
      i32x2_scalar.splat(laneVal),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.add(a, b),
      i32x2_scalar.add(aLo, bLo),
      i32x2_scalar.add(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.sub(a, b),
      i32x2_scalar.sub(aLo, bLo),
      i32x2_scalar.sub(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.mul(a, b),
      i32x2_scalar.mul(aLo, bLo),
      i32x2_scalar.mul(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.min_s(a, b),
      i32x2_scalar.min_s(aLo, bLo),
      i32x2_scalar.min_s(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.max_s(a, b),
      i32x2_scalar.max_s(aLo, bLo),
      i32x2_scalar.max_s(aHi, bHi),
    )
  )
    return false;
  if (!checkV128(i32x4.abs(a), i32x2_scalar.abs(aLo), i32x2_scalar.abs(aHi)))
    return false;
  if (!checkV128(i32x4.neg(a), i32x2_scalar.neg(aLo), i32x2_scalar.neg(aHi)))
    return false;
  if (
    !checkV128(
      i32x4.shl(a, shift),
      i32x2_scalar.shl(aLo, shift),
      i32x2_scalar.shl(aHi, shift),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.shr_s(a, shift),
      i32x2_scalar.shr_s(aLo, shift),
      i32x2_scalar.shr_s(aHi, shift),
    )
  )
    return false;
  if (
    !checkBool(
      i32x4.all_true(a),
      i32x2_scalar.all_true(aLo) && i32x2_scalar.all_true(aHi),
    )
  )
    return false;
  if (
    !check32(
      i32x4.bitmask(a),
      i32x2_scalar.bitmask(aLo) | (i32x2_scalar.bitmask(aHi) << 2),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.eq(a, b),
      i32x2_scalar.eq(aLo, bLo),
      i32x2_scalar.eq(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.ne(a, b),
      i32x2_scalar.ne(aLo, bLo),
      i32x2_scalar.ne(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.lt_s(a, b),
      i32x2_scalar.lt_s(aLo, bLo),
      i32x2_scalar.lt_s(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.le_s(a, b),
      i32x2_scalar.le_s(aLo, bLo),
      i32x2_scalar.le_s(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.gt_s(a, b),
      i32x2_scalar.gt_s(aLo, bLo),
      i32x2_scalar.gt_s(aHi, bHi),
    )
  )
    return false;
  if (
    !checkV128(
      i32x4.ge_s(a, b),
      i32x2_scalar.ge_s(aLo, bLo),
      i32x2_scalar.ge_s(aHi, bHi),
    )
  )
    return false;

  return true;
}).generate((seed: FuzzSeed, run: (words: u32[]) => bool): void => {
  run(seed.array<u32>((s: FuzzSeed): u32 => s.u32(), { min: 10, max: 10 }));
});

import { v64 } from "./v64";

/** Initializes a 64-bit SWAR vector from two 32-bit integer values. Arguments do not need to be compile-time constants. */
export function i32x2(a: i32, b: i32): v64 {
  return ((a as v64) & 0xffffffff) | (((b as v64) & 0xffffffff) << 32);
}

export type i32x2 = v64;

export namespace i32x2 {
  /** Creates a vector with two identical 32-bit integer lanes. */
  // @ts-expect-error: decorator
  @inline export function splat(x: i32): v64 {
    return ((x as v64) & 0xffffffff) * 0x0000000100000001;
  }
  /** Extracts one 32-bit integer lane as a scalar. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function extract_lane(x: v64, idx: u8): i32 {
    return ((x >> ((idx & 1) * 32)) & 0xffffffff) as i32;
  }
  /** Replaces one 32-bit integer lane. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v64, idx: u8, value: i32): v64 {
    const shift = (idx & 1) * 32;
    const mask = (0xffffffff as v64) << shift;
    return (x & ~mask) | (((value as v64) & 0xffffffff) << shift);
  }
  /** Loads the first `len` lanes from memory and fills remaining lanes with `fill`. */
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i32 = 0): v64 {
    const p = ptr + immOffset;
    if (len <= 0) return ((fill as v64) & 0xffffffff) * 0x0000000100000001;
    if (len >= 2) return load<v64>(p);
    return ((((fill as v64) & 0xffffffff) << 32) | ((load<u32>(p) as v64) & 0xffffffff));
  }
  /** Stores the first `len` lanes to memory. */
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    if (len <= 0) return;
    const p = ptr + immOffset;
    if (len >= 2) { store<v64>(p, value); return; }
    store<i32>(p, (value & 0xffffffff) as i32);
  }
  /** Adds each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function add(a: v64, b: v64): v64 {
    // SWAR unconditionally: the scalar<->SIMD domain crossing of an i32x4.add
    // wrap costs more than these few scalar ops for a single 64-bit value.
    return ((a & ~0x8000000080000000) + (b & ~0x8000000080000000)) ^ ((a ^ b) & 0x8000000080000000);
  }
  /** Subtracts each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function sub(a: v64, b: v64): v64 {
    // SWAR unconditionally (see `add`).
    return ((a | 0x8000000080000000) - (b & 0x7fffffff7fffffff)) ^ ((a ^ ~b) & 0x8000000080000000);
  }
  /** Multiplies each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function mul(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.mul(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    return ((((a & 0xffffffff) * (b & 0xffffffff)) & 0xffffffff) as v64)
      | ((((((a >> 32) & 0xffffffff) * ((b >> 32) & 0xffffffff)) & 0xffffffff) as v64) << 32);
  }
  /** Computes the signed minimum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.min_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as i32;
    const a1 = ((a >> 32) & 0xffffffff) as i32;
    const b0 = (b & 0xffffffff) as i32;
    const b1 = ((b >> 32) & 0xffffffff) as i32;
    return (select<u64>(a0 as u32 as u64, b0 as u32 as u64, a0 < b0))
      | (select<u64>(a1 as u32 as u64, b1 as u32 as u64, a1 < b1) << 32);
  }
  /** Computes the unsigned minimum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.min_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as u32;
    const a1 = ((a >> 32) & 0xffffffff) as u32;
    const b0 = (b & 0xffffffff) as u32;
    const b1 = ((b >> 32) & 0xffffffff) as u32;
    return (select<u64>(a0 as u64, b0 as u64, a0 < b0))
      | (select<u64>(a1 as u64, b1 as u64, a1 < b1) << 32);
  }
  /** Computes the signed maximum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.max_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as i32;
    const a1 = ((a >> 32) & 0xffffffff) as i32;
    const b0 = (b & 0xffffffff) as i32;
    const b1 = ((b >> 32) & 0xffffffff) as i32;
    return (select<u64>(b0 as u32 as u64, a0 as u32 as u64, a0 < b0))
      | (select<u64>(b1 as u32 as u64, a1 as u32 as u64, a1 < b1) << 32);
  }
  /** Computes the unsigned maximum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.max_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as u32;
    const a1 = ((a >> 32) & 0xffffffff) as u32;
    const b0 = (b & 0xffffffff) as u32;
    const b1 = ((b >> 32) & 0xffffffff) as u32;
    return (select<u64>(b0 as u64, a0 as u64, a0 < b0))
      | (select<u64>(b1 as u64, a1 as u64, a1 < b1) << 32);
  }
  /** Computes the dot product of two 16-bit integer lanes each, yielding 32-bit integer lanes. */
  // @ts-expect-error: decorator
  @inline export function dot_i16x4_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.dot_i16x8_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = ((a << 48) as i64 >> 48) as i32;
    const a1 = ((a << 32) as i64 >> 48) as i32;
    const a2 = ((a << 16) as i64 >> 48) as i32;
    const a3 = (a as i64 >> 48) as i32;
    const b0 = ((b << 48) as i64 >> 48) as i32;
    const b1 = ((b << 32) as i64 >> 48) as i32;
    const b2 = ((b << 16) as i64 >> 48) as i32;
    const b3 = (b as i64 >> 48) as i32;
    return ((a0 * b0 + a1 * b1) as u32 as v64) | (((a2 * b2 + a3 * b3) as u32 as v64) << 32);
  }
  /** Computes the absolute value of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function abs(a: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.abs(i64x2(a as i64, 0)), 0) as v64;
    }
    const mask = ((a & 0x8000000080000000) >> 31) * 0xffffffff;
    const x = a ^ mask;
    return ((x | 0x8000000080000000) - (mask & 0x7fffffff7fffffff)) ^ ((x ^ ~mask) & 0x8000000080000000);
  }
  /** Negates each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function neg(a: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.neg(i64x2(a as i64, 0)), 0) as v64;
    }
    return (0x8000000080000000 - (a & 0x7fffffff7fffffff)) ^ ((~a) & 0x8000000080000000);
  }
  /** Performs a bitwise left shift on each 32-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shl(a: v64, b: i32): v64 {
    const shift = b & 31;
    if (shift == 0) return a;
    return ((a & (((0xffffffff >>> shift) as v64) * 0x0000000100000001)) << shift) & 0xffffffffffffffff;
  }
  /** Performs a bitwise arithmetic right shift on each 32-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v64, b: i32): v64 {
    const shift = b & 31;
    if (shift == 0) return a;
    const keep = ((0xffffffff >>> shift) as v64) * 0x0000000100000001;
    const logical = (a >> shift) & keep;
    return logical | ((((a & 0x8000000080000000) >> 31) * 0xffffffff) & ~keep);
  }
  /** Performs a bitwise logical right shift on each 32-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v64, b: i32): v64 {
    const shift = b & 31;
    if (shift == 0) return a;
    return (a & (((0xffffffff << shift) as v64) * 0x0000000100000001)) >> shift;
  }
  /** Reduces a vector to a scalar indicating whether all 32-bit integer lanes are considered `true`. */
  // @ts-expect-error: decorator
  @inline export function all_true(a: v64): bool {
    return ((a - 0x0000000100000001) & ~a & 0x8000000080000000) == 0;
  }
  /** Reduces a vector to a scalar indicating whether any 32-bit integer lane is considered `true`. */
  // @ts-expect-error: decorator
  @inline export function any_true(a: v64): bool {
    if (ASC_FEATURE_SIMD) {
      return v128.any_true(i64x2(a as i64, 0));
    }
    return a != 0;
  }
  /** Extracts the high bit of each 32-bit integer lane and produces a scalar mask with all bits concatenated. */
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v64): i32 {
    if (ASC_FEATURE_SIMD) {
      return i32x4.bitmask(i64x2(a as i64, 0));
    }
    return ((((a >> 31) & 1) as i32) | ((((a >> 63) & 1) as i32) << 1));
  }
  /** Computes which 32-bit integer lanes are equal. */
  // @ts-expect-error: decorator
  @inline export function eq(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.eq(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const x = a ^ b;
    const mask = (((x & 0x7fffffff7fffffff) + 0x7fffffff7fffffff) | x) & 0x8000000080000000;
    return ~((mask >> 31) * 0xffffffff);
  }
  /** Computes which 32-bit integer lanes are not equal. */
  // @ts-expect-error: decorator
  @inline export function ne(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.ne(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const x = a ^ b;
    return (((((x & 0x7fffffff7fffffff) + 0x7fffffff7fffffff) | x) & 0x8000000080000000) >> 31) * 0xffffffff;
  }
  /** Computes which 32-bit signed integer lanes are less than. */
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.lt_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as i32;
    const a1 = ((a >> 32) & 0xffffffff) as i32;
    const b0 = (b & 0xffffffff) as i32;
    const b1 = ((b >> 32) & 0xffffffff) as i32;
    return (select<v64>(0xffffffff, 0, a0 < b0)) | (select<v64>(0xffffffff, 0, a1 < b1) << 32);
  }
  /** Computes which 32-bit unsigned integer lanes are less than. */
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.lt_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const d = ((a | 0x8000000080000000) - (b & 0x7fffffff7fffffff)) ^ ((a ^ ~b) & 0x8000000080000000);
    return ((((~a & b) | (~(a ^ b) & d)) & 0x8000000080000000) >> 31) * 0xffffffff;
  }
  /** Computes which 32-bit signed integer lanes are less than or equal. */
  // @ts-expect-error: decorator
  @inline export function le_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.le_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as i32;
    const a1 = ((a >> 32) & 0xffffffff) as i32;
    const b0 = (b & 0xffffffff) as i32;
    const b1 = ((b >> 32) & 0xffffffff) as i32;
    return (select<v64>(0xffffffff, 0, a0 <= b0)) | (select<v64>(0xffffffff, 0, a1 <= b1) << 32);
  }
  /** Computes which 32-bit unsigned integer lanes are less than or equal. */
  // @ts-expect-error: decorator
  @inline export function le_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.le_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as u32;
    const a1 = ((a >> 32) & 0xffffffff) as u32;
    const b0 = (b & 0xffffffff) as u32;
    const b1 = ((b >> 32) & 0xffffffff) as u32;
    return (select<v64>(0xffffffff, 0, a0 <= b0)) | (select<v64>(0xffffffff, 0, a1 <= b1) << 32);
  }
  /** Computes which 32-bit signed integer lanes are greater than. */
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.gt_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as i32;
    const a1 = ((a >> 32) & 0xffffffff) as i32;
    const b0 = (b & 0xffffffff) as i32;
    const b1 = ((b >> 32) & 0xffffffff) as i32;
    return (select<v64>(0xffffffff, 0, a0 > b0)) | (select<v64>(0xffffffff, 0, a1 > b1) << 32);
  }
  /** Computes which 32-bit unsigned integer lanes are greater than. */
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.gt_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as u32;
    const a1 = ((a >> 32) & 0xffffffff) as u32;
    const b0 = (b & 0xffffffff) as u32;
    const b1 = ((b >> 32) & 0xffffffff) as u32;
    return (select<v64>(0xffffffff, 0, a0 > b0)) | (select<v64>(0xffffffff, 0, a1 > b1) << 32);
  }
  /** Computes which 32-bit signed integer lanes are greater than or equal. */
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.ge_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as i32;
    const a1 = ((a >> 32) & 0xffffffff) as i32;
    const b0 = (b & 0xffffffff) as i32;
    const b1 = ((b >> 32) & 0xffffffff) as i32;
    return (select<v64>(0xffffffff, 0, a0 >= b0)) | (select<v64>(0xffffffff, 0, a1 >= b1) << 32);
  }
  /** Computes which 32-bit unsigned integer lanes are greater than or equal. */
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i32x4.ge_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const a0 = (a & 0xffffffff) as u32;
    const a1 = ((a >> 32) & 0xffffffff) as u32;
    const b0 = (b & 0xffffffff) as u32;
    const b1 = ((b >> 32) & 0xffffffff) as u32;
    return (select<v64>(0xffffffff, 0, a0 >= b0)) | (select<v64>(0xffffffff, 0, a1 >= b1) << 32);
  }
  /** Extends the low 16-bit signed integer lanes to 32-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_low_i16x4_s(a: v64): v64 {
    const a0 = ((a >> 0) & 0xffff) as i16 as i32;
    const a1 = ((a >> 16) & 0xffff) as i16 as i32;
    return (a0 as u32 as v64) | ((a1 as u32 as v64) << 32);
  }
  /** Extends the low 16-bit unsigned integer lanes to 32-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_low_i16x4_u(a: v64): v64 {
    return ((((a >> 0) & 0xffff) as v64) | ((((a >> 16) & 0xffff) as v64) << 32));
  }
  /** Extends the high 16-bit signed integer lanes to 32-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_high_i16x4_s(a: v64): v64 {
    const a0 = ((a >> 32) & 0xffff) as i16 as i32;
    const a1 = ((a >> 48) & 0xffff) as i16 as i32;
    return (a0 as u32 as v64) | ((a1 as u32 as v64) << 32);
  }
  /** Extends the high 16-bit unsigned integer lanes to 32-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_high_i16x4_u(a: v64): v64 {
    return ((((a >> 32) & 0xffff) as v64) | ((((a >> 48) & 0xffff) as v64) << 32));
  }
  /** Adds pairwise 16-bit signed lanes producing 32-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i16x4_s(a: v64): v64 {
    const a0 = ((a >> 0) & 0xffff) as i16;
    const a1 = ((a >> 16) & 0xffff) as i16;
    const a2 = ((a >> 32) & 0xffff) as i16;
    const a3 = ((a >> 48) & 0xffff) as i16;
    return ((a0 + a1) as u32 as v64) | (((a2 + a3) as u32 as v64) << 32);
  }
  /** Adds pairwise 16-bit unsigned lanes producing 32-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i16x4_u(a: v64): v64 {
    const a0 = ((a >> 0) & 0xffff) as u16;
    const a1 = ((a >> 16) & 0xffff) as u16;
    const a2 = ((a >> 32) & 0xffff) as u16;
    const a3 = ((a >> 48) & 0xffff) as u16;
    return ((a0 + a1) as u32 as v64) | (((a2 + a3) as u32 as v64) << 32);
  }
  /** Performs lane-wise signed extended multiplication of low 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_low_i16x4_s(a: v64, b: v64): v64 {
    const a0 = ((a >> 0) & 0xffff) as i16;
    const a1 = ((a >> 16) & 0xffff) as i16;
    const b0 = ((b >> 0) & 0xffff) as i16;
    const b1 = ((b >> 16) & 0xffff) as i16;
    return ((a0 * b0) as u32 as v64) | (((a1 * b1) as u32 as v64) << 32);
  }
  /** Performs lane-wise unsigned extended multiplication of low 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_low_i16x4_u(a: v64, b: v64): v64 {
    const a0 = ((a >> 0) & 0xffff) as u16;
    const a1 = ((a >> 16) & 0xffff) as u16;
    const b0 = ((b >> 0) & 0xffff) as u16;
    const b1 = ((b >> 16) & 0xffff) as u16;
    return ((a0 * b0) as u32 as v64) | (((a1 * b1) as u32 as v64) << 32);
  }
  /** Performs lane-wise signed extended multiplication of high 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_high_i16x4_s(a: v64, b: v64): v64 {
    const a0 = ((a >> 32) & 0xffff) as i16;
    const a1 = ((a >> 48) & 0xffff) as i16;
    const b0 = ((b >> 32) & 0xffff) as i16;
    const b1 = ((b >> 48) & 0xffff) as i16;
    return ((a0 * b0) as u32 as v64) | (((a1 * b1) as u32 as v64) << 32);
  }
  /** Performs lane-wise unsigned extended multiplication of high 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_high_i16x4_u(a: v64, b: v64): v64 {
    const a0 = ((a >> 32) & 0xffff) as u16;
    const a1 = ((a >> 48) & 0xffff) as u16;
    const b0 = ((b >> 32) & 0xffff) as u16;
    const b1 = ((b >> 48) & 0xffff) as u16;
    return ((a0 * b0) as u32 as v64) | (((a1 * b1) as u32 as v64) << 32);
  }
  /** Selects 32-bit lanes from either vector according to lane indexes [0-3]. */
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v64, b: v64, l0: u8, l1: u8): v64 {
    const i0 = (l0 & 1) * 32;
    const i1 = (l1 & 1) * 32;
    const x0 = (((select<v64>(a, b, l0 < 2) >> i0) & 0xffffffff) as u32) as v64;
    const x1 = (((select<v64>(a, b, l1 < 2) >> i1) & 0xffffffff) as u32) as v64;
    return x0 | (x1 << 32);
  }
  /** Selects 32-bit lanes from `a` or `b` based on the high bit of each lane in `m`. */
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v64, b: v64, m: v64): v64 {
    const laneMask = (((m & 0x8000000080000000) >> 31) * 0xffffffff) as v64;
    return b ^ ((a ^ b) & laneMask);
  }
}

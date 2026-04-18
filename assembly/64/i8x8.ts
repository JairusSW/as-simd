import { v64 } from "..";

/** Initializes a 64-bit SWAR vector from eight 8-bit integer values. Arguments do not need to be compile-time constants. */
export function i8x8(a: i8, b: i8, c: i8, d: i8, e: i8, f: i8, g: i8, h: i8): v64 {
  return (
    ((a as v64) & 0xff) |
    (((b as v64) & 0xff) << 8) |
    (((c as v64) & 0xff) << 16) |
    (((d as v64) & 0xff) << 24) |
    (((e as v64) & 0xff) << 32) |
    (((f as v64) & 0xff) << 40) |
    (((g as v64) & 0xff) << 48) |
    (((h as v64) & 0xff) << 56)
  );
}

export type i8x8 = v64;

export namespace i8x8 {
  // @ts-expect-error: decorator
  @inline function zero_mask(x: v64): v64 {
    return ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
  }

  // @ts-expect-error: decorator
  @inline function lt_mask_u(a: v64, b: v64): v64 {
    const d = sub(a, b);
    return ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }

  // @ts-expect-error: decorator
  @inline function lt_mask_s(a: v64, b: v64): v64 {
    return lt_mask_u(a ^ 0x8080808080808080, b ^ 0x8080808080808080);
  }

  // @ts-expect-error: decorator
  @inline function pack_low_bytes(x: v64): v64 {
    x &= 0x00ff00ff00ff00ff;
    x = (x | (x >> 8)) & 0x0000ffff0000ffff;
    return (x | (x >> 16)) & 0x00000000ffffffff;
  }

  // @ts-expect-error: decorator
  @inline function sat_i16_to_i8_s(x: i16): i8 {
    return x > 127 ? 127 : (x < -128 ? -128 : x as i8);
  }

  // @ts-expect-error: decorator
  @inline function sat_i16_to_i8_u(x: i16): u8 {
    return x < 0 ? 0 : (x > 255 ? 255 : x as u8);
  }

  /** Creates a SWAR vector with eight identical 8-bit integer lanes */
  // @ts-expect-error: decorator
  @inline export function splat(x: i8): v64 {
    return ((x as v64) & 0xff) * 0x0101010101010101;
  }
  /** Extracts one 8-bit integer lane as a signed scalar. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(x: v64, idx: u8): i8 {
    return ((x >> (idx * 8)) & 0xff) as i8;
  }
  /** Extracts one 8-but integer lane. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: v64, idx: u8): u8 {
    return ((x >> (idx * 8)) & 0xff) as u8;
  }
  /** Replaces one 8-bit integer lane. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v64, idx: u8, value: i8): v64 {
    const shift = idx * 8;
    const mask = (0xff as v64) << shift;
    return (x & ~mask) | (((value as v64) & 0xff) << shift);
  }
  /** Adds each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function add(a: v64, b: v64): v64 {
    return ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
  }
  /** Subtracts each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function sub(a: v64, b: v64): v64 {
    return ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
  }
  /** Multiplies each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function mul(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      const product = i16x8.extmul_low_i8x16_u(i64x2(a as i64, 0), i64x2(b as i64, 0));
      return pack_low_bytes(i64x2.extract_lane(product, 0) as v64) | (pack_low_bytes(i64x2.extract_lane(product, 1) as v64) << 32);
    }

    return (
      ((((a >> 0) & 0xff) * ((b >> 0) & 0xff)) & 0xff) |
      (((((a >> 8) & 0xff) * ((b >> 8) & 0xff)) & 0xff) << 8) |
      (((((a >> 16) & 0xff) * ((b >> 16) & 0xff)) & 0xff) << 16) |
      (((((a >> 24) & 0xff) * ((b >> 24) & 0xff)) & 0xff) << 24) |
      (((((a >> 32) & 0xff) * ((b >> 32) & 0xff)) & 0xff) << 32) |
      (((((a >> 40) & 0xff) * ((b >> 40) & 0xff)) & 0xff) << 40) |
      (((((a >> 48) & 0xff) * ((b >> 48) & 0xff)) & 0xff) << 48) |
      (((((a >> 56) & 0xff) * ((b >> 56) & 0xff)) & 0xff) << 56)
    );
  }
  /** Computes the signed minimum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_s(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.min_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const mask = lt_mask_s(a, b);
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned minimum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_u(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.min_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const mask = lt_mask_u(a, b);
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the signed maximum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_s(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.max_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const mask = lt_mask_s(a, b);
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned maxmum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_u(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.max_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const mask = lt_mask_u(a, b);
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned average of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function avgr_u(a: v64, b: v64): v64 {
    return (a | b) - (((a ^ b) & ~0x0101010101010101) >> 1);
  }
  /** Computes the absolute value of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function abs(a: v64): v64 {
    const mask = ((a & 0x8080808080808080) >> 7) * 0xff;
    return sub(a ^ mask, mask);
  }

  /** Negates each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function neg(a: v64): v64 {
    return sub(0, a);
  }
  /** Adds each 8-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v64, b: v64): v64 {
    const sum = add(a, b);
    const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
    const mask = overflow * 0xff;
    const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return (sum & ~mask) | (limit & mask);
  }
  /** Adds each 8-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v64, b: v64): v64 {
    const sum = add(a, b);
    return sum | lt_mask_u(sum, a);
  }
  /** Subtracts each 8-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v64, b: v64): v64 {
    const diff = sub(a, b);
    const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7;
    const mask = overflow * 0xff;
    const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return (diff & ~mask) | (limit & mask);
  }
  /** Subtracts each 8-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v64, b: v64): v64 {
    return sub(a, b) & ~lt_mask_u(a, b);
  }
  /** Performs a bitwise left shift on each 8-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shl(a: v64, b: i32): v64 {
    const shift = b & 7;
    return ((a & (((0xff >> shift) as v64) * 0x0101010101010101)) << shift) & 0xffffffffffffffff;
  }
  /** Performs a bitwise arithmetic right shift on each 8-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v64, b: i32): v64 {
    const shift = b & 7;
    if (shift == 0) return a;
    const fill = (((0xff << (8 - shift)) & 0xff) as v64) * 0x0101010101010101;
    return shr_u(a, shift) | ((((a & 0x8080808080808080) >> 7) * 0xff) & fill);
  }
  /** Performs a bitwise logical right shift on each 8-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v64, b: i32): v64 {
    const shift = b & 7;
    return (a & ((((0xff << shift) & 0xff) as v64) * 0x0101010101010101)) >> shift;
  }
  /** Reduces a vector to a scalar indicating whether all 8-bit integer lanes are considered `true`. */
  // @ts-expect-error: decorator
  @inline export function all_true(a: v64): bool {
    return zero_mask(a) == 0;
  }
  /** Extracts the high bit of each 8-bit integer lane and produces a scalar mask with all bits concatenated. */
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v64): i32 {
    return (((a & 0x8080808080808080) * 0x02040810204081) >> 56) as i32;
  }
  /** Counts the number of bits set to one within each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function popcnt(x: v64): v64 {
    x = x - ((x >> 1) & 0x5555555555555555);
    x = (x & 0x3333333333333333) + ((x >> 2) & 0x3333333333333333);
    return (x + (x >> 4)) & 0x0f0f0f0f0f0f0f0f;
  }
  /** Computes which 8-bit integer lanes are equal. */
  // @ts-expect-error: decorator
  @inline export function eq(a: v64, b: v64): v64 {
    return zero_mask(a ^ b);
  }
  /** Computes which 8-bit integer lanes are not equal. */
  // @ts-expect-error: decorator
  @inline export function ne(a: v64, b: v64): v64 {
    return ~eq(a, b);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v64, b: v64): v64 {
    return lt_mask_s(a, b);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v64, b: v64): v64 {
    return lt_mask_u(a, b);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_s(a: v64, b: v64): v64 {
    return ~lt_mask_s(b, a);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_u(a: v64, b: v64): v64 {
    return ~lt_mask_u(b, a);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v64, b: v64): v64 {
    return lt_mask_s(b, a);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v64, b: v64): v64 {
    return lt_mask_u(b, a);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v64, b: v64): v64 {
    return ~lt_mask_s(a, b);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v64, b: v64): v64 {
    return ~lt_mask_u(a, b);
  }

  /** Narrows each 16-bit signed integer lane to 8-bit signed integer lanes with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow_i16x4_s(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.narrow_i16x8_s(i64x2(a as i64, b as i64), i64x2(0, 0)), 0) as v64;
    }

    const a0 = sat_i16_to_i8_s(a as i16) as v64;
    const a1 = sat_i16_to_i8_s((a >> 16) as i16) as v64;
    const a2 = sat_i16_to_i8_s((a >> 32) as i16) as v64;
    const a3 = sat_i16_to_i8_s((a >> 48) as i16) as v64;
    const b0 = sat_i16_to_i8_s(b as i16) as v64;
    const b1 = sat_i16_to_i8_s((b >> 16) as i16) as v64;
    const b2 = sat_i16_to_i8_s((b >> 32) as i16) as v64;
    const b3 = sat_i16_to_i8_s((b >> 48) as i16) as v64;

    return (a0 & 0xff) | ((a1 & 0xff) << 8) | ((a2 & 0xff) << 16) | ((a3 & 0xff) << 24) |
           ((b0 & 0xff) << 32) | ((b1 & 0xff) << 40) | ((b2 & 0xff) << 48) | ((b3 & 0xff) << 56);
  }
  /** Narrows each 16-bit signed integer lane to 8-bit unsigned integer lanes with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow_i16x4_u(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.narrow_i16x8_u(i64x2(a as i64, b as i64), i64x2(0, 0)), 0) as v64;
    }

    const a0 = sat_i16_to_i8_u(a as i16) as v64;
    const a1 = sat_i16_to_i8_u((a >> 16) as i16) as v64;
    const a2 = sat_i16_to_i8_u((a >> 32) as i16) as v64;
    const a3 = sat_i16_to_i8_u((a >> 48) as i16) as v64;
    const b0 = sat_i16_to_i8_u(b as i16) as v64;
    const b1 = sat_i16_to_i8_u((b >> 16) as i16) as v64;
    const b2 = sat_i16_to_i8_u((b >> 32) as i16) as v64;
    const b3 = sat_i16_to_i8_u((b >> 48) as i16) as v64;

    return (a0 & 0xff) | ((a1 & 0xff) << 8) | ((a2 & 0xff) << 16) | ((a3 & 0xff) << 24) |
           ((b0 & 0xff) << 32) | ((b1 & 0xff) << 40) | ((b2 & 0xff) << 48) | ((b3 & 0xff) << 56);
  }
  /** Selects 8-bit lanes from either vector according to lane indexes [0-15]. */
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v64, b: v64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): v64 {
    return i8x8(
      extract_lane_s(l0 < 8 ? a : b, l0 & 7),
      extract_lane_s(l1 < 8 ? a : b, l1 & 7),
      extract_lane_s(l2 < 8 ? a : b, l2 & 7),
      extract_lane_s(l3 < 8 ? a : b, l3 & 7),
      extract_lane_s(l4 < 8 ? a : b, l4 & 7),
      extract_lane_s(l5 < 8 ? a : b, l5 & 7),
      extract_lane_s(l6 < 8 ? a : b, l6 & 7),
      extract_lane_s(l7 < 8 ? a : b, l7 & 7),
    );
  }
  /** Selects 8-bit lanes from `a` according to indices in `s` with out-of-bounds lanes set to zero. */
  // @ts-expect-error: decorator
  @inline export function swizzle(a: v64, s: v64): v64 {
    const i0 = extract_lane_u(s, 0);
    const i1 = extract_lane_u(s, 1);
    const i2 = extract_lane_u(s, 2);
    const i3 = extract_lane_u(s, 3);
    const i4 = extract_lane_u(s, 4);
    const i5 = extract_lane_u(s, 5);
    const i6 = extract_lane_u(s, 6);
    const i7 = extract_lane_u(s, 7);
    return i8x8(
      i0 < 8 ? extract_lane_s(a, i0) : 0,
      i1 < 8 ? extract_lane_s(a, i1) : 0,
      i2 < 8 ? extract_lane_s(a, i2) : 0,
      i3 < 8 ? extract_lane_s(a, i3) : 0,
      i4 < 8 ? extract_lane_s(a, i4) : 0,
      i5 < 8 ? extract_lane_s(a, i5) : 0,
      i6 < 8 ? extract_lane_s(a, i6) : 0,
      i7 < 8 ? extract_lane_s(a, i7) : 0,
    );
  }
  /** Selects 8-bit lanes from `a` according to indices in `s`, mapping out-of-bounds lanes via modulo. */
  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(a: v64, s: v64): v64 {
    return i8x8(
      extract_lane_s(a, extract_lane_u(s, 0) & 7),
      extract_lane_s(a, extract_lane_u(s, 1) & 7),
      extract_lane_s(a, extract_lane_u(s, 2) & 7),
      extract_lane_s(a, extract_lane_u(s, 3) & 7),
      extract_lane_s(a, extract_lane_u(s, 4) & 7),
      extract_lane_s(a, extract_lane_u(s, 5) & 7),
      extract_lane_s(a, extract_lane_u(s, 6) & 7),
      extract_lane_s(a, extract_lane_u(s, 7) & 7),
    );
  }
  /** Selects 8-bit lanes from `a` or `b` based on the high bit of each lane in `m`. */
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v64, b: v64, m: v64): v64 {
    return (a & (((m & 0x8080808080808080) >> 7) * 0xff)) | (b & ~(((m & 0x8080808080808080) >> 7) * 0xff));
  }

}

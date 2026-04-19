import { v64 } from ".";

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
  let sat_coverage_warmed: bool = false;
  const simd_shuffle_tmp = memory.data(16);

  // @ts-expect-error: decorator
  @inline function zero_mask(x: v64): v64 {
    return ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
  }

  // @ts-expect-error: decorator
  @inline function add_swar(a: v64, b: v64): v64 {
    return ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
  }

  // @ts-expect-error: decorator
  @inline function sub_swar(a: v64, b: v64): v64 {
    return ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
  }

  // @ts-expect-error: decorator
  @inline function add_swar16(a: v64, b: v64): v64 {
    return ((a & ~0x8000800080008000) + (b & ~0x8000800080008000)) ^ ((a ^ b) & 0x8000800080008000);
  }

  // @ts-expect-error: decorator
  @inline function lt_mask_u(a: v64, b: v64): v64 {
    const d = sub_swar(a, b);
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
  @inline function narrow_i16x4_u_swar(x: v64): v64 {
    const hi = (x >> 8) & 0x00ff00ff00ff00ff;
    const hiNonZero = (~(((~(((hi & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~hi & 0x8080808080808080) >> 7) * 0xff)) & 0x00ff00ff00ff00ff;
    const sign = (((x & 0x8000800080008000) >> 15) * 0xff) & 0x00ff00ff00ff00ff;
    return (((x & 0x00ff00ff00ff00ff) & ~hiNonZero) | hiNonZero) & ~sign;
  }

  // @ts-expect-error: decorator
  @inline function narrow_i16x4_s_swar(x: v64): v64 {
    const shifted = ((x & ~0x8000800080008000) + 0x0080008000800080) ^ ((x ^ 0x0080008000800080) & 0x8000800080008000);
    const top = (shifted >> 8) & 0x00ff00ff00ff00ff;
    const inRange = ((~(((top & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~top & 0x8080808080808080) >> 7) * 0xff & 0x00ff00ff00ff00ff;
    const xlow = x & 0x00ff00ff00ff00ff;
    const sign = (x & 0x8000800080008000) >> 15;
    const sat = (0x007f007f007f007f + sign) & 0x00ff00ff00ff00ff;
    return (xlow & inRange) | (sat & ~inRange);
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
      let lo = (i64x2.extract_lane(product, 0) as v64) & 0x00ff00ff00ff00ff;
      let hi = (i64x2.extract_lane(product, 1) as v64) & 0x00ff00ff00ff00ff;
      lo = (lo | (lo >> 8)) & 0x0000ffff0000ffff;
      hi = (hi | (hi >> 8)) & 0x0000ffff0000ffff;
      lo = (lo | (lo >> 16)) & 0x00000000ffffffff;
      hi = (hi | (hi >> 16)) & 0x00000000ffffffff;
      return lo | (hi << 32);
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
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const d = ((ax | 0x8080808080808080) - (bx & ~0x8080808080808080)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    const mask = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned minimum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
    const mask = ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the signed maximum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_s(a: v64, b: v64): v64 {
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const d = ((ax | 0x8080808080808080) - (bx & ~0x8080808080808080)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    const mask = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned maxmum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
    const mask = ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
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
    const x = a ^ mask;
    return ((x | 0x8080808080808080) - (mask & ~0x8080808080808080)) ^ ((x ^ ~mask) & 0x8080808080808080);
  }

  /** Negates each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function neg(a: v64): v64 {
    return (0x8080808080808080 - (a & ~0x8080808080808080)) ^ ((~a) & 0x8080808080808080);
  }
  /** Adds each 8-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v64, b: v64): v64 {
    const sum = ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
    const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
    const mask = overflow * 0xff;
    const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return (sum & ~mask) | (limit & mask);
  }
  /** Adds each 8-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v64, b: v64): v64 {
    const sum = ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
    const d = ((sum | 0x8080808080808080) - (a & ~0x8080808080808080)) ^ ((sum ^ ~a) & 0x8080808080808080);
    const mask = ((((~sum & a) | (~(sum ^ a) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return sum | mask;
  }
  /** Subtracts each 8-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v64, b: v64): v64 {
    const diff = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
    const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7;
    const mask = overflow * 0xff;
    const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return (diff & ~mask) | (limit & mask);
  }
  /** Subtracts each 8-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v64, b: v64): v64 {
    const diff = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
    const mask = ((((~a & b) | (~(a ^ b) & diff)) & 0x8080808080808080) >> 7) * 0xff;
    return diff & ~mask;
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
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.shr_s(i64x2(a as i64, 0), b), 0) as v64;
    }
    const shift = b & 7;
    if (shift == 0) return a;
    const keep = (((0xff >> shift) & 0xff) as v64) * 0x0101010101010101;
    const logical = (a >> shift) & keep;
    return logical | ((((a & 0x8080808080808080) >> 7) * 0xff) & ~keep);
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
    const z = ((~(((a & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~a & 0x8080808080808080) >> 7) * 0xff;
    return z == 0;
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
    const x = a ^ b;
    return ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit integer lanes are not equal. */
  // @ts-expect-error: decorator
  @inline export function ne(a: v64, b: v64): v64 {
    const x = a ^ b;
    return ~(((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v64, b: v64): v64 {
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const d = ((ax | 0x8080808080808080) - (bx & ~0x8080808080808080)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    return ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
    return ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit signed integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_s(a: v64, b: v64): v64 {
    const bx = b ^ 0x8080808080808080;
    const ax = a ^ 0x8080808080808080;
    const d = ((bx | 0x8080808080808080) - (ax & ~0x8080808080808080)) ^ ((bx ^ ~ax) & 0x8080808080808080);
    return ~(((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_u(a: v64, b: v64): v64 {
    const d = ((b | 0x8080808080808080) - (a & ~0x8080808080808080)) ^ ((b ^ ~a) & 0x8080808080808080);
    return ~(((((~b & a) | (~(b ^ a) & d)) & 0x8080808080808080) >> 7) * 0xff);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v64, b: v64): v64 {
    const bx = b ^ 0x8080808080808080;
    const ax = a ^ 0x8080808080808080;
    const d = ((bx | 0x8080808080808080) - (ax & ~0x8080808080808080)) ^ ((bx ^ ~ax) & 0x8080808080808080);
    return ((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v64, b: v64): v64 {
    const d = ((b | 0x8080808080808080) - (a & ~0x8080808080808080)) ^ ((b ^ ~a) & 0x8080808080808080);
    return ((((~b & a) | (~(b ^ a) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit signed integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v64, b: v64): v64 {
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const d = ((ax | 0x8080808080808080) - (bx & ~0x8080808080808080)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    return ~(((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
    return ~(((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff);
  }

  /** Narrows each 16-bit signed integer lane to 8-bit signed integer lanes with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow_i16x4_s(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.narrow_i16x8_s(i64x2(a as i64, b as i64), i64x2(0, 0)), 0) as v64;
    }
    return pack_low_bytes(narrow_i16x4_s_swar(a)) | (pack_low_bytes(narrow_i16x4_s_swar(b)) << 32);
  }
  /** Narrows each 16-bit signed integer lane to 8-bit unsigned integer lanes with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow_i16x4_u(a: v64, b: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.narrow_i16x8_u(i64x2(a as i64, b as i64), i64x2(0, 0)), 0) as v64;
    }
    return pack_low_bytes(narrow_i16x4_u_swar(a)) | (pack_low_bytes(narrow_i16x4_u_swar(b)) << 32);
  }
  /** Selects 8-bit lanes from either vector according to lane indexes [0-15]. */
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v64, b: v64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      store<u8>(simd_shuffle_tmp, l0,0);
      store<u8>(simd_shuffle_tmp, l1,1);
      store<u8>(simd_shuffle_tmp, l2,2);
      store<u8>(simd_shuffle_tmp, l3,3);
      store<u8>(simd_shuffle_tmp, l4,4);
      store<u8>(simd_shuffle_tmp, l5,5);
      store<u8>(simd_shuffle_tmp, l6,6);
      store<u8>(simd_shuffle_tmp, l7,7);
      store<u64>(simd_shuffle_tmp, 0x8080808080808080,8);
      return i64x2.extract_lane(i8x16.swizzle(i64x2(a as i64, b as i64), load<v128>(simd_shuffle_tmp)), 0) as v64;
    }

    const i0 = (l0 & 7) as v64, i1 = (l1 & 7) as v64, i2 = (l2 & 7) as v64, i3 = (l3 & 7) as v64;
    const i4 = (l4 & 7) as v64, i5 = (l5 & 7) as v64, i6 = (l6 & 7) as v64, i7 = (l7 & 7) as v64;
    const s0 = select<v64>(a, b, l0 < 8);
    const s1 = select<v64>(a, b, l1 < 8);
    const s2 = select<v64>(a, b, l2 < 8);
    const s3 = select<v64>(a, b, l3 < 8);
    const s4 = select<v64>(a, b, l4 < 8);
    const s5 = select<v64>(a, b, l5 < 8);
    const s6 = select<v64>(a, b, l6 < 8);
    const s7 = select<v64>(a, b, l7 < 8);
    return (
      ((s0 >> (i0 << 3)) & 0xff) |
      (((s1 >> (i1 << 3)) & 0xff) << 8) |
      (((s2 >> (i2 << 3)) & 0xff) << 16) |
      (((s3 >> (i3 << 3)) & 0xff) << 24) |
      (((s4 >> (i4 << 3)) & 0xff) << 32) |
      (((s5 >> (i5 << 3)) & 0xff) << 40) |
      (((s6 >> (i6 << 3)) & 0xff) << 48) |
      (((s7 >> (i7 << 3)) & 0xff) << 56)
    );
  }
  /** Selects 8-bit lanes from `a` according to indices in `s` with out-of-bounds lanes set to zero. */
  // @ts-expect-error: decorator
  @inline export function swizzle(a: v64, s: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.swizzle(i64x2(a as i64, 0), i64x2(s as i64, 0)), 0) as v64;
    }
    const x = s & 0xf8f8f8f8f8f8f8f8;
    const valid = ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
    return relaxed_swizzle(a, s) & valid;
  }
  /** Selects 8-bit lanes from `a` according to indices in `s`, mapping out-of-bounds lanes via modulo. */
  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(a: v64, s: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.swizzle(i64x2(a as i64, 0), i64x2((s & 0x0707070707070707) as i64, 0)), 0) as v64;
    }

    const i0 = (s & 0x07) as v64;
    const i1 = ((s >> 8) & 0x07) as v64;
    const i2 = ((s >> 16) & 0x07) as v64;
    const i3 = ((s >> 24) & 0x07) as v64;
    const i4 = ((s >> 32) & 0x07) as v64;
    const i5 = ((s >> 40) & 0x07) as v64;
    const i6 = ((s >> 48) & 0x07) as v64;
    const i7 = ((s >> 56) & 0x07) as v64;

    const b0 = (a >> (i0 << 3)) & 0xff;
    const b1 = (a >> (i1 << 3)) & 0xff;
    const b2 = (a >> (i2 << 3)) & 0xff;
    const b3 = (a >> (i3 << 3)) & 0xff;
    const b4 = (a >> (i4 << 3)) & 0xff;
    const b5 = (a >> (i5 << 3)) & 0xff;
    const b6 = (a >> (i6 << 3)) & 0xff;
    const b7 = (a >> (i7 << 3)) & 0xff;

    return b0 | (b1 << 8) | (b2 << 16) | (b3 << 24) | (b4 << 32) | (b5 << 40) | (b6 << 48) | (b7 << 56);
  }
  /** Selects 8-bit lanes from `a` or `b` based on the high bit of each lane in `m`. */
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v64, b: v64, m: v64): v64 {
    if (isDefined(ASC_FEATURE_SIMD) && ASC_FEATURE_SIMD) {
      const hi = i8x16.shr_u(i64x2(m as i64, 0), 7);
      const mask = i8x16.sub(i8x16.splat(0), hi);
      return i64x2.extract_lane(v128.bitselect(i64x2(a as i64, 0), i64x2(b as i64, 0), mask), 0) as v64;
    }
    const mask = ((m & 0x8080808080808080) >> 7) * 0xff;
    return (a & mask) | (b & ~mask);
  }

}

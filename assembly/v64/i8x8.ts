import { v64 } from "./v64";

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
  const simd_shuffle_tmp = memory.data(16);

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
    return ((x >> (idx << 3)) & 0xff) as i8;
  }
  /** Extracts one 8-but integer lane. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: v64, idx: u8): u8 {
    return ((x >> (idx << 3)) & 0xff) as u8;
  }
  /** Replaces one 8-bit integer lane. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v64, idx: u8, value: i8): v64 {
    const shift = idx << 3;
    const mask = (0xff as v64) << shift;
    return (x & ~mask) | (((value as v64) & 0xff) << shift);
  }
  /** Loads the first `len` lanes from memory and fills remaining lanes with `fill`. */
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): v64 {
    if (len <= 0) return splat(fill);
    const p = ptr + immOffset;
    if (len >= 8) return load<v64>(p);
    const fv = splat(fill);
    switch (len) {
      case 1: return (fv & 0xffffffffffffff00) | (load<u8>(p) as v64);
      case 2: return (fv & 0xffffffffffff0000) | (load<u16>(p) as v64);
      case 3: return (fv & 0xffffffffff000000) | (load<u16>(p) as v64) | ((load<u8>(p, 2) as v64) << 16);
      case 4: return (fv & 0xffffffff00000000) | (load<u32>(p) as v64);
      case 5: return (fv & 0xffffff0000000000) | (load<u32>(p) as v64) | ((load<u8>(p, 4) as v64) << 32);
      case 6: return (fv & 0xffff000000000000) | (load<u32>(p) as v64) | ((load<u16>(p, 4) as v64) << 32);
      default: return (fv & 0xff00000000000000) | (load<u32>(p) as v64) | ((load<u16>(p, 4) as v64) << 32) | ((load<u8>(p, 6) as v64) << 48);
    }
  }
  /** Stores the first `len` lanes to memory. */
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    if (len <= 0) return;
    const p = ptr + immOffset;
    if (len >= 8) { store<v64>(p, value); return; }
    switch (len) {
      case 1: {
        store<u8>(p, (value & 0xff) as u8);
        return;
      }
      case 2: {
        store<u16>(p, (value & 0xffff) as u16);
        return;
      }
      case 3: {
        store<u16>(p, (value & 0xffff) as u16);
        store<u8>(p, ((value >> 16) & 0xff) as u8, 2);
        return;
      }
      case 4: {
        store<u32>(p, (value & 0xffffffff) as u32);
        return;
      }
      case 5: {
        store<u32>(p, (value & 0xffffffff) as u32);
        store<u8>(p, ((value >> 32) & 0xff) as u8, 4);
        return;
      }
      case 6: {
        store<u32>(p, (value & 0xffffffff) as u32);
        store<u16>(p, ((value >> 32) & 0xffff) as u16, 4);
        return;
      }
      default: {
        store<u32>(p, (value & 0xffffffff) as u32);
        store<u16>(p, ((value >> 32) & 0xffff) as u16, 4);
        store<u8>(p, ((value >> 48) & 0xff) as u8, 6);
        return;
      }
    }
  }
  /** Adds each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function add(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.add(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const lo = (a & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f);
    const hi = (a & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010);
    return (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0);
  }
  /** Subtracts each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function sub(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.sub(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    return add(a, add(~b, 0x0101010101010101));
  }
  /** Multiplies each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function mul(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      const product = i16x8.extmul_low_i8x16_u(i64x2(a as i64, 0), i64x2(b as i64, 0));
      let lo = (i64x2.extract_lane(product, 0) as v64) & 0x00ff00ff00ff00ff;
      let hi = (i64x2.extract_lane(product, 1) as v64) & 0x00ff00ff00ff00ff;
      lo = (lo | (lo >> 8)) & 0x0000ffff0000ffff;
      hi = (hi | (hi >> 8)) & 0x0000ffff0000ffff;
      lo = (lo | (lo >> 16)) & 0x00000000ffffffff;
      hi = (hi | (hi >> 16)) & 0x00000000ffffffff;
      return lo | (hi << 32);
    }

    const alo = a as u32;
    const blo = b as u32;
    const ahi = (a >> 32) as u32;
    const bhi = (b >> 32) as u32;
    const lo = (
      (((alo & 0xff) * (blo & 0xff)) & 0xff) |
      (((((alo >> 8) & 0xff) * ((blo >> 8) & 0xff)) & 0xff) << 8) |
      (((((alo >> 16) & 0xff) * ((blo >> 16) & 0xff)) & 0xff) << 16) |
      (((((alo >> 24) & 0xff) * ((blo >> 24) & 0xff)) & 0xff) << 24)
    );
    const hi = (
      (((ahi & 0xff) * (bhi & 0xff)) & 0xff) |
      (((((ahi >> 8) & 0xff) * ((bhi >> 8) & 0xff)) & 0xff) << 8) |
      (((((ahi >> 16) & 0xff) * ((bhi >> 16) & 0xff)) & 0xff) << 16) |
      (((((ahi >> 24) & 0xff) * ((bhi >> 24) & 0xff)) & 0xff) << 24)
    );
    return (lo as v64) | ((hi as v64) << 32);
  }
  /** Computes the signed minimum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.min_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const d = ((ax | 0x8080808080808080) - (bx & ~0x8080808080808080)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    const mask = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned minimum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.min_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080);
    const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000);
    const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7;
    const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7;
    const mask = ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the signed maximum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.max_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const d = ((ax | 0x8080808080808080) - (bx & ~0x8080808080808080)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    const mask = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned maxmum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.max_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const dlo = ((b | 0x0080008000800080) - (a & 0x007f007f007f007f)) ^ ((b ^ ~a) & 0x0080008000800080);
    const dhi = ((b | 0x8000800080008000) - (a & 0x7f007f007f007f00)) ^ ((b ^ ~a) & 0x8000800080008000);
    const ml = (((~b & a) | (~(b ^ a) & dlo)) & 0x0080008000800080) >> 7;
    const mh = (((~b & a) | (~(b ^ a) & dhi)) & 0x8000800080008000) >> 7;
    const mask = ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned average of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function avgr_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.avgr_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const alo = a as u32;
    const blo = b as u32;
    const ahi = (a >> 32) as u32;
    const bhi = (b >> 32) as u32;
    const lo = (alo | blo) - (((alo ^ blo) & 0xfefefefe) >> 1);
    const hi = (ahi | bhi) - (((ahi ^ bhi) & 0xfefefefe) >> 1);
    return (lo as v64) | ((hi as v64) << 32);
  }
  /** Computes the absolute value of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function abs(a: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.abs(i64x2(a as i64, 0)), 0) as v64;
    }
    const mask = ((a & 0x8080808080808080) >> 7) * 0xff;
    return add(a ^ mask, mask & 0x0101010101010101);
  }

  /** Negates each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function neg(a: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.neg(i64x2(a as i64, 0)), 0) as v64;
    }
    return (0x8080808080808080 - (a & ~0x8080808080808080)) ^ ((~a) & 0x8080808080808080);
  }
  /** Adds each 8-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.add_sat_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const sum = ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
    const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
    const mask = overflow * 0xff;
    const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return (sum & ~mask) | (limit & mask);
  }
  /** Adds each 8-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.add_sat_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const sum = ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
    const d = ((sum | 0x8080808080808080) - (a & ~0x8080808080808080)) ^ ((sum ^ ~a) & 0x8080808080808080);
    const mask = ((((~sum & a) | (~(sum ^ a) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return sum | mask;
  }
  /** Subtracts each 8-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.sub_sat_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const diff = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
    const overflow = ((a ^ b) & (a ^ diff) & 0x8080808080808080) >> 7;
    const mask = overflow * 0xff;
    const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return (diff & ~mask) | (limit & mask);
  }
  /** Subtracts each 8-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.sub_sat_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const diff = ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
    const mask = ((((~a & b) | (~(a ^ b) & diff)) & 0x8080808080808080) >> 7) * 0xff;
    return diff & ~mask;
  }
  /** Performs a bitwise left shift on each 8-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shl(a: v64, b: i32): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.shl(i64x2(a as i64, 0), b), 0) as v64;
    }
    const shift = b & 7;
    return (a & (((0xff >> shift) as v64) * 0x0101010101010101)) << shift;
  }
  /** Performs a bitwise arithmetic right shift on each 8-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v64, b: i32): v64 {
    if (ASC_FEATURE_SIMD) {
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
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.shr_u(i64x2(a as i64, 0), b), 0) as v64;
    }
    switch (b & 7) {
      case 0: return a;
      case 1: return (a >> 1) & 0x7f7f7f7f7f7f7f7f;
      case 2: return (a >> 2) & 0x3f3f3f3f3f3f3f3f;
      case 3: return (a >> 3) & 0x1f1f1f1f1f1f1f1f;
      case 4: return (a >> 4) & 0x0f0f0f0f0f0f0f0f;
      case 5: return (a >> 5) & 0x0707070707070707;
      case 6: return (a >> 6) & 0x0303030303030303;
      default: return (a >> 7) & 0x0101010101010101;
    }
  }
  /** Reduces a vector to a scalar indicating whether all 8-bit integer lanes are considered `true`. */
  // @ts-expect-error: decorator
  @inline export function all_true(a: v64): bool {
    return ((a - 0x0101010101010101) & ~a & 0x8080808080808080) == 0;
  }
  /** Extracts the high bit of each 8-bit integer lane and produces a scalar mask with all bits concatenated. */
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v64): i32 {
    const lo = (((((a >> 7) & 0x0000000001010101) * 0x01020408) >> 24) & 0x0f) as i32;
    const hi = (((((a >> 39) & 0x0000000001010101) * 0x01020408) >> 20) & 0xf0) as i32;
    return lo | hi;
  }
  /** Returns 0x80 in each nonzero 8-bit lane and 0 otherwise. Use ctz(bitmask(x)) << 3 for the first true lane byte offset, or ctz(bitmask_lane(x)) >> 3 for the lane index. */
  // @ts-expect-error: decorator
  @inline export function bitmask_lane(a: v64): v64 {
    return (((a & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | a) & 0x8080808080808080;
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
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.eq(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const x = a ^ b;
    return ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit integer lanes are not equal. */
  // @ts-expect-error: decorator
  @inline export function ne(a: v64, b: v64): v64 {
    const x = a ^ b;
    const mask = (((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | x) & 0x8080808080808080;
    return (mask >> 7) * 0xff;
  }
  /** Computes which 8-bit signed integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.lt_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const dlo = ((ax | 0x0080008000800080) - (bx & 0x007f007f007f007f)) ^ ((ax ^ ~bx) & 0x0080008000800080);
    const dhi = ((ax | 0x8000800080008000) - (bx & 0x7f007f007f007f00)) ^ ((ax ^ ~bx) & 0x8000800080008000);
    const ml = (((~ax & bx) | (~(ax ^ bx) & dlo)) & 0x0080008000800080) >> 7;
    const mh = (((~ax & bx) | (~(ax ^ bx) & dhi)) & 0x8000800080008000) >> 7;
    return ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.lt_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080);
    const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000);
    const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7;
    const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7;
    return ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.le_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const bx = b ^ 0x8080808080808080;
    const ax = a ^ 0x8080808080808080;
    const d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080);
    return ~(((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.le_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const dlo = ((b | 0x0080008000800080) - (a & 0x007f007f007f007f)) ^ ((b ^ ~a) & 0x0080008000800080);
    const dhi = ((b | 0x8000800080008000) - (a & 0x7f007f007f007f00)) ^ ((b ^ ~a) & 0x8000800080008000);
    const ml = (((~b & a) | (~(b ^ a) & dlo)) & 0x0080008000800080) >> 7;
    const mh = (((~b & a) | (~(b ^ a) & dhi)) & 0x8000800080008000) >> 7;
    return ~(((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00));
  }
  /** Computes which 8-bit signed integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.gt_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const bx = b ^ 0x8080808080808080;
    const ax = a ^ 0x8080808080808080;
    const d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080);
    return ((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.gt_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const dlo = ((b | 0x0080008000800080) - (a & 0x007f007f007f007f)) ^ ((b ^ ~a) & 0x0080008000800080);
    const dhi = ((b | 0x8000800080008000) - (a & 0x7f007f007f007f00)) ^ ((b ^ ~a) & 0x8000800080008000);
    const ml = (((~b & a) | (~(b ^ a) & dlo)) & 0x0080008000800080) >> 7;
    const mh = (((~b & a) | (~(b ^ a) & dhi)) & 0x8000800080008000) >> 7;
    return ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.ge_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const dlo = ((ax | 0x0080008000800080) - (bx & 0x007f007f007f007f)) ^ ((ax ^ ~bx) & 0x0080008000800080);
    const dhi = ((ax | 0x8000800080008000) - (bx & 0x7f007f007f007f00)) ^ ((ax ^ ~bx) & 0x8000800080008000);
    const ml = (((~ax & bx) | (~(ax ^ bx) & dlo)) & 0x0080008000800080) >> 7;
    const mh = (((~ax & bx) | (~(ax ^ bx) & dhi)) & 0x8000800080008000) >> 7;
    return ~(((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00));
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.ge_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080);
    const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000);
    const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7;
    const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7;
    return ~(((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00));
  }

  /** Narrows each 16-bit signed integer lane to 8-bit signed integer lanes with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow_i16x4_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.narrow_i16x8_s(i64x2(a as i64, b as i64), i64x2(0, 0)), 0) as v64;
    }
    let lo = narrow_i16x4_s_swar(a);
    let hi = narrow_i16x4_s_swar(b);
    lo = (lo | (lo >> 8)) & 0x0000ffff0000ffff;
    hi = (hi | (hi >> 8)) & 0x0000ffff0000ffff;
    lo = (lo | (lo >> 16)) & 0x00000000ffffffff;
    hi = (hi | (hi >> 16)) & 0x00000000ffffffff;
    return lo | (hi << 32);
  }
  /** Narrows each 16-bit signed integer lane to 8-bit unsigned integer lanes with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow_i16x4_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.narrow_i16x8_u(i64x2(a as i64, b as i64), i64x2(0, 0)), 0) as v64;
    }
    let lo = narrow_i16x4_u_swar(a);
    let hi = narrow_i16x4_u_swar(b);
    lo = (lo | (lo >> 8)) & 0x0000ffff0000ffff;
    hi = (hi | (hi >> 8)) & 0x0000ffff0000ffff;
    lo = (lo | (lo >> 16)) & 0x00000000ffffffff;
    hi = (hi | (hi >> 16)) & 0x00000000ffffffff;
    return lo | (hi << 32);
  }
  /** Selects 8-bit lanes from either vector according to lane indexes [0-15]. */
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v64, b: v64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): v64 {
    if (ASC_FEATURE_SIMD) {
      store<u8>(simd_shuffle_tmp, l0,0);
      store<u8>(simd_shuffle_tmp, l1,1);
      store<u8>(simd_shuffle_tmp, l2,2);
      store<u8>(simd_shuffle_tmp, l3,3);
      store<u8>(simd_shuffle_tmp, l4,4);
      store<u8>(simd_shuffle_tmp, l5,5);
      store<u8>(simd_shuffle_tmp, l6,6);
      store<u8>(simd_shuffle_tmp, l7,7);
      store<u64>(simd_shuffle_tmp, 0x8080808080808080,8);
      return i64x2.extract_lane(i8x16.swizzle(i64x2(a as i64, b as i64), load<v128>(simd_shuffle_tmp, 0, 1)), 0) as v64;
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
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.swizzle(i64x2(a as i64, 0), i64x2(s as i64, 0)), 0) as v64;
    }
    const x = s & 0xf8f8f8f8f8f8f8f8;
    const valid = ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
    return relaxed_swizzle(a, s) & valid;
  }
  /** Selects 8-bit lanes from `a` according to indices in `s`, mapping out-of-bounds lanes via modulo. */
  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(a: v64, s: v64): v64 {
    if (ASC_FEATURE_SIMD) {
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
    if (ASC_FEATURE_SIMD) {
      const hi = i8x16.shr_u(i64x2(m as i64, 0), 7);
      const mask = i8x16.sub(i8x16.splat(0), hi);
      return i64x2.extract_lane(v128.bitselect(i64x2(a as i64, 0), i64x2(b as i64, 0), mask), 0) as v64;
    }
    const mask = ((m & 0x8080808080808080) >> 7) * 0xff;
    return (a & mask) | (b & ~mask);
  }

}

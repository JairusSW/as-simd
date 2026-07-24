import { v64 } from "./value";

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
  @inline function saturate_i16_to_i8(x: i32): v64 {
    return (<v64>(x > 127 ? 127 : (x < -128 ? -128 : x))) & 0xff;
  }

  // @ts-expect-error: decorator
  @inline function saturate_i16_to_u8(x: i32): v64 {
    return (<v64>(x < 0 ? 0 : (x > 255 ? 255 : x))) & 0xff;
  }

  // @ts-expect-error: decorator
  @inline function mul_swar(a: v64, b: v64): v64 {
    const p0 = (((a & 0xff) * (b & 0xff)) & 0xff) | (((((a >> 8) & 0xff) * ((b >> 8) & 0xff)) & 0xff) << 8);
    const p1 = (((((a >> 16) & 0xff) * ((b >> 16) & 0xff)) & 0xff) | (((((a >> 24) & 0xff) * ((b >> 24) & 0xff)) & 0xff) << 8)) << 16;
    const p2 = (((((a >> 32) & 0xff) * ((b >> 32) & 0xff)) & 0xff) | (((((a >> 40) & 0xff) * ((b >> 40) & 0xff)) & 0xff) << 8)) << 32;
    const p3 = (((((a >> 48) & 0xff) * ((b >> 48) & 0xff)) & 0xff) | (((((a >> 56) & 0xff) * ((b >> 56) & 0xff)) & 0xff) << 8)) << 48;
    return p0 | p1 | p2 | p3;
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
    // SWAR unconditionally: wrapping a single 64-bit value into a v128 lane and
    // extracting it back costs more than the few scalar ops here (measured ~36%
    // faster than the i8x16.add wrap on V8; the scalar<->SIMD domain crossing
    // dominates a cheap op on every target).
    return ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
  }
  /** Subtracts each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function sub(a: v64, b: v64): v64 {
    // SWAR unconditionally (see `add`).
    return ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^ ((a ^ ~b) & 0x8080808080808080);
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

    return mul_swar(a, b);
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
    const d = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080);
    const mask = ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the signed maximum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_s(a: v64, b: v64): v64 {
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    const mask = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned maxmum of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080);
    const mask = ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned average of each 8-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function avgr_u(a: v64, b: v64): v64 {
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
    const mask = ((a & 0x8080808080808080) >> 7) * 0xff;
    const x = a ^ mask;
    const b = mask & 0x0101010101010101;
    const lo = (x & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f);
    const hi = (x & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010);
    return (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0);
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
    const sum = ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
    const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
    const mask = overflow * 0xff;
    const limit = ((((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return (sum & ~mask) | (limit & mask);
  }
  /** Adds each 8-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v64, b: v64): v64 {
    const lo = (a & 0x00ff00ff00ff00ff) + (b & 0x00ff00ff00ff00ff);
    const hi = ((a >> 8) & 0x00ff00ff00ff00ff) + ((b >> 8) & 0x00ff00ff00ff00ff);
    const loCarry = lo & 0x0100010001000100;
    const hiCarry = hi & 0x0100010001000100;
    const loMask = loCarry - (loCarry >> 8);
    const hiMask = hiCarry * 0xff;
    return (lo & 0x00ff00ff00ff00ff) | ((hi & 0x00ff00ff00ff00ff) << 8) | loMask | hiMask;
  }
  /** Subtracts each 8-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v64, b: v64): v64 {
    const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080);
    const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000);
    const diff = (dlo & 0x00ff00ff00ff00ff) | (dhi & 0xff00ff00ff00ff00);
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
    return (a & (((0xff >> shift) as v64) * 0x0101010101010101)) << shift;
  }
  /** Performs a bitwise arithmetic right shift on each 8-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v64, b: i32): v64 {
    const shift = b & 7;
    if (shift == 0) return a;
    const keep = (((0xff >> shift) & 0xff) as v64) * 0x0101010101010101;
    const logical = (a >> shift) & keep;
    return logical | ((((a & 0x8080808080808080) >> 7) * 0xff) & ~keep);
  }
  /** Performs a bitwise logical right shift on each 8-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v64, b: i32): v64 {
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
  /** Reduces a vector to a scalar indicating whether any 8-bit integer lane is considered `true`. */
  // @ts-expect-error: decorator
  @inline export function any_true(a: v64): bool {
    return a != 0;
  }
  /** Extracts the high bit of each 8-bit integer lane and produces a scalar mask with all bits concatenated. */
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v64): i32 {
    return (((a & 0x8080808080808080) * 0x0002040810204081) >> 56) as i32;
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
    x = (x + (x >> 4)) & 0x0f0f0f0f0f0f0f0f;
    return x;
  }
  /** Computes which 8-bit integer lanes are equal. */
  // @ts-expect-error: decorator
  @inline export function eq(a: v64, b: v64): v64 {
    const x = a ^ b;
    const mask = (((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | x) & 0x8080808080808080;
    return ~((mask >> 7) * 0xff);
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
    const d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    return ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080);
    return ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
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
    const d = ((b | 0x8080808080808080) - (a & 0x7f7f7f7f7f7f7f7f)) ^ ((b ^ ~a) & 0x8080808080808080);
    return ~(((((~b & a) | (~(b ^ a) & d)) & 0x8080808080808080) >> 7) * 0xff);
  }
  /** Computes which 8-bit signed integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v64, b: v64): v64 {
    const bx = b ^ 0x8080808080808080;
    const ax = a ^ 0x8080808080808080;
    const d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080);
    return ((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v64, b: v64): v64 {
    const d = ((b | 0x8080808080808080) - (a & 0x7f7f7f7f7f7f7f7f)) ^ ((b ^ ~a) & 0x8080808080808080);
    return ((((~b & a) | (~(b ^ a) & d)) & 0x8080808080808080) >> 7) * 0xff;
  }
  /** Computes which 8-bit signed integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.ge_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const ax = a ^ 0x8080808080808080;
    const bx = b ^ 0x8080808080808080;
    const d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
    return ~(((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff);
  }
  /** Computes which 8-bit unsigned integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.ge_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const d = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080);
    return ~(((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff);
  }

  /** Narrows each 16-bit signed integer lane to 8-bit signed integer lanes with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow_i16x4_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.narrow_i16x8_s(i64x2(a as i64, b as i64), i64x2(0, 0)), 0) as v64;
    }
    return (
      saturate_i16_to_i8(<i16>(a & 0xffff)) |
      (saturate_i16_to_i8(<i16>((a >> 16) & 0xffff)) << 8) |
      (saturate_i16_to_i8(<i16>((a >> 32) & 0xffff)) << 16) |
      (saturate_i16_to_i8(<i16>((a >> 48) & 0xffff)) << 24) |
      (saturate_i16_to_i8(<i16>(b & 0xffff)) << 32) |
      (saturate_i16_to_i8(<i16>((b >> 16) & 0xffff)) << 40) |
      (saturate_i16_to_i8(<i16>((b >> 32) & 0xffff)) << 48) |
      (saturate_i16_to_i8(<i16>((b >> 48) & 0xffff)) << 56)
    );
  }
  /** Narrows each 16-bit signed integer lane to 8-bit unsigned integer lanes with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow_i16x4_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i8x16.narrow_i16x8_u(i64x2(a as i64, b as i64), i64x2(0, 0)), 0) as v64;
    }
    return (
      saturate_i16_to_u8(<i16>(a & 0xffff)) |
      (saturate_i16_to_u8(<i16>((a >> 16) & 0xffff)) << 8) |
      (saturate_i16_to_u8(<i16>((a >> 32) & 0xffff)) << 16) |
      (saturate_i16_to_u8(<i16>((a >> 48) & 0xffff)) << 24) |
      (saturate_i16_to_u8(<i16>(b & 0xffff)) << 32) |
      (saturate_i16_to_u8(<i16>((b >> 16) & 0xffff)) << 40) |
      (saturate_i16_to_u8(<i16>((b >> 32) & 0xffff)) << 48) |
      (saturate_i16_to_u8(<i16>((b >> 48) & 0xffff)) << 56)
    );
  }
  /** Selects 8-bit lanes from either vector according to lane indexes [0-15]. */
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v64, b: v64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): v64 {
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

    return (
      ((a >> ((s & 7) << 3)) & 0xff) |
      (((a >> (((s >> 8) & 7) << 3)) & 0xff) << 8) |
      (((a >> (((s >> 16) & 7) << 3)) & 0xff) << 16) |
      (((a >> (((s >> 24) & 7) << 3)) & 0xff) << 24) |
      (((a >> (((s >> 32) & 7) << 3)) & 0xff) << 32) |
      (((a >> (((s >> 40) & 7) << 3)) & 0xff) << 40) |
      (((a >> (((s >> 48) & 7) << 3)) & 0xff) << 48) |
      (((a >> (((s >> 56) & 7) << 3)) & 0xff) << 56)
    );
  }
  /** Selects 8-bit lanes from `a` or `b` based on the high bit of each lane in `m`. */
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v64, b: v64, m: v64): v64 {
    const mask = ((m & 0x8080808080808080) >> 7) * 0xff;
    return (a & mask) | (b & ~mask);
  }

}


/** Initializes a 64-bit SWAR vector from four 16-bit integer values. Arguments do not need to be compile-time constants. */
export function i16x4(a: i16, b: i16, c: i16, d: i16): v64 {
  return (
    ((a as v64) & 0xffff) |
    (((b as v64) & 0xffff) << 16) |
    (((c as v64) & 0xffff) << 32) |
    (((d as v64) & 0xffff) << 48)
  );
}

export type i16x4 = v64;

export namespace i16x4 {
  /** Creates a vector with four identical 16-bit integer lanes. */
  // @ts-expect-error: decorator
  @inline export function splat(x: i16): v64 {
    return ((x as v64) & 0xffff) * 0x0001000100010001;
  }
  /** Extracts one 16-bit integer lane as a signed scalar. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(x: v64, idx: u8): i16 {
    return ((x >> ((idx & 3) * 16)) & 0xffff) as i16;
  }
  /** Extracts one 16-bit integer lane as an unsigned scalar. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: v64, idx: u8): u16 {
    return ((x >> ((idx & 3) * 16)) & 0xffff) as u16;
  }
  /** Replaces one 16-bit integer lane. idx argument does not need to be a compile time constant. */
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v64, idx: u8, value: i16): v64 {
    const shift = (idx & 3) * 16;
    const mask = (0xffff as v64) << shift;
    return (x & ~mask) | (((value as v64) & 0xffff) << shift);
  }
  /** Loads the first `len` lanes from memory and fills remaining lanes with `fill`. */
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i16 = 0): v64 {
    if (len <= 0) return splat(fill);
    const p = ptr + immOffset;
    if (len >= 4) return load<v64>(p);
    const fv = splat(fill);
    switch (len) {
      case 1: return (fv & 0xffffffffffff0000) | (load<u16>(p) as v64);
      case 2: return (fv & 0xffffffff00000000) | (load<u32>(p) as v64);
      default: return (fv & 0xffff000000000000) | (load<u32>(p) as v64) | ((load<u16>(p + 4) as v64) << 32);
    }
  }
  /** Stores the first `len` lanes to memory. */
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    if (len <= 0) return;
    const p = ptr + immOffset;
    if (len >= 4) { store<v64>(p, value); return; }
    switch (len) {
      case 1: {
        store<u16>(p, (value & 0xffff) as u16);
        return;
      }
      case 2: {
        store<u32>(p, (value & 0xffffffff) as u32);
        return;
      }
      default: {
        store<u32>(p, (value & 0xffffffff) as u32);
        store<u16>(p + 4, ((value >> 32) & 0xffff) as u16);
        return;
      }
    }
  }
  /** Adds each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function add(a: v64, b: v64): v64 {
    // SWAR unconditionally: the scalar<->SIMD domain crossing of an i16x8.add
    // wrap costs more than these few scalar ops for a single 64-bit value.
    return ((a & ~0x8000800080008000) + (b & ~0x8000800080008000)) ^ ((a ^ b) & 0x8000800080008000);
  }
  /** Subtracts each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function sub(a: v64, b: v64): v64 {
    // SWAR unconditionally (see `add`).
    return ((a | 0x8000800080008000) - (b & ~0x8000800080008000)) ^ ((a ^ ~b) & 0x8000800080008000);
  }
  /** Multiplies each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function mul(a: v64, b: v64): v64 {
    return ((((a & 0xffff) * (b & 0xffff)) & 0xffff) as v64)
      | ((((((a >> 16) & 0xffff) * ((b >> 16) & 0xffff)) & 0xffff) as v64) << 16)
      | ((((((a >> 32) & 0xffff) * ((b >> 32) & 0xffff)) & 0xffff) as v64) << 32)
      | ((((((a >> 48) & 0xffff) * ((b >> 48) & 0xffff)) & 0xffff) as v64) << 48);
  }
  /** Computes the signed minimum of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_s(a: v64, b: v64): v64 {
    const ax = a ^ 0x8000800080008000;
    const bx = b ^ 0x8000800080008000;
    const d = ((ax | 0x8000800080008000) - (bx & 0x7fff7fff7fff7fff)) ^ ((ax ^ ~bx) & 0x8000800080008000);
    const mask = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8000800080008000) >> 15) * 0xffff;
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned minimum of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8000800080008000) - (b & 0x7fff7fff7fff7fff)) ^ ((a ^ ~b) & 0x8000800080008000);
    const mask = ((((~a & b) | (~(a ^ b) & d)) & 0x8000800080008000) >> 15) * 0xffff;
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the signed maximum of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_s(a: v64, b: v64): v64 {
    const ax = a ^ 0x8000800080008000;
    const bx = b ^ 0x8000800080008000;
    const d = ((ax | 0x8000800080008000) - (bx & 0x7fff7fff7fff7fff)) ^ ((ax ^ ~bx) & 0x8000800080008000);
    const mask = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8000800080008000) >> 15) * 0xffff;
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned maximum of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8000800080008000) - (b & 0x7fff7fff7fff7fff)) ^ ((a ^ ~b) & 0x8000800080008000);
    const mask = ((((~a & b) | (~(a ^ b) & d)) & 0x8000800080008000) >> 15) * 0xffff;
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned average of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function avgr_u(a: v64, b: v64): v64 {
    return (a | b) - (((a ^ b) & ~0x0001000100010001) >> 1);
  }
  /** Computes the absolute value of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function abs(a: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i16x8.abs(i64x2(a as i64, 0)), 0) as v64;
    }
    const mask = ((a & 0x8000800080008000) >> 15) * 0xffff;
    const x = a ^ mask;
    return ((x | 0x8000800080008000) - (mask & 0x7fff7fff7fff7fff)) ^ ((x ^ ~mask) & 0x8000800080008000);
  }
  /** Negates each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function neg(a: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i16x8.neg(i64x2(a as i64, 0)), 0) as v64;
    }
    return (0x8000800080008000 - (a & 0x7fff7fff7fff7fff)) ^ ((~a) & 0x8000800080008000);
  }
  /** Adds each 16-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v64, b: v64): v64 {
    const sum = ((a & ~0x8000800080008000) + (b & ~0x8000800080008000)) ^ ((a ^ b) & 0x8000800080008000);
    const overflow = (~(a ^ b) & (a ^ sum) & 0x8000800080008000) >> 15;
    const mask = overflow * 0xffff;
    const limit = ((((a & 0x8000800080008000) >> 15) * 0xffff) ^ 0x7fff7fff7fff7fff);
    return (sum & ~mask) | (limit & mask);
  }
  /** Adds each 16-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v64, b: v64): v64 {
    const sum = ((a & ~0x8000800080008000) + (b & ~0x8000800080008000)) ^ ((a ^ b) & 0x8000800080008000);
    const d = ((sum | 0x8000800080008000) - (a & 0x7fff7fff7fff7fff)) ^ ((sum ^ ~a) & 0x8000800080008000);
    const mask = ((((~sum & a) | (~(sum ^ a) & d)) & 0x8000800080008000) >> 15) * 0xffff;
    return sum | mask;
  }
  /** Subtracts each 16-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v64, b: v64): v64 {
    const diff = ((a | 0x8000800080008000) - (b & 0x7fff7fff7fff7fff)) ^ ((a ^ ~b) & 0x8000800080008000);
    const overflow = ((a ^ b) & (a ^ diff) & 0x8000800080008000) >> 15;
    const mask = overflow * 0xffff;
    const limit = ((((a & 0x8000800080008000) >> 15) * 0xffff) ^ 0x7fff7fff7fff7fff);
    return (diff & ~mask) | (limit & mask);
  }
  /** Subtracts each 16-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v64, b: v64): v64 {
    const diff = ((a | 0x8000800080008000) - (b & 0x7fff7fff7fff7fff)) ^ ((a ^ ~b) & 0x8000800080008000);
    const d = ((a | 0x8000800080008000) - (b & 0x7fff7fff7fff7fff)) ^ ((a ^ ~b) & 0x8000800080008000);
    return diff & ~(((((~a & b) | (~(a ^ b) & d)) & 0x8000800080008000) >> 15) * 0xffff);
  }
  /** Performs a bitwise left shift on each 16-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shl(a: v64, b: i32): v64 {
    const shift = b & 15;
    if (shift == 0) return a;
    return ((a & (((0xffff >> shift) as v64) * 0x0001000100010001)) << shift) & 0xffffffffffffffff;
  }
  /** Performs a bitwise arithmetic right shift on each 16-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v64, b: i32): v64 {
    const shift = b & 15;
    if (shift == 0) return a;
    const keep = (((0xffff >> shift) & 0xffff) as v64) * 0x0001000100010001;
    const logical = (a >> shift) & keep;
    return logical | ((((a & 0x8000800080008000) >> 15) * 0xffff) & ~keep);
  }
  /** Performs a bitwise logical right shift on each 16-bit integer lane by a scalar. */
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v64, b: i32): v64 {
    const shift = b & 15;
    if (shift == 0) return a;
    return (a & ((((0xffff << shift) & 0xffff) as v64) * 0x0001000100010001)) >> shift;
  }
  /** Reduces a vector to a scalar indicating whether all 16-bit integer lanes are considered `true`. */
  // @ts-expect-error: decorator
  @inline export function all_true(a: v64): bool {
    return ((a - 0x0001000100010001) & ~a & 0x8000800080008000) == 0;
  }
  /** Reduces a vector to a scalar indicating whether any 16-bit integer lane is considered `true`. */
  // @ts-expect-error: decorator
  @inline export function any_true(a: v64): bool {
    return a != 0;
  }
  /** Extracts the high bit of each 16-bit integer lane and produces a scalar mask with all bits concatenated. */
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v64): i32 {
    return ((((a >> 15) & 1) as i32) | ((((a >> 31) & 1) as i32) << 1) | ((((a >> 47) & 1) as i32) << 2) | ((((a >> 63) & 1) as i32) << 3));
  }
  /** Returns 0x8000 in each nonzero 16-bit lane and 0 otherwise. */
  // @ts-expect-error: decorator
  @inline export function bitmask_lane(a: v64): v64 {
    return (((a & 0x7fff7fff7fff7fff) + 0x7fff7fff7fff7fff) | a) & 0x8000800080008000;
  }
  /** Counts the number of bits set to one within each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function popcnt(x: v64): v64 {
    x = x - ((x >> 1) & 0x5555555555555555);
    x = (x & 0x3333333333333333) + ((x >> 2) & 0x3333333333333333);
    x = (x + (x >> 4)) & 0x0f0f0f0f0f0f0f0f;
    return (x + (x >> 8)) & 0x001f001f001f001f;
  }
  /** Computes which 16-bit integer lanes are equal. */
  // @ts-expect-error: decorator
  @inline export function eq(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i16x8.eq(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const x = a ^ b;
    const mask = (((x & 0x7fff7fff7fff7fff) + 0x7fff7fff7fff7fff) | x) & 0x8000800080008000;
    return ~((mask >> 15) * 0xffff);
  }
  /** Computes which 16-bit integer lanes are not equal. */
  // @ts-expect-error: decorator
  @inline export function ne(a: v64, b: v64): v64 {
    const x = a ^ b;
    const mask = (((x & 0x7fff7fff7fff7fff) + 0x7fff7fff7fff7fff) | x) & 0x8000800080008000;
    return (mask >> 15) * 0xffff;
  }
  /** Computes which 16-bit signed integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i16x8.lt_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const ax = a ^ 0x8000800080008000;
    const bx = b ^ 0x8000800080008000;
    const d = ((ax | 0x8000800080008000) - (bx & 0x7fff7fff7fff7fff)) ^ ((ax ^ ~bx) & 0x8000800080008000);
    return ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8000800080008000) >> 15) * 0xffff;
  }
  /** Computes which 16-bit unsigned integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v64, b: v64): v64 {
    const d = ((a | 0x8000800080008000) - (b & 0x7fff7fff7fff7fff)) ^ ((a ^ ~b) & 0x8000800080008000);
    return ((((~a & b) | (~(a ^ b) & d)) & 0x8000800080008000) >> 15) * 0xffff;
  }
  /** Computes which 16-bit signed integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i16x8.le_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const ax = b ^ 0x8000800080008000;
    const bx = a ^ 0x8000800080008000;
    const d = ((ax | 0x8000800080008000) - (bx & 0x7fff7fff7fff7fff)) ^ ((ax ^ ~bx) & 0x8000800080008000);
    return ~(((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8000800080008000) >> 15) * 0xffff);
  }
  /** Computes which 16-bit unsigned integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i16x8.le_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const d = ((b | 0x8000800080008000) - (a & 0x7fff7fff7fff7fff)) ^ ((b ^ ~a) & 0x8000800080008000);
    return ~(((((~b & a) | (~(b ^ a) & d)) & 0x8000800080008000) >> 15) * 0xffff);
  }
  /** Computes which 16-bit signed integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v64, b: v64): v64 {
    const bx = b ^ 0x8000800080008000;
    const ax = a ^ 0x8000800080008000;
    const d = ((bx | 0x8000800080008000) - (ax & 0x7fff7fff7fff7fff)) ^ ((bx ^ ~ax) & 0x8000800080008000);
    return ((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8000800080008000) >> 15) * 0xffff;
  }
  /** Computes which 16-bit unsigned integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v64, b: v64): v64 {
    const d = ((b | 0x8000800080008000) - (a & 0x7fff7fff7fff7fff)) ^ ((b ^ ~a) & 0x8000800080008000);
    return ((((~b & a) | (~(b ^ a) & d)) & 0x8000800080008000) >> 15) * 0xffff;
  }
  /** Computes which 16-bit signed integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i16x8.ge_s(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const ax = a ^ 0x8000800080008000;
    const bx = b ^ 0x8000800080008000;
    const d = ((ax | 0x8000800080008000) - (bx & 0x7fff7fff7fff7fff)) ^ ((ax ^ ~bx) & 0x8000800080008000);
    return ~(((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8000800080008000) >> 15) * 0xffff);
  }
  /** Computes which 16-bit unsigned integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v64, b: v64): v64 {
    if (ASC_FEATURE_SIMD) {
      return i64x2.extract_lane(i16x8.ge_u(i64x2(a as i64, 0), i64x2(b as i64, 0)), 0) as v64;
    }
    const d = ((a | 0x8000800080008000) - (b & 0x7fff7fff7fff7fff)) ^ ((a ^ ~b) & 0x8000800080008000);
    return ~(((((~a & b) | (~(a ^ b) & d)) & 0x8000800080008000) >> 15) * 0xffff);
  }
  /** Narrows each 32-bit signed integer lane to 16-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function narrow_i32x2_s(a: v64, b: v64): v64 {
    const a0 = (a & 0xffffffff) as i32;
    const a1 = ((a >> 32) & 0xffffffff) as i32;
    const b0 = (b & 0xffffffff) as i32;
    const b1 = ((b >> 32) & 0xffffffff) as i32;
    return (((a0 > 32767 ? 32767 : (a0 < -32768 ? -32768 : a0)) as v64) & 0xffff)
      | ((((a1 > 32767 ? 32767 : (a1 < -32768 ? -32768 : a1)) as v64) & 0xffff) << 16)
      | ((((b0 > 32767 ? 32767 : (b0 < -32768 ? -32768 : b0)) as v64) & 0xffff) << 32)
      | ((((b1 > 32767 ? 32767 : (b1 < -32768 ? -32768 : b1)) as v64) & 0xffff) << 48);
  }
  /** Narrows each 32-bit signed integer lane to 16-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function narrow_i32x2_u(a: v64, b: v64): v64 {
    const a0 = (a & 0xffffffff) as i32;
    const a1 = ((a >> 32) & 0xffffffff) as i32;
    const b0 = (b & 0xffffffff) as i32;
    const b1 = ((b >> 32) & 0xffffffff) as i32;
    return (((a0 < 0 ? 0 : (a0 > 65535 ? 65535 : a0)) as v64) & 0xffff)
      | ((((a1 < 0 ? 0 : (a1 > 65535 ? 65535 : a1)) as v64) & 0xffff) << 16)
      | ((((b0 < 0 ? 0 : (b0 > 65535 ? 65535 : b0)) as v64) & 0xffff) << 32)
      | ((((b1 < 0 ? 0 : (b1 > 65535 ? 65535 : b1)) as v64) & 0xffff) << 48);
  }
  /** Extends the low 8-bit signed integer lanes to 16-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_low_i8x8_s(a: v64): v64 {
    return ((((a >> 0) & 0xff) as i8 as v64) & 0xffff)
      | (((((a >> 8) & 0xff) as i8 as v64) & 0xffff) << 16)
      | (((((a >> 16) & 0xff) as i8 as v64) & 0xffff) << 32)
      | (((((a >> 24) & 0xff) as i8 as v64) & 0xffff) << 48);
  }
  /** Extends the low 8-bit unsigned integer lanes to 16-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_low_i8x8_u(a: v64): v64 {
    return ((a >> 0) & 0xff)
      | (((a >> 8) & 0xff) << 16)
      | (((a >> 16) & 0xff) << 32)
      | (((a >> 24) & 0xff) << 48);
  }
  /** Extends the high 8-bit signed integer lanes to 16-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_high_i8x8_s(a: v64): v64 {
    return ((((a >> 32) & 0xff) as i8 as v64) & 0xffff)
      | (((((a >> 40) & 0xff) as i8 as v64) & 0xffff) << 16)
      | (((((a >> 48) & 0xff) as i8 as v64) & 0xffff) << 32)
      | (((((a >> 56) & 0xff) as i8 as v64) & 0xffff) << 48);
  }
  /** Extends the high 8-bit unsigned integer lanes to 16-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_high_i8x8_u(a: v64): v64 {
    return ((a >> 32) & 0xff)
      | (((a >> 40) & 0xff) << 16)
      | (((a >> 48) & 0xff) << 32)
      | (((a >> 56) & 0xff) << 48);
  }
  /** Adds the eight 8-bit signed integer lanes pairwise producing four 16-bit signed integer results. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x8_s(a: v64): v64 {
    const p0 = ((((a >> 0) & 0xff) as i8) + (((a >> 8) & 0xff) as i8)) as i16;
    const p1 = ((((a >> 16) & 0xff) as i8) + (((a >> 24) & 0xff) as i8)) as i16;
    const p2 = ((((a >> 32) & 0xff) as i8) + (((a >> 40) & 0xff) as i8)) as i16;
    const p3 = ((((a >> 48) & 0xff) as i8) + (((a >> 56) & 0xff) as i8)) as i16;
    return ((p0 as v64) & 0xffff) | (((p1 as v64) & 0xffff) << 16) | (((p2 as v64) & 0xffff) << 32) | (((p3 as v64) & 0xffff) << 48);
  }
  /** Adds the eight 8-bit unsigned integer lanes pairwise producing four 16-bit unsigned integer results. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x8_u(a: v64): v64 {
    const p0 = ((((a >> 0) & 0xff) as u8) + (((a >> 8) & 0xff) as u8)) as u16;
    const p1 = ((((a >> 16) & 0xff) as u8) + (((a >> 24) & 0xff) as u8)) as u16;
    const p2 = ((((a >> 32) & 0xff) as u8) + (((a >> 40) & 0xff) as u8)) as u16;
    const p3 = ((((a >> 48) & 0xff) as u8) + (((a >> 56) & 0xff) as u8)) as u16;
    return ((p0 as v64) & 0xffff) | (((p1 as v64) & 0xffff) << 16) | (((p2 as v64) & 0xffff) << 32) | (((p3 as v64) & 0xffff) << 48);
  }
  /** Performs the lane-wise 16-bit signed integer saturating rounding multiplication in Q15 format. */
  // @ts-expect-error: decorator
  @inline export function q15mulr_sat_s(a: v64, b: v64): v64 {
    const a0 = (a & 0xffff) as i16;
    const a1 = ((a >> 16) & 0xffff) as i16;
    const a2 = ((a >> 32) & 0xffff) as i16;
    const a3 = ((a >> 48) & 0xffff) as i16;
    const b0 = (b & 0xffff) as i16;
    const b1 = ((b >> 16) & 0xffff) as i16;
    const b2 = ((b >> 32) & 0xffff) as i16;
    const b3 = ((b >> 48) & 0xffff) as i16;
    const p0 = ((((a0 as i32) * (b0 as i32)) + 0x4000) >> 15);
    const p1 = ((((a1 as i32) * (b1 as i32)) + 0x4000) >> 15);
    const p2 = ((((a2 as i32) * (b2 as i32)) + 0x4000) >> 15);
    const p3 = ((((a3 as i32) * (b3 as i32)) + 0x4000) >> 15);
    return (((p0 > 32767 ? 32767 : (p0 < -32768 ? -32768 : p0)) as v64) & 0xffff)
      | ((((p1 > 32767 ? 32767 : (p1 < -32768 ? -32768 : p1)) as v64) & 0xffff) << 16)
      | ((((p2 > 32767 ? 32767 : (p2 < -32768 ? -32768 : p2)) as v64) & 0xffff) << 32)
      | ((((p3 > 32767 ? 32767 : (p3 < -32768 ? -32768 : p3)) as v64) & 0xffff) << 48);
  }
  /** Performs the lane-wise 8-bit signed integer extended multiplication of the four lower lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_low_i8x8_s(a: v64, b: v64): v64 {
    const p0 = ((((a >> 0) & 0xff) as i8) * (((b >> 0) & 0xff) as i8)) as i16;
    const p1 = ((((a >> 8) & 0xff) as i8) * (((b >> 8) & 0xff) as i8)) as i16;
    const p2 = ((((a >> 16) & 0xff) as i8) * (((b >> 16) & 0xff) as i8)) as i16;
    const p3 = ((((a >> 24) & 0xff) as i8) * (((b >> 24) & 0xff) as i8)) as i16;
    return ((p0 as v64) & 0xffff) | (((p1 as v64) & 0xffff) << 16) | (((p2 as v64) & 0xffff) << 32) | (((p3 as v64) & 0xffff) << 48);
  }
  /** Performs the lane-wise 8-bit unsigned integer extended multiplication of the four lower lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_low_i8x8_u(a: v64, b: v64): v64 {
    const p0 = ((((a >> 0) & 0xff) as u8) * (((b >> 0) & 0xff) as u8)) as u16;
    const p1 = ((((a >> 8) & 0xff) as u8) * (((b >> 8) & 0xff) as u8)) as u16;
    const p2 = ((((a >> 16) & 0xff) as u8) * (((b >> 16) & 0xff) as u8)) as u16;
    const p3 = ((((a >> 24) & 0xff) as u8) * (((b >> 24) & 0xff) as u8)) as u16;
    return ((p0 as v64) & 0xffff) | (((p1 as v64) & 0xffff) << 16) | (((p2 as v64) & 0xffff) << 32) | (((p3 as v64) & 0xffff) << 48);
  }
  /** Performs the lane-wise 8-bit signed integer extended multiplication of the four higher lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_high_i8x8_s(a: v64, b: v64): v64 {
    const p0 = ((((a >> 32) & 0xff) as i8) * (((b >> 32) & 0xff) as i8)) as i16;
    const p1 = ((((a >> 40) & 0xff) as i8) * (((b >> 40) & 0xff) as i8)) as i16;
    const p2 = ((((a >> 48) & 0xff) as i8) * (((b >> 48) & 0xff) as i8)) as i16;
    const p3 = ((((a >> 56) & 0xff) as i8) * (((b >> 56) & 0xff) as i8)) as i16;
    return ((p0 as v64) & 0xffff) | (((p1 as v64) & 0xffff) << 16) | (((p2 as v64) & 0xffff) << 32) | (((p3 as v64) & 0xffff) << 48);
  }
  /** Performs the lane-wise 8-bit unsigned integer extended multiplication of the four higher lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_high_i8x8_u(a: v64, b: v64): v64 {
    const p0 = ((((a >> 32) & 0xff) as u8) * (((b >> 32) & 0xff) as u8)) as u16;
    const p1 = ((((a >> 40) & 0xff) as u8) * (((b >> 40) & 0xff) as u8)) as u16;
    const p2 = ((((a >> 48) & 0xff) as u8) * (((b >> 48) & 0xff) as u8)) as u16;
    const p3 = ((((a >> 56) & 0xff) as u8) * (((b >> 56) & 0xff) as u8)) as u16;
    return ((p0 as v64) & 0xffff) | (((p1 as v64) & 0xffff) << 16) | (((p2 as v64) & 0xffff) << 32) | (((p3 as v64) & 0xffff) << 48);
  }
  /** Selects 16-bit lanes from either vector according to lane indexes [0-7]. */
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v64, b: v64, l0: u8, l1: u8, l2: u8, l3: u8): v64 {
    const i0 = l0 & 3;
    const i1 = l1 & 3;
    const i2 = l2 & 3;
    const i3 = l3 & 3;
    return (((l0 < 4 ? (a >> (i0 * 16)) : (b >> (i0 * 16))) & 0xffff) as v64)
      | ((((l1 < 4 ? (a >> (i1 * 16)) : (b >> (i1 * 16))) & 0xffff) as v64) << 16)
      | ((((l2 < 4 ? (a >> (i2 * 16)) : (b >> (i2 * 16))) & 0xffff) as v64) << 32)
      | ((((l3 < 4 ? (a >> (i3 * 16)) : (b >> (i3 * 16))) & 0xffff) as v64) << 48);
  }
  /** Selects 16-bit lanes from `a` or `b` based on the high bit of each lane in `m`. */
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v64, b: v64, m: v64): v64 {
    return ((((m >> 0) & 0x8000) != 0 ? a : b) & 0xffff)
      | ((((((m >> 16) & 0x8000) != 0 ? a : b) >> 16) & 0xffff) << 16)
      | ((((((m >> 32) & 0x8000) != 0 ? a : b) >> 32) & 0xffff) << 32)
      | ((((((m >> 48) & 0x8000) != 0 ? a : b) >> 48) & 0xffff) << 48);
  }
  /** Performs lane-wise rounding multiplication in Q15 format. */
  // @ts-expect-error: decorator
  @inline export function relaxed_q15mulr_s(a: v64, b: v64): v64 {
    const a0 = (a & 0xffff) as i16;
    const a1 = ((a >> 16) & 0xffff) as i16;
    const a2 = ((a >> 32) & 0xffff) as i16;
    const a3 = ((a >> 48) & 0xffff) as i16;
    const b0 = (b & 0xffff) as i16;
    const b1 = ((b >> 16) & 0xffff) as i16;
    const b2 = ((b >> 32) & 0xffff) as i16;
    const b3 = ((b >> 48) & 0xffff) as i16;
    const p0 = ((((a0 as i32) * (b0 as i32)) + 0x4000) >> 15);
    const p1 = ((((a1 as i32) * (b1 as i32)) + 0x4000) >> 15);
    const p2 = ((((a2 as i32) * (b2 as i32)) + 0x4000) >> 15);
    const p3 = ((((a3 as i32) * (b3 as i32)) + 0x4000) >> 15);
    return (((p0 > 32767 ? 32767 : (p0 < -32768 ? -32768 : p0)) as v64) & 0xffff)
      | ((((p1 > 32767 ? 32767 : (p1 < -32768 ? -32768 : p1)) as v64) & 0xffff) << 16)
      | ((((p2 > 32767 ? 32767 : (p2 < -32768 ? -32768 : p2)) as v64) & 0xffff) << 32)
      | ((((p3 > 32767 ? 32767 : (p3 < -32768 ? -32768 : p3)) as v64) & 0xffff) << 48);
  }
  /** Computes the dot product of two 8-bit lanes each, yielding 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function relaxed_dot_i8x8_i7x8_s(a: v64, b: v64): v64 {
    const p0 = ((((a >> 0) & 0xff) as i8 as i16) * (((b >> 0) & 0xff) as i8 as i16) + ((((a >> 8) & 0xff) as i8 as i16) * (((b >> 8) & 0xff) as i8 as i16))) as i16;
    const p1 = ((((a >> 16) & 0xff) as i8 as i16) * (((b >> 16) & 0xff) as i8 as i16) + ((((a >> 24) & 0xff) as i8 as i16) * (((b >> 24) & 0xff) as i8 as i16))) as i16;
    const p2 = ((((a >> 32) & 0xff) as i8 as i16) * (((b >> 32) & 0xff) as i8 as i16) + ((((a >> 40) & 0xff) as i8 as i16) * (((b >> 40) & 0xff) as i8 as i16))) as i16;
    const p3 = ((((a >> 48) & 0xff) as i8 as i16) * (((b >> 48) & 0xff) as i8 as i16) + ((((a >> 56) & 0xff) as i8 as i16) * (((b >> 56) & 0xff) as i8 as i16))) as i16;
    return ((p0 as v64) & 0xffff) | (((p1 as v64) & 0xffff) << 16) | (((p2 as v64) & 0xffff) << 32) | (((p3 as v64) & 0xffff) << 48);
  }
}

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
    return ((((a & 0xffffffff) * (b & 0xffffffff)) & 0xffffffff) as v64)
      | ((((((a >> 32) & 0xffffffff) * ((b >> 32) & 0xffffffff)) & 0xffffffff) as v64) << 32);
  }
  /** Computes the signed minimum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_s(a: v64, b: v64): v64 {
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
    const keep = ((0xffffffff as v64) >> shift) * 0x0000000100000001;
    return (a >> shift) & keep;
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

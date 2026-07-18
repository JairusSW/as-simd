import { v64 } from "./v64";

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

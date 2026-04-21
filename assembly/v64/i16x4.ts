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
  // @ts-expect-error: decorator
  @inline function add_swar16(a: v64, b: v64): v64 {
    return ((a & ~0x8000800080008000) + (b & ~0x8000800080008000)) ^ ((a ^ b) & 0x8000800080008000);
  }

  // @ts-expect-error: decorator
  @inline function sub_swar16(a: v64, b: v64): v64 {
    return ((a | 0x8000800080008000) - (b & ~0x8000800080008000)) ^ ((a ^ ~b) & 0x8000800080008000);
  }

  // @ts-expect-error: decorator
  @inline function zero_mask16(x: v64): v64 {
    return ((~(((x & 0x7fff7fff7fff7fff) + 0x7fff7fff7fff7fff) & 0x8000800080008000) & ~x & 0x8000800080008000) >> 15) * 0xffff;
  }

  // @ts-expect-error: decorator
  @inline function lt_mask_u16(a: v64, b: v64): v64 {
    const d = sub_swar16(a, b);
    return ((((~a & b) | (~(a ^ b) & d)) & 0x8000800080008000) >> 15) * 0xffff;
  }

  // @ts-expect-error: decorator
  @inline function lt_mask_s16(a: v64, b: v64): v64 {
    return lt_mask_u16(a ^ 0x8000800080008000, b ^ 0x8000800080008000);
  }

  // @ts-expect-error: decorator
  @inline function get8u(x: v64, i: i32): u8 {
    return ((x >> (i * 8)) & 0xff) as u8;
  }

  // @ts-expect-error: decorator
  @inline function get8s(x: v64, i: i32): i8 {
    return get8u(x, i) as i8;
  }

  // @ts-expect-error: decorator
  @inline function get16u(x: v64, i: i32): u16 {
    return ((x >> (i * 16)) & 0xffff) as u16;
  }

  // @ts-expect-error: decorator
  @inline function get16s(x: v64, i: i32): i16 {
    return get16u(x, i) as i16;
  }

  // @ts-expect-error: decorator
  @inline function get32s(x: v64, i: i32): i32 {
    return ((x >> (i * 32)) & 0xffffffff) as i32;
  }

  // @ts-expect-error: decorator
  @inline function set16(x: v64, i: i32, v: u16): v64 {
    const shift = i * 16;
    const mask = (0xffff as v64) << shift;
    return (x & ~mask) | ((v as v64) << shift);
  }

  // @ts-expect-error: decorator
  @inline function pack4(a0: u16, a1: u16, a2: u16, a3: u16): v64 {
    return (a0 as v64) | ((a1 as v64) << 16) | ((a2 as v64) << 32) | ((a3 as v64) << 48);
  }

  // @ts-expect-error: decorator
  @inline function sat_i32_to_i16_s(x: i32): i16 {
    return x > 32767 ? 32767 : (x < -32768 ? -32768 : x as i16);
  }

  // @ts-expect-error: decorator
  @inline function sat_i32_to_i16_u(x: i32): u16 {
    return x < 0 ? 0 : (x > 65535 ? 65535 : x as u16);
  }

  // @ts-expect-error: decorator
  @inline function cmp_mask16(pred: bool): u16 {
    return pred ? 0xffff : 0;
  }

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
    return ((a & ~0x8000800080008000) + (b & ~0x8000800080008000)) ^ ((a ^ b) & 0x8000800080008000);
  }
  /** Subtracts each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function sub(a: v64, b: v64): v64 {
    return ((a | 0x8000800080008000) - (b & ~0x8000800080008000)) ^ ((a ^ ~b) & 0x8000800080008000);
  }
  /** Multiplies each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function mul(a: v64, b: v64): v64 {
    return pack4(
      (((a & 0xffff) * (b & 0xffff)) & 0xffff) as u16,
      ((((a >> 16) & 0xffff) * ((b >> 16) & 0xffff)) & 0xffff) as u16,
      ((((a >> 32) & 0xffff) * ((b >> 32) & 0xffff)) & 0xffff) as u16,
      ((((a >> 48) & 0xffff) * ((b >> 48) & 0xffff)) & 0xffff) as u16,
    );
  }
  /** Computes the signed minimum of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_s(a: v64, b: v64): v64 {
    const mask = lt_mask_s16(a, b);
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned minimum of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_u(a: v64, b: v64): v64 {
    const mask = lt_mask_u16(a, b);
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the signed maximum of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_s(a: v64, b: v64): v64 {
    const mask = lt_mask_s16(a, b);
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned maximum of each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_u(a: v64, b: v64): v64 {
    const mask = lt_mask_u16(a, b);
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
    const mask = ((a & 0x8000800080008000) >> 15) * 0xffff;
    const x = a ^ mask;
    return sub_swar16(x, mask);
  }
  /** Negates each 16-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function neg(a: v64): v64 {
    return sub_swar16(0, a);
  }
  /** Adds each 16-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v64, b: v64): v64 {
    const sum = add_swar16(a, b);
    const overflow = (~(a ^ b) & (a ^ sum) & 0x8000800080008000) >> 15;
    const mask = overflow * 0xffff;
    const limit = ((((a & 0x8000800080008000) >> 15) * 0xffff) ^ 0x7fff7fff7fff7fff);
    return (sum & ~mask) | (limit & mask);
  }
  /** Adds each 16-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v64, b: v64): v64 {
    const sum = add_swar16(a, b);
    const d = sub_swar16(sum, a);
    const mask = ((((~sum & a) | (~(sum ^ a) & d)) & 0x8000800080008000) >> 15) * 0xffff;
    return sum | mask;
  }
  /** Subtracts each 16-bit integer lane using signed saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v64, b: v64): v64 {
    const diff = sub_swar16(a, b);
    const overflow = ((a ^ b) & (a ^ diff) & 0x8000800080008000) >> 15;
    const mask = overflow * 0xffff;
    const limit = ((((a & 0x8000800080008000) >> 15) * 0xffff) ^ 0x7fff7fff7fff7fff);
    return (diff & ~mask) | (limit & mask);
  }
  /** Subtracts each 16-bit integer lane using unsigned saturation. */
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v64, b: v64): v64 {
    const diff = sub_swar16(a, b);
    return diff & ~lt_mask_u16(a, b);
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
    return zero_mask16(a) == 0;
  }
  /** Extracts the high bit of each 16-bit integer lane and produces a scalar mask with all bits concatenated. */
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v64): i32 {
    return ((((a >> 15) & 1) as i32) | ((((a >> 31) & 1) as i32) << 1) | ((((a >> 47) & 1) as i32) << 2) | ((((a >> 63) & 1) as i32) << 3));
  }
  /** Computes which 16-bit integer lanes are equal. */
  // @ts-expect-error: decorator
  @inline export function eq(a: v64, b: v64): v64 {
    return zero_mask16(a ^ b);
  }
  /** Computes which 16-bit integer lanes are not equal. */
  // @ts-expect-error: decorator
  @inline export function ne(a: v64, b: v64): v64 {
    return ~zero_mask16(a ^ b);
  }
  /** Computes which 16-bit signed integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v64, b: v64): v64 {
    return lt_mask_s16(a, b);
  }
  /** Computes which 16-bit unsigned integer lanes of the first vector are less than those of the second. */
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v64, b: v64): v64 {
    return lt_mask_u16(a, b);
  }
  /** Computes which 16-bit signed integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_s(a: v64, b: v64): v64 {
    return ~lt_mask_s16(b, a);
  }
  /** Computes which 16-bit unsigned integer lanes of the first vector are less than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function le_u(a: v64, b: v64): v64 {
    return ~lt_mask_u16(b, a);
  }
  /** Computes which 16-bit signed integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v64, b: v64): v64 {
    return lt_mask_s16(b, a);
  }
  /** Computes which 16-bit unsigned integer lanes of the first vector are greater than those of the second. */
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v64, b: v64): v64 {
    return lt_mask_u16(b, a);
  }
  /** Computes which 16-bit signed integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v64, b: v64): v64 {
    return ~lt_mask_s16(a, b);
  }
  /** Computes which 16-bit unsigned integer lanes of the first vector are greater than or equal those of the second. */
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v64, b: v64): v64 {
    return ~lt_mask_u16(a, b);
  }
  /** Narrows each 32-bit signed integer lane to 16-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function narrow_i32x2_s(a: v64, b: v64): v64 {
    return pack4(
      sat_i32_to_i16_s(get32s(a, 0)) as u16,
      sat_i32_to_i16_s(get32s(a, 1)) as u16,
      sat_i32_to_i16_s(get32s(b, 0)) as u16,
      sat_i32_to_i16_s(get32s(b, 1)) as u16,
    );
  }
  /** Narrows each 32-bit signed integer lane to 16-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function narrow_i32x2_u(a: v64, b: v64): v64 {
    return pack4(
      sat_i32_to_i16_u(get32s(a, 0)),
      sat_i32_to_i16_u(get32s(a, 1)),
      sat_i32_to_i16_u(get32s(b, 0)),
      sat_i32_to_i16_u(get32s(b, 1)),
    );
  }
  /** Extends the low 8-bit signed integer lanes to 16-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_low_i8x8_s(a: v64): v64 {
    return pack4(get8s(a, 0) as u16, get8s(a, 1) as u16, get8s(a, 2) as u16, get8s(a, 3) as u16);
  }
  /** Extends the low 8-bit unsigned integer lanes to 16-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_low_i8x8_u(a: v64): v64 {
    return pack4(get8u(a, 0), get8u(a, 1), get8u(a, 2), get8u(a, 3));
  }
  /** Extends the high 8-bit signed integer lanes to 16-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_high_i8x8_s(a: v64): v64 {
    return pack4(get8s(a, 4) as u16, get8s(a, 5) as u16, get8s(a, 6) as u16, get8s(a, 7) as u16);
  }
  /** Extends the high 8-bit unsigned integer lanes to 16-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_high_i8x8_u(a: v64): v64 {
    return pack4(get8u(a, 4), get8u(a, 5), get8u(a, 6), get8u(a, 7));
  }
  /** Adds the eight 8-bit signed integer lanes pairwise producing four 16-bit signed integer results. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x8_s(a: v64): v64 {
    return pack4(
      (get8s(a, 0) + get8s(a, 1)) as u16,
      (get8s(a, 2) + get8s(a, 3)) as u16,
      (get8s(a, 4) + get8s(a, 5)) as u16,
      (get8s(a, 6) + get8s(a, 7)) as u16,
    );
  }
  /** Adds the eight 8-bit unsigned integer lanes pairwise producing four 16-bit unsigned integer results. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x8_u(a: v64): v64 {
    return pack4(
      (get8u(a, 0) + get8u(a, 1)) as u16,
      (get8u(a, 2) + get8u(a, 3)) as u16,
      (get8u(a, 4) + get8u(a, 5)) as u16,
      (get8u(a, 6) + get8u(a, 7)) as u16,
    );
  }
  /** Performs the lane-wise 16-bit signed integer saturating rounding multiplication in Q15 format. */
  // @ts-expect-error: decorator
  @inline export function q15mulr_sat_s(a: v64, b: v64): v64 {
    return pack4(
      sat_i32_to_i16_s((((get16s(a, 0) as i32) * (get16s(b, 0) as i32)) + 0x4000) >> 15) as u16,
      sat_i32_to_i16_s((((get16s(a, 1) as i32) * (get16s(b, 1) as i32)) + 0x4000) >> 15) as u16,
      sat_i32_to_i16_s((((get16s(a, 2) as i32) * (get16s(b, 2) as i32)) + 0x4000) >> 15) as u16,
      sat_i32_to_i16_s((((get16s(a, 3) as i32) * (get16s(b, 3) as i32)) + 0x4000) >> 15) as u16,
    );
  }
  /** Performs the lane-wise 8-bit signed integer extended multiplication of the four lower lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_low_i8x8_s(a: v64, b: v64): v64 {
    return pack4(
      (get8s(a, 0) * get8s(b, 0)) as u16,
      (get8s(a, 1) * get8s(b, 1)) as u16,
      (get8s(a, 2) * get8s(b, 2)) as u16,
      (get8s(a, 3) * get8s(b, 3)) as u16,
    );
  }
  /** Performs the lane-wise 8-bit unsigned integer extended multiplication of the four lower lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_low_i8x8_u(a: v64, b: v64): v64 {
    return pack4(
      (get8u(a, 0) * get8u(b, 0)) as u16,
      (get8u(a, 1) * get8u(b, 1)) as u16,
      (get8u(a, 2) * get8u(b, 2)) as u16,
      (get8u(a, 3) * get8u(b, 3)) as u16,
    );
  }
  /** Performs the lane-wise 8-bit signed integer extended multiplication of the four higher lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_high_i8x8_s(a: v64, b: v64): v64 {
    return pack4(
      (get8s(a, 4) * get8s(b, 4)) as u16,
      (get8s(a, 5) * get8s(b, 5)) as u16,
      (get8s(a, 6) * get8s(b, 6)) as u16,
      (get8s(a, 7) * get8s(b, 7)) as u16,
    );
  }
  /** Performs the lane-wise 8-bit unsigned integer extended multiplication of the four higher lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_high_i8x8_u(a: v64, b: v64): v64 {
    return pack4(
      (get8u(a, 4) * get8u(b, 4)) as u16,
      (get8u(a, 5) * get8u(b, 5)) as u16,
      (get8u(a, 6) * get8u(b, 6)) as u16,
      (get8u(a, 7) * get8u(b, 7)) as u16,
    );
  }
  /** Selects 16-bit lanes from either vector according to lane indexes [0-7]. */
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v64, b: v64, l0: u8, l1: u8, l2: u8, l3: u8): v64 {
    const i0 = l0 & 3;
    const i1 = l1 & 3;
    const i2 = l2 & 3;
    const i3 = l3 & 3;
    return pack4(
      l0 < 4 ? get16u(a, i0) : get16u(b, i0),
      l1 < 4 ? get16u(a, i1) : get16u(b, i1),
      l2 < 4 ? get16u(a, i2) : get16u(b, i2),
      l3 < 4 ? get16u(a, i3) : get16u(b, i3),
    );
  }
  /** Selects 16-bit lanes from `a` or `b` based on the high bit of each lane in `m`. */
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v64, b: v64, m: v64): v64 {
    return pack4(
      (get16u(m, 0) & 0x8000) != 0 ? get16u(a, 0) : get16u(b, 0),
      (get16u(m, 1) & 0x8000) != 0 ? get16u(a, 1) : get16u(b, 1),
      (get16u(m, 2) & 0x8000) != 0 ? get16u(a, 2) : get16u(b, 2),
      (get16u(m, 3) & 0x8000) != 0 ? get16u(a, 3) : get16u(b, 3),
    );
  }
  /** Performs lane-wise rounding multiplication in Q15 format. */
  // @ts-expect-error: decorator
  @inline export function relaxed_q15mulr_s(a: v64, b: v64): v64 {
    return q15mulr_sat_s(a, b);
  }
  /** Computes the dot product of two 8-bit lanes each, yielding 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function relaxed_dot_i8x8_i7x8_s(a: v64, b: v64): v64 {
    return pack4(
      ((get8s(a, 0) as i16) * (get8s(b, 0) as i16) + (get8s(a, 1) as i16) * (get8s(b, 1) as i16)) as u16,
      ((get8s(a, 2) as i16) * (get8s(b, 2) as i16) + (get8s(a, 3) as i16) * (get8s(b, 3) as i16)) as u16,
      ((get8s(a, 4) as i16) * (get8s(b, 4) as i16) + (get8s(a, 5) as i16) * (get8s(b, 5) as i16)) as u16,
      ((get8s(a, 6) as i16) * (get8s(b, 6) as i16) + (get8s(a, 7) as i16) * (get8s(b, 7) as i16)) as u16,
    );
  }
}

import { v64 } from ".";

/** Initializes a 64-bit SWAR vector from two 32-bit integer values. Arguments do not need to be compile-time constants. */
export function i32x2(a: i32, b: i32): v64 {
  return ((a as v64) & 0xffffffff) | (((b as v64) & 0xffffffff) << 32);
}

export type i32x2 = v64;

export namespace i32x2 {
  // @ts-expect-error: decorator
  @inline function add_swar32(a: v64, b: v64): v64 {
    return ((a & ~0x8000000080000000) + (b & ~0x8000000080000000)) ^ ((a ^ b) & 0x8000000080000000);
  }

  // @ts-expect-error: decorator
  @inline function sub_swar32(a: v64, b: v64): v64 {
    return ((a | 0x8000000080000000) - (b & ~0x8000000080000000)) ^ ((a ^ ~b) & 0x8000000080000000);
  }

  // @ts-expect-error: decorator
  @inline function zero_mask32(x: v64): v64 {
    return ((~(((x & 0x7fffffff7fffffff) + 0x7fffffff7fffffff) & 0x8000000080000000) & ~x & 0x8000000080000000) >> 31) * 0xffffffff;
  }

  // @ts-expect-error: decorator
  @inline function lt_mask_u32(a: v64, b: v64): v64 {
    const d = sub_swar32(a, b);
    return ((((~a & b) | (~(a ^ b) & d)) & 0x8000000080000000) >> 31) * 0xffffffff;
  }

  // @ts-expect-error: decorator
  @inline function lt_mask_s32(a: v64, b: v64): v64 {
    return lt_mask_u32(a ^ 0x8000000080000000, b ^ 0x8000000080000000);
  }

  // @ts-expect-error: decorator
  @inline function get8s(x: v64, i: i32): i8 {
    return ((x >> (i * 8)) & 0xff) as i8;
  }

  // @ts-expect-error: decorator
  @inline function get16s(x: v64, i: i32): i16 {
    return ((x >> (i * 16)) & 0xffff) as i16;
  }

  // @ts-expect-error: decorator
  @inline function get16u(x: v64, i: i32): u16 {
    return ((x >> (i * 16)) & 0xffff) as u16;
  }

  // @ts-expect-error: decorator
  @inline function get32s(x: v64, i: i32): i32 {
    return ((x >> (i * 32)) & 0xffffffff) as i32;
  }

  // @ts-expect-error: decorator
  @inline function get32u(x: v64, i: i32): u32 {
    return ((x >> (i * 32)) & 0xffffffff) as u32;
  }

  // @ts-expect-error: decorator
  @inline function pack2(a0: u32, a1: u32): v64 {
    return (a0 as v64) | ((a1 as v64) << 32);
  }

  // @ts-expect-error: decorator
  @inline function cmp_mask32(pred: bool): u32 {
    return pred ? 0xffffffff : 0;
  }

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
    if (len <= 0) return splat(fill);
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
    return add_swar32(a, b);
  }
  /** Subtracts each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function sub(a: v64, b: v64): v64 {
    return sub_swar32(a, b);
  }
  /** Multiplies each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function mul(a: v64, b: v64): v64 {
    return pack2(
      (((a & 0xffffffff) * (b & 0xffffffff)) & 0xffffffff) as u32,
      ((((a >> 32) & 0xffffffff) * ((b >> 32) & 0xffffffff)) & 0xffffffff) as u32,
    );
  }
  /** Computes the signed minimum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_s(a: v64, b: v64): v64 {
    const mask = lt_mask_s32(a, b);
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned minimum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function min_u(a: v64, b: v64): v64 {
    const mask = lt_mask_u32(a, b);
    return b ^ ((a ^ b) & mask);
  }
  /** Computes the signed maximum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_s(a: v64, b: v64): v64 {
    const mask = lt_mask_s32(a, b);
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the unsigned maximum of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function max_u(a: v64, b: v64): v64 {
    const mask = lt_mask_u32(a, b);
    return a ^ ((a ^ b) & mask);
  }
  /** Computes the dot product of two 16-bit integer lanes each, yielding 32-bit integer lanes. */
  // @ts-expect-error: decorator
  @inline export function dot_i16x4_s(a: v64, b: v64): v64 {
    return pack2(
      ((get16s(a, 0) as i32) * (get16s(b, 0) as i32) + (get16s(a, 1) as i32) * (get16s(b, 1) as i32)) as u32,
      ((get16s(a, 2) as i32) * (get16s(b, 2) as i32) + (get16s(a, 3) as i32) * (get16s(b, 3) as i32)) as u32,
    );
  }
  /** Computes the absolute value of each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function abs(a: v64): v64 {
    const mask = ((a & 0x8000000080000000) >> 31) * 0xffffffff;
    const x = a ^ mask;
    return sub_swar32(x, mask);
  }
  /** Negates each 32-bit integer lane. */
  // @ts-expect-error: decorator
  @inline export function neg(a: v64): v64 {
    return sub_swar32(0, a);
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
    return zero_mask32(a) == 0;
  }
  /** Extracts the high bit of each 32-bit integer lane and produces a scalar mask with all bits concatenated. */
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v64): i32 {
    return ((((a >> 31) & 1) as i32) | ((((a >> 63) & 1) as i32) << 1));
  }
  /** Computes which 32-bit integer lanes are equal. */
  // @ts-expect-error: decorator
  @inline export function eq(a: v64, b: v64): v64 {
    return zero_mask32(a ^ b);
  }
  /** Computes which 32-bit integer lanes are not equal. */
  // @ts-expect-error: decorator
  @inline export function ne(a: v64, b: v64): v64 {
    return ~zero_mask32(a ^ b);
  }
  /** Computes which 32-bit signed integer lanes are less than. */
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v64, b: v64): v64 {
    return lt_mask_s32(a, b);
  }
  /** Computes which 32-bit unsigned integer lanes are less than. */
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v64, b: v64): v64 {
    return lt_mask_u32(a, b);
  }
  /** Computes which 32-bit signed integer lanes are less than or equal. */
  // @ts-expect-error: decorator
  @inline export function le_s(a: v64, b: v64): v64 {
    return ~lt_mask_s32(b, a);
  }
  /** Computes which 32-bit unsigned integer lanes are less than or equal. */
  // @ts-expect-error: decorator
  @inline export function le_u(a: v64, b: v64): v64 {
    return ~lt_mask_u32(b, a);
  }
  /** Computes which 32-bit signed integer lanes are greater than. */
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v64, b: v64): v64 {
    return lt_mask_s32(b, a);
  }
  /** Computes which 32-bit unsigned integer lanes are greater than. */
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v64, b: v64): v64 {
    return lt_mask_u32(b, a);
  }
  /** Computes which 32-bit signed integer lanes are greater than or equal. */
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v64, b: v64): v64 {
    return ~lt_mask_s32(a, b);
  }
  /** Computes which 32-bit unsigned integer lanes are greater than or equal. */
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v64, b: v64): v64 {
    return ~lt_mask_u32(a, b);
  }
  /** Extends the low 16-bit signed integer lanes to 32-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_low_i16x4_s(a: v64): v64 {
    return pack2(get16s(a, 0) as u32, get16s(a, 1) as u32);
  }
  /** Extends the low 16-bit unsigned integer lanes to 32-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_low_i16x4_u(a: v64): v64 {
    return pack2(get16u(a, 0), get16u(a, 1));
  }
  /** Extends the high 16-bit signed integer lanes to 32-bit signed integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_high_i16x4_s(a: v64): v64 {
    return pack2(get16s(a, 2) as u32, get16s(a, 3) as u32);
  }
  /** Extends the high 16-bit unsigned integer lanes to 32-bit unsigned integer lanes. */
  // @ts-expect-error: decorator
  @inline export function extend_high_i16x4_u(a: v64): v64 {
    return pack2(get16u(a, 2), get16u(a, 3));
  }
  /** Adds pairwise 16-bit signed lanes producing 32-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i16x4_s(a: v64): v64 {
    return pack2((get16s(a, 0) + get16s(a, 1)) as u32, (get16s(a, 2) + get16s(a, 3)) as u32);
  }
  /** Adds pairwise 16-bit unsigned lanes producing 32-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i16x4_u(a: v64): v64 {
    return pack2((get16u(a, 0) + get16u(a, 1)) as u32, (get16u(a, 2) + get16u(a, 3)) as u32);
  }
  /** Performs lane-wise signed extended multiplication of low 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_low_i16x4_s(a: v64, b: v64): v64 {
    return pack2((get16s(a, 0) * get16s(b, 0)) as u32, (get16s(a, 1) * get16s(b, 1)) as u32);
  }
  /** Performs lane-wise unsigned extended multiplication of low 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_low_i16x4_u(a: v64, b: v64): v64 {
    return pack2((get16u(a, 0) * get16u(b, 0)) as u32, (get16u(a, 1) * get16u(b, 1)) as u32);
  }
  /** Performs lane-wise signed extended multiplication of high 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_high_i16x4_s(a: v64, b: v64): v64 {
    return pack2((get16s(a, 2) * get16s(b, 2)) as u32, (get16s(a, 3) * get16s(b, 3)) as u32);
  }
  /** Performs lane-wise unsigned extended multiplication of high 16-bit lanes. */
  // @ts-expect-error: decorator
  @inline export function extmul_high_i16x4_u(a: v64, b: v64): v64 {
    return pack2((get16u(a, 2) * get16u(b, 2)) as u32, (get16u(a, 3) * get16u(b, 3)) as u32);
  }
  /** Selects 32-bit lanes from either vector according to lane indexes [0-3]. */
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v64, b: v64, l0: u8, l1: u8): v64 {
    const i0 = l0 & 1;
    const i1 = l1 & 1;
    return pack2(l0 < 2 ? get32u(a, i0) : get32u(b, i0), l1 < 2 ? get32u(a, i1) : get32u(b, i1));
  }
  /** Selects 32-bit lanes from `a` or `b` based on the high bit of each lane in `m`. */
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v64, b: v64, m: v64): v64 {
    return pack2((get32u(m, 0) & 0x80000000) != 0 ? get32u(a, 0) : get32u(b, 0), (get32u(m, 1) & 0x80000000) != 0 ? get32u(a, 1) : get32u(b, 1));
  }
}

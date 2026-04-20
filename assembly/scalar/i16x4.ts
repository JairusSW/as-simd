export namespace i16x4_scalar {
  // @ts-expect-error: decorator
  @inline function get8u(x: u64, i: i32): u8 {
    return ((x >> (i * 8)) & 0xff) as u8;
  }

  // @ts-expect-error: decorator
  @inline function get8s(x: u64, i: i32): i8 {
    return get8u(x, i) as i8;
  }

  // @ts-expect-error: decorator
  @inline function get16u(x: u64, i: i32): u16 {
    return ((x >> (i * 16)) & 0xffff) as u16;
  }

  // @ts-expect-error: decorator
  @inline function get16s(x: u64, i: i32): i16 {
    return get16u(x, i) as i16;
  }

  // @ts-expect-error: decorator
  @inline function get32s(x: u64, i: i32): i32 {
    return ((x >> (i * 32)) & 0xffffffff) as i32;
  }

  // @ts-expect-error: decorator
  @inline function pack4(a0: u16, a1: u16, a2: u16, a3: u16): u64 {
    return (a0 as u64) | ((a1 as u64) << 16) | ((a2 as u64) << 32) | ((a3 as u64) << 48);
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

  // @ts-expect-error: decorator
  @inline export function splat(x: i16): u64 {
    return ((x as u64) & 0xffff) * 0x0001000100010001;
  }

  // @ts-expect-error: decorator
  @inline export function extract_lane_s(x: u64, idx: u8): i16 {
    return ((x >> ((idx & 3) * 16)) & 0xffff) as i16;
  }

  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: u64, idx: u8): u16 {
    return ((x >> ((idx & 3) * 16)) & 0xffff) as u16;
  }

  // @ts-expect-error: decorator
  @inline export function replace_lane(x: u64, idx: u8, value: i16): u64 {
    const shift = (idx & 3) * 16;
    const mask = (0xffff as u64) << shift;
    return (x & ~mask) | (((value as u64) & 0xffff) << shift);
  }

  export function add(a: u64, b: u64): u64 {
    return ((a & ~0x8000800080008000) + (b & ~0x8000800080008000)) ^ ((a ^ b) & 0x8000800080008000);
  }

  export function sub(a: u64, b: u64): u64 {
    return ((a | 0x8000800080008000) - (b & ~0x8000800080008000)) ^ ((a ^ ~b) & 0x8000800080008000);
  }

  export function mul(a: u64, b: u64): u64 {
    return pack4(
      (((a & 0xffff) * (b & 0xffff)) & 0xffff) as u16,
      ((((a >> 16) & 0xffff) * ((b >> 16) & 0xffff)) & 0xffff) as u16,
      ((((a >> 32) & 0xffff) * ((b >> 32) & 0xffff)) & 0xffff) as u16,
      ((((a >> 48) & 0xffff) * ((b >> 48) & 0xffff)) & 0xffff) as u16,
    );
  }

  export function min_s(a: u64, b: u64): u64 {
    return pack4(
      (get16s(a, 0) < get16s(b, 0) ? get16s(a, 0) : get16s(b, 0)) as u16,
      (get16s(a, 1) < get16s(b, 1) ? get16s(a, 1) : get16s(b, 1)) as u16,
      (get16s(a, 2) < get16s(b, 2) ? get16s(a, 2) : get16s(b, 2)) as u16,
      (get16s(a, 3) < get16s(b, 3) ? get16s(a, 3) : get16s(b, 3)) as u16,
    );
  }

  export function min_u(a: u64, b: u64): u64 {
    return pack4(
      get16u(a, 0) < get16u(b, 0) ? get16u(a, 0) : get16u(b, 0),
      get16u(a, 1) < get16u(b, 1) ? get16u(a, 1) : get16u(b, 1),
      get16u(a, 2) < get16u(b, 2) ? get16u(a, 2) : get16u(b, 2),
      get16u(a, 3) < get16u(b, 3) ? get16u(a, 3) : get16u(b, 3),
    );
  }

  export function max_s(a: u64, b: u64): u64 {
    return pack4(
      (get16s(a, 0) > get16s(b, 0) ? get16s(a, 0) : get16s(b, 0)) as u16,
      (get16s(a, 1) > get16s(b, 1) ? get16s(a, 1) : get16s(b, 1)) as u16,
      (get16s(a, 2) > get16s(b, 2) ? get16s(a, 2) : get16s(b, 2)) as u16,
      (get16s(a, 3) > get16s(b, 3) ? get16s(a, 3) : get16s(b, 3)) as u16,
    );
  }

  export function max_u(a: u64, b: u64): u64 {
    return pack4(
      get16u(a, 0) > get16u(b, 0) ? get16u(a, 0) : get16u(b, 0),
      get16u(a, 1) > get16u(b, 1) ? get16u(a, 1) : get16u(b, 1),
      get16u(a, 2) > get16u(b, 2) ? get16u(a, 2) : get16u(b, 2),
      get16u(a, 3) > get16u(b, 3) ? get16u(a, 3) : get16u(b, 3),
    );
  }

  export function avgr_u(a: u64, b: u64): u64 {
    return pack4(
      (((get16u(a, 0) as u32) + (get16u(b, 0) as u32) + 1) >> 1) as u16,
      (((get16u(a, 1) as u32) + (get16u(b, 1) as u32) + 1) >> 1) as u16,
      (((get16u(a, 2) as u32) + (get16u(b, 2) as u32) + 1) >> 1) as u16,
      (((get16u(a, 3) as u32) + (get16u(b, 3) as u32) + 1) >> 1) as u16,
    );
  }

  export function abs(a: u64): u64 {
    return pack4(
      (get16s(a, 0) < 0 ? -get16s(a, 0) : get16s(a, 0)) as u16,
      (get16s(a, 1) < 0 ? -get16s(a, 1) : get16s(a, 1)) as u16,
      (get16s(a, 2) < 0 ? -get16s(a, 2) : get16s(a, 2)) as u16,
      (get16s(a, 3) < 0 ? -get16s(a, 3) : get16s(a, 3)) as u16,
    );
  }

  export function neg(a: u64): u64 {
    return pack4((-get16s(a, 0)) as u16, (-get16s(a, 1)) as u16, (-get16s(a, 2)) as u16, (-get16s(a, 3)) as u16);
  }

  export function add_sat_s(a: u64, b: u64): u64 {
    return pack4(
      sat_i32_to_i16_s((get16s(a, 0) as i32) + (get16s(b, 0) as i32)) as u16,
      sat_i32_to_i16_s((get16s(a, 1) as i32) + (get16s(b, 1) as i32)) as u16,
      sat_i32_to_i16_s((get16s(a, 2) as i32) + (get16s(b, 2) as i32)) as u16,
      sat_i32_to_i16_s((get16s(a, 3) as i32) + (get16s(b, 3) as i32)) as u16,
    );
  }

  export function add_sat_u(a: u64, b: u64): u64 {
    return pack4(
      sat_i32_to_i16_u((get16u(a, 0) as i32) + (get16u(b, 0) as i32)),
      sat_i32_to_i16_u((get16u(a, 1) as i32) + (get16u(b, 1) as i32)),
      sat_i32_to_i16_u((get16u(a, 2) as i32) + (get16u(b, 2) as i32)),
      sat_i32_to_i16_u((get16u(a, 3) as i32) + (get16u(b, 3) as i32)),
    );
  }

  export function sub_sat_s(a: u64, b: u64): u64 {
    return pack4(
      sat_i32_to_i16_s((get16s(a, 0) as i32) - (get16s(b, 0) as i32)) as u16,
      sat_i32_to_i16_s((get16s(a, 1) as i32) - (get16s(b, 1) as i32)) as u16,
      sat_i32_to_i16_s((get16s(a, 2) as i32) - (get16s(b, 2) as i32)) as u16,
      sat_i32_to_i16_s((get16s(a, 3) as i32) - (get16s(b, 3) as i32)) as u16,
    );
  }

  export function sub_sat_u(a: u64, b: u64): u64 {
    return pack4(
      get16u(a, 0) >= get16u(b, 0) ? (get16u(a, 0) - get16u(b, 0)) : 0,
      get16u(a, 1) >= get16u(b, 1) ? (get16u(a, 1) - get16u(b, 1)) : 0,
      get16u(a, 2) >= get16u(b, 2) ? (get16u(a, 2) - get16u(b, 2)) : 0,
      get16u(a, 3) >= get16u(b, 3) ? (get16u(a, 3) - get16u(b, 3)) : 0,
    );
  }

  export function shl(a: u64, b: i32): u64 {
    const shift = b & 15;
    return ((a & (((0xffff >> shift) as u64) * 0x0001000100010001)) << shift) & 0xffffffffffffffff;
  }

  export function shr_s(a: u64, b: i32): u64 {
    const shift = b & 15;
    return pack4(
      (<u16>(<i16>(<i32>get16s(a, 0) >> shift))),
      (<u16>(<i16>(<i32>get16s(a, 1) >> shift))),
      (<u16>(<i16>(<i32>get16s(a, 2) >> shift))),
      (<u16>(<i16>(<i32>get16s(a, 3) >> shift))),
    );
  }

  export function shr_u(a: u64, b: i32): u64 {
    const shift = b & 15;
    return (a & ((((0xffff << shift) & 0xffff) as u64) * 0x0001000100010001)) >> shift;
  }

  export function all_true(a: u64): bool {
    return get16u(a, 0) != 0 && get16u(a, 1) != 0 && get16u(a, 2) != 0 && get16u(a, 3) != 0;
  }

  export function bitmask(a: u64): i32 {
    return ((((a >> 15) & 1) as i32) | ((((a >> 31) & 1) as i32) << 1) | ((((a >> 47) & 1) as i32) << 2) | ((((a >> 63) & 1) as i32) << 3));
  }

  export function eq(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16u(a, 0) == get16u(b, 0)), cmp_mask16(get16u(a, 1) == get16u(b, 1)), cmp_mask16(get16u(a, 2) == get16u(b, 2)), cmp_mask16(get16u(a, 3) == get16u(b, 3)));
  }

  export function ne(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16u(a, 0) != get16u(b, 0)), cmp_mask16(get16u(a, 1) != get16u(b, 1)), cmp_mask16(get16u(a, 2) != get16u(b, 2)), cmp_mask16(get16u(a, 3) != get16u(b, 3)));
  }

  export function lt_s(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16s(a, 0) < get16s(b, 0)), cmp_mask16(get16s(a, 1) < get16s(b, 1)), cmp_mask16(get16s(a, 2) < get16s(b, 2)), cmp_mask16(get16s(a, 3) < get16s(b, 3)));
  }

  export function lt_u(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16u(a, 0) < get16u(b, 0)), cmp_mask16(get16u(a, 1) < get16u(b, 1)), cmp_mask16(get16u(a, 2) < get16u(b, 2)), cmp_mask16(get16u(a, 3) < get16u(b, 3)));
  }

  export function le_s(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16s(a, 0) <= get16s(b, 0)), cmp_mask16(get16s(a, 1) <= get16s(b, 1)), cmp_mask16(get16s(a, 2) <= get16s(b, 2)), cmp_mask16(get16s(a, 3) <= get16s(b, 3)));
  }

  export function le_u(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16u(a, 0) <= get16u(b, 0)), cmp_mask16(get16u(a, 1) <= get16u(b, 1)), cmp_mask16(get16u(a, 2) <= get16u(b, 2)), cmp_mask16(get16u(a, 3) <= get16u(b, 3)));
  }

  export function gt_s(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16s(a, 0) > get16s(b, 0)), cmp_mask16(get16s(a, 1) > get16s(b, 1)), cmp_mask16(get16s(a, 2) > get16s(b, 2)), cmp_mask16(get16s(a, 3) > get16s(b, 3)));
  }

  export function gt_u(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16u(a, 0) > get16u(b, 0)), cmp_mask16(get16u(a, 1) > get16u(b, 1)), cmp_mask16(get16u(a, 2) > get16u(b, 2)), cmp_mask16(get16u(a, 3) > get16u(b, 3)));
  }

  export function ge_s(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16s(a, 0) >= get16s(b, 0)), cmp_mask16(get16s(a, 1) >= get16s(b, 1)), cmp_mask16(get16s(a, 2) >= get16s(b, 2)), cmp_mask16(get16s(a, 3) >= get16s(b, 3)));
  }

  export function ge_u(a: u64, b: u64): u64 {
    return pack4(cmp_mask16(get16u(a, 0) >= get16u(b, 0)), cmp_mask16(get16u(a, 1) >= get16u(b, 1)), cmp_mask16(get16u(a, 2) >= get16u(b, 2)), cmp_mask16(get16u(a, 3) >= get16u(b, 3)));
  }

  export function narrow_i32x2_s(a: u64, b: u64): u64 {
    return pack4(
      sat_i32_to_i16_s(get32s(a, 0)) as u16,
      sat_i32_to_i16_s(get32s(a, 1)) as u16,
      sat_i32_to_i16_s(get32s(b, 0)) as u16,
      sat_i32_to_i16_s(get32s(b, 1)) as u16,
    );
  }

  export function narrow_i32x2_u(a: u64, b: u64): u64 {
    return pack4(
      sat_i32_to_i16_u(get32s(a, 0)),
      sat_i32_to_i16_u(get32s(a, 1)),
      sat_i32_to_i16_u(get32s(b, 0)),
      sat_i32_to_i16_u(get32s(b, 1)),
    );
  }

  export function extend_low_i8x8_s(a: u64): u64 {
    return pack4(get8s(a, 0) as u16, get8s(a, 1) as u16, get8s(a, 2) as u16, get8s(a, 3) as u16);
  }

  export function extend_low_i8x8_u(a: u64): u64 {
    return pack4(get8u(a, 0), get8u(a, 1), get8u(a, 2), get8u(a, 3));
  }

  export function extend_high_i8x8_s(a: u64): u64 {
    return pack4(get8s(a, 4) as u16, get8s(a, 5) as u16, get8s(a, 6) as u16, get8s(a, 7) as u16);
  }

  export function extend_high_i8x8_u(a: u64): u64 {
    return pack4(get8u(a, 4), get8u(a, 5), get8u(a, 6), get8u(a, 7));
  }

  export function extadd_pairwise_i8x8_s(a: u64): u64 {
    return pack4(
      (get8s(a, 0) + get8s(a, 1)) as u16,
      (get8s(a, 2) + get8s(a, 3)) as u16,
      (get8s(a, 4) + get8s(a, 5)) as u16,
      (get8s(a, 6) + get8s(a, 7)) as u16,
    );
  }

  export function extadd_pairwise_i8x8_u(a: u64): u64 {
    return pack4(
      (get8u(a, 0) + get8u(a, 1)) as u16,
      (get8u(a, 2) + get8u(a, 3)) as u16,
      (get8u(a, 4) + get8u(a, 5)) as u16,
      (get8u(a, 6) + get8u(a, 7)) as u16,
    );
  }

  export function q15mulr_sat_s(a: u64, b: u64): u64 {
    return pack4(
      sat_i32_to_i16_s((((get16s(a, 0) as i32) * (get16s(b, 0) as i32)) + 0x4000) >> 15) as u16,
      sat_i32_to_i16_s((((get16s(a, 1) as i32) * (get16s(b, 1) as i32)) + 0x4000) >> 15) as u16,
      sat_i32_to_i16_s((((get16s(a, 2) as i32) * (get16s(b, 2) as i32)) + 0x4000) >> 15) as u16,
      sat_i32_to_i16_s((((get16s(a, 3) as i32) * (get16s(b, 3) as i32)) + 0x4000) >> 15) as u16,
    );
  }

  export function extmul_low_i8x8_s(a: u64, b: u64): u64 {
    return pack4(
      (get8s(a, 0) * get8s(b, 0)) as u16,
      (get8s(a, 1) * get8s(b, 1)) as u16,
      (get8s(a, 2) * get8s(b, 2)) as u16,
      (get8s(a, 3) * get8s(b, 3)) as u16,
    );
  }

  export function extmul_low_i8x8_u(a: u64, b: u64): u64 {
    return pack4(
      (get8u(a, 0) * get8u(b, 0)) as u16,
      (get8u(a, 1) * get8u(b, 1)) as u16,
      (get8u(a, 2) * get8u(b, 2)) as u16,
      (get8u(a, 3) * get8u(b, 3)) as u16,
    );
  }

  export function extmul_high_i8x8_s(a: u64, b: u64): u64 {
    return pack4(
      (get8s(a, 4) * get8s(b, 4)) as u16,
      (get8s(a, 5) * get8s(b, 5)) as u16,
      (get8s(a, 6) * get8s(b, 6)) as u16,
      (get8s(a, 7) * get8s(b, 7)) as u16,
    );
  }

  export function extmul_high_i8x8_u(a: u64, b: u64): u64 {
    return pack4(
      (get8u(a, 4) * get8u(b, 4)) as u16,
      (get8u(a, 5) * get8u(b, 5)) as u16,
      (get8u(a, 6) * get8u(b, 6)) as u16,
      (get8u(a, 7) * get8u(b, 7)) as u16,
    );
  }

  export function shuffle(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8): u64 {
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

  export function relaxed_laneselect(a: u64, b: u64, m: u64): u64 {
    return pack4(
      (get16u(m, 0) & 0x8000) != 0 ? get16u(a, 0) : get16u(b, 0),
      (get16u(m, 1) & 0x8000) != 0 ? get16u(a, 1) : get16u(b, 1),
      (get16u(m, 2) & 0x8000) != 0 ? get16u(a, 2) : get16u(b, 2),
      (get16u(m, 3) & 0x8000) != 0 ? get16u(a, 3) : get16u(b, 3),
    );
  }

  export function relaxed_q15mulr_s(a: u64, b: u64): u64 {
    return q15mulr_sat_s(a, b);
  }

  export function relaxed_dot_i8x8_i7x8_s(a: u64, b: u64): u64 {
    return pack4(
      ((get8s(a, 0) as i16) * (get8s(b, 0) as i16) + (get8s(a, 1) as i16) * (get8s(b, 1) as i16)) as u16,
      ((get8s(a, 2) as i16) * (get8s(b, 2) as i16) + (get8s(a, 3) as i16) * (get8s(b, 3) as i16)) as u16,
      ((get8s(a, 4) as i16) * (get8s(b, 4) as i16) + (get8s(a, 5) as i16) * (get8s(b, 5) as i16)) as u16,
      ((get8s(a, 6) as i16) * (get8s(b, 6) as i16) + (get8s(a, 7) as i16) * (get8s(b, 7) as i16)) as u16,
    );
  }
}

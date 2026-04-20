export namespace i32x2_scalar {
  // @ts-expect-error: decorator
  @inline function get8s(x: u64, i: i32): i8 { return ((x >> (i * 8)) & 0xff) as i8; }
  // @ts-expect-error: decorator
  @inline function get16s(x: u64, i: i32): i16 { return ((x >> (i * 16)) & 0xffff) as i16; }
  // @ts-expect-error: decorator
  @inline function get16u(x: u64, i: i32): u16 { return ((x >> (i * 16)) & 0xffff) as u16; }
  // @ts-expect-error: decorator
  @inline function get32s(x: u64, i: i32): i32 { return ((x >> (i * 32)) & 0xffffffff) as i32; }
  // @ts-expect-error: decorator
  @inline function get32u(x: u64, i: i32): u32 { return ((x >> (i * 32)) & 0xffffffff) as u32; }
  // @ts-expect-error: decorator
  @inline function pack2(a0: u32, a1: u32): u64 { return (a0 as u64) | ((a1 as u64) << 32); }
  // @ts-expect-error: decorator
  @inline function cmp_mask32(pred: bool): u32 { return pred ? 0xffffffff : 0; }

  // @ts-expect-error: decorator
  @inline export function splat(x: i32): u64 { return ((x as u64) & 0xffffffff) * 0x0000000100000001; }
  // @ts-expect-error: decorator
  @inline export function extract_lane(x: u64, idx: u8): i32 { return ((x >> ((idx & 1) * 32)) & 0xffffffff) as i32; }
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: u64, idx: u8, value: i32): u64 {
    const shift = (idx & 1) * 32;
    const mask = (0xffffffff as u64) << shift;
    return (x & ~mask) | (((value as u64) & 0xffffffff) << shift);
  }

  export function add(a: u64, b: u64): u64 {
    return ((a & ~0x8000000080000000) + (b & ~0x8000000080000000)) ^ ((a ^ b) & 0x8000000080000000);
  }
  export function sub(a: u64, b: u64): u64 {
    return ((a | 0x8000000080000000) - (b & ~0x8000000080000000)) ^ ((a ^ ~b) & 0x8000000080000000);
  }
  export function mul(a: u64, b: u64): u64 {
    return pack2((((a & 0xffffffff) * (b & 0xffffffff)) & 0xffffffff) as u32, ((((a >> 32) & 0xffffffff) * ((b >> 32) & 0xffffffff)) & 0xffffffff) as u32);
  }
  export function min_s(a: u64, b: u64): u64 { return pack2((get32s(a, 0) < get32s(b, 0) ? get32s(a, 0) : get32s(b, 0)) as u32, (get32s(a, 1) < get32s(b, 1) ? get32s(a, 1) : get32s(b, 1)) as u32); }
  export function min_u(a: u64, b: u64): u64 { return pack2(get32u(a, 0) < get32u(b, 0) ? get32u(a, 0) : get32u(b, 0), get32u(a, 1) < get32u(b, 1) ? get32u(a, 1) : get32u(b, 1)); }
  export function max_s(a: u64, b: u64): u64 { return pack2((get32s(a, 0) > get32s(b, 0) ? get32s(a, 0) : get32s(b, 0)) as u32, (get32s(a, 1) > get32s(b, 1) ? get32s(a, 1) : get32s(b, 1)) as u32); }
  export function max_u(a: u64, b: u64): u64 { return pack2(get32u(a, 0) > get32u(b, 0) ? get32u(a, 0) : get32u(b, 0), get32u(a, 1) > get32u(b, 1) ? get32u(a, 1) : get32u(b, 1)); }
  export function dot_i16x4_s(a: u64, b: u64): u64 {
    return pack2(
      ((get16s(a, 0) as i32) * (get16s(b, 0) as i32) + (get16s(a, 1) as i32) * (get16s(b, 1) as i32)) as u32,
      ((get16s(a, 2) as i32) * (get16s(b, 2) as i32) + (get16s(a, 3) as i32) * (get16s(b, 3) as i32)) as u32,
    );
  }
  export function abs(a: u64): u64 { return pack2((get32s(a, 0) < 0 ? -get32s(a, 0) : get32s(a, 0)) as u32, (get32s(a, 1) < 0 ? -get32s(a, 1) : get32s(a, 1)) as u32); }
  export function neg(a: u64): u64 { return pack2((-get32s(a, 0)) as u32, (-get32s(a, 1)) as u32); }
  export function shl(a: u64, b: i32): u64 { const s = b & 31; return ((a & (((0xffffffff >>> s) as u64) * 0x0000000100000001)) << s) & 0xffffffffffffffff; }
  export function shr_s(a: u64, b: i32): u64 { const s = b & 31; return pack2((get32s(a, 0) >> s) as u32, (get32s(a, 1) >> s) as u32); }
  export function shr_u(a: u64, b: i32): u64 { const s = b & 31; return (a & (((0xffffffff << s) as u64) * 0x0000000100000001)) >> s; }
  export function all_true(a: u64): bool { return get32u(a, 0) != 0 && get32u(a, 1) != 0; }
  export function bitmask(a: u64): i32 { return ((((a >> 31) & 1) as i32) | ((((a >> 63) & 1) as i32) << 1)); }
  export function eq(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32u(a, 0) == get32u(b, 0)), cmp_mask32(get32u(a, 1) == get32u(b, 1))); }
  export function ne(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32u(a, 0) != get32u(b, 0)), cmp_mask32(get32u(a, 1) != get32u(b, 1))); }
  export function lt_s(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32s(a, 0) < get32s(b, 0)), cmp_mask32(get32s(a, 1) < get32s(b, 1))); }
  export function lt_u(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32u(a, 0) < get32u(b, 0)), cmp_mask32(get32u(a, 1) < get32u(b, 1))); }
  export function le_s(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32s(a, 0) <= get32s(b, 0)), cmp_mask32(get32s(a, 1) <= get32s(b, 1))); }
  export function le_u(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32u(a, 0) <= get32u(b, 0)), cmp_mask32(get32u(a, 1) <= get32u(b, 1))); }
  export function gt_s(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32s(a, 0) > get32s(b, 0)), cmp_mask32(get32s(a, 1) > get32s(b, 1))); }
  export function gt_u(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32u(a, 0) > get32u(b, 0)), cmp_mask32(get32u(a, 1) > get32u(b, 1))); }
  export function ge_s(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32s(a, 0) >= get32s(b, 0)), cmp_mask32(get32s(a, 1) >= get32s(b, 1))); }
  export function ge_u(a: u64, b: u64): u64 { return pack2(cmp_mask32(get32u(a, 0) >= get32u(b, 0)), cmp_mask32(get32u(a, 1) >= get32u(b, 1))); }
  export function extend_low_i16x4_s(a: u64): u64 { return pack2(get16s(a, 0) as u32, get16s(a, 1) as u32); }
  export function extend_low_i16x4_u(a: u64): u64 { return pack2(get16u(a, 0), get16u(a, 1)); }
  export function extend_high_i16x4_s(a: u64): u64 { return pack2(get16s(a, 2) as u32, get16s(a, 3) as u32); }
  export function extend_high_i16x4_u(a: u64): u64 { return pack2(get16u(a, 2), get16u(a, 3)); }
  export function extadd_pairwise_i16x4_s(a: u64): u64 { return pack2((get16s(a, 0) + get16s(a, 1)) as u32, (get16s(a, 2) + get16s(a, 3)) as u32); }
  export function extadd_pairwise_i16x4_u(a: u64): u64 { return pack2((get16u(a, 0) + get16u(a, 1)) as u32, (get16u(a, 2) + get16u(a, 3)) as u32); }
  export function extmul_low_i16x4_s(a: u64, b: u64): u64 { return pack2((get16s(a, 0) * get16s(b, 0)) as u32, (get16s(a, 1) * get16s(b, 1)) as u32); }
  export function extmul_low_i16x4_u(a: u64, b: u64): u64 { return pack2((get16u(a, 0) * get16u(b, 0)) as u32, (get16u(a, 1) * get16u(b, 1)) as u32); }
  export function extmul_high_i16x4_s(a: u64, b: u64): u64 { return pack2((get16s(a, 2) * get16s(b, 2)) as u32, (get16s(a, 3) * get16s(b, 3)) as u32); }
  export function extmul_high_i16x4_u(a: u64, b: u64): u64 { return pack2((get16u(a, 2) * get16u(b, 2)) as u32, (get16u(a, 3) * get16u(b, 3)) as u32); }
  export function shuffle(a: u64, b: u64, l0: u8, l1: u8): u64 {
    const i0 = l0 & 1, i1 = l1 & 1;
    return pack2(l0 < 2 ? get32u(a, i0) : get32u(b, i0), l1 < 2 ? get32u(a, i1) : get32u(b, i1));
  }
  export function relaxed_laneselect(a: u64, b: u64, m: u64): u64 {
    return pack2((get32u(m, 0) & 0x80000000) != 0 ? get32u(a, 0) : get32u(b, 0), (get32u(m, 1) & 0x80000000) != 0 ? get32u(a, 1) : get32u(b, 1));
  }
}

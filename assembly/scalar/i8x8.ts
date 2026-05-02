export namespace i8x8_scalar {
  // @ts-expect-error: decorator
  @inline function get8(x: u64, i: i32): u8 {
    return <u8>((x >> (i * 8)) & 0xff);
  }

  // @ts-expect-error: decorator
  @inline function get8s(x: u64, i: i32): i8 {
    return <i8>get8(x, i);
  }

  // @ts-expect-error: decorator
  @inline function get16s(x: u64, i: i32): i16 {
    return <i16>((x >> (i * 16)) & 0xffff);
  }

  // @ts-expect-error: decorator
  @inline function set8(x: u64, i: i32, v: u8): u64 {
    const shift = i * 8;
    const mask = (<u64>0xff) << shift;
    return (x & ~mask) | ((<u64>v) << shift);
  }

  // @ts-expect-error: decorator
  @inline function pack8(
    a0: u8, a1: u8, a2: u8, a3: u8,
    a4: u8, a5: u8, a6: u8, a7: u8,
  ): u64 {
    return (<u64>a0)
      | (<u64>a1 << 8)
      | (<u64>a2 << 16)
      | (<u64>a3 << 24)
      | (<u64>a4 << 32)
      | (<u64>a5 << 40)
      | (<u64>a6 << 48)
      | (<u64>a7 << 56);
  }

  // @ts-expect-error: decorator
  @inline function satS(x: i16): i8 {
    return x > 127 ? 127 : (x < -128 ? -128 : <i8>x);
  }

  // @ts-expect-error: decorator
  @inline function satU(x: i16): u8 {
    return x < 0 ? 0 : (x > 255 ? 255 : <u8>x);
  }

  // @ts-expect-error: decorator
  @inline function pop8(x: u8): u8 {
    let c: u8 = 0;
    let v = x;
    while (v) {
      c += v & 1;
      v >>= 1;
    }
    return c;
  }

  // @ts-expect-error: decorator
  @inline function cmp_mask(pred: bool): u8 {
    return pred ? 0xff : 0;
  }

  // @ts-expect-error: decorator
  @inline export function splat(x: i8): u64 {
    const u = <u8>x;
    return pack8(u, u, u, u, u, u, u, u);
  }

  // @ts-expect-error: decorator
  @inline export function extract_lane_s(x: u64, idx: u8): i8 {
    return get8s(x, <i32>(idx & 7));
  }

  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: u64, idx: u8): u8 {
    return get8(x, <i32>(idx & 7));
  }

  // @ts-expect-error: decorator
  @inline export function replace_lane(x: u64, idx: u8, value: i8): u64 {
    return set8(x, <i32>(idx & 7), <u8>value);
  }

  export function add(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(get8(a, i) + get8(b, i)));
    return out;
  }

  export function sub(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(get8(a, i) - get8(b, i)));
    return out;
  }

  export function mul(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(get8(a, i) * get8(b, i)));
    return out;
  }

  export function min_s(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(get8s(a, i) < get8s(b, i) ? get8s(a, i) : get8s(b, i)));
    return out;
  }

  export function min_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, get8(a, i) < get8(b, i) ? get8(a, i) : get8(b, i));
    return out;
  }

  export function max_s(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(get8s(a, i) > get8s(b, i) ? get8s(a, i) : get8s(b, i)));
    return out;
  }

  export function max_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, get8(a, i) > get8(b, i) ? get8(a, i) : get8(b, i));
    return out;
  }

  export function avgr_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) {
      const ai = <u16>get8(a, i);
      const bi = <u16>get8(b, i);
      out = set8(out, i, <u8>((ai + bi + 1) >> 1));
    }
    return out;
  }

  export function abs(a: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) {
      const ai = get8s(a, i);
      out = set8(out, i, <u8>(ai < 0 ? -ai : ai));
    }
    return out;
  }

  export function neg(a: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(-get8s(a, i)));
    return out;
  }

  export function add_sat_s(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>satS(<i16>get8s(a, i) + <i16>get8s(b, i)));
    return out;
  }

  export function add_sat_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, satU(<i16>get8(a, i) + <i16>get8(b, i)));
    return out;
  }

  export function sub_sat_s(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>satS(<i16>get8s(a, i) - <i16>get8s(b, i)));
    return out;
  }

  export function sub_sat_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) {
      const ai = get8(a, i);
      const bi = get8(b, i);
      out = set8(out, i, ai >= bi ? <u8>(ai - bi) : 0);
    }
    return out;
  }

  export function shl(a: u64, b: i32): u64 {
    const s = b & 7;
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(<u32>get8(a, i) << <u32>s));
    return out;
  }

  export function shr_s(a: u64, b: i32): u64 {
    const s = b & 7;
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(<i32>get8s(a, i) >> s));
    return out;
  }

  export function shr_u(a: u64, b: i32): u64 {
    const s = b & 7;
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(<u32>get8(a, i) >> <u32>s));
    return out;
  }

  export function all_true(a: u64): bool {
    for (let i = 0; i < 8; i++) if (get8(a, i) == 0) return false;
    return true;
  }

  export function bitmask(a: u64): i32 {
    let m: i32 = 0;
    for (let i = 0; i < 8; i++) m |= (<i32>((get8(a, i) >> 7) & 1)) << i;
    return m;
  }

  export function bitmask_lane(a: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, get8(a, i) != 0 ? 0x80 : 0);
    return out;
  }

  export function popcnt(a: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, pop8(get8(a, i)));
    return out;
  }

  export function eq(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8(a, i) == get8(b, i)));
    return out;
  }

  export function ne(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8(a, i) != get8(b, i)));
    return out;
  }

  export function lt_s(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8s(a, i) < get8s(b, i)));
    return out;
  }

  export function lt_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8(a, i) < get8(b, i)));
    return out;
  }

  export function le_s(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8s(a, i) <= get8s(b, i)));
    return out;
  }

  export function le_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8(a, i) <= get8(b, i)));
    return out;
  }

  export function gt_s(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8s(a, i) > get8s(b, i)));
    return out;
  }

  export function gt_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8(a, i) > get8(b, i)));
    return out;
  }

  export function ge_s(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8s(a, i) >= get8s(b, i)));
    return out;
  }

  export function ge_u(a: u64, b: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, cmp_mask(get8(a, i) >= get8(b, i)));
    return out;
  }

  export function narrow_i16x4_s(a: u64, b: u64): u64 {
    return pack8(
      <u8>satS(get16s(a, 0)),
      <u8>satS(get16s(a, 1)),
      <u8>satS(get16s(a, 2)),
      <u8>satS(get16s(a, 3)),
      <u8>satS(get16s(b, 0)),
      <u8>satS(get16s(b, 1)),
      <u8>satS(get16s(b, 2)),
      <u8>satS(get16s(b, 3)),
    );
  }

  export function narrow_i16x4_u(a: u64, b: u64): u64 {
    return pack8(
      satU(get16s(a, 0)),
      satU(get16s(a, 1)),
      satU(get16s(a, 2)),
      satU(get16s(a, 3)),
      satU(get16s(b, 0)),
      satU(get16s(b, 1)),
      satU(get16s(b, 2)),
      satU(get16s(b, 3)),
    );
  }

  export function shuffle(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
    const lanes = [l0, l1, l2, l3, l4, l5, l6, l7];
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) {
      const l = lanes[i] & 15;
      const src = l < 8 ? a : b;
      out = set8(out, i, get8(src, <i32>(l & 7)));
    }
    return out;
  }

  export function swizzle(a: u64, s: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) {
      const idx = get8(s, i);
      out = set8(out, i, idx < 8 ? get8(a, <i32>idx) : 0);
    }
    return out;
  }

  export function relaxed_swizzle(a: u64, s: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, get8(a, <i32>(get8(s, i) & 7)));
    return out;
  }

  export function relaxed_laneselect(a: u64, b: u64, m: u64): u64 {
    let out: u64 = 0;
    for (let i = 0; i < 8; i++) out = set8(out, i, (get8(m, i) & 0x80) != 0 ? get8(a, i) : get8(b, i));
    return out;
  }
}

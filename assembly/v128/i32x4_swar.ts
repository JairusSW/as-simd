let __as_simd_i32x4_hi: u64 = 0;

export function i32x4_swar(a: i32, b: i32, c: i32, d: i32): u64 {
  const lo = (a as u32 as u64) | ((b as u32 as u64) << 32);
  const hi = (c as u32 as u64) | ((d as u32 as u64) << 32);
  __as_simd_i32x4_hi = hi;
  return lo;
}

export namespace i32x4_swar {
  // @ts-expect-error: decorator
  @inline export function pack2(a: i32, b: i32): u64 { return (a as u32 as u64) | ((b as u32 as u64) << 32); }
  // @ts-expect-error: decorator
  @inline export function unpack_lo(x: u64): i32 { return (x as u32) as i32; }
  // @ts-expect-error: decorator
  @inline export function unpack_hi(x: u64): i32 { return ((x >> 32) as u32) as i32; }
  // @ts-expect-error: decorator
  @inline export function take_hi(): u64 { return __as_simd_i32x4_hi; }
  // @ts-expect-error: decorator
  @inline function set_pair(lo: u64, hi: u64): u64 {
    __as_simd_i32x4_hi = hi;
    return lo;
  }
  // @ts-expect-error: decorator
  @inline function lane(xLo: u64, xHi: u64, idx: i32): i32 {
    switch (idx & 3) {
      case 0: return unpack_lo(xLo);
      case 1: return unpack_hi(xLo);
      case 2: return unpack_lo(xHi);
      default: return unpack_hi(xHi);
    }
  }
  // @ts-expect-error: decorator
  @inline function rep(xLo: u64, xHi: u64, idx: i32, value: i32): u64 {
    switch (idx & 3) {
      case 0: return set_pair(pack2(value, unpack_hi(xLo)), xHi);
      case 1: return set_pair(pack2(unpack_lo(xLo), value), xHi);
      case 2: return set_pair(xLo, pack2(value, unpack_hi(xHi)));
      default: return set_pair(xLo, pack2(unpack_lo(xHi), value));
    }
  }
  // @ts-expect-error: decorator
  @inline function mask(pred: bool): i32 { return pred ? -1 : 0; }
  // @ts-expect-error: decorator
  @inline function i16_lane_s(xLo: u64, xHi: u64, idx: i32): i16 {
    const v = idx < 4 ? xLo : xHi;
    const s = ((idx & 3) << 4) as u64;
    return ((v >> s) as u16) as i16;
  }
  // @ts-expect-error: decorator
  @inline function i16_lane_u(xLo: u64, xHi: u64, idx: i32): u16 {
    const v = idx < 4 ? xLo : xHi;
    const s = ((idx & 3) << 4) as u64;
    return ((v >> s) as u16);
  }

  // @ts-expect-error: decorator
  @inline export function splat(x: i32): u64 { const p = pack2(x, x); return set_pair(p, p); }
  // @ts-expect-error: decorator
  @inline export function extract_lane(lo: u64, hi: u64, idx: u8): i32 { return lane(lo, hi, idx); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(lo: u64, hi: u64, idx: u8, value: i32): u64 { return rep(lo, hi, idx, value); }
  // @ts-expect-error: decorator
  @inline export function load_lo(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 {
    const lo = pack2(load<i32>(ptr, immOffset, immAlign), load<i32>(ptr, immOffset + 4, immAlign));
    __as_simd_i32x4_hi = pack2(load<i32>(ptr, immOffset + 8, immAlign), load<i32>(ptr, immOffset + 12, immAlign));
    return lo;
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i32 = 0): u64 {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(4, nn, nn > 4);
    const f = pack2(fill, fill);
    if (n <= 0) return set_pair(f, f);
    if (n == 1) return set_pair(pack2(load<i32>(ptr, immOffset, immAlign), fill), f);
    if (n == 2) return set_pair(pack2(load<i32>(ptr, immOffset, immAlign), load<i32>(ptr, immOffset + 4, immAlign)), f);
    if (n == 3) return set_pair(pack2(load<i32>(ptr, immOffset, immAlign), load<i32>(ptr, immOffset + 4, immAlign)), pack2(load<i32>(ptr, immOffset + 8, immAlign), fill));
    return set_pair(pack2(load<i32>(ptr, immOffset, immAlign), load<i32>(ptr, immOffset + 4, immAlign)), pack2(load<i32>(ptr, immOffset + 8, immAlign), load<i32>(ptr, immOffset + 12, immAlign)));
  }
  // @ts-expect-error: decorator
  @inline export function store_pair(ptr: usize, lo: u64, hi: u64, immOffset: usize = 0, immAlign: usize = 1): void {
    store<u64>(ptr, lo, immOffset, immAlign);
    store<u64>(ptr, hi, immOffset + 8, immAlign);
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, lo: u64, hi: u64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(4, nn, nn > 4);
    if (n <= 0) return;
    store<i32>(ptr, unpack_lo(lo), immOffset, immAlign);
    if (n > 1) store<i32>(ptr, unpack_hi(lo), immOffset + 4, immAlign);
    if (n > 2) store<i32>(ptr, unpack_lo(hi), immOffset + 8, immAlign);
    if (n > 3) store<i32>(ptr, unpack_hi(hi), immOffset + 12, immAlign);
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane_pair(lo: u64, hi: u64, idx: u8): i32 { return extract_lane(lo, hi, idx); }

  // @ts-expect-error: decorator
  @inline export function add(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(unpack_lo(aLo) + unpack_lo(bLo), unpack_hi(aLo) + unpack_hi(bLo)), pack2(unpack_lo(aHi) + unpack_lo(bHi), unpack_hi(aHi) + unpack_hi(bHi))); }
  // @ts-expect-error: decorator
  @inline export function sub(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(unpack_lo(aLo) - unpack_lo(bLo), unpack_hi(aLo) - unpack_hi(bLo)), pack2(unpack_lo(aHi) - unpack_lo(bHi), unpack_hi(aHi) - unpack_hi(bHi))); }
  // @ts-expect-error: decorator
  @inline export function mul(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(unpack_lo(aLo) * unpack_lo(bLo), unpack_hi(aLo) * unpack_hi(bLo)), pack2(unpack_lo(aHi) * unpack_lo(bHi), unpack_hi(aHi) * unpack_hi(bHi))); }
  // @ts-expect-error: decorator
  @inline export function min_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(min<i32>(unpack_lo(aLo), unpack_lo(bLo)), min<i32>(unpack_hi(aLo), unpack_hi(bLo))), pack2(min<i32>(unpack_lo(aHi), unpack_lo(bHi)), min<i32>(unpack_hi(aHi), unpack_hi(bHi)))); }
  // @ts-expect-error: decorator
  @inline export function min_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const l0 = (unpack_lo(aLo) as u32) < (unpack_lo(bLo) as u32) ? unpack_lo(aLo) : unpack_lo(bLo);
    const l1 = (unpack_hi(aLo) as u32) < (unpack_hi(bLo) as u32) ? unpack_hi(aLo) : unpack_hi(bLo);
    const h0 = (unpack_lo(aHi) as u32) < (unpack_lo(bHi) as u32) ? unpack_lo(aHi) : unpack_lo(bHi);
    const h1 = (unpack_hi(aHi) as u32) < (unpack_hi(bHi) as u32) ? unpack_hi(aHi) : unpack_hi(bHi);
    return set_pair(pack2(l0, l1), pack2(h0, h1));
  }
  // @ts-expect-error: decorator
  @inline export function max_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(max<i32>(unpack_lo(aLo), unpack_lo(bLo)), max<i32>(unpack_hi(aLo), unpack_hi(bLo))), pack2(max<i32>(unpack_lo(aHi), unpack_lo(bHi)), max<i32>(unpack_hi(aHi), unpack_hi(bHi)))); }
  // @ts-expect-error: decorator
  @inline export function max_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const l0 = (unpack_lo(aLo) as u32) > (unpack_lo(bLo) as u32) ? unpack_lo(aLo) : unpack_lo(bLo);
    const l1 = (unpack_hi(aLo) as u32) > (unpack_hi(bLo) as u32) ? unpack_hi(aLo) : unpack_hi(bLo);
    const h0 = (unpack_lo(aHi) as u32) > (unpack_lo(bHi) as u32) ? unpack_lo(aHi) : unpack_lo(bHi);
    const h1 = (unpack_hi(aHi) as u32) > (unpack_hi(bHi) as u32) ? unpack_hi(aHi) : unpack_hi(bHi);
    return set_pair(pack2(l0, l1), pack2(h0, h1));
  }
  // @ts-expect-error: decorator
  @inline export function dot_i16x8_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const r0 = i16_lane_s(aLo, aHi, 0) as i32 * i16_lane_s(bLo, bHi, 0) as i32 + i16_lane_s(aLo, aHi, 1) as i32 * i16_lane_s(bLo, bHi, 1) as i32;
    const r1 = i16_lane_s(aLo, aHi, 2) as i32 * i16_lane_s(bLo, bHi, 2) as i32 + i16_lane_s(aLo, aHi, 3) as i32 * i16_lane_s(bLo, bHi, 3) as i32;
    const r2 = i16_lane_s(aLo, aHi, 4) as i32 * i16_lane_s(bLo, bHi, 4) as i32 + i16_lane_s(aLo, aHi, 5) as i32 * i16_lane_s(bLo, bHi, 5) as i32;
    const r3 = i16_lane_s(aLo, aHi, 6) as i32 * i16_lane_s(bLo, bHi, 6) as i32 + i16_lane_s(aLo, aHi, 7) as i32 * i16_lane_s(bLo, bHi, 7) as i32;
    return set_pair(pack2(r0, r1), pack2(r2, r3));
  }
  // @ts-expect-error: decorator
  @inline export function abs(aLo: u64, aHi: u64): u64 {
    const l0 = abs<i32>(unpack_lo(aLo)), l1 = abs<i32>(unpack_hi(aLo));
    const h0 = abs<i32>(unpack_lo(aHi)), h1 = abs<i32>(unpack_hi(aHi));
    return set_pair(pack2(l0, l1), pack2(h0, h1));
  }
  // @ts-expect-error: decorator
  @inline export function neg(aLo: u64, aHi: u64): u64 { return set_pair(pack2(-unpack_lo(aLo), -unpack_hi(aLo)), pack2(-unpack_lo(aHi), -unpack_hi(aHi))); }
  // @ts-expect-error: decorator
  @inline export function shl(aLo: u64, aHi: u64, b: i32): u64 { const s = b & 31; return set_pair(pack2(unpack_lo(aLo) << s, unpack_hi(aLo) << s), pack2(unpack_lo(aHi) << s, unpack_hi(aHi) << s)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(aLo: u64, aHi: u64, b: i32): u64 { const s = b & 31; return set_pair(pack2(unpack_lo(aLo) >> s, unpack_hi(aLo) >> s), pack2(unpack_lo(aHi) >> s, unpack_hi(aHi) >> s)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(aLo: u64, aHi: u64, b: i32): u64 {
    const s = b & 31;
    return set_pair(pack2(((unpack_lo(aLo) as u32) >> s) as i32, ((unpack_hi(aLo) as u32) >> s) as i32), pack2(((unpack_lo(aHi) as u32) >> s) as i32, ((unpack_hi(aHi) as u32) >> s) as i32));
  }
  // @ts-expect-error: decorator
  @inline export function all_true(aLo: u64, aHi: u64): bool { return unpack_lo(aLo) != 0 && unpack_hi(aLo) != 0 && unpack_lo(aHi) != 0 && unpack_hi(aHi) != 0; }
  // @ts-expect-error: decorator
  @inline export function bitmask(aLo: u64, aHi: u64): i32 {
    let m = 0;
    if (unpack_lo(aLo) < 0) m |= 1;
    if (unpack_hi(aLo) < 0) m |= 2;
    if (unpack_lo(aHi) < 0) m |= 4;
    if (unpack_hi(aHi) < 0) m |= 8;
    return m;
  }
  // @ts-expect-error: decorator
  @inline export function eq(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(mask(unpack_lo(aLo) == unpack_lo(bLo)), mask(unpack_hi(aLo) == unpack_hi(bLo))), pack2(mask(unpack_lo(aHi) == unpack_lo(bHi)), mask(unpack_hi(aHi) == unpack_hi(bHi)))); }
  // @ts-expect-error: decorator
  @inline export function ne(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(mask(unpack_lo(aLo) != unpack_lo(bLo)), mask(unpack_hi(aLo) != unpack_hi(bLo))), pack2(mask(unpack_lo(aHi) != unpack_lo(bHi)), mask(unpack_hi(aHi) != unpack_hi(bHi)))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(mask(unpack_lo(aLo) < unpack_lo(bLo)), mask(unpack_hi(aLo) < unpack_hi(bLo))), pack2(mask(unpack_lo(aHi) < unpack_lo(bHi)), mask(unpack_hi(aHi) < unpack_hi(bHi)))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const l0 = mask((unpack_lo(aLo) as u32) < (unpack_lo(bLo) as u32));
    const l1 = mask((unpack_hi(aLo) as u32) < (unpack_hi(bLo) as u32));
    const h0 = mask((unpack_lo(aHi) as u32) < (unpack_lo(bHi) as u32));
    const h1 = mask((unpack_hi(aHi) as u32) < (unpack_hi(bHi) as u32));
    return set_pair(pack2(l0, l1), pack2(h0, h1));
  }
  // @ts-expect-error: decorator
  @inline export function le_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(mask(unpack_lo(aLo) <= unpack_lo(bLo)), mask(unpack_hi(aLo) <= unpack_hi(bLo))), pack2(mask(unpack_lo(aHi) <= unpack_lo(bHi)), mask(unpack_hi(aHi) <= unpack_hi(bHi)))); }
  // @ts-expect-error: decorator
  @inline export function le_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const l0 = mask((unpack_lo(aLo) as u32) <= (unpack_lo(bLo) as u32));
    const l1 = mask((unpack_hi(aLo) as u32) <= (unpack_hi(bLo) as u32));
    const h0 = mask((unpack_lo(aHi) as u32) <= (unpack_lo(bHi) as u32));
    const h1 = mask((unpack_hi(aHi) as u32) <= (unpack_hi(bHi) as u32));
    return set_pair(pack2(l0, l1), pack2(h0, h1));
  }
  // @ts-expect-error: decorator
  @inline export function gt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(mask(unpack_lo(aLo) > unpack_lo(bLo)), mask(unpack_hi(aLo) > unpack_hi(bLo))), pack2(mask(unpack_lo(aHi) > unpack_lo(bHi)), mask(unpack_hi(aHi) > unpack_hi(bHi)))); }
  // @ts-expect-error: decorator
  @inline export function gt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const l0 = mask((unpack_lo(aLo) as u32) > (unpack_lo(bLo) as u32));
    const l1 = mask((unpack_hi(aLo) as u32) > (unpack_hi(bLo) as u32));
    const h0 = mask((unpack_lo(aHi) as u32) > (unpack_lo(bHi) as u32));
    const h1 = mask((unpack_hi(aHi) as u32) > (unpack_hi(bHi) as u32));
    return set_pair(pack2(l0, l1), pack2(h0, h1));
  }
  // @ts-expect-error: decorator
  @inline export function ge_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack2(mask(unpack_lo(aLo) >= unpack_lo(bLo)), mask(unpack_hi(aLo) >= unpack_hi(bLo))), pack2(mask(unpack_lo(aHi) >= unpack_lo(bHi)), mask(unpack_hi(aHi) >= unpack_hi(bHi)))); }
  // @ts-expect-error: decorator
  @inline export function ge_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const l0 = mask((unpack_lo(aLo) as u32) >= (unpack_lo(bLo) as u32));
    const l1 = mask((unpack_hi(aLo) as u32) >= (unpack_hi(bLo) as u32));
    const h0 = mask((unpack_lo(aHi) as u32) >= (unpack_lo(bHi) as u32));
    const h1 = mask((unpack_hi(aHi) as u32) >= (unpack_hi(bHi) as u32));
    return set_pair(pack2(l0, l1), pack2(h0, h1));
  }

  // @ts-expect-error: decorator
  @inline export function extend_low_i16x8_s(aLo: u64, aHi: u64): u64 {
    return set_pair(pack2(i16_lane_s(aLo, aHi, 0), i16_lane_s(aLo, aHi, 1)), pack2(i16_lane_s(aLo, aHi, 2), i16_lane_s(aLo, aHi, 3)));
  }
  // @ts-expect-error: decorator
  @inline export function extend_low_i16x8_u(aLo: u64, aHi: u64): u64 {
    return set_pair(pack2(i16_lane_u(aLo, aHi, 0), i16_lane_u(aLo, aHi, 1)), pack2(i16_lane_u(aLo, aHi, 2), i16_lane_u(aLo, aHi, 3)));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i16x8_s(aLo: u64, aHi: u64): u64 {
    return set_pair(pack2(i16_lane_s(aLo, aHi, 4), i16_lane_s(aLo, aHi, 5)), pack2(i16_lane_s(aLo, aHi, 6), i16_lane_s(aLo, aHi, 7)));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i16x8_u(aLo: u64, aHi: u64): u64 {
    return set_pair(pack2(i16_lane_u(aLo, aHi, 4), i16_lane_u(aLo, aHi, 5)), pack2(i16_lane_u(aLo, aHi, 6), i16_lane_u(aLo, aHi, 7)));
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i16x8_s(aLo: u64, aHi: u64): u64 {
    return set_pair(
      pack2(i16_lane_s(aLo, aHi, 0) as i32 + i16_lane_s(aLo, aHi, 1) as i32, i16_lane_s(aLo, aHi, 2) as i32 + i16_lane_s(aLo, aHi, 3) as i32),
      pack2(i16_lane_s(aLo, aHi, 4) as i32 + i16_lane_s(aLo, aHi, 5) as i32, i16_lane_s(aLo, aHi, 6) as i32 + i16_lane_s(aLo, aHi, 7) as i32),
    );
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i16x8_u(aLo: u64, aHi: u64): u64 {
    return set_pair(
      pack2(i16_lane_u(aLo, aHi, 0) as i32 + i16_lane_u(aLo, aHi, 1) as i32, i16_lane_u(aLo, aHi, 2) as i32 + i16_lane_u(aLo, aHi, 3) as i32),
      pack2(i16_lane_u(aLo, aHi, 4) as i32 + i16_lane_u(aLo, aHi, 5) as i32, i16_lane_u(aLo, aHi, 6) as i32 + i16_lane_u(aLo, aHi, 7) as i32),
    );
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i16x8_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      pack2(i16_lane_s(aLo, aHi, 0) as i32 * i16_lane_s(bLo, bHi, 0) as i32, i16_lane_s(aLo, aHi, 1) as i32 * i16_lane_s(bLo, bHi, 1) as i32),
      pack2(i16_lane_s(aLo, aHi, 2) as i32 * i16_lane_s(bLo, bHi, 2) as i32, i16_lane_s(aLo, aHi, 3) as i32 * i16_lane_s(bLo, bHi, 3) as i32),
    );
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i16x8_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      pack2(i16_lane_u(aLo, aHi, 0) as i32 * i16_lane_u(bLo, bHi, 0) as i32, i16_lane_u(aLo, aHi, 1) as i32 * i16_lane_u(bLo, bHi, 1) as i32),
      pack2(i16_lane_u(aLo, aHi, 2) as i32 * i16_lane_u(bLo, bHi, 2) as i32, i16_lane_u(aLo, aHi, 3) as i32 * i16_lane_u(bLo, bHi, 3) as i32),
    );
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i16x8_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      pack2(i16_lane_s(aLo, aHi, 4) as i32 * i16_lane_s(bLo, bHi, 4) as i32, i16_lane_s(aLo, aHi, 5) as i32 * i16_lane_s(bLo, bHi, 5) as i32),
      pack2(i16_lane_s(aLo, aHi, 6) as i32 * i16_lane_s(bLo, bHi, 6) as i32, i16_lane_s(aLo, aHi, 7) as i32 * i16_lane_s(bLo, bHi, 7) as i32),
    );
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i16x8_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      pack2(i16_lane_u(aLo, aHi, 4) as i32 * i16_lane_u(bLo, bHi, 4) as i32, i16_lane_u(aLo, aHi, 5) as i32 * i16_lane_u(bLo, bHi, 5) as i32),
      pack2(i16_lane_u(aLo, aHi, 6) as i32 * i16_lane_u(bLo, bHi, 6) as i32, i16_lane_u(aLo, aHi, 7) as i32 * i16_lane_u(bLo, bHi, 7) as i32),
    );
  }
  // @ts-expect-error: decorator
  @inline export function shuffle(aLo: u64, aHi: u64, bLo: u64, bHi: u64, l0: u8, l1: u8, l2: u8, l3: u8): u64 {
    const x0 = lane((l0 & 7) < 4 ? aLo : bLo, (l0 & 7) < 4 ? aHi : bHi, (l0 & 3));
    const x1 = lane((l1 & 7) < 4 ? aLo : bLo, (l1 & 7) < 4 ? aHi : bHi, (l1 & 3));
    const x2 = lane((l2 & 7) < 4 ? aLo : bLo, (l2 & 7) < 4 ? aHi : bHi, (l2 & 3));
    const x3 = lane((l3 & 7) < 4 ? aLo : bLo, (l3 & 7) < 4 ? aHi : bHi, (l3 & 3));
    return set_pair(pack2(x0, x1), pack2(x2, x3));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(aLo: u64, aHi: u64, bLo: u64, bHi: u64, mLo: u64, mHi: u64): u64 {
    const r0 = unpack_lo(mLo) < 0 ? unpack_lo(aLo) : unpack_lo(bLo);
    const r1 = unpack_hi(mLo) < 0 ? unpack_hi(aLo) : unpack_hi(bLo);
    const r2 = unpack_lo(mHi) < 0 ? unpack_lo(aHi) : unpack_lo(bHi);
    const r3 = unpack_hi(mHi) < 0 ? unpack_hi(aHi) : unpack_hi(bHi);
    return set_pair(pack2(r0, r1), pack2(r2, r3));
  }
}

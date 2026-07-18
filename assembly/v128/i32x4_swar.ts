import { i32x2 } from "../v64/i32x2";
import { i32x2_scalar } from "../scalar/i32x2";

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
  @inline export function relaxed_dot_i8x16_i7x16_add_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64, cLo: u64, cHi: u64): u64 {
    const p0 = (((aLo as u8) as i8 as i32) * ((bLo as u8) as i8 as i32)
      + ((((aLo >> 8) as u8) as i8 as i32) * (((bLo >> 8) as u8) as i8 as i32))
      + ((((aLo >> 16) as u8) as i8 as i32) * (((bLo >> 16) as u8) as i8 as i32))
      + ((((aLo >> 24) as u8) as i8 as i32) * (((bLo >> 24) as u8) as i8 as i32))
      + unpack_lo(cLo)) as i32;
    const p1 = ((((aLo >> 32) as u8) as i8 as i32) * (((bLo >> 32) as u8) as i8 as i32)
      + ((((aLo >> 40) as u8) as i8 as i32) * (((bLo >> 40) as u8) as i8 as i32))
      + ((((aLo >> 48) as u8) as i8 as i32) * (((bLo >> 48) as u8) as i8 as i32))
      + ((((aLo >> 56) as u8) as i8 as i32) * (((bLo >> 56) as u8) as i8 as i32))
      + unpack_hi(cLo)) as i32;
    const p2 = (((aHi as u8) as i8 as i32) * ((bHi as u8) as i8 as i32)
      + ((((aHi >> 8) as u8) as i8 as i32) * (((bHi >> 8) as u8) as i8 as i32))
      + ((((aHi >> 16) as u8) as i8 as i32) * (((bHi >> 16) as u8) as i8 as i32))
      + ((((aHi >> 24) as u8) as i8 as i32) * (((bHi >> 24) as u8) as i8 as i32))
      + unpack_lo(cHi)) as i32;
    const p3 = ((((aHi >> 32) as u8) as i8 as i32) * (((bHi >> 32) as u8) as i8 as i32)
      + ((((aHi >> 40) as u8) as i8 as i32) * (((bHi >> 40) as u8) as i8 as i32))
      + ((((aHi >> 48) as u8) as i8 as i32) * (((bHi >> 48) as u8) as i8 as i32))
      + ((((aHi >> 56) as u8) as i8 as i32) * (((bHi >> 56) as u8) as i8 as i32))
      + unpack_hi(cHi)) as i32;
    return set_pair(pack2(p0, p1), pack2(p2, p3));
  }
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
  @inline export function splat(x: i32): u64 { const p = i32x2.splat(x); return set_pair(p, p); }
  // @ts-expect-error: decorator
  @inline export function extract_lane(lo: u64, hi: u64, idx: u8): i32 { return lane(lo, hi, idx); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(lo: u64, hi: u64, idx: u8, value: i32): u64 {
    const i = idx & 3;
    return i < 2 ? set_pair(i32x2.replace_lane(lo, i, value), hi) : set_pair(lo, i32x2.replace_lane(hi, i - 2, value));
  }
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
  @inline export function add(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2.add(aLo, bLo), i32x2.add(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function sub(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2.sub(aLo, bLo), i32x2.sub(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function mul(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i32x2_scalar.mul(aLo, bLo), i32x2_scalar.mul(aHi, bHi));
  }
  // @ts-expect-error: decorator
  @inline export function min_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2_scalar.min_s(aLo, bLo), i32x2_scalar.min_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function min_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i32x2_scalar.min_u(aLo, bLo), i32x2_scalar.min_u(aHi, bHi));
  }
  // @ts-expect-error: decorator
  @inline export function max_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2_scalar.max_s(aLo, bLo), i32x2_scalar.max_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function max_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i32x2_scalar.max_u(aLo, bLo), i32x2_scalar.max_u(aHi, bHi));
  }
  // @ts-expect-error: decorator
  @inline export function dot_i16x8_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i32x2.dot_i16x4_s(aLo, bLo), i32x2.dot_i16x4_s(aHi, bHi));
  }
  // @ts-expect-error: decorator
  @inline export function abs(aLo: u64, aHi: u64): u64 {
    return set_pair(i32x2_scalar.abs(aLo), i32x2_scalar.abs(aHi));
  }
  // @ts-expect-error: decorator
  @inline export function neg(aLo: u64, aHi: u64): u64 { return set_pair(i32x2_scalar.neg(aLo), i32x2_scalar.neg(aHi)); }
  // @ts-expect-error: decorator
  @inline export function shl(aLo: u64, aHi: u64, b: i32): u64 { return set_pair(i32x2_scalar.shl(aLo, b), i32x2_scalar.shl(aHi, b)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(aLo: u64, aHi: u64, b: i32): u64 { return set_pair(i32x2_scalar.shr_s(aLo, b), i32x2_scalar.shr_s(aHi, b)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(aLo: u64, aHi: u64, b: i32): u64 {
    return set_pair(i32x2_scalar.shr_u(aLo, b), i32x2_scalar.shr_u(aHi, b));
  }
  // @ts-expect-error: decorator
  @inline export function all_true(aLo: u64, aHi: u64): bool { return i32x2.all_true(aLo) && i32x2.all_true(aHi); }
  // @ts-expect-error: decorator
  @inline export function any_true(aLo: u64, aHi: u64): bool { return aLo != 0 || aHi != 0; }
  // @ts-expect-error: decorator
  @inline export function bitmask(aLo: u64, aHi: u64): i32 {
    return i32x2.bitmask(aLo) | (i32x2.bitmask(aHi) << 2);
  }
  // @ts-expect-error: decorator
  @inline export function eq(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2_scalar.eq(aLo, bLo), i32x2_scalar.eq(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function ne(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2_scalar.ne(aLo, bLo), i32x2_scalar.ne(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function lt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2_scalar.lt_s(aLo, bLo), i32x2_scalar.lt_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function lt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i32x2_scalar.lt_u(aLo, bLo), i32x2_scalar.lt_u(aHi, bHi));
  }
  // @ts-expect-error: decorator
  @inline export function le_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2_scalar.le_s(aLo, bLo), i32x2_scalar.le_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function le_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i32x2_scalar.le_u(aLo, bLo), i32x2_scalar.le_u(aHi, bHi));
  }
  // @ts-expect-error: decorator
  @inline export function gt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2_scalar.gt_s(aLo, bLo), i32x2_scalar.gt_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function gt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i32x2_scalar.gt_u(aLo, bLo), i32x2_scalar.gt_u(aHi, bHi));
  }
  // @ts-expect-error: decorator
  @inline export function ge_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x2_scalar.ge_s(aLo, bLo), i32x2_scalar.ge_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function ge_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i32x2_scalar.ge_u(aLo, bLo), i32x2_scalar.ge_u(aHi, bHi));
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
    return set_pair(i32x2.relaxed_laneselect(aLo, bLo, mLo), i32x2.relaxed_laneselect(aHi, bHi, mHi));
  }
}

let __as_simd_i64x2_hi: u64 = 0;

export namespace i64x2_swar {
  // @ts-expect-error: decorator
  @inline export function take_hi(): u64 { return __as_simd_i64x2_hi; }
  // @ts-expect-error: decorator
  @inline function set_pair(lo: u64, hi: u64): u64 {
    __as_simd_i64x2_hi = hi;
    return lo;
  }
  // @ts-expect-error: decorator
  @inline function as_i64(x: u64): i64 { return x as i64; }
  // @ts-expect-error: decorator
  @inline function as_u64(x: i64): u64 { return x as u64; }
  // @ts-expect-error: decorator
  @inline function mask(pred: bool): u64 { return pred ? 0xffff_ffff_ffff_ffff : 0; }

  // @ts-expect-error: decorator
  @inline export function splat(x: i64): u64 { return set_pair(as_u64(x), as_u64(x)); }
  // @ts-expect-error: decorator
  @inline export function extract_lane(lo: u64, hi: u64, idx: u8): i64 { return (idx & 1) == 0 ? as_i64(lo) : as_i64(hi); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(lo: u64, hi: u64, idx: u8, value: i64): u64 {
    const vv = as_u64(value);
    return (idx & 1) == 0 ? set_pair(vv, hi) : set_pair(lo, vv);
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i64 = 0): u64 {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(2, nn, nn > 2);
    const f = as_u64(fill);
    if (n == 0) return set_pair(f, f);
    const l = load<u64>(ptr, immOffset, immAlign);
    if (n == 1) return set_pair(l, f);
    return set_pair(l, load<u64>(ptr, immOffset + 8, immAlign));
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, lo: u64, hi: u64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(2, nn, nn > 2);
    if (n == 0) return;
    store<u64>(ptr, lo, immOffset, immAlign);
    if (n > 1) store<u64>(ptr, hi, immOffset + 8, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function add(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(as_u64(as_i64(aLo) + as_i64(bLo)), as_u64(as_i64(aHi) + as_i64(bHi))); }
  // @ts-expect-error: decorator
  @inline export function sub(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(as_u64(as_i64(aLo) - as_i64(bLo)), as_u64(as_i64(aHi) - as_i64(bHi))); }
  // @ts-expect-error: decorator
  @inline export function mul(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(as_u64(as_i64(aLo) * as_i64(bLo)), as_u64(as_i64(aHi) * as_i64(bHi))); }
  // @ts-expect-error: decorator
  @inline export function abs(aLo: u64, aHi: u64): u64 {
    const l = as_i64(aLo);
    const h = as_i64(aHi);
    const ml = l >> 63;
    const mh = h >> 63;
    return set_pair(as_u64((l ^ ml) - ml), as_u64((h ^ mh) - mh));
  }
  // @ts-expect-error: decorator
  @inline export function neg(aLo: u64, aHi: u64): u64 { return set_pair(as_u64(-as_i64(aLo)), as_u64(-as_i64(aHi))); }
  // @ts-expect-error: decorator
  @inline export function shl(aLo: u64, aHi: u64, b: i32): u64 {
    const s = b & 63;
    return set_pair(aLo << s, aHi << s);
  }
  // @ts-expect-error: decorator
  @inline export function shr_s(aLo: u64, aHi: u64, b: i32): u64 {
    const s = b & 63;
    return set_pair(as_u64(as_i64(aLo) >> s), as_u64(as_i64(aHi) >> s));
  }
  // @ts-expect-error: decorator
  @inline export function shr_u(aLo: u64, aHi: u64, b: i32): u64 {
    const s = b & 63;
    return set_pair(aLo >> s, aHi >> s);
  }
  // @ts-expect-error: decorator
  @inline export function all_true(aLo: u64, aHi: u64): bool { return aLo != 0 && aHi != 0; }
  // @ts-expect-error: decorator
  @inline export function bitmask(aLo: u64, aHi: u64): i32 { return (((aLo >> 63) & 1) as i32) | ((((aHi >> 63) & 1) as i32) << 1); }
  // @ts-expect-error: decorator
  @inline export function eq(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(mask(aLo == bLo), mask(aHi == bHi)); }
  // @ts-expect-error: decorator
  @inline export function ne(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(mask(aLo != bLo), mask(aHi != bHi)); }
  // @ts-expect-error: decorator
  @inline export function lt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(mask(as_i64(aLo) < as_i64(bLo)), mask(as_i64(aHi) < as_i64(bHi))); }
  // @ts-expect-error: decorator
  @inline export function le_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(mask(as_i64(aLo) <= as_i64(bLo)), mask(as_i64(aHi) <= as_i64(bHi))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(mask(as_i64(aLo) > as_i64(bLo)), mask(as_i64(aHi) > as_i64(bHi))); }
  // @ts-expect-error: decorator
  @inline export function ge_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(mask(as_i64(aLo) >= as_i64(bLo)), mask(as_i64(aHi) >= as_i64(bHi))); }

  // @ts-expect-error: decorator
  @inline export function extend_low_i32x4_s(aLo: u64, aHi: u64): u64 {
    const a0 = (aLo & 0xffff_ffff) as i32 as i64;
    const a1 = ((aLo >> 32) & 0xffff_ffff) as i32 as i64;
    return set_pair(as_u64(a0), as_u64(a1));
  }
  // @ts-expect-error: decorator
  @inline export function extend_low_i32x4_u(aLo: u64, aHi: u64): u64 {
    const a0 = (aLo & 0xffff_ffff) as u32 as u64;
    const a1 = ((aLo >> 32) & 0xffff_ffff) as u32 as u64;
    return set_pair(a0, a1);
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i32x4_s(aLo: u64, aHi: u64): u64 {
    const a0 = (aHi & 0xffff_ffff) as i32 as i64;
    const a1 = ((aHi >> 32) & 0xffff_ffff) as i32 as i64;
    return set_pair(as_u64(a0), as_u64(a1));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i32x4_u(aLo: u64, aHi: u64): u64 {
    const a0 = (aHi & 0xffff_ffff) as u32 as u64;
    const a1 = ((aHi >> 32) & 0xffff_ffff) as u32 as u64;
    return set_pair(a0, a1);
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i32x4_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const a0 = (aLo & 0xffff_ffff) as i32 as i64;
    const a1 = ((aLo >> 32) & 0xffff_ffff) as i32 as i64;
    const b0 = (bLo & 0xffff_ffff) as i32 as i64;
    const b1 = ((bLo >> 32) & 0xffff_ffff) as i32 as i64;
    return set_pair(as_u64(a0 * b0), as_u64(a1 * b1));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i32x4_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const a0 = (aLo & 0xffff_ffff) as u32 as u64;
    const a1 = ((aLo >> 32) & 0xffff_ffff) as u32 as u64;
    const b0 = (bLo & 0xffff_ffff) as u32 as u64;
    const b1 = ((bLo >> 32) & 0xffff_ffff) as u32 as u64;
    return set_pair(a0 * b0, a1 * b1);
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i32x4_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const a0 = (aHi & 0xffff_ffff) as i32 as i64;
    const a1 = ((aHi >> 32) & 0xffff_ffff) as i32 as i64;
    const b0 = (bHi & 0xffff_ffff) as i32 as i64;
    const b1 = ((bHi >> 32) & 0xffff_ffff) as i32 as i64;
    return set_pair(as_u64(a0 * b0), as_u64(a1 * b1));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i32x4_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const a0 = (aHi & 0xffff_ffff) as u32 as u64;
    const a1 = ((aHi >> 32) & 0xffff_ffff) as u32 as u64;
    const b0 = (bHi & 0xffff_ffff) as u32 as u64;
    const b1 = ((bHi >> 32) & 0xffff_ffff) as u32 as u64;
    return set_pair(a0 * b0, a1 * b1);
  }
  // @ts-expect-error: decorator
  @inline export function shuffle(aLo: u64, aHi: u64, bLo: u64, bHi: u64, l0: u8, l1: u8): u64 {
    const i0 = l0 & 3;
    const i1 = l1 & 3;
    const x0 = i0 < 2 ? extract_lane(aLo, aHi, i0) : extract_lane(bLo, bHi, i0 - 2);
    const x1 = i1 < 2 ? extract_lane(aLo, aHi, i1) : extract_lane(bLo, bHi, i1 - 2);
    return set_pair(as_u64(x0), as_u64(x1));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(aLo: u64, aHi: u64, bLo: u64, bHi: u64, mLo: u64, mHi: u64): u64 {
    const l = extract_lane(mLo, mHi, 0) < 0 ? aLo : bLo;
    const h = extract_lane(mLo, mHi, 1) < 0 ? aHi : bHi;
    return set_pair(l, h);
  }
}

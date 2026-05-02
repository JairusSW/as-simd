import { i16x8_swar } from "./i16x8_swar";

let __as_simd_i8x16_hi: u64 = 0;

export function i8x16_swar(
  a0: i8, a1: i8, a2: i8, a3: i8,
  a4: i8, a5: i8, a6: i8, a7: i8,
  a8: i8, a9: i8, a10: i8, a11: i8,
  a12: i8, a13: i8, a14: i8, a15: i8,
): u64 {
  const lo =
    (a0 as u8 as u64) |
    ((a1 as u8 as u64) << 8) |
    ((a2 as u8 as u64) << 16) |
    ((a3 as u8 as u64) << 24) |
    ((a4 as u8 as u64) << 32) |
    ((a5 as u8 as u64) << 40) |
    ((a6 as u8 as u64) << 48) |
    ((a7 as u8 as u64) << 56);
  const hi =
    (a8 as u8 as u64) |
    ((a9 as u8 as u64) << 8) |
    ((a10 as u8 as u64) << 16) |
    ((a11 as u8 as u64) << 24) |
    ((a12 as u8 as u64) << 32) |
    ((a13 as u8 as u64) << 40) |
    ((a14 as u8 as u64) << 48) |
    ((a15 as u8 as u64) << 56);
  __as_simd_i8x16_hi = hi;
  return lo;
}

export namespace i8x16_swar {
  // @ts-expect-error: decorator
  @inline export function take_hi(): u64 { return __as_simd_i8x16_hi; }
  // @ts-expect-error: decorator
  @inline function set_pair(lo: u64, hi: u64): u64 {
    __as_simd_i8x16_hi = hi;
    return lo;
  }
  // @ts-expect-error: decorator
  @inline function lane_u(lo: u64, hi: u64, idx: i32): u8 {
    const v = idx < 8 ? lo : hi;
    return ((v >> ((idx & 7) << 3)) as u8);
  }
  // @ts-expect-error: decorator
  @inline function lane_s(lo: u64, hi: u64, idx: i32): i8 { return lane_u(lo, hi, idx) as i8; }
  // @ts-expect-error: decorator
  @inline function put_u(x: u64, idx: i32, value: u8): u64 {
    const shift = ((idx & 7) << 3) as u64;
    const mask = ~((0xff as u64) << shift);
    return (x & mask) | ((value as u64) << shift);
  }
  // @ts-expect-error: decorator
  @inline function sat_s(x: i32): i8 {
    if (x > 127) return 127;
    if (x < -128) return -128;
    return x as i8;
  }
  // @ts-expect-error: decorator
  @inline function sat_u(x: i32): u8 {
    if (x < 0) return 0;
    if (x > 255) return 255;
    return x as u8;
  }
  // @ts-expect-error: decorator
  @inline function abs8(x: i8): i8 { return x < 0 ? -x : x; }
  // @ts-expect-error: decorator
  @inline function shl8(x: u8, s: i32): u8 { return ((x as u32) << s) as u8; }
  // @ts-expect-error: decorator
  @inline function shr8(x: i8, s: i32): i8 { return ((x as i32) >> s) as i8; }
  // @ts-expect-error: decorator
  @inline function shr8u(x: u8, s: i32): u8 { return ((x as u32) >> s) as u8; }
  // @ts-expect-error: decorator
  @inline function popcnt8(x: u8): u8 {
    let v = x;
    v = v - ((v >> 1) & 0x55);
    v = (v & 0x33) + ((v >> 2) & 0x33);
    return (v + (v >> 4)) & 0x0f;
  }
  // @ts-expect-error: decorator
  @inline function avgr_u8(a: u8, b: u8): u8 { return (((a as u32) + (b as u32) + 1) >> 1) as u8; }
  // @ts-expect-error: decorator
  @inline function add_s_sat(a: i8, b: i8): i8 { return sat_s((a as i32) + (b as i32)); }
  // @ts-expect-error: decorator
  @inline function add_u_sat(a: u8, b: u8): u8 { return sat_u((a as i32) + (b as i32)); }
  // @ts-expect-error: decorator
  @inline function sub_s_sat(a: i8, b: i8): i8 { return sat_s((a as i32) - (b as i32)); }
  // @ts-expect-error: decorator
  @inline function sub_u_sat(a: u8, b: u8): u8 { return sat_u((a as i32) - (b as i32)); }
  // @ts-expect-error: decorator
  @inline function mask(pred: bool): i8 { return pred ? -1 : 0; }
  // @ts-expect-error: decorator
  @inline function build1(v0: i8, v1: i8, v2: i8, v3: i8, v4: i8, v5: i8, v6: i8, v7: i8): u64 {
    let out: u64 = 0;
    out = put_u(out, 0, v0 as u8);
    out = put_u(out, 1, v1 as u8);
    out = put_u(out, 2, v2 as u8);
    out = put_u(out, 3, v3 as u8);
    out = put_u(out, 4, v4 as u8);
    out = put_u(out, 5, v5 as u8);
    out = put_u(out, 6, v6 as u8);
    out = put_u(out, 7, v7 as u8);
    return out;
  }
  // @ts-expect-error: decorator
  @inline function build1u(v0: u8, v1: u8, v2: u8, v3: u8, v4: u8, v5: u8, v6: u8, v7: u8): u64 {
    let out: u64 = 0;
    out = put_u(out, 0, v0);
    out = put_u(out, 1, v1);
    out = put_u(out, 2, v2);
    out = put_u(out, 3, v3);
    out = put_u(out, 4, v4);
    out = put_u(out, 5, v5);
    out = put_u(out, 6, v6);
    out = put_u(out, 7, v7);
    return out;
  }

  // @ts-expect-error: decorator
  @inline export function splat(x: i8): u64 {
    const p = build1(x, x, x, x, x, x, x, x);
    return set_pair(p, p);
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(lo: u64, hi: u64, idx: u8): i8 { return lane_s(lo, hi, idx); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(lo: u64, hi: u64, idx: u8): u8 { return lane_u(lo, hi, idx); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(lo: u64, hi: u64, idx: u8, value: i8): u64 {
    const i = idx & 15;
    if (i < 8) return set_pair(put_u(lo, i, value as u8), hi);
    return set_pair(lo, put_u(hi, i - 8, value as u8));
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): u64 {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(16, nn, nn > 16);
    let lo = splat(fill);
    let hi = take_hi();
    let i = 0;
    while (i < n) {
      const v = load<u8>(ptr, immOffset + i, immAlign);
      if (i < 8) lo = put_u(lo, i, v); else hi = put_u(hi, i - 8, v);
      i++;
    }
    return set_pair(lo, hi);
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, lo: u64, hi: u64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(16, nn, nn > 16);
    let i = 0;
    while (i < n) {
      store<u8>(ptr, lane_u(lo, hi, i), immOffset + i, immAlign);
      i++;
    }
  }

  // @ts-expect-error: decorator
  @inline export function add(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      build1(lane_s(aLo, aHi, 0) + lane_s(bLo, bHi, 0), lane_s(aLo, aHi, 1) + lane_s(bLo, bHi, 1), lane_s(aLo, aHi, 2) + lane_s(bLo, bHi, 2), lane_s(aLo, aHi, 3) + lane_s(bLo, bHi, 3), lane_s(aLo, aHi, 4) + lane_s(bLo, bHi, 4), lane_s(aLo, aHi, 5) + lane_s(bLo, bHi, 5), lane_s(aLo, aHi, 6) + lane_s(bLo, bHi, 6), lane_s(aLo, aHi, 7) + lane_s(bLo, bHi, 7)),
      build1(lane_s(aLo, aHi, 8) + lane_s(bLo, bHi, 8), lane_s(aLo, aHi, 9) + lane_s(bLo, bHi, 9), lane_s(aLo, aHi, 10) + lane_s(bLo, bHi, 10), lane_s(aLo, aHi, 11) + lane_s(bLo, bHi, 11), lane_s(aLo, aHi, 12) + lane_s(bLo, bHi, 12), lane_s(aLo, aHi, 13) + lane_s(bLo, bHi, 13), lane_s(aLo, aHi, 14) + lane_s(bLo, bHi, 14), lane_s(aLo, aHi, 15) + lane_s(bLo, bHi, 15)),
    );
  }
  // @ts-expect-error: decorator
  @inline export function sub(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      build1(lane_s(aLo, aHi, 0) - lane_s(bLo, bHi, 0), lane_s(aLo, aHi, 1) - lane_s(bLo, bHi, 1), lane_s(aLo, aHi, 2) - lane_s(bLo, bHi, 2), lane_s(aLo, aHi, 3) - lane_s(bLo, bHi, 3), lane_s(aLo, aHi, 4) - lane_s(bLo, bHi, 4), lane_s(aLo, aHi, 5) - lane_s(bLo, bHi, 5), lane_s(aLo, aHi, 6) - lane_s(bLo, bHi, 6), lane_s(aLo, aHi, 7) - lane_s(bLo, bHi, 7)),
      build1(lane_s(aLo, aHi, 8) - lane_s(bLo, bHi, 8), lane_s(aLo, aHi, 9) - lane_s(bLo, bHi, 9), lane_s(aLo, aHi, 10) - lane_s(bLo, bHi, 10), lane_s(aLo, aHi, 11) - lane_s(bLo, bHi, 11), lane_s(aLo, aHi, 12) - lane_s(bLo, bHi, 12), lane_s(aLo, aHi, 13) - lane_s(bLo, bHi, 13), lane_s(aLo, aHi, 14) - lane_s(bLo, bHi, 14), lane_s(aLo, aHi, 15) - lane_s(bLo, bHi, 15)),
    );
  }
  // @ts-expect-error: decorator
  @inline export function mul(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      build1(lane_s(aLo, aHi, 0) * lane_s(bLo, bHi, 0), lane_s(aLo, aHi, 1) * lane_s(bLo, bHi, 1), lane_s(aLo, aHi, 2) * lane_s(bLo, bHi, 2), lane_s(aLo, aHi, 3) * lane_s(bLo, bHi, 3), lane_s(aLo, aHi, 4) * lane_s(bLo, bHi, 4), lane_s(aLo, aHi, 5) * lane_s(bLo, bHi, 5), lane_s(aLo, aHi, 6) * lane_s(bLo, bHi, 6), lane_s(aLo, aHi, 7) * lane_s(bLo, bHi, 7)),
      build1(lane_s(aLo, aHi, 8) * lane_s(bLo, bHi, 8), lane_s(aLo, aHi, 9) * lane_s(bLo, bHi, 9), lane_s(aLo, aHi, 10) * lane_s(bLo, bHi, 10), lane_s(aLo, aHi, 11) * lane_s(bLo, bHi, 11), lane_s(aLo, aHi, 12) * lane_s(bLo, bHi, 12), lane_s(aLo, aHi, 13) * lane_s(bLo, bHi, 13), lane_s(aLo, aHi, 14) * lane_s(bLo, bHi, 14), lane_s(aLo, aHi, 15) * lane_s(bLo, bHi, 15)),
    );
  }
  // @ts-expect-error: decorator
  @inline export function min_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(min<i8>(lane_s(aLo, aHi, 0), lane_s(bLo, bHi, 0)), min<i8>(lane_s(aLo, aHi, 1), lane_s(bLo, bHi, 1)), min<i8>(lane_s(aLo, aHi, 2), lane_s(bLo, bHi, 2)), min<i8>(lane_s(aLo, aHi, 3), lane_s(bLo, bHi, 3)), min<i8>(lane_s(aLo, aHi, 4), lane_s(bLo, bHi, 4)), min<i8>(lane_s(aLo, aHi, 5), lane_s(bLo, bHi, 5)), min<i8>(lane_s(aLo, aHi, 6), lane_s(bLo, bHi, 6)), min<i8>(lane_s(aLo, aHi, 7), lane_s(bLo, bHi, 7))), build1(min<i8>(lane_s(aLo, aHi, 8), lane_s(bLo, bHi, 8)), min<i8>(lane_s(aLo, aHi, 9), lane_s(bLo, bHi, 9)), min<i8>(lane_s(aLo, aHi, 10), lane_s(bLo, bHi, 10)), min<i8>(lane_s(aLo, aHi, 11), lane_s(bLo, bHi, 11)), min<i8>(lane_s(aLo, aHi, 12), lane_s(bLo, bHi, 12)), min<i8>(lane_s(aLo, aHi, 13), lane_s(bLo, bHi, 13)), min<i8>(lane_s(aLo, aHi, 14), lane_s(bLo, bHi, 14)), min<i8>(lane_s(aLo, aHi, 15), lane_s(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function min_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1u(min<u8>(lane_u(aLo, aHi, 0), lane_u(bLo, bHi, 0)), min<u8>(lane_u(aLo, aHi, 1), lane_u(bLo, bHi, 1)), min<u8>(lane_u(aLo, aHi, 2), lane_u(bLo, bHi, 2)), min<u8>(lane_u(aLo, aHi, 3), lane_u(bLo, bHi, 3)), min<u8>(lane_u(aLo, aHi, 4), lane_u(bLo, bHi, 4)), min<u8>(lane_u(aLo, aHi, 5), lane_u(bLo, bHi, 5)), min<u8>(lane_u(aLo, aHi, 6), lane_u(bLo, bHi, 6)), min<u8>(lane_u(aLo, aHi, 7), lane_u(bLo, bHi, 7))), build1u(min<u8>(lane_u(aLo, aHi, 8), lane_u(bLo, bHi, 8)), min<u8>(lane_u(aLo, aHi, 9), lane_u(bLo, bHi, 9)), min<u8>(lane_u(aLo, aHi, 10), lane_u(bLo, bHi, 10)), min<u8>(lane_u(aLo, aHi, 11), lane_u(bLo, bHi, 11)), min<u8>(lane_u(aLo, aHi, 12), lane_u(bLo, bHi, 12)), min<u8>(lane_u(aLo, aHi, 13), lane_u(bLo, bHi, 13)), min<u8>(lane_u(aLo, aHi, 14), lane_u(bLo, bHi, 14)), min<u8>(lane_u(aLo, aHi, 15), lane_u(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function max_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(max<i8>(lane_s(aLo, aHi, 0), lane_s(bLo, bHi, 0)), max<i8>(lane_s(aLo, aHi, 1), lane_s(bLo, bHi, 1)), max<i8>(lane_s(aLo, aHi, 2), lane_s(bLo, bHi, 2)), max<i8>(lane_s(aLo, aHi, 3), lane_s(bLo, bHi, 3)), max<i8>(lane_s(aLo, aHi, 4), lane_s(bLo, bHi, 4)), max<i8>(lane_s(aLo, aHi, 5), lane_s(bLo, bHi, 5)), max<i8>(lane_s(aLo, aHi, 6), lane_s(bLo, bHi, 6)), max<i8>(lane_s(aLo, aHi, 7), lane_s(bLo, bHi, 7))), build1(max<i8>(lane_s(aLo, aHi, 8), lane_s(bLo, bHi, 8)), max<i8>(lane_s(aLo, aHi, 9), lane_s(bLo, bHi, 9)), max<i8>(lane_s(aLo, aHi, 10), lane_s(bLo, bHi, 10)), max<i8>(lane_s(aLo, aHi, 11), lane_s(bLo, bHi, 11)), max<i8>(lane_s(aLo, aHi, 12), lane_s(bLo, bHi, 12)), max<i8>(lane_s(aLo, aHi, 13), lane_s(bLo, bHi, 13)), max<i8>(lane_s(aLo, aHi, 14), lane_s(bLo, bHi, 14)), max<i8>(lane_s(aLo, aHi, 15), lane_s(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function max_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1u(max<u8>(lane_u(aLo, aHi, 0), lane_u(bLo, bHi, 0)), max<u8>(lane_u(aLo, aHi, 1), lane_u(bLo, bHi, 1)), max<u8>(lane_u(aLo, aHi, 2), lane_u(bLo, bHi, 2)), max<u8>(lane_u(aLo, aHi, 3), lane_u(bLo, bHi, 3)), max<u8>(lane_u(aLo, aHi, 4), lane_u(bLo, bHi, 4)), max<u8>(lane_u(aLo, aHi, 5), lane_u(bLo, bHi, 5)), max<u8>(lane_u(aLo, aHi, 6), lane_u(bLo, bHi, 6)), max<u8>(lane_u(aLo, aHi, 7), lane_u(bLo, bHi, 7))), build1u(max<u8>(lane_u(aLo, aHi, 8), lane_u(bLo, bHi, 8)), max<u8>(lane_u(aLo, aHi, 9), lane_u(bLo, bHi, 9)), max<u8>(lane_u(aLo, aHi, 10), lane_u(bLo, bHi, 10)), max<u8>(lane_u(aLo, aHi, 11), lane_u(bLo, bHi, 11)), max<u8>(lane_u(aLo, aHi, 12), lane_u(bLo, bHi, 12)), max<u8>(lane_u(aLo, aHi, 13), lane_u(bLo, bHi, 13)), max<u8>(lane_u(aLo, aHi, 14), lane_u(bLo, bHi, 14)), max<u8>(lane_u(aLo, aHi, 15), lane_u(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function avgr_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1u(avgr_u8(lane_u(aLo, aHi, 0), lane_u(bLo, bHi, 0)), avgr_u8(lane_u(aLo, aHi, 1), lane_u(bLo, bHi, 1)), avgr_u8(lane_u(aLo, aHi, 2), lane_u(bLo, bHi, 2)), avgr_u8(lane_u(aLo, aHi, 3), lane_u(bLo, bHi, 3)), avgr_u8(lane_u(aLo, aHi, 4), lane_u(bLo, bHi, 4)), avgr_u8(lane_u(aLo, aHi, 5), lane_u(bLo, bHi, 5)), avgr_u8(lane_u(aLo, aHi, 6), lane_u(bLo, bHi, 6)), avgr_u8(lane_u(aLo, aHi, 7), lane_u(bLo, bHi, 7))), build1u(avgr_u8(lane_u(aLo, aHi, 8), lane_u(bLo, bHi, 8)), avgr_u8(lane_u(aLo, aHi, 9), lane_u(bLo, bHi, 9)), avgr_u8(lane_u(aLo, aHi, 10), lane_u(bLo, bHi, 10)), avgr_u8(lane_u(aLo, aHi, 11), lane_u(bLo, bHi, 11)), avgr_u8(lane_u(aLo, aHi, 12), lane_u(bLo, bHi, 12)), avgr_u8(lane_u(aLo, aHi, 13), lane_u(bLo, bHi, 13)), avgr_u8(lane_u(aLo, aHi, 14), lane_u(bLo, bHi, 14)), avgr_u8(lane_u(aLo, aHi, 15), lane_u(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function abs(aLo: u64, aHi: u64): u64 { return set_pair(build1(abs8(lane_s(aLo, aHi, 0)), abs8(lane_s(aLo, aHi, 1)), abs8(lane_s(aLo, aHi, 2)), abs8(lane_s(aLo, aHi, 3)), abs8(lane_s(aLo, aHi, 4)), abs8(lane_s(aLo, aHi, 5)), abs8(lane_s(aLo, aHi, 6)), abs8(lane_s(aLo, aHi, 7))), build1(abs8(lane_s(aLo, aHi, 8)), abs8(lane_s(aLo, aHi, 9)), abs8(lane_s(aLo, aHi, 10)), abs8(lane_s(aLo, aHi, 11)), abs8(lane_s(aLo, aHi, 12)), abs8(lane_s(aLo, aHi, 13)), abs8(lane_s(aLo, aHi, 14)), abs8(lane_s(aLo, aHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function neg(aLo: u64, aHi: u64): u64 { return set_pair(build1(-lane_s(aLo, aHi, 0), -lane_s(aLo, aHi, 1), -lane_s(aLo, aHi, 2), -lane_s(aLo, aHi, 3), -lane_s(aLo, aHi, 4), -lane_s(aLo, aHi, 5), -lane_s(aLo, aHi, 6), -lane_s(aLo, aHi, 7)), build1(-lane_s(aLo, aHi, 8), -lane_s(aLo, aHi, 9), -lane_s(aLo, aHi, 10), -lane_s(aLo, aHi, 11), -lane_s(aLo, aHi, 12), -lane_s(aLo, aHi, 13), -lane_s(aLo, aHi, 14), -lane_s(aLo, aHi, 15))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(add_s_sat(lane_s(aLo, aHi, 0), lane_s(bLo, bHi, 0)), add_s_sat(lane_s(aLo, aHi, 1), lane_s(bLo, bHi, 1)), add_s_sat(lane_s(aLo, aHi, 2), lane_s(bLo, bHi, 2)), add_s_sat(lane_s(aLo, aHi, 3), lane_s(bLo, bHi, 3)), add_s_sat(lane_s(aLo, aHi, 4), lane_s(bLo, bHi, 4)), add_s_sat(lane_s(aLo, aHi, 5), lane_s(bLo, bHi, 5)), add_s_sat(lane_s(aLo, aHi, 6), lane_s(bLo, bHi, 6)), add_s_sat(lane_s(aLo, aHi, 7), lane_s(bLo, bHi, 7))), build1(add_s_sat(lane_s(aLo, aHi, 8), lane_s(bLo, bHi, 8)), add_s_sat(lane_s(aLo, aHi, 9), lane_s(bLo, bHi, 9)), add_s_sat(lane_s(aLo, aHi, 10), lane_s(bLo, bHi, 10)), add_s_sat(lane_s(aLo, aHi, 11), lane_s(bLo, bHi, 11)), add_s_sat(lane_s(aLo, aHi, 12), lane_s(bLo, bHi, 12)), add_s_sat(lane_s(aLo, aHi, 13), lane_s(bLo, bHi, 13)), add_s_sat(lane_s(aLo, aHi, 14), lane_s(bLo, bHi, 14)), add_s_sat(lane_s(aLo, aHi, 15), lane_s(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1u(add_u_sat(lane_u(aLo, aHi, 0), lane_u(bLo, bHi, 0)), add_u_sat(lane_u(aLo, aHi, 1), lane_u(bLo, bHi, 1)), add_u_sat(lane_u(aLo, aHi, 2), lane_u(bLo, bHi, 2)), add_u_sat(lane_u(aLo, aHi, 3), lane_u(bLo, bHi, 3)), add_u_sat(lane_u(aLo, aHi, 4), lane_u(bLo, bHi, 4)), add_u_sat(lane_u(aLo, aHi, 5), lane_u(bLo, bHi, 5)), add_u_sat(lane_u(aLo, aHi, 6), lane_u(bLo, bHi, 6)), add_u_sat(lane_u(aLo, aHi, 7), lane_u(bLo, bHi, 7))), build1u(add_u_sat(lane_u(aLo, aHi, 8), lane_u(bLo, bHi, 8)), add_u_sat(lane_u(aLo, aHi, 9), lane_u(bLo, bHi, 9)), add_u_sat(lane_u(aLo, aHi, 10), lane_u(bLo, bHi, 10)), add_u_sat(lane_u(aLo, aHi, 11), lane_u(bLo, bHi, 11)), add_u_sat(lane_u(aLo, aHi, 12), lane_u(bLo, bHi, 12)), add_u_sat(lane_u(aLo, aHi, 13), lane_u(bLo, bHi, 13)), add_u_sat(lane_u(aLo, aHi, 14), lane_u(bLo, bHi, 14)), add_u_sat(lane_u(aLo, aHi, 15), lane_u(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(sub_s_sat(lane_s(aLo, aHi, 0), lane_s(bLo, bHi, 0)), sub_s_sat(lane_s(aLo, aHi, 1), lane_s(bLo, bHi, 1)), sub_s_sat(lane_s(aLo, aHi, 2), lane_s(bLo, bHi, 2)), sub_s_sat(lane_s(aLo, aHi, 3), lane_s(bLo, bHi, 3)), sub_s_sat(lane_s(aLo, aHi, 4), lane_s(bLo, bHi, 4)), sub_s_sat(lane_s(aLo, aHi, 5), lane_s(bLo, bHi, 5)), sub_s_sat(lane_s(aLo, aHi, 6), lane_s(bLo, bHi, 6)), sub_s_sat(lane_s(aLo, aHi, 7), lane_s(bLo, bHi, 7))), build1(sub_s_sat(lane_s(aLo, aHi, 8), lane_s(bLo, bHi, 8)), sub_s_sat(lane_s(aLo, aHi, 9), lane_s(bLo, bHi, 9)), sub_s_sat(lane_s(aLo, aHi, 10), lane_s(bLo, bHi, 10)), sub_s_sat(lane_s(aLo, aHi, 11), lane_s(bLo, bHi, 11)), sub_s_sat(lane_s(aLo, aHi, 12), lane_s(bLo, bHi, 12)), sub_s_sat(lane_s(aLo, aHi, 13), lane_s(bLo, bHi, 13)), sub_s_sat(lane_s(aLo, aHi, 14), lane_s(bLo, bHi, 14)), sub_s_sat(lane_s(aLo, aHi, 15), lane_s(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1u(sub_u_sat(lane_u(aLo, aHi, 0), lane_u(bLo, bHi, 0)), sub_u_sat(lane_u(aLo, aHi, 1), lane_u(bLo, bHi, 1)), sub_u_sat(lane_u(aLo, aHi, 2), lane_u(bLo, bHi, 2)), sub_u_sat(lane_u(aLo, aHi, 3), lane_u(bLo, bHi, 3)), sub_u_sat(lane_u(aLo, aHi, 4), lane_u(bLo, bHi, 4)), sub_u_sat(lane_u(aLo, aHi, 5), lane_u(bLo, bHi, 5)), sub_u_sat(lane_u(aLo, aHi, 6), lane_u(bLo, bHi, 6)), sub_u_sat(lane_u(aLo, aHi, 7), lane_u(bLo, bHi, 7))), build1u(sub_u_sat(lane_u(aLo, aHi, 8), lane_u(bLo, bHi, 8)), sub_u_sat(lane_u(aLo, aHi, 9), lane_u(bLo, bHi, 9)), sub_u_sat(lane_u(aLo, aHi, 10), lane_u(bLo, bHi, 10)), sub_u_sat(lane_u(aLo, aHi, 11), lane_u(bLo, bHi, 11)), sub_u_sat(lane_u(aLo, aHi, 12), lane_u(bLo, bHi, 12)), sub_u_sat(lane_u(aLo, aHi, 13), lane_u(bLo, bHi, 13)), sub_u_sat(lane_u(aLo, aHi, 14), lane_u(bLo, bHi, 14)), sub_u_sat(lane_u(aLo, aHi, 15), lane_u(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function shl(aLo: u64, aHi: u64, b: i32): u64 { const s = b & 7; return set_pair(build1u(shl8(lane_u(aLo, aHi, 0), s), shl8(lane_u(aLo, aHi, 1), s), shl8(lane_u(aLo, aHi, 2), s), shl8(lane_u(aLo, aHi, 3), s), shl8(lane_u(aLo, aHi, 4), s), shl8(lane_u(aLo, aHi, 5), s), shl8(lane_u(aLo, aHi, 6), s), shl8(lane_u(aLo, aHi, 7), s)), build1u(shl8(lane_u(aLo, aHi, 8), s), shl8(lane_u(aLo, aHi, 9), s), shl8(lane_u(aLo, aHi, 10), s), shl8(lane_u(aLo, aHi, 11), s), shl8(lane_u(aLo, aHi, 12), s), shl8(lane_u(aLo, aHi, 13), s), shl8(lane_u(aLo, aHi, 14), s), shl8(lane_u(aLo, aHi, 15), s))); }
  // @ts-expect-error: decorator
  @inline export function shr_s(aLo: u64, aHi: u64, b: i32): u64 { const s = b & 7; return set_pair(build1(shr8(lane_s(aLo, aHi, 0), s), shr8(lane_s(aLo, aHi, 1), s), shr8(lane_s(aLo, aHi, 2), s), shr8(lane_s(aLo, aHi, 3), s), shr8(lane_s(aLo, aHi, 4), s), shr8(lane_s(aLo, aHi, 5), s), shr8(lane_s(aLo, aHi, 6), s), shr8(lane_s(aLo, aHi, 7), s)), build1(shr8(lane_s(aLo, aHi, 8), s), shr8(lane_s(aLo, aHi, 9), s), shr8(lane_s(aLo, aHi, 10), s), shr8(lane_s(aLo, aHi, 11), s), shr8(lane_s(aLo, aHi, 12), s), shr8(lane_s(aLo, aHi, 13), s), shr8(lane_s(aLo, aHi, 14), s), shr8(lane_s(aLo, aHi, 15), s))); }
  // @ts-expect-error: decorator
  @inline export function shr_u(aLo: u64, aHi: u64, b: i32): u64 { const s = b & 7; return set_pair(build1u(shr8u(lane_u(aLo, aHi, 0), s), shr8u(lane_u(aLo, aHi, 1), s), shr8u(lane_u(aLo, aHi, 2), s), shr8u(lane_u(aLo, aHi, 3), s), shr8u(lane_u(aLo, aHi, 4), s), shr8u(lane_u(aLo, aHi, 5), s), shr8u(lane_u(aLo, aHi, 6), s), shr8u(lane_u(aLo, aHi, 7), s)), build1u(shr8u(lane_u(aLo, aHi, 8), s), shr8u(lane_u(aLo, aHi, 9), s), shr8u(lane_u(aLo, aHi, 10), s), shr8u(lane_u(aLo, aHi, 11), s), shr8u(lane_u(aLo, aHi, 12), s), shr8u(lane_u(aLo, aHi, 13), s), shr8u(lane_u(aLo, aHi, 14), s), shr8u(lane_u(aLo, aHi, 15), s))); }
  // @ts-expect-error: decorator
  @inline export function all_true(aLo: u64, aHi: u64): bool { let i = 0; while (i < 16) { if (lane_u(aLo, aHi, i) == 0) return false; i++; } return true; }
  // @ts-expect-error: decorator
  @inline export function bitmask(aLo: u64, aHi: u64): i32 { let m = 0; let i = 0; while (i < 16) { if (lane_s(aLo, aHi, i) < 0) m |= (1 << i); i++; } return m; }
  // @ts-expect-error: decorator
  @inline export function bitmask_lane(aLo: u64, aHi: u64): u64 {
    return set_pair(
      (((aLo & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | aLo) & 0x8080808080808080,
      (((aHi & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | aHi) & 0x8080808080808080,
    );
  }
  // @ts-expect-error: decorator
  @inline export function popcnt(aLo: u64, aHi: u64): u64 {
    let lo: u64 = 0, hi: u64 = 0, i = 0;
    while (i < 16) {
      const p = popcnt8(lane_u(aLo, aHi, i));
      if (i < 8) lo = put_u(lo, i, p); else hi = put_u(hi, i - 8, p);
      i++;
    }
    return set_pair(lo, hi);
  }
  // @ts-expect-error: decorator
  @inline export function eq(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(mask(lane_s(aLo, aHi, 0) == lane_s(bLo, bHi, 0)), mask(lane_s(aLo, aHi, 1) == lane_s(bLo, bHi, 1)), mask(lane_s(aLo, aHi, 2) == lane_s(bLo, bHi, 2)), mask(lane_s(aLo, aHi, 3) == lane_s(bLo, bHi, 3)), mask(lane_s(aLo, aHi, 4) == lane_s(bLo, bHi, 4)), mask(lane_s(aLo, aHi, 5) == lane_s(bLo, bHi, 5)), mask(lane_s(aLo, aHi, 6) == lane_s(bLo, bHi, 6)), mask(lane_s(aLo, aHi, 7) == lane_s(bLo, bHi, 7))), build1(mask(lane_s(aLo, aHi, 8) == lane_s(bLo, bHi, 8)), mask(lane_s(aLo, aHi, 9) == lane_s(bLo, bHi, 9)), mask(lane_s(aLo, aHi, 10) == lane_s(bLo, bHi, 10)), mask(lane_s(aLo, aHi, 11) == lane_s(bLo, bHi, 11)), mask(lane_s(aLo, aHi, 12) == lane_s(bLo, bHi, 12)), mask(lane_s(aLo, aHi, 13) == lane_s(bLo, bHi, 13)), mask(lane_s(aLo, aHi, 14) == lane_s(bLo, bHi, 14)), mask(lane_s(aLo, aHi, 15) == lane_s(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function ne(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(mask(lane_s(aLo, aHi, 0) != lane_s(bLo, bHi, 0)), mask(lane_s(aLo, aHi, 1) != lane_s(bLo, bHi, 1)), mask(lane_s(aLo, aHi, 2) != lane_s(bLo, bHi, 2)), mask(lane_s(aLo, aHi, 3) != lane_s(bLo, bHi, 3)), mask(lane_s(aLo, aHi, 4) != lane_s(bLo, bHi, 4)), mask(lane_s(aLo, aHi, 5) != lane_s(bLo, bHi, 5)), mask(lane_s(aLo, aHi, 6) != lane_s(bLo, bHi, 6)), mask(lane_s(aLo, aHi, 7) != lane_s(bLo, bHi, 7))), build1(mask(lane_s(aLo, aHi, 8) != lane_s(bLo, bHi, 8)), mask(lane_s(aLo, aHi, 9) != lane_s(bLo, bHi, 9)), mask(lane_s(aLo, aHi, 10) != lane_s(bLo, bHi, 10)), mask(lane_s(aLo, aHi, 11) != lane_s(bLo, bHi, 11)), mask(lane_s(aLo, aHi, 12) != lane_s(bLo, bHi, 12)), mask(lane_s(aLo, aHi, 13) != lane_s(bLo, bHi, 13)), mask(lane_s(aLo, aHi, 14) != lane_s(bLo, bHi, 14)), mask(lane_s(aLo, aHi, 15) != lane_s(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(mask(lane_s(aLo, aHi, 0) < lane_s(bLo, bHi, 0)), mask(lane_s(aLo, aHi, 1) < lane_s(bLo, bHi, 1)), mask(lane_s(aLo, aHi, 2) < lane_s(bLo, bHi, 2)), mask(lane_s(aLo, aHi, 3) < lane_s(bLo, bHi, 3)), mask(lane_s(aLo, aHi, 4) < lane_s(bLo, bHi, 4)), mask(lane_s(aLo, aHi, 5) < lane_s(bLo, bHi, 5)), mask(lane_s(aLo, aHi, 6) < lane_s(bLo, bHi, 6)), mask(lane_s(aLo, aHi, 7) < lane_s(bLo, bHi, 7))), build1(mask(lane_s(aLo, aHi, 8) < lane_s(bLo, bHi, 8)), mask(lane_s(aLo, aHi, 9) < lane_s(bLo, bHi, 9)), mask(lane_s(aLo, aHi, 10) < lane_s(bLo, bHi, 10)), mask(lane_s(aLo, aHi, 11) < lane_s(bLo, bHi, 11)), mask(lane_s(aLo, aHi, 12) < lane_s(bLo, bHi, 12)), mask(lane_s(aLo, aHi, 13) < lane_s(bLo, bHi, 13)), mask(lane_s(aLo, aHi, 14) < lane_s(bLo, bHi, 14)), mask(lane_s(aLo, aHi, 15) < lane_s(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(mask(lane_u(aLo, aHi, 0) < lane_u(bLo, bHi, 0)), mask(lane_u(aLo, aHi, 1) < lane_u(bLo, bHi, 1)), mask(lane_u(aLo, aHi, 2) < lane_u(bLo, bHi, 2)), mask(lane_u(aLo, aHi, 3) < lane_u(bLo, bHi, 3)), mask(lane_u(aLo, aHi, 4) < lane_u(bLo, bHi, 4)), mask(lane_u(aLo, aHi, 5) < lane_u(bLo, bHi, 5)), mask(lane_u(aLo, aHi, 6) < lane_u(bLo, bHi, 6)), mask(lane_u(aLo, aHi, 7) < lane_u(bLo, bHi, 7))), build1(mask(lane_u(aLo, aHi, 8) < lane_u(bLo, bHi, 8)), mask(lane_u(aLo, aHi, 9) < lane_u(bLo, bHi, 9)), mask(lane_u(aLo, aHi, 10) < lane_u(bLo, bHi, 10)), mask(lane_u(aLo, aHi, 11) < lane_u(bLo, bHi, 11)), mask(lane_u(aLo, aHi, 12) < lane_u(bLo, bHi, 12)), mask(lane_u(aLo, aHi, 13) < lane_u(bLo, bHi, 13)), mask(lane_u(aLo, aHi, 14) < lane_u(bLo, bHi, 14)), mask(lane_u(aLo, aHi, 15) < lane_u(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function le_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(mask(lane_s(aLo, aHi, 0) <= lane_s(bLo, bHi, 0)), mask(lane_s(aLo, aHi, 1) <= lane_s(bLo, bHi, 1)), mask(lane_s(aLo, aHi, 2) <= lane_s(bLo, bHi, 2)), mask(lane_s(aLo, aHi, 3) <= lane_s(bLo, bHi, 3)), mask(lane_s(aLo, aHi, 4) <= lane_s(bLo, bHi, 4)), mask(lane_s(aLo, aHi, 5) <= lane_s(bLo, bHi, 5)), mask(lane_s(aLo, aHi, 6) <= lane_s(bLo, bHi, 6)), mask(lane_s(aLo, aHi, 7) <= lane_s(bLo, bHi, 7))), build1(mask(lane_s(aLo, aHi, 8) <= lane_s(bLo, bHi, 8)), mask(lane_s(aLo, aHi, 9) <= lane_s(bLo, bHi, 9)), mask(lane_s(aLo, aHi, 10) <= lane_s(bLo, bHi, 10)), mask(lane_s(aLo, aHi, 11) <= lane_s(bLo, bHi, 11)), mask(lane_s(aLo, aHi, 12) <= lane_s(bLo, bHi, 12)), mask(lane_s(aLo, aHi, 13) <= lane_s(bLo, bHi, 13)), mask(lane_s(aLo, aHi, 14) <= lane_s(bLo, bHi, 14)), mask(lane_s(aLo, aHi, 15) <= lane_s(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function le_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(build1(mask(lane_u(aLo, aHi, 0) <= lane_u(bLo, bHi, 0)), mask(lane_u(aLo, aHi, 1) <= lane_u(bLo, bHi, 1)), mask(lane_u(aLo, aHi, 2) <= lane_u(bLo, bHi, 2)), mask(lane_u(aLo, aHi, 3) <= lane_u(bLo, bHi, 3)), mask(lane_u(aLo, aHi, 4) <= lane_u(bLo, bHi, 4)), mask(lane_u(aLo, aHi, 5) <= lane_u(bLo, bHi, 5)), mask(lane_u(aLo, aHi, 6) <= lane_u(bLo, bHi, 6)), mask(lane_u(aLo, aHi, 7) <= lane_u(bLo, bHi, 7))), build1(mask(lane_u(aLo, aHi, 8) <= lane_u(bLo, bHi, 8)), mask(lane_u(aLo, aHi, 9) <= lane_u(bLo, bHi, 9)), mask(lane_u(aLo, aHi, 10) <= lane_u(bLo, bHi, 10)), mask(lane_u(aLo, aHi, 11) <= lane_u(bLo, bHi, 11)), mask(lane_u(aLo, aHi, 12) <= lane_u(bLo, bHi, 12)), mask(lane_u(aLo, aHi, 13) <= lane_u(bLo, bHi, 13)), mask(lane_u(aLo, aHi, 14) <= lane_u(bLo, bHi, 14)), mask(lane_u(aLo, aHi, 15) <= lane_u(bLo, bHi, 15)))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return lt_s(bLo, bHi, aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function gt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return lt_u(bLo, bHi, aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function ge_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return le_s(bLo, bHi, aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function ge_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return le_u(bLo, bHi, aLo, aHi); }

  // @ts-expect-error: decorator
  @inline export function narrow_i16x8_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    let lo: u64 = 0, hi: u64 = 0, i = 0;
    while (i < 8) { lo = put_u(lo, i, sat_s(i16x8_swar.extract_lane_s(aLo, aHi, i as u8)) as u8); i++; }
    i = 0;
    while (i < 8) { hi = put_u(hi, i, sat_s(i16x8_swar.extract_lane_s(bLo, bHi, i as u8)) as u8); i++; }
    return set_pair(lo, hi);
  }
  // @ts-expect-error: decorator
  @inline export function narrow_i16x8_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    let lo: u64 = 0, hi: u64 = 0, i = 0;
    while (i < 8) { lo = put_u(lo, i, sat_u(i16x8_swar.extract_lane_s(aLo, aHi, i as u8) as i32)); i++; }
    i = 0;
    while (i < 8) { hi = put_u(hi, i, sat_u(i16x8_swar.extract_lane_s(bLo, bHi, i as u8) as i32)); i++; }
    return set_pair(lo, hi);
  }

  // @ts-expect-error: decorator
  @inline export function shuffle(aLo: u64, aHi: u64, bLo: u64, bHi: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8, l8: u8, l9: u8, l10: u8, l11: u8, l12: u8, l13: u8, l14: u8, l15: u8): u64 {
    const lanes = [l0, l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15];
    let lo: u64 = 0, hi: u64 = 0, i = 0;
    while (i < 16) {
      const lane = lanes[i] as i32 & 31;
      const v = lane < 16 ? lane_u(aLo, aHi, lane) : lane_u(bLo, bHi, lane - 16);
      if (i < 8) lo = put_u(lo, i, v); else hi = put_u(hi, i - 8, v);
      i++;
    }
    return set_pair(lo, hi);
  }
  // @ts-expect-error: decorator
  @inline export function swizzle(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
    let lo: u64 = 0, hi: u64 = 0, i = 0;
    while (i < 16) {
      const idx = lane_u(sLo, sHi, i);
      const v = idx < 16 ? lane_u(aLo, aHi, idx) : 0;
      if (i < 8) lo = put_u(lo, i, v); else hi = put_u(hi, i - 8, v);
      i++;
    }
    return set_pair(lo, hi);
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 { return swizzle(aLo, aHi, sLo, sHi); }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(aLo: u64, aHi: u64, bLo: u64, bHi: u64, mLo: u64, mHi: u64): u64 {
    let lo: u64 = 0, hi: u64 = 0, i = 0;
    while (i < 16) {
      const v = lane_s(mLo, mHi, i) < 0 ? lane_u(aLo, aHi, i) : lane_u(bLo, bHi, i);
      if (i < 8) lo = put_u(lo, i, v); else hi = put_u(hi, i - 8, v);
      i++;
    }
    return set_pair(lo, hi);
  }
}

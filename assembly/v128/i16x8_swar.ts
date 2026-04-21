let __as_simd_i16x8_hi: u64 = 0;

export function i16x8_swar(a: i16, b: i16, c: i16, d: i16, e: i16, f: i16, g: i16, h: i16): u64 {
  const lo = (a as u16 as u64) | ((b as u16 as u64) << 16) | ((c as u16 as u64) << 32) | ((d as u16 as u64) << 48);
  const hi = (e as u16 as u64) | ((f as u16 as u64) << 16) | ((g as u16 as u64) << 32) | ((h as u16 as u64) << 48);
  __as_simd_i16x8_hi = hi;
  return lo;
}

export namespace i16x8_swar {
  // @ts-expect-error: decorator
  @inline export function take_hi(): u64 { return __as_simd_i16x8_hi; }
  // @ts-expect-error: decorator
  @inline function set_pair(lo: u64, hi: u64): u64 {
    __as_simd_i16x8_hi = hi;
    return lo;
  }
  // @ts-expect-error: decorator
  @inline function lane_s(lo: u64, hi: u64, idx: i32): i16 {
    const v = idx < 4 ? lo : hi;
    return ((v >> ((idx & 3) << 4)) as u16) as i16;
  }
  // @ts-expect-error: decorator
  @inline function lane_u(lo: u64, hi: u64, idx: i32): u16 {
    const v = idx < 4 ? lo : hi;
    return ((v >> ((idx & 3) << 4)) as u16);
  }
  // @ts-expect-error: decorator
  @inline function pack4(a: i16, b: i16, c: i16, d: i16): u64 {
    return (a as u16 as u64) | ((b as u16 as u64) << 16) | ((c as u16 as u64) << 32) | ((d as u16 as u64) << 48);
  }
  // @ts-expect-error: decorator
  @inline function pack4u(a: u16, b: u16, c: u16, d: u16): u64 { return (a as u64) | ((b as u64) << 16) | ((c as u64) << 32) | ((d as u64) << 48); }
  // @ts-expect-error: decorator
  @inline function sat_s(x: i32): i16 {
    if (x > 32767) return 32767;
    if (x < -32768) return -32768;
    return x as i16;
  }
  // @ts-expect-error: decorator
  @inline function sat_u(x: i32): u16 {
    if (x < 0) return 0;
    if (x > 65535) return 65535;
    return x as u16;
  }
  // @ts-expect-error: decorator
  @inline function mask(pred: bool): i16 { return pred ? -1 : 0; }

  // @ts-expect-error: decorator
  @inline export function splat(x: i16): u64 { const p = pack4(x, x, x, x); return set_pair(p, p); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(lo: u64, hi: u64, idx: u8): i16 { return lane_s(lo, hi, idx); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(lo: u64, hi: u64, idx: u8): u16 { return lane_u(lo, hi, idx); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(lo: u64, hi: u64, idx: u8, value: i16): u64 {
    const i = idx & 7;
    const out0 = i == 0 ? value : lane_s(lo, hi, 0);
    const out1 = i == 1 ? value : lane_s(lo, hi, 1);
    const out2 = i == 2 ? value : lane_s(lo, hi, 2);
    const out3 = i == 3 ? value : lane_s(lo, hi, 3);
    const out4 = i == 4 ? value : lane_s(lo, hi, 4);
    const out5 = i == 5 ? value : lane_s(lo, hi, 5);
    const out6 = i == 6 ? value : lane_s(lo, hi, 6);
    const out7 = i == 7 ? value : lane_s(lo, hi, 7);
    return set_pair(pack4(out0, out1, out2, out3), pack4(out4, out5, out6, out7));
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i16 = 0): u64 {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(8, nn, nn > 8);
    let a = fill, b = fill, c = fill, d = fill, e = fill, f = fill, g = fill, h = fill;
    if (n > 0) a = load<i16>(ptr, immOffset, immAlign);
    if (n > 1) b = load<i16>(ptr, immOffset + 2, immAlign);
    if (n > 2) c = load<i16>(ptr, immOffset + 4, immAlign);
    if (n > 3) d = load<i16>(ptr, immOffset + 6, immAlign);
    if (n > 4) e = load<i16>(ptr, immOffset + 8, immAlign);
    if (n > 5) f = load<i16>(ptr, immOffset + 10, immAlign);
    if (n > 6) g = load<i16>(ptr, immOffset + 12, immAlign);
    if (n > 7) h = load<i16>(ptr, immOffset + 14, immAlign);
    return set_pair(pack4(a, b, c, d), pack4(e, f, g, h));
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, lo: u64, hi: u64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(8, nn, nn > 8);
    if (n > 0) store<i16>(ptr, lane_s(lo, hi, 0), immOffset, immAlign);
    if (n > 1) store<i16>(ptr, lane_s(lo, hi, 1), immOffset + 2, immAlign);
    if (n > 2) store<i16>(ptr, lane_s(lo, hi, 2), immOffset + 4, immAlign);
    if (n > 3) store<i16>(ptr, lane_s(lo, hi, 3), immOffset + 6, immAlign);
    if (n > 4) store<i16>(ptr, lane_s(lo, hi, 4), immOffset + 8, immAlign);
    if (n > 5) store<i16>(ptr, lane_s(lo, hi, 5), immOffset + 10, immAlign);
    if (n > 6) store<i16>(ptr, lane_s(lo, hi, 6), immOffset + 12, immAlign);
    if (n > 7) store<i16>(ptr, lane_s(lo, hi, 7), immOffset + 14, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function add(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(lane_s(aLo, aHi, 0) + lane_s(bLo, bHi, 0), lane_s(aLo, aHi, 1) + lane_s(bLo, bHi, 1), lane_s(aLo, aHi, 2) + lane_s(bLo, bHi, 2), lane_s(aLo, aHi, 3) + lane_s(bLo, bHi, 3)), pack4(lane_s(aLo, aHi, 4) + lane_s(bLo, bHi, 4), lane_s(aLo, aHi, 5) + lane_s(bLo, bHi, 5), lane_s(aLo, aHi, 6) + lane_s(bLo, bHi, 6), lane_s(aLo, aHi, 7) + lane_s(bLo, bHi, 7))); }
  // @ts-expect-error: decorator
  @inline export function sub(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(lane_s(aLo, aHi, 0) - lane_s(bLo, bHi, 0), lane_s(aLo, aHi, 1) - lane_s(bLo, bHi, 1), lane_s(aLo, aHi, 2) - lane_s(bLo, bHi, 2), lane_s(aLo, aHi, 3) - lane_s(bLo, bHi, 3)), pack4(lane_s(aLo, aHi, 4) - lane_s(bLo, bHi, 4), lane_s(aLo, aHi, 5) - lane_s(bLo, bHi, 5), lane_s(aLo, aHi, 6) - lane_s(bLo, bHi, 6), lane_s(aLo, aHi, 7) - lane_s(bLo, bHi, 7))); }
  // @ts-expect-error: decorator
  @inline export function mul(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(lane_s(aLo, aHi, 0) * lane_s(bLo, bHi, 0), lane_s(aLo, aHi, 1) * lane_s(bLo, bHi, 1), lane_s(aLo, aHi, 2) * lane_s(bLo, bHi, 2), lane_s(aLo, aHi, 3) * lane_s(bLo, bHi, 3)), pack4(lane_s(aLo, aHi, 4) * lane_s(bLo, bHi, 4), lane_s(aLo, aHi, 5) * lane_s(bLo, bHi, 5), lane_s(aLo, aHi, 6) * lane_s(bLo, bHi, 6), lane_s(aLo, aHi, 7) * lane_s(bLo, bHi, 7))); }
  // @ts-expect-error: decorator
  @inline export function min_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(min<i16>(lane_s(aLo, aHi, 0), lane_s(bLo, bHi, 0)), min<i16>(lane_s(aLo, aHi, 1), lane_s(bLo, bHi, 1)), min<i16>(lane_s(aLo, aHi, 2), lane_s(bLo, bHi, 2)), min<i16>(lane_s(aLo, aHi, 3), lane_s(bLo, bHi, 3))), pack4(min<i16>(lane_s(aLo, aHi, 4), lane_s(bLo, bHi, 4)), min<i16>(lane_s(aLo, aHi, 5), lane_s(bLo, bHi, 5)), min<i16>(lane_s(aLo, aHi, 6), lane_s(bLo, bHi, 6)), min<i16>(lane_s(aLo, aHi, 7), lane_s(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function min_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4u(min<u16>(lane_u(aLo, aHi, 0), lane_u(bLo, bHi, 0)), min<u16>(lane_u(aLo, aHi, 1), lane_u(bLo, bHi, 1)), min<u16>(lane_u(aLo, aHi, 2), lane_u(bLo, bHi, 2)), min<u16>(lane_u(aLo, aHi, 3), lane_u(bLo, bHi, 3))), pack4u(min<u16>(lane_u(aLo, aHi, 4), lane_u(bLo, bHi, 4)), min<u16>(lane_u(aLo, aHi, 5), lane_u(bLo, bHi, 5)), min<u16>(lane_u(aLo, aHi, 6), lane_u(bLo, bHi, 6)), min<u16>(lane_u(aLo, aHi, 7), lane_u(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function max_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(max<i16>(lane_s(aLo, aHi, 0), lane_s(bLo, bHi, 0)), max<i16>(lane_s(aLo, aHi, 1), lane_s(bLo, bHi, 1)), max<i16>(lane_s(aLo, aHi, 2), lane_s(bLo, bHi, 2)), max<i16>(lane_s(aLo, aHi, 3), lane_s(bLo, bHi, 3))), pack4(max<i16>(lane_s(aLo, aHi, 4), lane_s(bLo, bHi, 4)), max<i16>(lane_s(aLo, aHi, 5), lane_s(bLo, bHi, 5)), max<i16>(lane_s(aLo, aHi, 6), lane_s(bLo, bHi, 6)), max<i16>(lane_s(aLo, aHi, 7), lane_s(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function max_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4u(max<u16>(lane_u(aLo, aHi, 0), lane_u(bLo, bHi, 0)), max<u16>(lane_u(aLo, aHi, 1), lane_u(bLo, bHi, 1)), max<u16>(lane_u(aLo, aHi, 2), lane_u(bLo, bHi, 2)), max<u16>(lane_u(aLo, aHi, 3), lane_u(bLo, bHi, 3))), pack4u(max<u16>(lane_u(aLo, aHi, 4), lane_u(bLo, bHi, 4)), max<u16>(lane_u(aLo, aHi, 5), lane_u(bLo, bHi, 5)), max<u16>(lane_u(aLo, aHi, 6), lane_u(bLo, bHi, 6)), max<u16>(lane_u(aLo, aHi, 7), lane_u(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function avgr_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      pack4u((((lane_u(aLo, aHi, 0) + lane_u(bLo, bHi, 0) + 1) >> 1) as u16), (((lane_u(aLo, aHi, 1) + lane_u(bLo, bHi, 1) + 1) >> 1) as u16), (((lane_u(aLo, aHi, 2) + lane_u(bLo, bHi, 2) + 1) >> 1) as u16), (((lane_u(aLo, aHi, 3) + lane_u(bLo, bHi, 3) + 1) >> 1) as u16)),
      pack4u((((lane_u(aLo, aHi, 4) + lane_u(bLo, bHi, 4) + 1) >> 1) as u16), (((lane_u(aLo, aHi, 5) + lane_u(bLo, bHi, 5) + 1) >> 1) as u16), (((lane_u(aLo, aHi, 6) + lane_u(bLo, bHi, 6) + 1) >> 1) as u16), (((lane_u(aLo, aHi, 7) + lane_u(bLo, bHi, 7) + 1) >> 1) as u16)),
    );
  }
  // @ts-expect-error: decorator
  @inline export function abs(aLo: u64, aHi: u64): u64 { return set_pair(pack4(abs<i16>(lane_s(aLo, aHi, 0)), abs<i16>(lane_s(aLo, aHi, 1)), abs<i16>(lane_s(aLo, aHi, 2)), abs<i16>(lane_s(aLo, aHi, 3))), pack4(abs<i16>(lane_s(aLo, aHi, 4)), abs<i16>(lane_s(aLo, aHi, 5)), abs<i16>(lane_s(aLo, aHi, 6)), abs<i16>(lane_s(aLo, aHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function neg(aLo: u64, aHi: u64): u64 { return set_pair(pack4(-lane_s(aLo, aHi, 0), -lane_s(aLo, aHi, 1), -lane_s(aLo, aHi, 2), -lane_s(aLo, aHi, 3)), pack4(-lane_s(aLo, aHi, 4), -lane_s(aLo, aHi, 5), -lane_s(aLo, aHi, 6), -lane_s(aLo, aHi, 7))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(sat_s(lane_s(aLo, aHi, 0) + lane_s(bLo, bHi, 0)), sat_s(lane_s(aLo, aHi, 1) + lane_s(bLo, bHi, 1)), sat_s(lane_s(aLo, aHi, 2) + lane_s(bLo, bHi, 2)), sat_s(lane_s(aLo, aHi, 3) + lane_s(bLo, bHi, 3))), pack4(sat_s(lane_s(aLo, aHi, 4) + lane_s(bLo, bHi, 4)), sat_s(lane_s(aLo, aHi, 5) + lane_s(bLo, bHi, 5)), sat_s(lane_s(aLo, aHi, 6) + lane_s(bLo, bHi, 6)), sat_s(lane_s(aLo, aHi, 7) + lane_s(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4u(sat_u(lane_u(aLo, aHi, 0) + lane_u(bLo, bHi, 0)), sat_u(lane_u(aLo, aHi, 1) + lane_u(bLo, bHi, 1)), sat_u(lane_u(aLo, aHi, 2) + lane_u(bLo, bHi, 2)), sat_u(lane_u(aLo, aHi, 3) + lane_u(bLo, bHi, 3))), pack4u(sat_u(lane_u(aLo, aHi, 4) + lane_u(bLo, bHi, 4)), sat_u(lane_u(aLo, aHi, 5) + lane_u(bLo, bHi, 5)), sat_u(lane_u(aLo, aHi, 6) + lane_u(bLo, bHi, 6)), sat_u(lane_u(aLo, aHi, 7) + lane_u(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(sat_s(lane_s(aLo, aHi, 0) - lane_s(bLo, bHi, 0)), sat_s(lane_s(aLo, aHi, 1) - lane_s(bLo, bHi, 1)), sat_s(lane_s(aLo, aHi, 2) - lane_s(bLo, bHi, 2)), sat_s(lane_s(aLo, aHi, 3) - lane_s(bLo, bHi, 3))), pack4(sat_s(lane_s(aLo, aHi, 4) - lane_s(bLo, bHi, 4)), sat_s(lane_s(aLo, aHi, 5) - lane_s(bLo, bHi, 5)), sat_s(lane_s(aLo, aHi, 6) - lane_s(bLo, bHi, 6)), sat_s(lane_s(aLo, aHi, 7) - lane_s(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4u(sat_u(lane_u(aLo, aHi, 0) - lane_u(bLo, bHi, 0)), sat_u(lane_u(aLo, aHi, 1) - lane_u(bLo, bHi, 1)), sat_u(lane_u(aLo, aHi, 2) - lane_u(bLo, bHi, 2)), sat_u(lane_u(aLo, aHi, 3) - lane_u(bLo, bHi, 3))), pack4u(sat_u(lane_u(aLo, aHi, 4) - lane_u(bLo, bHi, 4)), sat_u(lane_u(aLo, aHi, 5) - lane_u(bLo, bHi, 5)), sat_u(lane_u(aLo, aHi, 6) - lane_u(bLo, bHi, 6)), sat_u(lane_u(aLo, aHi, 7) - lane_u(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function shl(aLo: u64, aHi: u64, b: i32): u64 { const s = b & 15; return set_pair(pack4(lane_s(aLo, aHi, 0) << s, lane_s(aLo, aHi, 1) << s, lane_s(aLo, aHi, 2) << s, lane_s(aLo, aHi, 3) << s), pack4(lane_s(aLo, aHi, 4) << s, lane_s(aLo, aHi, 5) << s, lane_s(aLo, aHi, 6) << s, lane_s(aLo, aHi, 7) << s)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(aLo: u64, aHi: u64, b: i32): u64 { const s = b & 15; return set_pair(pack4(lane_s(aLo, aHi, 0) >> s, lane_s(aLo, aHi, 1) >> s, lane_s(aLo, aHi, 2) >> s, lane_s(aLo, aHi, 3) >> s), pack4(lane_s(aLo, aHi, 4) >> s, lane_s(aLo, aHi, 5) >> s, lane_s(aLo, aHi, 6) >> s, lane_s(aLo, aHi, 7) >> s)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(aLo: u64, aHi: u64, b: i32): u64 { const s = b & 15; return set_pair(pack4u((lane_u(aLo, aHi, 0) >> s) as u16, (lane_u(aLo, aHi, 1) >> s) as u16, (lane_u(aLo, aHi, 2) >> s) as u16, (lane_u(aLo, aHi, 3) >> s) as u16), pack4u((lane_u(aLo, aHi, 4) >> s) as u16, (lane_u(aLo, aHi, 5) >> s) as u16, (lane_u(aLo, aHi, 6) >> s) as u16, (lane_u(aLo, aHi, 7) >> s) as u16)); }
  // @ts-expect-error: decorator
  @inline export function all_true(aLo: u64, aHi: u64): bool { return lane_s(aLo, aHi, 0) != 0 && lane_s(aLo, aHi, 1) != 0 && lane_s(aLo, aHi, 2) != 0 && lane_s(aLo, aHi, 3) != 0 && lane_s(aLo, aHi, 4) != 0 && lane_s(aLo, aHi, 5) != 0 && lane_s(aLo, aHi, 6) != 0 && lane_s(aLo, aHi, 7) != 0; }
  // @ts-expect-error: decorator
  @inline export function bitmask(aLo: u64, aHi: u64): i32 {
    let m = 0;
    if (lane_s(aLo, aHi, 0) < 0) m |= 1;
    if (lane_s(aLo, aHi, 1) < 0) m |= 2;
    if (lane_s(aLo, aHi, 2) < 0) m |= 4;
    if (lane_s(aLo, aHi, 3) < 0) m |= 8;
    if (lane_s(aLo, aHi, 4) < 0) m |= 16;
    if (lane_s(aLo, aHi, 5) < 0) m |= 32;
    if (lane_s(aLo, aHi, 6) < 0) m |= 64;
    if (lane_s(aLo, aHi, 7) < 0) m |= 128;
    return m;
  }
  // @ts-expect-error: decorator
  @inline export function eq(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(mask(lane_s(aLo, aHi, 0) == lane_s(bLo, bHi, 0)), mask(lane_s(aLo, aHi, 1) == lane_s(bLo, bHi, 1)), mask(lane_s(aLo, aHi, 2) == lane_s(bLo, bHi, 2)), mask(lane_s(aLo, aHi, 3) == lane_s(bLo, bHi, 3))), pack4(mask(lane_s(aLo, aHi, 4) == lane_s(bLo, bHi, 4)), mask(lane_s(aLo, aHi, 5) == lane_s(bLo, bHi, 5)), mask(lane_s(aLo, aHi, 6) == lane_s(bLo, bHi, 6)), mask(lane_s(aLo, aHi, 7) == lane_s(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function ne(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(mask(lane_s(aLo, aHi, 0) != lane_s(bLo, bHi, 0)), mask(lane_s(aLo, aHi, 1) != lane_s(bLo, bHi, 1)), mask(lane_s(aLo, aHi, 2) != lane_s(bLo, bHi, 2)), mask(lane_s(aLo, aHi, 3) != lane_s(bLo, bHi, 3))), pack4(mask(lane_s(aLo, aHi, 4) != lane_s(bLo, bHi, 4)), mask(lane_s(aLo, aHi, 5) != lane_s(bLo, bHi, 5)), mask(lane_s(aLo, aHi, 6) != lane_s(bLo, bHi, 6)), mask(lane_s(aLo, aHi, 7) != lane_s(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(mask(lane_s(aLo, aHi, 0) < lane_s(bLo, bHi, 0)), mask(lane_s(aLo, aHi, 1) < lane_s(bLo, bHi, 1)), mask(lane_s(aLo, aHi, 2) < lane_s(bLo, bHi, 2)), mask(lane_s(aLo, aHi, 3) < lane_s(bLo, bHi, 3))), pack4(mask(lane_s(aLo, aHi, 4) < lane_s(bLo, bHi, 4)), mask(lane_s(aLo, aHi, 5) < lane_s(bLo, bHi, 5)), mask(lane_s(aLo, aHi, 6) < lane_s(bLo, bHi, 6)), mask(lane_s(aLo, aHi, 7) < lane_s(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(mask(lane_u(aLo, aHi, 0) < lane_u(bLo, bHi, 0)), mask(lane_u(aLo, aHi, 1) < lane_u(bLo, bHi, 1)), mask(lane_u(aLo, aHi, 2) < lane_u(bLo, bHi, 2)), mask(lane_u(aLo, aHi, 3) < lane_u(bLo, bHi, 3))), pack4(mask(lane_u(aLo, aHi, 4) < lane_u(bLo, bHi, 4)), mask(lane_u(aLo, aHi, 5) < lane_u(bLo, bHi, 5)), mask(lane_u(aLo, aHi, 6) < lane_u(bLo, bHi, 6)), mask(lane_u(aLo, aHi, 7) < lane_u(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function le_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(mask(lane_s(aLo, aHi, 0) <= lane_s(bLo, bHi, 0)), mask(lane_s(aLo, aHi, 1) <= lane_s(bLo, bHi, 1)), mask(lane_s(aLo, aHi, 2) <= lane_s(bLo, bHi, 2)), mask(lane_s(aLo, aHi, 3) <= lane_s(bLo, bHi, 3))), pack4(mask(lane_s(aLo, aHi, 4) <= lane_s(bLo, bHi, 4)), mask(lane_s(aLo, aHi, 5) <= lane_s(bLo, bHi, 5)), mask(lane_s(aLo, aHi, 6) <= lane_s(bLo, bHi, 6)), mask(lane_s(aLo, aHi, 7) <= lane_s(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function le_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(pack4(mask(lane_u(aLo, aHi, 0) <= lane_u(bLo, bHi, 0)), mask(lane_u(aLo, aHi, 1) <= lane_u(bLo, bHi, 1)), mask(lane_u(aLo, aHi, 2) <= lane_u(bLo, bHi, 2)), mask(lane_u(aLo, aHi, 3) <= lane_u(bLo, bHi, 3))), pack4(mask(lane_u(aLo, aHi, 4) <= lane_u(bLo, bHi, 4)), mask(lane_u(aLo, aHi, 5) <= lane_u(bLo, bHi, 5)), mask(lane_u(aLo, aHi, 6) <= lane_u(bLo, bHi, 6)), mask(lane_u(aLo, aHi, 7) <= lane_u(bLo, bHi, 7)))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return lt_s(bLo, bHi, aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function gt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return lt_u(bLo, bHi, aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function ge_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return le_s(bLo, bHi, aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function ge_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return le_u(bLo, bHi, aLo, aHi); }

  // @ts-expect-error: decorator
  @inline export function narrow_i32x4_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(pack4(sat_s((aLo as u32) as i32), sat_s(((aLo >> 32) as u32) as i32), sat_s((aHi as u32) as i32), sat_s(((aHi >> 32) as u32) as i32)), pack4(sat_s((bLo as u32) as i32), sat_s(((bLo >> 32) as u32) as i32), sat_s((bHi as u32) as i32), sat_s(((bHi >> 32) as u32) as i32)));
  }
  // @ts-expect-error: decorator
  @inline export function narrow_i32x4_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(pack4u(sat_u((aLo as u32) as i32), sat_u(((aLo >> 32) as u32) as i32), sat_u((aHi as u32) as i32), sat_u(((aHi >> 32) as u32) as i32)), pack4u(sat_u((bLo as u32) as i32), sat_u(((bLo >> 32) as u32) as i32), sat_u((bHi as u32) as i32), sat_u(((bHi >> 32) as u32) as i32)));
  }
  // @ts-expect-error: decorator
  @inline export function extend_low_i8x16_s(aLo: u64, aHi: u64): u64 {
    const a0 = ((aLo & 0xff) as u8) as i8 as i16;
    const a1 = (((aLo >> 8) & 0xff) as u8) as i8 as i16;
    const a2 = (((aLo >> 16) & 0xff) as u8) as i8 as i16;
    const a3 = (((aLo >> 24) & 0xff) as u8) as i8 as i16;
    const a4 = (((aLo >> 32) & 0xff) as u8) as i8 as i16;
    const a5 = (((aLo >> 40) & 0xff) as u8) as i8 as i16;
    const a6 = (((aLo >> 48) & 0xff) as u8) as i8 as i16;
    const a7 = (((aLo >> 56) & 0xff) as u8) as i8 as i16;
    return set_pair(pack4(a0, a1, a2, a3), pack4(a4, a5, a6, a7));
  }
  // @ts-expect-error: decorator
  @inline export function extend_low_i8x16_u(aLo: u64, aHi: u64): u64 {
    return set_pair(
      pack4u((aLo & 0xff) as u16, ((aLo >> 8) & 0xff) as u16, ((aLo >> 16) & 0xff) as u16, ((aLo >> 24) & 0xff) as u16),
      pack4u(((aLo >> 32) & 0xff) as u16, ((aLo >> 40) & 0xff) as u16, ((aLo >> 48) & 0xff) as u16, ((aLo >> 56) & 0xff) as u16),
    );
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i8x16_s(aLo: u64, aHi: u64): u64 {
    const a0 = ((aHi & 0xff) as u8) as i8 as i16;
    const a1 = (((aHi >> 8) & 0xff) as u8) as i8 as i16;
    const a2 = (((aHi >> 16) & 0xff) as u8) as i8 as i16;
    const a3 = (((aHi >> 24) & 0xff) as u8) as i8 as i16;
    const a4 = (((aHi >> 32) & 0xff) as u8) as i8 as i16;
    const a5 = (((aHi >> 40) & 0xff) as u8) as i8 as i16;
    const a6 = (((aHi >> 48) & 0xff) as u8) as i8 as i16;
    const a7 = (((aHi >> 56) & 0xff) as u8) as i8 as i16;
    return set_pair(pack4(a0, a1, a2, a3), pack4(a4, a5, a6, a7));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i8x16_u(aLo: u64, aHi: u64): u64 {
    return set_pair(
      pack4u((aHi & 0xff) as u16, ((aHi >> 8) & 0xff) as u16, ((aHi >> 16) & 0xff) as u16, ((aHi >> 24) & 0xff) as u16),
      pack4u(((aHi >> 32) & 0xff) as u16, ((aHi >> 40) & 0xff) as u16, ((aHi >> 48) & 0xff) as u16, ((aHi >> 56) & 0xff) as u16),
    );
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x16_s(aLo: u64, aHi: u64): u64 {
    const ex = extend_low_i8x16_s(aLo, aHi);
    const eh = take_hi();
    return extadd_pairwise_i16x8_s(ex, eh);
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x16_u(aLo: u64, aHi: u64): u64 {
    const ex = extend_low_i8x16_u(aLo, aHi);
    const eh = take_hi();
    return extadd_pairwise_i16x8_u(ex, eh);
  }
  // @ts-expect-error: decorator
  @inline export function q15mulr_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const r0 = sat_s(((lane_s(aLo, aHi, 0) as i32 * lane_s(bLo, bHi, 0) as i32 + 0x4000) >> 15));
    const r1 = sat_s(((lane_s(aLo, aHi, 1) as i32 * lane_s(bLo, bHi, 1) as i32 + 0x4000) >> 15));
    const r2 = sat_s(((lane_s(aLo, aHi, 2) as i32 * lane_s(bLo, bHi, 2) as i32 + 0x4000) >> 15));
    const r3 = sat_s(((lane_s(aLo, aHi, 3) as i32 * lane_s(bLo, bHi, 3) as i32 + 0x4000) >> 15));
    const r4 = sat_s(((lane_s(aLo, aHi, 4) as i32 * lane_s(bLo, bHi, 4) as i32 + 0x4000) >> 15));
    const r5 = sat_s(((lane_s(aLo, aHi, 5) as i32 * lane_s(bLo, bHi, 5) as i32 + 0x4000) >> 15));
    const r6 = sat_s(((lane_s(aLo, aHi, 6) as i32 * lane_s(bLo, bHi, 6) as i32 + 0x4000) >> 15));
    const r7 = sat_s(((lane_s(aLo, aHi, 7) as i32 * lane_s(bLo, bHi, 7) as i32 + 0x4000) >> 15));
    return set_pair(pack4(r0, r1, r2, r3), pack4(r4, r5, r6, r7));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i8x16_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const ax = extend_low_i8x16_s(aLo, aHi); const ay = take_hi();
    const bx = extend_low_i8x16_s(bLo, bHi); const by = take_hi();
    return mul(ax, ay, bx, by);
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i8x16_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const ax = extend_low_i8x16_u(aLo, aHi); const ay = take_hi();
    const bx = extend_low_i8x16_u(bLo, bHi); const by = take_hi();
    return mul(ax, ay, bx, by);
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i8x16_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const ax = extend_high_i8x16_s(aLo, aHi); const ay = take_hi();
    const bx = extend_high_i8x16_s(bLo, bHi); const by = take_hi();
    return mul(ax, ay, bx, by);
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i8x16_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const ax = extend_high_i8x16_u(aLo, aHi); const ay = take_hi();
    const bx = extend_high_i8x16_u(bLo, bHi); const by = take_hi();
    return mul(ax, ay, bx, by);
  }
  // @ts-expect-error: decorator
  @inline export function shuffle(aLo: u64, aHi: u64, bLo: u64, bHi: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
    const r0 = (l0 & 15) < 8 ? lane_s(aLo, aHi, l0 & 7) : lane_s(bLo, bHi, l0 & 7);
    const r1 = (l1 & 15) < 8 ? lane_s(aLo, aHi, l1 & 7) : lane_s(bLo, bHi, l1 & 7);
    const r2 = (l2 & 15) < 8 ? lane_s(aLo, aHi, l2 & 7) : lane_s(bLo, bHi, l2 & 7);
    const r3 = (l3 & 15) < 8 ? lane_s(aLo, aHi, l3 & 7) : lane_s(bLo, bHi, l3 & 7);
    const r4 = (l4 & 15) < 8 ? lane_s(aLo, aHi, l4 & 7) : lane_s(bLo, bHi, l4 & 7);
    const r5 = (l5 & 15) < 8 ? lane_s(aLo, aHi, l5 & 7) : lane_s(bLo, bHi, l5 & 7);
    const r6 = (l6 & 15) < 8 ? lane_s(aLo, aHi, l6 & 7) : lane_s(bLo, bHi, l6 & 7);
    const r7 = (l7 & 15) < 8 ? lane_s(aLo, aHi, l7 & 7) : lane_s(bLo, bHi, l7 & 7);
    return set_pair(pack4(r0, r1, r2, r3), pack4(r4, r5, r6, r7));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(aLo: u64, aHi: u64, bLo: u64, bHi: u64, mLo: u64, mHi: u64): u64 {
    const r0 = lane_s(mLo, mHi, 0) < 0 ? lane_s(aLo, aHi, 0) : lane_s(bLo, bHi, 0);
    const r1 = lane_s(mLo, mHi, 1) < 0 ? lane_s(aLo, aHi, 1) : lane_s(bLo, bHi, 1);
    const r2 = lane_s(mLo, mHi, 2) < 0 ? lane_s(aLo, aHi, 2) : lane_s(bLo, bHi, 2);
    const r3 = lane_s(mLo, mHi, 3) < 0 ? lane_s(aLo, aHi, 3) : lane_s(bLo, bHi, 3);
    const r4 = lane_s(mLo, mHi, 4) < 0 ? lane_s(aLo, aHi, 4) : lane_s(bLo, bHi, 4);
    const r5 = lane_s(mLo, mHi, 5) < 0 ? lane_s(aLo, aHi, 5) : lane_s(bLo, bHi, 5);
    const r6 = lane_s(mLo, mHi, 6) < 0 ? lane_s(aLo, aHi, 6) : lane_s(bLo, bHi, 6);
    const r7 = lane_s(mLo, mHi, 7) < 0 ? lane_s(aLo, aHi, 7) : lane_s(bLo, bHi, 7);
    return set_pair(pack4(r0, r1, r2, r3), pack4(r4, r5, r6, r7));
  }
}

import { i16x4 } from "../v64/i16x4";
import { i32x4_swar } from "./i32x4_swar";

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
  @inline function i8_lane_s(lo: u64, hi: u64, idx: i32): i16 {
    const v = idx < 8 ? lo : hi;
    return (((v >> ((idx & 7) << 3)) as u8) as i8) as i16;
  }
  // @ts-expect-error: decorator
  @inline function i8_lane_u(lo: u64, hi: u64, idx: i32): u16 {
    const v = idx < 8 ? lo : hi;
    return ((v >> ((idx & 7) << 3)) as u8) as u16;
  }
  // @ts-expect-error: decorator
  @inline function pack4(a: i32, b: i32, c: i32, d: i32): u64 {
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
  @inline function abs16(x: i16): i16 { return x < 0 ? -x : x; }
  // @ts-expect-error: decorator
  @inline function shl16(x: i16, s: i32): i32 { return (x as i32) << s; }
  // @ts-expect-error: decorator
  @inline function shr16(x: i16, s: i32): i32 { return (x as i32) >> s; }
  // @ts-expect-error: decorator
  @inline function mask(pred: bool): i16 { return pred ? -1 : 0; }
  // @ts-expect-error: decorator
  @inline function avgr_u16(a: u16, b: u16): u16 { return (((a as u32) + (b as u32) + 1) >> 1) as u16; }
  // @ts-expect-error: decorator
  @inline function add_s_sat(a: i16, b: i16): i16 { return sat_s((a as i32) + (b as i32)); }
  // @ts-expect-error: decorator
  @inline function add_u_sat(a: u16, b: u16): u16 { return sat_u((a as i32) + (b as i32)); }
  // @ts-expect-error: decorator
  @inline function sub_s_sat(a: i16, b: i16): i16 { return sat_s((a as i32) - (b as i32)); }
  // @ts-expect-error: decorator
  @inline function sub_u_sat(a: u16, b: u16): u16 { return sat_u((a as i32) - (b as i32)); }

  // @ts-expect-error: decorator
  @inline export function splat(x: i16): u64 { const p = i16x4.splat(x); return set_pair(p, p); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(lo: u64, hi: u64, idx: u8): i16 { return lane_s(lo, hi, idx); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(lo: u64, hi: u64, idx: u8): u16 { return lane_u(lo, hi, idx); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(lo: u64, hi: u64, idx: u8, value: i16): u64 {
    const i = idx & 7;
    return i < 4 ? set_pair(i16x4.replace_lane(lo, i, value), hi) : set_pair(lo, i16x4.replace_lane(hi, i - 4, value));
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
  @inline export function add(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.add(aLo, bLo), i16x4.add(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function sub(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.sub(aLo, bLo), i16x4.sub(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function mul(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.mul(aLo, bLo), i16x4.mul(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function min_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.min_s(aLo, bLo), i16x4.min_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function min_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.min_u(aLo, bLo), i16x4.min_u(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function max_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.max_s(aLo, bLo), i16x4.max_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function max_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.max_u(aLo, bLo), i16x4.max_u(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function avgr_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i16x4.avgr_u(aLo, bLo), i16x4.avgr_u(aHi, bHi));
  }
  // @ts-expect-error: decorator
  @inline export function abs(aLo: u64, aHi: u64): u64 {
    const mLo = ((aLo & 0x8000800080008000) >> 15) * 0xffff;
    const xLo = aLo ^ mLo;
    const mHi = ((aHi & 0x8000800080008000) >> 15) * 0xffff;
    const xHi = aHi ^ mHi;
    return set_pair(
      ((xLo | 0x8000800080008000) - (mLo & 0x7fff7fff7fff7fff)) ^ ((xLo ^ ~mLo) & 0x8000800080008000),
      ((xHi | 0x8000800080008000) - (mHi & 0x7fff7fff7fff7fff)) ^ ((xHi ^ ~mHi) & 0x8000800080008000),
    );
  }
  // @ts-expect-error: decorator
  @inline export function neg(aLo: u64, aHi: u64): u64 {
    return set_pair(
      (0x8000800080008000 - (aLo & 0x7fff7fff7fff7fff)) ^ ((~aLo) & 0x8000800080008000),
      (0x8000800080008000 - (aHi & 0x7fff7fff7fff7fff)) ^ ((~aHi) & 0x8000800080008000),
    );
  }
  // @ts-expect-error: decorator
  @inline export function add_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.add_sat_s(aLo, bLo), i16x4.add_sat_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function add_sat_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.add_sat_u(aLo, bLo), i16x4.add_sat_u(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.sub_sat_s(aLo, bLo), i16x4.sub_sat_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.sub_sat_u(aLo, bLo), i16x4.sub_sat_u(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function shl(aLo: u64, aHi: u64, b: i32): u64 { return set_pair(i16x4.shl(aLo, b), i16x4.shl(aHi, b)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(aLo: u64, aHi: u64, b: i32): u64 { return set_pair(i16x4.shr_s(aLo, b), i16x4.shr_s(aHi, b)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(aLo: u64, aHi: u64, b: i32): u64 { return set_pair(i16x4.shr_u(aLo, b), i16x4.shr_u(aHi, b)); }
  // @ts-expect-error: decorator
  @inline export function all_true(aLo: u64, aHi: u64): bool { return i16x4.all_true(aLo) && i16x4.all_true(aHi); }
  // @ts-expect-error: decorator
  @inline export function bitmask(aLo: u64, aHi: u64): i32 {
    return i16x4.bitmask(aLo) | (i16x4.bitmask(aHi) << 4);
  }
  // @ts-expect-error: decorator
  @inline export function eq(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.eq(aLo, bLo), i16x4.eq(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function ne(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.ne(aLo, bLo), i16x4.ne(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function lt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.lt_s(aLo, bLo), i16x4.lt_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function lt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.lt_u(aLo, bLo), i16x4.lt_u(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function le_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.le_s(aLo, bLo), i16x4.le_s(aHi, bHi)); }
  // @ts-expect-error: decorator
  @inline export function le_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x4.le_u(aLo, bLo), i16x4.le_u(aHi, bHi)); }
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
    return set_pair(
      pack4(i8_lane_s(aLo,aHi,0)+i8_lane_s(aLo,aHi,1), i8_lane_s(aLo,aHi,2)+i8_lane_s(aLo,aHi,3), i8_lane_s(aLo,aHi,4)+i8_lane_s(aLo,aHi,5), i8_lane_s(aLo,aHi,6)+i8_lane_s(aLo,aHi,7)),
      pack4(i8_lane_s(aLo,aHi,8)+i8_lane_s(aLo,aHi,9), i8_lane_s(aLo,aHi,10)+i8_lane_s(aLo,aHi,11), i8_lane_s(aLo,aHi,12)+i8_lane_s(aLo,aHi,13), i8_lane_s(aLo,aHi,14)+i8_lane_s(aLo,aHi,15)),
    );
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x16_u(aLo: u64, aHi: u64): u64 {
    return set_pair(
      pack4u(i8_lane_u(aLo,aHi,0)+i8_lane_u(aLo,aHi,1), i8_lane_u(aLo,aHi,2)+i8_lane_u(aLo,aHi,3), i8_lane_u(aLo,aHi,4)+i8_lane_u(aLo,aHi,5), i8_lane_u(aLo,aHi,6)+i8_lane_u(aLo,aHi,7)),
      pack4u(i8_lane_u(aLo,aHi,8)+i8_lane_u(aLo,aHi,9), i8_lane_u(aLo,aHi,10)+i8_lane_u(aLo,aHi,11), i8_lane_u(aLo,aHi,12)+i8_lane_u(aLo,aHi,13), i8_lane_u(aLo,aHi,14)+i8_lane_u(aLo,aHi,15)),
    );
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
  // @ts-expect-error: decorator
  @inline export function relaxed_dot_i8x16_i7x16_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(i16x4.relaxed_dot_i8x8_i7x8_s(aLo, bLo), i16x4.relaxed_dot_i8x8_i7x8_s(aHi, bHi));
  }
}

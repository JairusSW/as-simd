import { v64 } from "../v64/v64";
import { i8x8 } from "../v64/i8x8";
import { i64x2_swar } from "./i64x2_swar";
import { swar_arena } from "./swar_arena";
import { v128_swar } from "./v128_swar";

export type i8x16_swar = v128_swar;

export namespace i8x16_swar {
  // @ts-expect-error: decorator
  @inline function lo(x: v128): v64 {
    if (ASC_FEATURE_SIMD) return i64x2.extract_lane(x, 0) as v64;
    return i64x2_swar.extract_lane(x, 0) as v64;
  }
  // @ts-expect-error: decorator
  @inline function hi(x: v128): v64 {
    if (ASC_FEATURE_SIMD) return i64x2.extract_lane(x, 1) as v64;
    return i64x2_swar.extract_lane(x, 1) as v64;
  }
  // @ts-expect-error: decorator
  @inline function pack(l: v64, h: v64): v128 {
    if (ASC_FEATURE_SIMD) return i64x2(l as i64, h as i64);
    const tmp = swar_arena.alloc16();
    store<i64>(tmp, l as i64);
    store<i64>(tmp + 8, h as i64);
    return load<v128>(tmp);
  }

  // @ts-expect-error: decorator
  @inline export function splat(x: i8): v128 {
    if (ASC_FEATURE_SIMD) return i8x16.splat(x);
    return pack(i8x8.splat(x), i8x8.splat(x));
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(x: v128, idx: u8): i8 {
    if (ASC_FEATURE_SIMD) {
      switch (idx & 15) {
        case 0: return i8x16.extract_lane_s(x, 0);
        case 1: return i8x16.extract_lane_s(x, 1);
        case 2: return i8x16.extract_lane_s(x, 2);
        case 3: return i8x16.extract_lane_s(x, 3);
        case 4: return i8x16.extract_lane_s(x, 4);
        case 5: return i8x16.extract_lane_s(x, 5);
        case 6: return i8x16.extract_lane_s(x, 6);
        case 7: return i8x16.extract_lane_s(x, 7);
        case 8: return i8x16.extract_lane_s(x, 8);
        case 9: return i8x16.extract_lane_s(x, 9);
        case 10: return i8x16.extract_lane_s(x, 10);
        case 11: return i8x16.extract_lane_s(x, 11);
        case 12: return i8x16.extract_lane_s(x, 12);
        case 13: return i8x16.extract_lane_s(x, 13);
        case 14: return i8x16.extract_lane_s(x, 14);
        default: return i8x16.extract_lane_s(x, 15);
      }
    }
    return (idx & 15) < 8 ? i8x8.extract_lane_s(lo(x), idx & 7) : i8x8.extract_lane_s(hi(x), idx & 7);
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: v128, idx: u8): u8 {
    if (ASC_FEATURE_SIMD) {
      switch (idx & 15) {
        case 0: return i8x16.extract_lane_u(x, 0);
        case 1: return i8x16.extract_lane_u(x, 1);
        case 2: return i8x16.extract_lane_u(x, 2);
        case 3: return i8x16.extract_lane_u(x, 3);
        case 4: return i8x16.extract_lane_u(x, 4);
        case 5: return i8x16.extract_lane_u(x, 5);
        case 6: return i8x16.extract_lane_u(x, 6);
        case 7: return i8x16.extract_lane_u(x, 7);
        case 8: return i8x16.extract_lane_u(x, 8);
        case 9: return i8x16.extract_lane_u(x, 9);
        case 10: return i8x16.extract_lane_u(x, 10);
        case 11: return i8x16.extract_lane_u(x, 11);
        case 12: return i8x16.extract_lane_u(x, 12);
        case 13: return i8x16.extract_lane_u(x, 13);
        case 14: return i8x16.extract_lane_u(x, 14);
        default: return i8x16.extract_lane_u(x, 15);
      }
    }
    return (idx & 15) < 8 ? i8x8.extract_lane_u(lo(x), idx & 7) : i8x8.extract_lane_u(hi(x), idx & 7);
  }
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v128, idx: u8, value: i8): v128 {
    if (ASC_FEATURE_SIMD) {
      switch (idx & 15) {
        case 0: return i8x16.replace_lane(x, 0, value);
        case 1: return i8x16.replace_lane(x, 1, value);
        case 2: return i8x16.replace_lane(x, 2, value);
        case 3: return i8x16.replace_lane(x, 3, value);
        case 4: return i8x16.replace_lane(x, 4, value);
        case 5: return i8x16.replace_lane(x, 5, value);
        case 6: return i8x16.replace_lane(x, 6, value);
        case 7: return i8x16.replace_lane(x, 7, value);
        case 8: return i8x16.replace_lane(x, 8, value);
        case 9: return i8x16.replace_lane(x, 9, value);
        case 10: return i8x16.replace_lane(x, 10, value);
        case 11: return i8x16.replace_lane(x, 11, value);
        case 12: return i8x16.replace_lane(x, 12, value);
        case 13: return i8x16.replace_lane(x, 13, value);
        case 14: return i8x16.replace_lane(x, 14, value);
        default: return i8x16.replace_lane(x, 15, value);
      }
    }
    const i = idx & 15;
    const l = lo(x), h = hi(x);
    return i < 8 ? pack(i8x8.replace_lane(l, i, value), h) : pack(l, i8x8.replace_lane(h, i & 7, value));
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): v128 {
    const base = ptr + immOffset;
    if (len <= 0) return splat(fill);
    if (len >= 16) return load<v128>(ptr, immOffset, immAlign);

    if (ASC_FEATURE_SIMD) {
      const tmp = swar_arena.alloc16();
      store<v128>(tmp, i8x16.splat(fill));

      if (len >= 8) {
        store<u64>(tmp, load<u64>(base));
        const tail = len - 8;
        switch (tail) {
          case 1: {
            store<u8>(tmp + 8, load<u8>(base + 8));
            break;
          }
          case 2: {
            store<u16>(tmp + 8, load<u16>(base + 8));
            break;
          }
          case 3: {
            store<u16>(tmp + 8, load<u16>(base + 8));
            store<u8>(tmp + 10, load<u8>(base + 10));
            break;
          }
          case 4: {
            store<u32>(tmp + 8, load<u32>(base + 8));
            break;
          }
          case 5: {
            store<u32>(tmp + 8, load<u32>(base + 8));
            store<u8>(tmp + 12, load<u8>(base + 12));
            break;
          }
          case 6: {
            store<u32>(tmp + 8, load<u32>(base + 8));
            store<u16>(tmp + 12, load<u16>(base + 12));
            break;
          }
          case 7: {
            store<u32>(tmp + 8, load<u32>(base + 8));
            store<u16>(tmp + 12, load<u16>(base + 12));
            store<u8>(tmp + 14, load<u8>(base + 14));
            break;
          }
          default: break;
        }
      } else {
        switch (len) {
          case 1: {
            store<u8>(tmp, load<u8>(base));
            break;
          }
          case 2: {
            store<u16>(tmp, load<u16>(base));
            break;
          }
          case 3: {
            store<u16>(tmp, load<u16>(base));
            store<u8>(tmp + 2, load<u8>(base + 2));
            break;
          }
          case 4: {
            store<u32>(tmp, load<u32>(base));
            break;
          }
          case 5: {
            store<u32>(tmp, load<u32>(base));
            store<u8>(tmp + 4, load<u8>(base + 4));
            break;
          }
          case 6: {
            store<u32>(tmp, load<u32>(base));
            store<u16>(tmp + 4, load<u16>(base + 4));
            break;
          }
          case 7: {
            store<u32>(tmp, load<u32>(base));
            store<u16>(tmp + 4, load<u16>(base + 4));
            store<u8>(tmp + 6, load<u8>(base + 6));
            break;
          }
          default: break;
        }
      }

      return load<v128>(tmp);
    }

    if (len <= 8) return pack(i8x8.loadPartial(base, len, 0, immAlign, fill), i8x8.splat(fill));
    return pack(i8x8.loadPartial(base, 8, 0, immAlign, fill), i8x8.loadPartial(base + 8, len - 8, 0, immAlign, fill));
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v128, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(16, nn, nn > 16);
    if (n == 0) return;
    if (ASC_FEATURE_SIMD && n == 16) {
      store<v128>(ptr, value, immOffset, immAlign);
      return;
    }
    if (n <= 8) {
      i8x8.storePartial(ptr, lo(value), n, immOffset, immAlign);
      return;
    }
    const base = ptr + immOffset;
    i8x8.storePartial(base, lo(value), 8, 0, immAlign);
    i8x8.storePartial(base + 8, hi(value), n - 8, 0, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function add(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.add(a, b); return pack(i8x8.add(lo(a), lo(b)), i8x8.add(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.sub(a, b); return pack(i8x8.sub(lo(a), lo(b)), i8x8.sub(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function mul(a: v128, b: v128): v128 { return pack(i8x8.mul(lo(a), lo(b)), i8x8.mul(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.min_s(a, b); return pack(i8x8.min_s(lo(a), lo(b)), i8x8.min_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.min_u(a, b); return pack(i8x8.min_u(lo(a), lo(b)), i8x8.min_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.max_s(a, b); return pack(i8x8.max_s(lo(a), lo(b)), i8x8.max_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.max_u(a, b); return pack(i8x8.max_u(lo(a), lo(b)), i8x8.max_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function avgr_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.avgr_u(a, b); return pack(i8x8.avgr_u(lo(a), lo(b)), i8x8.avgr_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function abs(a: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.abs(a); return pack(i8x8.abs(lo(a)), i8x8.abs(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function neg(a: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.neg(a); return pack(i8x8.neg(lo(a)), i8x8.neg(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.add_sat_s(a, b); return pack(i8x8.add_sat_s(lo(a), lo(b)), i8x8.add_sat_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.add_sat_u(a, b); return pack(i8x8.add_sat_u(lo(a), lo(b)), i8x8.add_sat_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.sub_sat_s(a, b); return pack(i8x8.sub_sat_s(lo(a), lo(b)), i8x8.sub_sat_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.sub_sat_u(a, b); return pack(i8x8.sub_sat_u(lo(a), lo(b)), i8x8.sub_sat_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function shl(a: v128, b: i32): v128 { if (ASC_FEATURE_SIMD) return i8x16.shl(a, b); return pack(i8x8.shl(lo(a), b), i8x8.shl(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v128, b: i32): v128 { if (ASC_FEATURE_SIMD) return i8x16.shr_s(a, b); return pack(i8x8.shr_s(lo(a), b), i8x8.shr_s(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v128, b: i32): v128 { if (ASC_FEATURE_SIMD) return i8x16.shr_u(a, b); return pack(i8x8.shr_u(lo(a), b), i8x8.shr_u(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function all_true(a: v128): bool { if (ASC_FEATURE_SIMD) return i8x16.all_true(a); return i8x8.all_true(lo(a)) && i8x8.all_true(hi(a)); }
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v128): i32 { if (ASC_FEATURE_SIMD) return i8x16.bitmask(a); return i8x8.bitmask(lo(a)) | (i8x8.bitmask(hi(a)) << 8); }
  // @ts-expect-error: decorator
  @inline export function popcnt(a: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.popcnt(a); return pack(i8x8.popcnt(lo(a)), i8x8.popcnt(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function eq(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.eq(a, b); return pack(i8x8.eq(lo(a), lo(b)), i8x8.eq(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ne(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.ne(a, b); return pack(i8x8.ne(lo(a), lo(b)), i8x8.ne(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.lt_s(a, b); return pack(i8x8.lt_s(lo(a), lo(b)), i8x8.lt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.lt_u(a, b); return pack(i8x8.lt_u(lo(a), lo(b)), i8x8.lt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.le_s(a, b); return pack(i8x8.le_s(lo(a), lo(b)), i8x8.le_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.le_u(a, b); return pack(i8x8.le_u(lo(a), lo(b)), i8x8.le_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.gt_s(a, b); return pack(i8x8.gt_s(lo(a), lo(b)), i8x8.gt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.gt_u(a, b); return pack(i8x8.gt_u(lo(a), lo(b)), i8x8.gt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.ge_s(a, b); return pack(i8x8.ge_s(lo(a), lo(b)), i8x8.ge_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i8x16.ge_u(a, b); return pack(i8x8.ge_u(lo(a), lo(b)), i8x8.ge_u(hi(a), hi(b))); }

  // @ts-expect-error: decorator
  @inline export function narrow_i16x8_s(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i8x16.narrow_i16x8_s(a, b);
    return pack(i8x8.narrow_i16x4_s(lo(a), hi(a)), i8x8.narrow_i16x4_s(lo(b), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function narrow_i16x8_u(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i8x16.narrow_i16x8_u(a, b);
    return pack(i8x8.narrow_i16x4_u(lo(a), hi(a)), i8x8.narrow_i16x4_u(lo(b), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v128, b: v128, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8, l8: u8, l9: u8, l10: u8, l11: u8, l12: u8, l13: u8, l14: u8, l15: u8): v128 {
    let r = splat(0);
    r = replace_lane(r, 0, ((l0 & 31) < 16 ? extract_lane_s(a, l0) : extract_lane_s(b, (l0 - 16) & 15)));
    r = replace_lane(r, 1, ((l1 & 31) < 16 ? extract_lane_s(a, l1) : extract_lane_s(b, (l1 - 16) & 15)));
    r = replace_lane(r, 2, ((l2 & 31) < 16 ? extract_lane_s(a, l2) : extract_lane_s(b, (l2 - 16) & 15)));
    r = replace_lane(r, 3, ((l3 & 31) < 16 ? extract_lane_s(a, l3) : extract_lane_s(b, (l3 - 16) & 15)));
    r = replace_lane(r, 4, ((l4 & 31) < 16 ? extract_lane_s(a, l4) : extract_lane_s(b, (l4 - 16) & 15)));
    r = replace_lane(r, 5, ((l5 & 31) < 16 ? extract_lane_s(a, l5) : extract_lane_s(b, (l5 - 16) & 15)));
    r = replace_lane(r, 6, ((l6 & 31) < 16 ? extract_lane_s(a, l6) : extract_lane_s(b, (l6 - 16) & 15)));
    r = replace_lane(r, 7, ((l7 & 31) < 16 ? extract_lane_s(a, l7) : extract_lane_s(b, (l7 - 16) & 15)));
    r = replace_lane(r, 8, ((l8 & 31) < 16 ? extract_lane_s(a, l8) : extract_lane_s(b, (l8 - 16) & 15)));
    r = replace_lane(r, 9, ((l9 & 31) < 16 ? extract_lane_s(a, l9) : extract_lane_s(b, (l9 - 16) & 15)));
    r = replace_lane(r, 10, ((l10 & 31) < 16 ? extract_lane_s(a, l10) : extract_lane_s(b, (l10 - 16) & 15)));
    r = replace_lane(r, 11, ((l11 & 31) < 16 ? extract_lane_s(a, l11) : extract_lane_s(b, (l11 - 16) & 15)));
    r = replace_lane(r, 12, ((l12 & 31) < 16 ? extract_lane_s(a, l12) : extract_lane_s(b, (l12 - 16) & 15)));
    r = replace_lane(r, 13, ((l13 & 31) < 16 ? extract_lane_s(a, l13) : extract_lane_s(b, (l13 - 16) & 15)));
    r = replace_lane(r, 14, ((l14 & 31) < 16 ? extract_lane_s(a, l14) : extract_lane_s(b, (l14 - 16) & 15)));
    r = replace_lane(r, 15, ((l15 & 31) < 16 ? extract_lane_s(a, l15) : extract_lane_s(b, (l15 - 16) & 15)));
    return r;
  }
  // @ts-expect-error: decorator
  @inline export function swizzle(a: v128, s: v128): v128 {
    if (ASC_FEATURE_SIMD) return i8x16.swizzle(a, s);
    let r = splat(0);
    const i0 = extract_lane_u(s, 0); r = replace_lane(r, 0, i0 < 16 ? extract_lane_s(a, i0) : 0);
    const i1 = extract_lane_u(s, 1); r = replace_lane(r, 1, i1 < 16 ? extract_lane_s(a, i1) : 0);
    const i2 = extract_lane_u(s, 2); r = replace_lane(r, 2, i2 < 16 ? extract_lane_s(a, i2) : 0);
    const i3 = extract_lane_u(s, 3); r = replace_lane(r, 3, i3 < 16 ? extract_lane_s(a, i3) : 0);
    const i4 = extract_lane_u(s, 4); r = replace_lane(r, 4, i4 < 16 ? extract_lane_s(a, i4) : 0);
    const i5 = extract_lane_u(s, 5); r = replace_lane(r, 5, i5 < 16 ? extract_lane_s(a, i5) : 0);
    const i6 = extract_lane_u(s, 6); r = replace_lane(r, 6, i6 < 16 ? extract_lane_s(a, i6) : 0);
    const i7 = extract_lane_u(s, 7); r = replace_lane(r, 7, i7 < 16 ? extract_lane_s(a, i7) : 0);
    const i8 = extract_lane_u(s, 8); r = replace_lane(r, 8, i8 < 16 ? extract_lane_s(a, i8) : 0);
    const i9 = extract_lane_u(s, 9); r = replace_lane(r, 9, i9 < 16 ? extract_lane_s(a, i9) : 0);
    const i10 = extract_lane_u(s, 10); r = replace_lane(r, 10, i10 < 16 ? extract_lane_s(a, i10) : 0);
    const i11 = extract_lane_u(s, 11); r = replace_lane(r, 11, i11 < 16 ? extract_lane_s(a, i11) : 0);
    const i12 = extract_lane_u(s, 12); r = replace_lane(r, 12, i12 < 16 ? extract_lane_s(a, i12) : 0);
    const i13 = extract_lane_u(s, 13); r = replace_lane(r, 13, i13 < 16 ? extract_lane_s(a, i13) : 0);
    const i14 = extract_lane_u(s, 14); r = replace_lane(r, 14, i14 < 16 ? extract_lane_s(a, i14) : 0);
    const i15 = extract_lane_u(s, 15); r = replace_lane(r, 15, i15 < 16 ? extract_lane_s(a, i15) : 0);
    return r;
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(a: v128, s: v128): v128 {
    if (ASC_FEATURE_RELAXED_SIMD) return i8x16.relaxed_swizzle(a, s);
    let r = splat(0);
    r = replace_lane(r, 0, extract_lane_s(a, extract_lane_u(s, 0) & 15));
    r = replace_lane(r, 1, extract_lane_s(a, extract_lane_u(s, 1) & 15));
    r = replace_lane(r, 2, extract_lane_s(a, extract_lane_u(s, 2) & 15));
    r = replace_lane(r, 3, extract_lane_s(a, extract_lane_u(s, 3) & 15));
    r = replace_lane(r, 4, extract_lane_s(a, extract_lane_u(s, 4) & 15));
    r = replace_lane(r, 5, extract_lane_s(a, extract_lane_u(s, 5) & 15));
    r = replace_lane(r, 6, extract_lane_s(a, extract_lane_u(s, 6) & 15));
    r = replace_lane(r, 7, extract_lane_s(a, extract_lane_u(s, 7) & 15));
    r = replace_lane(r, 8, extract_lane_s(a, extract_lane_u(s, 8) & 15));
    r = replace_lane(r, 9, extract_lane_s(a, extract_lane_u(s, 9) & 15));
    r = replace_lane(r, 10, extract_lane_s(a, extract_lane_u(s, 10) & 15));
    r = replace_lane(r, 11, extract_lane_s(a, extract_lane_u(s, 11) & 15));
    r = replace_lane(r, 12, extract_lane_s(a, extract_lane_u(s, 12) & 15));
    r = replace_lane(r, 13, extract_lane_s(a, extract_lane_u(s, 13) & 15));
    r = replace_lane(r, 14, extract_lane_s(a, extract_lane_u(s, 14) & 15));
    r = replace_lane(r, 15, extract_lane_s(a, extract_lane_u(s, 15) & 15));
    return r;
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v128, b: v128, m: v128): v128 {
    if (ASC_FEATURE_RELAXED_SIMD) return i8x16.relaxed_laneselect(a, b, m);
    let r = splat(0);
    r = replace_lane(r, 0, extract_lane_s(m, 0) < 0 ? extract_lane_s(a, 0) : extract_lane_s(b, 0));
    r = replace_lane(r, 1, extract_lane_s(m, 1) < 0 ? extract_lane_s(a, 1) : extract_lane_s(b, 1));
    r = replace_lane(r, 2, extract_lane_s(m, 2) < 0 ? extract_lane_s(a, 2) : extract_lane_s(b, 2));
    r = replace_lane(r, 3, extract_lane_s(m, 3) < 0 ? extract_lane_s(a, 3) : extract_lane_s(b, 3));
    r = replace_lane(r, 4, extract_lane_s(m, 4) < 0 ? extract_lane_s(a, 4) : extract_lane_s(b, 4));
    r = replace_lane(r, 5, extract_lane_s(m, 5) < 0 ? extract_lane_s(a, 5) : extract_lane_s(b, 5));
    r = replace_lane(r, 6, extract_lane_s(m, 6) < 0 ? extract_lane_s(a, 6) : extract_lane_s(b, 6));
    r = replace_lane(r, 7, extract_lane_s(m, 7) < 0 ? extract_lane_s(a, 7) : extract_lane_s(b, 7));
    r = replace_lane(r, 8, extract_lane_s(m, 8) < 0 ? extract_lane_s(a, 8) : extract_lane_s(b, 8));
    r = replace_lane(r, 9, extract_lane_s(m, 9) < 0 ? extract_lane_s(a, 9) : extract_lane_s(b, 9));
    r = replace_lane(r, 10, extract_lane_s(m, 10) < 0 ? extract_lane_s(a, 10) : extract_lane_s(b, 10));
    r = replace_lane(r, 11, extract_lane_s(m, 11) < 0 ? extract_lane_s(a, 11) : extract_lane_s(b, 11));
    r = replace_lane(r, 12, extract_lane_s(m, 12) < 0 ? extract_lane_s(a, 12) : extract_lane_s(b, 12));
    r = replace_lane(r, 13, extract_lane_s(m, 13) < 0 ? extract_lane_s(a, 13) : extract_lane_s(b, 13));
    r = replace_lane(r, 14, extract_lane_s(m, 14) < 0 ? extract_lane_s(a, 14) : extract_lane_s(b, 14));
    r = replace_lane(r, 15, extract_lane_s(m, 15) < 0 ? extract_lane_s(a, 15) : extract_lane_s(b, 15));
    return r;
  }
}

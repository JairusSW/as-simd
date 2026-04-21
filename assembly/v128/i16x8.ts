import { v64 } from "../v64";
import { i16x4 } from "../v64/i16x4";

export type i16x8_swar = v128;

export namespace i16x8_swar {
  // @ts-expect-error: decorator
  @inline function lo(x: v128): v64 { return i64x2.extract_lane(x, 0) as v64; }
  // @ts-expect-error: decorator
  @inline function hi(x: v128): v64 { return i64x2.extract_lane(x, 1) as v64; }
  // @ts-expect-error: decorator
  @inline function pack(l: v64, h: v64): v128 { return i64x2(l as i64, h as i64); }

  // @ts-expect-error: decorator
  @inline export function splat(x: i16): v128 { if (ASC_FEATURE_SIMD) return i16x8.splat(x); return pack(i16x4.splat(x), i16x4.splat(x)); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(x: v128, idx: u8): i16 {
    if (ASC_FEATURE_SIMD) {
      switch (idx & 7) {
        case 0: return i16x8.extract_lane_s(x, 0);
        case 1: return i16x8.extract_lane_s(x, 1);
        case 2: return i16x8.extract_lane_s(x, 2);
        case 3: return i16x8.extract_lane_s(x, 3);
        case 4: return i16x8.extract_lane_s(x, 4);
        case 5: return i16x8.extract_lane_s(x, 5);
        case 6: return i16x8.extract_lane_s(x, 6);
        default: return i16x8.extract_lane_s(x, 7);
      }
    }
    return (idx & 7) < 4 ? i16x4.extract_lane_s(lo(x), idx & 3) : i16x4.extract_lane_s(hi(x), idx & 3);
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: v128, idx: u8): u16 {
    if (ASC_FEATURE_SIMD) {
      switch (idx & 7) {
        case 0: return i16x8.extract_lane_u(x, 0);
        case 1: return i16x8.extract_lane_u(x, 1);
        case 2: return i16x8.extract_lane_u(x, 2);
        case 3: return i16x8.extract_lane_u(x, 3);
        case 4: return i16x8.extract_lane_u(x, 4);
        case 5: return i16x8.extract_lane_u(x, 5);
        case 6: return i16x8.extract_lane_u(x, 6);
        default: return i16x8.extract_lane_u(x, 7);
      }
    }
    return (idx & 7) < 4 ? i16x4.extract_lane_u(lo(x), idx & 3) : i16x4.extract_lane_u(hi(x), idx & 3);
  }
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v128, idx: u8, value: i16): v128 {
    if (ASC_FEATURE_SIMD) {
      switch (idx & 7) {
        case 0: return i16x8.replace_lane(x, 0, value);
        case 1: return i16x8.replace_lane(x, 1, value);
        case 2: return i16x8.replace_lane(x, 2, value);
        case 3: return i16x8.replace_lane(x, 3, value);
        case 4: return i16x8.replace_lane(x, 4, value);
        case 5: return i16x8.replace_lane(x, 5, value);
        case 6: return i16x8.replace_lane(x, 6, value);
        default: return i16x8.replace_lane(x, 7, value);
      }
    }
    const i = idx & 7;
    const l = lo(x), h = hi(x);
    return i < 4 ? pack(i16x4.replace_lane(l, i, value), h) : pack(l, i16x4.replace_lane(h, i & 3, value));
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i16 = 0): v128 {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(8, nn, nn > 8);
    if (n <= 4) return pack(i16x4.loadPartial(ptr, n, immOffset, immAlign, fill), i16x4.splat(fill));
    const base = ptr + immOffset;
    return pack(i16x4.loadPartial(base, 4, 0, immAlign, fill), i16x4.loadPartial(base + 8, n - 4, 0, immAlign, fill));
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v128, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(8, nn, nn > 8);
    if (n == 0) return;
    if (ASC_FEATURE_SIMD && n == 8) { store<v128>(ptr + immOffset, value); return; }
    if (n <= 4) {
      i16x4.storePartial(ptr, lo(value), n, immOffset, immAlign);
      return;
    }
    const base = ptr + immOffset;
    i16x4.storePartial(base, lo(value), 4, 0, immAlign);
    i16x4.storePartial(base + 8, hi(value), n - 4, 0, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function add(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.add(a, b); return pack(i16x4.add(lo(a), lo(b)), i16x4.add(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.sub(a, b); return pack(i16x4.sub(lo(a), lo(b)), i16x4.sub(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function mul(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.mul(a, b); return pack(i16x4.mul(lo(a), lo(b)), i16x4.mul(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.min_s(a, b); return pack(i16x4.min_s(lo(a), lo(b)), i16x4.min_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.min_u(a, b); return pack(i16x4.min_u(lo(a), lo(b)), i16x4.min_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.max_s(a, b); return pack(i16x4.max_s(lo(a), lo(b)), i16x4.max_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.max_u(a, b); return pack(i16x4.max_u(lo(a), lo(b)), i16x4.max_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function avgr_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.avgr_u(a, b); return pack(i16x4.avgr_u(lo(a), lo(b)), i16x4.avgr_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function abs(a: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.abs(a); return pack(i16x4.abs(lo(a)), i16x4.abs(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function neg(a: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.neg(a); return pack(i16x4.neg(lo(a)), i16x4.neg(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.add_sat_s(a, b); return pack(i16x4.add_sat_s(lo(a), lo(b)), i16x4.add_sat_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.add_sat_u(a, b); return pack(i16x4.add_sat_u(lo(a), lo(b)), i16x4.add_sat_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.sub_sat_s(a, b); return pack(i16x4.sub_sat_s(lo(a), lo(b)), i16x4.sub_sat_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.sub_sat_u(a, b); return pack(i16x4.sub_sat_u(lo(a), lo(b)), i16x4.sub_sat_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function shl(a: v128, b: i32): v128 { if (ASC_FEATURE_SIMD) return i16x8.shl(a, b); return pack(i16x4.shl(lo(a), b), i16x4.shl(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v128, b: i32): v128 { if (ASC_FEATURE_SIMD) return i16x8.shr_s(a, b); return pack(i16x4.shr_s(lo(a), b), i16x4.shr_s(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v128, b: i32): v128 { if (ASC_FEATURE_SIMD) return i16x8.shr_u(a, b); return pack(i16x4.shr_u(lo(a), b), i16x4.shr_u(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function all_true(a: v128): bool { if (ASC_FEATURE_SIMD) return i16x8.all_true(a); return i16x4.all_true(lo(a)) && i16x4.all_true(hi(a)); }
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v128): i32 { if (ASC_FEATURE_SIMD) return i16x8.bitmask(a); return i16x4.bitmask(lo(a)) | (i16x4.bitmask(hi(a)) << 4); }
  // @ts-expect-error: decorator
  @inline export function eq(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.eq(a, b); return pack(i16x4.eq(lo(a), lo(b)), i16x4.eq(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ne(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.ne(a, b); return pack(i16x4.ne(lo(a), lo(b)), i16x4.ne(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.lt_s(a, b); return pack(i16x4.lt_s(lo(a), lo(b)), i16x4.lt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.lt_u(a, b); return pack(i16x4.lt_u(lo(a), lo(b)), i16x4.lt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.le_s(a, b); return pack(i16x4.le_s(lo(a), lo(b)), i16x4.le_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.le_u(a, b); return pack(i16x4.le_u(lo(a), lo(b)), i16x4.le_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.gt_s(a, b); return pack(i16x4.gt_s(lo(a), lo(b)), i16x4.gt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.gt_u(a, b); return pack(i16x4.gt_u(lo(a), lo(b)), i16x4.gt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.ge_s(a, b); return pack(i16x4.ge_s(lo(a), lo(b)), i16x4.ge_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v128, b: v128): v128 { if (ASC_FEATURE_SIMD) return i16x8.ge_u(a, b); return pack(i16x4.ge_u(lo(a), lo(b)), i16x4.ge_u(hi(a), hi(b))); }

  // @ts-expect-error: decorator
  @inline export function narrow_i32x4_s(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.narrow_i32x4_s(a, b);
    return pack(i16x4.narrow_i32x2_s(lo(a), hi(a)), i16x4.narrow_i32x2_s(lo(b), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function narrow_i32x4_u(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.narrow_i32x4_u(a, b);
    return pack(i16x4.narrow_i32x2_u(lo(a), hi(a)), i16x4.narrow_i32x2_u(lo(b), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extend_low_i8x16_s(a: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extend_low_i8x16_s(a);
    const al = lo(a);
    return pack(i16x4.extend_low_i8x8_s(al), i16x4.extend_high_i8x8_s(al));
  }
  // @ts-expect-error: decorator
  @inline export function extend_low_i8x16_u(a: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extend_low_i8x16_u(a);
    const al = lo(a);
    return pack(i16x4.extend_low_i8x8_u(al), i16x4.extend_high_i8x8_u(al));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i8x16_s(a: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extend_high_i8x16_s(a);
    const ah = hi(a);
    return pack(i16x4.extend_low_i8x8_s(ah), i16x4.extend_high_i8x8_s(ah));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i8x16_u(a: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extend_high_i8x16_u(a);
    const ah = hi(a);
    return pack(i16x4.extend_low_i8x8_u(ah), i16x4.extend_high_i8x8_u(ah));
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x16_s(a: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extadd_pairwise_i8x16_s(a);
    return pack(i16x4.extadd_pairwise_i8x8_s(lo(a)), i16x4.extadd_pairwise_i8x8_s(hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i8x16_u(a: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extadd_pairwise_i8x16_u(a);
    return pack(i16x4.extadd_pairwise_i8x8_u(lo(a)), i16x4.extadd_pairwise_i8x8_u(hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function q15mulr_sat_s(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.q15mulr_sat_s(a, b);
    return pack(i16x4.q15mulr_sat_s(lo(a), lo(b)), i16x4.q15mulr_sat_s(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i8x16_s(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extmul_low_i8x16_s(a, b);
    return pack(i16x4.extmul_low_i8x8_s(lo(a), lo(b)), i16x4.extmul_high_i8x8_s(lo(a), lo(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i8x16_u(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extmul_low_i8x16_u(a, b);
    return pack(i16x4.extmul_low_i8x8_u(lo(a), lo(b)), i16x4.extmul_high_i8x8_u(lo(a), lo(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i8x16_s(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extmul_high_i8x16_s(a, b);
    return pack(i16x4.extmul_low_i8x8_s(hi(a), hi(b)), i16x4.extmul_high_i8x8_s(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i8x16_u(a: v128, b: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.extmul_high_i8x16_u(a, b);
    return pack(i16x4.extmul_low_i8x8_u(hi(a), hi(b)), i16x4.extmul_high_i8x8_u(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v128, b: v128, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): v128 {
    let r = splat(0);
    r = replace_lane(r, 0, ((l0 & 15) < 8 ? extract_lane_s(a, l0) : extract_lane_s(b, (l0 - 8) & 7)));
    r = replace_lane(r, 1, ((l1 & 15) < 8 ? extract_lane_s(a, l1) : extract_lane_s(b, (l1 - 8) & 7)));
    r = replace_lane(r, 2, ((l2 & 15) < 8 ? extract_lane_s(a, l2) : extract_lane_s(b, (l2 - 8) & 7)));
    r = replace_lane(r, 3, ((l3 & 15) < 8 ? extract_lane_s(a, l3) : extract_lane_s(b, (l3 - 8) & 7)));
    r = replace_lane(r, 4, ((l4 & 15) < 8 ? extract_lane_s(a, l4) : extract_lane_s(b, (l4 - 8) & 7)));
    r = replace_lane(r, 5, ((l5 & 15) < 8 ? extract_lane_s(a, l5) : extract_lane_s(b, (l5 - 8) & 7)));
    r = replace_lane(r, 6, ((l6 & 15) < 8 ? extract_lane_s(a, l6) : extract_lane_s(b, (l6 - 8) & 7)));
    r = replace_lane(r, 7, ((l7 & 15) < 8 ? extract_lane_s(a, l7) : extract_lane_s(b, (l7 - 8) & 7)));
    return r;
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v128, b: v128, m: v128): v128 {
    if (ASC_FEATURE_SIMD) return i16x8.relaxed_laneselect(a, b, m);
    let r = splat(0);
    r = replace_lane(r, 0, extract_lane_s(m, 0) < 0 ? extract_lane_s(a, 0) : extract_lane_s(b, 0));
    r = replace_lane(r, 1, extract_lane_s(m, 1) < 0 ? extract_lane_s(a, 1) : extract_lane_s(b, 1));
    r = replace_lane(r, 2, extract_lane_s(m, 2) < 0 ? extract_lane_s(a, 2) : extract_lane_s(b, 2));
    r = replace_lane(r, 3, extract_lane_s(m, 3) < 0 ? extract_lane_s(a, 3) : extract_lane_s(b, 3));
    r = replace_lane(r, 4, extract_lane_s(m, 4) < 0 ? extract_lane_s(a, 4) : extract_lane_s(b, 4));
    r = replace_lane(r, 5, extract_lane_s(m, 5) < 0 ? extract_lane_s(a, 5) : extract_lane_s(b, 5));
    r = replace_lane(r, 6, extract_lane_s(m, 6) < 0 ? extract_lane_s(a, 6) : extract_lane_s(b, 6));
    r = replace_lane(r, 7, extract_lane_s(m, 7) < 0 ? extract_lane_s(a, 7) : extract_lane_s(b, 7));
    return r;
  }
}

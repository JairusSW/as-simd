import { v64 } from "../v64/v64";
import { i32x2 } from "../v64/i32x2";
import { i64x2_swar } from "./i64x2_swar";
import { swar_arena } from "./swar_arena";
import { v128_swar } from "./v128_swar";

export type i32x4_swar = v128;
let __as_simd_tmp_hi: u64 = 0;

export namespace i32x4_swar {
  // @ts-expect-error: decorator
  @inline export function pack2(a: i32, b: i32): u64 {
    return (a as u32 as u64) | ((b as u32 as u64) << 32);
  }
  // @ts-expect-error: decorator
  @inline export function unpack_lo(x: u64): i32 { return (x as u32) as i32; }
  // @ts-expect-error: decorator
  @inline export function unpack_hi(x: u64): i32 { return ((x >> 32) as u32) as i32; }
  // @ts-expect-error: decorator
  @inline export function take_hi(): u64 { return __as_simd_tmp_hi; }
  // @ts-expect-error: decorator
  @inline export function add_lo(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const rLo = pack2(unpack_lo(aLo) + unpack_lo(bLo), unpack_hi(aLo) + unpack_hi(bLo));
    __as_simd_tmp_hi = pack2(unpack_lo(aHi) + unpack_lo(bHi), unpack_hi(aHi) + unpack_hi(bHi));
    return rLo;
  }
  // @ts-expect-error: decorator
  @inline export function load_lo(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 {
    const base = ptr + immOffset;
    const lo = pack2(load<i32>(base), load<i32>(base + 4));
    __as_simd_tmp_hi = pack2(load<i32>(base + 8), load<i32>(base + 12));
    return lo;
  }
  // @ts-expect-error: decorator
  @inline export function store_pair(ptr: usize, lo: u64, hi: u64, immOffset: usize = 0, immAlign: usize = 1): void {
    store<u64>(ptr, lo, immOffset, immAlign);
    store<u64>(ptr, hi, immOffset + 8, immAlign);
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane_pair(lo: u64, hi: u64, idx: u8): i32 {
    switch (idx & 3) {
      case 0: return unpack_lo(lo);
      case 1: return unpack_hi(lo);
      case 2: return unpack_lo(hi);
      default: return unpack_hi(hi);
    }
  }

  // @ts-expect-error: decorator
  @inline function lo(x: v128_swar): v64 {
    if (ASC_FEATURE_SIMD) return i64x2.extract_lane(x, 0) as v64;
    return i64x2_swar.extract_lane(x, 0) as v64;
  }
  // @ts-expect-error: decorator
  @inline function hi(x: v128_swar): v64 {
    if (ASC_FEATURE_SIMD) return i64x2.extract_lane(x, 1) as v64;
    return i64x2_swar.extract_lane(x, 1) as v64;
  }
  // @ts-expect-error: decorator
  @inline function pack(l: v64, h: v64): v128_swar {
    if (ASC_FEATURE_SIMD) return i64x2(l as i64, h as i64);
    const tmp = swar_arena.alloc16();
    store<i64>(tmp, l as i64);
    store<i64>(tmp + 8, h as i64);
    return load<v128>(tmp);
  }

  // @ts-expect-error: decorator
  @inline export function splat(x: i32): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.splat(x); return pack(i32x2.splat(x), i32x2.splat(x)); }
  // @ts-expect-error: decorator
  @inline export function extract_lane(x: v128_swar, idx: u8): i32 {
    if (ASC_FEATURE_SIMD) {
      switch (idx & 3) {
        case 0: return i32x4.extract_lane(x, 0);
        case 1: return i32x4.extract_lane(x, 1);
        case 2: return i32x4.extract_lane(x, 2);
        default: return i32x4.extract_lane(x, 3);
      }
    }
    return (idx & 3) < 2 ? i32x2.extract_lane(lo(x), idx & 1) : i32x2.extract_lane(hi(x), idx & 1);
  }
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v128_swar, idx: u8, value: i32): v128_swar {
    if (ASC_FEATURE_SIMD) {
      switch (idx & 3) {
        case 0: return i32x4.replace_lane(x, 0, value);
        case 1: return i32x4.replace_lane(x, 1, value);
        case 2: return i32x4.replace_lane(x, 2, value);
        default: return i32x4.replace_lane(x, 3, value);
      }
    }
    const i = idx & 3;
    const l = lo(x), h = hi(x);
    return i < 2 ? pack(i32x2.replace_lane(l, i, value), h) : pack(l, i32x2.replace_lane(h, i & 1, value));
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i32 = 0): v128_swar {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(4, nn, nn > 4);
    if (n <= 2) return pack(i32x2.loadPartial(ptr, n, immOffset, immAlign, fill), i32x2.splat(fill));
    const base = ptr + immOffset;
    return pack(i32x2.loadPartial(base, 2, 0, immAlign, fill), i32x2.loadPartial(base + 8, n - 2, 0, immAlign, fill));
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v128_swar, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(4, nn, nn > 4);
    if (n == 0) return;
    if (ASC_FEATURE_SIMD && n == 4) { store<v128>(ptr + immOffset, value); return; }
    if (n <= 2) {
      i32x2.storePartial(ptr, lo(value), n, immOffset, immAlign);
      return;
    }
    const base = ptr + immOffset;
    i32x2.storePartial(base, lo(value), 2, 0, immAlign);
    i32x2.storePartial(base + 8, hi(value), n - 2, 0, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function add(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.add(a, b); return pack(i32x2.add(lo(a), lo(b)), i32x2.add(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.sub(a, b); return pack(i32x2.sub(lo(a), lo(b)), i32x2.sub(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function mul(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.mul(a, b); return pack(i32x2.mul(lo(a), lo(b)), i32x2.mul(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_s(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.min_s(a, b); return pack(i32x2.min_s(lo(a), lo(b)), i32x2.min_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_u(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.min_u(a, b); return pack(i32x2.min_u(lo(a), lo(b)), i32x2.min_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_s(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.max_s(a, b); return pack(i32x2.max_s(lo(a), lo(b)), i32x2.max_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_u(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.max_u(a, b); return pack(i32x2.max_u(lo(a), lo(b)), i32x2.max_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function dot_i16x8_s(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.dot_i16x8_s(a, b); return pack(i32x2.dot_i16x4_s(lo(a), lo(b)), i32x2.dot_i16x4_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function abs(a: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.abs(a); return pack(i32x2.abs(lo(a)), i32x2.abs(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function neg(a: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.neg(a); return pack(i32x2.neg(lo(a)), i32x2.neg(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function shl(a: v128_swar, b: i32): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.shl(a, b); return pack(i32x2.shl(lo(a), b), i32x2.shl(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v128_swar, b: i32): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.shr_s(a, b); return pack(i32x2.shr_s(lo(a), b), i32x2.shr_s(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v128_swar, b: i32): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.shr_u(a, b); return pack(i32x2.shr_u(lo(a), b), i32x2.shr_u(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function all_true(a: v128_swar): bool { if (ASC_FEATURE_SIMD) return i32x4.all_true(a); return i32x2.all_true(lo(a)) && i32x2.all_true(hi(a)); }
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v128_swar): i32 { if (ASC_FEATURE_SIMD) return i32x4.bitmask(a); return i32x2.bitmask(lo(a)) | (i32x2.bitmask(hi(a)) << 2); }
  // @ts-expect-error: decorator
  @inline export function eq(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.eq(a, b); return pack(i32x2.eq(lo(a), lo(b)), i32x2.eq(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ne(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.ne(a, b); return pack(i32x2.ne(lo(a), lo(b)), i32x2.ne(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.lt_s(a, b); return pack(i32x2.lt_s(lo(a), lo(b)), i32x2.lt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.lt_u(a, b); return pack(i32x2.lt_u(lo(a), lo(b)), i32x2.lt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_s(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.le_s(a, b); return pack(i32x2.le_s(lo(a), lo(b)), i32x2.le_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_u(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.le_u(a, b); return pack(i32x2.le_u(lo(a), lo(b)), i32x2.le_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.gt_s(a, b); return pack(i32x2.gt_s(lo(a), lo(b)), i32x2.gt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.gt_u(a, b); return pack(i32x2.gt_u(lo(a), lo(b)), i32x2.gt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.ge_s(a, b); return pack(i32x2.ge_s(lo(a), lo(b)), i32x2.ge_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v128_swar, b: v128_swar): v128_swar { if (ASC_FEATURE_SIMD) return i32x4.ge_u(a, b); return pack(i32x2.ge_u(lo(a), lo(b)), i32x2.ge_u(hi(a), hi(b))); }

  // @ts-expect-error: decorator
  @inline export function extend_low_i16x8_s(a: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extend_low_i16x8_s(a);
    const al = lo(a);
    return pack(i32x2.extend_low_i16x4_s(al), i32x2.extend_high_i16x4_s(al));
  }
  // @ts-expect-error: decorator
  @inline export function extend_low_i16x8_u(a: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extend_low_i16x8_u(a);
    const al = lo(a);
    return pack(i32x2.extend_low_i16x4_u(al), i32x2.extend_high_i16x4_u(al));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i16x8_s(a: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extend_high_i16x8_s(a);
    const ah = hi(a);
    return pack(i32x2.extend_low_i16x4_s(ah), i32x2.extend_high_i16x4_s(ah));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high_i16x8_u(a: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extend_high_i16x8_u(a);
    const ah = hi(a);
    return pack(i32x2.extend_low_i16x4_u(ah), i32x2.extend_high_i16x4_u(ah));
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i16x8_s(a: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extadd_pairwise_i16x8_s(a);
    return pack(i32x2.extadd_pairwise_i16x4_s(lo(a)), i32x2.extadd_pairwise_i16x4_s(hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise_i16x8_u(a: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extadd_pairwise_i16x8_u(a);
    return pack(i32x2.extadd_pairwise_i16x4_u(lo(a)), i32x2.extadd_pairwise_i16x4_u(hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i16x8_s(a: v128_swar, b: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extmul_low_i16x8_s(a, b);
    return pack(i32x2.extmul_low_i16x4_s(lo(a), lo(b)), i32x2.extmul_high_i16x4_s(lo(a), lo(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low_i16x8_u(a: v128_swar, b: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extmul_low_i16x8_u(a, b);
    return pack(i32x2.extmul_low_i16x4_u(lo(a), lo(b)), i32x2.extmul_high_i16x4_u(lo(a), lo(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i16x8_s(a: v128_swar, b: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extmul_high_i16x8_s(a, b);
    return pack(i32x2.extmul_low_i16x4_s(hi(a), hi(b)), i32x2.extmul_high_i16x4_s(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high_i16x8_u(a: v128_swar, b: v128_swar): v128_swar {
    if (ASC_FEATURE_SIMD) return i32x4.extmul_high_i16x8_u(a, b);
    return pack(i32x2.extmul_low_i16x4_u(hi(a), hi(b)), i32x2.extmul_high_i16x4_u(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function shuffle(a: v128_swar, b: v128_swar, l0: u8, l1: u8, l2: u8, l3: u8): v128_swar {
    let r = splat(0);
    r = replace_lane(r, 0, ((l0 & 7) < 4 ? extract_lane(a, l0) : extract_lane(b, (l0 - 4) & 3)));
    r = replace_lane(r, 1, ((l1 & 7) < 4 ? extract_lane(a, l1) : extract_lane(b, (l1 - 4) & 3)));
    r = replace_lane(r, 2, ((l2 & 7) < 4 ? extract_lane(a, l2) : extract_lane(b, (l2 - 4) & 3)));
    r = replace_lane(r, 3, ((l3 & 7) < 4 ? extract_lane(a, l3) : extract_lane(b, (l3 - 4) & 3)));
    return r;
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(a: v128_swar, b: v128_swar, m: v128_swar): v128_swar {
    if (ASC_FEATURE_RELAXED_SIMD) return i32x4.relaxed_laneselect(a, b, m);
    let r = splat(0);
    r = replace_lane(r, 0, extract_lane(m, 0) < 0 ? extract_lane(a, 0) : extract_lane(b, 0));
    r = replace_lane(r, 1, extract_lane(m, 1) < 0 ? extract_lane(a, 1) : extract_lane(b, 1));
    r = replace_lane(r, 2, extract_lane(m, 2) < 0 ? extract_lane(a, 2) : extract_lane(b, 2));
    r = replace_lane(r, 3, extract_lane(m, 3) < 0 ? extract_lane(a, 3) : extract_lane(b, 3));
    return r;
  }
}

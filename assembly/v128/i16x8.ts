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
  @inline export function splat(x: i16): v128 { return pack(i16x4.splat(x), i16x4.splat(x)); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(x: v128, idx: u8): i16 { return (idx & 7) < 4 ? i16x4.extract_lane_s(lo(x), idx & 3) : i16x4.extract_lane_s(hi(x), idx & 3); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: v128, idx: u8): u16 { return (idx & 7) < 4 ? i16x4.extract_lane_u(lo(x), idx & 3) : i16x4.extract_lane_u(hi(x), idx & 3); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v128, idx: u8, value: i16): v128 {
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
    if (n <= 4) {
      i16x4.storePartial(ptr, lo(value), n, immOffset, immAlign);
      return;
    }
    const base = ptr + immOffset;
    i16x4.storePartial(base, lo(value), 4, 0, immAlign);
    i16x4.storePartial(base + 8, hi(value), n - 4, 0, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function add(a: v128, b: v128): v128 { return pack(i16x4.add(lo(a), lo(b)), i16x4.add(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub(a: v128, b: v128): v128 { return pack(i16x4.sub(lo(a), lo(b)), i16x4.sub(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function mul(a: v128, b: v128): v128 { return pack(i16x4.mul(lo(a), lo(b)), i16x4.mul(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_s(a: v128, b: v128): v128 { return pack(i16x4.min_s(lo(a), lo(b)), i16x4.min_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_u(a: v128, b: v128): v128 { return pack(i16x4.min_u(lo(a), lo(b)), i16x4.min_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_s(a: v128, b: v128): v128 { return pack(i16x4.max_s(lo(a), lo(b)), i16x4.max_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_u(a: v128, b: v128): v128 { return pack(i16x4.max_u(lo(a), lo(b)), i16x4.max_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function avgr_u(a: v128, b: v128): v128 { return pack(i16x4.avgr_u(lo(a), lo(b)), i16x4.avgr_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function abs(a: v128): v128 { return pack(i16x4.abs(lo(a)), i16x4.abs(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function neg(a: v128): v128 { return pack(i16x4.neg(lo(a)), i16x4.neg(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v128, b: v128): v128 { return pack(i16x4.add_sat_s(lo(a), lo(b)), i16x4.add_sat_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v128, b: v128): v128 { return pack(i16x4.add_sat_u(lo(a), lo(b)), i16x4.add_sat_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v128, b: v128): v128 { return pack(i16x4.sub_sat_s(lo(a), lo(b)), i16x4.sub_sat_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v128, b: v128): v128 { return pack(i16x4.sub_sat_u(lo(a), lo(b)), i16x4.sub_sat_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function shl(a: v128, b: i32): v128 { return pack(i16x4.shl(lo(a), b), i16x4.shl(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v128, b: i32): v128 { return pack(i16x4.shr_s(lo(a), b), i16x4.shr_s(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v128, b: i32): v128 { return pack(i16x4.shr_u(lo(a), b), i16x4.shr_u(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function all_true(a: v128): bool { return i16x4.all_true(lo(a)) && i16x4.all_true(hi(a)); }
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v128): i32 { return i16x4.bitmask(lo(a)) | (i16x4.bitmask(hi(a)) << 4); }
  // @ts-expect-error: decorator
  @inline export function eq(a: v128, b: v128): v128 { return pack(i16x4.eq(lo(a), lo(b)), i16x4.eq(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ne(a: v128, b: v128): v128 { return pack(i16x4.ne(lo(a), lo(b)), i16x4.ne(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v128, b: v128): v128 { return pack(i16x4.lt_s(lo(a), lo(b)), i16x4.lt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v128, b: v128): v128 { return pack(i16x4.lt_u(lo(a), lo(b)), i16x4.lt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_s(a: v128, b: v128): v128 { return pack(i16x4.le_s(lo(a), lo(b)), i16x4.le_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_u(a: v128, b: v128): v128 { return pack(i16x4.le_u(lo(a), lo(b)), i16x4.le_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v128, b: v128): v128 { return pack(i16x4.gt_s(lo(a), lo(b)), i16x4.gt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v128, b: v128): v128 { return pack(i16x4.gt_u(lo(a), lo(b)), i16x4.gt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v128, b: v128): v128 { return pack(i16x4.ge_s(lo(a), lo(b)), i16x4.ge_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v128, b: v128): v128 { return pack(i16x4.ge_u(lo(a), lo(b)), i16x4.ge_u(hi(a), hi(b))); }
}

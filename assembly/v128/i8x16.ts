import { v64 } from "../v64";
import { i8x8 } from "../v64/i8x8";

export type i8x16_swar = v128;

export namespace i8x16_swar {
  // @ts-expect-error: decorator
  @inline function lo(x: v128): v64 { return i64x2.extract_lane(x, 0) as v64; }
  // @ts-expect-error: decorator
  @inline function hi(x: v128): v64 { return i64x2.extract_lane(x, 1) as v64; }
  // @ts-expect-error: decorator
  @inline function pack(l: v64, h: v64): v128 { return i64x2(l as i64, h as i64); }

  // @ts-expect-error: decorator
  @inline export function splat(x: i8): v128 { return pack(i8x8.splat(x), i8x8.splat(x)); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(x: v128, idx: u8): i8 { return (idx & 15) < 8 ? i8x8.extract_lane_s(lo(x), idx & 7) : i8x8.extract_lane_s(hi(x), idx & 7); }
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(x: v128, idx: u8): u8 { return (idx & 15) < 8 ? i8x8.extract_lane_u(lo(x), idx & 7) : i8x8.extract_lane_u(hi(x), idx & 7); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v128, idx: u8, value: i8): v128 {
    const i = idx & 15;
    const l = lo(x), h = hi(x);
    return i < 8 ? pack(i8x8.replace_lane(l, i, value), h) : pack(l, i8x8.replace_lane(h, i & 7, value));
  }

  // @ts-expect-error: decorator
  @inline export function add(a: v128, b: v128): v128 { return pack(i8x8.add(lo(a), lo(b)), i8x8.add(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub(a: v128, b: v128): v128 { return pack(i8x8.sub(lo(a), lo(b)), i8x8.sub(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function mul(a: v128, b: v128): v128 { return pack(i8x8.mul(lo(a), lo(b)), i8x8.mul(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_s(a: v128, b: v128): v128 { return pack(i8x8.min_s(lo(a), lo(b)), i8x8.min_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_u(a: v128, b: v128): v128 { return pack(i8x8.min_u(lo(a), lo(b)), i8x8.min_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_s(a: v128, b: v128): v128 { return pack(i8x8.max_s(lo(a), lo(b)), i8x8.max_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_u(a: v128, b: v128): v128 { return pack(i8x8.max_u(lo(a), lo(b)), i8x8.max_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function avgr_u(a: v128, b: v128): v128 { return pack(i8x8.avgr_u(lo(a), lo(b)), i8x8.avgr_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function abs(a: v128): v128 { return pack(i8x8.abs(lo(a)), i8x8.abs(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function neg(a: v128): v128 { return pack(i8x8.neg(lo(a)), i8x8.neg(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_s(a: v128, b: v128): v128 { return pack(i8x8.add_sat_s(lo(a), lo(b)), i8x8.add_sat_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function add_sat_u(a: v128, b: v128): v128 { return pack(i8x8.add_sat_u(lo(a), lo(b)), i8x8.add_sat_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(a: v128, b: v128): v128 { return pack(i8x8.sub_sat_s(lo(a), lo(b)), i8x8.sub_sat_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(a: v128, b: v128): v128 { return pack(i8x8.sub_sat_u(lo(a), lo(b)), i8x8.sub_sat_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function shl(a: v128, b: i32): v128 { return pack(i8x8.shl(lo(a), b), i8x8.shl(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v128, b: i32): v128 { return pack(i8x8.shr_s(lo(a), b), i8x8.shr_s(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v128, b: i32): v128 { return pack(i8x8.shr_u(lo(a), b), i8x8.shr_u(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function all_true(a: v128): bool { return i8x8.all_true(lo(a)) && i8x8.all_true(hi(a)); }
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v128): i32 { return i8x8.bitmask(lo(a)) | (i8x8.bitmask(hi(a)) << 8); }
  // @ts-expect-error: decorator
  @inline export function popcnt(a: v128): v128 { return pack(i8x8.popcnt(lo(a)), i8x8.popcnt(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function eq(a: v128, b: v128): v128 { return pack(i8x8.eq(lo(a), lo(b)), i8x8.eq(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ne(a: v128, b: v128): v128 { return pack(i8x8.ne(lo(a), lo(b)), i8x8.ne(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v128, b: v128): v128 { return pack(i8x8.lt_s(lo(a), lo(b)), i8x8.lt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v128, b: v128): v128 { return pack(i8x8.lt_u(lo(a), lo(b)), i8x8.lt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_s(a: v128, b: v128): v128 { return pack(i8x8.le_s(lo(a), lo(b)), i8x8.le_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_u(a: v128, b: v128): v128 { return pack(i8x8.le_u(lo(a), lo(b)), i8x8.le_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v128, b: v128): v128 { return pack(i8x8.gt_s(lo(a), lo(b)), i8x8.gt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v128, b: v128): v128 { return pack(i8x8.gt_u(lo(a), lo(b)), i8x8.gt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v128, b: v128): v128 { return pack(i8x8.ge_s(lo(a), lo(b)), i8x8.ge_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v128, b: v128): v128 { return pack(i8x8.ge_u(lo(a), lo(b)), i8x8.ge_u(hi(a), hi(b))); }
}

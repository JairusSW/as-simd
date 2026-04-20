import { v64 } from "../v64";
import { i32x2 } from "../v64/i32x2";

export type i32x4_swar = v128;

export namespace i32x4_swar {
  // @ts-expect-error: decorator
  @inline function lo(x: v128): v64 { return i64x2.extract_lane(x, 0) as v64; }
  // @ts-expect-error: decorator
  @inline function hi(x: v128): v64 { return i64x2.extract_lane(x, 1) as v64; }
  // @ts-expect-error: decorator
  @inline function pack(l: v64, h: v64): v128 { return i64x2(l as i64, h as i64); }

  // @ts-expect-error: decorator
  @inline export function splat(x: i32): v128 { return pack(i32x2.splat(x), i32x2.splat(x)); }
  // @ts-expect-error: decorator
  @inline export function extract_lane(x: v128, idx: u8): i32 { return (idx & 3) < 2 ? i32x2.extract_lane(lo(x), idx & 1) : i32x2.extract_lane(hi(x), idx & 1); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v128, idx: u8, value: i32): v128 {
    const i = idx & 3;
    const l = lo(x), h = hi(x);
    return i < 2 ? pack(i32x2.replace_lane(l, i, value), h) : pack(l, i32x2.replace_lane(h, i & 1, value));
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i32 = 0): v128 {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(4, nn, nn > 4);
    if (n <= 2) return pack(i32x2.loadPartial(ptr, n, immOffset, immAlign, fill), i32x2.splat(fill));
    const base = ptr + immOffset;
    return pack(i32x2.loadPartial(base, 2, 0, immAlign, fill), i32x2.loadPartial(base + 8, n - 2, 0, immAlign, fill));
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v128, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(4, nn, nn > 4);
    if (n == 0) return;
    if (n <= 2) {
      i32x2.storePartial(ptr, lo(value), n, immOffset, immAlign);
      return;
    }
    const base = ptr + immOffset;
    i32x2.storePartial(base, lo(value), 2, 0, immAlign);
    i32x2.storePartial(base + 8, hi(value), n - 2, 0, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function add(a: v128, b: v128): v128 { return pack(i32x2.add(lo(a), lo(b)), i32x2.add(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function sub(a: v128, b: v128): v128 { return pack(i32x2.sub(lo(a), lo(b)), i32x2.sub(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function mul(a: v128, b: v128): v128 { return pack(i32x2.mul(lo(a), lo(b)), i32x2.mul(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_s(a: v128, b: v128): v128 { return pack(i32x2.min_s(lo(a), lo(b)), i32x2.min_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min_u(a: v128, b: v128): v128 { return pack(i32x2.min_u(lo(a), lo(b)), i32x2.min_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_s(a: v128, b: v128): v128 { return pack(i32x2.max_s(lo(a), lo(b)), i32x2.max_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function max_u(a: v128, b: v128): v128 { return pack(i32x2.max_u(lo(a), lo(b)), i32x2.max_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function dot_i16x8_s(a: v128, b: v128): v128 { return pack(i32x2.dot_i16x4_s(lo(a), lo(b)), i32x2.dot_i16x4_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function abs(a: v128): v128 { return pack(i32x2.abs(lo(a)), i32x2.abs(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function neg(a: v128): v128 { return pack(i32x2.neg(lo(a)), i32x2.neg(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function shl(a: v128, b: i32): v128 { return pack(i32x2.shl(lo(a), b), i32x2.shl(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v128, b: i32): v128 { return pack(i32x2.shr_s(lo(a), b), i32x2.shr_s(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v128, b: i32): v128 { return pack(i32x2.shr_u(lo(a), b), i32x2.shr_u(hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function all_true(a: v128): bool { return i32x2.all_true(lo(a)) && i32x2.all_true(hi(a)); }
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v128): i32 { return i32x2.bitmask(lo(a)) | (i32x2.bitmask(hi(a)) << 2); }
  // @ts-expect-error: decorator
  @inline export function eq(a: v128, b: v128): v128 { return pack(i32x2.eq(lo(a), lo(b)), i32x2.eq(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ne(a: v128, b: v128): v128 { return pack(i32x2.ne(lo(a), lo(b)), i32x2.ne(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v128, b: v128): v128 { return pack(i32x2.lt_s(lo(a), lo(b)), i32x2.lt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_u(a: v128, b: v128): v128 { return pack(i32x2.lt_u(lo(a), lo(b)), i32x2.lt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_s(a: v128, b: v128): v128 { return pack(i32x2.le_s(lo(a), lo(b)), i32x2.le_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function le_u(a: v128, b: v128): v128 { return pack(i32x2.le_u(lo(a), lo(b)), i32x2.le_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v128, b: v128): v128 { return pack(i32x2.gt_s(lo(a), lo(b)), i32x2.gt_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_u(a: v128, b: v128): v128 { return pack(i32x2.gt_u(lo(a), lo(b)), i32x2.gt_u(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v128, b: v128): v128 { return pack(i32x2.ge_s(lo(a), lo(b)), i32x2.ge_s(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_u(a: v128, b: v128): v128 { return pack(i32x2.ge_u(lo(a), lo(b)), i32x2.ge_u(hi(a), hi(b))); }
}

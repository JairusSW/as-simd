export type i64x2_swar = v128;

export namespace i64x2_swar {
  // @ts-expect-error: decorator
  @inline function l(x: v128): i64 { return i64x2.extract_lane(x, 0); }
  // @ts-expect-error: decorator
  @inline function h(x: v128): i64 { return i64x2.extract_lane(x, 1); }
  // @ts-expect-error: decorator
  @inline function p(a: i64, b: i64): v128 { return i64x2(a, b); }
  // @ts-expect-error: decorator
  @inline function m(pred: bool): i64 { return pred ? -1 : 0; }

  // @ts-expect-error: decorator
  @inline export function splat(x: i64): v128 { return p(x, x); }
  // @ts-expect-error: decorator
  @inline export function extract_lane(x: v128, idx: u8): i64 { return (idx & 1) == 0 ? l(x) : h(x); }
  // @ts-expect-error: decorator
  @inline export function replace_lane(x: v128, idx: u8, value: i64): v128 { return (idx & 1) == 0 ? p(value, h(x)) : p(l(x), value); }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i64 = 0): v128 {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(2, nn, nn > 2);
    if (n == 0) return p(fill, fill);
    const base = ptr + immOffset;
    if (n == 1) return p(load<i64>(base), fill);
    return p(load<i64>(base), load<i64>(base + 8));
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v128, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(2, nn, nn > 2);
    if (n == 0) return;
    const base = ptr + immOffset;
    store<i64>(base, l(value));
    if (n > 1) store<i64>(base + 8, h(value));
  }
  // @ts-expect-error: decorator
  @inline export function add(a: v128, b: v128): v128 { return p(l(a) + l(b), h(a) + h(b)); }
  // @ts-expect-error: decorator
  @inline export function sub(a: v128, b: v128): v128 { return p(l(a) - l(b), h(a) - h(b)); }
  // @ts-expect-error: decorator
  @inline export function neg(a: v128): v128 { return p(-l(a), -h(a)); }
  // @ts-expect-error: decorator
  @inline export function shl(a: v128, b: i32): v128 {
    const s = b & 63;
    return p(l(a) << s, h(a) << s);
  }
  // @ts-expect-error: decorator
  @inline export function shr_s(a: v128, b: i32): v128 {
    const s = b & 63;
    return p(l(a) >> s, h(a) >> s);
  }
  // @ts-expect-error: decorator
  @inline export function shr_u(a: v128, b: i32): v128 {
    const s = b & 63;
    return p((l(a) as u64 >> s) as i64, (h(a) as u64 >> s) as i64);
  }
  // @ts-expect-error: decorator
  @inline export function all_true(a: v128): bool { return l(a) != 0 && h(a) != 0; }
  // @ts-expect-error: decorator
  @inline export function bitmask(a: v128): i32 { return (((l(a) as u64 >> 63) & 1) as i32) | ((((h(a) as u64 >> 63) & 1) as i32) << 1); }
  // @ts-expect-error: decorator
  @inline export function eq(a: v128, b: v128): v128 { return p(m(l(a) == l(b)), m(h(a) == h(b))); }
  // @ts-expect-error: decorator
  @inline export function ne(a: v128, b: v128): v128 { return p(m(l(a) != l(b)), m(h(a) != h(b))); }
  // @ts-expect-error: decorator
  @inline export function lt_s(a: v128, b: v128): v128 { return p(m(l(a) < l(b)), m(h(a) < h(b))); }
  // @ts-expect-error: decorator
  @inline export function le_s(a: v128, b: v128): v128 { return p(m(l(a) <= l(b)), m(h(a) <= h(b))); }
  // @ts-expect-error: decorator
  @inline export function gt_s(a: v128, b: v128): v128 { return p(m(l(a) > l(b)), m(h(a) > h(b))); }
  // @ts-expect-error: decorator
  @inline export function ge_s(a: v128, b: v128): v128 { return p(m(l(a) >= l(b)), m(h(a) >= h(b))); }
}

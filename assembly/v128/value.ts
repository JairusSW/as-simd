import { v128_swar } from "./fallback";

export { v128_swar } from "./fallback";

/**
 * Value-semantics facade over the two-u64 SWAR implementation.
 *
 * The transform imports this class as `v128` in non-SIMD builds. Keeping both
 * halves in an object makes ordinary locals, parameters, returns and nested
 * expressions behave like native v128 values instead of relying on a transient
 * global high half between operations.
 */
export class V128Fallback {
  readonly lo: u64;
  readonly hi: u64;

  // @ts-expect-error: decorator
  @inline constructor(lo: u64, hi: u64) {
    this.lo = lo;
    this.hi = hi;
  }

  // @ts-expect-error: decorator
  @inline private static pair(lo: u64): V128Fallback {
    return new V128Fallback(lo, v128_swar.take_hi());
  }

  // @ts-expect-error: decorator
  @inline static splat<T>(x: T): V128Fallback { return V128Fallback.pair(v128_swar.splat<T>(x)); }
  // @ts-expect-error: decorator
  @inline static extract_lane<T>(a: V128Fallback, idx: u8): T { return v128_swar.extract_lane<T>(a.lo, a.hi, idx); }
  // @ts-expect-error: decorator
  @inline static replace_lane<T>(a: V128Fallback, idx: u8, value: T): V128Fallback { return V128Fallback.pair(v128_swar.replace_lane<T>(a.lo, a.hi, idx, value)); }
  static shuffle<T>(a: V128Fallback, b: V128Fallback, ...lanes: u8[]): V128Fallback {
    let out = V128Fallback.splat<T>(0 as T);
    const count = (16 / sizeof<T>()) as i32;
    for (let i = 0, n = lanes.length < count ? lanes.length : count; i < n; i++) {
      const lane = lanes[i] as i32;
      out = V128Fallback.replace_lane<T>(out, i as u8, lane < count ? V128Fallback.extract_lane<T>(a, lane as u8) : V128Fallback.extract_lane<T>(b, (lane - count) as u8));
    }
    return out;
  }
  // @ts-expect-error: decorator
  @inline static swizzle(a: V128Fallback, s: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.swizzle(a.lo, a.hi, s.lo, s.hi)); }

  // @ts-expect-error: decorator
  @inline static load(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): V128Fallback { return V128Fallback.pair(v128_swar.loadPartial(ptr, len, immOffset, immAlign, fill)); }
  // @ts-expect-error: decorator
  @inline static store(ptr: usize, value: V128Fallback, immOffset: usize = 0, immAlign: usize = 1): void { v128_swar.store(ptr, value.lo, value.hi, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static storePartial(ptr: usize, value: V128Fallback, len: i32, immOffset: usize = 0, immAlign: usize = 1): void { v128_swar.storePartial(ptr, value.lo, value.hi, len, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static load_ext<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load_ext<TFrom>(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load_zero<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load_zero<TFrom>(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load_splat<T>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load_splat<T>(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load8_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load8_splat(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load16_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load16_splat(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load32_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load32_splat(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load64_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load64_splat(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load8x8_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): V128Fallback { return V128Fallback.pair(v128_swar.load8x8_s(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load8x8_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): V128Fallback { return V128Fallback.pair(v128_swar.load8x8_u(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load16x4_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): V128Fallback { return V128Fallback.pair(v128_swar.load16x4_s(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load16x4_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): V128Fallback { return V128Fallback.pair(v128_swar.load16x4_u(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load32x2_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): V128Fallback { return V128Fallback.pair(v128_swar.load32x2_s(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load32x2_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): V128Fallback { return V128Fallback.pair(v128_swar.load32x2_u(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load32_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load32_zero(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load64_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load64_zero(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static load_lane<T>(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.pair(v128_swar.load_lane<T>(ptr, a.lo, a.hi, idx, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline static store_lane<T>(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { v128_swar.store_lane<T>(ptr, a.lo, a.hi, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static load8_lane(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.load_lane<i8>(ptr, a, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static load16_lane(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.load_lane<i16>(ptr, a, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static load32_lane(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.load_lane<i32>(ptr, a, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static load64_lane(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): V128Fallback { return V128Fallback.load_lane<i64>(ptr, a, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static store8_lane(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { V128Fallback.store_lane<i8>(ptr, a, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static store16_lane(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { V128Fallback.store_lane<i16>(ptr, a, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static store32_lane(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { V128Fallback.store_lane<i32>(ptr, a, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline static store64_lane(ptr: usize, a: V128Fallback, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { V128Fallback.store_lane<i64>(ptr, a, idx, immOffset, immAlign); }

  // @ts-expect-error: decorator
  @inline static add<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.add<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static sub<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.sub<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static mul<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.mul<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static div<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.div<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static neg<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.neg<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static abs<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.abs<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static add_sat<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.add_sat<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static sub_sat<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.sub_sat<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static avgr<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.avgr<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static min<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.min<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static max<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.max<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static pmin<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.pmin<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static pmax<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.pmax<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static dot<T extends i16>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.dot<T>(a.lo, a.hi, b.lo, b.hi)); }

  // @ts-expect-error: decorator
  @inline static sqrt<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.sqrt<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static ceil<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.ceil<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static floor<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.floor<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static trunc<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.trunc<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static nearest<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.nearest<T>(a.lo, a.hi)); }

  // @ts-expect-error: decorator
  @inline static shl<T>(a: V128Fallback, amount: i32): V128Fallback { return V128Fallback.pair(v128_swar.shl<T>(a.lo, a.hi, amount)); }
  // @ts-expect-error: decorator
  @inline static shr<T>(a: V128Fallback, amount: i32): V128Fallback { return V128Fallback.pair(v128_swar.shr<T>(a.lo, a.hi, amount)); }

  // @ts-expect-error: decorator
  @inline static and(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.and(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static or(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.or(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static xor(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.xor(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static andnot(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.andnot(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static not(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.not(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static bitselect(a: V128Fallback, b: V128Fallback, mask: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.bitselect(a.lo, a.hi, b.lo, b.hi, mask.lo, mask.hi)); }
  // @ts-expect-error: decorator
  @inline static popcnt<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.popcnt<T>(a.lo, a.hi)); }

  // @ts-expect-error: decorator
  @inline static any_true(a: V128Fallback): bool { return v128_swar.any_true(a.lo, a.hi); }
  // @ts-expect-error: decorator
  @inline static all_true<T>(a: V128Fallback): bool { return v128_swar.all_true<T>(a.lo, a.hi); }
  // @ts-expect-error: decorator
  @inline static bitmask<T>(a: V128Fallback): i32 { return v128_swar.bitmask<T>(a.lo, a.hi); }

  // @ts-expect-error: decorator
  @inline static eq<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.eq<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static ne<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.ne<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static lt<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.lt<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static le<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.le<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static gt<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.gt<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static ge<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.ge<T>(a.lo, a.hi, b.lo, b.hi)); }

  // @ts-expect-error: decorator
  @inline static convert<TFrom>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.convert<TFrom>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static convert_low<TFrom>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.convert_low<TFrom>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static trunc_sat<TTo>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.trunc_sat<TTo>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static trunc_sat_zero<TTo>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.trunc_sat_zero<TTo>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static narrow<TFrom>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.narrow<TFrom>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static extend_low<TFrom>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.extend_low<TFrom>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static extend_high<TFrom>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.extend_high<TFrom>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static extadd_pairwise<TFrom>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.extadd_pairwise<TFrom>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static extmul_low<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.extmul_low<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static extmul_high<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.extmul_high<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static demote_zero<T extends f64 = f64>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.demote_zero<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static promote_low<T extends f32 = f32>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.promote_low<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static q15mulr_sat<T extends i16>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.q15mulr_sat<T>(a.lo, a.hi, b.lo, b.hi)); }

  // @ts-expect-error: decorator
  @inline static relaxed_swizzle(a: V128Fallback, s: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_swizzle(a.lo, a.hi, s.lo, s.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_trunc<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_trunc<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_trunc_zero<T>(a: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_trunc_zero<T>(a.lo, a.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_madd<T>(a: V128Fallback, b: V128Fallback, c: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_madd<T>(a.lo, a.hi, b.lo, b.hi, c.lo, c.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_nmadd<T>(a: V128Fallback, b: V128Fallback, c: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_nmadd<T>(a.lo, a.hi, b.lo, b.hi, c.lo, c.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_laneselect<T>(a: V128Fallback, b: V128Fallback, mask: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_laneselect<T>(a.lo, a.hi, b.lo, b.hi, mask.lo, mask.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_min<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_min<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_max<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_max<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_q15mulr<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_q15mulr<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_dot<T>(a: V128Fallback, b: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_dot<T>(a.lo, a.hi, b.lo, b.hi)); }
  // @ts-expect-error: decorator
  @inline static relaxed_dot_add<T>(a: V128Fallback, b: V128Fallback, c: V128Fallback): V128Fallback { return V128Fallback.pair(v128_swar.relaxed_dot_add<T>(a.lo, a.hi, b.lo, b.hi, c.lo, c.hi)); }
}

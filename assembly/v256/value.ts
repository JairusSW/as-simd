import { v128_swar } from "../v128/v128_swar";
import { V128Fallback } from "../v128/v128_fallback";

/**
 * Allocation-lean immutable 256-bit value.
 *
 * Keeping the four scalar words directly in one managed object avoids the two
 * intermediate V128Fallback allocations required by the compatibility facade.
 */
export class v256 {
  readonly w0: u64;
  readonly w1: u64;
  readonly w2: u64;
  readonly w3: u64;

  @inline constructor(w0: u64, w1: u64, w2: u64, w3: u64) {
    this.w0 = w0; this.w1 = w1; this.w2 = w2; this.w3 = w3;
  }

  @inline static load(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { const p = ptr + immOffset; return new v256(load<u64>(p), load<u64>(p, 8), load<u64>(p, 16), load<u64>(p, 24)); }
  @inline static store(ptr: usize, value: v256, immOffset: usize = 0, immAlign: usize = 1): void { const p = ptr + immOffset; store<u64>(p, value.w0); store<u64>(p, value.w1, 8); store<u64>(p, value.w2, 16); store<u64>(p, value.w3, 24); }
  @inline static splat<T>(x: T): v256 { const lo = v128_swar.splat<T>(x), hi = v128_swar.take_hi(); return new v256(lo, hi, lo, hi); }
  @inline static add<T>(a: v256, b: v256): v256 {
    const r0 = v128_swar.add<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi();
    const r2 = v128_swar.add<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi();
    return new v256(r0, r1, r2, r3);
  }
  @inline static sub<T>(a: v256, b: v256): v256 {
    const r0 = v128_swar.sub<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi();
    const r2 = v128_swar.sub<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi();
    return new v256(r0, r1, r2, r3);
  }
  @inline static mul<T>(a: v256, b: v256): v256 { const r0 = v128_swar.mul<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.mul<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static min<T>(a: v256, b: v256): v256 { const r0 = v128_swar.min<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.min<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static max<T>(a: v256, b: v256): v256 { const r0 = v128_swar.max<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.max<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static add_sat<T>(a: v256, b: v256): v256 { const r0 = v128_swar.add_sat<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.add_sat<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static sub_sat<T>(a: v256, b: v256): v256 { const r0 = v128_swar.sub_sat<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.sub_sat<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static avgr<T>(a: v256, b: v256): v256 { const r0 = v128_swar.avgr<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.avgr<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static neg<T>(a: v256): v256 { const r0 = v128_swar.neg<T>(a.w0, a.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.neg<T>(a.w2, a.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static abs<T>(a: v256): v256 { const r0 = v128_swar.abs<T>(a.w0, a.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.abs<T>(a.w2, a.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static shl<T>(a: v256, shift: i32): v256 { const r0 = v128_swar.shl<T>(a.w0, a.w1, shift), r1 = v128_swar.take_hi(); const r2 = v128_swar.shl<T>(a.w2, a.w3, shift), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static shr<T>(a: v256, shift: i32): v256 { const r0 = v128_swar.shr<T>(a.w0, a.w1, shift), r1 = v128_swar.take_hi(); const r2 = v128_swar.shr<T>(a.w2, a.w3, shift), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static eq<T>(a: v256, b: v256): v256 { const r0 = v128_swar.eq<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.eq<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static ne<T>(a: v256, b: v256): v256 { const r0 = v128_swar.ne<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.ne<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static lt<T>(a: v256, b: v256): v256 { const r0 = v128_swar.lt<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.lt<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static le<T>(a: v256, b: v256): v256 { const r0 = v128_swar.le<T>(a.w0, a.w1, b.w0, b.w1), r1 = v128_swar.take_hi(); const r2 = v128_swar.le<T>(a.w2, a.w3, b.w2, b.w3), r3 = v128_swar.take_hi(); return new v256(r0, r1, r2, r3); }
  @inline static gt<T>(a: v256, b: v256): v256 { return v256.lt<T>(b, a); }
  @inline static ge<T>(a: v256, b: v256): v256 { return v256.le<T>(b, a); }
  @inline static and(a: v256, b: v256): v256 { return new v256(a.w0 & b.w0, a.w1 & b.w1, a.w2 & b.w2, a.w3 & b.w3); }
  @inline static or(a: v256, b: v256): v256 { return new v256(a.w0 | b.w0, a.w1 | b.w1, a.w2 | b.w2, a.w3 | b.w3); }
  @inline static xor(a: v256, b: v256): v256 { return new v256(a.w0 ^ b.w0, a.w1 ^ b.w1, a.w2 ^ b.w2, a.w3 ^ b.w3); }
  @inline static andnot(a: v256, b: v256): v256 { return new v256(a.w0 & ~b.w0, a.w1 & ~b.w1, a.w2 & ~b.w2, a.w3 & ~b.w3); }
  @inline static not(a: v256): v256 { return new v256(~a.w0, ~a.w1, ~a.w2, ~a.w3); }
  @inline static bitselect(a: v256, b: v256, m: v256): v256 { return new v256(b.w0 ^ ((a.w0 ^ b.w0) & m.w0), b.w1 ^ ((a.w1 ^ b.w1) & m.w1), b.w2 ^ ((a.w2 ^ b.w2) & m.w2), b.w3 ^ ((a.w3 ^ b.w3) & m.w3)); }
  @inline static any_true(a: v256): bool { return (a.w0 | a.w1 | a.w2 | a.w3) != 0; }
  @inline static all_true<T>(a: v256): bool { return v128_swar.all_true<T>(a.w0, a.w1) && v128_swar.all_true<T>(a.w2, a.w3); }
  @inline static bitmask<T>(a: v256): u32 { const n = 16 / sizeof<T>(); return (v128_swar.bitmask<T>(a.w0, a.w1) as u32) | ((v128_swar.bitmask<T>(a.w2, a.w3) as u32) << n); }
  @inline static extract_lane<T>(a: v256, idx: u8): T { const n = (16 / sizeof<T>()) as u32, lane = (idx as u32) % (n << 1); return lane < n ? v128_swar.extract_lane<T>(a.w0, a.w1, lane as u8) : v128_swar.extract_lane<T>(a.w2, a.w3, (lane - n) as u8); }
  @inline static replace_lane<T>(a: v256, idx: u8, value: T): v256 { const n = (16 / sizeof<T>()) as u32, lane = (idx as u32) % (n << 1); if (lane < n) { const lo = v128_swar.replace_lane<T>(a.w0, a.w1, lane as u8, value); return new v256(lo, v128_swar.take_hi(), a.w2, a.w3); } const lo = v128_swar.replace_lane<T>(a.w2, a.w3, (lane - n) as u8, value); return new v256(a.w0, a.w1, lo, v128_swar.take_hi()); }
  @inline private static chunk(a: v256, index: u32): V128Fallback { return index == 0 ? new V128Fallback(a.w0, a.w1) : new V128Fallback(a.w2, a.w3); }
  @inline private static fromChunks(c0: V128Fallback, c1: V128Fallback): v256 { return new v256(c0.lo, c0.hi, c1.lo, c1.hi); }
  @inline static loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): v256 { const n0 = len <= 0 ? 0 : len >= 16 ? 16 : len - 0; const c0 = V128Fallback.loadPartial(ptr, n0, immOffset + 0, immAlign, fill); const n1 = len <= 16 ? 0 : len >= 32 ? 16 : len - 16; const c1 = V128Fallback.loadPartial(ptr, n1, immOffset + 16, immAlign, fill); return v256.fromChunks(c0, c1); }
  @inline static storePartial(ptr: usize, value: v256, len: i32, immOffset: usize = 0, immAlign: usize = 1): void { const n0 = len <= 0 ? 0 : len >= 16 ? 16 : len - 0; if (n0 > 0) V128Fallback.storePartial(ptr, v256.chunk(value, 0), n0, immOffset + 0, immAlign); const n1 = len <= 16 ? 0 : len >= 32 ? 16 : len - 16; if (n1 > 0) V128Fallback.storePartial(ptr, v256.chunk(value, 1), n1, immOffset + 16, immAlign); }
  @inline static load_ext<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.fromChunks(V128Fallback.load_ext<TFrom>(ptr, immOffset + 0, immAlign), V128Fallback.load_ext<TFrom>(ptr, immOffset + 8, immAlign)); }
  @inline static load_zero<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { const c0 = V128Fallback.load_zero<TFrom>(ptr, immOffset, immAlign); return v256.fromChunks(c0, new V128Fallback(0, 0)); }
  @inline static load_splat<T>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { const c = V128Fallback.load_splat<T>(ptr, immOffset, immAlign); return v256.fromChunks(c, c); }
  @inline static load8_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_splat<i8>(ptr, immOffset, immAlign); }
  @inline static load16_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_splat<i16>(ptr, immOffset, immAlign); }
  @inline static load32_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_splat<i32>(ptr, immOffset, immAlign); }
  @inline static load64_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_splat<i64>(ptr, immOffset, immAlign); }
  @inline static load8x8_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v256 { return v256.fromChunks(V128Fallback.load8x8_s(ptr, immOffset + 0, immAlign), V128Fallback.load8x8_s(ptr, immOffset + 8, immAlign)); }
  @inline static load8x8_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v256 { return v256.fromChunks(V128Fallback.load8x8_u(ptr, immOffset + 0, immAlign), V128Fallback.load8x8_u(ptr, immOffset + 8, immAlign)); }
  @inline static load16x4_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v256 { return v256.fromChunks(V128Fallback.load16x4_s(ptr, immOffset + 0, immAlign), V128Fallback.load16x4_s(ptr, immOffset + 8, immAlign)); }
  @inline static load16x4_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v256 { return v256.fromChunks(V128Fallback.load16x4_u(ptr, immOffset + 0, immAlign), V128Fallback.load16x4_u(ptr, immOffset + 8, immAlign)); }
  @inline static load32x2_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v256 { return v256.fromChunks(V128Fallback.load32x2_s(ptr, immOffset + 0, immAlign), V128Fallback.load32x2_s(ptr, immOffset + 8, immAlign)); }
  @inline static load32x2_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v256 { return v256.fromChunks(V128Fallback.load32x2_u(ptr, immOffset + 0, immAlign), V128Fallback.load32x2_u(ptr, immOffset + 8, immAlign)); }
  @inline static load32_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_zero<i32>(ptr, immOffset, immAlign); }
  @inline static load64_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_zero<i64>(ptr, immOffset, immAlign); }
  @inline static load_lane<T>(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.replace_lane<T>(vec, idx, load<T>(ptr + immOffset)); }
  @inline static store_lane<T>(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store<T>(ptr + immOffset, v256.extract_lane<T>(vec, idx)); }
  @inline static load8_lane(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_lane<i8>(ptr, vec, idx, immOffset, immAlign); }
  @inline static store8_lane(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { v256.store_lane<i8>(ptr, vec, idx, immOffset, immAlign); }
  @inline static load16_lane(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_lane<i16>(ptr, vec, idx, immOffset, immAlign); }
  @inline static store16_lane(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { v256.store_lane<i16>(ptr, vec, idx, immOffset, immAlign); }
  @inline static load32_lane(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_lane<i32>(ptr, vec, idx, immOffset, immAlign); }
  @inline static store32_lane(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { v256.store_lane<i32>(ptr, vec, idx, immOffset, immAlign); }
  @inline static load64_lane(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v256 { return v256.load_lane<i64>(ptr, vec, idx, immOffset, immAlign); }
  @inline static store64_lane(ptr: usize, vec: v256, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { v256.store_lane<i64>(ptr, vec, idx, immOffset, immAlign); }
  static shuffle<T>(a: v256, b: v256, ...lanes: u8[]): v256 {
    let out = v256.splat<T>(0 as T);
    const count = (32 / sizeof<T>()) as i32;
    for (let i = 0, n = lanes.length < count ? lanes.length : count; i < n; i++) {
      const lane = lanes[i] as i32;
      out = v256.replace_lane<T>(out, i as u8, lane < count ? v256.extract_lane<T>(a, lane as u8) : v256.extract_lane<T>(b, (lane - count) as u8));
    }
    return out;
  }
  static swizzle(a: v256, mask: v256): v256 {
    let out = v256.splat<u8>(0);
    for (let i: u8 = 0; i < 32; i++) {
      const lane = v256.extract_lane<u8>(mask, i);
      if (lane < 32) out = v256.replace_lane<u8>(out, i, v256.extract_lane<u8>(a, lane));
    }
    return out;
  }
  @inline static sqrt<T>(a: v256): v256 { return v256.fromChunks(V128Fallback.sqrt<T>(v256.chunk(a, 0)), V128Fallback.sqrt<T>(v256.chunk(a, 1))); }
  @inline static ceil<T>(a: v256): v256 { return v256.fromChunks(V128Fallback.ceil<T>(v256.chunk(a, 0)), V128Fallback.ceil<T>(v256.chunk(a, 1))); }
  @inline static floor<T>(a: v256): v256 { return v256.fromChunks(V128Fallback.floor<T>(v256.chunk(a, 0)), V128Fallback.floor<T>(v256.chunk(a, 1))); }
  @inline static trunc<T>(a: v256): v256 { return v256.fromChunks(V128Fallback.trunc<T>(v256.chunk(a, 0)), V128Fallback.trunc<T>(v256.chunk(a, 1))); }
  @inline static nearest<T>(a: v256): v256 { return v256.fromChunks(V128Fallback.nearest<T>(v256.chunk(a, 0)), V128Fallback.nearest<T>(v256.chunk(a, 1))); }
  @inline static popcnt<T>(a: v256): v256 { return v256.fromChunks(V128Fallback.popcnt<T>(v256.chunk(a, 0)), V128Fallback.popcnt<T>(v256.chunk(a, 1))); }
  @inline static convert<TFrom>(a: v256): v256 { return v256.fromChunks(V128Fallback.convert<TFrom>(v256.chunk(a, 0)), V128Fallback.convert<TFrom>(v256.chunk(a, 1))); }
  @inline static convert_low<TFrom>(a: v256): v256 { return v256.fromChunks(V128Fallback.convert_low<TFrom>(new V128Fallback(a.w0, a.w1)), V128Fallback.convert_low<TFrom>(new V128Fallback(a.w1, 0))); }
  @inline static trunc_sat<TTo>(a: v256): v256 { return v256.fromChunks(V128Fallback.trunc_sat<TTo>(v256.chunk(a, 0)), V128Fallback.trunc_sat<TTo>(v256.chunk(a, 1))); }
  @inline static trunc_sat_zero<TTo>(a: v256): v256 { const c0 = V128Fallback.trunc_sat_zero<TTo>(v256.chunk(a, 0)), c1 = V128Fallback.trunc_sat_zero<TTo>(v256.chunk(a, 1)); return new v256(c0.lo, c1.lo, 0, 0); }
  @inline static extend_low<TFrom>(a: v256): v256 { const c = v256.chunk(a, 0); return v256.fromChunks(V128Fallback.extend_low<TFrom>(c), V128Fallback.extend_high<TFrom>(c)); }
  @inline static extend_high<TFrom>(a: v256): v256 { const c = v256.chunk(a, 1); return v256.fromChunks(V128Fallback.extend_low<TFrom>(c), V128Fallback.extend_high<TFrom>(c)); }
  @inline static extadd_pairwise<TFrom>(a: v256): v256 { return v256.fromChunks(V128Fallback.extadd_pairwise<TFrom>(v256.chunk(a, 0)), V128Fallback.extadd_pairwise<TFrom>(v256.chunk(a, 1))); }
  @inline static demote_zero<T extends f64 = f64>(a: v256): v256 { const c0 = V128Fallback.demote_zero<T>(v256.chunk(a, 0)), c1 = V128Fallback.demote_zero<T>(v256.chunk(a, 1)); return new v256(c0.lo, c1.lo, 0, 0); }
  @inline static promote_low<T extends f32 = f32>(a: v256): v256 { return v256.fromChunks(V128Fallback.promote_low<T>(new V128Fallback(a.w0, a.w1)), V128Fallback.promote_low<T>(new V128Fallback(a.w1, 0))); }
  @inline static relaxed_trunc<T>(a: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_trunc<T>(v256.chunk(a, 0)), V128Fallback.relaxed_trunc<T>(v256.chunk(a, 1))); }
  @inline static relaxed_trunc_zero<T>(a: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_trunc_zero<T>(v256.chunk(a, 0)), V128Fallback.relaxed_trunc_zero<T>(v256.chunk(a, 1))); }
  @inline static div<T>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.div<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.div<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static pmin<T>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.pmin<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.pmin<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static pmax<T>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.pmax<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.pmax<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static dot<T extends i16>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.dot<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.dot<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static narrow<TFrom>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.narrow<TFrom>(v256.chunk(a, 0), v256.chunk(a, 1)), V128Fallback.narrow<TFrom>(v256.chunk(b, 0), v256.chunk(b, 1))); }
  @inline static extmul_low<T>(a: v256, b: v256): v256 { const ac = v256.chunk(a, 0), bc = v256.chunk(b, 0); return v256.fromChunks(V128Fallback.extmul_low<T>(ac, bc), V128Fallback.extmul_high<T>(ac, bc)); }
  @inline static extmul_high<T>(a: v256, b: v256): v256 { const ac = v256.chunk(a, 1), bc = v256.chunk(b, 1); return v256.fromChunks(V128Fallback.extmul_low<T>(ac, bc), V128Fallback.extmul_high<T>(ac, bc)); }
  @inline static q15mulr_sat<T extends i16>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.q15mulr_sat<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.q15mulr_sat<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static relaxed_min<T>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_min<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.relaxed_min<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static relaxed_max<T>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_max<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.relaxed_max<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static relaxed_q15mulr<T>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_q15mulr<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.relaxed_q15mulr<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static relaxed_dot<T>(a: v256, b: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_dot<T>(v256.chunk(a, 0), v256.chunk(b, 0)), V128Fallback.relaxed_dot<T>(v256.chunk(a, 1), v256.chunk(b, 1))); }
  @inline static relaxed_madd<T>(a: v256, b: v256, c: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_madd<T>(v256.chunk(a, 0), v256.chunk(b, 0), v256.chunk(c, 0)), V128Fallback.relaxed_madd<T>(v256.chunk(a, 1), v256.chunk(b, 1), v256.chunk(c, 1))); }
  @inline static relaxed_nmadd<T>(a: v256, b: v256, c: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_nmadd<T>(v256.chunk(a, 0), v256.chunk(b, 0), v256.chunk(c, 0)), V128Fallback.relaxed_nmadd<T>(v256.chunk(a, 1), v256.chunk(b, 1), v256.chunk(c, 1))); }
  @inline static relaxed_laneselect<T>(a: v256, b: v256, c: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_laneselect<T>(v256.chunk(a, 0), v256.chunk(b, 0), v256.chunk(c, 0)), V128Fallback.relaxed_laneselect<T>(v256.chunk(a, 1), v256.chunk(b, 1), v256.chunk(c, 1))); }
  @inline static relaxed_dot_add<T>(a: v256, b: v256, c: v256): v256 { return v256.fromChunks(V128Fallback.relaxed_dot_add<T>(v256.chunk(a, 0), v256.chunk(b, 0), v256.chunk(c, 0)), V128Fallback.relaxed_dot_add<T>(v256.chunk(a, 1), v256.chunk(b, 1), v256.chunk(c, 1))); }
  @inline static relaxed_swizzle(a: v256, mask: v256): v256 { return v256.swizzle(a, mask); }

}

import { v64 } from "../v64/v64";
import { i8x16_swar } from "./i8x16_swar";
import { i16x8_swar } from "./i16x8_swar";
import { i32x4_swar } from "./i32x4_swar";
import { i64x2_swar } from "./i64x2_swar";

let __as_simd_v128_hi: u64 = 0;

export function v128_swar(lo: u64, hi: u64): u64 {
  __as_simd_v128_hi = hi;
  return lo;
}

export namespace v128_swar {
  // @ts-expect-error: decorator
  @inline export function take_hi(): u64 { return __as_simd_v128_hi; }
  // @ts-expect-error: decorator
  @inline function set_pair(lo: u64, hi: u64): u64 {
    __as_simd_v128_hi = hi;
    return lo;
  }
  // @ts-expect-error: decorator
  @inline function laneCount<T>(): i32 { return 16 / sizeof<T>(); }
  // @ts-expect-error: decorator
  @inline function f64pack(a: f64, b: f64): u64 { return set_pair(reinterpret<i64>(a) as u64, reinterpret<i64>(b) as u64); }

  // @ts-expect-error: decorator
  @inline export function splat<T>(x: T): u64 {
    const l = v64.splat<T>(x) as u64;
    return set_pair(l, l);
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane<T>(lo: u64, hi: u64, idx: u8): T {
    const n = laneCount<T>();
    const i = idx as i32 % n;
    const half = n >> 1;
    return i < half ? v64.extract_lane<T>(lo as v64, i as u8) : v64.extract_lane<T>(hi as v64, (i - half) as u8);
  }
  // @ts-expect-error: decorator
  @inline export function replace_lane<T>(lo: u64, hi: u64, idx: u8, value: T): u64 {
    const n = laneCount<T>();
    const i = idx as i32 % n;
    const half = n >> 1;
    return i < half ? set_pair(v64.replace_lane<T>(lo as v64, i as u8, value) as u64, hi) : set_pair(lo, v64.replace_lane<T>(hi as v64, (i - half) as u8, value) as u64);
  }
  /** Selects lanes from either vector according to lane indexes in `lanes`. */
  export function shuffle<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64, lanes: StaticArray<u8>): u64 {
    let out = splat<T>(0 as T);
    let outHi = take_hi();
    const n = laneCount<T>();
    let i = 0;
    while (i < n) {
      const lane = unchecked(lanes[i]) as i32;
      const val = lane < n ? extract_lane<T>(aLo, aHi, lane as u8) : extract_lane<T>(bLo, bHi, (lane - n) as u8);
      out = replace_lane<T>(out, outHi, i as u8, val);
      outHi = take_hi();
      i++;
    }
    return set_pair(out, outHi);
  }
  // @ts-expect-error: decorator
  @inline export function swizzle(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
    const lo = i8x16_swar.swizzle(aLo, aHi, sLo, sHi);
    return set_pair(lo, i8x16_swar.take_hi());
  }

  // @ts-expect-error: decorator
  @inline export function load(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 {
    return set_pair(load<u64>(ptr, immOffset, immAlign), load<u64>(ptr, immOffset + 8, immAlign));
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): u64 {
    const lo = i8x16_swar.loadPartial(ptr, len, immOffset, immAlign, fill);
    return set_pair(lo, i8x16_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function store(ptr: usize, lo: u64, hi: u64, immOffset: usize = 0, immAlign: usize = 1): void {
    store<u64>(ptr, lo, immOffset, immAlign);
    store<u64>(ptr, hi, immOffset + 8, immAlign);
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, lo: u64, hi: u64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    i8x16_swar.storePartial(ptr, lo, hi, len, immOffset, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function load_ext<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? load8x8_s(ptr, immOffset, immAlign) : load8x8_u(ptr, immOffset, immAlign);
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? load16x4_s(ptr, immOffset, immAlign) : load16x4_u(ptr, immOffset, immAlign);
    if (sizeof<TFrom>() == 4) return isSigned<TFrom>() ? load32x2_s(ptr, immOffset, immAlign) : load32x2_u(ptr, immOffset, immAlign);
    return load(ptr, immOffset, immAlign);
  }
  // @ts-expect-error: decorator
  @inline export function load_zero<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 {
    if (sizeof<TFrom>() == 1) return set_pair(load<u8>(ptr, immOffset, immAlign) as u64, 0);
    if (sizeof<TFrom>() == 2) return set_pair(load<u16>(ptr, immOffset, immAlign) as u64, 0);
    if (sizeof<TFrom>() == 4) return set_pair(load<u32>(ptr, immOffset, immAlign) as u64, 0);
    if (sizeof<TFrom>() == 8) return set_pair(load<u64>(ptr, immOffset, immAlign), 0);
    return load(ptr, immOffset, immAlign);
  }
  // @ts-expect-error: decorator
  @inline export function load_lane<T>(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): u64 {
    return replace_lane<T>(vecLo, vecHi, idx, load<T>(ptr, immOffset, immAlign));
  }
  // @ts-expect-error: decorator
  @inline export function store_lane<T>(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void {
    store<T>(ptr, extract_lane<T>(vecLo, vecHi, idx), immOffset, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function load8x8_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): u64 {
    const lo = i16x8_swar.extend_low_i8x16_s(load<u64>(ptr, immOffset, immAlign), 0);
    return set_pair(lo, i16x8_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function load8x8_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): u64 {
    const lo = i16x8_swar.extend_low_i8x16_u(load<u64>(ptr, immOffset, immAlign), 0);
    return set_pair(lo, i16x8_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function load16x4_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): u64 {
    const lo = i32x4_swar.extend_low_i16x8_s(load<u64>(ptr, immOffset, immAlign), 0);
    return set_pair(lo, i32x4_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function load16x4_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): u64 {
    const lo = i32x4_swar.extend_low_i16x8_u(load<u64>(ptr, immOffset, immAlign), 0);
    return set_pair(lo, i32x4_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function load32x2_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): u64 {
    const lo = i64x2_swar.extend_low_i32x4_s(load<u64>(ptr, immOffset, immAlign), 0);
    return set_pair(lo, i64x2_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function load32x2_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): u64 {
    const lo = i64x2_swar.extend_low_i32x4_u(load<u64>(ptr, immOffset, immAlign), 0);
    return set_pair(lo, i64x2_swar.take_hi());
  }

  // @ts-expect-error: decorator
  @inline export function load_splat<T>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 { return splat<T>(load<T>(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load8_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 { return splat<i8>(load<i8>(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load16_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 { return splat<i16>(load<i16>(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load32_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 { return splat<i32>(load<i32>(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load64_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 { return splat<i64>(load<i64>(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load32_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 { return load_zero<u32>(ptr, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load64_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 { return load_zero<u64>(ptr, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load8_lane(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): u64 { return load_lane<i8>(ptr, vecLo, vecHi, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load16_lane(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): u64 { return load_lane<i16>(ptr, vecLo, vecHi, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load32_lane(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): u64 { return load_lane<i32>(ptr, vecLo, vecHi, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load64_lane(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): u64 { return load_lane<i64>(ptr, vecLo, vecHi, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store8_lane(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i8>(ptr, vecLo, vecHi, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store16_lane(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i16>(ptr, vecLo, vecHi, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store32_lane(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i32>(ptr, vecLo, vecHi, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store64_lane(ptr: usize, vecLo: u64, vecHi: u64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i64>(ptr, vecLo, vecHi, idx, immOffset, immAlign); }

  // @ts-expect-error: decorator
  @inline export function add<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.add(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return set_pair(i16x8_swar.add(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return set_pair(i32x4_swar.add(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    if (sizeof<T>() == 8 && !isFloat<T>()) return set_pair(i64x2_swar.add(aLo, aHi, bLo, bHi), i64x2_swar.take_hi());
    return set_pair(v64.add<T>(aLo as v64, bLo as v64) as u64, v64.add<T>(aHi as v64, bHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function sub<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.sub(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return set_pair(i16x8_swar.sub(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return set_pair(i32x4_swar.sub(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    if (sizeof<T>() == 8 && !isFloat<T>()) return set_pair(i64x2_swar.sub(aLo, aHi, bLo, bHi), i64x2_swar.take_hi());
    return set_pair(v64.sub<T>(aLo as v64, bLo as v64) as u64, v64.sub<T>(aHi as v64, bHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function mul<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.mul(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return set_pair(i16x8_swar.mul(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return set_pair(i32x4_swar.mul(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    if (sizeof<T>() == 8 && !isFloat<T>()) return set_pair(i64x2_swar.mul(aLo, aHi, bLo, bHi), i64x2_swar.take_hi());
    return set_pair(v64.mul<T>(aLo as v64, bLo as v64) as u64, v64.mul<T>(aHi as v64, bHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function div<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(v64.div<T>(aLo as v64, bLo as v64) as u64, v64.div<T>(aHi as v64, bHi as v64) as u64); }
  // @ts-expect-error: decorator
  @inline export function neg<T>(aLo: u64, aHi: u64): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.neg(aLo, aHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return set_pair(i16x8_swar.neg(aLo, aHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return set_pair(i32x4_swar.neg(aLo, aHi), i32x4_swar.take_hi());
    if (sizeof<T>() == 8 && !isFloat<T>()) return set_pair(i64x2_swar.neg(aLo, aHi), i64x2_swar.take_hi());
    return set_pair(v64.neg<T>(aLo as v64) as u64, v64.neg<T>(aHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function add_sat<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i8x16_swar.add_sat_s(aLo, aHi, bLo, bHi), i8x16_swar.take_hi()) : set_pair(i8x16_swar.add_sat_u(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i16x8_swar.add_sat_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.add_sat_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    return add<T>(aLo, aHi, bLo, bHi);
  }
  // @ts-expect-error: decorator
  @inline export function sub_sat<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i8x16_swar.sub_sat_s(aLo, aHi, bLo, bHi), i8x16_swar.take_hi()) : set_pair(i8x16_swar.sub_sat_u(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i16x8_swar.sub_sat_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.sub_sat_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    return sub<T>(aLo, aHi, bLo, bHi);
  }
  // @ts-expect-error: decorator
  @inline export function shl<T>(aLo: u64, aHi: u64, b: i32): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.shl(aLo, aHi, b), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return set_pair(i16x8_swar.shl(aLo, aHi, b), i16x8_swar.take_hi());
    if (sizeof<T>() == 4) return set_pair(i32x4_swar.shl(aLo, aHi, b), i32x4_swar.take_hi());
    return set_pair(i64x2_swar.shl(aLo, aHi, b), i64x2_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function shr<T>(aLo: u64, aHi: u64, b: i32): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i8x16_swar.shr_s(aLo, aHi, b), i8x16_swar.take_hi()) : set_pair(i8x16_swar.shr_u(aLo, aHi, b), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i16x8_swar.shr_s(aLo, aHi, b), i16x8_swar.take_hi()) : set_pair(i16x8_swar.shr_u(aLo, aHi, b), i16x8_swar.take_hi());
    if (sizeof<T>() == 4) return isSigned<T>() ? set_pair(i32x4_swar.shr_s(aLo, aHi, b), i32x4_swar.take_hi()) : set_pair(i32x4_swar.shr_u(aLo, aHi, b), i32x4_swar.take_hi());
    return isSigned<T>() ? set_pair(i64x2_swar.shr_s(aLo, aHi, b), i64x2_swar.take_hi()) : set_pair(i64x2_swar.shr_u(aLo, aHi, b), i64x2_swar.take_hi());
  }

  // @ts-expect-error: decorator
  @inline export function and(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(aLo & bLo, aHi & bHi); }
  // @ts-expect-error: decorator
  @inline export function or(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(aLo | bLo, aHi | bHi); }
  // @ts-expect-error: decorator
  @inline export function xor(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(aLo ^ bLo, aHi ^ bHi); }
  // @ts-expect-error: decorator
  @inline export function andnot(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(aLo & ~bLo, aHi & ~bHi); }
  // @ts-expect-error: decorator
  @inline export function not(aLo: u64, aHi: u64): u64 { return set_pair(~aLo, ~aHi); }
  // @ts-expect-error: decorator
  @inline export function bitselect(v1Lo: u64, v1Hi: u64, v2Lo: u64, v2Hi: u64, mLo: u64, mHi: u64): u64 { return set_pair((v1Lo & mLo) | (v2Lo & ~mLo), (v1Hi & mHi) | (v2Hi & ~mHi)); }
  // @ts-expect-error: decorator
  @inline export function any_true(aLo: u64, aHi: u64): bool { return aLo != 0 || aHi != 0; }
  // @ts-expect-error: decorator
  @inline export function all_true<T>(aLo: u64, aHi: u64): bool { return v64.all_true<T>(aLo as v64) && v64.all_true<T>(aHi as v64); }
  // @ts-expect-error: decorator
  @inline export function bitmask<T>(aLo: u64, aHi: u64): i32 {
    if (sizeof<T>() == 1) return i8x16_swar.bitmask(aLo, aHi);
    if (sizeof<T>() == 2) return i16x8_swar.bitmask(aLo, aHi);
    if (sizeof<T>() == 4) return i32x4_swar.bitmask(aLo, aHi);
    return i64x2_swar.bitmask(aLo, aHi);
  }
  // @ts-expect-error: decorator
  @inline export function popcnt<T>(aLo: u64, aHi: u64): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.popcnt(aLo, aHi), i8x16_swar.take_hi());
    return set_pair(v64.popcnt<T>(aLo as v64) as u64, v64.popcnt<T>(aHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function min<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i8x16_swar.min_s(aLo, aHi, bLo, bHi), i8x16_swar.take_hi()) : set_pair(i8x16_swar.min_u(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i16x8_swar.min_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.min_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return isSigned<T>() ? set_pair(i32x4_swar.min_s(aLo, aHi, bLo, bHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.min_u(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    return set_pair(v64.min<T>(aLo as v64, bLo as v64) as u64, v64.min<T>(aHi as v64, bHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function max<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i8x16_swar.max_s(aLo, aHi, bLo, bHi), i8x16_swar.take_hi()) : set_pair(i8x16_swar.max_u(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i16x8_swar.max_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.max_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return isSigned<T>() ? set_pair(i32x4_swar.max_s(aLo, aHi, bLo, bHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.max_u(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    return set_pair(v64.max<T>(aLo as v64, bLo as v64) as u64, v64.max<T>(aHi as v64, bHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function pmin<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return min<T>(aLo, aHi, bLo, bHi); }
  // @ts-expect-error: decorator
  @inline export function pmax<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return max<T>(aLo, aHi, bLo, bHi); }
  // @ts-expect-error: decorator
  @inline export function dot<T extends i16>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i32x4_swar.dot_i16x8_s(aLo, aHi, bLo, bHi), i32x4_swar.take_hi()); }
  // @ts-expect-error: decorator
  @inline export function avgr<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return sizeof<T>() == 1 ? set_pair(i8x16_swar.avgr_u(aLo, aHi, bLo, bHi), i8x16_swar.take_hi()) : set_pair(i16x8_swar.avgr_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()); }
  // @ts-expect-error: decorator
  @inline export function abs<T>(aLo: u64, aHi: u64): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.abs(aLo, aHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return set_pair(i16x8_swar.abs(aLo, aHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return set_pair(i32x4_swar.abs(aLo, aHi), i32x4_swar.take_hi());
    if (sizeof<T>() == 8 && !isFloat<T>()) return set_pair(i64x2_swar.abs(aLo, aHi), i64x2_swar.take_hi());
    return set_pair(v64.abs<T>(aLo as v64) as u64, v64.abs<T>(aHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function sqrt<T>(aLo: u64, aHi: u64): u64 { return set_pair(v64.sqrt<T>(aLo as v64) as u64, v64.sqrt<T>(aHi as v64) as u64); }
  // @ts-expect-error: decorator
  @inline export function ceil<T>(aLo: u64, aHi: u64): u64 { return set_pair(v64.ceil<T>(aLo as v64) as u64, v64.ceil<T>(aHi as v64) as u64); }
  // @ts-expect-error: decorator
  @inline export function floor<T>(aLo: u64, aHi: u64): u64 { return set_pair(v64.floor<T>(aLo as v64) as u64, v64.floor<T>(aHi as v64) as u64); }
  // @ts-expect-error: decorator
  @inline export function trunc<T>(aLo: u64, aHi: u64): u64 { return set_pair(v64.trunc<T>(aLo as v64) as u64, v64.trunc<T>(aHi as v64) as u64); }
  // @ts-expect-error: decorator
  @inline export function nearest<T>(aLo: u64, aHi: u64): u64 { return set_pair(v64.nearest<T>(aLo as v64) as u64, v64.nearest<T>(aHi as v64) as u64); }
  // @ts-expect-error: decorator
  @inline export function eq<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.eq(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return set_pair(i16x8_swar.eq(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return set_pair(i32x4_swar.eq(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    if (sizeof<T>() == 8 && !isFloat<T>()) return set_pair(i64x2_swar.eq(aLo, aHi, bLo, bHi), i64x2_swar.take_hi());
    return set_pair(v64.eq<T>(aLo as v64, bLo as v64) as u64, v64.eq<T>(aHi as v64, bHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function ne<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return not(eq<T>(aLo, aHi, bLo, bHi), take_hi()); }
  // @ts-expect-error: decorator
  @inline export function lt<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i8x16_swar.lt_s(aLo, aHi, bLo, bHi), i8x16_swar.take_hi()) : set_pair(i8x16_swar.lt_u(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i16x8_swar.lt_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.lt_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return isSigned<T>() ? set_pair(i32x4_swar.lt_s(aLo, aHi, bLo, bHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.lt_u(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    if (sizeof<T>() == 8 && !isFloat<T>()) return set_pair(i64x2_swar.lt_s(aLo, aHi, bLo, bHi), i64x2_swar.take_hi());
    return set_pair(v64.lt<T>(aLo as v64, bLo as v64) as u64, v64.lt<T>(aHi as v64, bHi as v64) as u64);
  }
  // @ts-expect-error: decorator
  @inline export function le<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i8x16_swar.le_s(aLo, aHi, bLo, bHi), i8x16_swar.take_hi()) : set_pair(i8x16_swar.le_u(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i16x8_swar.le_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.le_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4 && !isFloat<T>()) return isSigned<T>() ? set_pair(i32x4_swar.le_s(aLo, aHi, bLo, bHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.le_u(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    if (sizeof<T>() == 8 && !isFloat<T>()) return set_pair(i64x2_swar.le_s(aLo, aHi, bLo, bHi), i64x2_swar.take_hi());
    return not(lt<T>(bLo, bHi, aLo, aHi), take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function gt<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return lt<T>(bLo, bHi, aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function ge<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return le<T>(bLo, bHi, aLo, aHi); }

  // @ts-expect-error: decorator
  @inline export function convert<TFrom>(aLo: u64, aHi: u64): u64 { return set_pair(v64.convert<TFrom>(aLo as v64) as u64, v64.convert<TFrom>(aHi as v64) as u64); }
  // @ts-expect-error: decorator
  @inline export function convert_low<TFrom>(aLo: u64, aHi: u64): u64 {
    return f64pack(
      isSigned<TFrom>() ? i32x4_swar.extract_lane(aLo, aHi, 0) as f64 : i32x4_swar.extract_lane(aLo, aHi, 0) as u32 as f64,
      isSigned<TFrom>() ? i32x4_swar.extract_lane(aLo, aHi, 1) as f64 : i32x4_swar.extract_lane(aLo, aHi, 1) as u32 as f64
    );
  }
  // @ts-expect-error: decorator
  @inline export function trunc_sat<TTo>(aLo: u64, aHi: u64): u64 { return set_pair(v64.trunc_sat<TTo>(aLo as v64) as u64, v64.trunc_sat<TTo>(aHi as v64) as u64); }
  // @ts-expect-error: decorator
  @inline export function trunc_sat_zero<TTo>(aLo: u64, aHi: u64): u64 {
    let out = i32x4_swar.splat(0);
    let outHi = i32x4_swar.take_hi();
    out = i32x4_swar.replace_lane(out, outHi, 0, isSigned<TTo>() ? i32(extract_lane<f64>(aLo, aHi, 0)) : u32(select<f64>(0, extract_lane<f64>(aLo, aHi, 0), extract_lane<f64>(aLo, aHi, 0) < 0)));
    outHi = i32x4_swar.take_hi();
    out = i32x4_swar.replace_lane(out, outHi, 1, isSigned<TTo>() ? i32(extract_lane<f64>(aLo, aHi, 1)) : u32(select<f64>(0, extract_lane<f64>(aLo, aHi, 1), extract_lane<f64>(aLo, aHi, 1) < 0)));
    return set_pair(out, i32x4_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function narrow<TFrom>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? set_pair(i8x16_swar.narrow_i16x8_s(aLo, aHi, bLo, bHi), i8x16_swar.take_hi()) : set_pair(i8x16_swar.narrow_i16x8_u(aLo, aHi, bLo, bHi), i8x16_swar.take_hi());
    return isSigned<TFrom>() ? set_pair(i16x8_swar.narrow_i32x4_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.narrow_i32x4_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function extend_low<TFrom>(aLo: u64, aHi: u64): u64 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? set_pair(i16x8_swar.extend_low_i8x16_s(aLo, aHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.extend_low_i8x16_u(aLo, aHi), i16x8_swar.take_hi());
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? set_pair(i32x4_swar.extend_low_i16x8_s(aLo, aHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.extend_low_i16x8_u(aLo, aHi), i32x4_swar.take_hi());
    return isSigned<TFrom>() ? set_pair(i64x2_swar.extend_low_i32x4_s(aLo, aHi), i64x2_swar.take_hi()) : set_pair(i64x2_swar.extend_low_i32x4_u(aLo, aHi), i64x2_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function extend_high<TFrom>(aLo: u64, aHi: u64): u64 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? set_pair(i16x8_swar.extend_high_i8x16_s(aLo, aHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.extend_high_i8x16_u(aLo, aHi), i16x8_swar.take_hi());
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? set_pair(i32x4_swar.extend_high_i16x8_s(aLo, aHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.extend_high_i16x8_u(aLo, aHi), i32x4_swar.take_hi());
    return isSigned<TFrom>() ? set_pair(i64x2_swar.extend_high_i32x4_s(aLo, aHi), i64x2_swar.take_hi()) : set_pair(i64x2_swar.extend_high_i32x4_u(aLo, aHi), i64x2_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise<TFrom>(aLo: u64, aHi: u64): u64 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? set_pair(i16x8_swar.extadd_pairwise_i8x16_s(aLo, aHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.extadd_pairwise_i8x16_u(aLo, aHi), i16x8_swar.take_hi());
    return isSigned<TFrom>() ? set_pair(i32x4_swar.extadd_pairwise_i16x8_s(aLo, aHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.extadd_pairwise_i16x8_u(aLo, aHi), i32x4_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function demote_zero<T extends f64 = f64>(aLo: u64, aHi: u64): u64 {
    let out = i32x4_swar.splat(0);
    let outHi = i32x4_swar.take_hi();
    out = i32x4_swar.replace_lane(out, outHi, 0, reinterpret<i32>(extract_lane<f64>(aLo, aHi, 0) as f32));
    outHi = i32x4_swar.take_hi();
    out = i32x4_swar.replace_lane(out, outHi, 1, reinterpret<i32>(extract_lane<f64>(aLo, aHi, 1) as f32));
    return set_pair(out, i32x4_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function promote_low<T extends f32 = f32>(aLo: u64, aHi: u64): u64 {
    return f64pack(extract_lane<f32>(aLo, aHi, 0) as f64, extract_lane<f32>(aLo, aHi, 1) as f64);
  }
  // @ts-expect-error: decorator
  @inline export function q15mulr_sat<T extends i16>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return set_pair(i16x8_swar.q15mulr_sat_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()); }
  // @ts-expect-error: decorator
  @inline export function extmul_low<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i16x8_swar.extmul_low_i8x16_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.extmul_low_i8x16_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i32x4_swar.extmul_low_i16x8_s(aLo, aHi, bLo, bHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.extmul_low_i16x8_u(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    return isSigned<T>() ? set_pair(i64x2_swar.extmul_low_i32x4_s(aLo, aHi, bLo, bHi), i64x2_swar.take_hi()) : set_pair(i64x2_swar.extmul_low_i32x4_u(aLo, aHi, bLo, bHi), i64x2_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? set_pair(i16x8_swar.extmul_high_i8x16_s(aLo, aHi, bLo, bHi), i16x8_swar.take_hi()) : set_pair(i16x8_swar.extmul_high_i8x16_u(aLo, aHi, bLo, bHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 2) return isSigned<T>() ? set_pair(i32x4_swar.extmul_high_i16x8_s(aLo, aHi, bLo, bHi), i32x4_swar.take_hi()) : set_pair(i32x4_swar.extmul_high_i16x8_u(aLo, aHi, bLo, bHi), i32x4_swar.take_hi());
    return isSigned<T>() ? set_pair(i64x2_swar.extmul_high_i32x4_s(aLo, aHi, bLo, bHi), i64x2_swar.take_hi()) : set_pair(i64x2_swar.extmul_high_i32x4_u(aLo, aHi, bLo, bHi), i64x2_swar.take_hi());
  }

  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 { return set_pair(i8x16_swar.relaxed_swizzle(aLo, aHi, sLo, sHi), i8x16_swar.take_hi()); }
  // @ts-expect-error: decorator
  @inline export function relaxed_trunc<T>(aLo: u64, aHi: u64): u64 { return trunc_sat<T>(aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function relaxed_trunc_zero<T>(aLo: u64, aHi: u64): u64 { return trunc_sat_zero<T>(aLo, aHi); }
  // @ts-expect-error: decorator
  @inline export function relaxed_madd<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64, cLo: u64, cHi: u64): u64 {
    const m = mul<T>(aLo, aHi, bLo, bHi); const mHi = take_hi();
    return add<T>(m, mHi, cLo, cHi);
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_nmadd<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64, cLo: u64, cHi: u64): u64 {
    const m = mul<T>(aLo, aHi, bLo, bHi); const mHi = take_hi();
    const n = neg<T>(m, mHi); const nHi = take_hi();
    return add<T>(n, nHi, cLo, cHi);
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64, mLo: u64, mHi: u64): u64 {
    if (sizeof<T>() == 1) return set_pair(i8x16_swar.relaxed_laneselect(aLo, aHi, bLo, bHi, mLo, mHi), i8x16_swar.take_hi());
    if (sizeof<T>() == 2) return set_pair(i16x8_swar.relaxed_laneselect(aLo, aHi, bLo, bHi, mLo, mHi), i16x8_swar.take_hi());
    if (sizeof<T>() == 4) return set_pair(i32x4_swar.relaxed_laneselect(aLo, aHi, bLo, bHi, mLo, mHi), i32x4_swar.take_hi());
    return set_pair(i64x2_swar.relaxed_laneselect(aLo, aHi, bLo, bHi, mLo, mHi), i64x2_swar.take_hi());
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_min<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return min<T>(aLo, aHi, bLo, bHi); }
  // @ts-expect-error: decorator
  @inline export function relaxed_max<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return max<T>(aLo, aHi, bLo, bHi); }
  // @ts-expect-error: decorator
  @inline export function relaxed_q15mulr<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return q15mulr_sat<i16>(aLo, aHi, bLo, bHi); }
  // @ts-expect-error: decorator
  @inline export function relaxed_dot<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { return dot<i16>(aLo, aHi, bLo, bHi); }
  // @ts-expect-error: decorator
  @inline export function relaxed_dot_add<T>(aLo: u64, aHi: u64, bLo: u64, bHi: u64, cLo: u64, cHi: u64): u64 {
    const d = dot<i16>(aLo, aHi, bLo, bHi); const dHi = take_hi();
    return add<i32>(d, dHi, cLo, cHi);
  }
}

import { v64 } from "../v64";
import { i8x16_swar } from "./i8x16";
import { i16x8_swar } from "./i16x8";
import { i32x4_swar } from "./i32x4";
import { i64x2_swar } from "./i64x2";

export type v128_swar = v128;

// @ts-expect-error: decorator
@inline function mem_load<T>(ptr: usize, immAlign: usize = 1): T { return load<T>(ptr); }
// @ts-expect-error: decorator
@inline function mem_store<T>(ptr: usize, value: T, immAlign: usize = 1): void { store<T>(ptr, value); }

export namespace v128_swar {
  // @ts-expect-error: decorator
  @inline function lo(x: v128): v64 { return i64x2.extract_lane(x, 0) as v64; }
  // @ts-expect-error: decorator
  @inline function hi(x: v128): v64 { return i64x2.extract_lane(x, 1) as v64; }
  // @ts-expect-error: decorator
  @inline function pack(l: v64, h: v64): v128 { return i64x2(l as i64, h as i64); }
  // @ts-expect-error: decorator
  @inline function laneCount<T>(): i32 { return 16 / sizeof<T>(); }
  // @ts-expect-error: decorator
  @inline function f64pack(a: f64, b: f64): v128 { return i64x2(reinterpret<i64>(a), reinterpret<i64>(b)); }

  // @ts-expect-error: decorator
  @inline export function splat<T>(x: T): v128 { return pack(v64.splat<T>(x), v64.splat<T>(x)); }
  // @ts-expect-error: decorator
  @inline export function extract_lane<T>(x: v128, idx: u8): T {
    const n = laneCount<T>();
    const i = idx as i32 % n;
    const half = n >> 1;
    return i < half ? v64.extract_lane<T>(lo(x), i as u8) : v64.extract_lane<T>(hi(x), (i - half) as u8);
  }
  // @ts-expect-error: decorator
  @inline export function replace_lane<T>(x: v128, idx: u8, value: T): v128 {
    const n = laneCount<T>();
    const i = idx as i32 % n;
    const half = n >> 1;
    const l = lo(x), h = hi(x);
    return i < half ? pack(v64.replace_lane<T>(l, i as u8, value), h) : pack(l, v64.replace_lane<T>(h, (i - half) as u8, value));
  }
  /** Selects lanes from either vector according to lane indexes in `lanes`. */
  export function shuffle<T>(a: v128, b: v128, lanes: StaticArray<u8>): v128 {
    let out = splat<T>(0 as T);
    const n = laneCount<T>();
    let i = 0;
    while (i < n) {
      const lane = unchecked(lanes[i]) as i32;
      const val = lane < n ? extract_lane<T>(a, lane as u8) : extract_lane<T>(b, (lane - n) as u8);
      out = replace_lane<T>(out, i as u8, val);
      i++;
    }
    return out;
  }
  // @ts-expect-error: decorator
  @inline export function swizzle(a: v128, s: v128): v128 { return i8x16_swar.swizzle(a, s); }

  // @ts-expect-error: decorator
  @inline export function load(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 { return mem_load<v128>(ptr + immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): v128 {
    return i8x16_swar.loadPartial(ptr, len, immOffset, immAlign, fill);
  }
  // @ts-expect-error: decorator
  @inline export function store(ptr: usize, value: v128, immOffset: usize = 0, immAlign: usize = 1): void { mem_store<v128>(ptr + immOffset, value, immAlign); }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, value: v128, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    i8x16_swar.storePartial(ptr, value, len, immOffset, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function load_ext<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 {
    const base = ptr + immOffset;
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? load8x8_s(base) : load8x8_u(base);
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? load16x4_s(base) : load16x4_u(base);
    if (sizeof<TFrom>() == 4) return isSigned<TFrom>() ? load32x2_s(base) : load32x2_u(base);
    return mem_load<v128>(base, immAlign);
  }
  // @ts-expect-error: decorator
  @inline export function load_zero<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 {
    const base = ptr + immOffset;
    if (sizeof<TFrom>() == 1) return i64x2(mem_load<u8>(base, immAlign) as i64, 0);
    if (sizeof<TFrom>() == 2) return i64x2(mem_load<u16>(base, immAlign) as i64, 0);
    if (sizeof<TFrom>() == 4) return i64x2(mem_load<u32>(base, immAlign) as i64, 0);
    if (sizeof<TFrom>() == 8) return i64x2(mem_load<i64>(base, immAlign), 0);
    return mem_load<v128>(base, immAlign);
  }
  // @ts-expect-error: decorator
  @inline export function load_lane<T>(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v128 {
    return replace_lane<T>(vec, idx, mem_load<T>(ptr + immOffset, immAlign));
  }
  // @ts-expect-error: decorator
  @inline export function store_lane<T>(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void {
    mem_store<T>(ptr + immOffset, extract_lane<T>(vec, idx), immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function load8x8_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v128 {
    return i16x8_swar.extend_low_i8x16_s(i64x2(mem_load<i64>(ptr + immOffset, immAlign), 0));
  }
  // @ts-expect-error: decorator
  @inline export function load8x8_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v128 {
    return i16x8_swar.extend_low_i8x16_u(i64x2(mem_load<i64>(ptr + immOffset, immAlign), 0));
  }
  // @ts-expect-error: decorator
  @inline export function load16x4_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v128 {
    return i32x4_swar.extend_low_i16x8_s(i64x2(mem_load<i64>(ptr + immOffset, immAlign), 0));
  }
  // @ts-expect-error: decorator
  @inline export function load16x4_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v128 {
    return i32x4_swar.extend_low_i16x8_u(i64x2(mem_load<i64>(ptr + immOffset, immAlign), 0));
  }
  // @ts-expect-error: decorator
  @inline export function load32x2_s(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v128 {
    return i64x2_swar.extend_low_i32x4_s(i64x2(mem_load<i64>(ptr + immOffset, immAlign), 0));
  }
  // @ts-expect-error: decorator
  @inline export function load32x2_u(ptr: usize, immOffset: u32 = 0, immAlign: u32 = 1): v128 {
    return i64x2_swar.extend_low_i32x4_u(i64x2(mem_load<i64>(ptr + immOffset, immAlign), 0));
  }

  // @ts-expect-error: decorator
  @inline export function load_splat<T>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 { return splat<T>(mem_load<T>(ptr + immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load8_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 { return splat<i8>(mem_load<i8>(ptr + immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load16_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 { return splat<i16>(mem_load<i16>(ptr + immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load32_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 { return splat<i32>(mem_load<i32>(ptr + immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load64_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 { return splat<i64>(mem_load<i64>(ptr + immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function load32_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 { return load_zero<u32>(ptr, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load64_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v128 { return load_zero<u64>(ptr, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load8_lane(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v128 { return load_lane<i8>(ptr, vec, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load16_lane(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v128 { return load_lane<i16>(ptr, vec, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load32_lane(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v128 { return load_lane<i32>(ptr, vec, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load64_lane(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v128 { return load_lane<i64>(ptr, vec, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store8_lane(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i8>(ptr, vec, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store16_lane(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i16>(ptr, vec, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store32_lane(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i32>(ptr, vec, idx, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store64_lane(ptr: usize, vec: v128, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i64>(ptr, vec, idx, immOffset, immAlign); }

  // @ts-expect-error: decorator
  @inline export function add<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.add(a, b);
    if (sizeof<T>() == 2) return i16x8_swar.add(a, b);
    if (sizeof<T>() == 4 && !isFloat<T>()) return i32x4_swar.add(a, b);
    return pack(v64.add<T>(lo(a), lo(b)), v64.add<T>(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function sub<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.sub(a, b);
    if (sizeof<T>() == 2) return i16x8_swar.sub(a, b);
    if (sizeof<T>() == 4 && !isFloat<T>()) return i32x4_swar.sub(a, b);
    return pack(v64.sub<T>(lo(a), lo(b)), v64.sub<T>(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function mul<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.mul(a, b);
    if (sizeof<T>() == 2) return i16x8_swar.mul(a, b);
    if (sizeof<T>() == 4 && !isFloat<T>()) return i32x4_swar.mul(a, b);
    return pack(v64.mul<T>(lo(a), lo(b)), v64.mul<T>(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function div<T>(a: v128, b: v128): v128 { return pack(v64.div<T>(lo(a), lo(b)), v64.div<T>(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function neg<T>(a: v128): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.neg(a);
    if (sizeof<T>() == 2) return i16x8_swar.neg(a);
    if (sizeof<T>() == 4 && !isFloat<T>()) return i32x4_swar.neg(a);
    return pack(v64.neg<T>(lo(a)), v64.neg<T>(hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function add_sat<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x16_swar.add_sat_s(a, b) : i8x16_swar.add_sat_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x8_swar.add_sat_s(a, b) : i16x8_swar.add_sat_u(a, b);
    return add<T>(a, b);
  }
  // @ts-expect-error: decorator
  @inline export function sub_sat<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x16_swar.sub_sat_s(a, b) : i8x16_swar.sub_sat_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x8_swar.sub_sat_s(a, b) : i16x8_swar.sub_sat_u(a, b);
    return sub<T>(a, b);
  }
  // @ts-expect-error: decorator
  @inline export function shl<T>(a: v128, b: i32): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.shl(a, b);
    if (sizeof<T>() == 2) return i16x8_swar.shl(a, b);
    if (sizeof<T>() == 4) return i32x4_swar.shl(a, b);
    return i64x2_swar.shl(a, b);
  }
  // @ts-expect-error: decorator
  @inline export function shr<T>(a: v128, b: i32): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x16_swar.shr_s(a, b) : i8x16_swar.shr_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x8_swar.shr_s(a, b) : i16x8_swar.shr_u(a, b);
    if (sizeof<T>() == 4) return isSigned<T>() ? i32x4_swar.shr_s(a, b) : i32x4_swar.shr_u(a, b);
    return isSigned<T>() ? i64x2_swar.shr_s(a, b) : i64x2_swar.shr_u(a, b);
  }

  // @ts-expect-error: decorator
  @inline export function and(a: v128, b: v128): v128 { return pack(v64.and(lo(a), lo(b)), v64.and(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function or(a: v128, b: v128): v128 { return pack(v64.or(lo(a), lo(b)), v64.or(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function xor(a: v128, b: v128): v128 { return pack(v64.xor(lo(a), lo(b)), v64.xor(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function andnot(a: v128, b: v128): v128 { return pack(v64.andnot(lo(a), lo(b)), v64.andnot(hi(a), hi(b))); }
  // @ts-expect-error: decorator
  @inline export function not(a: v128): v128 { return pack(v64.not(lo(a)), v64.not(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function bitselect(v1: v128, v2: v128, mask: v128): v128 {
    return pack(v64.bitselect(lo(v1), lo(v2), lo(mask)), v64.bitselect(hi(v1), hi(v2), hi(mask)));
  }
  // @ts-expect-error: decorator
  @inline export function any_true(a: v128): bool { return v64.any_true(lo(a)) || v64.any_true(hi(a)); }
  // @ts-expect-error: decorator
  @inline export function all_true<T>(a: v128): bool { return v64.all_true<T>(lo(a)) && v64.all_true<T>(hi(a)); }
  // @ts-expect-error: decorator
  @inline export function bitmask<T>(a: v128): i32 {
    if (sizeof<T>() == 1) return i8x16_swar.bitmask(a);
    if (sizeof<T>() == 2) return i16x8_swar.bitmask(a);
    if (sizeof<T>() == 4) return i32x4_swar.bitmask(a);
    return i64x2_swar.bitmask(a);
  }
  // @ts-expect-error: decorator
  @inline export function popcnt<T>(a: v128): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.popcnt(a);
    return pack(v64.popcnt<T>(lo(a)), v64.popcnt<T>(hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function min<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x16_swar.min_s(a, b) : i8x16_swar.min_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x8_swar.min_s(a, b) : i16x8_swar.min_u(a, b);
    if (sizeof<T>() == 4 && !isFloat<T>()) return isSigned<T>() ? i32x4_swar.min_s(a, b) : i32x4_swar.min_u(a, b);
    return pack(v64.min<T>(lo(a), lo(b)), v64.min<T>(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function max<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x16_swar.max_s(a, b) : i8x16_swar.max_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x8_swar.max_s(a, b) : i16x8_swar.max_u(a, b);
    if (sizeof<T>() == 4 && !isFloat<T>()) return isSigned<T>() ? i32x4_swar.max_s(a, b) : i32x4_swar.max_u(a, b);
    return pack(v64.max<T>(lo(a), lo(b)), v64.max<T>(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function pmin<T>(a: v128, b: v128): v128 { return min<T>(a, b); }
  // @ts-expect-error: decorator
  @inline export function pmax<T>(a: v128, b: v128): v128 { return max<T>(a, b); }
  // @ts-expect-error: decorator
  @inline export function dot<T extends i16>(a: v128, b: v128): v128 { return i32x4_swar.dot_i16x8_s(a, b); }
  // @ts-expect-error: decorator
  @inline export function avgr<T>(a: v128, b: v128): v128 { return sizeof<T>() == 1 ? i8x16_swar.avgr_u(a, b) : i16x8_swar.avgr_u(a, b); }
  // @ts-expect-error: decorator
  @inline export function abs<T>(a: v128): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.abs(a);
    if (sizeof<T>() == 2) return i16x8_swar.abs(a);
    if (sizeof<T>() == 4 && !isFloat<T>()) return i32x4_swar.abs(a);
    return pack(v64.abs<T>(lo(a)), v64.abs<T>(hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function sqrt<T>(a: v128): v128 { return pack(v64.sqrt<T>(lo(a)), v64.sqrt<T>(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function ceil<T>(a: v128): v128 { return pack(v64.ceil<T>(lo(a)), v64.ceil<T>(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function floor<T>(a: v128): v128 { return pack(v64.floor<T>(lo(a)), v64.floor<T>(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function trunc<T>(a: v128): v128 { return pack(v64.trunc<T>(lo(a)), v64.trunc<T>(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function nearest<T>(a: v128): v128 { return pack(v64.nearest<T>(lo(a)), v64.nearest<T>(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function eq<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.eq(a, b);
    if (sizeof<T>() == 2) return i16x8_swar.eq(a, b);
    if (sizeof<T>() == 4 && !isFloat<T>()) return i32x4_swar.eq(a, b);
    if (sizeof<T>() == 8 && !isFloat<T>()) return i64x2_swar.eq(a, b);
    return pack(v64.eq<T>(lo(a), lo(b)), v64.eq<T>(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function ne<T>(a: v128, b: v128): v128 { return not(eq<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function lt<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x16_swar.lt_s(a, b) : i8x16_swar.lt_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x8_swar.lt_s(a, b) : i16x8_swar.lt_u(a, b);
    if (sizeof<T>() == 4 && !isFloat<T>()) return isSigned<T>() ? i32x4_swar.lt_s(a, b) : i32x4_swar.lt_u(a, b);
    if (sizeof<T>() == 8 && !isFloat<T>()) return i64x2_swar.lt_s(a, b);
    return pack(v64.lt<T>(lo(a), lo(b)), v64.lt<T>(hi(a), hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function le<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x16_swar.le_s(a, b) : i8x16_swar.le_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x8_swar.le_s(a, b) : i16x8_swar.le_u(a, b);
    if (sizeof<T>() == 4 && !isFloat<T>()) return isSigned<T>() ? i32x4_swar.le_s(a, b) : i32x4_swar.le_u(a, b);
    if (sizeof<T>() == 8 && !isFloat<T>()) return i64x2_swar.le_s(a, b);
    return not(lt<T>(b, a));
  }
  // @ts-expect-error: decorator
  @inline export function gt<T>(a: v128, b: v128): v128 { return lt<T>(b, a); }
  // @ts-expect-error: decorator
  @inline export function ge<T>(a: v128, b: v128): v128 { return le<T>(b, a); }

  // @ts-expect-error: decorator
  @inline export function convert<TFrom>(a: v128): v128 {
    return pack(v64.convert<TFrom>(lo(a)), v64.convert<TFrom>(hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function convert_low<TFrom>(a: v128): v128 {
    return f64pack(
      isSigned<TFrom>() ? i32x4_swar.extract_lane(a, 0) as f64 : i32x4_swar.extract_lane(a, 0) as u32 as f64,
      isSigned<TFrom>() ? i32x4_swar.extract_lane(a, 1) as f64 : i32x4_swar.extract_lane(a, 1) as u32 as f64
    );
  }
  // @ts-expect-error: decorator
  @inline export function trunc_sat<TTo>(a: v128): v128 { return pack(v64.trunc_sat<TTo>(lo(a)), v64.trunc_sat<TTo>(hi(a))); }
  // @ts-expect-error: decorator
  @inline export function trunc_sat_zero<TTo>(a: v128): v128 {
    return i32x4(
      isSigned<TTo>() ? i32(extract_lane<f64>(a, 0)) : u32(select<f64>(0, extract_lane<f64>(a, 0), extract_lane<f64>(a, 0) < 0)),
      isSigned<TTo>() ? i32(extract_lane<f64>(a, 1)) : u32(select<f64>(0, extract_lane<f64>(a, 1), extract_lane<f64>(a, 1) < 0)),
      0,
      0
    );
  }
  // @ts-expect-error: decorator
  @inline export function narrow<TFrom>(a: v128, b: v128): v128 {
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? i8x16_swar.narrow_i16x8_s(a, b) : i8x16_swar.narrow_i16x8_u(a, b);
    return isSigned<TFrom>() ? i16x8_swar.narrow_i32x4_s(a, b) : i16x8_swar.narrow_i32x4_u(a, b);
  }
  // @ts-expect-error: decorator
  @inline export function extend_low<TFrom>(a: v128): v128 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? i16x8_swar.extend_low_i8x16_s(a) : i16x8_swar.extend_low_i8x16_u(a);
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? i32x4_swar.extend_low_i16x8_s(a) : i32x4_swar.extend_low_i16x8_u(a);
    return isSigned<TFrom>() ? i64x2_swar.extend_low_i32x4_s(a) : i64x2_swar.extend_low_i32x4_u(a);
  }
  // @ts-expect-error: decorator
  @inline export function extend_high<TFrom>(a: v128): v128 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? i16x8_swar.extend_high_i8x16_s(a) : i16x8_swar.extend_high_i8x16_u(a);
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? i32x4_swar.extend_high_i16x8_s(a) : i32x4_swar.extend_high_i16x8_u(a);
    return isSigned<TFrom>() ? i64x2_swar.extend_high_i32x4_s(a) : i64x2_swar.extend_high_i32x4_u(a);
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise<TFrom>(a: v128): v128 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? i16x8_swar.extadd_pairwise_i8x16_s(a) : i16x8_swar.extadd_pairwise_i8x16_u(a);
    return isSigned<TFrom>() ? i32x4_swar.extadd_pairwise_i16x8_s(a) : i32x4_swar.extadd_pairwise_i16x8_u(a);
  }
  // @ts-expect-error: decorator
  @inline export function demote_zero<T extends f64 = f64>(a: v128): v128 {
    return i32x4(reinterpret<i32>(extract_lane<f64>(a, 0) as f32), reinterpret<i32>(extract_lane<f64>(a, 1) as f32), 0, 0);
  }
  // @ts-expect-error: decorator
  @inline export function promote_low<T extends f32 = f32>(a: v128): v128 {
    return f64pack(extract_lane<f32>(a, 0) as f64, extract_lane<f32>(a, 1) as f64);
  }
  // @ts-expect-error: decorator
  @inline export function q15mulr_sat<T extends i16>(a: v128, b: v128): v128 { return i16x8_swar.q15mulr_sat_s(a, b); }
  // @ts-expect-error: decorator
  @inline export function extmul_low<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i16x8_swar.extmul_low_i8x16_s(a, b) : i16x8_swar.extmul_low_i8x16_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i32x4_swar.extmul_low_i16x8_s(a, b) : i32x4_swar.extmul_low_i16x8_u(a, b);
    return isSigned<T>() ? i64x2_swar.extmul_low_i32x4_s(a, b) : i64x2_swar.extmul_low_i32x4_u(a, b);
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high<T>(a: v128, b: v128): v128 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i16x8_swar.extmul_high_i8x16_s(a, b) : i16x8_swar.extmul_high_i8x16_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i32x4_swar.extmul_high_i16x8_s(a, b) : i32x4_swar.extmul_high_i16x8_u(a, b);
    return isSigned<T>() ? i64x2_swar.extmul_high_i32x4_s(a, b) : i64x2_swar.extmul_high_i32x4_u(a, b);
  }

  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(a: v128, s: v128): v128 { return i8x16_swar.relaxed_swizzle(a, s); }
  // @ts-expect-error: decorator
  @inline export function relaxed_trunc<T>(a: v128): v128 { return trunc_sat<T>(a); }
  // @ts-expect-error: decorator
  @inline export function relaxed_trunc_zero<T>(a: v128): v128 { return trunc_sat_zero<T>(a); }
  // @ts-expect-error: decorator
  @inline export function relaxed_madd<T>(a: v128, b: v128, c: v128): v128 { return add<T>(mul<T>(a, b), c); }
  // @ts-expect-error: decorator
  @inline export function relaxed_nmadd<T>(a: v128, b: v128, c: v128): v128 { return add<T>(neg<T>(mul<T>(a, b)), c); }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect<T>(a: v128, b: v128, m: v128): v128 {
    if (sizeof<T>() == 1) return i8x16_swar.relaxed_laneselect(a, b, m);
    if (sizeof<T>() == 2) return i16x8_swar.relaxed_laneselect(a, b, m);
    if (sizeof<T>() == 4) return i32x4_swar.relaxed_laneselect(a, b, m);
    return i64x2_swar.relaxed_laneselect(a, b, m);
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_min<T>(a: v128, b: v128): v128 { return min<T>(a, b); }
  // @ts-expect-error: decorator
  @inline export function relaxed_max<T>(a: v128, b: v128): v128 { return max<T>(a, b); }
  // @ts-expect-error: decorator
  @inline export function relaxed_q15mulr<T>(a: v128, b: v128): v128 { return q15mulr_sat<i16>(a, b); }
  // @ts-expect-error: decorator
  @inline export function relaxed_dot<T>(a: v128, b: v128): v128 { return dot<i16>(a, b); }
  // @ts-expect-error: decorator
  @inline export function relaxed_dot_add<T>(a: v128, b: v128, c: v128): v128 { return add<i32>(dot<i16>(a, b), c); }
}

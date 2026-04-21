import { i8x8 } from "./i8x8";
import { i16x4 } from "./i16x4";
import { i32x2 } from "./i32x2";

export type v64 = u64;

/** Initializes a 64-bit vector from eight 8-bit integer values. */
export function v64(a: i8, b: i8, c: i8, d: i8, e: i8, f: i8, g: i8, h: i8): v64 {
  return i8x8(a, b, c, d, e, f, g, h);
}

// @ts-expect-error: decorator
@inline function mem_load<T>(ptr: usize, immAlign: usize = 1): T { return load<T>(ptr); }
// @ts-expect-error: decorator
@inline function mem_store<T>(ptr: usize, value: T, immAlign: usize = 1): void { store<T>(ptr, value); }
// @ts-expect-error: decorator
@inline function f32_trunc(x: f32): f32 { return trunc(x); }
// @ts-expect-error: decorator
@inline function f64_trunc(x: f64): f64 { return trunc(x); }
// @ts-expect-error: decorator
@inline function f32_nearest(x: f32): f32 { return nearest(x); }
// @ts-expect-error: decorator
@inline function f64_nearest(x: f64): f64 { return nearest(x); }

export namespace v64 {
  // @ts-expect-error: decorator
  @inline function f32_lane(x: v64, idx: i32): f32 {
    return reinterpret<f32>(((x >> (idx << 5)) & 0xffffffff) as u32);
  }
  // @ts-expect-error: decorator
  @inline function set_f32_lane(x: v64, idx: i32, value: f32): v64 {
    const shift = idx << 5;
    const mask = (0xffffffff as v64) << shift;
    return (x & ~mask) | ((reinterpret<u32>(value) as v64) << shift);
  }
  // @ts-expect-error: decorator
  @inline function f64_lane(x: v64): f64 {
    return reinterpret<f64>(x as u64);
  }
  // @ts-expect-error: decorator
  @inline function set_f64_lane(_: v64, value: f64): v64 {
    return reinterpret<u64>(value) as v64;
  }
  // @ts-expect-error: decorator
  @inline function popcnt8(x: u8): u8 {
    let y = x as u32;
    y = y - ((y >> 1) & 0x55);
    y = (y & 0x33) + ((y >> 2) & 0x33);
    y = (y + (y >> 4)) & 0x0f;
    return y as u8;
  }
  // @ts-expect-error: decorator
  @inline function popcnt16(x: u16): u16 {
    return (popcnt8((x & 0xff) as u8) + popcnt8((x >> 8) as u8)) as u16;
  }
  // @ts-expect-error: decorator
  @inline function popcnt32(x: u32): u32 {
    return (popcnt16((x & 0xffff) as u16) + popcnt16((x >> 16) as u16)) as u32;
  }
  // @ts-expect-error: decorator
  @inline function popcnt64(x: u64): u64 {
    return (popcnt32((x & 0xffffffff) as u32) + popcnt32((x >> 32) as u32)) as u64;
  }

  /** Creates a vector with identical lanes. */
  // @ts-expect-error: decorator
  @inline export function splat<T>(x: T): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) {
        const bits = reinterpret<u32>(x as f32) as v64;
        return bits | (bits << 32);
      }
      return reinterpret<u64>(x as f64) as v64;
    }
    if (sizeof<T>() == 1) return i8x8.splat(x as i8);
    if (sizeof<T>() == 2) return i16x4.splat(x as i16);
    if (sizeof<T>() == 4) return i32x2.splat(x as i32);
    return x as i64 as u64;
  }
  /** Extracts one lane as a scalar. */
  // @ts-expect-error: decorator
  @inline export function extract_lane<T>(x: v64, idx: u8): T {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return f32_lane(x, idx & 1) as T;
      return f64_lane(x) as T;
    }
    if (sizeof<T>() == 1) return i8x8.extract_lane_s(x, idx & 7) as T;
    if (sizeof<T>() == 2) {
      return (isSigned<T>() ? i16x4.extract_lane_s(x, idx & 3) : i16x4.extract_lane_u(x, idx & 3)) as T;
    }
    if (sizeof<T>() == 4) return i32x2.extract_lane(x, idx & 1) as T;
    return x as T;
  }
  /** Replaces one lane. */
  // @ts-expect-error: decorator
  @inline export function replace_lane<T>(x: v64, idx: u8, value: T): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return set_f32_lane(x, idx & 1, value as f32);
      return set_f64_lane(x, value as f64);
    }
    if (sizeof<T>() == 1) return i8x8.replace_lane(x, idx & 7, value as i8);
    if (sizeof<T>() == 2) return i16x4.replace_lane(x, idx & 3, value as i16);
    if (sizeof<T>() == 4) return i32x2.replace_lane(x, idx & 1, value as i32);
    return value as i64 as u64;
  }
  /** Selects lanes from either vector according to the specified lane indexes. */
  export function shuffle<T>(a: v64, b: v64, lanes: StaticArray<u8>): v64 {
    let out = splat<T>(0 as T);
    const n = 8 / sizeof<T>();
    let i = 0;
    while (i < n) {
      const lane = unchecked(lanes[i]) as i32;
      const val = lane < n ? extract_lane<T>(a, lane as u8) : extract_lane<T>(b, (lane - n) as u8);
      out = replace_lane<T>(out, i as u8, val);
      i++;
    }
    return out;
  }
  /** Selects 8-bit lanes from the first vector according to the indexes [0-7] specified by the 8-bit lanes of the second vector. */
  // @ts-expect-error: decorator
  @inline export function swizzle(a: v64, s: v64): v64 {
    return i8x8.swizzle(a, s);
  }
  /** Loads a vector from memory. */
  // @ts-expect-error: decorator
  @inline export function load(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 {
    return mem_load<v64>(ptr + immOffset, immAlign);
  }
  /** Creates a vector by loading the lanes of the specified type and extending each to the next larger type. */
  // @ts-expect-error: decorator
  @inline export function load_ext<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 {
    const p = ptr + immOffset;
    if (sizeof<TFrom>() == 1) {
      const base = mem_load<u32>(p, immAlign) as v64;
      return isSigned<TFrom>() ? i16x4.extend_low_i8x8_s(base) : i16x4.extend_low_i8x8_u(base);
    }
    if (sizeof<TFrom>() == 2) {
      const base = mem_load<u32>(p, immAlign) as v64;
      return isSigned<TFrom>() ? i32x2.extend_low_i16x4_s(base) : i32x2.extend_low_i16x4_u(base);
    }
    if (sizeof<TFrom>() == 4) {
      const x = mem_load<u32>(p, immAlign);
      return isSigned<TFrom>() ? (x as i32 as i64 as u64) : (x as u64);
    }
    return mem_load<v64>(p, immAlign);
  }
  /** Creates a vector by loading a value of the specified type into the lowest bits and initializing all other bits to zero. */
  // @ts-expect-error: decorator
  @inline export function load_zero<TFrom>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 {
    const p = ptr + immOffset;
    if (sizeof<TFrom>() == 1) return mem_load<u8>(p, immAlign) as v64;
    if (sizeof<TFrom>() == 2) return mem_load<u16>(p, immAlign) as v64;
    if (sizeof<TFrom>() == 4) return mem_load<u32>(p, immAlign) as v64;
    return mem_load<u64>(p, immAlign) as v64;
  }
  /** Loads a single lane from memory into the specified lane of the given vector. */
  // @ts-expect-error: decorator
  @inline export function load_lane<T>(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v64 {
    return replace_lane<T>(vec, idx, mem_load<T>(ptr + immOffset, immAlign));
  }
  /** Stores the single lane at the specified index of the given vector to memory. */
  // @ts-expect-error: decorator
  @inline export function store_lane<T>(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void {
    mem_store<T>(ptr + immOffset, extract_lane<T>(vec, idx), immAlign);
  }
  /** Creates a vector with four 16-bit lanes by loading and sign extending four 8-bit integers. */
  // @ts-expect-error: decorator
  @inline export function load8x4_s(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_ext<i8>(ptr, immOffset, immAlign); }
  /** Creates a vector with four 16-bit lanes by loading and zero extending four 8-bit integers. */
  // @ts-expect-error: decorator
  @inline export function load8x4_u(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_ext<u8>(ptr, immOffset, immAlign); }
  /** Creates a vector with two 32-bit lanes by loading and sign extending two 16-bit integers. */
  // @ts-expect-error: decorator
  @inline export function load16x2_s(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_ext<i16>(ptr, immOffset, immAlign); }
  /** Creates a vector with two 32-bit lanes by loading and zero extending two 16-bit integers. */
  // @ts-expect-error: decorator
  @inline export function load16x2_u(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_ext<u16>(ptr, immOffset, immAlign); }
  /** Creates a vector with one 64-bit lane by loading and sign extending one 32-bit integer. */
  // @ts-expect-error: decorator
  @inline export function load32x1_s(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_ext<i32>(ptr, immOffset, immAlign); }
  /** Creates a vector with one 64-bit lane by loading and zero extending one 32-bit integer. */
  // @ts-expect-error: decorator
  @inline export function load32x1_u(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_ext<u32>(ptr, immOffset, immAlign); }
  // Compatibility aliases mirroring v128-style names.
  /** Creates a vector with four 16-bit lanes by loading and sign extending four 8-bit integers. */
  // @ts-expect-error: decorator
  @inline export function load8x8_s(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load8x4_s(ptr, immOffset, immAlign); }
  /** Creates a vector with four 16-bit lanes by loading and zero extending four 8-bit integers. */
  // @ts-expect-error: decorator
  @inline export function load8x8_u(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load8x4_u(ptr, immOffset, immAlign); }
  /** Creates a vector with two 32-bit lanes by loading and sign extending two 16-bit integers. */
  // @ts-expect-error: decorator
  @inline export function load16x4_s(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load16x2_s(ptr, immOffset, immAlign); }
  /** Creates a vector with two 32-bit lanes by loading and zero extending two 16-bit integers. */
  // @ts-expect-error: decorator
  @inline export function load16x4_u(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load16x2_u(ptr, immOffset, immAlign); }
  /** Creates a vector with one 64-bit lane by loading and sign extending one 32-bit integer. */
  // @ts-expect-error: decorator
  @inline export function load32x2_s(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load32x1_s(ptr, immOffset, immAlign); }
  /** Creates a vector with one 64-bit lane by loading and zero extending one 32-bit integer. */
  // @ts-expect-error: decorator
  @inline export function load32x2_u(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load32x1_u(ptr, immOffset, immAlign); }
  /** Creates a vector with identical lanes by loading the splatted value. */
  // @ts-expect-error: decorator
  @inline export function load_splat<T>(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return splat<T>(mem_load<T>(ptr + immOffset, immAlign)); }
  /** Loads an 8-bit integer and splats it. */
  // @ts-expect-error: decorator
  @inline export function load8_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return splat<i8>(mem_load<i8>(ptr + immOffset, immAlign)); }
  /** Loads a 16-bit integer and splats it. */
  // @ts-expect-error: decorator
  @inline export function load16_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return splat<i16>(mem_load<i16>(ptr + immOffset, immAlign)); }
  /** Loads a 32-bit integer and splats it. */
  // @ts-expect-error: decorator
  @inline export function load32_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return splat<i32>(mem_load<i32>(ptr + immOffset, immAlign)); }
  /** Loads a 64-bit integer and splats it. */
  // @ts-expect-error: decorator
  @inline export function load64_splat(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return splat<i64>(mem_load<i64>(ptr + immOffset, immAlign)); }
  /** Loads a 32-bit value into low bits and zeros high bits. */
  // @ts-expect-error: decorator
  @inline export function load32_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_zero<u32>(ptr, immOffset, immAlign); }
  /** Loads a 64-bit value into low bits. */
  // @ts-expect-error: decorator
  @inline export function load64_zero(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_zero<u64>(ptr, immOffset, immAlign); }
  /** Loads one 8-bit lane from memory into `idx` and preserves all other lanes. */
  // @ts-expect-error: decorator
  @inline export function load8_lane(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_lane<i8>(ptr, vec, idx, immOffset, immAlign); }
  /** Loads one 16-bit lane from memory into `idx` and preserves all other lanes. */
  // @ts-expect-error: decorator
  @inline export function load16_lane(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_lane<i16>(ptr, vec, idx, immOffset, immAlign); }
  /** Loads one 32-bit lane from memory into `idx` and preserves all other lanes. */
  // @ts-expect-error: decorator
  @inline export function load32_lane(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_lane<i32>(ptr, vec, idx, immOffset, immAlign); }
  /** Loads one 64-bit lane from memory into `idx` and preserves all other lanes. */
  // @ts-expect-error: decorator
  @inline export function load64_lane(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): v64 { return load_lane<i64>(ptr, vec, idx, immOffset, immAlign); }
  /** Stores one 8-bit lane at `idx` to memory. */
  // @ts-expect-error: decorator
  @inline export function store8_lane(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i8>(ptr, vec, idx, immOffset, immAlign); }
  /** Stores one 16-bit lane at `idx` to memory. */
  // @ts-expect-error: decorator
  @inline export function store16_lane(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i16>(ptr, vec, idx, immOffset, immAlign); }
  /** Stores one 32-bit lane at `idx` to memory. */
  // @ts-expect-error: decorator
  @inline export function store32_lane(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i32>(ptr, vec, idx, immOffset, immAlign); }
  /** Stores one 64-bit lane at `idx` to memory. */
  // @ts-expect-error: decorator
  @inline export function store64_lane(ptr: usize, vec: v64, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void { store_lane<i64>(ptr, vec, idx, immOffset, immAlign); }
  /** Stores a vector to memory. */
  // @ts-expect-error: decorator
  @inline export function store(ptr: usize, value: v64, immOffset: usize = 0, immAlign: usize = 1): void { mem_store<v64>(ptr + immOffset, value, immAlign); }

  /** Adds each lane. */
  // @ts-expect-error: decorator
  @inline export function add<T>(a: v64, b: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, f32_lane(a, 0) + f32_lane(b, 0)), 1, f32_lane(a, 1) + f32_lane(b, 1));
      return set_f64_lane(0, f64_lane(a) + f64_lane(b));
    }
    if (sizeof<T>() == 1) return i8x8.add(a, b);
    if (sizeof<T>() == 2) return i16x4.add(a, b);
    if (sizeof<T>() == 4) return i32x2.add(a, b);
    return (a as i64 + b as i64) as u64;
  }
  /** Subtracts each lane. */
  // @ts-expect-error: decorator
  @inline export function sub<T>(a: v64, b: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, f32_lane(a, 0) - f32_lane(b, 0)), 1, f32_lane(a, 1) - f32_lane(b, 1));
      return set_f64_lane(0, f64_lane(a) - f64_lane(b));
    }
    if (sizeof<T>() == 1) return i8x8.sub(a, b);
    if (sizeof<T>() == 2) return i16x4.sub(a, b);
    if (sizeof<T>() == 4) return i32x2.sub(a, b);
    return (a as i64 - b as i64) as u64;
  }
  /** Multiplies each lane. */
  // @ts-expect-error: decorator
  @inline export function mul<T>(a: v64, b: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, f32_lane(a, 0) * f32_lane(b, 0)), 1, f32_lane(a, 1) * f32_lane(b, 1));
      return set_f64_lane(0, f64_lane(a) * f64_lane(b));
    }
    if (sizeof<T>() == 1) return i8x8.mul(a, b);
    if (sizeof<T>() == 2) return i16x4.mul(a, b);
    if (sizeof<T>() == 4) return i32x2.mul(a, b);
    return ((a as i64) * (b as i64)) as u64;
  }
  /** Divides each floating-point lane. */
  // @ts-expect-error: decorator
  @inline export function div<T>(a: v64, b: v64): v64 {
    if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, f32_lane(a, 0) / f32_lane(b, 0)), 1, f32_lane(a, 1) / f32_lane(b, 1));
    return set_f64_lane(0, f64_lane(a) / f64_lane(b));
  }
  /** Negates each lane. */
  // @ts-expect-error: decorator
  @inline export function neg<T>(a: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, -f32_lane(a, 0)), 1, -f32_lane(a, 1));
      return set_f64_lane(0, -f64_lane(a));
    }
    if (sizeof<T>() == 1) return i8x8.neg(a);
    if (sizeof<T>() == 2) return i16x4.neg(a);
    if (sizeof<T>() == 4) return i32x2.neg(a);
    return (-(a as i64)) as u64;
  }
  /** Adds each integer lane with saturation where supported. */
  // @ts-expect-error: decorator
  @inline export function add_sat<T>(a: v64, b: v64): v64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x8.add_sat_s(a, b) : i8x8.add_sat_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x4.add_sat_s(a, b) : i16x4.add_sat_u(a, b);
    return add<T>(a, b);
  }
  /** Subtracts each integer lane with saturation where supported. */
  // @ts-expect-error: decorator
  @inline export function sub_sat<T>(a: v64, b: v64): v64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x8.sub_sat_s(a, b) : i8x8.sub_sat_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x4.sub_sat_s(a, b) : i16x4.sub_sat_u(a, b);
    return sub<T>(a, b);
  }
  /** Performs a lane-wise left shift by scalar `b`. */
  // @ts-expect-error: decorator
  @inline export function shl<T>(a: v64, b: i32): v64 {
    if (sizeof<T>() == 1) return i8x8.shl(a, b);
    if (sizeof<T>() == 2) return i16x4.shl(a, b);
    if (sizeof<T>() == 4) return i32x2.shl(a, b);
    return (a << (b & 63)) as v64;
  }
  /** Performs a lane-wise right shift by scalar `b`. */
  // @ts-expect-error: decorator
  @inline export function shr<T>(a: v64, b: i32): v64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x8.shr_s(a, b) : i8x8.shr_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x4.shr_s(a, b) : i16x4.shr_u(a, b);
    if (sizeof<T>() == 4) return isSigned<T>() ? i32x2.shr_s(a, b) : i32x2.shr_u(a, b);
    return isSigned<T>() ? ((a as i64 >> (b & 63)) as v64) : ((a as u64 >> (b & 63)) as v64);
  }
  /** Computes bitwise AND of two vectors. */
  // @ts-expect-error: decorator
  @inline export function and(a: v64, b: v64): v64 { return a & b; }
  /** Computes bitwise OR of two vectors. */
  // @ts-expect-error: decorator
  @inline export function or(a: v64, b: v64): v64 { return a | b; }
  /** Computes bitwise XOR of two vectors. */
  // @ts-expect-error: decorator
  @inline export function xor(a: v64, b: v64): v64 { return a ^ b; }
  /** Computes bitwise ANDNOT of two vectors (`a & ~b`). */
  // @ts-expect-error: decorator
  @inline export function andnot(a: v64, b: v64): v64 { return a & ~b; }
  /** Computes bitwise NOT of a vector. */
  // @ts-expect-error: decorator
  @inline export function not(a: v64): v64 { return ~a; }
  /** Selects bits from `v1` and `v2` using `mask`. */
  // @ts-expect-error: decorator
  @inline export function bitselect(v1: v64, v2: v64, mask: v64): v64 { return (v1 & mask) | (v2 & ~mask); }
  /** Returns true if any lane is non-zero. */
  // @ts-expect-error: decorator
  @inline export function any_true(a: v64): bool { return a != 0; }
  /** Returns true if all lanes are non-zero for the lane type `T`. */
  // @ts-expect-error: decorator
  @inline export function all_true<T>(a: v64): bool {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return f32_lane(a, 0) != 0 && f32_lane(a, 1) != 0;
      return f64_lane(a) != 0;
    }
    if (sizeof<T>() == 1) return i8x8.all_true(a);
    if (sizeof<T>() == 2) return i16x4.all_true(a);
    if (sizeof<T>() == 4) return i32x2.all_true(a);
    return a != 0;
  }
  /** Extracts lane sign bits into a scalar mask. */
  // @ts-expect-error: decorator
  @inline export function bitmask<T>(a: v64): i32 {
    if (sizeof<T>() == 1) return i8x8.bitmask(a);
    if (sizeof<T>() == 2) return i16x4.bitmask(a);
    if (sizeof<T>() == 4) return i32x2.bitmask(a);
    return ((a >> 63) & 1) as i32;
  }
  /** Counts set bits in each lane. */
  // @ts-expect-error: decorator
  @inline export function popcnt<T>(a: v64): v64 {
    if (sizeof<T>() == 1) return i8x8.popcnt(a);
    if (sizeof<T>() == 2) return i16x4((popcnt16((a & 0xffff) as u16) as i16), (popcnt16(((a >> 16) & 0xffff) as u16) as i16), (popcnt16(((a >> 32) & 0xffff) as u16) as i16), (popcnt16(((a >> 48) & 0xffff) as u16) as i16));
    if (sizeof<T>() == 4) return i32x2(popcnt32((a & 0xffffffff) as u32) as i32, popcnt32(((a >> 32) & 0xffffffff) as u32) as i32);
    return popcnt64(a as u64) as v64;
  }
  /** Computes lane-wise minimum. */
  // @ts-expect-error: decorator
  @inline export function min<T>(a: v64, b: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, Mathf.min(f32_lane(a, 0), f32_lane(b, 0))), 1, Mathf.min(f32_lane(a, 1), f32_lane(b, 1)));
      return set_f64_lane(0, Math.min(f64_lane(a), f64_lane(b)));
    }
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x8.min_s(a, b) : i8x8.min_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x4.min_s(a, b) : i16x4.min_u(a, b);
    if (sizeof<T>() == 4) return isSigned<T>() ? i32x2.min_s(a, b) : i32x2.min_u(a, b);
    return ((a as i64) < (b as i64) ? a : b) as v64;
  }
  /** Computes lane-wise maximum. */
  // @ts-expect-error: decorator
  @inline export function max<T>(a: v64, b: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, Mathf.max(f32_lane(a, 0), f32_lane(b, 0))), 1, Mathf.max(f32_lane(a, 1), f32_lane(b, 1)));
      return set_f64_lane(0, Math.max(f64_lane(a), f64_lane(b)));
    }
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x8.max_s(a, b) : i8x8.max_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x4.max_s(a, b) : i16x4.max_u(a, b);
    if (sizeof<T>() == 4) return isSigned<T>() ? i32x2.max_s(a, b) : i32x2.max_u(a, b);
    return ((a as i64) > (b as i64) ? a : b) as v64;
  }
  /** Computes pseudo-minimum (alias of `min`). */
  // @ts-expect-error: decorator
  @inline export function pmin<T>(a: v64, b: v64): v64 { return min<T>(a, b); }
  /** Computes pseudo-maximum (alias of `max`). */
  // @ts-expect-error: decorator
  @inline export function pmax<T>(a: v64, b: v64): v64 { return max<T>(a, b); }
  /** Computes pairwise dot products for i16 lanes into i32 lanes. */
  // @ts-expect-error: decorator
  @inline export function dot<T>(a: v64, b: v64): v64 { return i32x2.dot_i16x4_s(a, b); }
  /** Computes unsigned average by lane for u8/u16 shapes. */
  // @ts-expect-error: decorator
  @inline export function avgr<T>(a: v64, b: v64): v64 { return sizeof<T>() == 1 ? i8x8.avgr_u(a, b) : i16x4.avgr_u(a, b); }
  /** Computes absolute value of each lane. */
  // @ts-expect-error: decorator
  @inline export function abs<T>(a: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, Mathf.abs(f32_lane(a, 0))), 1, Mathf.abs(f32_lane(a, 1)));
      return set_f64_lane(0, Math.abs(f64_lane(a)));
    }
    if (sizeof<T>() == 1) return i8x8.abs(a);
    if (sizeof<T>() == 2) return i16x4.abs(a);
    if (sizeof<T>() == 4) return i32x2.abs(a);
    const x = a as i64;
    const m = x >> 63;
    return ((x ^ m) - m) as v64;
  }
  /** Computes square root of each floating-point lane. */
  // @ts-expect-error: decorator
  @inline export function sqrt<T>(a: v64): v64 {
    if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, Mathf.sqrt(f32_lane(a, 0))), 1, Mathf.sqrt(f32_lane(a, 1)));
    return set_f64_lane(0, Math.sqrt(f64_lane(a)));
  }
  /** Computes ceil of each floating-point lane. */
  // @ts-expect-error: decorator
  @inline export function ceil<T>(a: v64): v64 {
    if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, Mathf.ceil(f32_lane(a, 0))), 1, Mathf.ceil(f32_lane(a, 1)));
    return set_f64_lane(0, Math.ceil(f64_lane(a)));
  }
  /** Computes floor of each floating-point lane. */
  // @ts-expect-error: decorator
  @inline export function floor<T>(a: v64): v64 {
    if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, Mathf.floor(f32_lane(a, 0))), 1, Mathf.floor(f32_lane(a, 1)));
    return set_f64_lane(0, Math.floor(f64_lane(a)));
  }
  /** Truncates each floating-point lane toward zero. */
  // @ts-expect-error: decorator
  @inline export function trunc<T>(a: v64): v64 {
    if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, f32_trunc(f32_lane(a, 0))), 1, f32_trunc(f32_lane(a, 1)));
    return set_f64_lane(0, f64_trunc(f64_lane(a)));
  }
  /** Rounds each floating-point lane to nearest, ties to even. */
  // @ts-expect-error: decorator
  @inline export function nearest<T>(a: v64): v64 {
    if (sizeof<T>() == 4) return set_f32_lane(set_f32_lane(0, 0, f32_nearest(f32_lane(a, 0))), 1, f32_nearest(f32_lane(a, 1)));
    return set_f64_lane(0, f64_nearest(f64_lane(a)));
  }
  /** Computes lane-wise equality mask. */
  // @ts-expect-error: decorator
  @inline export function eq<T>(a: v64, b: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return i32x2(f32_lane(a, 0) == f32_lane(b, 0) ? -1 : 0, f32_lane(a, 1) == f32_lane(b, 1) ? -1 : 0);
      return (f64_lane(a) == f64_lane(b) ? -1 : 0) as v64;
    }
    if (sizeof<T>() == 1) return i8x8.eq(a, b);
    if (sizeof<T>() == 2) return i16x4.eq(a, b);
    if (sizeof<T>() == 4) return i32x2.eq(a, b);
    return ((a as i64) == (b as i64) ? -1 : 0) as v64;
  }
  /** Computes lane-wise inequality mask. */
  // @ts-expect-error: decorator
  @inline export function ne<T>(a: v64, b: v64): v64 { return ~eq<T>(a, b); }
  /** Computes lane-wise less-than mask. */
  // @ts-expect-error: decorator
  @inline export function lt<T>(a: v64, b: v64): v64 {
    if (isFloat<T>()) {
      if (sizeof<T>() == 4) return i32x2(f32_lane(a, 0) < f32_lane(b, 0) ? -1 : 0, f32_lane(a, 1) < f32_lane(b, 1) ? -1 : 0);
      return (f64_lane(a) < f64_lane(b) ? -1 : 0) as v64;
    }
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x8.lt_s(a, b) : i8x8.lt_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x4.lt_s(a, b) : i16x4.lt_u(a, b);
    if (sizeof<T>() == 4) return isSigned<T>() ? i32x2.lt_s(a, b) : i32x2.lt_u(a, b);
    return ((a as i64) < (b as i64) ? -1 : 0) as v64;
  }
  /** Computes lane-wise less-than-or-equal mask. */
  // @ts-expect-error: decorator
  @inline export function le<T>(a: v64, b: v64): v64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i8x8.le_s(a, b) : i8x8.le_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i16x4.le_s(a, b) : i16x4.le_u(a, b);
    if (sizeof<T>() == 4) return isSigned<T>() ? i32x2.le_s(a, b) : i32x2.le_u(a, b);
    return ~lt<T>(b, a);
  }
  /** Computes lane-wise greater-than mask. */
  // @ts-expect-error: decorator
  @inline export function gt<T>(a: v64, b: v64): v64 { return lt<T>(b, a); }
  /** Computes lane-wise greater-than-or-equal mask. */
  // @ts-expect-error: decorator
  @inline export function ge<T>(a: v64, b: v64): v64 { return le<T>(b, a); }
  /** Converts i32/u32 lanes to f32 lanes. */
  // @ts-expect-error: decorator
  @inline export function convert<TFrom>(a: v64): v64 {
    if (isSigned<TFrom>()) return set_f32_lane(set_f32_lane(0, 0, i32x2.extract_lane(a, 0) as f32), 1, i32x2.extract_lane(a, 1) as f32);
    return set_f32_lane(set_f32_lane(0, 0, i32x2.extract_lane(a, 0) as u32 as f32), 1, i32x2.extract_lane(a, 1) as u32 as f32);
  }
  /** Converts the low i32/u32 lane to f64. */
  // @ts-expect-error: decorator
  @inline export function convert_low<TFrom>(a: v64): v64 {
    if (isSigned<TFrom>()) return set_f64_lane(0, i32x2.extract_lane(a, 0) as f64);
    return set_f64_lane(0, i32x2.extract_lane(a, 0) as u32 as f64);
  }
  /** Truncates f32 lanes to i32/u32 with saturation. */
  // @ts-expect-error: decorator
  @inline export function trunc_sat<TTo>(a: v64): v64 {
    const x0 = f32_lane(a, 0), x1 = f32_lane(a, 1);
    if (isSigned<TTo>()) return i32x2(i32(x0), i32(x1));
    return i32x2(u32(select<f32>(0, x0, x0 < 0)), u32(select<f32>(0, x1, x1 < 0)));
  }
  /** Truncates low f64 lane to i32/u32 with saturation, zeroing upper lane. */
  // @ts-expect-error: decorator
  @inline export function trunc_sat_zero<TTo>(a: v64): v64 {
    const x = f64_lane(a);
    if (isSigned<TTo>()) return i32x2(i32(x), 0);
    return i32x2(u32(select<f64>(0, x, x < 0)), 0);
  }
  /** Narrows lanes to the next smaller integer type with saturation. */
  // @ts-expect-error: decorator
  @inline export function narrow<TFrom>(a: v64, b: v64): v64 {
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? i8x8.narrow_i16x4_s(a, b) : i8x8.narrow_i16x4_u(a, b);
    return isSigned<TFrom>() ? i16x4.narrow_i32x2_s(a, b) : i16x4.narrow_i32x2_u(a, b);
  }
  /** Extends low lanes to the next wider integer type. */
  // @ts-expect-error: decorator
  @inline export function extend_low<TFrom>(a: v64): v64 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? i16x4.extend_low_i8x8_s(a) : i16x4.extend_low_i8x8_u(a);
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? i32x2.extend_low_i16x4_s(a) : i32x2.extend_low_i16x4_u(a);
    return (extract_lane<TFrom>(a, 0) as i64) as v64;
  }
  /** Extends high lanes to the next wider integer type. */
  // @ts-expect-error: decorator
  @inline export function extend_high<TFrom>(a: v64): v64 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? i16x4.extend_high_i8x8_s(a) : i16x4.extend_high_i8x8_u(a);
    if (sizeof<TFrom>() == 2) return isSigned<TFrom>() ? i32x2.extend_high_i16x4_s(a) : i32x2.extend_high_i16x4_u(a);
    return (extract_lane<TFrom>(a, 1) as i64) as v64;
  }
  /** Pairwise-adds lanes with widening. */
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise<TFrom>(a: v64): v64 {
    if (sizeof<TFrom>() == 1) return isSigned<TFrom>() ? i16x4.extadd_pairwise_i8x8_s(a) : i16x4.extadd_pairwise_i8x8_u(a);
    return isSigned<TFrom>() ? i32x2.extadd_pairwise_i16x4_s(a) : i32x2.extadd_pairwise_i16x4_u(a);
  }
  /** Demotes low f64 lane to f32 and zeroes the remaining lane. */
  // @ts-expect-error: decorator
  @inline export function demote_zero<T>(a: v64): v64 { return set_f32_lane(set_f32_lane(0, 0, f64_lane(a) as f32), 1, 0); }
  /** Promotes low f32 lane to f64. */
  // @ts-expect-error: decorator
  @inline export function promote_low<T>(a: v64): v64 { return set_f64_lane(0, f32_lane(a, 0) as f64); }
  /** Performs signed Q15 rounding multiply with saturation. */
  // @ts-expect-error: decorator
  @inline export function q15mulr_sat<T>(a: v64, b: v64): v64 { return i16x4.q15mulr_sat_s(a, b); }
  /** Multiplies widened low lanes producing twice wider results. */
  // @ts-expect-error: decorator
  @inline export function extmul_low<T>(a: v64, b: v64): v64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i16x4.extmul_low_i8x8_s(a, b) : i16x4.extmul_low_i8x8_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i32x2.extmul_low_i16x4_s(a, b) : i32x2.extmul_low_i16x4_u(a, b);
    const ax = extract_lane<T>(a, 0) as i64;
    const bx = extract_lane<T>(b, 0) as i64;
    return (ax * bx) as v64;
  }
  /** Multiplies widened high lanes producing twice wider results. */
  // @ts-expect-error: decorator
  @inline export function extmul_high<T>(a: v64, b: v64): v64 {
    if (sizeof<T>() == 1) return isSigned<T>() ? i16x4.extmul_high_i8x8_s(a, b) : i16x4.extmul_high_i8x8_u(a, b);
    if (sizeof<T>() == 2) return isSigned<T>() ? i32x2.extmul_high_i16x4_s(a, b) : i32x2.extmul_high_i16x4_u(a, b);
    const ax = extract_lane<T>(a, 1) as i64;
    const bx = extract_lane<T>(b, 1) as i64;
    return (ax * bx) as v64;
  }
  /** Lane-wise relaxed swizzle for i8 lanes. */
  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(a: v64, s: v64): v64 { return i8x8.relaxed_swizzle(a, s); }
  /** Relaxed truncation from f32 lanes to integer lanes. */
  // @ts-expect-error: decorator
  @inline export function relaxed_trunc<T>(a: v64): v64 { return trunc_sat<T>(a); }
  /** Relaxed truncation from low f64 lane to integer lane. */
  // @ts-expect-error: decorator
  @inline export function relaxed_trunc_zero<T>(a: v64): v64 { return trunc_sat_zero<T>(a); }
  /** Relaxed fused multiply-add (`a * b + c`). */
  // @ts-expect-error: decorator
  @inline export function relaxed_madd<T>(a: v64, b: v64, c: v64): v64 { return add<T>(mul<T>(a, b), c); }
  /** Relaxed fused negative multiply-add (`-(a * b) + c`). */
  // @ts-expect-error: decorator
  @inline export function relaxed_nmadd<T>(a: v64, b: v64, c: v64): v64 { return add<T>(neg<T>(mul<T>(a, b)), c); }
  /** Relaxed lane select by lane msb/sign semantics. */
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect<T>(a: v64, b: v64, m: v64): v64 {
    if (sizeof<T>() == 1) return i8x8.relaxed_laneselect(a, b, m);
    if (sizeof<T>() == 2) return i16x4.relaxed_laneselect(a, b, m);
    if (sizeof<T>() == 4) return i32x2.relaxed_laneselect(a, b, m);
    return (extract_lane<i64>(m, 0) < 0 ? a : b) as v64;
  }
  /** Relaxed minimum (alias of `min`). */
  // @ts-expect-error: decorator
  @inline export function relaxed_min<T>(a: v64, b: v64): v64 { return min<T>(a, b); }
  /** Relaxed maximum (alias of `max`). */
  // @ts-expect-error: decorator
  @inline export function relaxed_max<T>(a: v64, b: v64): v64 { return max<T>(a, b); }
  /** Relaxed Q15 multiply (alias of `q15mulr_sat`). */
  // @ts-expect-error: decorator
  @inline export function relaxed_q15mulr<T>(a: v64, b: v64): v64 { return q15mulr_sat<i16>(a, b); }
  /** Relaxed dot product (alias of `dot`). */
  // @ts-expect-error: decorator
  @inline export function relaxed_dot<T>(a: v64, b: v64): v64 { return dot<i16>(a, b); }
  /** Relaxed dot product plus accumulation. */
  // @ts-expect-error: decorator
  @inline export function relaxed_dot_add<T>(a: v64, b: v64, c: v64): v64 { return add<i32>(dot<i16>(a, b), c); }
}

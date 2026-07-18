import { v64 } from "../v64/v64";

// @ts-expect-error: decorator
@inline function mem_load<T>(ptr: usize, immAlign: usize = 1): T { return load<T>(ptr); }
// @ts-expect-error: decorator
@inline function mem_store<T>(ptr: usize, value: T, immAlign: usize = 1): void { store<T>(ptr, value); }

/** A packed 32-bit vector. Lane type is selected by each generic operation. */
export type v32 = u32;

export namespace v32 {
  // @ts-expect-error: decorator
  @inline function low(x: u64): v32 { return x as v32; }
  // @ts-expect-error: decorator
  @inline function truthyPadding<T>(): u64 {
    if (sizeof<T>() == 1) return 0x0101010100000000;
    if (sizeof<T>() == 2) return 0x0001000100000000;
    return 0x0000000100000000;
  }

  // @ts-expect-error: decorator
  @inline export function splat<T>(x: T): v32 {
    if (isFloat<T>()) return reinterpret<u32>(x as f32);
    if (sizeof<T>() == 1) return (((x as u32) & 0xff) * 0x01010101) as v32;
    if (sizeof<T>() == 2) return (((x as u32) & 0xffff) * 0x00010001) as v32;
    return x as u32;
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane<T>(x: v32, idx: u8): T {
    return v64.extract_lane<T>(x as u64, idx % (4 / sizeof<T>()) as u8);
  }
  // @ts-expect-error: decorator
  @inline export function replace_lane<T>(x: v32, idx: u8, value: T): v32 {
    return low(v64.replace_lane<T>(x as u64, idx % (4 / sizeof<T>()) as u8, value));
  }
  // @ts-expect-error: decorator
  @inline export function load(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): v32 { return mem_load<v32>(ptr + immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function store(ptr: usize, value: v32, immOffset: usize = 0, immAlign: usize = 1): void { mem_store<v32>(ptr + immOffset, value, immAlign); }
  // @ts-expect-error: decorator
  @inline export function add<T>(a: v32, b: v32): v32 { return low(v64.add<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function sub<T>(a: v32, b: v32): v32 { return low(v64.sub<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function mul<T>(a: v32, b: v32): v32 { return low(v64.mul<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function min<T>(a: v32, b: v32): v32 { return low(v64.min<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function max<T>(a: v32, b: v32): v32 { return low(v64.max<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function abs<T>(a: v32): v32 { return low(v64.abs<T>(a)); }
  // @ts-expect-error: decorator
  @inline export function neg<T>(a: v32): v32 { return low(v64.neg<T>(a)); }
  // @ts-expect-error: decorator
  @inline export function add_sat<T>(a: v32, b: v32): v32 { return low(v64.add_sat<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function sub_sat<T>(a: v32, b: v32): v32 { return low(v64.sub_sat<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function avgr<T>(a: v32, b: v32): v32 { return low(v64.avgr<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function shl<T>(a: v32, b: i32): v32 { return low(v64.shl<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function shr<T>(a: v32, b: i32): v32 { return low(v64.shr<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function popcnt<T>(a: v32): v32 { return low(v64.popcnt<T>(a)); }
  // @ts-expect-error: decorator
  @inline export function eq<T>(a: v32, b: v32): v32 { return low(v64.eq<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function ne<T>(a: v32, b: v32): v32 { return low(v64.ne<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function lt<T>(a: v32, b: v32): v32 { return low(v64.lt<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function le<T>(a: v32, b: v32): v32 { return low(v64.le<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function gt<T>(a: v32, b: v32): v32 { return low(v64.gt<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function ge<T>(a: v32, b: v32): v32 { return low(v64.ge<T>(a, b)); }
  // @ts-expect-error: decorator
  @inline export function all_true<T>(a: v32): bool { return v64.all_true<T>((a as u64) | truthyPadding<T>()); }
  // @ts-expect-error: decorator
  @inline export function any_true(a: v32): bool { return a != 0; }
  // @ts-expect-error: decorator
  @inline export function bitmask<T>(a: v32): i32 { return v64.bitmask<T>(a); }
  // @ts-expect-error: decorator
  @inline export function and(a: v32, b: v32): v32 { return a & b; }
  // @ts-expect-error: decorator
  @inline export function or(a: v32, b: v32): v32 { return a | b; }
  // @ts-expect-error: decorator
  @inline export function xor(a: v32, b: v32): v32 { return a ^ b; }
  // @ts-expect-error: decorator
  @inline export function andnot(a: v32, b: v32): v32 { return a & ~b; }
  // @ts-expect-error: decorator
  @inline export function not(a: v32): v32 { return ~a; }
  // @ts-expect-error: decorator
  @inline export function bitselect(a: v32, b: v32, m: v32): v32 { return (a & m) | (b & ~m); }
}

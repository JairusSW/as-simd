import { v256_kernels } from "../v256/kernels";
import { v512_kernels } from "../v512/kernels";
import { wrf } from "./regfile";

/** Register-file facade backed exclusively by fixed-width v256 kernels. */
export namespace v256r {

  @inline export function load(dst: u32, ptr: usize, offset: usize = 0): void {
    v256_kernels.load_bits(dst, ptr, offset);
  }


  @inline export function store(ptr: usize, src: u32, offset: usize = 0): void {
    v256_kernels.store_bits(ptr, src, offset);
  }


  @inline export function splat<T>(dst: u32, x: T): void {
    v256_kernels.splat<T>(dst, x);
  }


  @inline export function add<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.add<T>(dst, a, b);
  }


  @inline export function sub<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.sub<T>(dst, a, b);
  }


  @inline export function mul<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.mul<T>(dst, a, b);
  }


  @inline export function neg<T>(dst: u32, a: u32): void {
    v256_kernels.neg<T>(dst, a);
  }


  @inline export function abs<T>(dst: u32, a: u32): void {
    v256_kernels.abs<T>(dst, a);
  }


  @inline export function add_sat<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.add_sat<T>(dst, a, b);
  }


  @inline export function sub_sat<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.sub_sat<T>(dst, a, b);
  }


  @inline export function avgr<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.avgr<T>(dst, a, b);
  }


  @inline export function min<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.min<T>(dst, a, b);
  }


  @inline export function max<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.max<T>(dst, a, b);
  }


  @inline export function shl<T>(dst: u32, a: u32, s: i32): void {
    v256_kernels.shl<T>(dst, a, s);
  }


  @inline export function shr<T>(dst: u32, a: u32, s: i32): void {
    v256_kernels.shr<T>(dst, a, s);
  }


  @inline export function eq<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.compare<T>(dst, a, b, 0);
  }


  @inline export function lt<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.compare<T>(dst, a, b, 1);
  }


  @inline export function le<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.compare<T>(dst, a, b, 2);
  }


  @inline export function gt<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.compare<T>(dst, b, a, 1);
  }


  @inline export function ge<T>(dst: u32, a: u32, b: u32): void {
    v256_kernels.compare<T>(dst, b, a, 2);
  }


  @inline export function and(dst: u32, a: u32, b: u32): void {
    v256_kernels.bitwise(dst, a, b, 0);
  }


  @inline export function or(dst: u32, a: u32, b: u32): void {
    v256_kernels.bitwise(dst, a, b, 1);
  }


  @inline export function xor(dst: u32, a: u32, b: u32): void {
    v256_kernels.bitwise(dst, a, b, 2);
  }


  @inline export function not(dst: u32, a: u32): void {
    v256_kernels.not(dst, a);
  }


  @inline export function bitselect(dst: u32, a: u32, b: u32, m: u32): void {
    v256_kernels.bitselect(dst, a, b, m);
  }


  @inline export function any_true(a: u32): bool {
    return v256_kernels.any_true(a);
  }


  @inline export function all_true<T>(a: u32): bool {
    return v256_kernels.all_true<T>(a);
  }


  @inline export function bitmask<T>(a: u32): u64 {
    return v256_kernels.bitmask<T>(a);
  }


  @inline export function extract_lane<T>(a: u32, idx: u32): T {
    return v256_kernels.extract_lane<T>(a, idx);
  }


  @inline export function replace_lane<T>(
    dst: u32,
    a: u32,
    idx: u32,
    value: T,
  ): void {
    v256_kernels.replace_lane<T>(dst, a, idx, value);
  }
}

/** Register-file facade backed exclusively by fixed-width v512 kernels. */
export namespace v512r {

  @inline export function load(dst: u32, ptr: usize, offset: usize = 0): void {
    v512_kernels.load_bits(dst, ptr, offset);
  }


  @inline export function store(ptr: usize, src: u32, offset: usize = 0): void {
    v512_kernels.store_bits(ptr, src, offset);
  }


  @inline export function splat<T>(dst: u32, x: T): void {
    v512_kernels.splat<T>(dst, x);
  }


  @inline export function add<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.add<T>(dst, a, b);
  }


  @inline export function sub<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.sub<T>(dst, a, b);
  }


  @inline export function mul<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.mul<T>(dst, a, b);
  }


  @inline export function neg<T>(dst: u32, a: u32): void {
    v512_kernels.neg<T>(dst, a);
  }


  @inline export function abs<T>(dst: u32, a: u32): void {
    v512_kernels.abs<T>(dst, a);
  }


  @inline export function add_sat<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.add_sat<T>(dst, a, b);
  }


  @inline export function sub_sat<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.sub_sat<T>(dst, a, b);
  }


  @inline export function avgr<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.avgr<T>(dst, a, b);
  }


  @inline export function min<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.min<T>(dst, a, b);
  }


  @inline export function max<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.max<T>(dst, a, b);
  }


  @inline export function shl<T>(dst: u32, a: u32, s: i32): void {
    v512_kernels.shl<T>(dst, a, s);
  }


  @inline export function shr<T>(dst: u32, a: u32, s: i32): void {
    v512_kernels.shr<T>(dst, a, s);
  }


  @inline export function eq<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.compare<T>(dst, a, b, 0);
  }


  @inline export function lt<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.compare<T>(dst, a, b, 1);
  }


  @inline export function le<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.compare<T>(dst, a, b, 2);
  }


  @inline export function gt<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.compare<T>(dst, b, a, 1);
  }


  @inline export function ge<T>(dst: u32, a: u32, b: u32): void {
    v512_kernels.compare<T>(dst, b, a, 2);
  }


  @inline export function and(dst: u32, a: u32, b: u32): void {
    v512_kernels.bitwise(dst, a, b, 0);
  }


  @inline export function or(dst: u32, a: u32, b: u32): void {
    v512_kernels.bitwise(dst, a, b, 1);
  }


  @inline export function xor(dst: u32, a: u32, b: u32): void {
    v512_kernels.bitwise(dst, a, b, 2);
  }


  @inline export function not(dst: u32, a: u32): void {
    v512_kernels.not(dst, a);
  }


  @inline export function bitselect(dst: u32, a: u32, b: u32, m: u32): void {
    v512_kernels.bitselect(dst, a, b, m);
  }


  @inline export function any_true(a: u32): bool {
    return v512_kernels.any_true(a);
  }


  @inline export function all_true<T>(a: u32): bool {
    return v512_kernels.all_true<T>(a);
  }


  @inline export function bitmask<T>(a: u32): u64 {
    return v512_kernels.bitmask<T>(a);
  }


  @inline export function extract_lane<T>(a: u32, idx: u32): T {
    return v512_kernels.extract_lane<T>(a, idx);
  }


  @inline export function replace_lane<T>(
    dst: u32,
    a: u32,
    idx: u32,
    value: T,
  ): void {
    v512_kernels.replace_lane<T>(dst, a, idx, value);
  }
}

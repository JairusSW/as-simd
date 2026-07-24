import { v256_kernels } from "../v256/kernels";
import { v512_kernels } from "../v512/kernels";
import { wrf } from "./regfile";


@inline
function copyJsonEscapeBitmaskUtf16Scalar64(src: usize, dst: usize): u32 {
  memory.copy(dst, src, 64);
  let mask: u32 = 0;
  for (let lane: u32 = 0; lane < 32; lane++) {
    const code = load<u16>(src + (lane << 1));
    if (
      code == 0x22 ||
      code == 0x5c ||
      code < 0x20 ||
      (code >= 0xd800 && code <= 0xdfff)
    ) {
      mask |= 1 << lane;
    }
  }
  return mask;
}

/** Register-file facade backed exclusively by fixed-width v256 kernels. */
export namespace v256r {

  @inline export function load(dst: u32, ptr: usize, offset: usize = 0): void {
    v256_kernels.load_bits(dst, ptr, offset);
  }


  @inline export function store(ptr: usize, src: u32, offset: usize = 0): void {
    v256_kernels.store_bits(ptr, src, offset);
  }

  /**
   * Copies one vector without materializing it in the wide register file.
   *
   * Prefer this over a load/store pair when the value is not otherwise used.
   */
  @inline export function copy(
    dst: usize,
    src: usize,
    offset: usize = 0,
  ): void {
    const d = dst + offset,
      s = src + offset;
    if (ASC_FEATURE_SIMD) {
      v128.store(d, v128.load(s));
      v128.store(d + 16, v128.load(s + 16));
    } else {
      memory.copy(d, s, 32);
    }
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

  /**
   * Compares a memory vector with a scalar and returns its packed lane mask.
   *
   * This fuses the common load/splat/compare/bitmask pipeline and avoids three
   * register-file round trips when only the scalar mask is observed.
   */
  @inline export function eq_splat_bitmask<T>(ptr: usize, value: T): u64 {
    if (ASC_FEATURE_SIMD) {
      const needle = v128.splat<T>(value),
        lanes = 16 / sizeof<T>();
      return (
        (v128.bitmask<T>(v128.eq<T>(v128.load(ptr), needle)) as u32 as u64) |
        ((v128.bitmask<T>(
          v128.eq<T>(v128.load(ptr + 16), needle),
        ) as u32 as u64) <<
          lanes)
      );
    }
    v256_kernels.load_bits(0, ptr);
    v256_kernels.splat<T>(1, value);
    v256_kernels.compare<T>(2, 0, 1, 0);
    return v256_kernels.bitmask<T>(2);
  }

  /**
   * Returns one packed mask bit for each memory lane equal to either scalar.
   */
  @inline export function eq_either_splat_bitmask<T>(
    ptr: usize,
    a: T,
    b: T,
  ): u64 {
    if (ASC_FEATURE_SIMD) {
      const av = v128.splat<T>(a),
        bv = v128.splat<T>(b),
        lanes = 16 / sizeof<T>(),
        lo = v128.load(ptr),
        hi = v128.load(ptr + 16);
      return (
        (v128.bitmask<T>(
          v128.or(v128.eq<T>(lo, av), v128.eq<T>(lo, bv)),
        ) as u32 as u64) |
        ((v128.bitmask<T>(
          v128.or(v128.eq<T>(hi, av), v128.eq<T>(hi, bv)),
        ) as u32 as u64) <<
          lanes)
      );
    }
    v256_kernels.load_bits(0, ptr);
    v256_kernels.splat<T>(1, a);
    v256_kernels.compare<T>(2, 0, 1, 0);
    v256_kernels.splat<T>(1, b);
    v256_kernels.compare<T>(3, 0, 1, 0);
    v256_kernels.bitwise(2, 2, 3, 1);
    return v256_kernels.bitmask<T>(2);
  }

  /**
   * Returns the byte mask used by UTF-16 JSON string escaping.
   *
   * A bit is set for quotes, backslashes, control characters, and UTF-16
   * surrogate bytes. The fused memory predicate avoids the wide register file.
   */
  @inline export function json_escape_bitmask_utf16(ptr: usize): u64 {
    if (ASC_FEATURE_SIMD) {
      const quote = i16x8.splat(0x22),
        slash = i16x8.splat(0x5c),
        control = i16x8.splat(0x20),
        surrogate = i16x8.splat(i16(0xd7fe)),
        lo = v128.load(ptr),
        hi = v128.load(ptr + 16);
      return (
        (i8x16.bitmask(
          v128.or(
            i16x8.eq(lo, quote),
            v128.or(
              i16x8.eq(lo, slash),
              v128.or(i16x8.lt_u(lo, control), i8x16.gt_u(lo, surrogate)),
            ),
          ),
        ) as u32 as u64) |
        ((i8x16.bitmask(
          v128.or(
            i16x8.eq(hi, quote),
            v128.or(
              i16x8.eq(hi, slash),
              v128.or(i16x8.lt_u(hi, control), i8x16.gt_u(hi, surrogate)),
            ),
          ),
        ) as u32 as u64) <<
          16)
      );
    }
    v256_kernels.load_bits(0, ptr);
    v256_kernels.splat<i16>(1, 0x22);
    v256_kernels.compare<i16>(2, 0, 1, 0);
    v256_kernels.splat<i16>(1, 0x5c);
    v256_kernels.compare<i16>(3, 0, 1, 0);
    v256_kernels.bitwise(2, 2, 3, 1);
    v256_kernels.splat<u16>(1, 0x20);
    v256_kernels.compare<u16>(3, 0, 1, 1);
    v256_kernels.bitwise(2, 2, 3, 1);
    v256_kernels.splat<i16>(1, i16(0xd7fe));
    v256_kernels.compare<u8>(3, 1, 0, 1);
    v256_kernels.bitwise(2, 2, 3, 1);
    return v256_kernels.bitmask<i8>(2);
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

  /**
   * Copies one vector without materializing it in the wide register file.
   *
   * Prefer this over a load/store pair when the value is not otherwise used.
   */
  @inline export function copy(
    dst: usize,
    src: usize,
    offset: usize = 0,
  ): void {
    const d = dst + offset,
      s = src + offset;
    if (ASC_FEATURE_SIMD) {
      v128.store(d, v128.load(s));
      v128.store(d + 16, v128.load(s + 16));
      v128.store(d + 32, v128.load(s + 32));
      v128.store(d + 48, v128.load(s + 48));
    } else {
      memory.copy(d, s, 64);
    }
  }

  /**
   * Copies 64 bytes and returns one bit per UTF-16 lane that needs JSON
   * escaping. This fixed logical block size maps to either two AVX2 vectors or
   * one AVX-512 vector without changing the caller's scalar-mask ABI.
   */
  @inline export function copy_json_escape_bitmask_utf16_64(
    src: usize,
    dst: usize,
  ): u32 {
    if (ASC_FEATURE_SIMD) {
      const quote = i16x8.splat(0x22),
        slash = i16x8.splat(0x5c),
        control = i16x8.splat(0x20),
        surrogateMin = i16x8.splat(i16(0xd800)),
        surrogateMax = i16x8.splat(i16(0xdfff));
      let mask: u32 = 0;
      for (let offset: usize = 0; offset < 64; offset += 16) {
        const block = v128.load(src + offset);
        v128.store(dst + offset, block);
        const escape = v128.or(
          i16x8.eq(block, quote),
          v128.or(
            i16x8.eq(block, slash),
            v128.or(
              i16x8.lt_u(block, control),
              v128.and(
                i16x8.ge_u(block, surrogateMin),
                i16x8.le_u(block, surrogateMax),
              ),
            ),
          ),
        );
        mask |= (i16x8.bitmask(escape) as u32) << u32(offset >> 1);
      }
      return mask;
    }
    return copyJsonEscapeBitmaskUtf16Scalar64(src, dst);
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

  /**
   * Compares a memory vector with a scalar and returns its packed lane mask.
   *
   * This fuses the common load/splat/compare/bitmask pipeline and avoids three
   * register-file round trips when only the scalar mask is observed.
   */
  @inline export function eq_splat_bitmask<T>(ptr: usize, value: T): u64 {
    if (ASC_FEATURE_SIMD) {
      const needle = v128.splat<T>(value),
        lanes = 16 / sizeof<T>();
      return (
        (v128.bitmask<T>(v128.eq<T>(v128.load(ptr), needle)) as u32 as u64) |
        ((v128.bitmask<T>(
          v128.eq<T>(v128.load(ptr + 16), needle),
        ) as u32 as u64) <<
          lanes) |
        ((v128.bitmask<T>(
          v128.eq<T>(v128.load(ptr + 32), needle),
        ) as u32 as u64) <<
          (lanes * 2)) |
        ((v128.bitmask<T>(
          v128.eq<T>(v128.load(ptr + 48), needle),
        ) as u32 as u64) <<
          (lanes * 3))
      );
    }
    v512_kernels.load_bits(0, ptr);
    v512_kernels.splat<T>(1, value);
    v512_kernels.compare<T>(2, 0, 1, 0);
    return v512_kernels.bitmask<T>(2);
  }

  /**
   * Returns one packed mask bit for each memory lane equal to either scalar.
   */
  @inline export function eq_either_splat_bitmask<T>(
    ptr: usize,
    a: T,
    b: T,
  ): u64 {
    if (ASC_FEATURE_SIMD) {
      const av = v128.splat<T>(a),
        bv = v128.splat<T>(b),
        lanes = 16 / sizeof<T>(),
        c0 = v128.load(ptr),
        c1 = v128.load(ptr + 16),
        c2 = v128.load(ptr + 32),
        c3 = v128.load(ptr + 48);
      return (
        (v128.bitmask<T>(
          v128.or(v128.eq<T>(c0, av), v128.eq<T>(c0, bv)),
        ) as u32 as u64) |
        ((v128.bitmask<T>(
          v128.or(v128.eq<T>(c1, av), v128.eq<T>(c1, bv)),
        ) as u32 as u64) <<
          lanes) |
        ((v128.bitmask<T>(
          v128.or(v128.eq<T>(c2, av), v128.eq<T>(c2, bv)),
        ) as u32 as u64) <<
          (lanes * 2)) |
        ((v128.bitmask<T>(
          v128.or(v128.eq<T>(c3, av), v128.eq<T>(c3, bv)),
        ) as u32 as u64) <<
          (lanes * 3))
      );
    }
    v512_kernels.load_bits(0, ptr);
    v512_kernels.splat<T>(1, a);
    v512_kernels.compare<T>(2, 0, 1, 0);
    v512_kernels.splat<T>(1, b);
    v512_kernels.compare<T>(3, 0, 1, 0);
    v512_kernels.bitwise(2, 2, 3, 1);
    return v512_kernels.bitmask<T>(2);
  }

  /**
   * Returns the byte mask used by UTF-16 JSON string escaping.
   *
   * A bit is set for quotes, backslashes, control characters, and UTF-16
   * surrogate bytes. The fused memory predicate avoids the wide register file.
   */
  @inline export function json_escape_bitmask_utf16(ptr: usize): u64 {
    if (ASC_FEATURE_SIMD) {
      const quote = i16x8.splat(0x22),
        slash = i16x8.splat(0x5c),
        control = i16x8.splat(0x20),
        surrogate = i16x8.splat(i16(0xd7fe)),
        c0 = v128.load(ptr),
        c1 = v128.load(ptr + 16),
        c2 = v128.load(ptr + 32),
        c3 = v128.load(ptr + 48);
      return (
        (i8x16.bitmask(
          v128.or(
            i16x8.eq(c0, quote),
            v128.or(
              i16x8.eq(c0, slash),
              v128.or(i16x8.lt_u(c0, control), i8x16.gt_u(c0, surrogate)),
            ),
          ),
        ) as u32 as u64) |
        ((i8x16.bitmask(
          v128.or(
            i16x8.eq(c1, quote),
            v128.or(
              i16x8.eq(c1, slash),
              v128.or(i16x8.lt_u(c1, control), i8x16.gt_u(c1, surrogate)),
            ),
          ),
        ) as u32 as u64) <<
          16) |
        ((i8x16.bitmask(
          v128.or(
            i16x8.eq(c2, quote),
            v128.or(
              i16x8.eq(c2, slash),
              v128.or(i16x8.lt_u(c2, control), i8x16.gt_u(c2, surrogate)),
            ),
          ),
        ) as u32 as u64) <<
          32) |
        ((i8x16.bitmask(
          v128.or(
            i16x8.eq(c3, quote),
            v128.or(
              i16x8.eq(c3, slash),
              v128.or(i16x8.lt_u(c3, control), i8x16.gt_u(c3, surrogate)),
            ),
          ),
        ) as u32 as u64) <<
          48)
      );
    }
    v512_kernels.load_bits(0, ptr);
    v512_kernels.splat<i16>(1, 0x22);
    v512_kernels.compare<i16>(2, 0, 1, 0);
    v512_kernels.splat<i16>(1, 0x5c);
    v512_kernels.compare<i16>(3, 0, 1, 0);
    v512_kernels.bitwise(2, 2, 3, 1);
    v512_kernels.splat<u16>(1, 0x20);
    v512_kernels.compare<u16>(3, 0, 1, 1);
    v512_kernels.bitwise(2, 2, 3, 1);
    v512_kernels.splat<i16>(1, i16(0xd7fe));
    v512_kernels.compare<u8>(3, 1, 0, 1);
    v512_kernels.bitwise(2, 2, 3, 1);
    return v512_kernels.bitmask<i8>(2);
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

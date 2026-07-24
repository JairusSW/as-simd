import { v128_swar } from "./v128_swar";
import { rf } from "./regfile";

// Keep scalar builtins outside the namespace, whose public load/store methods
// would otherwise shadow them in generic lane accessors.
@inline function lane_load<T>(ptr: usize): T { return load<T>(ptr); }
@inline function lane_store<T>(ptr: usize, value: T): void { store<T>(ptr, value); }

// Register-indexed 128-bit SIMD VM — the primary register-file interface.
//
// Every operation names its operands and destination by register index
// (0..RF_REGS-1) in the statically reserved `rf` file. Each op reads its operand
// halves from the file, calls the corresponding value-based `v128_swar`
// kernel (which returns `lo` and stashes `hi` in a transient global), and
// writes the (lo, hi) result back into the destination register.
//
// Aliasing is safe: every operand is loaded before the destination is written.
// SIMD builds stay in the native vector domain for operations where measurement
// beats scalar words; simple operations retain their faster scalar kernels.
//
// `T` selects the lane type exactly as in `v128_swar` (e.g. i8/u8/i16/.../f64).
export namespace v128_kernels {
  // @ts-expect-error: decorator
  @inline function store_lo_hi(dst: u32, lo: u64): void { rf.set(dst, lo, v128_swar.take_hi()); }

  // ---- construction / lanes ------------------------------------------------
  // @ts-expect-error: decorator
  @inline export function splat<T>(dst: u32, x: T): void { store_lo_hi(dst, v128_swar.splat<T>(x)); }
  // @ts-expect-error: decorator
  @inline export function extract_lane<T>(a: u32, idx: u8): T {
    const lane = (idx as u32) % ((16 / sizeof<T>()) as u32);
    return lane_load<T>(rf.addr(a) + (lane as usize) * sizeof<T>());
  }
  // @ts-expect-error: decorator
  @inline export function replace_lane<T>(dst: u32, a: u32, idx: u8, value: T): void {
    const dp = rf.addr(dst), ap = rf.addr(a);
    if (dst != a) {
      if (ASC_FEATURE_SIMD) v128.store(dp, v128.load(ap));
      else { lane_store<u64>(dp, lane_load<u64>(ap)); lane_store<u64>(dp + 8, lane_load<u64>(ap + 8)); }
    }
    const lane = (idx as u32) % ((16 / sizeof<T>()) as u32);
    lane_store<T>(dp + (lane as usize) * sizeof<T>(), value);
  }
  // @ts-expect-error: decorator
  @inline export function shuffle<T>(dst: u32, a: u32, b: u32, lanes: StaticArray<u8>): void { store_lo_hi(dst, v128_swar.shuffle<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b), lanes)); }
  // @ts-expect-error: decorator
  @inline export function swizzle(dst: u32, a: u32, s: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), i8x16.swizzle(v128.load(rf.addr(a)), v128.load(rf.addr(s)))); return; }
    store_lo_hi(dst, v128_swar.swizzle(rf.lo(a), rf.hi(a), rf.lo(s), rf.hi(s)));
  }

  // ---- memory --------------------------------------------------------------
  // @ts-expect-error: decorator
  @inline export function load(dst: u32, ptr: usize, immOffset: usize = 0, immAlign: usize = 1): void { store_lo_hi(dst, v128_swar.load(ptr, immOffset, immAlign)); }
  // @ts-expect-error: decorator
  @inline export function loadPartial(dst: u32, ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): void { store_lo_hi(dst, v128_swar.loadPartial(ptr, len, immOffset, immAlign, fill)); }
  // @ts-expect-error: decorator
  @inline export function store(ptr: usize, a: u32, immOffset: usize = 0, immAlign: usize = 1): void { v128_swar.store(ptr, rf.lo(a), rf.hi(a), immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, a: u32, len: i32, immOffset: usize = 0, immAlign: usize = 1): void { v128_swar.storePartial(ptr, rf.lo(a), rf.hi(a), len, immOffset, immAlign); }
  // @ts-expect-error: decorator
  @inline export function load_ext<TFrom>(dst: u32, ptr: usize, immOffset: usize = 0, immAlign: usize = 1): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.load_ext<TFrom>(ptr + immOffset, 0, 1)); return; }
    store_lo_hi(dst, v128_swar.load_ext<TFrom>(ptr, immOffset, immAlign));
  }
  // @ts-expect-error: decorator
  @inline export function load_zero<TFrom>(dst: u32, ptr: usize, immOffset: usize = 0, immAlign: usize = 1): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.load_zero<TFrom>(ptr + immOffset, 0, 1)); return; }
    store_lo_hi(dst, v128_swar.load_zero<TFrom>(ptr, immOffset, immAlign));
  }
  // @ts-expect-error: decorator
  @inline export function load_splat<T>(dst: u32, ptr: usize, immOffset: usize = 0, immAlign: usize = 1): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.load_splat<T>(ptr + immOffset, 0, 1)); return; }
    store_lo_hi(dst, v128_swar.load_splat<T>(ptr, immOffset, immAlign));
  }
  // @ts-expect-error: decorator
  @inline export function load_lane<T>(dst: u32, ptr: usize, a: u32, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void {
    replace_lane<T>(dst, a, idx, lane_load<T>(ptr + immOffset));
  }
  // @ts-expect-error: decorator
  @inline export function store_lane<T>(ptr: usize, a: u32, idx: u8, immOffset: usize = 0, immAlign: usize = 1): void {
    lane_store<T>(ptr + immOffset, extract_lane<T>(a, idx));
  }

  // ---- arithmetic ----------------------------------------------------------
  // @ts-expect-error: decorator
  @inline export function add<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && isFloat<T>()) { v128.store(rf.addr(dst), v128.add<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.add<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function sub<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && isFloat<T>()) { v128.store(rf.addr(dst), v128.sub<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.sub<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function mul<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) {
      const av = v128.load(rf.addr(a)), bv = v128.load(rf.addr(b));
      if (sizeof<T>() == 1) {
        const lo = i16x8.extmul_low_i8x16_u(av, bv), hi = i16x8.extmul_high_i8x16_u(av, bv);
        v128.store(rf.addr(dst), i8x16.shuffle(lo, hi, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30));
      } else v128.store(rf.addr(dst), v128.mul<T>(av, bv));
      return;
    }
    store_lo_hi(dst, v128_swar.mul<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function div<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && isFloat<T>()) { v128.store(rf.addr(dst), v128.div<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.div<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function neg<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && isFloat<T>()) { v128.store(rf.addr(dst), v128.neg<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.neg<T>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function abs<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) { v128.store(rf.addr(dst), v128.abs<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.abs<T>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function add_sat<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() <= 2) {
      v128.store(rf.addr(dst), v128.add_sat<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b))));
      return;
    }
    store_lo_hi(dst, v128_swar.add_sat<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function sub_sat<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() <= 2) { v128.store(rf.addr(dst), v128.sub_sat<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.sub_sat<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function avgr<T>(dst: u32, a: u32, b: u32): void { store_lo_hi(dst, v128_swar.avgr<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b))); }
  // @ts-expect-error: decorator
  @inline export function min<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) {
      const av = v128.load(rf.addr(a)), bv = v128.load(rf.addr(b));
      if (sizeof<T>() == 1) v128.store(rf.addr(dst), isSigned<T>() ? v128.min<i8>(av, bv) : v128.min<u8>(av, bv));
      else if (sizeof<T>() == 2) v128.store(rf.addr(dst), isSigned<T>() ? v128.min<i16>(av, bv) : v128.min<u16>(av, bv));
      else if (sizeof<T>() == 4) v128.store(rf.addr(dst), v128.min<f32>(av, bv));
      else v128.store(rf.addr(dst), v128.min<f64>(av, bv));
      return;
    }
    store_lo_hi(dst, v128_swar.min<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function max<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) {
      const av = v128.load(rf.addr(a)), bv = v128.load(rf.addr(b));
      if (sizeof<T>() == 1) v128.store(rf.addr(dst), isSigned<T>() ? v128.max<i8>(av, bv) : v128.max<u8>(av, bv));
      else if (sizeof<T>() == 2) v128.store(rf.addr(dst), isSigned<T>() ? v128.max<i16>(av, bv) : v128.max<u16>(av, bv));
      else if (sizeof<T>() == 4) v128.store(rf.addr(dst), v128.max<f32>(av, bv));
      else v128.store(rf.addr(dst), v128.max<f64>(av, bv));
      return;
    }
    store_lo_hi(dst, v128_swar.max<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function pmin<T>(dst: u32, a: u32, b: u32): void { min<T>(dst, a, b); }
  // @ts-expect-error: decorator
  @inline export function pmax<T>(dst: u32, a: u32, b: u32): void { max<T>(dst, a, b); }
  // @ts-expect-error: decorator
  @inline export function dot<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.dot<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.dot<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }

  // ---- float-only unary ----------------------------------------------------
  // @ts-expect-error: decorator
  @inline export function sqrt<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() == 4) { v128.store(rf.addr(dst), v128.sqrt<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.sqrt<T>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function ceil<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() == 4) { v128.store(rf.addr(dst), v128.ceil<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.ceil<T>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function floor<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() == 4) { v128.store(rf.addr(dst), v128.floor<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.floor<T>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function trunc<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() == 4) { v128.store(rf.addr(dst), v128.trunc<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.trunc<T>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function nearest<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() == 4) { v128.store(rf.addr(dst), v128.nearest<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.nearest<T>(rf.lo(a), rf.hi(a)));
  }

  // ---- bitwise -------------------------------------------------------------
  // @ts-expect-error: decorator
  @inline export function and(dst: u32, a: u32, b: u32): void { store_lo_hi(dst, v128_swar.and(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b))); }
  // @ts-expect-error: decorator
  @inline export function or(dst: u32, a: u32, b: u32): void { store_lo_hi(dst, v128_swar.or(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b))); }
  // @ts-expect-error: decorator
  @inline export function xor(dst: u32, a: u32, b: u32): void { store_lo_hi(dst, v128_swar.xor(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b))); }
  // @ts-expect-error: decorator
  @inline export function andnot(dst: u32, a: u32, b: u32): void { store_lo_hi(dst, v128_swar.andnot(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b))); }
  // @ts-expect-error: decorator
  @inline export function not(dst: u32, a: u32): void { store_lo_hi(dst, v128_swar.not(rf.lo(a), rf.hi(a))); }
  // @ts-expect-error: decorator
  @inline export function bitselect(dst: u32, v1: u32, v2: u32, m: u32): void { store_lo_hi(dst, v128_swar.bitselect(rf.lo(v1), rf.hi(v1), rf.lo(v2), rf.hi(v2), rf.lo(m), rf.hi(m))); }
  // @ts-expect-error: decorator
  @inline export function popcnt<T>(dst: u32, a: u32): void { store_lo_hi(dst, v128_swar.popcnt<T>(rf.lo(a), rf.hi(a))); }

  // ---- shifts --------------------------------------------------------------
  // @ts-expect-error: decorator
  @inline export function shl<T>(dst: u32, a: u32, b: i32): void { store_lo_hi(dst, v128_swar.shl<T>(rf.lo(a), rf.hi(a), b)); }
  // @ts-expect-error: decorator
  @inline export function shr<T>(dst: u32, a: u32, b: i32): void { store_lo_hi(dst, v128_swar.shr<T>(rf.lo(a), rf.hi(a), b)); }

  // ---- comparisons (write a lane mask register) ----------------------------
  // @ts-expect-error: decorator
  @inline export function eq<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) { v128.store(rf.addr(dst), v128.eq<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.eq<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function ne<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) { v128.store(rf.addr(dst), v128.ne<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.ne<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function lt<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) { v128.store(rf.addr(dst), v128.lt<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.lt<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function le<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) { v128.store(rf.addr(dst), v128.le<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.le<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function gt<T>(dst: u32, a: u32, b: u32): void { lt<T>(dst, b, a); }
  // @ts-expect-error: decorator
  @inline export function ge<T>(dst: u32, a: u32, b: u32): void { le<T>(dst, b, a); }

  // ---- reductions (read-only) ----------------------------------------------
  // @ts-expect-error: decorator
  @inline export function any_true(a: u32): bool { return v128_swar.any_true(rf.lo(a), rf.hi(a)); }
  // @ts-expect-error: decorator
  @inline export function all_true<T>(a: u32): bool {
    if (ASC_FEATURE_SIMD && sizeof<T>() <= 4) return v128.all_true<T>(v128.load(rf.addr(a)));
    return v128_swar.all_true<T>(rf.lo(a), rf.hi(a));
  }
  // @ts-expect-error: decorator
  @inline export function bitmask<T>(a: u32): i32 {
    if (ASC_FEATURE_SIMD) return v128.bitmask<T>(v128.load(rf.addr(a)));
    return v128_swar.bitmask<T>(rf.lo(a), rf.hi(a));
  }

  // ---- conversions / lane-width changes ------------------------------------
  // @ts-expect-error: decorator
  @inline export function convert<TFrom>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.convert<TFrom>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.convert<TFrom>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function convert_low<TFrom>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.convert_low<TFrom>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.convert_low<TFrom>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function trunc_sat<TTo>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.trunc_sat<TTo>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.trunc_sat<TTo>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function trunc_sat_zero<TTo>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.trunc_sat_zero<TTo>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.trunc_sat_zero<TTo>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function narrow<TFrom>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.narrow<TFrom>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.narrow<TFrom>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extend_low<TFrom>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<TFrom>() == 1) { v128.store(rf.addr(dst), v128.extend_low<TFrom>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.extend_low<TFrom>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function extend_high<TFrom>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<TFrom>() == 1) { v128.store(rf.addr(dst), v128.extend_high<TFrom>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.extend_high<TFrom>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function extadd_pairwise<TFrom>(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<TFrom>() == 1) { v128.store(rf.addr(dst), v128.extadd_pairwise<TFrom>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.extadd_pairwise<TFrom>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_low<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() == 1) { v128.store(rf.addr(dst), v128.extmul_low<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.extmul_low<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function extmul_high<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD && sizeof<T>() == 1) { v128.store(rf.addr(dst), v128.extmul_high<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.extmul_high<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function demote_zero(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.demote_zero(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.demote_zero(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function promote_low(dst: u32, a: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.promote_low(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.promote_low(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function q15mulr_sat<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_SIMD) { v128.store(rf.addr(dst), v128.q15mulr_sat<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.q15mulr_sat<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }

  // ---- relaxed-SIMD --------------------------------------------------------
  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(dst: u32, a: u32, s: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_swizzle(v128.load(rf.addr(a)), v128.load(rf.addr(s)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_swizzle(rf.lo(a), rf.hi(a), rf.lo(s), rf.hi(s)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_madd<T>(dst: u32, a: u32, b: u32, c: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_madd<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)), v128.load(rf.addr(c)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_madd<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b), rf.lo(c), rf.hi(c)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_nmadd<T>(dst: u32, a: u32, b: u32, c: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_nmadd<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)), v128.load(rf.addr(c)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_nmadd<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b), rf.lo(c), rf.hi(c)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect<T>(dst: u32, a: u32, b: u32, m: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_laneselect<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)), v128.load(rf.addr(m)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_laneselect<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b), rf.lo(m), rf.hi(m)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_min<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_min<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_min<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_max<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_max<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_max<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_q15mulr<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_q15mulr<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_q15mulr<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_dot<T>(dst: u32, a: u32, b: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_dot<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_dot<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_dot_add<T>(dst: u32, a: u32, b: u32, c: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_dot_add<T>(v128.load(rf.addr(a)), v128.load(rf.addr(b)), v128.load(rf.addr(c)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_dot_add<T>(rf.lo(a), rf.hi(a), rf.lo(b), rf.hi(b), rf.lo(c), rf.hi(c)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_trunc<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_trunc<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_trunc<T>(rf.lo(a), rf.hi(a)));
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_trunc_zero<T>(dst: u32, a: u32): void {
    if (ASC_FEATURE_RELAXED_SIMD) { v128.store(rf.addr(dst), v128.relaxed_trunc_zero<T>(v128.load(rf.addr(a)))); return; }
    store_lo_hi(dst, v128_swar.relaxed_trunc_zero<T>(rf.lo(a), rf.hi(a)));
  }
}

/** Bitwise building blocks for Wide UTF kernels, expressed as generic vector ops. */
import { wrf } from "./regfile";
import { v256r, v512r } from "./wide";


@inline
export function and256(dst: u32, a: u32, b: u32): void {
  if (!ASC_FEATURE_SIMD) {
    v256r.and(dst, a, b);
    return;
  }
  const dp = wrf.addr(dst),
    ap = wrf.addr(a),
    bp = wrf.addr(b);
  v128.store(dp, v128.and(v128.load(ap), v128.load(bp)));
  v128.store(dp, v128.and(v128.load(ap, 16), v128.load(bp, 16)), 16);
}


@inline
export function or256(dst: u32, a: u32, b: u32): void {
  if (!ASC_FEATURE_SIMD) {
    v256r.or(dst, a, b);
    return;
  }
  const dp = wrf.addr(dst),
    ap = wrf.addr(a),
    bp = wrf.addr(b);
  v128.store(dp, v128.or(v128.load(ap), v128.load(bp)));
  v128.store(dp, v128.or(v128.load(ap, 16), v128.load(bp, 16)), 16);
}


@inline
export function xor256(dst: u32, a: u32, b: u32): void {
  if (!ASC_FEATURE_SIMD) {
    v256r.xor(dst, a, b);
    return;
  }
  const dp = wrf.addr(dst),
    ap = wrf.addr(a),
    bp = wrf.addr(b);
  v128.store(dp, v128.xor(v128.load(ap), v128.load(bp)));
  v128.store(dp, v128.xor(v128.load(ap, 16), v128.load(bp, 16)), 16);
}


@inline
export function and512(dst: u32, a: u32, b: u32): void {
  if (!ASC_FEATURE_SIMD) {
    v512r.and(dst, a, b);
    return;
  }
  const dp = wrf.addr(dst),
    ap = wrf.addr(a),
    bp = wrf.addr(b);
  v128.store(dp, v128.and(v128.load(ap), v128.load(bp)));
  v128.store(dp, v128.and(v128.load(ap, 16), v128.load(bp, 16)), 16);
  v128.store(dp, v128.and(v128.load(ap, 32), v128.load(bp, 32)), 32);
  v128.store(dp, v128.and(v128.load(ap, 48), v128.load(bp, 48)), 48);
}


@inline
export function or512(dst: u32, a: u32, b: u32): void {
  if (!ASC_FEATURE_SIMD) {
    v512r.or(dst, a, b);
    return;
  }
  const dp = wrf.addr(dst),
    ap = wrf.addr(a),
    bp = wrf.addr(b);
  v128.store(dp, v128.or(v128.load(ap), v128.load(bp)));
  v128.store(dp, v128.or(v128.load(ap, 16), v128.load(bp, 16)), 16);
  v128.store(dp, v128.or(v128.load(ap, 32), v128.load(bp, 32)), 32);
  v128.store(dp, v128.or(v128.load(ap, 48), v128.load(bp, 48)), 48);
}


@inline
export function xor512(dst: u32, a: u32, b: u32): void {
  if (!ASC_FEATURE_SIMD) {
    v512r.xor(dst, a, b);
    return;
  }
  const dp = wrf.addr(dst),
    ap = wrf.addr(a),
    bp = wrf.addr(b);
  v128.store(dp, v128.xor(v128.load(ap), v128.load(bp)));
  v128.store(dp, v128.xor(v128.load(ap, 16), v128.load(bp, 16)), 16);
  v128.store(dp, v128.xor(v128.load(ap, 32), v128.load(bp, 32)), 32);
  v128.store(dp, v128.xor(v128.load(ap, 48), v128.load(bp, 48)), 48);
}

import { v64, v128, v256, v512, i64x4, i64x8 } from "as-simd";

export function vectorChecksum(a: i32, b: i32): i64 {
  const x64: v64 = v64.add<i32>(v64.splat<i32>(a), v64.splat<i32>(b));
  const x128: v128 = v128.sub<i32>(v128.splat<i32>(a), v128.splat<i32>(b));
  const x256: v256 = v256.mul<i32>(v256.splat<i32>(a), v256.splat<i32>(b));
  const x512: v512 = v512.add<i32>(v512.splat<i32>(a), v512.splat<i32>(b));
  return v64.extract_lane<i32>(x64, 1)
    + v128.extract_lane<i32>(x128, 3)
    + v256.extract_lane<i32>(x256, 7)
    + v512.extract_lane<i32>(x512, 15);
}

export function laneNamespaceChecksum(a: i32, b: i32): i64 {
  const x4 = i64x4.add(i64x4.splat(a as i64), i64x4.splat(b as i64));
  const x8 = i64x8.sub(i64x8.splat(a as i64), i64x8.splat(b as i64));
  return i64x4.extract_lane(x4, 3) + i64x8.extract_lane(x8, 7);
}

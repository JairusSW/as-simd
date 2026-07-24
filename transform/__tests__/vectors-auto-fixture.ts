import { V256, V512 } from "../../assembly/wide/value";

export function vectorChecksum(a: i32, b: i32): i64 {
  const x64: v64 = v64.add<i32>(v64.splat<i32>(a), v64.splat<i32>(b));
  const x128: v128 = v128.sub<i32>(v128.splat<i32>(a), v128.splat<i32>(b));
  const x256: v256 = v256.mul<i32>(v256.splat<i32>(a), v256.splat<i32>(b));
  const x512: v512 = v512.add<i32>(v512.splat<i32>(a), v512.splat<i32>(b));
  return (
    v64.extract_lane<i32>(x64, 1) +
    v128.extract_lane<i32>(x128, 3) +
    v256.extract_lane<i32>(x256, 7) +
    v512.extract_lane<i32>(x512, 15)
  );
}

export function legacyV256Checksum(a: i32, b: i32): i32 {
  const x = V256.add<i32>(V256.splat<i32>(a), V256.splat<i32>(b));
  const y = V256.sub<i32>(x, V256.splat<i32>(b));
  return V256.extract_lane<i32>(y, 7);
}

export function legacyV512Checksum(a: i32, b: i32): i32 {
  const x = V512.add<i32>(V512.splat<i32>(a), V512.splat<i32>(b));
  const y = V512.sub<i32>(x, V512.splat<i32>(b));
  return V512.extract_lane<i32>(y, 15);
}

export function v256Checksum(a: i32, b: i32): i32 {
  const x: v256 = v256.add<i32>(v256.splat<i32>(a), v256.splat<i32>(b));
  const y: v256 = v256.sub<i32>(x, v256.splat<i32>(b));
  return v256.extract_lane<i32>(y, 7);
}

export function v512Checksum(a: i32, b: i32): i32 {
  const x: v512 = v512.add<i32>(v512.splat<i32>(a), v512.splat<i32>(b));
  const y: v512 = v512.sub<i32>(x, v512.splat<i32>(b));
  return v512.extract_lane<i32>(y, 15);
}

export function laneNamespaceChecksum(a: i32, b: i32): i64 {
  const x4 = i64x4.add(i64x4.splat(a as i64), i64x4.splat(b as i64));
  const x8 = i64x8.sub(i64x8.splat(a as i64), i64x8.splat(b as i64));
  return i64x4.extract_lane(x4, 3) + i64x8.extract_lane(x8, 7);
}

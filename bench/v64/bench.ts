import { i8x8 } from "../../assembly/v64/lanes";

// @ts-expect-error: decorator
@inline function mixStep(x: u64): u64 {
  let z = x + 0x9e3779b97f4a7c15;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}

export function addLoop(iters: u32, a: u64, b: u64): u64 {
  let x = a,
    y = b;
  for (let i: u32 = 0; i < iters; ++i) {
    x = i8x8.add(x, y);
    y = mixStep(y ^ x);
  }
  return x ^ y;
}
export function mulLoop(iters: u32, a: u64, b: u64): u64 {
  let x = a,
    y = b;
  for (let i: u32 = 0; i < iters; ++i) {
    x = i8x8.mul(x, y);
    y = mixStep(y ^ x);
  }
  return x ^ y;
}
export function minSLoop(iters: u32, a: u64, b: u64): u64 {
  let x = a,
    y = b;
  for (let i: u32 = 0; i < iters; ++i) {
    x = i8x8.min_s(x, y);
    y = mixStep(y ^ x);
  }
  return x ^ y;
}
export function ltSLoop(iters: u32, a: u64, b: u64): u64 {
  let x = a,
    y = b;
  for (let i: u32 = 0; i < iters; ++i) {
    x = i8x8.lt_s(x, y);
    y = mixStep(y ^ x);
  }
  return x ^ y;
}
export function addSatSLoop(iters: u32, a: u64, b: u64): u64 {
  let x = a,
    y = b;
  for (let i: u32 = 0; i < iters; ++i) {
    x = i8x8.add_sat_s(x, y);
    y = mixStep(y ^ x);
  }
  return x ^ y;
}

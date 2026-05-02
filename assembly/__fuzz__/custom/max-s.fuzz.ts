import { i8x8 } from "../../v64/i8x8";
import { i8x8_scalar } from "../../scalar/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";

let state: u64 = 0;

// @ts-expect-error: decorator
@inline function nextU32(): u32 {
  state += 0x9e3779b97f4a7c15;
  let z = state;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return <u32>(z ^ (z >> 31));
}

// @ts-expect-error: decorator
@inline function nextU64(): u64 {
  return (<u64>nextU32() << 32) | <u64>nextU32();
}

// @ts-expect-error: decorator
@inline function lt_mask_u_current(a: u64, b: u64): u64 {
  const d = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080);
  return ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function max_s_current(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const mask = lt_mask_u_current(ax, bx);
  return a ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function lt_mask_u_split16(a: u64, b: u64): u64 {
  const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080);
  const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000);
  const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7;
  return ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
}

// @ts-expect-error: decorator
@inline function max_s_split16(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const mask = lt_mask_u_split16(ax, bx);
  return a ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function max_s_dual16(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const mask = lt_mask_u_split16(bx, ax);
  return b ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool {
  const expected = i8x8_scalar.max_s(a, b);
  const lib = i8x8.max_s(a, b);
  const current = max_s_current(a, b);
  const split16 = max_s_split16(a, b);
  const dual16 = max_s_dual16(a, b);
  if (lib != expected || current != expected || split16 != expected || dual16 != expected) {
    expect<u64>(lib).toBe(expected);
    expect<u64>(current).toBe(expected);
    expect<u64>(split16).toBe(expected);
    expect<u64>(dual16).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.max_s candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  if (!check(0, 0)) return false;
  if (!check(0xffffffffffffffff, 0)) return false;
  if (!check(0x8080808080808080, 0x7f7f7f7f7f7f7f7f)) return false;
  if (!check(0x00ff00ff00ff00ff, 0xff00ff00ff00ff00)) return false;
  if (!check(0xfedcba9876543210, 0x7766554433221100)) return false;
  for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

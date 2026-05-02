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
@inline function nextU64(): u64 { return (<u64>nextU32() << 32) | <u64>nextU32(); }

// @ts-expect-error: decorator
@inline function avgr_current(a: u64, b: u64): u64 {
  return (a | b) - (((a ^ b) & ~0x0101010101010101) >> 1);
}

// @ts-expect-error: decorator
@inline function avgr_current_const(a: u64, b: u64): u64 {
  return (a | b) - (((a ^ b) & 0xfefefefefefefefe) >> 1);
}

// @ts-expect-error: decorator
@inline function avgr_and_xor(a: u64, b: u64): u64 {
  return (a & b) + (((a ^ b) + 0x0101010101010101) >> 1);
}

// @ts-expect-error: decorator
@inline function avgr_or_xor_masked(a: u64, b: u64): u64 {
  const x = a ^ b;
  return (a | b) - ((x >> 1) & 0x7f7f7f7f7f7f7f7f);
}

// @ts-expect-error: decorator
@inline function avgr_split32(a: u64, b: u64): u64 {
  const alo = a as u32;
  const blo = b as u32;
  const ahi = (a >> 32) as u32;
  const bhi = (b >> 32) as u32;
  const lo = (alo | blo) - (((alo ^ blo) & 0xfefefefe) >> 1);
  const hi = (ahi | bhi) - (((ahi ^ bhi) & 0xfefefefe) >> 1);
  return (lo as u64) | ((hi as u64) << 32);
}

// @ts-expect-error: decorator
@inline function avgr_split16(a: u64, b: u64): u64 {
  const lo = ((a | b) - (((a ^ b) & 0x00fe00fe00fe00fe) >> 1)) & 0x00ff00ff00ff00ff;
  const hi = ((a | b) - (((a ^ b) & 0xfe00fe00fe00fe00) >> 1)) & 0xff00ff00ff00ff00;
  return lo | hi;
}

// @ts-expect-error: decorator
@inline function checkAvgr(a: u64, b: u64): bool {
  const expected = i8x8_scalar.avgr_u(a, b);
  const lib = i8x8.avgr_u(a, b);
  const current = avgr_current(a, b);
  const currentConst = avgr_current_const(a, b);
  const orXorMasked = avgr_or_xor_masked(a, b);
  const split32 = avgr_split32(a, b);
  const split16 = avgr_split16(a, b);
  if (lib != expected || current != expected || currentConst != expected || orXorMasked != expected || split32 != expected || split16 != expected) {
    expect<u64>(lib).toBe(expected);
    expect<u64>(current).toBe(expected);
    expect<u64>(currentConst).toBe(expected);
    expect<u64>(orXorMasked).toBe(expected);
    expect<u64>(split32).toBe(expected);
    expect<u64>(split16).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.avgr_u candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  if (!checkAvgr(0, 0)) return false;
  if (!checkAvgr(0xffffffffffffffff, 0)) return false;
  if (!checkAvgr(0xffffffffffffffff, 0x0101010101010101)) return false;
  if (!checkAvgr(0x7f7f7f7f7f7f7f7f, 0x8080808080808080)) return false;
  if (!checkAvgr(0x00ff00ff00ff00ff, 0xff00ff00ff00ff00)) return false;
  if (!checkAvgr(0xfedcba9876543210, 0x7766554433221100)) return false;
  for (let i = 0; i < 64; i++) if (!checkAvgr(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

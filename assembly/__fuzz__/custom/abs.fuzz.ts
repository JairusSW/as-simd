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
@inline function add_nibble(a: u64, b: u64): u64 {
  const lo = (a & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f);
  const hi = (a & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010);
  return (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0);
}

// @ts-expect-error: decorator
@inline function sub_guarded(a: u64, b: u64): u64 {
  return ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080);
}

// @ts-expect-error: decorator
@inline function neg_guarded(a: u64): u64 {
  return (0x8080808080808080 - (a & 0x7f7f7f7f7f7f7f7f)) ^ (~a & 0x8080808080808080);
}

// @ts-expect-error: decorator
@inline function neg_add_nibble(a: u64): u64 { return add_nibble(~a, 0x0101010101010101); }

// @ts-expect-error: decorator
@inline function sign_mask(a: u64): u64 { return ((a & 0x8080808080808080) >> 7) * 0xff; }

// @ts-expect-error: decorator
@inline function abs_current(a: u64): u64 {
  const mask = sign_mask(a);
  const x = a ^ mask;
  return sub_guarded(x, mask);
}

// @ts-expect-error: decorator
@inline function abs_neg_select(a: u64): u64 {
  const mask = sign_mask(a);
  const neg = neg_guarded(a);
  return a ^ ((a ^ neg) & mask);
}

// @ts-expect-error: decorator
@inline function abs_neg_add_select(a: u64): u64 {
  const mask = sign_mask(a);
  const neg = neg_add_nibble(a);
  return a ^ ((a ^ neg) & mask);
}

// @ts-expect-error: decorator
@inline function abs_xor_add(a: u64): u64 {
  const mask = sign_mask(a);
  return add_nibble(a ^ mask, mask & 0x0101010101010101);
}

// @ts-expect-error: decorator
@inline function abs_xor_sub(a: u64): u64 {
  const mask = sign_mask(a);
  return add_nibble(a ^ mask, add_nibble(~mask, 0x0101010101010101));
}

// @ts-expect-error: decorator
@inline function abs_split32(a: u64): u64 {
  const alo = a as u32;
  const ahi = (a >> 32) as u32;
  const mlo = ((alo & 0x80808080) >> 7) * 0xff;
  const mhi = ((ahi & 0x80808080) >> 7) * 0xff;
  const xlo = alo ^ mlo;
  const xhi = ahi ^ mhi;
  const lo = ((xlo | 0x80808080) - (mlo & 0x7f7f7f7f)) ^ ((xlo ^ ~mlo) & 0x80808080);
  const hi = ((xhi | 0x80808080) - (mhi & 0x7f7f7f7f)) ^ ((xhi ^ ~mhi) & 0x80808080);
  return (lo as u64) | ((hi as u64) << 32);
}

// @ts-expect-error: decorator
@inline function checkAbs(a: u64): bool {
  const expected = i8x8_scalar.abs(a);
  const lib = i8x8.abs(a);
  const current = abs_current(a);
  const negSelect = abs_neg_select(a);
  const negAddSelect = abs_neg_add_select(a);
  const xorAdd = abs_xor_add(a);
  const xorSub = abs_xor_sub(a);
  const split32 = abs_split32(a);
  if (lib != expected || current != expected || negSelect != expected || negAddSelect != expected || xorAdd != expected || xorSub != expected || split32 != expected) {
    expect<u64>(lib).toBe(expected);
    expect<u64>(current).toBe(expected);
    expect<u64>(negSelect).toBe(expected);
    expect<u64>(negAddSelect).toBe(expected);
    expect<u64>(xorAdd).toBe(expected);
    expect<u64>(xorSub).toBe(expected);
    expect<u64>(split32).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.abs candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  if (!checkAbs(0)) return false;
  if (!checkAbs(0xffffffffffffffff)) return false;
  if (!checkAbs(0x8080808080808080)) return false;
  if (!checkAbs(0x7f7f7f7f7f7f7f7f)) return false;
  if (!checkAbs(0x00ff00ff00ff00ff)) return false;
  if (!checkAbs(0xfedcba9876543210)) return false;
  for (let i = 0; i < 64; i++) if (!checkAbs(nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

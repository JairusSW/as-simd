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
@inline function sub_lib(a: u64, b: u64): u64 { return i8x8.sub(a, b); }

// @ts-expect-error: decorator
@inline function sub_split32(a: u64, b: u64): u64 {
  const alo = a as u32, blo = b as u32;
  const ahi = (a >> 32) as u32, bhi = (b >> 32) as u32;
  const lo = ((alo | 0x80808080) - (blo & 0x7f7f7f7f)) ^ ((alo ^ ~blo) & 0x80808080);
  const hi = ((ahi | 0x80808080) - (bhi & 0x7f7f7f7f)) ^ ((ahi ^ ~bhi) & 0x80808080);
  return (lo as u64) | ((hi as u64) << 32);
}

// @ts-expect-error: decorator
@inline function sub_split32_reassoc(a: u64, b: u64): u64 {
  const alo = a as u32, ahi = (a >> 32) as u32;
  const blo = b as u32, bhi = (b >> 32) as u32;
  const bxlo = blo & 0x7f7f7f7f, bxhi = bhi & 0x7f7f7f7f;
  const lo = ((alo | 0x80808080) - bxlo) ^ ((alo ^ ~blo) & 0x80808080);
  const hi = ((ahi | 0x80808080) - bxhi) ^ ((ahi ^ ~bhi) & 0x80808080);
  return (lo as u64) | ((hi as u64) << 32);
}

// @ts-expect-error: decorator
@inline function sub_add_neg_nibble(a: u64, b: u64): u64 { return add_nibble(a, add_nibble(~b, 0x0101010101010101)); }

// @ts-expect-error: decorator
@inline function sub_add_neg_nibble_xor(a: u64, b: u64): u64 { return add_nibble(a, add_nibble(b ^ 0xffffffffffffffff, 0x0101010101010101)); }

// @ts-expect-error: decorator
@inline function checkSub(a: u64, b: u64): bool {
  const expected = i8x8_scalar.sub(a, b);
  const lib = sub_lib(a, b);
  const split32 = sub_split32(a, b);
  const split32Reassoc = sub_split32_reassoc(a, b);
  const addNegNibble = sub_add_neg_nibble(a, b);
  const addNegNibbleXor = sub_add_neg_nibble_xor(a, b);

  if (lib != expected || split32 != expected || split32Reassoc != expected || addNegNibble != expected || addNegNibbleXor != expected) {
    expect<u64>(lib).toBe(expected);
    expect<u64>(split32).toBe(expected);
    expect<u64>(split32Reassoc).toBe(expected);
    expect<u64>(addNegNibble).toBe(expected);
    expect<u64>(addNegNibbleXor).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.sub finalists", (seedValue: i32): bool => {
  state = <u64>seedValue;
  if (!checkSub(0, 0)) return false;
  if (!checkSub(0xffffffffffffffff, 0x0101010101010101)) return false;
  if (!checkSub(0x0000000000000000, 0x0101010101010101)) return false;
  if (!checkSub(0x8080808080808080, 0x0101010101010101)) return false;
  if (!checkSub(0x00ff00ff00ff00ff, 0xff00ff00ff00ff00)) return false;
  if (!checkSub(0xfedcba9876543210, 0x7766554433221100)) return false;
  for (let i = 0; i < 64; i++) if (!checkSub(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

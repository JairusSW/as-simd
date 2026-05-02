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
@inline function add_old(a: u64, b: u64): u64 {
  return ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
}

// @ts-expect-error: decorator
@inline function add_split16_candidate(a: u64, b: u64): u64 {
  const lo = ((a & 0x007f007f007f007f) + (b & 0x007f007f007f007f)) ^ ((a ^ b) & 0x0080008000800080);
  const hi = ((a & 0x7f007f007f007f00) + (b & 0x7f007f007f007f00)) ^ ((a ^ b) & 0x8000800080008000);
  return lo | hi;
}

// @ts-expect-error: decorator
@inline function add_nibble_candidate(a: u64, b: u64): u64 {
  const lo = (a & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f);
  const hi = (a & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010);
  return (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0);
}

// @ts-expect-error: decorator
@inline function checkAdd(a: u64, b: u64): bool {
  const expected = i8x8_scalar.add(a, b);
  const actual = i8x8.add(a, b);
  const split16 = add_split16_candidate(a, b);
  const nibble = add_nibble_candidate(a, b);
  const old = add_old(a, b);

  if (actual != expected || split16 != expected || nibble != expected || old != expected) {
    expect<u64>(actual).toBe(expected);
    expect<u64>(split16).toBe(expected);
    expect<u64>(nibble).toBe(expected);
    expect<u64>(old).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.add nibble candidate", (seedValue: i32): bool => {
  state = <u64>seedValue;

  if (!checkAdd(0, 0)) return false;
  if (!checkAdd(0xffffffffffffffff, 0x0101010101010101)) return false;
  if (!checkAdd(0x7f7f7f7f7f7f7f7f, 0x0101010101010101)) return false;
  if (!checkAdd(0x8080808080808080, 0x8080808080808080)) return false;
  if (!checkAdd(0x00ff00ff00ff00ff, 0xff00ff00ff00ff00)) return false;
  if (!checkAdd(0xfedcba9876543210, 0x7766554433221100)) return false;

  for (let i = 0; i < 64; i++) {
    if (!checkAdd(nextU64(), nextU64())) return false;
  }

  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

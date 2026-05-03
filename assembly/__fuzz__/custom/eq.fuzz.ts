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
@inline function eq_current(a: u64, b: u64): u64 {
  const x = a ^ b;
  return ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function eq_ne_inverse(a: u64, b: u64): u64 {
  const x = a ^ b;
  const mask = (((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | x) & 0x8080808080808080;
  return ~((mask >> 7) * 0xff);
}

// @ts-expect-error: decorator
@inline function eq_ne_xor_highbit(a: u64, b: u64): u64 {
  const x = a ^ b;
  const mask = ((((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | x) & 0x8080808080808080) ^ 0x8080808080808080;
  return (mask >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function eq_current_split32(a: u64, b: u64): u64 {
  const x = a ^ b;
  const lo = x as u32;
  const hi = (x >> 32) as u32;
  const ml = ((~(((lo & 0x7f7f7f7f) + 0x7f7f7f7f) & 0x80808080) & ~lo & 0x80808080) >> 7) * 0xff;
  const mh = ((~(((hi & 0x7f7f7f7f) + 0x7f7f7f7f) & 0x80808080) & ~hi & 0x80808080) >> 7) * 0xff;
  return (ml as u64) | ((mh as u64) << 32);
}

// @ts-expect-error: decorator
@inline function eq_current_split16(a: u64, b: u64): u64 {
  const x = a ^ b;
  const lo = x & 0x00ff00ff00ff00ff;
  const hi = (x >> 8) & 0x00ff00ff00ff00ff;
  const ml = ((~(((lo & 0x007f007f007f007f) + 0x007f007f007f007f) & 0x0080008000800080) & ~lo & 0x0080008000800080) >> 7) * 0xff;
  const mh = ((~(((hi & 0x007f007f007f007f) + 0x007f007f007f007f) & 0x0080008000800080) & ~hi & 0x0080008000800080) >> 7) * 0xff;
  return (ml & 0x00ff00ff00ff00ff) | ((mh & 0x00ff00ff00ff00ff) << 8);
}

// @ts-expect-error: decorator
@inline function eq_split_nonzero(a: u64, b: u64): u64 {
  const x = a ^ b;
  const lo = x as u32;
  const hi = (x >> 32) as u32;
  const ml = ((((lo & 0x7f7f7f7f) + 0x7f7f7f7f) | lo) & 0x80808080) >> 7;
  const mh = ((((hi & 0x7f7f7f7f) + 0x7f7f7f7f) | hi) & 0x80808080) >> 7;
  return ~(((ml * 0xff) as u64) | (((mh * 0xff) as u64) << 32));
}

// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool {
  const expected = i8x8_scalar.eq(a, b);
  const lib = i8x8.eq(a, b);
  const current = eq_current(a, b);
  const neInverse = eq_ne_inverse(a, b);
  const neXorHighbit = eq_ne_xor_highbit(a, b);
  const currentSplit32 = eq_current_split32(a, b);
  const currentSplit16 = eq_current_split16(a, b);
  const splitNonzero = eq_split_nonzero(a, b);
  if (
    lib != expected || current != expected || neInverse != expected ||
    neXorHighbit != expected || currentSplit32 != expected ||
    currentSplit16 != expected || splitNonzero != expected
  ) {
    expect<u64>(lib).toBe(expected);
    expect<u64>(current).toBe(expected);
    expect<u64>(neInverse).toBe(expected);
    expect<u64>(neXorHighbit).toBe(expected);
    expect<u64>(currentSplit32).toBe(expected);
    expect<u64>(currentSplit16).toBe(expected);
    expect<u64>(splitNonzero).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.eq candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const cases: u64[] = [
    0,
    1,
    0xffffffffffffffff,
    0x0001000100010001,
    0x0100010001000100,
    0x8080808080808080,
    0x7f7f7f7f7f7f7f7f,
    0xfedcba9876543210,
    0xfedcba8876543200,
  ];
  for (let i = 0; i < cases.length; i++) for (let j = 0; j < cases.length; j++) if (!check(cases[i], cases[j])) return false;
  for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

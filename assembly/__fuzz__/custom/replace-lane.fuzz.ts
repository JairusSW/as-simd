import { i8x8 } from "../../v64/lanes";
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
@inline function replace_switch(x: u64, idx: u8, value: i8): u64 {
  const v = (value as u64) & 0xff;
  switch (idx & 7) {
    case 0: return (x & 0xffffffffffffff00) | v;
    case 1: return (x & 0xffffffffffff00ff) | (v << 8);
    case 2: return (x & 0xffffffffff00ffff) | (v << 16);
    case 3: return (x & 0xffffffff00ffffff) | (v << 24);
    case 4: return (x & 0xffffff00ffffffff) | (v << 32);
    case 5: return (x & 0xffff00ffffffffff) | (v << 40);
    case 6: return (x & 0xff00ffffffffffff) | (v << 48);
    default: return (x & 0x00ffffffffffffff) | (v << 56);
  }
}

// @ts-expect-error: decorator
@inline function check(a: u64, idx: u8, value: i8): bool {
  const expected = i8x8_scalar.replace_lane(a, idx, value);
  const lib = i8x8.replace_lane(a, idx, value);
  const sw = replace_switch(a, idx, value);
  if (lib != expected || sw != expected) {
    expect<u64>(lib).toBe(expected);
    expect<u64>(sw).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.replace_lane candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const cases: u64[] = [0, 0xffffffffffffffff, 0xfedcba9876543210, 0x7766554433221100];
  for (let i = 0; i < cases.length; i++) for (let idx: u8 = 0; idx < 16; idx++) if (!check(cases[i], idx, nextU32() as i8)) return false;
  for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU32() as u8, nextU32() as i8)) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

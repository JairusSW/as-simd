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
@inline function add_sat_u_current(a: u64, b: u64): u64 {
  const sum = ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
  const d = ((sum | 0x8080808080808080) - (a & ~0x8080808080808080)) ^ ((sum ^ ~a) & 0x8080808080808080);
  const mask = ((((~sum & a) | (~(sum ^ a) & d)) & 0x8080808080808080) >> 7) * 0xff;
  return sum | mask;
}

// @ts-expect-error: decorator
@inline function add_sat_u_split16(a: u64, b: u64): u64 {
  const lo = (a & 0x00ff00ff00ff00ff) + (b & 0x00ff00ff00ff00ff);
  const hi = ((a >> 8) & 0x00ff00ff00ff00ff) + ((b >> 8) & 0x00ff00ff00ff00ff);
  const loCarry = lo & 0x0100010001000100;
  const hiCarry = hi & 0x0100010001000100;
  const loMask = loCarry - (loCarry >> 8);
  const hiMask = hiCarry * 0xff;
  return (lo & 0x00ff00ff00ff00ff) | ((hi & 0x00ff00ff00ff00ff) << 8) | loMask | hiMask;
}

// @ts-expect-error: decorator
@inline function add_sat_u_split32(a: u64, b: u64): u64 {
  const alo = a as u32;
  const blo = b as u32;
  const ahi = (a >> 32) as u32;
  const bhi = (b >> 32) as u32;
  const lo0 = (alo & 0x00ff00ff) + (blo & 0x00ff00ff);
  const hi0 = ((alo >> 8) & 0x00ff00ff) + ((blo >> 8) & 0x00ff00ff);
  const lo1 = (ahi & 0x00ff00ff) + (bhi & 0x00ff00ff);
  const hi1 = ((ahi >> 8) & 0x00ff00ff) + ((bhi >> 8) & 0x00ff00ff);
  const out0 = (lo0 & 0x00ff00ff) | ((hi0 & 0x00ff00ff) << 8) | ((lo0 & 0x01000100) - ((lo0 & 0x01000100) >> 8)) | ((hi0 & 0x01000100) * 0xff);
  const out1 = (lo1 & 0x00ff00ff) | ((hi1 & 0x00ff00ff) << 8) | ((lo1 & 0x01000100) - ((lo1 & 0x01000100) >> 8)) | ((hi1 & 0x01000100) * 0xff);
  return (out0 as u64) | ((out1 as u64) << 32);
}

// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool {
  const expected = i8x8_scalar.add_sat_u(a, b);
  const lib = i8x8.add_sat_u(a, b);
  const current = add_sat_u_current(a, b);
  const split16 = add_sat_u_split16(a, b);
  const split32 = add_sat_u_split32(a, b);
  if (lib != expected || current != expected || split16 != expected || split32 != expected) {
    expect<u64>(lib).toBe(expected);
    expect<u64>(current).toBe(expected);
    expect<u64>(split16).toBe(expected);
    expect<u64>(split32).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.add_sat_u candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const cases: u64[] = [0, 1, 0xffffffffffffffff, 0x00ff00ff00ff00ff, 0xff00ff00ff00ff00, 0xfedcba9876543210, 0x7766554433221100];
  for (let i = 0; i < cases.length; i++) for (let j = 0; j < cases.length; j++) if (!check(cases[i], cases[j])) return false;
  for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

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
@inline function lt_s_current(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
  return ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function lt_s_split16(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const dlo = ((ax | 0x0080008000800080) - (bx & 0x007f007f007f007f)) ^ ((ax ^ ~bx) & 0x0080008000800080);
  const dhi = ((ax | 0x8000800080008000) - (bx & 0x7f007f007f007f00)) ^ ((ax ^ ~bx) & 0x8000800080008000);
  const ml = (((~ax & bx) | (~(ax ^ bx) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~ax & bx) | (~(ax ^ bx) & dhi)) & 0x8000800080008000) >> 7;
  return ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
}

// @ts-expect-error: decorator
@inline function lt_s_split32(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const alo = ax as u32;
  const blo = bx as u32;
  const ahi = (ax >> 32) as u32;
  const bhi = (bx >> 32) as u32;
  const dlo = ((alo | 0x80808080) - (blo & 0x7f7f7f7f)) ^ ((alo ^ ~blo) & 0x80808080);
  const dhi = ((ahi | 0x80808080) - (bhi & 0x7f7f7f7f)) ^ ((ahi ^ ~bhi) & 0x80808080);
  const mlo = (((~alo & blo) | (~(alo ^ blo) & dlo)) & 0x80808080) >> 7;
  const mhi = (((~ahi & bhi) | (~(ahi ^ bhi) & dhi)) & 0x80808080) >> 7;
  return ((mlo * 0xff) as u64) | (((mhi * 0xff) as u64) << 32);
}

// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool {
  const expected = i8x8_scalar.lt_s(a, b);
  const lib = i8x8.lt_s(a, b);
  const current = lt_s_current(a, b);
  const split16 = lt_s_split16(a, b);
  const split32 = lt_s_split32(a, b);
  if (lib != expected || current != expected || split16 != expected || split32 != expected) {
    expect<u64>(lib).toBe(expected);
    expect<u64>(current).toBe(expected);
    expect<u64>(split16).toBe(expected);
    expect<u64>(split32).toBe(expected);
    return false;
  }
  return true;
}

fuzz("i8x8.lt_s candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  if (!check(0, 0)) return false;
  if (!check(0xffffffffffffffff, 0)) return false;
  if (!check(0x8080808080808080, 0x7f7f7f7f7f7f7f7f)) return false;
  if (!check(0x00ff00ff00ff00ff, 0xff00ff00ff00ff00)) return false;
  if (!check(0xfedcba9876543210, 0x7766554433221100)) return false;
  for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => { run(<i32>seed.u32()); });

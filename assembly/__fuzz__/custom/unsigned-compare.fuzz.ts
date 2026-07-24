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
@inline function lt_u_current(a: u64, b: u64): u64 {
  const d = ((a | 0x8080808080808080) - (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ ~b) & 0x8080808080808080);
  return ((((~a & b) | (~(a ^ b) & d)) & 0x8080808080808080) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function lt_u_split32(a: u64, b: u64): u64 {
  const alo = a as u32;
  const blo = b as u32;
  const ahi = (a >> 32) as u32;
  const bhi = (b >> 32) as u32;
  const dlo = ((alo | 0x80808080) - (blo & 0x7f7f7f7f)) ^ ((alo ^ ~blo) & 0x80808080);
  const dhi = ((ahi | 0x80808080) - (bhi & 0x7f7f7f7f)) ^ ((ahi ^ ~bhi) & 0x80808080);
  const mlo = (((~alo & blo) | (~(alo ^ blo) & dlo)) & 0x80808080) >> 7;
  const mhi = (((~ahi & bhi) | (~(ahi ^ bhi) & dhi)) & 0x80808080) >> 7;
  return ((mlo * 0xff) as u64) | (((mhi * 0xff) as u64) << 32);
}

// @ts-expect-error: decorator
@inline function lt_u_split16(a: u64, b: u64): u64 {
  const dlo = ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^ ((a ^ ~b) & 0x0080008000800080);
  const dhi = ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^ ((a ^ ~b) & 0x8000800080008000);
  const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7;
  return ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
}

// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool {
  const ltExpected = i8x8_scalar.lt_u(a, b);
  const gtExpected = i8x8_scalar.gt_u(a, b);
  const leExpected = i8x8_scalar.le_u(a, b);
  const geExpected = i8x8_scalar.ge_u(a, b);
  const ltLib = i8x8.lt_u(a, b);
  const gtLib = i8x8.gt_u(a, b);
  const leLib = i8x8.le_u(a, b);
  const geLib = i8x8.ge_u(a, b);
  const ltCurrent = lt_u_current(a, b);
  const gtCurrent = lt_u_current(b, a);
  const leCurrent = ~lt_u_current(b, a);
  const geCurrent = ~lt_u_current(a, b);
  const ltSplit32 = lt_u_split32(a, b);
  const gtSplit32 = lt_u_split32(b, a);
  const leSplit32 = ~lt_u_split32(b, a);
  const geSplit32 = ~lt_u_split32(a, b);
  const ltSplit16 = lt_u_split16(a, b);
  const gtSplit16 = lt_u_split16(b, a);
  const leSplit16 = ~lt_u_split16(b, a);
  const geSplit16 = ~lt_u_split16(a, b);
  if (
    ltLib != ltExpected || gtLib != gtExpected || leLib != leExpected || geLib != geExpected ||
    ltCurrent != ltExpected || gtCurrent != gtExpected || leCurrent != leExpected || geCurrent != geExpected ||
    ltSplit32 != ltExpected || gtSplit32 != gtExpected || leSplit32 != leExpected || geSplit32 != geExpected ||
    ltSplit16 != ltExpected || gtSplit16 != gtExpected || leSplit16 != leExpected || geSplit16 != geExpected
  ) {
    expect<u64>(ltLib).toBe(ltExpected);
    expect<u64>(gtLib).toBe(gtExpected);
    expect<u64>(leLib).toBe(leExpected);
    expect<u64>(geLib).toBe(geExpected);
    expect<u64>(ltCurrent).toBe(ltExpected);
    expect<u64>(gtCurrent).toBe(gtExpected);
    expect<u64>(leCurrent).toBe(leExpected);
    expect<u64>(geCurrent).toBe(geExpected);
    expect<u64>(ltSplit32).toBe(ltExpected);
    expect<u64>(gtSplit32).toBe(gtExpected);
    expect<u64>(leSplit32).toBe(leExpected);
    expect<u64>(geSplit32).toBe(geExpected);
    expect<u64>(ltSplit16).toBe(ltExpected);
    expect<u64>(gtSplit16).toBe(gtExpected);
    expect<u64>(leSplit16).toBe(leExpected);
    expect<u64>(geSplit16).toBe(geExpected);
    return false;
  }
  return true;
}

fuzz("i8x8 unsigned compare candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const cases: u64[] = [0, 1, 0xffffffffffffffff, 0x00ff00ff00ff00ff, 0xff00ff00ff00ff00, 0xfedcba9876543210, 0x7766554433221100];
  for (let i = 0; i < cases.length; i++) {
    for (let j = 0; j < cases.length; j++) if (!check(cases[i], cases[j])) return false;
  }
  for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

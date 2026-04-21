import { expect, fuzz, FuzzSeed } from "as-test";
import { v64 } from "../v64/v64";
import { i8x8 } from "../v64/i8x8";
import { i16x4 } from "../v64/i16x4";
import { i32x2 } from "../v64/i32x2";

let state: u64 = 0;
let checkId: i32 = 0;

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
@inline function check64(actual: u64, expected: u64): bool {
  if (actual != expected) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

fuzz("v64 generic integer parity", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const a = nextU64();
  const b = nextU64();
  const m = nextU64();
  const s = <i32>(nextU32() & 31);
  checkId = 1;

  if (!check64(v64.add<i8>(a, b), i8x8.add(a, b))) return false;
  if (!check64(v64.sub<i8>(a, b), i8x8.sub(a, b))) return false;
  if (!check64(v64.mul<i8>(a, b), i8x8.mul(a, b))) return false;
  if (!check64(v64.min<i8>(a, b), i8x8.min_s(a, b))) return false;
  if (!check64(v64.max<u8>(a, b), i8x8.max_u(a, b))) return false;
  if (!check64(v64.shl<i8>(a, s), i8x8.shl(a, s))) return false;
  if (!check64(v64.shr<u8>(a, s), i8x8.shr_u(a, s))) return false;
  if (!check64(v64.popcnt<i8>(a), i8x8.popcnt(a))) return false;
  if (!check64(v64.eq<i8>(a, b), i8x8.eq(a, b))) return false;
  if (!check64(v64.lt<i8>(a, b), i8x8.lt_s(a, b))) return false;
  if (!check64(v64.relaxed_laneselect<i8>(a, b, m), i8x8.relaxed_laneselect(a, b, m))) return false;

  if (!check64(v64.add<i16>(a, b), i16x4.add(a, b))) return false;
  if (!check64(v64.mul<i16>(a, b), i16x4.mul(a, b))) return false;
  if (!check64(v64.min<i16>(a, b), i16x4.min_s(a, b))) return false;
  if (!check64(v64.max<u16>(a, b), i16x4.max_u(a, b))) return false;
  if (!check64(v64.shl<i16>(a, s), i16x4.shl(a, s))) return false;
  if (!check64(v64.shr<u16>(a, s), i16x4.shr_u(a, s))) return false;
  if (!check64(v64.eq<i16>(a, b), i16x4.eq(a, b))) return false;
  if (!check64(v64.lt<i16>(a, b), i16x4.lt_s(a, b))) return false;

  if (!check64(v64.add<i32>(a, b), i32x2.add(a, b))) return false;
  if (!check64(v64.mul<i32>(a, b), i32x2.mul(a, b))) return false;
  if (!check64(v64.min<i32>(a, b), i32x2.min_s(a, b))) return false;
  if (!check64(v64.max<u32>(a, b), i32x2.max_u(a, b))) return false;
  if (!check64(v64.shl<i32>(a, s), i32x2.shl(a, s))) return false;
  if (!check64(v64.shr<u32>(a, s), i32x2.shr_u(a, s))) return false;
  if (!check64(v64.eq<i32>(a, b), i32x2.eq(a, b))) return false;
  if (!check64(v64.lt<i32>(a, b), i32x2.lt_s(a, b))) return false;

  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

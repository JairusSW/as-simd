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
  return ((<u64>nextU32()) << 32) | (<u64>nextU32());
}

// @ts-expect-error: decorator
@inline function splat_mul(x: i8): u64 {
  return ((x as u64) & 0xff) * 0x0101010101010101;
}

// @ts-expect-error: decorator
@inline function splat_or32(x: i8): u64 {
  const b = (x as u32) & 0xff;
  const w = b | (b << 8) | (b << 16) | (b << 24);
  return (w as u64) | ((w as u64) << 32);
}

// @ts-expect-error: decorator
@inline function splat_or64(x: i8): u64 {
  let y = (x as u64) & 0xff;
  y |= y << 8;
  y |= y << 16;
  return y | (y << 32);
}

// @ts-expect-error: decorator
@inline function min_s_current(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const d =
    ((ax | 0x8080808080808080) - (bx & ~0x8080808080808080)) ^
    ((ax ^ ~bx) & 0x8080808080808080);
  const mask =
    ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
  return b ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function min_s_split16(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const dlo =
    ((ax | 0x0080008000800080) - (bx & 0x007f007f007f007f)) ^
    ((ax ^ ~bx) & 0x0080008000800080);
  const dhi =
    ((ax | 0x8000800080008000) - (bx & 0x7f007f007f007f00)) ^
    ((ax ^ ~bx) & 0x8000800080008000);
  const ml = (((~ax & bx) | (~(ax ^ bx) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~ax & bx) | (~(ax ^ bx) & dhi)) & 0x8000800080008000) >> 7;
  const mask =
    ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
  return b ^ ((a ^ b) & mask);
}

// @ts-expect-error: decorator
@inline function add_sat_s_current(a: u64, b: u64): u64 {
  const sum =
    ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^
    ((a ^ b) & 0x8080808080808080);
  const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
  const mask = overflow * 0xff;
  const limit = (((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f;
  return (sum & ~mask) | (limit & mask);
}

// @ts-expect-error: decorator
@inline function add_sat_s_split16(a: u64, b: u64): u64 {
  const slo =
    ((a & 0x007f007f007f007f) + (b & 0x007f007f007f007f)) ^
    ((a ^ b) & 0x0080008000800080);
  const shi =
    ((a & 0x7f007f007f007f00) + (b & 0x7f007f007f007f00)) ^
    ((a ^ b) & 0x8000800080008000);
  const sum = (slo & 0x00ff00ff00ff00ff) | (shi & 0xff00ff00ff00ff00);
  const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
  const mask = overflow * 0xff;
  const limit = (((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f;
  return (sum & ~mask) | (limit & mask);
}

// @ts-expect-error: decorator
@inline function add_sat_s_split32(a: u64, b: u64): u64 {
  const alo = a as u32,
    blo = b as u32;
  const ahi = (a >> 32) as u32,
    bhi = (b >> 32) as u32;
  const slo =
    ((alo & 0x7f7f7f7f) + (blo & 0x7f7f7f7f)) ^ ((alo ^ blo) & 0x80808080);
  const shi =
    ((ahi & 0x7f7f7f7f) + (bhi & 0x7f7f7f7f)) ^ ((ahi ^ bhi) & 0x80808080);
  const sum = (slo as u64) | ((shi as u64) << 32);
  const overflow = (~(a ^ b) & (a ^ sum) & 0x8080808080808080) >> 7;
  const mask = overflow * 0xff;
  const limit = (((a & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f;
  return (sum & ~mask) | (limit & mask);
}

// @ts-expect-error: decorator
@inline function sub_sat_u_current(a: u64, b: u64): u64 {
  const diff =
    ((a | 0x8080808080808080) - (b & ~0x8080808080808080)) ^
    ((a ^ ~b) & 0x8080808080808080);
  const mask =
    ((((~a & b) | (~(a ^ b) & diff)) & 0x8080808080808080) >> 7) * 0xff;
  return diff & ~mask;
}

// @ts-expect-error: decorator
@inline function sub_sat_u_split16(a: u64, b: u64): u64 {
  const dlo =
    ((a | 0x0080008000800080) - (b & 0x007f007f007f007f)) ^
    ((a ^ ~b) & 0x0080008000800080);
  const dhi =
    ((a | 0x8000800080008000) - (b & 0x7f007f007f007f00)) ^
    ((a ^ ~b) & 0x8000800080008000);
  const diff = (dlo & 0x00ff00ff00ff00ff) | (dhi & 0xff00ff00ff00ff00);
  const ml = (((~a & b) | (~(a ^ b) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~a & b) | (~(a ^ b) & dhi)) & 0x8000800080008000) >> 7;
  const mask =
    ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
  return diff & ~mask;
}

// @ts-expect-error: decorator
@inline function shl_current(a: u64, b: i32): u64 {
  const shift = b & 7;
  return (a & (((0xff >> shift) as u64) * 0x0101010101010101)) << shift;
}

// @ts-expect-error: decorator
@inline function shl_switch(a: u64, b: i32): u64 {
  switch (b & 7) {
    case 0:
      return a;
    case 1:
      return (a & 0x7f7f7f7f7f7f7f7f) << 1;
    case 2:
      return (a & 0x3f3f3f3f3f3f3f3f) << 2;
    case 3:
      return (a & 0x1f1f1f1f1f1f1f1f) << 3;
    case 4:
      return (a & 0x0f0f0f0f0f0f0f0f) << 4;
    case 5:
      return (a & 0x0707070707070707) << 5;
    case 6:
      return (a & 0x0303030303030303) << 6;
    default:
      return (a & 0x0101010101010101) << 7;
  }
}

// @ts-expect-error: decorator
@inline function bitmask_lane_current(a: u64): u64 {
  return (
    (((a & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | a) & 0x8080808080808080
  );
}

// @ts-expect-error: decorator
@inline function bitmask_lane_split32(a: u64): u64 {
  const lo = (((a as u32) & 0x7f7f7f7f) + 0x7f7f7f7f) | (a as u32);
  const hi =
    ((((a >> 32) as u32) & 0x7f7f7f7f) + 0x7f7f7f7f) | ((a >> 32) as u32);
  return ((lo & 0x80808080) as u64) | (((hi & 0x80808080) as u64) << 32);
}

// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool {
  const sx = a as i8;
  if (
    i8x8.splat(sx) != i8x8_scalar.splat(sx) ||
    splat_mul(sx) != i8x8_scalar.splat(sx) ||
    splat_or32(sx) != i8x8_scalar.splat(sx) ||
    splat_or64(sx) != i8x8_scalar.splat(sx) ||
    i8x8.min_s(a, b) != i8x8_scalar.min_s(a, b) ||
    min_s_current(a, b) != i8x8_scalar.min_s(a, b) ||
    min_s_split16(a, b) != i8x8_scalar.min_s(a, b) ||
    i8x8.add_sat_s(a, b) != i8x8_scalar.add_sat_s(a, b) ||
    add_sat_s_current(a, b) != i8x8_scalar.add_sat_s(a, b) ||
    add_sat_s_split16(a, b) != i8x8_scalar.add_sat_s(a, b) ||
    add_sat_s_split32(a, b) != i8x8_scalar.add_sat_s(a, b) ||
    i8x8.sub_sat_u(a, b) != i8x8_scalar.sub_sat_u(a, b) ||
    sub_sat_u_current(a, b) != i8x8_scalar.sub_sat_u(a, b) ||
    sub_sat_u_split16(a, b) != i8x8_scalar.sub_sat_u(a, b) ||
    i8x8.shl(a, b as i32) != i8x8_scalar.shl(a, b as i32) ||
    shl_current(a, b as i32) != i8x8_scalar.shl(a, b as i32) ||
    shl_switch(a, b as i32) != i8x8_scalar.shl(a, b as i32) ||
    i8x8.bitmask_lane(a) != i8x8_scalar.bitmask_lane(a) ||
    bitmask_lane_current(a) != i8x8_scalar.bitmask_lane(a) ||
    bitmask_lane_split32(a) != i8x8_scalar.bitmask_lane(a)
  ) {
    expect<u64>(i8x8.splat(sx)).toBe(i8x8_scalar.splat(sx));
    expect<u64>(i8x8.min_s(a, b)).toBe(i8x8_scalar.min_s(a, b));
    expect<u64>(i8x8.add_sat_s(a, b)).toBe(i8x8_scalar.add_sat_s(a, b));
    expect<u64>(i8x8.sub_sat_u(a, b)).toBe(i8x8_scalar.sub_sat_u(a, b));
    expect<u64>(i8x8.shl(a, b as i32)).toBe(i8x8_scalar.shl(a, b as i32));
    expect<u64>(i8x8.bitmask_lane(a)).toBe(i8x8_scalar.bitmask_lane(a));
    return false;
  }
  return true;
}

fuzz("missing i8x8 candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const cases: u64[] = [
    0, 1, 0x7f7f7f7f7f7f7f7f, 0x8080808080808080, 0xffffffffffffffff,
    0x00ff00ff00ff00ff, 0xfedcba9876543210, 0x7766554433221100,
  ];
  for (let i = 0; i < cases.length; i++)
    for (let j = 0; j < cases.length; j++)
      if (!check(cases[i], cases[j])) return false;
  for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

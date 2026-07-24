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
@inline function sat_s(x: i32): u64 {
  return ((<u64>(x > 127 ? 127 : x < -128 ? -128 : x)) as u64) & 0xff;
}
// @ts-expect-error: decorator
@inline function sat_u(x: i32): u64 {
  return (<u64>(x < 0 ? 0 : x > 255 ? 255 : x)) & 0xff;
}
// @ts-expect-error: decorator
@inline function lane16(x: u64, i: i32): i32 {
  return <i16>((x >> (i << 4)) & 0xffff);
}
// @ts-expect-error: decorator
@inline function narrow_s_scalar(a: u64, b: u64): u64 {
  return (
    sat_s(lane16(a, 0)) |
    (sat_s(lane16(a, 1)) << 8) |
    (sat_s(lane16(a, 2)) << 16) |
    (sat_s(lane16(a, 3)) << 24) |
    (sat_s(lane16(b, 0)) << 32) |
    (sat_s(lane16(b, 1)) << 40) |
    (sat_s(lane16(b, 2)) << 48) |
    (sat_s(lane16(b, 3)) << 56)
  );
}
// @ts-expect-error: decorator
@inline function narrow_u_scalar(a: u64, b: u64): u64 {
  return (
    sat_u(lane16(a, 0)) |
    (sat_u(lane16(a, 1)) << 8) |
    (sat_u(lane16(a, 2)) << 16) |
    (sat_u(lane16(a, 3)) << 24) |
    (sat_u(lane16(b, 0)) << 32) |
    (sat_u(lane16(b, 1)) << 40) |
    (sat_u(lane16(b, 2)) << 48) |
    (sat_u(lane16(b, 3)) << 56)
  );
}
// @ts-expect-error: decorator
@inline function check(a: u64, b: u64): bool {
  const es = i8x8_scalar.narrow_i16x4_s(a, b);
  const eu = i8x8_scalar.narrow_i16x4_u(a, b);
  const ls = i8x8.narrow_i16x4_s(a, b);
  const lu = i8x8.narrow_i16x4_u(a, b);
  const ss = narrow_s_scalar(a, b);
  const su = narrow_u_scalar(a, b);
  if (ls != es || lu != eu || ss != es || su != eu) {
    expect<u64>(ls).toBe(es);
    expect<u64>(lu).toBe(eu);
    expect<u64>(ss).toBe(es);
    expect<u64>(su).toBe(eu);
    return false;
  }
  return true;
}
fuzz("i8x8.narrow candidates", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const cases: u64[] = [
    0, 0xffffffffffffffff, 0x007f008000ff0100, 0x80007fff00ff0000,
    0xfedcba9876543210,
  ];
  for (let i = 0; i < cases.length; i++)
    for (let j = 0; j < cases.length; j++)
      if (!check(cases[i], cases[j])) return false;
  for (let i = 0; i < 64; i++) if (!check(nextU64(), nextU64())) return false;
  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

import { describe, expect, test } from "as-test";
import { v64 } from "../v64";
import { i8x8 } from "../v64/i8x8";
import { i16x4 } from "../v64/i16x4";
import { i32x2 } from "../v64/i32x2";

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

describe("v64 generic api", () => {
  test("constructor", () => {
    const x = v64(1, 2, 3, 4, 5, 6, 7, 8);
    expect<i32>(i8x8.extract_lane_u(x, 0)).toBe(1);
    expect<i32>(i8x8.extract_lane_u(x, 7)).toBe(8);
  });

  test("integer parity", () => {
    state = 0x243f6a8885a308d3;
    for (let i = 0; i < 256; i++) {
      const a = nextU64();
      const b = nextU64();
      const s = <i32>(nextU32() & 31);

      expect<u64>(v64.add<i8>(a, b)).toBe(i8x8.add(a, b));
      expect<u64>(v64.sub<i8>(a, b)).toBe(i8x8.sub(a, b));
      expect<u64>(v64.mul<i8>(a, b)).toBe(i8x8.mul(a, b));
      expect<u64>(v64.min<i8>(a, b)).toBe(i8x8.min_s(a, b));
      expect<u64>(v64.max<u8>(a, b)).toBe(i8x8.max_u(a, b));
      expect<u64>(v64.add_sat<i8>(a, b)).toBe(i8x8.add_sat_s(a, b));
      expect<u64>(v64.sub_sat<u8>(a, b)).toBe(i8x8.sub_sat_u(a, b));
      expect<u64>(v64.shl<i8>(a, s)).toBe(i8x8.shl(a, s));
      expect<u64>(v64.shr<i8>(a, s)).toBe(i8x8.shr_s(a, s));
      expect<u64>(v64.popcnt<i8>(a)).toBe(i8x8.popcnt(a));
      expect<u64>(v64.eq<i8>(a, b)).toBe(i8x8.eq(a, b));
      expect<u64>(v64.lt<u8>(a, b)).toBe(i8x8.lt_u(a, b));
      const m = nextU64();
      expect<u64>(v64.relaxed_laneselect<i8>(a, b, m)).toBe(i8x8.relaxed_laneselect(a, b, m));

      expect<u64>(v64.add<i16>(a, b)).toBe(i16x4.add(a, b));
      expect<u64>(v64.mul<i16>(a, b)).toBe(i16x4.mul(a, b));
      expect<u64>(v64.min<i16>(a, b)).toBe(i16x4.min_s(a, b));
      expect<u64>(v64.max<u16>(a, b)).toBe(i16x4.max_u(a, b));
      expect<u64>(v64.shl<i16>(a, s)).toBe(i16x4.shl(a, s));
      expect<u64>(v64.shr<u16>(a, s)).toBe(i16x4.shr_u(a, s));
      expect<u64>(v64.eq<i16>(a, b)).toBe(i16x4.eq(a, b));
      expect<u64>(v64.lt<i16>(a, b)).toBe(i16x4.lt_s(a, b));

      expect<u64>(v64.add<i32>(a, b)).toBe(i32x2.add(a, b));
      expect<u64>(v64.mul<i32>(a, b)).toBe(i32x2.mul(a, b));
      expect<u64>(v64.min<i32>(a, b)).toBe(i32x2.min_s(a, b));
      expect<u64>(v64.max<u32>(a, b)).toBe(i32x2.max_u(a, b));
      expect<u64>(v64.shl<i32>(a, s)).toBe(i32x2.shl(a, s));
      expect<u64>(v64.shr<u32>(a, s)).toBe(i32x2.shr_u(a, s));
      expect<u64>(v64.eq<i32>(a, b)).toBe(i32x2.eq(a, b));
      expect<u64>(v64.lt<i32>(a, b)).toBe(i32x2.lt_s(a, b));
    }
  });

  test("memory and lane ops", () => {
    const buf = new Uint8Array(16);
    for (let i = 0; i < 16; i++) buf[i] = <u8>(i + 1);
    const p = changetype<usize>(buf.dataStart);
    const x = v64.load(p);
    expect<i32>(v64.extract_lane<u8>(x, 0)).toBe(1);
    expect<i32>(v64.extract_lane<u8>(x, 7)).toBe(8);

    const y = v64.load8_lane(p + 12, x, 2);
    expect<i32>(v64.extract_lane<u8>(y, 2)).toBe(13);

    const out = new Uint8Array(8);
    const op = changetype<usize>(out.dataStart);
    v64.store(op, y);
    expect<i32>(out[0]).toBe(v64.extract_lane<u8>(y, 0));
    expect<i32>(out[7]).toBe(v64.extract_lane<u8>(y, 7));
  });
});

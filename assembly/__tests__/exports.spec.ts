import { describe, expect, test } from "as-test";
import {
  v32, v64, v128, v256, v512, v128_swar,
  i8x32, i16x16, i32x8, i64x4, f32x8, f64x4,
  i8x64, i16x32, i32x16, i64x8, f32x16, f64x8,
} from "as-simd";
import { v32_kernels } from "../v32/kernels";
import { v64_kernels } from "../v64/kernels";

describe("public package exports", () => {
  test("all vector widths resolve from the package root", () => {
    expect<u32>(v32.add<u8>(0x01020304, 0x01010101)).toBe(0x02030405);
    expect<u64>(v64.add<u16>(0x0001000200030004, 0x0001000100010001)).toBe(0x0002000300040005);
    expect<u32>(v32_kernels.add<u8>(0x01020304, 0x01010101)).toBe(0x02030405);
    expect<u64>(v64_kernels.add<u16>(0x0001000200030004, 0x0001000100010001)).toBe(0x0002000300040005);

    const lo = v128_swar.splat<i32>(7), hi = v128_swar.take_hi();
    expect<u64>(lo).toBe(0x0000000700000007);
    expect<u64>(hi).toBe(0x0000000700000007);

    const a128 = v128.splat<i32>(4);
    const a256 = v256.splat<i16>(5);
    const a512 = v512.splat<i8>(6);
    expect<i32>(v128.extract_lane<i32>(a128, 3)).toBe(4);
    expect<i32>(v256.extract_lane<i16>(a256, 15)).toBe(5);
    expect<i32>(v512.extract_lane<i8>(a512, 63)).toBe(6);
  });

  test("all v256 and v512 lane namespaces resolve from the package root", () => {
    expect<i32>(i8x32.extract_lane_s(i8x32.add(i8x32.splat(2), i8x32.splat(3)), 31)).toBe(5);
    expect<i32>(i16x16.extract_lane_s(i16x16.mul(i16x16.splat(6), i16x16.splat(7)), 15)).toBe(42);
    expect<i32>(i32x8.extract_lane(i32x8.sub(i32x8.splat(50), i32x8.splat(8)), 7)).toBe(42);
    expect<i64>(i64x4.extract_lane(i64x4.add(i64x4.splat(40), i64x4.splat(2)), 3)).toBe(42);
    expect<f32>(f32x8.extract_lane(f32x8.div(f32x8.splat(84), f32x8.splat(2)), 7)).toBe(42);
    expect<f64>(f64x4.extract_lane(f64x4.sqrt(f64x4.splat(1764)), 3)).toBe(42);

    expect<i32>(i8x64.extract_lane_s(i8x64.add(i8x64.splat(2), i8x64.splat(3)), 63)).toBe(5);
    expect<i32>(i16x32.extract_lane_s(i16x32.mul(i16x32.splat(6), i16x32.splat(7)), 31)).toBe(42);
    expect<i32>(i32x16.extract_lane(i32x16.sub(i32x16.splat(50), i32x16.splat(8)), 15)).toBe(42);
    expect<i64>(i64x8.extract_lane(i64x8.add(i64x8.splat(40), i64x8.splat(2)), 7)).toBe(42);
    expect<f32>(f32x16.extract_lane(f32x16.div(f32x16.splat(84), f32x16.splat(2)), 15)).toBe(42);
    expect<f64>(f64x8.extract_lane(f64x8.sqrt(f64x8.splat(1764)), 7)).toBe(42);
  });
});

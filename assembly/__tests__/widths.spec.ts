import { describe, expect, test } from "as-test";
import { v32 } from "../v32/v32";
import { v64 } from "../v64/v64";
import { v128_swar } from "../v128/v128_swar";
import { v256 } from "../v256/value";
import { i8x32, i16x16 } from "../v256/lanes";
import { v512 } from "../v512/value";
import { i8x64, i16x32 } from "../v512/lanes";
import { wrf } from "../wide/regfile";
import { v256r, v512r } from "../wide/wide";

let state: u64 = 0;
// @ts-expect-error: decorator
@inline function nextU64(): u64 {
  state += 0x9e3779b97f4a7c15;
  let z = state;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}

describe("32 through 512 bit vectors", () => {
  test("allocation-lean wide values preserve immutable semantics", () => {
    const a256 = v256.splat<i16>(30000), b256 = v256.splat<i16>(3000);
    const sum256 = v256.add_sat<i16>(a256, b256);
    expect<i32>(v256.extract_lane<i16>(sum256, 15)).toBe(32767);
    expect<i32>(v256.extract_lane<i16>(a256, 15)).toBe(30000);
    const changed256 = v256.replace_lane<i16>(sum256, 14, -1234);
    expect<i32>(v256.extract_lane<i16>(changed256, 14)).toBe(-1234);
    expect<i32>(v256.extract_lane<i16>(sum256, 14)).toBe(32767);
    expect<bool>(v256.all_true<i16>(v256.gt<i16>(sum256, b256))).toBe(true);

    const a512 = v512.splat<i8>(12), b512 = v512.splat<i8>(-3);
    const product512 = v512.mul<i8>(a512, b512);
    expect<i32>(v512.extract_lane<i8>(product512, 63)).toBe(-36);
    const selected512 = v512.bitselect(a512, b512, v512.splat<i8>(-1));
    expect<i32>(v512.extract_lane<i8>(selected512, 0)).toBe(12);
    expect<i32>(v512.extract_lane<i8>(selected512, 63)).toBe(12);
    expect<bool>(v512.any_true(product512)).toBe(true);

    const memory = new Uint64Array(8);
    v512.store(changetype<usize>(memory.dataStart), product512);
    const loaded = v512.load(changetype<usize>(memory.dataStart));
    expect<i32>(v512.extract_lane<i8>(loaded, 31)).toBe(-36);
  });

  test("public wide values preserve full-width lanes, masks, and shuffles", () => {
    let bytes256 = v256.splat<i8>(1);
    bytes256 = v256.replace_lane<i8>(bytes256, 0, -1);
    bytes256 = v256.replace_lane<i8>(bytes256, 17, -2);
    bytes256 = v256.replace_lane<i8>(bytes256, 31, -3);
    expect<u32>(v256.bitmask<i8>(bytes256)).toBe(0x80020001);

    let bytes512 = v512.splat<i8>(1);
    bytes512 = v512.replace_lane<i8>(bytes512, 0, -1);
    bytes512 = v512.replace_lane<i8>(bytes512, 33, -2);
    bytes512 = v512.replace_lane<i8>(bytes512, 63, -3);
    expect<u64>(v512.bitmask<i8>(bytes512)).toBe(0x8000000200000001);

    let a256 = v256.splat<i64>(0), b256 = v256.splat<i64>(0);
    for (let i: u8 = 0; i < 4; i++) {
      a256 = v256.replace_lane<i64>(a256, i, 10 + i);
      b256 = v256.replace_lane<i64>(b256, i, 20 + i);
    }
    const mixed256 = v256.shuffle<i64>(a256, b256, 3, 4, 1, 7);
    expect<i64>(v256.extract_lane<i64>(mixed256, 0)).toBe(13);
    expect<i64>(v256.extract_lane<i64>(mixed256, 1)).toBe(20);
    expect<i64>(v256.extract_lane<i64>(mixed256, 2)).toBe(11);
    expect<i64>(v256.extract_lane<i64>(mixed256, 3)).toBe(23);

    let a512 = v512.splat<i64>(0), b512 = v512.splat<i64>(0);
    for (let i: u8 = 0; i < 8; i++) {
      a512 = v512.replace_lane<i64>(a512, i, 30 + i);
      b512 = v512.replace_lane<i64>(b512, i, 40 + i);
    }
    const mixed512 = v512.shuffle<i64>(a512, b512, 7, 8, 5, 10, 3, 12, 1, 14);
    expect<i64>(v512.extract_lane<i64>(mixed512, 0)).toBe(37);
    expect<i64>(v512.extract_lane<i64>(mixed512, 1)).toBe(40);
    expect<i64>(v512.extract_lane<i64>(mixed512, 3)).toBe(42);
    expect<i64>(v512.extract_lane<i64>(mixed512, 7)).toBe(46);
  });

  test("wide lane namespaces widen and narrow across the full vector", () => {
    let bytes256 = i8x32.splat(0);
    for (let i: u8 = 0; i < 32; i++) bytes256 = i8x32.replace_lane(bytes256, i, i as i8);
    const low256 = i16x16.extend_low_i8x32_s(bytes256);
    const high256 = i16x16.extend_high_i8x32_s(bytes256);
    expect<i32>(i16x16.extract_lane_s(low256, 15)).toBe(15);
    expect<i32>(i16x16.extract_lane_s(high256, 0)).toBe(16);
    expect<i32>(i16x16.extract_lane_s(high256, 15)).toBe(31);
    const joined256 = i8x32.narrow_i16x16_s(low256, high256);
    expect<i32>(i8x32.extract_lane_s(joined256, 15)).toBe(15);
    expect<i32>(i8x32.extract_lane_s(joined256, 16)).toBe(16);
    expect<i32>(i8x32.extract_lane_s(joined256, 31)).toBe(31);
    let mask256 = i8x32.splat(0);
    mask256 = i8x32.replace_lane(mask256, 0, 31);
    expect<i32>(i8x32.extract_lane_u(i8x32.swizzle(bytes256, mask256), 0)).toBe(31);

    let bytes512 = i8x64.splat(0);
    for (let i: u8 = 0; i < 64; i++) bytes512 = i8x64.replace_lane(bytes512, i, i as i8);
    const low512 = i16x32.extend_low_i8x64_s(bytes512);
    const high512 = i16x32.extend_high_i8x64_s(bytes512);
    expect<i32>(i16x32.extract_lane_s(low512, 31)).toBe(31);
    expect<i32>(i16x32.extract_lane_s(high512, 0)).toBe(32);
    expect<i32>(i16x32.extract_lane_s(high512, 31)).toBe(63);
    const joined512 = i8x64.narrow_i16x32_s(low512, high512);
    expect<i32>(i8x64.extract_lane_s(joined512, 31)).toBe(31);
    expect<i32>(i8x64.extract_lane_s(joined512, 32)).toBe(32);
    expect<i32>(i8x64.extract_lane_s(joined512, 63)).toBe(63);
    let mask512 = i8x64.splat(0);
    mask512 = i8x64.replace_lane(mask512, 0, 63);
    expect<i32>(i8x64.extract_lane_u(i8x64.swizzle(bytes512, mask512), 0)).toBe(63);
  });

  test("v32 uses the optimized low half of v64", () => {
    state = 0x13198a2e03707344;
    for (let i = 0; i < 256; i++) {
      const a = nextU64() as u32, b = nextU64() as u32;
      const s = nextU64() as i32;
      let mismatches = 0;
      mismatches += v32.add<i8>(a, b) == (v64.add<i8>(a, b) as u32) ? 0 : 1;
      mismatches += v32.sub<i16>(a, b) == (v64.sub<i16>(a, b) as u32) ? 0 : 1;
      mismatches += v32.mul<i8>(a, b) == (v64.mul<i8>(a, b) as u32) ? 0 : 1;
      mismatches += v32.min<i8>(a, b) == (v64.min<i8>(a, b) as u32) ? 0 : 1;
      mismatches += v32.max<u16>(a, b) == (v64.max<u16>(a, b) as u32) ? 0 : 1;
      mismatches += v32.shr<u16>(a, s) == (v64.shr<u16>(a, s) as u32) ? 0 : 1;
      mismatches += v32.lt<u8>(a, b) == (v64.lt<u8>(a, b) as u32) ? 0 : 1;
      expect<i32>(mismatches).toBe(0);
    }
    const memory = new Uint32Array(2);
    memory[0] = 0x89abcdef;
    const loaded = v32.load(changetype<usize>(memory.dataStart));
    expect<u32>(loaded).toBe(0x89abcdef);
    v32.store(changetype<usize>(memory.dataStart), 0x12345678, 4);
    expect<u32>(memory[1]).toBe(0x12345678);
  });

  test("v256r processes two independent 128-bit chunks", () => {
    state = 0xa4093822299f31d0;
    for (let c: u32 = 0; c < 2; c++) {
      wrf.set128(0, c, nextU64(), nextU64());
      wrf.set128(1, c, nextU64(), nextU64());
    }
    v256r.add<i16>(2, 0, 1);
    for (let c: u32 = 0; c < 2; c++) {
      const lo = v128_swar.add<i16>(wrf.lo(0, c), wrf.hi(0, c), wrf.lo(1, c), wrf.hi(1, c));
      const hi = v128_swar.take_hi();
      expect<u64>(wrf.lo(2, c)).toBe(lo);
      expect<u64>(wrf.hi(2, c)).toBe(hi);
    }
  });

  test("v512r processes four chunks and supports in-place aliases", () => {
    state = 0x082efa98ec4e6c89;
    for (let c: u32 = 0; c < 4; c++) {
      const lo = nextU64(), hi = nextU64();
      wrf.set128(0, c, lo, hi);
      wrf.set128(3, c, lo, hi);
      wrf.set128(1, c, nextU64(), nextU64());
    }
    v512r.sub<i32>(2, 0, 1);
    for (let c: u32 = 0; c < 4; c++) {
      const lo = v128_swar.sub<i32>(wrf.lo(0, c), wrf.hi(0, c), wrf.lo(1, c), wrf.hi(1, c));
      const hi = v128_swar.take_hi();
      expect<u64>(wrf.lo(2, c)).toBe(lo);
      expect<u64>(wrf.hi(2, c)).toBe(hi);
    }

    v512r.xor(0, 0, 1);
    for (let c: u32 = 0; c < 4; c++) {
      expect<u64>(wrf.lo(0, c)).toBe(wrf.lo(3, c) ^ wrf.lo(1, c));
      expect<u64>(wrf.hi(0, c)).toBe(wrf.hi(3, c) ^ wrf.hi(1, c));
    }
    expect<bool>(v512r.any_true(0)).toBe(true);
  });

  test("wide lane operations and 64-bit byte mask", () => {
    v512r.splat<i8>(0, 1);
    expect<bool>(v512r.all_true<i8>(0)).toBe(true);
    expect<u64>(v512r.bitmask<i8>(0)).toBe(0);
    v512r.replace_lane<i8>(1, 0, 63, -1);
    expect<i32>(v512r.extract_lane<i8>(1, 63)).toBe(-1);
    expect<i32>(v512r.extract_lane<i8>(1, 0)).toBe(1);
    expect<u64>(v512r.bitmask<i8>(1)).toBe(0x8000000000000000);

    v512r.replace_lane<i8>(0, 0, 17, -7);
    expect<i32>(v512r.extract_lane<i8>(0, 17)).toBe(-7);
    expect<i32>(v512r.extract_lane<i8>(0, 16)).toBe(1);
    expect<i32>(v512r.extract_lane<i8>(0, 18)).toBe(1);

    v256r.splat<i16>(2, 32000);
    v256r.splat<i16>(3, 1000);
    v256r.add_sat<i16>(4, 2, 3);
    expect<i32>(v256r.extract_lane<i16>(4, 15)).toBe(32767);
    v256r.gt<i16>(5, 4, 3);
    expect<bool>(v256r.all_true<i16>(5)).toBe(true);
    v256r.replace_lane<i16>(4, 4, 31, -1234); // index wraps within 16 lanes
    expect<i32>(v256r.extract_lane<i16>(4, 15)).toBe(-1234);
    expect<i32>(v256r.extract_lane<i16>(4, 14)).toBe(32767);

    v256r.splat<f32>(6, 1.25);
    v256r.replace_lane<f32>(7, 6, 5, -3.5);
    expect<f32>(v256r.extract_lane<f32>(7, 5)).toBe(-3.5);
    expect<f32>(v256r.extract_lane<f32>(7, 4)).toBe(1.25);

    v512r.splat<u64>(8, 0x0123456789abcdef);
    v512r.replace_lane<u64>(9, 8, 7, 0xfedcba9876543210);
    expect<u64>(v512r.extract_lane<u64>(9, 7)).toBe(0xfedcba9876543210);
    expect<u64>(v512r.extract_lane<u64>(9, 6)).toBe(0x0123456789abcdef);
  });

  test("dedicated wide I/O honors runtime byte offsets", () => {
    const memory = new Uint64Array(20);
    for (let i = 0; i < 20; i++) memory[i] = 0x0102030405060708 + i as u64;
    const p = changetype<usize>(memory.dataStart);

    v256r.load(6, p, 8);
    for (let i: u32 = 0; i < 4; i++) expect<u64>(load<u64>(wrf.addr(6) + ((i as usize) << 3))).toBe(memory[i + 1]);
    v256r.store(p, 6, 72);
    for (let i: u32 = 0; i < 4; i++) expect<u64>(memory[i + 9]).toBe(memory[i + 1]);

    v512r.load(7, p, 16);
    for (let i: u32 = 0; i < 8; i++) expect<u64>(load<u64>(wrf.addr(7) + ((i as usize) << 3))).toBe(memory[i + 2]);
    v512r.store(p, 7, 88);
    for (let i: u32 = 0; i < 8; i++) expect<u64>(memory[i + 11]).toBe(memory[i + 2]);
  });
});

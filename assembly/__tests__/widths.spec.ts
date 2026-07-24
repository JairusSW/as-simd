import { describe, expect, test } from "as-test";
import { v32 } from "../v32/value";
import { v64 } from "../v64/value";
import { v128_swar } from "../v128/v128_swar";
import { v256 } from "../v256/value";
import { i8x32, i16x16, i32x8, i64x4 } from "../v256/lanes";
import { v512 } from "../v512/value";
import { i8x64, i16x32, i32x16, i64x8 } from "../v512/lanes";
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

  test("i64x4 and i64x8 agree with scalar edge-value semantics", () => {
    let a4 = i64x4.splat(0), b4 = i64x4.splat(0), m4 = i64x4.splat(0);
    const av4 = [i64.MIN_VALUE, -1, 0, i64.MAX_VALUE];
    const bv4 = [1 as i64, i64.MIN_VALUE, -7, 3];
    for (let i: u8 = 0; i < 4; i++) {
      a4 = i64x4.replace_lane(a4, i, av4[i]);
      b4 = i64x4.replace_lane(b4, i, bv4[i]);
      m4 = i64x4.replace_lane(m4, i, (i & 1) == 0 ? -1 : 0);
    }
    const add4 = i64x4.add(a4, b4), sub4 = i64x4.sub(a4, b4), mul4 = i64x4.mul(a4, b4);
    const abs4 = i64x4.abs(a4), neg4 = i64x4.neg(a4);
    const shl4 = i64x4.shl(a4, 67), shrs4 = i64x4.shr_s(a4, 67), shru4 = i64x4.shr_u(a4, 67);
    const eq4 = i64x4.eq(a4, b4), ne4 = i64x4.ne(a4, b4);
    const lt4 = i64x4.lt_s(a4, b4), le4 = i64x4.le_s(a4, b4);
    const gt4 = i64x4.gt_s(a4, b4), ge4 = i64x4.ge_s(a4, b4);
    const sel4 = i64x4.relaxed_laneselect(a4, b4, m4);
    for (let i: u8 = 0; i < 4; i++) {
      const a = av4[i], b = bv4[i];
      expect<i64>(i64x4.extract_lane(add4, i)).toBe(a + b);
      expect<i64>(i64x4.extract_lane(sub4, i)).toBe(a - b);
      expect<i64>(i64x4.extract_lane(mul4, i)).toBe(a * b);
      expect<i64>(i64x4.extract_lane(abs4, i)).toBe(a < 0 ? -a : a);
      expect<i64>(i64x4.extract_lane(neg4, i)).toBe(-a);
      expect<i64>(i64x4.extract_lane(shl4, i)).toBe(a << 67);
      expect<i64>(i64x4.extract_lane(shrs4, i)).toBe(a >> 67);
      expect<u64>(i64x4.extract_lane(shru4, i) as u64).toBe((a as u64) >> 67);
      expect<i64>(i64x4.extract_lane(eq4, i)).toBe(a == b ? -1 : 0);
      expect<i64>(i64x4.extract_lane(ne4, i)).toBe(a != b ? -1 : 0);
      expect<i64>(i64x4.extract_lane(lt4, i)).toBe(a < b ? -1 : 0);
      expect<i64>(i64x4.extract_lane(le4, i)).toBe(a <= b ? -1 : 0);
      expect<i64>(i64x4.extract_lane(gt4, i)).toBe(a > b ? -1 : 0);
      expect<i64>(i64x4.extract_lane(ge4, i)).toBe(a >= b ? -1 : 0);
      expect<i64>(i64x4.extract_lane(sel4, i)).toBe((i & 1) == 0 ? a : b);
    }
    expect<bool>(i64x4.all_true(a4)).toBe(false);
    expect<u32>(i64x4.bitmask(a4)).toBe(0x3);
    const shuffled4 = i64x4.shuffle(a4, b4, 7, 0, 5, 2);
    expect<i64>(i64x4.extract_lane(shuffled4, 0)).toBe(bv4[3]);
    expect<i64>(i64x4.extract_lane(shuffled4, 1)).toBe(av4[0]);
    expect<i64>(i64x4.extract_lane(shuffled4, 2)).toBe(bv4[1]);
    expect<i64>(i64x4.extract_lane(shuffled4, 3)).toBe(av4[2]);

    let x8 = i32x8.splat(0), y8 = i32x8.splat(0);
    for (let i: u8 = 0; i < 8; i++) {
      x8 = i32x8.replace_lane(x8, i, i == 0 ? i32.MIN_VALUE : (i as i32 * 0x20000001) - 7);
      y8 = i32x8.replace_lane(y8, i, i == 7 ? i32.MAX_VALUE : 11 - i as i32 * 17);
    }
    const exl4s = i64x4.extend_low_i32x8_s(x8), exl4u = i64x4.extend_low_i32x8_u(x8);
    const exh4s = i64x4.extend_high_i32x8_s(x8), exh4u = i64x4.extend_high_i32x8_u(x8);
    const ml4s = i64x4.extmul_low_i32x8_s(x8, y8), ml4u = i64x4.extmul_low_i32x8_u(x8, y8);
    const mh4s = i64x4.extmul_high_i32x8_s(x8, y8), mh4u = i64x4.extmul_high_i32x8_u(x8, y8);
    for (let i: u8 = 0; i < 4; i++) {
      const xl = i32x8.extract_lane(x8, i), xh = i32x8.extract_lane(x8, i + 4);
      const yl = i32x8.extract_lane(y8, i), yh = i32x8.extract_lane(y8, i + 4);
      expect<i64>(i64x4.extract_lane(exl4s, i)).toBe(xl as i64);
      expect<u64>(i64x4.extract_lane(exl4u, i) as u64).toBe(xl as u32 as u64);
      expect<i64>(i64x4.extract_lane(exh4s, i)).toBe(xh as i64);
      expect<u64>(i64x4.extract_lane(exh4u, i) as u64).toBe(xh as u32 as u64);
      expect<i64>(i64x4.extract_lane(ml4s, i)).toBe((xl as i64) * yl);
      expect<u64>(i64x4.extract_lane(ml4u, i) as u64).toBe((xl as u32 as u64) * (yl as u32 as u64));
      expect<i64>(i64x4.extract_lane(mh4s, i)).toBe((xh as i64) * yh);
      expect<u64>(i64x4.extract_lane(mh4u, i) as u64).toBe((xh as u32 as u64) * (yh as u32 as u64));
    }

    let a8 = i64x8.splat(0), b8 = i64x8.splat(0), m8 = i64x8.splat(0);
    for (let i: u8 = 0; i < 8; i++) {
      const a = i == 0 ? i64.MIN_VALUE : i == 7 ? i64.MAX_VALUE : (i as i64 - 4) * 0x100000001;
      const b = i == 1 ? i64.MIN_VALUE : (11 - i as i64) * -0x100000003;
      a8 = i64x8.replace_lane(a8, i, a);
      b8 = i64x8.replace_lane(b8, i, b);
      m8 = i64x8.replace_lane(m8, i, (i & 1) == 0 ? -1 : 0);
    }
    const add8 = i64x8.add(a8, b8), sub8 = i64x8.sub(a8, b8), mul8 = i64x8.mul(a8, b8);
    const abs8 = i64x8.abs(a8), neg8 = i64x8.neg(a8);
    const shl8 = i64x8.shl(a8, 127), shrs8 = i64x8.shr_s(a8, 127), shru8 = i64x8.shr_u(a8, 127);
    const eq8 = i64x8.eq(a8, b8), ne8 = i64x8.ne(a8, b8), lt8 = i64x8.lt_s(a8, b8);
    const le8 = i64x8.le_s(a8, b8), gt8 = i64x8.gt_s(a8, b8), ge8 = i64x8.ge_s(a8, b8);
    const sel8 = i64x8.relaxed_laneselect(a8, b8, m8);
    for (let i: u8 = 0; i < 8; i++) {
      const a = i64x8.extract_lane(a8, i), b = i64x8.extract_lane(b8, i);
      expect<i64>(i64x8.extract_lane(add8, i)).toBe(a + b);
      expect<i64>(i64x8.extract_lane(sub8, i)).toBe(a - b);
      expect<i64>(i64x8.extract_lane(mul8, i)).toBe(a * b);
      expect<i64>(i64x8.extract_lane(abs8, i)).toBe(a < 0 ? -a : a);
      expect<i64>(i64x8.extract_lane(neg8, i)).toBe(-a);
      expect<i64>(i64x8.extract_lane(shl8, i)).toBe(a << 127);
      expect<i64>(i64x8.extract_lane(shrs8, i)).toBe(a >> 127);
      expect<u64>(i64x8.extract_lane(shru8, i) as u64).toBe((a as u64) >> 127);
      expect<i64>(i64x8.extract_lane(eq8, i)).toBe(a == b ? -1 : 0);
      expect<i64>(i64x8.extract_lane(ne8, i)).toBe(a != b ? -1 : 0);
      expect<i64>(i64x8.extract_lane(lt8, i)).toBe(a < b ? -1 : 0);
      expect<i64>(i64x8.extract_lane(le8, i)).toBe(a <= b ? -1 : 0);
      expect<i64>(i64x8.extract_lane(gt8, i)).toBe(a > b ? -1 : 0);
      expect<i64>(i64x8.extract_lane(ge8, i)).toBe(a >= b ? -1 : 0);
      expect<i64>(i64x8.extract_lane(sel8, i)).toBe((i & 1) == 0 ? a : b);
    }
    expect<bool>(i64x8.all_true(a8)).toBe(false);
    expect<u64>(i64x8.bitmask(a8)).toBe(0x0f);
    const shuffled8 = i64x8.shuffle(a8, b8, 15, 0, 13, 2, 11, 4, 9, 6);
    for (let i: u8 = 0; i < 8; i++) {
      const expected = (i & 1) == 0 ? i64x8.extract_lane(b8, 7 - i) : i64x8.extract_lane(a8, i - 1);
      expect<i64>(i64x8.extract_lane(shuffled8, i)).toBe(expected);
    }

    let x16 = i32x16.splat(0), y16 = i32x16.splat(0);
    for (let i: u8 = 0; i < 16; i++) {
      x16 = i32x16.replace_lane(x16, i, i == 0 ? i32.MIN_VALUE : (i as i32 * 0x10000001) - 9);
      y16 = i32x16.replace_lane(y16, i, i == 15 ? i32.MAX_VALUE : 13 - i as i32 * 19);
    }
    const exl8s = i64x8.extend_low_i32x16_s(x16), exl8u = i64x8.extend_low_i32x16_u(x16);
    const exh8s = i64x8.extend_high_i32x16_s(x16), exh8u = i64x8.extend_high_i32x16_u(x16);
    const ml8s = i64x8.extmul_low_i32x16_s(x16, y16), ml8u = i64x8.extmul_low_i32x16_u(x16, y16);
    const mh8s = i64x8.extmul_high_i32x16_s(x16, y16), mh8u = i64x8.extmul_high_i32x16_u(x16, y16);
    for (let i: u8 = 0; i < 8; i++) {
      const xl = i32x16.extract_lane(x16, i), xh = i32x16.extract_lane(x16, i + 8);
      const yl = i32x16.extract_lane(y16, i), yh = i32x16.extract_lane(y16, i + 8);
      expect<i64>(i64x8.extract_lane(exl8s, i)).toBe(xl as i64);
      expect<u64>(i64x8.extract_lane(exl8u, i) as u64).toBe(xl as u32 as u64);
      expect<i64>(i64x8.extract_lane(exh8s, i)).toBe(xh as i64);
      expect<u64>(i64x8.extract_lane(exh8u, i) as u64).toBe(xh as u32 as u64);
      expect<i64>(i64x8.extract_lane(ml8s, i)).toBe((xl as i64) * yl);
      expect<u64>(i64x8.extract_lane(ml8u, i) as u64).toBe((xl as u32 as u64) * (yl as u32 as u64));
      expect<i64>(i64x8.extract_lane(mh8s, i)).toBe((xh as i64) * yh);
      expect<u64>(i64x8.extract_lane(mh8u, i) as u64).toBe((xh as u32 as u64) * (yh as u32 as u64));
    }
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

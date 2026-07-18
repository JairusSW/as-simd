import { describe, expect, test } from "as-test";
import { v64 } from "../v64/v64";
import { i16x4 } from "../v64/i16x4";
import { v128_swar } from "../v128/v128_swar";
import { rf } from "../v128/regfile";
import { v128r } from "../v128/v128r";

let state: u64 = 0;

// @ts-expect-error: decorator
@inline function nextU64(): u64 {
  state += 0x9e3779b97f4a7c15;
  let z = state;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}

// @ts-expect-error: decorator
@inline function pairMatches(lo: u64, expectedLo: u64, expectedHi: u64): bool {
  return lo == expectedLo && v128_swar.take_hi() == expectedHi;
}

// @ts-expect-error: decorator
@inline function relaxedDotAddHalf(a: u64, b: u64, c: u64): u64 {
  let out: u64 = 0;
  for (let lane = 0; lane < 2; lane++) {
    let sum = ((c >> (lane * 32)) as u32) as i32;
    for (let byte = 0; byte < 4; byte++) {
      const shift = (lane * 4 + byte) * 8;
      sum += (((a >> shift) as u8) as i8 as i32) * (((b >> shift) as u8) as i8 as i32);
    }
    out |= (sum as u32 as u64) << (lane * 32);
  }
  return out;
}

describe("v128 adaptive SIMD/SWAR dispatcher", () => {
  test("integer operations match independent v64 chunks", () => {
    state = 0x243f6a8885a308d3;
    for (let run = 0; run < 256; run++) {
      const aLo = nextU64(), aHi = nextU64();
      const bLo = nextU64(), bHi = nextU64();
      const shift = <i32>(nextU64() & 31);
      let mismatches = 0;

      mismatches |= pairMatches(v128_swar.add<i8>(aLo, aHi, bLo, bHi), v64.add<i8>(aLo, bLo), v64.add<i8>(aHi, bHi)) ? 0 : 1;
      mismatches |= pairMatches(v128_swar.sub<i16>(aLo, aHi, bLo, bHi), v64.sub<i16>(aLo, bLo), v64.sub<i16>(aHi, bHi)) ? 0 : 2;
      mismatches |= pairMatches(v128_swar.mul<i32>(aLo, aHi, bLo, bHi), v64.mul<i32>(aLo, bLo), v64.mul<i32>(aHi, bHi)) ? 0 : 4;
      mismatches |= pairMatches(v128_swar.min<i8>(aLo, aHi, bLo, bHi), v64.min<i8>(aLo, bLo), v64.min<i8>(aHi, bHi)) ? 0 : 8;
      mismatches |= pairMatches(v128_swar.max<u16>(aLo, aHi, bLo, bHi), v64.max<u16>(aLo, bLo), v64.max<u16>(aHi, bHi)) ? 0 : 16;
      mismatches |= pairMatches(v128_swar.add_sat<i8>(aLo, aHi, bLo, bHi), v64.add_sat<i8>(aLo, bLo), v64.add_sat<i8>(aHi, bHi)) ? 0 : 32;
      mismatches |= pairMatches(v128_swar.sub_sat<u16>(aLo, aHi, bLo, bHi), v64.sub_sat<u16>(aLo, bLo), v64.sub_sat<u16>(aHi, bHi)) ? 0 : 64;
      mismatches |= pairMatches(v128_swar.shl<i32>(aLo, aHi, shift), v64.shl<i32>(aLo, shift), v64.shl<i32>(aHi, shift)) ? 0 : 128;
      mismatches |= pairMatches(v128_swar.shr<u32>(aLo, aHi, shift), v64.shr<u32>(aLo, shift), v64.shr<u32>(aHi, shift)) ? 0 : 256;
      mismatches |= pairMatches(v128_swar.eq<i64>(aLo, aHi, bLo, bHi), v64.eq<i64>(aLo, bLo), v64.eq<i64>(aHi, bHi)) ? 0 : 512;
      mismatches |= pairMatches(v128_swar.lt<u32>(aLo, aHi, bLo, bHi), v64.lt<u32>(aLo, bLo), v64.lt<u32>(aHi, bHi)) ? 0 : 1024;
      mismatches |= pairMatches(v128_swar.le<i16>(aLo, aHi, bLo, bHi), v64.le<i16>(aLo, bLo), v64.le<i16>(aHi, bHi)) ? 0 : 2048;
      mismatches |= pairMatches(v128_swar.lt<u64>(aLo, aHi, bLo, bHi), v64.lt<u64>(aLo, bLo), v64.lt<u64>(aHi, bHi)) ? 0 : 16384;
      mismatches |= pairMatches(v128_swar.le<u64>(aLo, aHi, bLo, bHi), v64.le<u64>(aLo, bLo), v64.le<u64>(aHi, bHi)) ? 0 : 32768;
      mismatches |= v128_swar.any_true(aLo, aHi) == (aLo != 0 || aHi != 0) ? 0 : 4096;
      mismatches |= v128_swar.bitmask<i32>(aLo, aHi) == (v64.bitmask<i32>(aLo) | (v64.bitmask<i32>(aHi) << 2)) ? 0 : 8192;

      expect<i32>(mismatches).toBe(0);
    }
  });

  test("register VM inherits the adaptive dispatcher and aliases safely", () => {
    const aLo: u64 = 0x807f0100fffefdfc, aHi: u64 = 0x0102030405060708;
    const bLo: u64 = 0x0101010101010101, bHi: u64 = 0xffffffffffffffff;
    const expectedLo = v128_swar.add<i8>(aLo, aHi, bLo, bHi);
    const expectedHi = v128_swar.take_hi();

    rf.set(0, aLo, aHi);
    rf.set(1, bLo, bHi);
    v128r.add<i8>(0, 0, 1);

    expect<u64>(rf.lo(0)).toBe(expectedLo);
    expect<u64>(rf.hi(0)).toBe(expectedHi);
  });

  test("relaxed byte dot and dot-add preserve their result lane shapes", () => {
    state = 0x13198a2e03707344;
    for (let run = 0; run < 256; run++) {
      const aLo = nextU64(), aHi = nextU64();
      // i7 inputs make the relaxed signed/unsigned hardware choice identical.
      const bLo = nextU64() & 0x7f7f7f7f7f7f7f7f;
      const bHi = nextU64() & 0x7f7f7f7f7f7f7f7f;
      const cLo = nextU64(), cHi = nextU64();
      const dotLo = i16x4.relaxed_dot_i8x8_i7x8_s(aLo, bLo);
      const dotHi = i16x4.relaxed_dot_i8x8_i7x8_s(aHi, bHi);

      const actualDotLo = v128_swar.relaxed_dot<i8>(aLo, aHi, bLo, bHi);
      const actualDotHi = v128_swar.take_hi();
      expect<u64>(actualDotLo).toBe(dotLo);
      expect<u64>(actualDotHi).toBe(dotHi);
      const expectedLo = relaxedDotAddHalf(aLo, bLo, cLo);
      const expectedHi = relaxedDotAddHalf(aHi, bHi, cHi);
      const actualAddLo = v128_swar.relaxed_dot_add<i8>(aLo, aHi, bLo, bHi, cLo, cHi);
      const actualAddHi = v128_swar.take_hi();
      expect<u64>(actualAddLo).toBe(expectedLo);
      expect<u64>(actualAddHi).toBe(expectedHi);
    }
  });
});

import { expect, fuzz, FuzzSeed } from "as-test";
import { v128_swar } from "../v128/value";
import { v128_kernels } from "../v128/kernels";
import { rf } from "../v128/regfile";

let checkId: i32 = 0;
const io: usize = memory.data(16, 16);


@inline function mix64(seed: u64, stream: u64): u64 {
  let z = seed + stream * 0x9e3779b97f4a7c15 + 0xd1b54a32d192ed03;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}


@inline function pair(lo: u64, hi: u64, dst: u32 = 2): bool {
  if (rf.lo(dst) != lo || rf.hi(dst) != hi) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

fuzz(
  "v128_kernels native register paths match v128_swar",
  (seedValue: i32): bool => {
    const seed = seedValue as u32 as u64;
    const aLo = mix64(seed, 0),
      aHi = mix64(seed, 1);
    const bLo = mix64(seed, 2),
      bHi = mix64(seed, 3);
    rf.set(0, aLo, aHi);
    rf.set(1, bLo, bHi);
    checkId = 1;
    let lo: u64, hi: u64;

    lo = v128_swar.min<u8>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.min<u8>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.max<i16>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.max<i16>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.mul<i8>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.mul<i8>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.add_sat<i16>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.add_sat<i16>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.sub_sat<i8>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.sub_sat<i8>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.abs<i8>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.abs<i8>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.abs<i16>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.abs<i16>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.eq<i8>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.eq<i8>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.ne<i16>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.ne<i16>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.lt<u8>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.lt<u8>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.le<i16>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.le<i16>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.dot<i16>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.dot<i16>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.narrow<i16>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.narrow<i16>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.extend_low<i8>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.extend_low<i8>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.extend_high<u8>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.extend_high<u8>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.extadd_pairwise<i8>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.extadd_pairwise<i8>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.extmul_low<i8>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.extmul_low<i8>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.extmul_high<u8>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.extmul_high<u8>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.q15mulr_sat<i16>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.q15mulr_sat<i16>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.swizzle(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.swizzle(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.add<f32>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.add<f32>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.mul<f64>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.mul<f64>(2, 0, 1);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.sqrt<f32>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.sqrt<f32>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.ceil<f32>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.ceil<f32>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.convert<i32>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.convert<i32>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.convert_low<i32>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.convert_low<i32>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.trunc_sat<i32>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.trunc_sat<i32>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.trunc_sat_zero<i32>(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.trunc_sat_zero<i32>(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.demote_zero(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.demote_zero(2, 0);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.promote_low(aLo, aHi);
    hi = v128_swar.take_hi();
    v128_kernels.promote_low(2, 0);
    if (!pair(lo, hi)) return false;
    store<u64>(io, aLo);
    store<u64>(io + 8, aHi);
    lo = v128_swar.load_ext<i8>(io);
    hi = v128_swar.take_hi();
    v128_kernels.load_ext<i8>(2, io);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.load_zero<i32>(io);
    hi = v128_swar.take_hi();
    v128_kernels.load_zero<i32>(2, io);
    if (!pair(lo, hi)) return false;
    lo = v128_swar.load_splat<i8>(io);
    hi = v128_swar.take_hi();
    v128_kernels.load_splat<i8>(2, io);
    if (!pair(lo, hi)) return false;

    rf.set(3, mix64(seed, 4), mix64(seed, 5));
    lo = v128_swar.relaxed_swizzle(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    v128_kernels.relaxed_swizzle(2, 0, 1);
    if (!pair(lo, hi)) return false;
    // Relaxed SIMD permits implementation-dependent NaN payload bits. Keep the
    // exact comparison meaningful by constraining just this operation to finite
    // positive f32 lanes.
    const finiteMask: u64 = 0x7f7fffff7f7fffff;
    const faLo = aLo & finiteMask,
      faHi = aHi & finiteMask,
      fbLo = bLo & finiteMask,
      fbHi = bHi & finiteMask,
      fcLo = rf.lo(3) & finiteMask,
      fcHi = rf.hi(3) & finiteMask;
    rf.set(0, faLo, faHi);
    rf.set(1, fbLo, fbHi);
    rf.set(3, fcLo, fcHi);
    lo = v128_swar.relaxed_madd<f32>(faLo, faHi, fbLo, fbHi, fcLo, fcHi);
    hi = v128_swar.take_hi();
    v128_kernels.relaxed_madd<f32>(2, 0, 1, 3);
    if (!pair(lo, hi)) return false;

    // Restore the original operands for reductions and lane checks below.
    rf.set(0, aLo, aHi);
    rf.set(1, bLo, bHi);

    if (v128_kernels.bitmask<i8>(0) != v128_swar.bitmask<i8>(aLo, aHi)) {
      expect<i32>(checkId).toBe(0);
      return false;
    }
    checkId++;
    if (v128_kernels.all_true<i8>(0) != v128_swar.all_true<i8>(aLo, aHi)) {
      expect<i32>(checkId).toBe(0);
      return false;
    }
    checkId++;
    if (v128_kernels.all_true<i32>(0) != v128_swar.all_true<i32>(aLo, aHi)) {
      expect<i32>(checkId).toBe(0);
      return false;
    }
    checkId++;
    const lane = seedValue as u32 & 7 as u8;
    if (
      v128_kernels.extract_lane<i16>(0, lane) !=
      v128_swar.extract_lane<i16>(aLo, aHi, lane)
    ) {
      expect<i32>(checkId).toBe(0);
      return false;
    }
    checkId++;
    lo = v128_swar.replace_lane<i16>(aLo, aHi, lane, seedValue as i16);
    hi = v128_swar.take_hi();
    v128_kernels.replace_lane<i16>(2, 0, lane, seedValue as i16);
    if (!pair(lo, hi)) return false;

    // Direct paths must load every source before an aliased destination write.
    lo = v128_swar.min<u8>(aLo, aHi, bLo, bHi);
    hi = v128_swar.take_hi();
    rf.set(0, aLo, aHi);
    rf.set(1, bLo, bHi);
    v128_kernels.min<u8>(0, 0, 1);
    if (!pair(lo, hi, 0)) return false;
    return true;
  },
).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(seed.i32());
});

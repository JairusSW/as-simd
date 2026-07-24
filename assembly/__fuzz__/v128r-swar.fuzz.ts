import { expect, fuzz, FuzzSeed } from "as-test";
import { v128_swar } from "../v128/value";
import { v128_kernels } from "../v128/kernels";
import { rf } from "../v128/regfile";

// Validates the register-indexed VM (`v128_kernels`) against the value-based kernels
// (`v128_swar`): every register op must produce, in its destination register,
// exactly what the corresponding value op returns. Also exercises dst==src
// aliasing. Runs in swar mode (no native SIMD required).

let checkId: i32 = 0;

// @ts-expect-error: decorator
@inline function mix64(seed: u64, stream: u64): u64 {
  let z = seed + stream * 0x9e3779b97f4a7c15 + 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}

// @ts-expect-error: decorator
@inline function expectPair(lo: u64, hi: u64, dst: u32): bool {
  if (rf.lo(dst) != lo || rf.hi(dst) != hi) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

fuzz("v128_kernels register VM parity vs v128_swar", (seedValue: i32): bool => {
  const seed = seedValue as u32 as u64;
  const aLo = mix64(seed, 0);
  const aHi = mix64(seed, 1);
  const bLo = mix64(seed, 2);
  const bHi = mix64(seed, 3);
  const shift = <i32>(mix64(seed, 4) & 31);
  checkId = 1;

  // registers: 0 = a, 1 = b
  rf.set(0, aLo, aHi);
  rf.set(1, bLo, bHi);

  let lo: u64;

  lo = v128_swar.add<i8>(aLo, aHi, bLo, bHi);
  v128_kernels.add<i8>(2, 0, 1);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.sub<i16>(aLo, aHi, bLo, bHi);
  v128_kernels.sub<i16>(2, 0, 1);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.mul<i32>(aLo, aHi, bLo, bHi);
  v128_kernels.mul<i32>(2, 0, 1);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.min<u8>(aLo, aHi, bLo, bHi);
  v128_kernels.min<u8>(2, 0, 1);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.max<i16>(aLo, aHi, bLo, bHi);
  v128_kernels.max<i16>(2, 0, 1);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.eq<i8>(aLo, aHi, bLo, bHi);
  v128_kernels.eq<i8>(2, 0, 1);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.lt<i32>(aLo, aHi, bLo, bHi);
  v128_kernels.lt<i32>(2, 0, 1);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.and(aLo, aHi, bLo, bHi);
  v128_kernels.and(2, 0, 1);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.shl<i8>(aLo, aHi, shift);
  v128_kernels.shl<i8>(2, 0, shift);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  lo = v128_swar.neg<i16>(aLo, aHi);
  v128_kernels.neg<i16>(2, 0);
  if (!expectPair(lo, v128_swar.take_hi(), 2)) return false;

  // reductions
  if (v128_kernels.bitmask<i8>(0) != v128_swar.bitmask<i8>(aLo, aHi)) { expect<i32>(checkId).toBe(0); return false; }
  checkId++;
  if (v128_kernels.any_true(0) != v128_swar.any_true(aLo, aHi)) { expect<i32>(checkId).toBe(0); return false; }
  checkId++;

  // aliasing: dst == src a. Compute expected from the original a/b first.
  const expLo = v128_swar.add<i8>(aLo, aHi, bLo, bHi);
  const expHi = v128_swar.take_hi();
  rf.set(0, aLo, aHi);
  rf.set(1, bLo, bHi);
  v128_kernels.add<i8>(0, 0, 1); // overwrite reg 0 in place
  if (!expectPair(expLo, expHi, 0)) return false;

  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(seed.i32());
});

export function bitselect(a: u64, b: u64, mask: u64): u64 {
  return (a & mask) | (b & ~mask);
}

export function repack(x: u64): u64 {
  return (x >> 8) << 8;
}

export function mergeMasks(x: u64): u64 {
  return (x & 0x000000000000ffff) | (x & 0x00000000ffff0000);
}

export function bitselect32(a: u32, b: u32, mask: u32): u32 {
  return (a & mask) | (b & ~mask);
}

export function repack32(x: u32): u32 {
  return (x >> 5) << 5;
}

export function mergeMasks32(x: u32): u32 {
  return (x & 0x0000ffff) | (x & 0xffff0000);
}

export function addDisjointMasks(x: u64): u64 {
  return (x & 0x000000000000ffff) + (x & 0x00000000ffff0000);
}

export function addOverlappingMasks(x: u64): u64 {
  return (x & 0x000000000000ffff) + (x & 0x000000000000ff00);
}

export function xorOverlappingMasks(x: u64): u64 {
  return (x & 0x000000000000ffff) ^ (x & 0x000000000000ff00);
}

export function factorAndMask(a: u64, b: u64): u64 {
  return (a & 0x00ff00ff00ff00ff) | (b & 0x00ff00ff00ff00ff);
}

export function factorOrMask(a: u64, b: u64): u64 {
  return (a | 0x00ff00ff00ff00ff) ^ (b | 0x00ff00ff00ff00ff);
}

export function mismatchedMasks(a: u64, b: u64): u64 {
  return (a & 0x00ff00ff00ff00ff) | (b & 0xff00ff00ff00ff00);
}

export function eqBitmask8(a: u64, b: u64): i32 {
  return i8x8.bitmask(i8x8.eq(a, b));
}

export function neBitmask8(a: u64, b: u64): i32 {
  return i8x8.bitmask(i8x8.ne(a, b));
}

export function anyEq8(a: u64, b: u64): bool {
  return i8x8.any_true(i8x8.eq(a, b));
}

export function anyNe8(a: u64, b: u64): bool {
  return i8x8.any_true(i8x8.ne(a, b));
}

export function allEq8(a: u64, b: u64): bool {
  return i8x8.all_true(i8x8.eq(a, b));
}

export function allNe8(a: u64, b: u64): bool {
  return i8x8.all_true(i8x8.ne(a, b));
}

export function anyEq16(a: u64, b: u64): bool {
  return i16x4.any_true(i16x4.eq(a, b));
}

export function anyNe16(a: u64, b: u64): bool {
  return i16x4.any_true(i16x4.ne(a, b));
}

export function allEq16(a: u64, b: u64): bool {
  return i16x4.all_true(i16x4.eq(a, b));
}

export function allNe16(a: u64, b: u64): bool {
  return i16x4.all_true(i16x4.ne(a, b));
}

export function anyEq32(a: u64, b: u64): bool {
  return i32x2.any_true(i32x2.eq(a, b));
}

export function anyNe32(a: u64, b: u64): bool {
  return i32x2.any_true(i32x2.ne(a, b));
}

export function allEq32(a: u64, b: u64): bool {
  return i32x2.all_true(i32x2.eq(a, b));
}

export function allNe32(a: u64, b: u64): bool {
  return i32x2.all_true(i32x2.ne(a, b));
}

export function eqBitmaskLoop(iters: u32, a: u64, b: u64): u64 {
  let result: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    result += i8x8.bitmask(i8x8.eq(a, b)) as u64;
    a += 0x0101010101010101;
    b ^= a;
  }
  return result ^ a ^ b;
}

export function anyEqLoop(iters: u32, a: u64, b: u64): u64 {
  let result: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    result += i8x8.any_true(i8x8.eq(a, b)) as u64;
    a += 0x0101010101010101;
    b ^= a;
  }
  return result ^ a ^ b;
}

export function anyEq16Loop(iters: u32, a: u64, b: u64): u64 {
  let result: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    result += i16x4.any_true(i16x4.eq(a, b)) as u64;
    a += 0x0001000100010001;
    b ^= a;
  }
  return result ^ a ^ b;
}

export function anyEq32Loop(iters: u32, a: u64, b: u64): u64 {
  let result: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    result += i32x2.any_true(i32x2.eq(a, b)) as u64;
    a += 0x0000000100000001;
    b ^= a;
  }
  return result ^ a ^ b;
}

export function allNe8Loop(iters: u32, a: u64, b: u64): u64 {
  let result: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    result += i8x8.all_true(i8x8.ne(a, b)) as u64;
    a += 0x0101010101010101;
    b ^= a;
  }
  return result ^ a ^ b;
}

export function allNe16Loop(iters: u32, a: u64, b: u64): u64 {
  let result: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    result += i16x4.all_true(i16x4.ne(a, b)) as u64;
    a += 0x0001000100010001;
    b ^= a;
  }
  return result ^ a ^ b;
}

export function allNe32Loop(iters: u32, a: u64, b: u64): u64 {
  let result: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    result += i32x2.all_true(i32x2.ne(a, b)) as u64;
    a += 0x0000000100000001;
    b ^= a;
  }
  return result ^ a ^ b;
}

export function allEqLoop(iters: u32, a: u64, b: u64): u64 {
  let result: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    result += i8x8.all_true(i8x8.eq(a, b)) as u64;
    a += 0x0101010101010101;
    b ^= a;
  }
  return result ^ a ^ b;
}
import { i8x8 } from "../../assembly/v64/i8x8";
import { i16x4 } from "../../assembly/v64/i16x4";
import { i32x2 } from "../../assembly/v64/i32x2";

type Unary64 = (value: u64) => u64;

export function indirectBitselect(fn: Unary64, a: u64, b: u64, mask: u64): u64 {
  return fn((a & mask) | (b & ~mask));
}

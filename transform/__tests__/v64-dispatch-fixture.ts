import { i8x8 } from "../../assembly/v64/lanes";
import { i16x4 } from "../../assembly/v64/lanes";
import { i32x2 } from "../../assembly/v64/lanes";

export function i8Min(a: u64, b: u64): u64 { return i8x8.min_s(a, b); }
export function i8AddSat(a: u64, b: u64): u64 { return i8x8.add_sat_s(a, b); }
export function i8Shift(a: u64, shift: i32): u64 { return i8x8.shl(a, shift); }
export function i8Shuffle(a: u64, b: u64): u64 { return i8x8.shuffle(a, b, 7, 0, 9, 2, 11, 4, 13, 6); }
export function i8Laneselect(a: u64, b: u64, m: u64): u64 { return i8x8.relaxed_laneselect(a, b, m); }
export function i8Mul(a: u64, b: u64): u64 { return i8x8.mul(a, b); }
export function i8Swizzle(a: u64, s: u64): u64 { return i8x8.swizzle(a, s); }

export function i16Min(a: u64, b: u64): u64 { return i16x4.min_s(a, b); }
export function i16LtU(a: u64, b: u64): u64 { return i16x4.lt_u(a, b); }
export function i16Abs(a: u64): u64 { return i16x4.abs(a); }

export function i32Mul(a: u64, b: u64): u64 { return i32x2.mul(a, b); }
export function i32Min(a: u64, b: u64): u64 { return i32x2.min_s(a, b); }
export function i32Dot(a: u64, b: u64): u64 { return i32x2.dot_i16x4_s(a, b); }
export function i32Abs(a: u64): u64 { return i32x2.abs(a); }
export function i32LtU(a: u64, b: u64): u64 { return i32x2.lt_u(a, b); }
export function i32Neg(a: u64): u64 { return i32x2.neg(a); }
export function i32Max(a: u64, b: u64): u64 { return i32x2.max_s(a, b); }

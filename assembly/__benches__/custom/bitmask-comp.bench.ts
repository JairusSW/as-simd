import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

// @ts-expect-error: decorator
@inline function bitmask_current(a: u64): i32 {
  let x = (a >> 7) & 0x0101010101010101;
  x = (x | (x >> 7)) & 0x0003000300030003;
  x = (x | (x >> 14)) & 0x0000000f0000000f;
  return ((x | (x >> 28)) & 0xff) as i32;
}

// @ts-expect-error: decorator
@inline function bitmask_lib(a: u64): i32 {
  return i8x8.bitmask(a);
}

// @ts-expect-error: decorator
@inline function bitmask_mul_direct(a: u64): i32 {
  return (((a & 0x8080808080808080) * 0x0002040810204081) >> 56) as i32;
}

// @ts-expect-error: decorator
@inline function bitmask_mul_shifted(a: u64): i32 {
  return ((((a >> 7) & 0x0101010101010101) * 0x0102040810204080) >> 56) as i32;
}

// @ts-expect-error: decorator
@inline function bitmask_manual_shifts(a: u64): i32 {
  return (
    ((a >> 7) & 0x01)
    | ((a >> 14) & 0x02)
    | ((a >> 21) & 0x04)
    | ((a >> 28) & 0x08)
    | ((a >> 35) & 0x10)
    | ((a >> 42) & 0x20)
    | ((a >> 49) & 0x40)
    | ((a >> 56) & 0x80)
  ) as i32;
}

// @ts-expect-error: decorator
@inline function bitmask_manual_lowsplit(a: u64): i32 {
  const lo = a as u32;
  const hi = (a >> 32) as u32;
  return (
    ((lo >> 7) & 0x01)
    | ((lo >> 14) & 0x02)
    | ((lo >> 21) & 0x04)
    | ((lo >> 28) & 0x08)
    | ((hi >> 3) & 0x10)
    | ((hi >> 10) & 0x20)
    | ((hi >> 17) & 0x40)
    | ((hi >> 24) & 0x80)
  ) as i32;
}

// @ts-expect-error: decorator
@inline function bitmask_split_mul(a: u64): i32 {
  const lo = (((a & 0x0000000080808080) * 0x02040810) >> 32) as i32;
  const hi = ((((a >> 32) & 0x0000000080808080) * 0x02040810) >> 28) as i32;
  return (lo | hi) & 0xff;
}

// @ts-expect-error: decorator
@inline function bitmask_split_mul_shifted(a: u64): i32 {
  const lo = (((((a >> 7) & 0x0000000001010101) * 0x01020408) >> 24) & 0x0f) as i32;
  const hi = (((((a >> 39) & 0x0000000001010101) * 0x01020408) >> 20) & 0xf0) as i32;
  return lo | hi;
}

if (
  bitmask_current(0xfedcba9876543210) != bitmask_mul_direct(0xfedcba9876543210)
  || bitmask_current(0xfedcba9876543210) != bitmask_mul_shifted(0xfedcba9876543210)
  || bitmask_current(0xfedcba9876543210) != bitmask_manual_shifts(0xfedcba9876543210)
  || bitmask_current(0xfedcba9876543210) != bitmask_manual_lowsplit(0xfedcba9876543210)
  || bitmask_current(0xfedcba9876543210) != bitmask_split_mul(0xfedcba9876543210)
  || bitmask_current(0xfedcba9876543210) != bitmask_split_mul_shifted(0xfedcba9876543210)
) {
  unreachable();
}

const bitmask_a: u64 = 0xfedcba9876543210;

bench("bitmask.lib", () => {
  blackbox(bitmask_lib(blackbox(bitmask_a)));
}, OPS, 8);
dumpToFile("bitmask-comp", "lib");


const bitmask_current_a: u64 = 0xfedcba9876543210;

bench("bitmask.current", () => {
  blackbox(bitmask_current(blackbox(bitmask_current_a)));
}, OPS, 8);
dumpToFile("bitmask-comp", "current");


const bitmask_mul_direct_a: u64 = 0xfedcba9876543210;

bench("bitmask.mul-direct", () => {
  blackbox(bitmask_mul_direct(blackbox(bitmask_mul_direct_a)));
}, OPS, 8);
dumpToFile("bitmask-comp", "mul-direct");


const bitmask_mul_shifted_a: u64 = 0xfedcba9876543210;

bench("bitmask.mul-shifted", () => {
  blackbox(bitmask_mul_shifted(blackbox(bitmask_mul_shifted_a)));
}, OPS, 8);
dumpToFile("bitmask-comp", "mul-shifted");


const bitmask_manual_shifts_a: u64 = 0xfedcba9876543210;

bench("bitmask.manual-shifts", () => {
  blackbox(bitmask_manual_shifts(blackbox(bitmask_manual_shifts_a)));
}, OPS, 8);
dumpToFile("bitmask-comp", "manual-shifts");


const bitmask_manual_lowsplit_a: u64 = 0xfedcba9876543210;

bench("bitmask.manual-lowsplit", () => {
  blackbox(bitmask_manual_lowsplit(blackbox(bitmask_manual_lowsplit_a)));
}, OPS, 8);
dumpToFile("bitmask-comp", "manual-lowsplit");


const bitmask_split_mul_a: u64 = 0xfedcba9876543210;

bench("bitmask.split-mul", () => {
  blackbox(bitmask_split_mul(blackbox(bitmask_split_mul_a)));
}, OPS, 8);
dumpToFile("bitmask-comp", "split-mul");


const bitmask_split_mul_shifted_a: u64 = 0xfedcba9876543210;

bench("bitmask.split-mul-shifted", () => {
  blackbox(bitmask_split_mul_shifted(blackbox(bitmask_split_mul_shifted_a)));
}, OPS, 8);
dumpToFile("bitmask-comp", "split-mul-shifted");

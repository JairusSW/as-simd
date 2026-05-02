import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

// @ts-expect-error: decorator
@inline function add_lib(a: u64, b: u64): u64 {
  return i8x8.add(a, b);
}

// @ts-expect-error: decorator
@inline function add_current(a: u64, b: u64): u64 {
  return ((a & ~0x8080808080808080) + (b & ~0x8080808080808080)) ^ ((a ^ b) & 0x8080808080808080);
}

// @ts-expect-error: decorator
@inline function add_current_const(a: u64, b: u64): u64 {
  return ((a & 0x7f7f7f7f7f7f7f7f) + (b & 0x7f7f7f7f7f7f7f7f)) ^ ((a ^ b) & 0x8080808080808080);
}

// @ts-expect-error: decorator
@inline function add_split32(a: u64, b: u64): u64 {
  const alo = a as u32;
  const blo = b as u32;
  const ahi = (a >> 32) as u32;
  const bhi = (b >> 32) as u32;
  const lo = ((alo & 0x7f7f7f7f) + (blo & 0x7f7f7f7f)) ^ ((alo ^ blo) & 0x80808080);
  const hi = ((ahi & 0x7f7f7f7f) + (bhi & 0x7f7f7f7f)) ^ ((ahi ^ bhi) & 0x80808080);
  return (lo as u64) | ((hi as u64) << 32);
}

// @ts-expect-error: decorator
@inline function add_split16(a: u64, b: u64): u64 {
  const lo = ((a & 0x007f007f007f007f) + (b & 0x007f007f007f007f)) ^ ((a ^ b) & 0x0080008000800080);
  const hi = ((a & 0x7f007f007f007f00) + (b & 0x7f007f007f007f00)) ^ ((a ^ b) & 0x8000800080008000);
  return lo | hi;
}

// @ts-expect-error: decorator
@inline function add_nibble(a: u64, b: u64): u64 {
  const lo = (a & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f);
  const hi = (a & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010);
  return (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0);
}

// @ts-expect-error: decorator
@inline function add_nibble_xor(a: u64, b: u64): u64 {
  const lo = (a & 0x0f0f0f0f0f0f0f0f) + (b & 0x0f0f0f0f0f0f0f0f);
  const hi = (a & 0xf0f0f0f0f0f0f0f0) + (b & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010);
  return (lo & 0x0f0f0f0f0f0f0f0f) ^ (hi & 0xf0f0f0f0f0f0f0f0);
}

if (
  add_current(0xfedcba9876543210, 0x7766554433221100) != add_current_const(0xfedcba9876543210, 0x7766554433221100)
  || add_current(0xfedcba9876543210, 0x7766554433221100) != add_split32(0xfedcba9876543210, 0x7766554433221100)
  || add_current(0xfedcba9876543210, 0x7766554433221100) != add_split16(0xfedcba9876543210, 0x7766554433221100)
  || add_current(0xfedcba9876543210, 0x7766554433221100) != add_nibble(0xfedcba9876543210, 0x7766554433221100)
  || add_current(0xfedcba9876543210, 0x7766554433221100) != add_nibble_xor(0xfedcba9876543210, 0x7766554433221100)
  || add_current(0xffffffffffffffff, 0x0101010101010101) != add_current_const(0xffffffffffffffff, 0x0101010101010101)
  || add_current(0xffffffffffffffff, 0x0101010101010101) != add_split32(0xffffffffffffffff, 0x0101010101010101)
  || add_current(0xffffffffffffffff, 0x0101010101010101) != add_split16(0xffffffffffffffff, 0x0101010101010101)
  || add_current(0xffffffffffffffff, 0x0101010101010101) != add_nibble(0xffffffffffffffff, 0x0101010101010101)
  || add_current(0xffffffffffffffff, 0x0101010101010101) != add_nibble_xor(0xffffffffffffffff, 0x0101010101010101)
) {
  unreachable();
}

const add_a: u64 = 0xfedcba9876543210;
const add_b: u64 = 0x7766554433221100;

bench("add.lib", () => {
  blackbox(add_lib(blackbox(add_a), blackbox(add_b)));
}, OPS, 8);
dumpToFile("add-comp", "lib");

bench("add.current", () => {
  blackbox(add_current(blackbox(add_a), blackbox(add_b)));
}, OPS, 8);
dumpToFile("add-comp", "current");

bench("add.current-const", () => {
  blackbox(add_current_const(blackbox(add_a), blackbox(add_b)));
}, OPS, 8);
dumpToFile("add-comp", "current-const");

bench("add.split32", () => {
  blackbox(add_split32(blackbox(add_a), blackbox(add_b)));
}, OPS, 8);
dumpToFile("add-comp", "split32");

bench("add.split16", () => {
  blackbox(add_split16(blackbox(add_a), blackbox(add_b)));
}, OPS, 8);
dumpToFile("add-comp", "split16");

bench("add.nibble", () => {
  blackbox(add_nibble(blackbox(add_a), blackbox(add_b)));
}, OPS, 8);
dumpToFile("add-comp", "nibble");

bench("add.nibble-xor", () => {
  blackbox(add_nibble_xor(blackbox(add_a), blackbox(add_b)));
}, OPS, 8);
dumpToFile("add-comp", "nibble-xor");

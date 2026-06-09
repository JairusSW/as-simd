import { i8x16_swar } from "../../v128/i8x16_swar";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(128);
const ptr: usize = IO_PTR + 0x20;
const fill: i8 = -37;
const len: i32 = 11;
const valueLo: u64 = 0xfedcba9876543210;
const valueHi: u64 = 0x0123456789abcdef;

let hi_sink: u64 = 0;

// @ts-expect-error: decorator
@inline function load_lib(ptr: usize, len: i32, fill: i8): u64 {
  const lo = i8x16_swar.loadPartial(ptr, len, 0, 1, fill);
  hi_sink = i8x16_swar.take_hi();
  return lo;
}

// @ts-expect-error: decorator
@inline function splat_fill(fill: i8): u64 {
  return (((fill as u64) & 0xff) * 0x0101010101010101);
}

// @ts-expect-error: decorator
@inline function load_masked(ptr: usize, len: i32, fill: i8): u64 {
  if (len <= 0) {
    const p = splat_fill(fill);
    hi_sink = p;
    return p;
  }
  if (len >= 16) {
    hi_sink = load<u64>(ptr, 8);
    return load<u64>(ptr);
  }
  const fillWord = splat_fill(fill);
  if (len < 8) {
    const bits = len << 3;
    const mask = ((1 as u64) << bits) - 1;
    hi_sink = fillWord;
    return (load<u64>(ptr) & mask) | (fillWord & ~mask);
  }
  const bits = (len - 8) << 3;
  const mask = ((1 as u64) << bits) - 1;
  hi_sink = bits == 0 ? fillWord : ((load<u64>(ptr, 8) & mask) | (fillWord & ~mask));
  return load<u64>(ptr);
}

// @ts-expect-error: decorator
@inline function store_lib(ptr: usize, lo: u64, hi: u64, len: i32): void {
  i8x16_swar.storePartial(ptr, lo, hi, len);
}

// @ts-expect-error: decorator
@inline function store_masked(ptr: usize, lo: u64, hi: u64, len: i32): void {
  if (len <= 0) return;
  if (len >= 16) {
    store<u64>(ptr, lo);
    store<u64>(ptr, hi, 8);
    return;
  }
  if (len < 8) {
    const bits = len << 3;
    const mask = ((1 as u64) << bits) - 1;
    store<u64>(ptr, (load<u64>(ptr) & ~mask) | (lo & mask));
    return;
  }
  store<u64>(ptr, lo);
  const bits = (len - 8) << 3;
  if (bits == 0) return;
  const mask = ((1 as u64) << bits) - 1;
  store<u64>(ptr, (load<u64>(ptr, 8) & ~mask) | (hi & mask), 8);
}

bench("i8x16.load-partial.lib", () => {
  blackbox(load_lib(blackbox(ptr), blackbox(len), blackbox(fill)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-partial-comp", "load-lib");

bench("i8x16.load-partial.masked", () => {
  blackbox(load_masked(blackbox(ptr), blackbox(len), blackbox(fill)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-partial-comp", "load-masked");

bench("i8x16.store-partial.lib", () => {
  store_lib(blackbox(ptr), blackbox(valueLo), blackbox(valueHi), blackbox(len));
  blackbox(load<u64>(IO_PTR));
}, OPS, 8);
dumpToFile("i8x16-partial-comp", "store-lib");

bench("i8x16.store-partial.masked", () => {
  store_masked(blackbox(ptr), blackbox(valueLo), blackbox(valueHi), blackbox(len));
  blackbox(load<u64>(IO_PTR));
}, OPS, 8);
dumpToFile("i8x16-partial-comp", "store-masked");

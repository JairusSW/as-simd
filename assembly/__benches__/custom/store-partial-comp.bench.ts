import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(96);
const ptr: usize = IO_PTR + 0x20;
const value: u64 = 0xfedcba9876543210;
const len: i32 = 5;

// @ts-expect-error: decorator
@inline function store_partial_lib(ptr: usize, value: u64, len: i32): void {
  i8x8.storePartial(ptr, value, len);
}

// @ts-expect-error: decorator
@inline function store_partial_rmw(ptr: usize, value: u64, len: i32): void {
  if (len <= 0) return;
  if (len >= 8) {
    store<u64>(ptr, value);
    return;
  }
  const mask = (1 << (len << 3)) - 1;
  store<u64>(ptr, (load<u64>(ptr) & ~(mask as u64)) | (value & (mask as u64)));
}

bench(
  "store-partial.lib",
  () => {
    store_partial_lib(blackbox(ptr), blackbox(value), blackbox(len));
    blackbox(load<u64>(IO_PTR));
  },
  OPS,
  8,
);
dumpToFile("store-partial-comp", "lib");
bench(
  "store-partial.rmw",
  () => {
    store_partial_rmw(blackbox(ptr), blackbox(value), blackbox(len));
    blackbox(load<u64>(IO_PTR));
  },
  OPS,
  8,
);
dumpToFile("store-partial-comp", "rmw");

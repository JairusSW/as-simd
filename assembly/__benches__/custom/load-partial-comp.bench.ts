import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(96);
const ptr: usize = IO_PTR + 0x20;
const len: i32 = 5;
const fill: i8 = -37;

// @ts-expect-error: decorator
@inline function load_partial_lib(ptr: usize, len: i32, fill: i8): u64 {
  return i8x8.loadPartial(ptr, len, 0, 1, fill);
}

// @ts-expect-error: decorator
@inline function load_partial_full_masked(ptr: usize, len: i32, fill: i8): u64 {
  if (len <= 0) return i8x8.splat(fill);
  if (len >= 8) return load<u64>(ptr);
  const mask = (1 << (len << 3)) - 1;
  return (load<u64>(ptr) & (mask as u64)) | (i8x8.splat(fill) & ~(mask as u64));
}

bench(
  "load-partial.lib",
  () => {
    blackbox(load_partial_lib(blackbox(ptr), blackbox(len), blackbox(fill)));
  },
  OPS,
  8,
);
dumpToFile("load-partial-comp", "lib");
bench(
  "load-partial.full-masked",
  () => {
    blackbox(
      load_partial_full_masked(blackbox(ptr), blackbox(len), blackbox(fill)),
    );
  },
  OPS,
  8,
);
dumpToFile("load-partial-comp", "full-masked");

import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

// @ts-expect-error: decorator
@inline function ne_lib(a: u64, b: u64): u64 {
  return i8x8.ne(a, b);
}

// @ts-expect-error: decorator
@inline function ne_current(a: u64, b: u64): u64 {
  const x = a ^ b;
  return ~(((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff);
}

// @ts-expect-error: decorator
@inline function ne_nonzero_expand(a: u64, b: u64): u64 {
  const x = a ^ b;
  const mask = (((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | x) & 0x8080808080808080;
  return (mask >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function ne_nonzero_expand_split(a: u64, b: u64): u64 {
  const x = a ^ b;
  const lo = x as u32;
  const hi = (x >> 32) as u32;
  const loMask = (((lo & 0x7f7f7f7f) + 0x7f7f7f7f) | lo) & 0x80808080;
  const hiMask = (((hi & 0x7f7f7f7f) + 0x7f7f7f7f) | hi) & 0x80808080;
  return (((loMask >> 7) * 0xff) as u64) | ((((hiMask >> 7) * 0xff) as u64) << 32);
}

if (
  ne_current(0xfedcba9876543210, 0x7766554433221100) != ne_nonzero_expand(0xfedcba9876543210, 0x7766554433221100)
  || ne_current(0xfedcba9876543210, 0x7766554433221100) != ne_nonzero_expand_split(0xfedcba9876543210, 0x7766554433221100)
  || ne_current(0, 0) != ne_nonzero_expand(0, 0)
  || ne_current(0, 0) != ne_nonzero_expand_split(0, 0)
  || ne_current(0x0100000000000000, 0) != ne_nonzero_expand(0x0100000000000000, 0)
  || ne_current(0x0100000000000000, 0) != ne_nonzero_expand_split(0x0100000000000000, 0)
) {
  unreachable();
}

const ne_a: u64 = 0xfedcba9876543210;
const ne_b: u64 = 0x7766554433221100;

bench("ne.lib", () => {
  blackbox(ne_lib(blackbox(ne_a), blackbox(ne_b)));
}, OPS, 8);
dumpToFile("ne-comp", "lib");

bench("ne.current", () => {
  blackbox(ne_current(blackbox(ne_a), blackbox(ne_b)));
}, OPS, 8);
dumpToFile("ne-comp", "current");

bench("ne.nonzero-expand", () => {
  blackbox(ne_nonzero_expand(blackbox(ne_a), blackbox(ne_b)));
}, OPS, 8);
dumpToFile("ne-comp", "nonzero-expand");

bench("ne.nonzero-expand-split", () => {
  blackbox(ne_nonzero_expand_split(blackbox(ne_a), blackbox(ne_b)));
}, OPS, 8);
dumpToFile("ne-comp", "nonzero-expand-split");

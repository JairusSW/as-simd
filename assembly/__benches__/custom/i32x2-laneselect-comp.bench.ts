import { i32x2 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;
const m: u64 = 0x8000000000000000;

// @ts-expect-error: decorator
@inline function lib(a: u64, b: u64, m: u64): u64 { return i32x2.relaxed_laneselect(a, b, m); }

// @ts-expect-error: decorator
@inline function current(a: u64, b: u64, m: u64): u64 {
  const x0 = ((select<u64>(a, b, (m & 0x80000000) != 0) & 0xffffffff) as u32) as u64;
  const x1 = ((select<u64>(a >> 32, b >> 32, (m & 0x8000000000000000) != 0) & 0xffffffff) as u32) as u64;
  return x0 | (x1 << 32);
}

// @ts-expect-error: decorator
@inline function bitselect_mul(a: u64, b: u64, m: u64): u64 {
  const laneMask = (((m & 0x8000000080000000) >> 31) * 0xffffffff) as u64;
  return b ^ ((a ^ b) & laneMask);
}

// @ts-expect-error: decorator
@inline function bitselect_andor(a: u64, b: u64, m: u64): u64 {
  const laneMask = (((m & 0x8000000080000000) >> 31) * 0xffffffff) as u64;
  return (a & laneMask) | (b & ~laneMask);
}

bench("i32x2-laneselect.lib", () => { blackbox(lib(blackbox(a), blackbox(b), blackbox(m))); }, OPS, 24); dumpToFile("i32x2-laneselect-comp", "lib");
bench("i32x2-laneselect.current", () => { blackbox(current(blackbox(a), blackbox(b), blackbox(m))); }, OPS, 24); dumpToFile("i32x2-laneselect-comp", "current");
bench("i32x2-laneselect.bitselect-mul", () => { blackbox(bitselect_mul(blackbox(a), blackbox(b), blackbox(m))); }, OPS, 24); dumpToFile("i32x2-laneselect-comp", "bitselect-mul");
bench("i32x2-laneselect.bitselect-andor", () => { blackbox(bitselect_andor(blackbox(a), blackbox(b), blackbox(m))); }, OPS, 24); dumpToFile("i32x2-laneselect-comp", "bitselect-andor");

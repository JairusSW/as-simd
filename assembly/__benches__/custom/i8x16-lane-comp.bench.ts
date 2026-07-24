import { i8x16_swar } from "../../v128/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

let hi_sink: u64 = 0;

// @ts-expect-error: decorator
@inline function pair(lo: u64, hi: u64): u64 {
  hi_sink = hi;
  return lo;
}

// @ts-expect-error: decorator
@inline function extract_s_lib(lo: u64, hi: u64, idx: u8): i8 {
  return i8x16_swar.extract_lane_s(lo, hi, idx);
}

// @ts-expect-error: decorator
@inline function extract_u_lib(lo: u64, hi: u64, idx: u8): u8 {
  return i8x16_swar.extract_lane_u(lo, hi, idx);
}

// @ts-expect-error: decorator
@inline function extract_s_if(lo: u64, hi: u64, idx: u8): i8 {
  const v = idx < 8 ? lo : hi;
  return ((v >> ((idx & 7) << 3)) as u8) as i8;
}

// @ts-expect-error: decorator
@inline function extract_u_if(lo: u64, hi: u64, idx: u8): u8 {
  const v = idx < 8 ? lo : hi;
  return (v >> ((idx & 7) << 3)) as u8;
}

// @ts-expect-error: decorator
@inline function extract_s_select(lo: u64, hi: u64, idx: u8): i8 {
  const v = select<u64>(hi, lo, idx < 8);
  return ((v >> ((idx & 7) << 3)) as u8) as i8;
}

// @ts-expect-error: decorator
@inline function extract_u_select(lo: u64, hi: u64, idx: u8): u8 {
  const v = select<u64>(hi, lo, idx < 8);
  return (v >> ((idx & 7) << 3)) as u8;
}

// @ts-expect-error: decorator
@inline function replace_lib(lo: u64, hi: u64, idx: u8, value: i8): u64 {
  const rLo = i8x16_swar.replace_lane(lo, hi, idx, value);
  hi_sink = i8x16_swar.take_hi();
  return rLo;
}

// @ts-expect-error: decorator
@inline function replace_if(lo: u64, hi: u64, idx: u8, value: i8): u64 {
  const i = idx & 15;
  const j = i & 7;
  const shift = (j << 3) as u64;
  const byte = (value as u8 as u64) << shift;
  const mask = ~((0xff as u64) << shift);
  if (i < 8) return pair((lo & mask) | byte, hi);
  return pair(lo, (hi & mask) | byte);
}

// @ts-expect-error: decorator
@inline function replace_split(lo: u64, hi: u64, idx: u8, value: i8): u64 {
  const i = idx & 7;
  const shift = (i << 3) as u64;
  const byte = (value as u8 as u64) << shift;
  const mask = ~((0xff as u64) << shift);
  const nextLo = (lo & mask) | byte;
  const nextHi = (hi & mask) | byte;
  return idx < 8 ? pair(nextLo, hi) : pair(lo, nextHi);
}

const lo: u64 = 0xfedcba9876543210;
const hi: u64 = 0x0123456789abcdef;
const idx: u8 = 11;
const value: i8 = -37;

bench("i8x16.extract-s.lib", () => { blackbox(extract_s_lib(blackbox(lo), blackbox(hi), blackbox(idx))); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "extract-s-lib");
bench("i8x16.extract-s.if", () => { blackbox(extract_s_if(blackbox(lo), blackbox(hi), blackbox(idx))); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "extract-s-if");
bench("i8x16.extract-s.select", () => { blackbox(extract_s_select(blackbox(lo), blackbox(hi), blackbox(idx))); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "extract-s-select");

bench("i8x16.extract-u.lib", () => { blackbox(extract_u_lib(blackbox(lo), blackbox(hi), blackbox(idx))); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "extract-u-lib");
bench("i8x16.extract-u.if", () => { blackbox(extract_u_if(blackbox(lo), blackbox(hi), blackbox(idx))); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "extract-u-if");
bench("i8x16.extract-u.select", () => { blackbox(extract_u_select(blackbox(lo), blackbox(hi), blackbox(idx))); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "extract-u-select");

bench("i8x16.replace.lib", () => { blackbox(replace_lib(blackbox(lo), blackbox(hi), blackbox(idx), blackbox(value))); blackbox(hi_sink); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "replace-lib");
bench("i8x16.replace.if", () => { blackbox(replace_if(blackbox(lo), blackbox(hi), blackbox(idx), blackbox(value))); blackbox(hi_sink); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "replace-if");
bench("i8x16.replace.split", () => { blackbox(replace_split(blackbox(lo), blackbox(hi), blackbox(idx), blackbox(value))); blackbox(hi_sink); }, OPS, 8);
dumpToFile("i8x16-lane-comp", "replace-split");

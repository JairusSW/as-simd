import { i8x16_swar } from "../../v128/i8x16_swar";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

let hi_sink: u64 = 0;

// @ts-expect-error: decorator
@inline function set_pair(lo: u64, hi: u64): u64 {
  hi_sink = hi;
  return lo;
}

// @ts-expect-error: decorator
@inline function sat_s(x: i32): u64 {
  return (x > 127 ? 127 : (x < -128 ? -128 : x)) as u8 as u64;
}

// @ts-expect-error: decorator
@inline function sat_u(x: i32): u64 {
  return (x < 0 ? 0 : (x > 255 ? 255 : x)) as u64;
}

// @ts-expect-error: decorator
@inline function narrow_s_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const lo = i8x16_swar.narrow_i16x8_s(aLo, aHi, bLo, bHi);
  hi_sink = i8x16_swar.take_hi();
  return lo;
}

// @ts-expect-error: decorator
@inline function narrow_u_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const lo = i8x16_swar.narrow_i16x8_u(aLo, aHi, bLo, bHi);
  hi_sink = i8x16_swar.take_hi();
  return lo;
}

// @ts-expect-error: decorator
@inline function narrow_s_current(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  return set_pair(
    sat_s((aLo & 0xffff) as i16 as i32) |
    (sat_s(((aLo >> 16) & 0xffff) as i16 as i32) << 8) |
    (sat_s(((aLo >> 32) & 0xffff) as i16 as i32) << 16) |
    (sat_s(((aLo >> 48) & 0xffff) as i16 as i32) << 24) |
    (sat_s((aHi & 0xffff) as i16 as i32) << 32) |
    (sat_s(((aHi >> 16) & 0xffff) as i16 as i32) << 40) |
    (sat_s(((aHi >> 32) & 0xffff) as i16 as i32) << 48) |
    (sat_s(((aHi >> 48) & 0xffff) as i16 as i32) << 56),
    sat_s((bLo & 0xffff) as i16 as i32) |
    (sat_s(((bLo >> 16) & 0xffff) as i16 as i32) << 8) |
    (sat_s(((bLo >> 32) & 0xffff) as i16 as i32) << 16) |
    (sat_s(((bLo >> 48) & 0xffff) as i16 as i32) << 24) |
    (sat_s((bHi & 0xffff) as i16 as i32) << 32) |
    (sat_s(((bHi >> 16) & 0xffff) as i16 as i32) << 40) |
    (sat_s(((bHi >> 32) & 0xffff) as i16 as i32) << 48) |
    (sat_s(((bHi >> 48) & 0xffff) as i16 as i32) << 56),
  );
}

// @ts-expect-error: decorator
@inline function narrow_u_current(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  return set_pair(
    sat_u((aLo & 0xffff) as i16 as i32) |
    (sat_u(((aLo >> 16) & 0xffff) as i16 as i32) << 8) |
    (sat_u(((aLo >> 32) & 0xffff) as i16 as i32) << 16) |
    (sat_u(((aLo >> 48) & 0xffff) as i16 as i32) << 24) |
    (sat_u((aHi & 0xffff) as i16 as i32) << 32) |
    (sat_u(((aHi >> 16) & 0xffff) as i16 as i32) << 40) |
    (sat_u(((aHi >> 32) & 0xffff) as i16 as i32) << 48) |
    (sat_u(((aHi >> 48) & 0xffff) as i16 as i32) << 56),
    sat_u((bLo & 0xffff) as i16 as i32) |
    (sat_u(((bLo >> 16) & 0xffff) as i16 as i32) << 8) |
    (sat_u(((bLo >> 32) & 0xffff) as i16 as i32) << 16) |
    (sat_u(((bLo >> 48) & 0xffff) as i16 as i32) << 24) |
    (sat_u((bHi & 0xffff) as i16 as i32) << 32) |
    (sat_u(((bHi >> 16) & 0xffff) as i16 as i32) << 40) |
    (sat_u(((bHi >> 32) & 0xffff) as i16 as i32) << 48) |
    (sat_u(((bHi >> 48) & 0xffff) as i16 as i32) << 56),
  );
}

// @ts-expect-error: decorator
@inline function sat_s_select(x: i32): u64 {
  return select<u64>(127, select<u64>(-128, x as u64, x < -128), x > 127) & 0xff;
}

// @ts-expect-error: decorator
@inline function sat_u_select(x: i32): u64 {
  return select<u64>(255, select<u64>(0, x as u64, x < 0), x > 255);
}

// @ts-expect-error: decorator
@inline function narrow_s_select(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  return set_pair(
    sat_s_select((aLo & 0xffff) as i16 as i32) |
    (sat_s_select(((aLo >> 16) & 0xffff) as i16 as i32) << 8) |
    (sat_s_select(((aLo >> 32) & 0xffff) as i16 as i32) << 16) |
    (sat_s_select(((aLo >> 48) & 0xffff) as i16 as i32) << 24) |
    (sat_s_select((aHi & 0xffff) as i16 as i32) << 32) |
    (sat_s_select(((aHi >> 16) & 0xffff) as i16 as i32) << 40) |
    (sat_s_select(((aHi >> 32) & 0xffff) as i16 as i32) << 48) |
    (sat_s_select(((aHi >> 48) & 0xffff) as i16 as i32) << 56),
    sat_s_select((bLo & 0xffff) as i16 as i32) |
    (sat_s_select(((bLo >> 16) & 0xffff) as i16 as i32) << 8) |
    (sat_s_select(((bLo >> 32) & 0xffff) as i16 as i32) << 16) |
    (sat_s_select(((bLo >> 48) & 0xffff) as i16 as i32) << 24) |
    (sat_s_select((bHi & 0xffff) as i16 as i32) << 32) |
    (sat_s_select(((bHi >> 16) & 0xffff) as i16 as i32) << 40) |
    (sat_s_select(((bHi >> 32) & 0xffff) as i16 as i32) << 48) |
    (sat_s_select(((bHi >> 48) & 0xffff) as i16 as i32) << 56),
  );
}

// @ts-expect-error: decorator
@inline function narrow_u_select(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  return set_pair(
    sat_u_select((aLo & 0xffff) as i16 as i32) |
    (sat_u_select(((aLo >> 16) & 0xffff) as i16 as i32) << 8) |
    (sat_u_select(((aLo >> 32) & 0xffff) as i16 as i32) << 16) |
    (sat_u_select(((aLo >> 48) & 0xffff) as i16 as i32) << 24) |
    (sat_u_select((aHi & 0xffff) as i16 as i32) << 32) |
    (sat_u_select(((aHi >> 16) & 0xffff) as i16 as i32) << 40) |
    (sat_u_select(((aHi >> 32) & 0xffff) as i16 as i32) << 48) |
    (sat_u_select(((aHi >> 48) & 0xffff) as i16 as i32) << 56),
    sat_u_select((bLo & 0xffff) as i16 as i32) |
    (sat_u_select(((bLo >> 16) & 0xffff) as i16 as i32) << 8) |
    (sat_u_select(((bLo >> 32) & 0xffff) as i16 as i32) << 16) |
    (sat_u_select(((bLo >> 48) & 0xffff) as i16 as i32) << 24) |
    (sat_u_select((bHi & 0xffff) as i16 as i32) << 32) |
    (sat_u_select(((bHi >> 16) & 0xffff) as i16 as i32) << 40) |
    (sat_u_select(((bHi >> 32) & 0xffff) as i16 as i32) << 48) |
    (sat_u_select(((bHi >> 48) & 0xffff) as i16 as i32) << 56),
  );
}

const aLo: u64 = 0xfedcba9876543210;
const aHi: u64 = 0x0123456789abcdef;
const bLo: u64 = 0x7766554433221100;
const bHi: u64 = 0x13579bdf2468ace0;

if (
  narrow_s_current(aLo, aHi, bLo, bHi) != narrow_s_select(aLo, aHi, bLo, bHi) ||
  narrow_u_current(aLo, aHi, bLo, bHi) != narrow_u_select(aLo, aHi, bLo, bHi)
) {
  unreachable();
}

bench("i8x16.narrow-s.lib", () => {
  blackbox(narrow_s_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-narrow-comp", "s-lib");

bench("i8x16.narrow-s.current", () => {
  blackbox(narrow_s_current(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-narrow-comp", "s-current");

bench("i8x16.narrow-s.select", () => {
  blackbox(narrow_s_select(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-narrow-comp", "s-select");

bench("i8x16.narrow-u.lib", () => {
  blackbox(narrow_u_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-narrow-comp", "u-lib");

bench("i8x16.narrow-u.current", () => {
  blackbox(narrow_u_current(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-narrow-comp", "u-current");

bench("i8x16.narrow-u.select", () => {
  blackbox(narrow_u_select(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-narrow-comp", "u-select");

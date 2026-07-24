import { i8x16_swar } from "../../v128/lanes";
import { i16x8_swar } from "../../v128/lanes";
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
@inline function mul_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const lo = i8x16_swar.mul(aLo, aHi, bLo, bHi);
  hi_sink = i8x16_swar.take_hi();
  return lo;
}

// @ts-expect-error: decorator
@inline function mul_expand(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  return set_pair(
    (((aLo & 0xff) * (bLo & 0xff)) & 0xff) |
    (((((aLo >> 8) & 0xff) * ((bLo >> 8) & 0xff)) & 0xff) << 8) |
    (((((aLo >> 16) & 0xff) * ((bLo >> 16) & 0xff)) & 0xff) << 16) |
    (((((aLo >> 24) & 0xff) * ((bLo >> 24) & 0xff)) & 0xff) << 24) |
    (((((aLo >> 32) & 0xff) * ((bLo >> 32) & 0xff)) & 0xff) << 32) |
    (((((aLo >> 40) & 0xff) * ((bLo >> 40) & 0xff)) & 0xff) << 40) |
    (((((aLo >> 48) & 0xff) * ((bLo >> 48) & 0xff)) & 0xff) << 48) |
    (((((aLo >> 56) & 0xff) * ((bLo >> 56) & 0xff)) & 0xff) << 56),
    (((aHi & 0xff) * (bHi & 0xff)) & 0xff) |
    (((((aHi >> 8) & 0xff) * ((bHi >> 8) & 0xff)) & 0xff) << 8) |
    (((((aHi >> 16) & 0xff) * ((bHi >> 16) & 0xff)) & 0xff) << 16) |
    (((((aHi >> 24) & 0xff) * ((bHi >> 24) & 0xff)) & 0xff) << 24) |
    (((((aHi >> 32) & 0xff) * ((bHi >> 32) & 0xff)) & 0xff) << 32) |
    (((((aHi >> 40) & 0xff) * ((bHi >> 40) & 0xff)) & 0xff) << 40) |
    (((((aHi >> 48) & 0xff) * ((bHi >> 48) & 0xff)) & 0xff) << 48) |
    (((((aHi >> 56) & 0xff) * ((bHi >> 56) & 0xff)) & 0xff) << 56),
  );
}

// @ts-expect-error: decorator
@inline function mul_pairs(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const lo0 = (((aLo & 0xff) * (bLo & 0xff)) & 0xff) | (((((aLo >> 8) & 0xff) * ((bLo >> 8) & 0xff)) & 0xff) << 8);
  const lo1 = (((((aLo >> 16) & 0xff) * ((bLo >> 16) & 0xff)) & 0xff) | (((((aLo >> 24) & 0xff) * ((bLo >> 24) & 0xff)) & 0xff) << 8)) << 16;
  const lo2 = (((((aLo >> 32) & 0xff) * ((bLo >> 32) & 0xff)) & 0xff) | (((((aLo >> 40) & 0xff) * ((bLo >> 40) & 0xff)) & 0xff) << 8)) << 32;
  const lo3 = (((((aLo >> 48) & 0xff) * ((bLo >> 48) & 0xff)) & 0xff) | (((((aLo >> 56) & 0xff) * ((bLo >> 56) & 0xff)) & 0xff) << 8)) << 48;
  const hi0 = (((aHi & 0xff) * (bHi & 0xff)) & 0xff) | (((((aHi >> 8) & 0xff) * ((bHi >> 8) & 0xff)) & 0xff) << 8);
  const hi1 = (((((aHi >> 16) & 0xff) * ((bHi >> 16) & 0xff)) & 0xff) | (((((aHi >> 24) & 0xff) * ((bHi >> 24) & 0xff)) & 0xff) << 8)) << 16;
  const hi2 = (((((aHi >> 32) & 0xff) * ((bHi >> 32) & 0xff)) & 0xff) | (((((aHi >> 40) & 0xff) * ((bHi >> 40) & 0xff)) & 0xff) << 8)) << 32;
  const hi3 = (((((aHi >> 48) & 0xff) * ((bHi >> 48) & 0xff)) & 0xff) | (((((aHi >> 56) & 0xff) * ((bHi >> 56) & 0xff)) & 0xff) << 8)) << 48;
  return set_pair(lo0 | lo1 | lo2 | lo3, hi0 | hi1 | hi2 | hi3);
}

// @ts-expect-error: decorator
@inline function mul_split32(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const alo0 = aLo as u32;
  const blo0 = bLo as u32;
  const ahi0 = (aLo >> 32) as u32;
  const bhi0 = (bLo >> 32) as u32;
  const alo1 = aHi as u32;
  const blo1 = bHi as u32;
  const ahi1 = (aHi >> 32) as u32;
  const bhi1 = (bHi >> 32) as u32;
  const lo =
    ((((alo0 & 0xff) * (blo0 & 0xff)) & 0xff) as u64) |
    ((((((alo0 >> 8) & 0xff) * ((blo0 >> 8) & 0xff)) & 0xff) as u64) << 8) |
    ((((((alo0 >> 16) & 0xff) * ((blo0 >> 16) & 0xff)) & 0xff) as u64) << 16) |
    ((((((alo0 >> 24) & 0xff) * ((blo0 >> 24) & 0xff)) & 0xff) as u64) << 24) |
    ((((((ahi0) & 0xff) * (bhi0 & 0xff)) & 0xff) as u64) << 32) |
    ((((((((ahi0 >> 8) & 0xff) * ((bhi0 >> 8) & 0xff)) & 0xff)) as u64) << 40)) |
    ((((((((ahi0 >> 16) & 0xff) * ((bhi0 >> 16) & 0xff)) & 0xff)) as u64) << 48)) |
    ((((((((ahi0 >> 24) & 0xff) * ((bhi0 >> 24) & 0xff)) & 0xff)) as u64) << 56));
  const hi =
    ((((alo1 & 0xff) * (blo1 & 0xff)) & 0xff) as u64) |
    ((((((alo1 >> 8) & 0xff) * ((blo1 >> 8) & 0xff)) & 0xff) as u64) << 8) |
    ((((((alo1 >> 16) & 0xff) * ((blo1 >> 16) & 0xff)) & 0xff) as u64) << 16) |
    ((((((alo1 >> 24) & 0xff) * ((blo1 >> 24) & 0xff)) & 0xff) as u64) << 24) |
    ((((((ahi1) & 0xff) * (bhi1 & 0xff)) & 0xff) as u64) << 32) |
    ((((((((ahi1 >> 8) & 0xff) * ((bhi1 >> 8) & 0xff)) & 0xff)) as u64) << 40)) |
    ((((((((ahi1 >> 16) & 0xff) * ((bhi1 >> 16) & 0xff)) & 0xff)) as u64) << 48)) |
    ((((((((ahi1 >> 24) & 0xff) * ((bhi1 >> 24) & 0xff)) & 0xff)) as u64) << 56));
  return set_pair(lo, hi);
}

// @ts-expect-error: decorator
@inline function pack_low_bytes(xLo: u64, xHi: u64): u64 {
  return (
    (xLo & 0xff) |
    (((xLo >> 16) & 0xff) << 8) |
    (((xLo >> 32) & 0xff) << 16) |
    (((xLo >> 48) & 0xff) << 24) |
    ((xHi & 0xff) << 32) |
    (((xHi >> 16) & 0xff) << 40) |
    (((xHi >> 32) & 0xff) << 48) |
    (((xHi >> 48) & 0xff) << 56)
  );
}

// @ts-expect-error: decorator
@inline function mul_extmul(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const lo16Lo = i16x8_swar.extmul_low_i8x16_u(aLo, aHi, bLo, bHi);
  const lo16Hi = i16x8_swar.take_hi();
  const hi16Lo = i16x8_swar.extmul_high_i8x16_u(aLo, aHi, bLo, bHi);
  const hi16Hi = i16x8_swar.take_hi();
  return set_pair(pack_low_bytes(lo16Lo, lo16Hi), pack_low_bytes(hi16Lo, hi16Hi));
}

const aLo: u64 = 0xfedcba9876543210;
const aHi: u64 = 0x0123456789abcdef;
const bLo: u64 = 0x7766554433221100;
const bHi: u64 = 0x13579bdf2468ace0;

if (
  mul_expand(aLo, aHi, bLo, bHi) != mul_pairs(aLo, aHi, bLo, bHi) ||
  mul_expand(aLo, aHi, bLo, bHi) != mul_split32(aLo, aHi, bLo, bHi) ||
  mul_expand(aLo, aHi, bLo, bHi) != mul_extmul(aLo, aHi, bLo, bHi)
) {
  unreachable();
}

bench("i8x16.mul.lib", () => {
  blackbox(mul_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-mul-comp", "lib");

bench("i8x16.mul.expand", () => {
  blackbox(mul_expand(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-mul-comp", "expand");

bench("i8x16.mul.pairs", () => {
  blackbox(mul_pairs(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-mul-comp", "pairs");

bench("i8x16.mul.split32", () => {
  blackbox(mul_split32(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-mul-comp", "split32");

bench("i8x16.mul.extmul", () => {
  blackbox(mul_extmul(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi)));
  blackbox(hi_sink);
}, OPS, 8);
dumpToFile("i8x16-mul-comp", "extmul");

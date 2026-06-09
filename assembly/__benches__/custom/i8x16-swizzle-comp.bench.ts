import { i8x16_swar } from "../../v128/i8x16_swar";
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
@inline function swizzle_lib(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
  const lo = i8x16_swar.swizzle(aLo, aHi, sLo, sHi);
  hi_sink = i8x16_swar.take_hi();
  return lo;
}

// @ts-expect-error: decorator
@inline function relaxed_lib(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
  const lo = i8x16_swar.relaxed_swizzle(aLo, aHi, sLo, sHi);
  hi_sink = i8x16_swar.take_hi();
  return lo;
}

// @ts-expect-error: decorator
@inline function swizzle_if(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
  const i0 = sLo as u8, i1 = (sLo >> 8) as u8, i2 = (sLo >> 16) as u8, i3 = (sLo >> 24) as u8;
  const i4 = (sLo >> 32) as u8, i5 = (sLo >> 40) as u8, i6 = (sLo >> 48) as u8, i7 = (sLo >> 56) as u8;
  const i8 = sHi as u8, i9 = (sHi >> 8) as u8, i10 = (sHi >> 16) as u8, i11 = (sHi >> 24) as u8;
  const i12 = (sHi >> 32) as u8, i13 = (sHi >> 40) as u8, i14 = (sHi >> 48) as u8, i15 = (sHi >> 56) as u8;

  const x0 = i0 < 8 ? aLo : aHi, x1 = i1 < 8 ? aLo : aHi, x2 = i2 < 8 ? aLo : aHi, x3 = i3 < 8 ? aLo : aHi;
  const x4 = i4 < 8 ? aLo : aHi, x5 = i5 < 8 ? aLo : aHi, x6 = i6 < 8 ? aLo : aHi, x7 = i7 < 8 ? aLo : aHi;
  const x8 = i8 < 8 ? aLo : aHi, x9 = i9 < 8 ? aLo : aHi, x10 = i10 < 8 ? aLo : aHi, x11 = i11 < 8 ? aLo : aHi;
  const x12 = i12 < 8 ? aLo : aHi, x13 = i13 < 8 ? aLo : aHi, x14 = i14 < 8 ? aLo : aHi, x15 = i15 < 8 ? aLo : aHi;

  const v0 = i0 > 15 ? 0 : ((x0 >> ((i0 & 7) << 3)) & 0xff);
  const v1 = i1 > 15 ? 0 : ((x1 >> ((i1 & 7) << 3)) & 0xff);
  const v2 = i2 > 15 ? 0 : ((x2 >> ((i2 & 7) << 3)) & 0xff);
  const v3 = i3 > 15 ? 0 : ((x3 >> ((i3 & 7) << 3)) & 0xff);
  const v4 = i4 > 15 ? 0 : ((x4 >> ((i4 & 7) << 3)) & 0xff);
  const v5 = i5 > 15 ? 0 : ((x5 >> ((i5 & 7) << 3)) & 0xff);
  const v6 = i6 > 15 ? 0 : ((x6 >> ((i6 & 7) << 3)) & 0xff);
  const v7 = i7 > 15 ? 0 : ((x7 >> ((i7 & 7) << 3)) & 0xff);
  const v8 = i8 > 15 ? 0 : ((x8 >> ((i8 & 7) << 3)) & 0xff);
  const v9 = i9 > 15 ? 0 : ((x9 >> ((i9 & 7) << 3)) & 0xff);
  const v10 = i10 > 15 ? 0 : ((x10 >> ((i10 & 7) << 3)) & 0xff);
  const v11 = i11 > 15 ? 0 : ((x11 >> ((i11 & 7) << 3)) & 0xff);
  const v12 = i12 > 15 ? 0 : ((x12 >> ((i12 & 7) << 3)) & 0xff);
  const v13 = i13 > 15 ? 0 : ((x13 >> ((i13 & 7) << 3)) & 0xff);
  const v14 = i14 > 15 ? 0 : ((x14 >> ((i14 & 7) << 3)) & 0xff);
  const v15 = i15 > 15 ? 0 : ((x15 >> ((i15 & 7) << 3)) & 0xff);

  return pair(
    v0 | (v1 << 8) | (v2 << 16) | (v3 << 24) | (v4 << 32) | (v5 << 40) | (v6 << 48) | (v7 << 56),
    v8 | (v9 << 8) | (v10 << 16) | (v11 << 24) | (v12 << 32) | (v13 << 40) | (v14 << 48) | (v15 << 56),
  );
}

// @ts-expect-error: decorator
@inline function relaxed_if(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
  const i0 = sLo as u8, i1 = (sLo >> 8) as u8, i2 = (sLo >> 16) as u8, i3 = (sLo >> 24) as u8;
  const i4 = (sLo >> 32) as u8, i5 = (sLo >> 40) as u8, i6 = (sLo >> 48) as u8, i7 = (sLo >> 56) as u8;
  const i8 = sHi as u8, i9 = (sHi >> 8) as u8, i10 = (sHi >> 16) as u8, i11 = (sHi >> 24) as u8;
  const i12 = (sHi >> 32) as u8, i13 = (sHi >> 40) as u8, i14 = (sHi >> 48) as u8, i15 = (sHi >> 56) as u8;

  const x0 = i0 < 8 ? aLo : aHi, x1 = i1 < 8 ? aLo : aHi, x2 = i2 < 8 ? aLo : aHi, x3 = i3 < 8 ? aLo : aHi;
  const x4 = i4 < 8 ? aLo : aHi, x5 = i5 < 8 ? aLo : aHi, x6 = i6 < 8 ? aLo : aHi, x7 = i7 < 8 ? aLo : aHi;
  const x8 = i8 < 8 ? aLo : aHi, x9 = i9 < 8 ? aLo : aHi, x10 = i10 < 8 ? aLo : aHi, x11 = i11 < 8 ? aLo : aHi;
  const x12 = i12 < 8 ? aLo : aHi, x13 = i13 < 8 ? aLo : aHi, x14 = i14 < 8 ? aLo : aHi, x15 = i15 < 8 ? aLo : aHi;

  return pair(
    ((x0 >> ((i0 & 7) << 3)) & 0xff) |
    (((x1 >> ((i1 & 7) << 3)) & 0xff) << 8) |
    (((x2 >> ((i2 & 7) << 3)) & 0xff) << 16) |
    (((x3 >> ((i3 & 7) << 3)) & 0xff) << 24) |
    (((x4 >> ((i4 & 7) << 3)) & 0xff) << 32) |
    (((x5 >> ((i5 & 7) << 3)) & 0xff) << 40) |
    (((x6 >> ((i6 & 7) << 3)) & 0xff) << 48) |
    (((x7 >> ((i7 & 7) << 3)) & 0xff) << 56),
    ((x8 >> ((i8 & 7) << 3)) & 0xff) |
    (((x9 >> ((i9 & 7) << 3)) & 0xff) << 8) |
    (((x10 >> ((i10 & 7) << 3)) & 0xff) << 16) |
    (((x11 >> ((i11 & 7) << 3)) & 0xff) << 24) |
    (((x12 >> ((i12 & 7) << 3)) & 0xff) << 32) |
    (((x13 >> ((i13 & 7) << 3)) & 0xff) << 40) |
    (((x14 >> ((i14 & 7) << 3)) & 0xff) << 48) |
    (((x15 >> ((i15 & 7) << 3)) & 0xff) << 56),
  );
}

// @ts-expect-error: decorator
@inline function swizzle_via_relaxed(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
  const pLo = i8x16_swar.relaxed_swizzle(aLo, aHi, sLo, sHi);
  const pHi = i8x16_swar.take_hi();
  const i0 = sLo as u8, i1 = (sLo >> 8) as u8, i2 = (sLo >> 16) as u8, i3 = (sLo >> 24) as u8;
  const i4 = (sLo >> 32) as u8, i5 = (sLo >> 40) as u8, i6 = (sLo >> 48) as u8, i7 = (sLo >> 56) as u8;
  const i8 = sHi as u8, i9 = (sHi >> 8) as u8, i10 = (sHi >> 16) as u8, i11 = (sHi >> 24) as u8;
  const i12 = (sHi >> 32) as u8, i13 = (sHi >> 40) as u8, i14 = (sHi >> 48) as u8, i15 = (sHi >> 56) as u8;
  const mLo =
    (i0 < 16 ? 0xff : 0) |
    ((i1 < 16 ? 0xff : 0) << 8) |
    ((i2 < 16 ? 0xff : 0) << 16) |
    ((i3 < 16 ? 0xff : 0) << 24) |
    ((i4 < 16 ? 0xff : 0) << 32) |
    ((i5 < 16 ? 0xff : 0) << 40) |
    ((i6 < 16 ? 0xff : 0) << 48) |
    ((i7 < 16 ? 0xff : 0) << 56);
  const mHi =
    (i8 < 16 ? 0xff : 0) |
    ((i9 < 16 ? 0xff : 0) << 8) |
    ((i10 < 16 ? 0xff : 0) << 16) |
    ((i11 < 16 ? 0xff : 0) << 24) |
    ((i12 < 16 ? 0xff : 0) << 32) |
    ((i13 < 16 ? 0xff : 0) << 40) |
    ((i14 < 16 ? 0xff : 0) << 48) |
    ((i15 < 16 ? 0xff : 0) << 56);
  return pair(pLo & mLo, pHi & mHi);
}

const aLo: u64 = 0xfedcba9876543210;
const aHi: u64 = 0x0123456789abcdef;
const sLo: u64 = 0x1f0e0d0c0b0a0908;
const sHi: u64 = 0x1706050403020110;

bench("i8x16.swizzle.lib", () => { blackbox(swizzle_lib(blackbox(aLo), blackbox(aHi), blackbox(sLo), blackbox(sHi))); blackbox(hi_sink); }, OPS, 8);
dumpToFile("i8x16-swizzle-comp", "swizzle-lib");
bench("i8x16.swizzle.if", () => { blackbox(swizzle_if(blackbox(aLo), blackbox(aHi), blackbox(sLo), blackbox(sHi))); blackbox(hi_sink); }, OPS, 8);
dumpToFile("i8x16-swizzle-comp", "swizzle-if");
bench("i8x16.swizzle.via-relaxed", () => { blackbox(swizzle_via_relaxed(blackbox(aLo), blackbox(aHi), blackbox(sLo), blackbox(sHi))); blackbox(hi_sink); }, OPS, 8);
dumpToFile("i8x16-swizzle-comp", "swizzle-via-relaxed");

bench("i8x16.relaxed-swizzle.lib", () => { blackbox(relaxed_lib(blackbox(aLo), blackbox(aHi), blackbox(sLo), blackbox(sHi))); blackbox(hi_sink); }, OPS, 8);
dumpToFile("i8x16-swizzle-comp", "relaxed-lib");
bench("i8x16.relaxed-swizzle.if", () => { blackbox(relaxed_if(blackbox(aLo), blackbox(aHi), blackbox(sLo), blackbox(sHi))); blackbox(hi_sink); }, OPS, 8);
dumpToFile("i8x16-swizzle-comp", "relaxed-if");

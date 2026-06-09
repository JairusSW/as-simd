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
@inline function min_s_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { const lo = i8x16_swar.min_s(aLo, aHi, bLo, bHi); hi_sink = i8x16_swar.take_hi(); return lo; }
// @ts-expect-error: decorator
@inline function min_u_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { const lo = i8x16_swar.min_u(aLo, aHi, bLo, bHi); hi_sink = i8x16_swar.take_hi(); return lo; }
// @ts-expect-error: decorator
@inline function max_s_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { const lo = i8x16_swar.max_s(aLo, aHi, bLo, bHi); hi_sink = i8x16_swar.take_hi(); return lo; }
// @ts-expect-error: decorator
@inline function max_u_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 { const lo = i8x16_swar.max_u(aLo, aHi, bLo, bHi); hi_sink = i8x16_swar.take_hi(); return lo; }

// @ts-expect-error: decorator
@inline function min_s_via_lt(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const mLo = i8x16_swar.lt_s(aLo, aHi, bLo, bHi);
  const mHi = i8x16_swar.take_hi();
  return set_pair(bLo ^ ((aLo ^ bLo) & mLo), bHi ^ ((aHi ^ bHi) & mHi));
}
// @ts-expect-error: decorator
@inline function min_u_via_lt(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const mLo = i8x16_swar.lt_u(aLo, aHi, bLo, bHi);
  const mHi = i8x16_swar.take_hi();
  return set_pair(bLo ^ ((aLo ^ bLo) & mLo), bHi ^ ((aHi ^ bHi) & mHi));
}
// @ts-expect-error: decorator
@inline function max_s_via_lt(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const mLo = i8x16_swar.lt_s(aLo, aHi, bLo, bHi);
  const mHi = i8x16_swar.take_hi();
  return set_pair(aLo ^ ((aLo ^ bLo) & mLo), aHi ^ ((aHi ^ bHi) & mHi));
}
// @ts-expect-error: decorator
@inline function max_u_via_lt(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const mLo = i8x16_swar.lt_u(aLo, aHi, bLo, bHi);
  const mHi = i8x16_swar.take_hi();
  return set_pair(aLo ^ ((aLo ^ bLo) & mLo), aHi ^ ((aHi ^ bHi) & mHi));
}

// @ts-expect-error: decorator
@inline function min_s_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const axLo = aLo ^ 0x8080808080808080;
  const bxLo = bLo ^ 0x8080808080808080;
  const dLo = ((axLo | 0x8080808080808080) - (bxLo & 0x7f7f7f7f7f7f7f7f)) ^ ((axLo ^ ~bxLo) & 0x8080808080808080);
  const mLo = ((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
  const axHi = aHi ^ 0x8080808080808080;
  const bxHi = bHi ^ 0x8080808080808080;
  const dHi = ((axHi | 0x8080808080808080) - (bxHi & 0x7f7f7f7f7f7f7f7f)) ^ ((axHi ^ ~bxHi) & 0x8080808080808080);
  const mHi = ((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
  return set_pair(bLo ^ ((aLo ^ bLo) & mLo), bHi ^ ((aHi ^ bHi) & mHi));
}
// @ts-expect-error: decorator
@inline function min_u_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const dLo = ((aLo | 0x8080808080808080) - (bLo & 0x7f7f7f7f7f7f7f7f)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
  const mLo = ((((~aLo & bLo) | (~(aLo ^ bLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
  const dHi = ((aHi | 0x8080808080808080) - (bHi & 0x7f7f7f7f7f7f7f7f)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
  const mHi = ((((~aHi & bHi) | (~(aHi ^ bHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
  return set_pair(bLo ^ ((aLo ^ bLo) & mLo), bHi ^ ((aHi ^ bHi) & mHi));
}
// @ts-expect-error: decorator
@inline function max_s_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const axLo = aLo ^ 0x8080808080808080;
  const bxLo = bLo ^ 0x8080808080808080;
  const dLo = ((axLo | 0x8080808080808080) - (bxLo & 0x7f7f7f7f7f7f7f7f)) ^ ((axLo ^ ~bxLo) & 0x8080808080808080);
  const mLo = ((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
  const axHi = aHi ^ 0x8080808080808080;
  const bxHi = bHi ^ 0x8080808080808080;
  const dHi = ((axHi | 0x8080808080808080) - (bxHi & 0x7f7f7f7f7f7f7f7f)) ^ ((axHi ^ ~bxHi) & 0x8080808080808080);
  const mHi = ((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
  return set_pair(aLo ^ ((aLo ^ bLo) & mLo), aHi ^ ((aHi ^ bHi) & mHi));
}
// @ts-expect-error: decorator
@inline function max_u_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const dLo = ((aLo | 0x8080808080808080) - (bLo & 0x7f7f7f7f7f7f7f7f)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
  const mLo = ((((~aLo & bLo) | (~(aLo ^ bLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
  const dHi = ((aHi | 0x8080808080808080) - (bHi & 0x7f7f7f7f7f7f7f7f)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
  const mHi = ((((~aHi & bHi) | (~(aHi ^ bHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
  return set_pair(aLo ^ ((aLo ^ bLo) & mLo), aHi ^ ((aHi ^ bHi) & mHi));
}

const aLo: u64 = 0xfedcba9876543210;
const aHi: u64 = 0x0123456789abcdef;
const bLo: u64 = 0x7766554433221100;
const bHi: u64 = 0x13579bdf2468ace0;

bench("i8x16.min-s.lib", () => { blackbox(min_s_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "min-s-lib");
bench("i8x16.min-s.via-lt", () => { blackbox(min_s_via_lt(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "min-s-via-lt");
bench("i8x16.min-s.old", () => { blackbox(min_s_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "min-s-old");

bench("i8x16.min-u.lib", () => { blackbox(min_u_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "min-u-lib");
bench("i8x16.min-u.via-lt", () => { blackbox(min_u_via_lt(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "min-u-via-lt");
bench("i8x16.min-u.old", () => { blackbox(min_u_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "min-u-old");

bench("i8x16.max-s.lib", () => { blackbox(max_s_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "max-s-lib");
bench("i8x16.max-s.via-lt", () => { blackbox(max_s_via_lt(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "max-s-via-lt");
bench("i8x16.max-s.old", () => { blackbox(max_s_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "max-s-old");

bench("i8x16.max-u.lib", () => { blackbox(max_u_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "max-u-lib");
bench("i8x16.max-u.via-lt", () => { blackbox(max_u_via_lt(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "max-u-via-lt");
bench("i8x16.max-u.old", () => { blackbox(max_u_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-minmax-comp", "max-u-old");

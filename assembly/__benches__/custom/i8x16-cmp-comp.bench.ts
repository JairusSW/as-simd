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

// signed
// @ts-expect-error: decorator
@inline function lt_s_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.lt_s(aLo, aHi, bLo, bHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function le_s_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.le_s(aLo, aHi, bLo, bHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function gt_s_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.gt_s(aLo, aHi, bLo, bHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function ge_s_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.ge_s(aLo, aHi, bLo, bHi);
  hi_sink = pair[1];
  return pair[0];
}

// @ts-expect-error: decorator
@inline function lt_s_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let ax = aLo ^ 0x8080808080808080;
  let bx = bLo ^ 0x8080808080808080;
  let d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
  const lo = ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
  ax = aHi ^ 0x8080808080808080;
  bx = bHi ^ 0x8080808080808080;
  d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
  return set_pair(lo, ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff);
}
// @ts-expect-error: decorator
@inline function le_s_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let bx = bLo ^ 0x8080808080808080;
  let ax = aLo ^ 0x8080808080808080;
  let d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080);
  const lo = ~(((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff);
  bx = bHi ^ 0x8080808080808080;
  ax = aHi ^ 0x8080808080808080;
  d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080);
  return set_pair(lo, ~(((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff));
}
// @ts-expect-error: decorator
@inline function gt_s_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let bx = bLo ^ 0x8080808080808080;
  let ax = aLo ^ 0x8080808080808080;
  let d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080);
  const lo = ((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff;
  bx = bHi ^ 0x8080808080808080;
  ax = aHi ^ 0x8080808080808080;
  d = ((bx | 0x8080808080808080) - (ax & 0x7f7f7f7f7f7f7f7f)) ^ ((bx ^ ~ax) & 0x8080808080808080);
  return set_pair(lo, ((((~bx & ax) | (~(bx ^ ax) & d)) & 0x8080808080808080) >> 7) * 0xff);
}
// @ts-expect-error: decorator
@inline function ge_s_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let ax = aLo ^ 0x8080808080808080;
  let bx = bLo ^ 0x8080808080808080;
  let d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
  const lo = ~(((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff);
  ax = aHi ^ 0x8080808080808080;
  bx = bHi ^ 0x8080808080808080;
  d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
  return set_pair(lo, ~(((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff));
}

// @ts-expect-error: decorator
@inline function lt_s_via_ge(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.ge_s(aLo, aHi, bLo, bHi);
  const lo = pair[0];
  return set_pair(~lo, ~pair[1]);
}
// @ts-expect-error: decorator
@inline function le_s_via_ge(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.ge_s(bLo, bHi, aLo, aHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function gt_s_via_lt(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.lt_s(bLo, bHi, aLo, aHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function ge_s_via_lt(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.lt_s(aLo, aHi, bLo, bHi);
  const lo = pair[0];
  return set_pair(~lo, ~pair[1]);
}

// unsigned
// @ts-expect-error: decorator
@inline function lt_u_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.lt_u(aLo, aHi, bLo, bHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function le_u_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.le_u(aLo, aHi, bLo, bHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function gt_u_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.gt_u(aLo, aHi, bLo, bHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function ge_u_lib(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const pair = i8x16_swar.ge_u(aLo, aHi, bLo, bHi);
  hi_sink = pair[1];
  return pair[0];
}
// @ts-expect-error: decorator
@inline function lt_u_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let d = ((aLo | 0x8080808080808080) - (bLo & 0x7f7f7f7f7f7f7f7f)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
  const lo = ((((~aLo & bLo) | (~(aLo ^ bLo) & d)) & 0x8080808080808080) >> 7) * 0xff;
  d = ((aHi | 0x8080808080808080) - (bHi & 0x7f7f7f7f7f7f7f7f)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
  return set_pair(lo, ((((~aHi & bHi) | (~(aHi ^ bHi) & d)) & 0x8080808080808080) >> 7) * 0xff);
}
// @ts-expect-error: decorator
@inline function le_u_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let d = ((bLo | 0x8080808080808080) - (aLo & 0x7f7f7f7f7f7f7f7f)) ^ ((bLo ^ ~aLo) & 0x8080808080808080);
  const lo = ~(((((~bLo & aLo) | (~(bLo ^ aLo) & d)) & 0x8080808080808080) >> 7) * 0xff);
  d = ((bHi | 0x8080808080808080) - (aHi & 0x7f7f7f7f7f7f7f7f)) ^ ((bHi ^ ~aHi) & 0x8080808080808080);
  return set_pair(lo, ~(((((~bHi & aHi) | (~(bHi ^ aHi) & d)) & 0x8080808080808080) >> 7) * 0xff));
}
// @ts-expect-error: decorator
@inline function gt_u_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let d = ((bLo | 0x8080808080808080) - (aLo & 0x7f7f7f7f7f7f7f7f)) ^ ((bLo ^ ~aLo) & 0x8080808080808080);
  const lo = ((((~bLo & aLo) | (~(bLo ^ aLo) & d)) & 0x8080808080808080) >> 7) * 0xff;
  d = ((bHi | 0x8080808080808080) - (aHi & 0x7f7f7f7f7f7f7f7f)) ^ ((bHi ^ ~aHi) & 0x8080808080808080);
  return set_pair(lo, ((((~bHi & aHi) | (~(bHi ^ aHi) & d)) & 0x8080808080808080) >> 7) * 0xff);
}
// @ts-expect-error: decorator
@inline function ge_u_old(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let d = ((aLo | 0x8080808080808080) - (bLo & 0x7f7f7f7f7f7f7f7f)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
  const lo = ~(((((~aLo & bLo) | (~(aLo ^ bLo) & d)) & 0x8080808080808080) >> 7) * 0xff);
  d = ((aHi | 0x8080808080808080) - (bHi & 0x7f7f7f7f7f7f7f7f)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
  return set_pair(lo, ~(((((~aHi & bHi) | (~(aHi ^ bHi) & d)) & 0x8080808080808080) >> 7) * 0xff));
}

const aLo: u64 = 0xfedcba9876543210;
const aHi: u64 = 0x0123456789abcdef;
const bLo: u64 = 0x7766554433221100;
const bHi: u64 = 0x13579bdf2468ace0;

bench("i8x16.lt-s.lib", () => { blackbox(lt_s_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "lt-s-lib");
bench("i8x16.lt-s.old", () => { blackbox(lt_s_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "lt-s-old");
bench("i8x16.lt-s.via-ge", () => { blackbox(lt_s_via_ge(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "lt-s-via-ge");

bench("i8x16.le-s.lib", () => { blackbox(le_s_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "le-s-lib");
bench("i8x16.le-s.old", () => { blackbox(le_s_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "le-s-old");
bench("i8x16.le-s.via-ge", () => { blackbox(le_s_via_ge(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "le-s-via-ge");

bench("i8x16.gt-s.lib", () => { blackbox(gt_s_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "gt-s-lib");
bench("i8x16.gt-s.old", () => { blackbox(gt_s_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "gt-s-old");
bench("i8x16.gt-s.via-lt", () => { blackbox(gt_s_via_lt(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "gt-s-via-lt");

bench("i8x16.ge-s.lib", () => { blackbox(ge_s_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "ge-s-lib");
bench("i8x16.ge-s.old", () => { blackbox(ge_s_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "ge-s-old");
bench("i8x16.ge-s.via-lt", () => { blackbox(ge_s_via_lt(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "ge-s-via-lt");

bench("i8x16.lt-u.lib", () => { blackbox(lt_u_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "lt-u-lib");
bench("i8x16.lt-u.old", () => { blackbox(lt_u_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "lt-u-old");

bench("i8x16.le-u.lib", () => { blackbox(le_u_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "le-u-lib");
bench("i8x16.le-u.old", () => { blackbox(le_u_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "le-u-old");

bench("i8x16.gt-u.lib", () => { blackbox(gt_u_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "gt-u-lib");
bench("i8x16.gt-u.old", () => { blackbox(gt_u_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "gt-u-old");

bench("i8x16.ge-u.lib", () => { blackbox(ge_u_lib(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "ge-u-lib");
bench("i8x16.ge-u.old", () => { blackbox(ge_u_old(blackbox(aLo), blackbox(aHi), blackbox(bLo), blackbox(bHi))); blackbox(hi_sink); }, OPS, 8); dumpToFile("i8x16-cmp-comp", "ge-u-old");

import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function next64(): u64 { return bench_common.next64(); }
// @ts-expect-error: decorator
@inline function next128(): u64 { return bench_common.next128(); }
// @ts-expect-error: decorator
@inline function next128Hi(): u64 { return bench_common.next128Hi(); }

// @ts-expect-error: decorator
@inline function nextA(): u64 {
  return blackbox(next64());
}

// @ts-expect-error: decorator
@inline function nextS(): u64 {
  return blackbox(bench_common.next64Alt());
}

// @ts-expect-error: decorator
@inline function zero_mask(x: u64): u64 {
  return ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
}

// Current library entrypoint
// @ts-expect-error: decorator
@inline function swizzle_current(a: u64, s: u64): u64 {
  return i8x8.swizzle(a, s);
}

// Manual variant mirroring current code shape (& 0xff lane extract)
// @ts-expect-error: decorator
@inline function swizzle_manual_ff(a: u64, s: u64): u64 {
  const t = s & 0x0707070707070707;
  const i0 = (t & 0xff) as u64;
  const i1 = ((t >> 8) & 0xff) as u64;
  const i2 = ((t >> 16) & 0xff) as u64;
  const i3 = ((t >> 24) & 0xff) as u64;
  const i4 = ((t >> 32) & 0xff) as u64;
  const i5 = ((t >> 40) & 0xff) as u64;
  const i6 = ((t >> 48) & 0xff) as u64;
  const i7 = ((t >> 56) & 0xff) as u64;
  const out = ((a >> (i0 << 3)) & 0xff)
    | (((a >> (i1 << 3)) & 0xff) << 8)
    | (((a >> (i2 << 3)) & 0xff) << 16)
    | (((a >> (i3 << 3)) & 0xff) << 24)
    | (((a >> (i4 << 3)) & 0xff) << 32)
    | (((a >> (i5 << 3)) & 0xff) << 40)
    | (((a >> (i6 << 3)) & 0xff) << 48)
    | (((a >> (i7 << 3)) & 0xff) << 56);
  return out & zero_mask(s & 0xf8f8f8f8f8f8f8f8);
}

// Manual variant using tighter lane masks (& 0x07)
// @ts-expect-error: decorator
@inline function swizzle_manual_07(a: u64, s: u64): u64 {
  const t = s & 0x0707070707070707;
  const i0 = (t & 0x07) as u64;
  const i1 = ((t >> 8) & 0x07) as u64;
  const i2 = ((t >> 16) & 0x07) as u64;
  const i3 = ((t >> 24) & 0x07) as u64;
  const i4 = ((t >> 32) & 0x07) as u64;
  const i5 = ((t >> 40) & 0x07) as u64;
  const i6 = ((t >> 48) & 0x07) as u64;
  const i7 = ((t >> 56) & 0x07) as u64;
  const out = ((a >> (i0 << 3)) & 0xff)
    | (((a >> (i1 << 3)) & 0xff) << 8)
    | (((a >> (i2 << 3)) & 0xff) << 16)
    | (((a >> (i3 << 3)) & 0xff) << 24)
    | (((a >> (i4 << 3)) & 0xff) << 32)
    | (((a >> (i5 << 3)) & 0xff) << 40)
    | (((a >> (i6 << 3)) & 0xff) << 48)
    | (((a >> (i7 << 3)) & 0xff) << 56);
  return out & zero_mask(s & 0xf8f8f8f8f8f8f8f8);
}

// Compose from relaxed swizzle + validity mask
// @ts-expect-error: decorator
@inline function swizzle_via_relaxed(a: u64, s: u64): u64 {
  return i8x8.relaxed_swizzle(a, s) & zero_mask(s & 0xf8f8f8f8f8f8f8f8);
}

bench("swizzle.current", () => {
  blackbox(swizzle_current(nextA(), nextS()));
}, OPS, 8);
dumpToFile("swizzle-comp", "current");

bench("swizzle.manual-ff", () => {
  blackbox(swizzle_manual_ff(nextA(), nextS()));
}, OPS, 8);
dumpToFile("swizzle-comp", "manual-ff");

bench("swizzle.manual-07", () => {
  blackbox(swizzle_manual_07(nextA(), nextS()));
}, OPS, 8);
dumpToFile("swizzle-comp", "manual-07");

bench("swizzle.via-relaxed", () => {
  blackbox(swizzle_via_relaxed(nextA(), nextS()));
}, OPS, 8);
dumpToFile("swizzle-comp", "via-relaxed");

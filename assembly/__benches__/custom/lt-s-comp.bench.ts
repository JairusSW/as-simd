import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

// @ts-expect-error: decorator
@inline function lt_s_lib(a: u64, b: u64): u64 { return i8x8.lt_s(a, b); }

// @ts-expect-error: decorator
@inline function lt_s_current(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const d = ((ax | 0x8080808080808080) - (bx & 0x7f7f7f7f7f7f7f7f)) ^ ((ax ^ ~bx) & 0x8080808080808080);
  return ((((~ax & bx) | (~(ax ^ bx) & d)) & 0x8080808080808080) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function lt_s_split16(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const dlo = ((ax | 0x0080008000800080) - (bx & 0x007f007f007f007f)) ^ ((ax ^ ~bx) & 0x0080008000800080);
  const dhi = ((ax | 0x8000800080008000) - (bx & 0x7f007f007f007f00)) ^ ((ax ^ ~bx) & 0x8000800080008000);
  const ml = (((~ax & bx) | (~(ax ^ bx) & dlo)) & 0x0080008000800080) >> 7;
  const mh = (((~ax & bx) | (~(ax ^ bx) & dhi)) & 0x8000800080008000) >> 7;
  return ((ml * 0xff) & 0x00ff00ff00ff00ff) | ((mh * 0xff) & 0xff00ff00ff00ff00);
}

// @ts-expect-error: decorator
@inline function lt_s_split32(a: u64, b: u64): u64 {
  const ax = a ^ 0x8080808080808080;
  const bx = b ^ 0x8080808080808080;
  const alo = ax as u32;
  const blo = bx as u32;
  const ahi = (ax >> 32) as u32;
  const bhi = (bx >> 32) as u32;
  const dlo = ((alo | 0x80808080) - (blo & 0x7f7f7f7f)) ^ ((alo ^ ~blo) & 0x80808080);
  const dhi = ((ahi | 0x80808080) - (bhi & 0x7f7f7f7f)) ^ ((ahi ^ ~bhi) & 0x80808080);
  const mlo = (((~alo & blo) | (~(alo ^ blo) & dlo)) & 0x80808080) >> 7;
  const mhi = (((~ahi & bhi) | (~(ahi ^ bhi) & dhi)) & 0x80808080) >> 7;
  return ((mlo * 0xff) as u64) | (((mhi * 0xff) as u64) << 32);
}

const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

bench("lt-s.lib", () => { blackbox(lt_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("lt-s-comp", "lib");
bench("lt-s.current", () => { blackbox(lt_s_current(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("lt-s-comp", "current");
bench("lt-s.split16", () => { blackbox(lt_s_split16(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("lt-s-comp", "split16");
bench("lt-s.split32", () => { blackbox(lt_s_split32(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("lt-s-comp", "split32");

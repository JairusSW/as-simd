import { i32x2 } from "../../v64/i32x2";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function lt_s_lib(a: u64, b: u64): u64 { return i32x2.lt_s(a, b); }
// @ts-expect-error: decorator
@inline function le_s_lib(a: u64, b: u64): u64 { return i32x2.le_s(a, b); }
// @ts-expect-error: decorator
@inline function gt_s_lib(a: u64, b: u64): u64 { return i32x2.gt_s(a, b); }
// @ts-expect-error: decorator
@inline function ge_s_lib(a: u64, b: u64): u64 { return i32x2.ge_s(a, b); }

// @ts-expect-error: decorator
@inline function lt_s_via_ge(a: u64, b: u64): u64 { return ~i32x2.ge_s(a, b); }
// @ts-expect-error: decorator
@inline function le_s_via_ge(a: u64, b: u64): u64 { return i32x2.ge_s(b, a); }
// @ts-expect-error: decorator
@inline function gt_s_via_le(a: u64, b: u64): u64 { return ~i32x2.le_s(a, b); }
// @ts-expect-error: decorator
@inline function gt_s_via_lt(a: u64, b: u64): u64 { return i32x2.lt_s(b, a); }
// @ts-expect-error: decorator
@inline function ge_s_via_lt(a: u64, b: u64): u64 { return ~i32x2.lt_s(a, b); }

// @ts-expect-error: decorator
@inline function lt_s_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as i32;
  const a1 = ((a >> 32) & 0xffffffff) as i32;
  const b0 = (b & 0xffffffff) as i32;
  const b1 = ((b >> 32) & 0xffffffff) as i32;
  return (select<u64>(0xffffffff, 0, a0 < b0)) | (select<u64>(0xffffffff, 0, a1 < b1) << 32);
}
// @ts-expect-error: decorator
@inline function le_s_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as i32;
  const a1 = ((a >> 32) & 0xffffffff) as i32;
  const b0 = (b & 0xffffffff) as i32;
  const b1 = ((b >> 32) & 0xffffffff) as i32;
  return (select<u64>(0xffffffff, 0, a0 <= b0)) | (select<u64>(0xffffffff, 0, a1 <= b1) << 32);
}
// @ts-expect-error: decorator
@inline function gt_s_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as i32;
  const a1 = ((a >> 32) & 0xffffffff) as i32;
  const b0 = (b & 0xffffffff) as i32;
  const b1 = ((b >> 32) & 0xffffffff) as i32;
  return (select<u64>(0xffffffff, 0, a0 > b0)) | (select<u64>(0xffffffff, 0, a1 > b1) << 32);
}
// @ts-expect-error: decorator
@inline function ge_s_old(a: u64, b: u64): u64 {
  const a0 = (a & 0xffffffff) as i32;
  const a1 = ((a >> 32) & 0xffffffff) as i32;
  const b0 = (b & 0xffffffff) as i32;
  const b1 = ((b >> 32) & 0xffffffff) as i32;
  return (select<u64>(0xffffffff, 0, a0 >= b0)) | (select<u64>(0xffffffff, 0, a1 >= b1) << 32);
}

bench("i32x2-lt-s.lib", () => { blackbox(lt_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "lt-lib");
bench("i32x2-lt-s.via-ge", () => { blackbox(lt_s_via_ge(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "lt-via-ge");
bench("i32x2-lt-s.old", () => { blackbox(lt_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "lt-old");
bench("i32x2-le-s.lib", () => { blackbox(le_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "le-lib");
bench("i32x2-le-s.via-ge", () => { blackbox(le_s_via_ge(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "le-via-ge");
bench("i32x2-le-s.old", () => { blackbox(le_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "le-old");
bench("i32x2-gt-s.lib", () => { blackbox(gt_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "gt-lib");
bench("i32x2-gt-s.via-le", () => { blackbox(gt_s_via_le(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "gt-via-le");
bench("i32x2-gt-s.via-lt", () => { blackbox(gt_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "gt-via-lt");
bench("i32x2-gt-s.old", () => { blackbox(gt_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "gt-old");
bench("i32x2-ge-s.lib", () => { blackbox(ge_s_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "ge-lib");
bench("i32x2-ge-s.via-lt", () => { blackbox(ge_s_via_lt(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "ge-via-lt");
bench("i32x2-ge-s.old", () => { blackbox(ge_s_old(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i32x2-signed-cmp-comp", "ge-old");

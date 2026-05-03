import { i16x4 } from "../../v64/i16x4";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function mul_lib(a: u64, b: u64): u64 { return i16x4.mul(a, b); }
// @ts-expect-error: decorator
@inline function mul_pack4(a: u64, b: u64): u64 {
  return (((a & 0xffff) * (b & 0xffff)) & 0xffff) |
    (((((a >> 16) & 0xffff) * ((b >> 16) & 0xffff)) & 0xffff) << 16) |
    (((((a >> 32) & 0xffff) * ((b >> 32) & 0xffff)) & 0xffff) << 32) |
    (((((a >> 48) & 0xffff) * ((b >> 48) & 0xffff)) & 0xffff) << 48);
}
// @ts-expect-error: decorator
@inline function mul_locals(a: u64, b: u64): u64 {
  const p0 = (((a & 0xffff) * (b & 0xffff)) & 0xffff) as u64;
  const p1 = ((((a >> 16) & 0xffff) * ((b >> 16) & 0xffff)) & 0xffff) as u64;
  const p2 = ((((a >> 32) & 0xffff) * ((b >> 32) & 0xffff)) & 0xffff) as u64;
  const p3 = ((((a >> 48) & 0xffff) * ((b >> 48) & 0xffff)) & 0xffff) as u64;
  return p0 | (p1 << 16) | (p2 << 32) | (p3 << 48);
}
// @ts-expect-error: decorator
@inline function mul_split32(a: u64, b: u64): u64 {
  const lo = (((a & 0xffff) * (b & 0xffff)) & 0xffff) | (((((a >> 16) & 0xffff) * ((b >> 16) & 0xffff)) & 0xffff) << 16);
  const hi = (((((a >> 32) & 0xffff) * ((b >> 32) & 0xffff)) & 0xffff) | (((((a >> 48) & 0xffff) * ((b >> 48) & 0xffff)) & 0xffff) << 16));
  return (lo as u64) | ((hi as u64) << 32);
}

bench("i16x4-mul.lib", () => { blackbox(mul_lib(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-mul-comp", "lib");
bench("i16x4-mul.pack4", () => { blackbox(mul_pack4(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-mul-comp", "pack4");
bench("i16x4-mul.locals", () => { blackbox(mul_locals(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-mul-comp", "locals");
bench("i16x4-mul.split32", () => { blackbox(mul_split32(blackbox(a), blackbox(b))); }, OPS, 8); dumpToFile("i16x4-mul-comp", "split32");

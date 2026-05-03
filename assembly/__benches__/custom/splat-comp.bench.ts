import { i8x8 } from "../../v64/i8x8";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const x: i8 = -37;

// @ts-expect-error: decorator
@inline function splat_mul(x: i8): u64 {
  return ((x as u64) & 0xff) * 0x0101010101010101;
}

// @ts-expect-error: decorator
@inline function splat_or32(x: i8): u64 {
  const b = (x as u32) & 0xff;
  const w = b | (b << 8) | (b << 16) | (b << 24);
  return (w as u64) | ((w as u64) << 32);
}

// @ts-expect-error: decorator
@inline function splat_or64(x: i8): u64 {
  let y = (x as u64) & 0xff;
  y |= y << 8;
  y |= y << 16;
  return y | (y << 32);
}

bench("splat.lib", () => { blackbox(i8x8.splat(blackbox(x))); }, OPS, 8); dumpToFile("splat-comp", "lib");
bench("splat.mul", () => { blackbox(splat_mul(blackbox(x))); }, OPS, 8); dumpToFile("splat-comp", "mul");
bench("splat.or32", () => { blackbox(splat_or32(blackbox(x))); }, OPS, 8); dumpToFile("splat-comp", "or32");
bench("splat.or64", () => { blackbox(splat_or64(blackbox(x))); }, OPS, 8); dumpToFile("splat-comp", "or64");

import { i8x8 } from "../../v64/lanes";
import { bench_common } from "../common";
import { bench, blackbox, dumpToFile } from "../lib/bench";
const OPS: u64 = bench_common.DEFAULT_OPS;
// @ts-expect-error: decorator
@inline function sat_s(x: i32): u64 {
  return (<u64>(x > 127 ? 127 : x < -128 ? -128 : x)) & 0xff;
}
// @ts-expect-error: decorator
@inline function sat_u(x: i32): u64 {
  return (<u64>(x < 0 ? 0 : x > 255 ? 255 : x)) & 0xff;
}
// @ts-expect-error: decorator
@inline function lane16(x: u64, i: i32): i32 {
  return <i16>((x >> (i << 4)) & 0xffff);
}
// @ts-expect-error: decorator
@inline function narrow_s_lib(a: u64, b: u64): u64 {
  return i8x8.narrow_i16x4_s(a, b);
}
// @ts-expect-error: decorator
@inline function narrow_u_lib(a: u64, b: u64): u64 {
  return i8x8.narrow_i16x4_u(a, b);
}
// @ts-expect-error: decorator
@inline function narrow_s_scalar(a: u64, b: u64): u64 {
  return (
    sat_s(lane16(a, 0)) |
    (sat_s(lane16(a, 1)) << 8) |
    (sat_s(lane16(a, 2)) << 16) |
    (sat_s(lane16(a, 3)) << 24) |
    (sat_s(lane16(b, 0)) << 32) |
    (sat_s(lane16(b, 1)) << 40) |
    (sat_s(lane16(b, 2)) << 48) |
    (sat_s(lane16(b, 3)) << 56)
  );
}
// @ts-expect-error: decorator
@inline function narrow_u_scalar(a: u64, b: u64): u64 {
  return (
    sat_u(lane16(a, 0)) |
    (sat_u(lane16(a, 1)) << 8) |
    (sat_u(lane16(a, 2)) << 16) |
    (sat_u(lane16(a, 3)) << 24) |
    (sat_u(lane16(b, 0)) << 32) |
    (sat_u(lane16(b, 1)) << 40) |
    (sat_u(lane16(b, 2)) << 48) |
    (sat_u(lane16(b, 3)) << 56)
  );
}
const a: u64 = 0xfedcba9876543210;
const b: u64 = 0x7766554433221100;
bench(
  "narrow-s.lib",
  () => {
    blackbox(narrow_s_lib(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("narrow-comp", "s-lib");
bench(
  "narrow-s.scalar",
  () => {
    blackbox(narrow_s_scalar(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("narrow-comp", "s-scalar");
bench(
  "narrow-u.lib",
  () => {
    blackbox(narrow_u_lib(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("narrow-comp", "u-lib");
bench(
  "narrow-u.scalar",
  () => {
    blackbox(narrow_u_scalar(blackbox(a), blackbox(b)));
  },
  OPS,
  8,
);
dumpToFile("narrow-comp", "u-scalar");

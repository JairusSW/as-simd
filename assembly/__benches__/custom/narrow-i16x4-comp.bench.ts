import { i8x8 } from "../../v64/i8x8";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = 25_000_000;

let s0: u64 = 0x0123456789abcdef;
let s1: u64 = 0x8899aabbccddeeff;
let s2: u64 = 0xfedcba9876543210;
let s3: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function next64(x: u64): u64 {
  x ^= x << 13;
  x ^= x >> 7;
  x ^= x << 17;
  return x;
}

// @ts-expect-error: decorator
@inline function nextA(): u64 {
  s0 = next64(s0);
  s2 = next64(s2);
  return blackbox(s0 ^ (s2 >> 17));
}

// @ts-expect-error: decorator
@inline function nextB(): u64 {
  s1 = next64(s1);
  s3 = next64(s3);
  return blackbox(s1 ^ (s3 << 13));
}

// @ts-expect-error: decorator
@inline function pack8(
  b0: u64, b1: u64, b2: u64, b3: u64,
  b4: u64, b5: u64, b6: u64, b7: u64,
): u64 {
  return b0 | (b1 << 8) | (b2 << 16) | (b3 << 24) | (b4 << 32) | (b5 << 40) | (b6 << 48) | (b7 << 56);
}

// @ts-expect-error: decorator
@inline function zero_mask(x: u64): u64 {
  return ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function add_swar16(a: u64, b: u64): u64 {
  return ((a & ~0x8000800080008000) + (b & ~0x8000800080008000)) ^ ((a ^ b) & 0x8000800080008000);
}

// @ts-expect-error: decorator
@inline function pack_low_bytes(x: u64): u64 {
  x &= 0x00ff00ff00ff00ff;
  x = (x | (x >> 8)) & 0x0000ffff0000ffff;
  return (x | (x >> 16)) & 0x00000000ffffffff;
}

// scalar/select path, signed
// @ts-expect-error: decorator
@inline function narrow4_s_scalar(x: u64): u64 {
  const x0 = ((x >> 0) & 0xffff) as i16;
  const x1 = ((x >> 16) & 0xffff) as i16;
  const x2 = ((x >> 32) & 0xffff) as i16;
  const x3 = ((x >> 48) & 0xffff) as i16;

  const y0 = select<i16>(select<i16>(x0, -128, x0 < -128), 127, x0 > 127) as u64;
  const y1 = select<i16>(select<i16>(x1, -128, x1 < -128), 127, x1 > 127) as u64;
  const y2 = select<i16>(select<i16>(x2, -128, x2 < -128), 127, x2 > 127) as u64;
  const y3 = select<i16>(select<i16>(x3, -128, x3 < -128), 127, x3 > 127) as u64;

  return y0 | (y1 << 8) | (y2 << 16) | (y3 << 24);
}

// scalar/select path, unsigned
// @ts-expect-error: decorator
@inline function narrow4_u_scalar(x: u64): u64 {
  const x0 = ((x >> 0) & 0xffff) as i16;
  const x1 = ((x >> 16) & 0xffff) as i16;
  const x2 = ((x >> 32) & 0xffff) as i16;
  const x3 = ((x >> 48) & 0xffff) as i16;

  const y0 = select<i16>(select<i16>(x0, 0, x0 < 0), 255, x0 > 255) as u64;
  const y1 = select<i16>(select<i16>(x1, 0, x1 < 0), 255, x1 > 255) as u64;
  const y2 = select<i16>(select<i16>(x2, 0, x2 < 0), 255, x2 > 255) as u64;
  const y3 = select<i16>(select<i16>(x3, 0, x3 < 0), 255, x3 > 255) as u64;

  return y0 | (y1 << 8) | (y2 << 16) | (y3 << 24);
}

// swary path, signed
// @ts-expect-error: decorator
@inline function narrow4_s_swar(x: u64): u64 {
  const shifted = add_swar16(x, 0x0080008000800080);
  const inRange = zero_mask((shifted >> 8) & 0x00ff00ff00ff00ff) & 0x00ff00ff00ff00ff;
  const outRange = (~inRange) & 0x00ff00ff00ff00ff;
  const sign = (x & 0x8000800080008000) >> 15;
  const sat = (0x007f007f007f007f + sign) & 0x00ff00ff00ff00ff;
  return ((x & 0x00ff00ff00ff00ff) & inRange) | (sat & outRange);
}

// swary path, unsigned
// @ts-expect-error: decorator
@inline function narrow4_u_swar(x: u64): u64 {
  const hi = (x >> 8) & 0x00ff00ff00ff00ff;
  const hiNonZero = (~zero_mask(hi)) & 0x00ff00ff00ff00ff;
  const sign = (((x & 0x8000800080008000) >> 15) * 0xff) & 0x00ff00ff00ff00ff;
  const satPos = hiNonZero & ~sign;
  const keep = (~(sign | satPos)) & 0x00ff00ff00ff00ff;
  return ((x & 0x00ff00ff00ff00ff) & keep) | satPos;
}

// swary signed via bias->unsigned sat->unbias
// @ts-expect-error: decorator
@inline function narrow4_s_swar_bias(x: u64): u64 {
  const xb = add_swar16(x, 0x0080008000800080);
  const hi = (xb >> 8) & 0x00ff00ff00ff00ff;
  const hiNonZero = (~zero_mask(hi)) & 0x00ff00ff00ff00ff;
  const sign = (((xb & 0x8000800080008000) >> 15) * 0xff) & 0x00ff00ff00ff00ff;
  const satPos = hiNonZero & ~sign;
  const keep = (~(sign | satPos)) & 0x00ff00ff00ff00ff;
  return ((((xb & 0x00ff00ff00ff00ff) & keep) | satPos) ^ 0x0080008000800080);
}

// wrapper variants
// @ts-expect-error: decorator
@inline function narrow_s_scalar(a: u64, b: u64): u64 {
  return narrow4_s_scalar(a) | (narrow4_s_scalar(b) << 32);
}

// @ts-expect-error: decorator
@inline function narrow_u_scalar(a: u64, b: u64): u64 {
  return narrow4_u_scalar(a) | (narrow4_u_scalar(b) << 32);
}

// @ts-expect-error: decorator
@inline function narrow_s_swar(a: u64, b: u64): u64 {
  return pack_low_bytes(narrow4_s_swar(a)) | (pack_low_bytes(narrow4_s_swar(b)) << 32);
}

// @ts-expect-error: decorator
@inline function narrow_s_swar_bias(a: u64, b: u64): u64 {
  return pack_low_bytes(narrow4_s_swar_bias(a)) | (pack_low_bytes(narrow4_s_swar_bias(b)) << 32);
}

// @ts-expect-error: decorator
@inline function narrow_u_swar(a: u64, b: u64): u64 {
  return pack_low_bytes(narrow4_u_swar(a)) | (pack_low_bytes(narrow4_u_swar(b)) << 32);
}

bench("narrow.s.current", () => {
  blackbox(i8x8.narrow_i16x4_s(nextA(), nextB()));
}, OPS, 16);
dumpToFile("narrow-i16x4-comp", "s-current");

bench("narrow.s.scalar", () => {
  blackbox(narrow_s_scalar(nextA(), nextB()));
}, OPS, 16);
dumpToFile("narrow-i16x4-comp", "s-scalar");

bench("narrow.s.swar", () => {
  blackbox(narrow_s_swar(nextA(), nextB()));
}, OPS, 16);
dumpToFile("narrow-i16x4-comp", "s-swar");

bench("narrow.s.swar-bias", () => {
  blackbox(narrow_s_swar_bias(nextA(), nextB()));
}, OPS, 16);
dumpToFile("narrow-i16x4-comp", "s-swar-bias");

bench("narrow.u.current", () => {
  blackbox(i8x8.narrow_i16x4_u(nextA(), nextB()));
}, OPS, 16);
dumpToFile("narrow-i16x4-comp", "u-current");

bench("narrow.u.scalar", () => {
  blackbox(narrow_u_scalar(nextA(), nextB()));
}, OPS, 16);
dumpToFile("narrow-i16x4-comp", "u-scalar");

bench("narrow.u.swar", () => {
  blackbox(narrow_u_swar(nextA(), nextB()));
}, OPS, 16);
dumpToFile("narrow-i16x4-comp", "u-swar");

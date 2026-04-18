import { i8x8 } from "../v64/i8x8";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = 16_000_000;
const BYTES_PER_OP: u64 = 16;

// @ts-expect-error: decorator
@inline function next(x: u64): u64 {
  return x * 0x9e3779b97f4a7c15 + 0xbf58476d1ce4e5b9;
}

// SWAR bit-serial (vadixidav-style broad SWAR idea, tree reduction)
// @ts-expect-error: decorator
@inline function mul_swar_tree_inline(a: u64, b: u64): u64 {
  const p0 = a & (((b >> 0) & 0x0101010101010101) * 0xff);
  const p1 = i8x8.shl(a, 1) & (((b >> 1) & 0x0101010101010101) * 0xff);
  const p2 = i8x8.shl(a, 2) & (((b >> 2) & 0x0101010101010101) * 0xff);
  const p3 = i8x8.shl(a, 3) & (((b >> 3) & 0x0101010101010101) * 0xff);
  const p4 = i8x8.shl(a, 4) & (((b >> 4) & 0x0101010101010101) * 0xff);
  const p5 = i8x8.shl(a, 5) & (((b >> 5) & 0x0101010101010101) * 0xff);
  const p6 = i8x8.shl(a, 6) & (((b >> 6) & 0x0101010101010101) * 0xff);
  const p7 = i8x8.shl(a, 7) & (((b >> 7) & 0x0101010101010101) * 0xff);
  return i8x8.add(i8x8.add(i8x8.add(p0, p1), i8x8.add(p2, p3)), i8x8.add(i8x8.add(p4, p5), i8x8.add(p6, p7)));
}

// SWAR bit-serial (serial accumulation)
// @ts-expect-error: decorator
@inline function mul_swar_serial_inline(a: u64, b: u64): u64 {
  let r: u64 = 0;
  r = i8x8.add(r, a & (((b >> 0) & 0x0101010101010101) * 0xff));
  r = i8x8.add(r, i8x8.shl(a, 1) & (((b >> 1) & 0x0101010101010101) * 0xff));
  r = i8x8.add(r, i8x8.shl(a, 2) & (((b >> 2) & 0x0101010101010101) * 0xff));
  r = i8x8.add(r, i8x8.shl(a, 3) & (((b >> 3) & 0x0101010101010101) * 0xff));
  r = i8x8.add(r, i8x8.shl(a, 4) & (((b >> 4) & 0x0101010101010101) * 0xff));
  r = i8x8.add(r, i8x8.shl(a, 5) & (((b >> 5) & 0x0101010101010101) * 0xff));
  r = i8x8.add(r, i8x8.shl(a, 6) & (((b >> 6) & 0x0101010101010101) * 0xff));
  r = i8x8.add(r, i8x8.shl(a, 7) & (((b >> 7) & 0x0101010101010101) * 0xff));
  return r;
}

// Scalar lane-by-lane multiply (SIMD.js polyfill-style binaryMul per lane)
// @ts-expect-error: decorator
@inline function mul_lane_scalar(a: u64, b: u64): u64 {
  return i8x8(
    ((i8x8.extract_lane_u(a, 0) as u16) * (i8x8.extract_lane_u(b, 0) as u16)) as i8,
    ((i8x8.extract_lane_u(a, 1) as u16) * (i8x8.extract_lane_u(b, 1) as u16)) as i8,
    ((i8x8.extract_lane_u(a, 2) as u16) * (i8x8.extract_lane_u(b, 2) as u16)) as i8,
    ((i8x8.extract_lane_u(a, 3) as u16) * (i8x8.extract_lane_u(b, 3) as u16)) as i8,
    ((i8x8.extract_lane_u(a, 4) as u16) * (i8x8.extract_lane_u(b, 4) as u16)) as i8,
    ((i8x8.extract_lane_u(a, 5) as u16) * (i8x8.extract_lane_u(b, 5) as u16)) as i8,
    ((i8x8.extract_lane_u(a, 6) as u16) * (i8x8.extract_lane_u(b, 6) as u16)) as i8,
    ((i8x8.extract_lane_u(a, 7) as u16) * (i8x8.extract_lane_u(b, 7) as u16)) as i8,
  );
}

function verify(): void {
  let a: u64 = 0x0123456789abcdef;
  let b: u64 = 0xfedcba9876543210;
  for (let i = 0; i < 20_000; i++) {
    a = next(a);
    b = next(b);
    const expected = mul_lane_scalar(a, b);
    if (i8x8.mul(a, b) != expected) throw new Error("i8x8.mul mismatch");
    if (mul_swar_tree_inline(a, b) != expected) throw new Error("mul_swar_tree_inline mismatch");
    if (mul_swar_serial_inline(a, b) != expected) throw new Error("mul_swar_serial_inline mismatch");
    if (i8x8.mul_simde_port(a, b) != expected) throw new Error("mul_simde_port mismatch");
  }
}

verify();

let a0: u64 = 0x0123456789abcdef;
let b0: u64 = 0xfedcba9876543210;
bench(
  "i8x8.mul (current)",
  () => {
    a0 = next(a0);
    b0 = next(b0);
    blackbox(i8x8.mul(a0, b0));
  },
  OPS,
  BYTES_PER_OP,
);
dumpToFile("i8x8-mul-swar", "current");

let a1: u64 = 0x0123456789abcdef;
let b1: u64 = 0xfedcba9876543210;
bench(
  "i8x8.mul (tree inline)",
  () => {
    a1 = next(a1);
    b1 = next(b1);
    blackbox(mul_swar_tree_inline(a1, b1));
  },
  OPS,
  BYTES_PER_OP,
);
dumpToFile("i8x8-mul-swar", "tree-inline");

let a2: u64 = 0x0123456789abcdef;
let b2: u64 = 0xfedcba9876543210;
bench(
  "i8x8.mul (serial inline)",
  () => {
    a2 = next(a2);
    b2 = next(b2);
    blackbox(mul_swar_serial_inline(a2, b2));
  },
  OPS,
  BYTES_PER_OP,
);
dumpToFile("i8x8-mul-swar", "serial-inline");

let a3: u64 = 0x0123456789abcdef;
let b3: u64 = 0xfedcba9876543210;
bench(
  "i8x8.mul (simde-port)",
  () => {
    a3 = next(a3);
    b3 = next(b3);
    blackbox(i8x8.mul_simde_port(a3, b3));
  },
  OPS,
  BYTES_PER_OP,
);
dumpToFile("i8x8-mul-swar", "simde-port");

let a4: u64 = 0x0123456789abcdef;
let b4: u64 = 0xfedcba9876543210;
bench(
  "i8x8.mul (lane scalar)",
  () => {
    a4 = next(a4);
    b4 = next(b4);
    blackbox(mul_lane_scalar(a4, b4));
  },
  OPS,
  BYTES_PER_OP,
);
dumpToFile("i8x8-mul-swar", "lane-scalar");

let a5: u64 = 0x0123456789abcdef;
let b5: u64 = 0xfedcba9876543210;
bench(
  "i8x8.mul (unsafe raw u64 mul)",
  () => {
    a5 = next(a5);
    b5 = next(b5);
    blackbox(i8x8.mul_unsafe(a5, b5));
  },
  OPS,
  BYTES_PER_OP,
);
dumpToFile("i8x8-mul-swar", "unsafe-raw");

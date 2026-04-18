import { i8x8 } from "../64/i8x8";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = 25_000_000;

// @ts-expect-error: decorator
@inline function next(x: u64): u64 {
  return x * 0x9e3779b97f4a7c15 + 0xbf58476d1ce4e5b9;
}

let a0: u64 = 0x0123456789abcdef;
bench("i8x8.splat", () => {
  a0 = next(a0);
  blackbox(i8x8.splat((a0 & 0xff) as i8));
}, OPS, 8);
dumpToFile("i8x8", "splat");

let a1: u64 = 0x0123456789abcdef;
bench("i8x8.extract_lane_s", () => {
  a1 = next(a1);
  blackbox(i8x8.extract_lane_s(a1, (a1 & 7) as u8));
}, OPS, 8);
dumpToFile("i8x8", "extract-lane-s");

let a2: u64 = 0x0123456789abcdef;
bench("i8x8.extract_lane_u", () => {
  a2 = next(a2);
  blackbox(i8x8.extract_lane_u(a2, (a2 & 7) as u8));
}, OPS, 8);
dumpToFile("i8x8", "extract-lane-u");

let a3: u64 = 0x0123456789abcdef;
bench("i8x8.replace_lane", () => {
  a3 = next(a3);
  blackbox(i8x8.replace_lane(a3, (a3 & 7) as u8, (a3 >> 8) as i8));
}, OPS, 8);
dumpToFile("i8x8", "replace-lane");

let a4: u64 = 0x0123456789abcdef;
let b4: u64 = 0xfedcba9876543210;
bench("i8x8.add", () => {
  a4 = next(a4);
  b4 = next(b4);
  blackbox(i8x8.add(a4, b4));
}, OPS, 16);
dumpToFile("i8x8", "add");

let a5: u64 = 0x0123456789abcdef;
let b5: u64 = 0xfedcba9876543210;
bench("i8x8.sub", () => {
  a5 = next(a5);
  b5 = next(b5);
  blackbox(i8x8.sub(a5, b5));
}, OPS, 16);
dumpToFile("i8x8", "sub");

let a16: u64 = 0x0123456789abcdef;
let b16: u64 = 0xfedcba9876543210;
bench("i8x8.min_s", () => {
  a16 = next(a16);
  b16 = next(b16);
  blackbox(i8x8.min_s(a16, b16));
}, OPS, 16);
dumpToFile("i8x8", "min-s");

let a17: u64 = 0x0123456789abcdef;
let b17: u64 = 0xfedcba9876543210;
bench("i8x8.min_u", () => {
  a17 = next(a17);
  b17 = next(b17);
  blackbox(i8x8.min_u(a17, b17));
}, OPS, 16);
dumpToFile("i8x8", "min-u");

let a18: u64 = 0x0123456789abcdef;
let b18: u64 = 0xfedcba9876543210;
bench("i8x8.max_s", () => {
  a18 = next(a18);
  b18 = next(b18);
  blackbox(i8x8.max_s(a18, b18));
}, OPS, 16);
dumpToFile("i8x8", "max-s");

let a19: u64 = 0x0123456789abcdef;
let b19: u64 = 0xfedcba9876543210;
bench("i8x8.max_u", () => {
  a19 = next(a19);
  b19 = next(b19);
  blackbox(i8x8.max_u(a19, b19));
}, OPS, 16);
dumpToFile("i8x8", "max-u");

let a20: u64 = 0x0123456789abcdef;
let b20: u64 = 0xfedcba9876543210;
bench("i8x8.avgr_u", () => {
  a20 = next(a20);
  b20 = next(b20);
  blackbox(i8x8.avgr_u(a20, b20));
}, OPS, 16);
dumpToFile("i8x8", "avgr-u");

let a21: u64 = 0x0123456789abcdef;
bench("i8x8.abs", () => {
  a21 = next(a21);
  blackbox(i8x8.abs(a21));
}, OPS, 8);
dumpToFile("i8x8", "abs");

let a22: u64 = 0x0123456789abcdef;
bench("i8x8.neg", () => {
  a22 = next(a22);
  blackbox(i8x8.neg(a22));
}, OPS, 8);
dumpToFile("i8x8", "neg");

let a23: u64 = 0x0123456789abcdef;
let b23: u64 = 0xfedcba9876543210;
bench("i8x8.add_sat_s", () => {
  a23 = next(a23);
  b23 = next(b23);
  blackbox(i8x8.add_sat_s(a23, b23));
}, OPS, 16);
dumpToFile("i8x8", "add-sat-s");

let a24: u64 = 0x0123456789abcdef;
let b24: u64 = 0xfedcba9876543210;
bench("i8x8.add_sat_u", () => {
  a24 = next(a24);
  b24 = next(b24);
  blackbox(i8x8.add_sat_u(a24, b24));
}, OPS, 16);
dumpToFile("i8x8", "add-sat-u");

let a25: u64 = 0x0123456789abcdef;
let b25: u64 = 0xfedcba9876543210;
bench("i8x8.sub_sat_s", () => {
  a25 = next(a25);
  b25 = next(b25);
  blackbox(i8x8.sub_sat_s(a25, b25));
}, OPS, 16);
dumpToFile("i8x8", "sub-sat-s");

let a26: u64 = 0x0123456789abcdef;
let b26: u64 = 0xfedcba9876543210;
bench("i8x8.sub_sat_u", () => {
  a26 = next(a26);
  b26 = next(b26);
  blackbox(i8x8.sub_sat_u(a26, b26));
}, OPS, 16);
dumpToFile("i8x8", "sub-sat-u");

let a27: u64 = 0x0123456789abcdef;
bench("i8x8.shl", () => {
  a27 = next(a27);
  blackbox(i8x8.shl(a27, (a27 & 7) as i32));
}, OPS, 8);
dumpToFile("i8x8", "shl");

let a28: u64 = 0x0123456789abcdef;
bench("i8x8.shr_s", () => {
  a28 = next(a28);
  blackbox(i8x8.shr_s(a28, (a28 & 7) as i32));
}, OPS, 8);
dumpToFile("i8x8", "shr-s");

let a29: u64 = 0x0123456789abcdef;
bench("i8x8.shr_u", () => {
  a29 = next(a29);
  blackbox(i8x8.shr_u(a29, (a29 & 7) as i32));
}, OPS, 8);
dumpToFile("i8x8", "shr-u");

let a30: u64 = 0x0123456789abcdef;
bench("i8x8.all_true", () => {
  a30 = next(a30);
  blackbox(i8x8.all_true(a30));
}, OPS, 8);
dumpToFile("i8x8", "all-true");

let a31: u64 = 0x0123456789abcdef;
bench("i8x8.bitmask", () => {
  a31 = next(a31);
  blackbox(i8x8.bitmask(a31));
}, OPS, 8);
dumpToFile("i8x8", "bitmask");

let a32: u64 = 0x0123456789abcdef;
let b32: u64 = 0xfedcba9876543210;
bench("i8x8.eq", () => {
  a32 = next(a32);
  b32 = next(b32);
  blackbox(i8x8.eq(a32, b32));
}, OPS, 16);
dumpToFile("i8x8", "eq");

let a33: u64 = 0x0123456789abcdef;
let b33: u64 = 0xfedcba9876543210;
bench("i8x8.ne", () => {
  a33 = next(a33);
  b33 = next(b33);
  blackbox(i8x8.ne(a33, b33));
}, OPS, 16);
dumpToFile("i8x8", "ne");

let a34: u64 = 0x0123456789abcdef;
let b34: u64 = 0xfedcba9876543210;
bench("i8x8.lt_s", () => {
  a34 = next(a34);
  b34 = next(b34);
  blackbox(i8x8.lt_s(a34, b34));
}, OPS, 16);
dumpToFile("i8x8", "lt-s");

let a35: u64 = 0x0123456789abcdef;
let b35: u64 = 0xfedcba9876543210;
bench("i8x8.lt_u", () => {
  a35 = next(a35);
  b35 = next(b35);
  blackbox(i8x8.lt_u(a35, b35));
}, OPS, 16);
dumpToFile("i8x8", "lt-u");

let a36: u64 = 0x0123456789abcdef;
let b36: u64 = 0xfedcba9876543210;
bench("i8x8.le_s", () => {
  a36 = next(a36);
  b36 = next(b36);
  blackbox(i8x8.le_s(a36, b36));
}, OPS, 16);
dumpToFile("i8x8", "le-s");

let a37: u64 = 0x0123456789abcdef;
let b37: u64 = 0xfedcba9876543210;
bench("i8x8.le_u", () => {
  a37 = next(a37);
  b37 = next(b37);
  blackbox(i8x8.le_u(a37, b37));
}, OPS, 16);
dumpToFile("i8x8", "le-u");

let a38: u64 = 0x0123456789abcdef;
let b38: u64 = 0xfedcba9876543210;
bench("i8x8.gt_s", () => {
  a38 = next(a38);
  b38 = next(b38);
  blackbox(i8x8.gt_s(a38, b38));
}, OPS, 16);
dumpToFile("i8x8", "gt-s");

let a39: u64 = 0x0123456789abcdef;
let b39: u64 = 0xfedcba9876543210;
bench("i8x8.gt_u", () => {
  a39 = next(a39);
  b39 = next(b39);
  blackbox(i8x8.gt_u(a39, b39));
}, OPS, 16);
dumpToFile("i8x8", "gt-u");

let a40: u64 = 0x0123456789abcdef;
let b40: u64 = 0xfedcba9876543210;
bench("i8x8.ge_s", () => {
  a40 = next(a40);
  b40 = next(b40);
  blackbox(i8x8.ge_s(a40, b40));
}, OPS, 16);
dumpToFile("i8x8", "ge-s");

let a41: u64 = 0x0123456789abcdef;
let b41: u64 = 0xfedcba9876543210;
bench("i8x8.ge_u", () => {
  a41 = next(a41);
  b41 = next(b41);
  blackbox(i8x8.ge_u(a41, b41));
}, OPS, 16);
dumpToFile("i8x8", "ge-u");

let a42: u64 = 0x0123456789abcdef;
let b42: u64 = 0xfedcba9876543210;
bench("i8x8.narrow_i16x4_s", () => {
  a42 = next(a42);
  b42 = next(b42);
  blackbox(i8x8.narrow_i16x4_s(a42, b42));
}, OPS, 16);
dumpToFile("i8x8", "narrow-i16x4-s");

let a43: u64 = 0x0123456789abcdef;
let b43: u64 = 0xfedcba9876543210;
bench("i8x8.narrow_i16x4_u", () => {
  a43 = next(a43);
  b43 = next(b43);
  blackbox(i8x8.narrow_i16x4_u(a43, b43));
}, OPS, 16);
dumpToFile("i8x8", "narrow-i16x4-u");

let a44: u64 = 0x0123456789abcdef;
let b44: u64 = 0xfedcba9876543210;
bench("i8x8.shuffle", () => {
  a44 = next(a44);
  b44 = next(b44);
  blackbox(i8x8.shuffle(a44, b44, 0, 9, 2, 11, 4, 13, 6, 15));
}, OPS, 16);
dumpToFile("i8x8", "shuffle");

let a45: u64 = 0x0123456789abcdef;
let s45: u64 = 0xfedcba9876543210;
bench("i8x8.swizzle", () => {
  a45 = next(a45);
  s45 = next(s45);
  blackbox(i8x8.swizzle(a45, s45));
}, OPS, 16);
dumpToFile("i8x8", "swizzle");

let a46: u64 = 0x0123456789abcdef;
let s46: u64 = 0xfedcba9876543210;
bench("i8x8.relaxed_swizzle", () => {
  a46 = next(a46);
  s46 = next(s46);
  blackbox(i8x8.relaxed_swizzle(a46, s46));
}, OPS, 16);
dumpToFile("i8x8", "relaxed-swizzle");

let a47: u64 = 0x0123456789abcdef;
let b47: u64 = 0xfedcba9876543210;
let m47: u64 = 0xaa55aa55aa55aa55;
bench("i8x8.relaxed_laneselect", () => {
  a47 = next(a47);
  b47 = next(b47);
  m47 = next(m47);
  blackbox(i8x8.relaxed_laneselect(a47, b47, m47));
}, OPS, 24);
dumpToFile("i8x8", "relaxed-laneselect");

let a50: u64 = 0x0123456789abcdef;
bench("i8x8.popcnt", () => {
  a50 = next(a50);
  blackbox(i8x8.popcnt(a50));
}, OPS, 8);
dumpToFile("i8x8", "popcnt");

import { i8x8 } from "../v64/i8x8";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(96);

const i8x8_splat_x: i8 = -37;

bench("i8x8.splat", () => {
  blackbox(i8x8.splat(blackbox(i8x8_splat_x)));
}, OPS, 8);
dumpToFile("i8x8", "splat");


const i8x8_load_ptr = IO_PTR + 0x20;

bench("i8x8.load", () => {
  blackbox(load<u64>(blackbox(i8x8_load_ptr)));
}, OPS, 8);
dumpToFile("i8x8", "load");


const i8x8_store_ptr = IO_PTR + 0x20;
const i8x8_store_a: u64 = 0xfedcba9876543210;

bench("i8x8.store", () => {
  store<u64>(blackbox(i8x8_store_ptr), blackbox(i8x8_store_a));
  blackbox(load<u64>(IO_PTR));
}, OPS, 8);
dumpToFile("i8x8", "store");


const i8x8_loadPartial_ptr = IO_PTR + 0x20;
const i8x8_loadPartial_x: i8 = -37;
const i8x8_loadPartial_len: i32 = 5;

bench("i8x8.loadPartial", () => {
  blackbox(i8x8.loadPartial(blackbox(i8x8_loadPartial_ptr), blackbox(i8x8_loadPartial_len), 0, 1, blackbox(i8x8_loadPartial_x)));
}, OPS, 8);
dumpToFile("i8x8", "load-partial");


const i8x8_storePartial_ptr = IO_PTR + 0x20;
const i8x8_storePartial_a: u64 = 0xfedcba9876543210;
const i8x8_storePartial_len: i32 = 5;

bench("i8x8.storePartial", () => {
  i8x8.storePartial(blackbox(i8x8_storePartial_ptr), blackbox(i8x8_storePartial_a), blackbox(i8x8_storePartial_len));
  blackbox(load<u64>(IO_PTR));
}, OPS, 8);
dumpToFile("i8x8", "store-partial");


const i8x8_extract_lane_s_a: u64 = 0xfedcba9876543210;
const i8x8_extract_lane_s_lane: u8 = 5;

bench("i8x8.extract_lane_s", () => {
  blackbox(i8x8.extract_lane_s(blackbox(i8x8_extract_lane_s_a), blackbox(i8x8_extract_lane_s_lane)));
}, OPS, 8);
dumpToFile("i8x8", "extract-lane-s");


const i8x8_extract_lane_u_a: u64 = 0xfedcba9876543210;
const i8x8_extract_lane_u_lane: u8 = 5;

bench("i8x8.extract_lane_u", () => {
  blackbox(i8x8.extract_lane_u(blackbox(i8x8_extract_lane_u_a), blackbox(i8x8_extract_lane_u_lane)));
}, OPS, 8);
dumpToFile("i8x8", "extract-lane-u");


const i8x8_replace_lane_a: u64 = 0xfedcba9876543210;
const i8x8_replace_lane_x: i8 = -37;
const i8x8_replace_lane_lane: u8 = 5;

bench("i8x8.replace_lane", () => {
  blackbox(i8x8.replace_lane(blackbox(i8x8_replace_lane_a), blackbox(i8x8_replace_lane_lane), blackbox(i8x8_replace_lane_x)));
}, OPS, 8);
dumpToFile("i8x8", "replace-lane");


const i8x8_add_a: u64 = 0xfedcba9876543210;
const i8x8_add_b: u64 = 0x7766554433221100;

bench("i8x8.add", () => {
  blackbox(i8x8.add(blackbox(i8x8_add_a), blackbox(i8x8_add_b)));
}, OPS, 8);
dumpToFile("i8x8", "add");


const i8x8_sub_a: u64 = 0xfedcba9876543210;
const i8x8_sub_b: u64 = 0x7766554433221100;

bench("i8x8.sub", () => {
  blackbox(i8x8.sub(blackbox(i8x8_sub_a), blackbox(i8x8_sub_b)));
}, OPS, 8);
dumpToFile("i8x8", "sub");


const i8x8_mul_a: u64 = 0xfedcba9876543210;
const i8x8_mul_b: u64 = 0x7766554433221100;

bench("i8x8.mul", () => {
  blackbox(i8x8.mul(blackbox(i8x8_mul_a), blackbox(i8x8_mul_b)));
}, OPS, 8);
dumpToFile("i8x8", "mul");


const i8x8_min_s_a: u64 = 0xfedcba9876543210;
const i8x8_min_s_b: u64 = 0x7766554433221100;

bench("i8x8.min_s", () => {
  blackbox(i8x8.min_s(blackbox(i8x8_min_s_a), blackbox(i8x8_min_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "min-s");


const i8x8_min_u_a: u64 = 0xfedcba9876543210;
const i8x8_min_u_b: u64 = 0x7766554433221100;

bench("i8x8.min_u", () => {
  blackbox(i8x8.min_u(blackbox(i8x8_min_u_a), blackbox(i8x8_min_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "min-u");


const i8x8_max_s_a: u64 = 0xfedcba9876543210;
const i8x8_max_s_b: u64 = 0x7766554433221100;

bench("i8x8.max_s", () => {
  blackbox(i8x8.max_s(blackbox(i8x8_max_s_a), blackbox(i8x8_max_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "max-s");


const i8x8_max_u_a: u64 = 0xfedcba9876543210;
const i8x8_max_u_b: u64 = 0x7766554433221100;

bench("i8x8.max_u", () => {
  blackbox(i8x8.max_u(blackbox(i8x8_max_u_a), blackbox(i8x8_max_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "max-u");


const i8x8_avgr_u_a: u64 = 0xfedcba9876543210;
const i8x8_avgr_u_b: u64 = 0x7766554433221100;

bench("i8x8.avgr_u", () => {
  blackbox(i8x8.avgr_u(blackbox(i8x8_avgr_u_a), blackbox(i8x8_avgr_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "avgr-u");


const i8x8_abs_a: u64 = 0xfedcba9876543210;

bench("i8x8.abs", () => {
  blackbox(i8x8.abs(blackbox(i8x8_abs_a)));
}, OPS, 8);
dumpToFile("i8x8", "abs");


const i8x8_neg_a: u64 = 0xfedcba9876543210;

bench("i8x8.neg", () => {
  blackbox(i8x8.neg(blackbox(i8x8_neg_a)));
}, OPS, 8);
dumpToFile("i8x8", "neg");


const i8x8_add_sat_s_a: u64 = 0xfedcba9876543210;
const i8x8_add_sat_s_b: u64 = 0x7766554433221100;

bench("i8x8.add_sat_s", () => {
  blackbox(i8x8.add_sat_s(blackbox(i8x8_add_sat_s_a), blackbox(i8x8_add_sat_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "add-sat-s");


const i8x8_add_sat_u_a: u64 = 0xfedcba9876543210;
const i8x8_add_sat_u_b: u64 = 0x7766554433221100;

bench("i8x8.add_sat_u", () => {
  blackbox(i8x8.add_sat_u(blackbox(i8x8_add_sat_u_a), blackbox(i8x8_add_sat_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "add-sat-u");


const i8x8_sub_sat_s_a: u64 = 0xfedcba9876543210;
const i8x8_sub_sat_s_b: u64 = 0x7766554433221100;

bench("i8x8.sub_sat_s", () => {
  blackbox(i8x8.sub_sat_s(blackbox(i8x8_sub_sat_s_a), blackbox(i8x8_sub_sat_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "sub-sat-s");


const i8x8_sub_sat_u_a: u64 = 0xfedcba9876543210;
const i8x8_sub_sat_u_b: u64 = 0x7766554433221100;

bench("i8x8.sub_sat_u", () => {
  blackbox(i8x8.sub_sat_u(blackbox(i8x8_sub_sat_u_a), blackbox(i8x8_sub_sat_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "sub-sat-u");


const i8x8_shl_a: u64 = 0xfedcba9876543210;
const i8x8_shl_shift: i32 = 3;

bench("i8x8.shl", () => {
  blackbox(i8x8.shl(blackbox(i8x8_shl_a), blackbox(i8x8_shl_shift)));
}, OPS, 8);
dumpToFile("i8x8", "shl");


const i8x8_shr_s_a: u64 = 0xfedcba9876543210;
const i8x8_shr_s_shift: i32 = 3;

bench("i8x8.shr_s", () => {
  blackbox(i8x8.shr_s(blackbox(i8x8_shr_s_a), blackbox(i8x8_shr_s_shift)));
}, OPS, 8);
dumpToFile("i8x8", "shr-s");


const i8x8_shr_u_a: u64 = 0xfedcba9876543210;
const i8x8_shr_u_shift: i32 = 3;

bench("i8x8.shr_u", () => {
  blackbox(i8x8.shr_u(blackbox(i8x8_shr_u_a), blackbox(i8x8_shr_u_shift)));
}, OPS, 8);
dumpToFile("i8x8", "shr-u");


const i8x8_all_true_a: u64 = 0xfedcba9876543210;

bench("i8x8.all_true", () => {
  blackbox(i8x8.all_true(blackbox(i8x8_all_true_a)));
}, OPS, 8);
dumpToFile("i8x8", "all-true");


const i8x8_bitmask_a: u64 = 0xfedcba9876543210;

bench("i8x8.bitmask", () => {
  blackbox(i8x8.bitmask(blackbox(i8x8_bitmask_a)));
}, OPS, 8);
dumpToFile("i8x8", "bitmask");


const i8x8_bitmask_lane_a: u64 = 0xfedcba9876543210;

bench("i8x8.bitmask_lane", () => {
  blackbox(i8x8.bitmask_lane(blackbox(i8x8_bitmask_lane_a)));
}, OPS, 8);
dumpToFile("i8x8", "bitmask-lane");


const i8x8_eq_a: u64 = 0xfedcba9876543210;
const i8x8_eq_b: u64 = 0x7766554433221100;

bench("i8x8.eq", () => {
  blackbox(i8x8.eq(blackbox(i8x8_eq_a), blackbox(i8x8_eq_b)));
}, OPS, 8);
dumpToFile("i8x8", "eq");


const i8x8_ne_a: u64 = 0xfedcba9876543210;
const i8x8_ne_b: u64 = 0x7766554433221100;

bench("i8x8.ne", () => {
  blackbox(i8x8.ne(blackbox(i8x8_ne_a), blackbox(i8x8_ne_b)));
}, OPS, 8);
dumpToFile("i8x8", "ne");


const i8x8_lt_s_a: u64 = 0xfedcba9876543210;
const i8x8_lt_s_b: u64 = 0x7766554433221100;

bench("i8x8.lt_s", () => {
  blackbox(i8x8.lt_s(blackbox(i8x8_lt_s_a), blackbox(i8x8_lt_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "lt-s");


const i8x8_lt_u_a: u64 = 0xfedcba9876543210;
const i8x8_lt_u_b: u64 = 0x7766554433221100;

bench("i8x8.lt_u", () => {
  blackbox(i8x8.lt_u(blackbox(i8x8_lt_u_a), blackbox(i8x8_lt_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "lt-u");


const i8x8_le_s_a: u64 = 0xfedcba9876543210;
const i8x8_le_s_b: u64 = 0x7766554433221100;

bench("i8x8.le_s", () => {
  blackbox(i8x8.le_s(blackbox(i8x8_le_s_a), blackbox(i8x8_le_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "le-s");


const i8x8_le_u_a: u64 = 0xfedcba9876543210;
const i8x8_le_u_b: u64 = 0x7766554433221100;

bench("i8x8.le_u", () => {
  blackbox(i8x8.le_u(blackbox(i8x8_le_u_a), blackbox(i8x8_le_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "le-u");


const i8x8_gt_s_a: u64 = 0xfedcba9876543210;
const i8x8_gt_s_b: u64 = 0x7766554433221100;

bench("i8x8.gt_s", () => {
  blackbox(i8x8.gt_s(blackbox(i8x8_gt_s_a), blackbox(i8x8_gt_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "gt-s");


const i8x8_gt_u_a: u64 = 0xfedcba9876543210;
const i8x8_gt_u_b: u64 = 0x7766554433221100;

bench("i8x8.gt_u", () => {
  blackbox(i8x8.gt_u(blackbox(i8x8_gt_u_a), blackbox(i8x8_gt_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "gt-u");


const i8x8_ge_s_a: u64 = 0xfedcba9876543210;
const i8x8_ge_s_b: u64 = 0x7766554433221100;

bench("i8x8.ge_s", () => {
  blackbox(i8x8.ge_s(blackbox(i8x8_ge_s_a), blackbox(i8x8_ge_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "ge-s");


const i8x8_ge_u_a: u64 = 0xfedcba9876543210;
const i8x8_ge_u_b: u64 = 0x7766554433221100;

bench("i8x8.ge_u", () => {
  blackbox(i8x8.ge_u(blackbox(i8x8_ge_u_a), blackbox(i8x8_ge_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "ge-u");


const i8x8_narrow_i16x4_s_a: u64 = 0xfedcba9876543210;
const i8x8_narrow_i16x4_s_b: u64 = 0x7766554433221100;

bench("i8x8.narrow_i16x4_s", () => {
  blackbox(i8x8.narrow_i16x4_s(blackbox(i8x8_narrow_i16x4_s_a), blackbox(i8x8_narrow_i16x4_s_b)));
}, OPS, 8);
dumpToFile("i8x8", "narrow-i16x4-s");


const i8x8_narrow_i16x4_u_a: u64 = 0xfedcba9876543210;
const i8x8_narrow_i16x4_u_b: u64 = 0x7766554433221100;

bench("i8x8.narrow_i16x4_u", () => {
  blackbox(i8x8.narrow_i16x4_u(blackbox(i8x8_narrow_i16x4_u_a), blackbox(i8x8_narrow_i16x4_u_b)));
}, OPS, 8);
dumpToFile("i8x8", "narrow-i16x4-u");


const i8x8_shuffle_a: u64 = 0xfedcba9876543210;
const i8x8_shuffle_b: u64 = 0x7766554433221100;

bench("i8x8.shuffle", () => {
  blackbox(i8x8.shuffle(
    blackbox(i8x8_shuffle_a),
    blackbox(i8x8_shuffle_b),
    15,
    14,
    13,
    12,
    11,
    10,
    9,
    8,
  ));
}, OPS, 8);
dumpToFile("i8x8", "shuffle");


const i8x8_swizzle_a: u64 = 0xfedcba9876543210;
const i8x8_swizzle_b: u64 = 0x7766554433221100;

bench("i8x8.swizzle", () => {
  blackbox(i8x8.swizzle(blackbox(i8x8_swizzle_a), blackbox(i8x8_swizzle_b)));
}, OPS, 8);
dumpToFile("i8x8", "swizzle");


const i8x8_relaxed_swizzle_a: u64 = 0xfedcba9876543210;
const i8x8_relaxed_swizzle_b: u64 = 0x7766554433221100;
const i8x8_relaxed_laneselect_a: u64 = 0xfedcba9876543210;
const i8x8_relaxed_laneselect_b: u64 = 0x7766554433221100;
const i8x8_relaxed_laneselect_m: u64 = 0x00ff807f55aa33cc;

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i8x8.relaxed_swizzle", () => {
    blackbox(i8x8.relaxed_swizzle(blackbox(i8x8_relaxed_swizzle_a), blackbox(i8x8_relaxed_swizzle_b)));
  }, OPS, 8);
  dumpToFile("i8x8", "relaxed-swizzle");


  bench("i8x8.relaxed_laneselect", () => {
    blackbox(i8x8.relaxed_laneselect(blackbox(i8x8_relaxed_laneselect_a), blackbox(i8x8_relaxed_laneselect_b), blackbox(i8x8_relaxed_laneselect_m)));
  }, OPS, 24);
  dumpToFile("i8x8", "relaxed-laneselect");

} else {
  // Fallback keeps output shape stable for runtimes without relaxed SIMD.
  bench("i8x8.relaxed_swizzle", () => {
    blackbox(i8x8.swizzle(blackbox(i8x8_relaxed_swizzle_a), blackbox(i8x8_relaxed_swizzle_b)));
  }, OPS, 8);
  dumpToFile("i8x8", "relaxed-swizzle");


  bench("i8x8.relaxed_laneselect", () => {
    blackbox(i8x8.relaxed_laneselect(blackbox(i8x8_relaxed_laneselect_a), blackbox(i8x8_relaxed_laneselect_b), blackbox(i8x8_relaxed_laneselect_m)));
  }, OPS, 24);
  dumpToFile("i8x8", "relaxed-laneselect");

}

const i8x8_popcnt_a: u64 = 0xfedcba9876543210;

bench("i8x8.popcnt", () => {
  blackbox(i8x8.popcnt(blackbox(i8x8_popcnt_a)));
}, OPS, 8);
dumpToFile("i8x8", "popcnt");

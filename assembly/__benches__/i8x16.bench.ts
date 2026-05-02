import { i8x16_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

const i8x16_splat_x: i8 = -37;

bench("i8x16.splat", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.splat(blackbox(i8x16_splat_x)));
  else { blackbox(i8x16_swar.splat(blackbox(i8x16_splat_x))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "splat");


const i8x16_extract_lane_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_extract_lane_s_a: u64 = 0xfedcba9876543210;
const i8x16_extract_lane_s_hi: u64 = 0x0123456789abcdef;
const i8x16_extract_lane_s_lane: u8 = 11;

bench("i8x16.extract_lane_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.extract_lane_s(blackbox(i8x16_extract_lane_s_v0), 0));
  else blackbox(i8x16_swar.extract_lane_s(blackbox(i8x16_extract_lane_s_a), blackbox(i8x16_extract_lane_s_hi), blackbox(i8x16_extract_lane_s_lane)));
}, OPS, 8);
dumpToFile("i8x16", "extract-lane-s");


const i8x16_extract_lane_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_extract_lane_u_a: u64 = 0xfedcba9876543210;
const i8x16_extract_lane_u_hi: u64 = 0x0123456789abcdef;
const i8x16_extract_lane_u_lane: u8 = 11;

bench("i8x16.extract_lane_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.extract_lane_u(blackbox(i8x16_extract_lane_u_v0), 0));
  else blackbox(i8x16_swar.extract_lane_u(blackbox(i8x16_extract_lane_u_a), blackbox(i8x16_extract_lane_u_hi), blackbox(i8x16_extract_lane_u_lane)));
}, OPS, 8);
dumpToFile("i8x16", "extract-lane-u");


const i8x16_replace_lane_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_replace_lane_a: u64 = 0xfedcba9876543210;
const i8x16_replace_lane_hi: u64 = 0x0123456789abcdef;
const i8x16_replace_lane_x: i8 = -37;
const i8x16_replace_lane_lane: u8 = 11;

bench("i8x16.replace_lane", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.replace_lane(blackbox(i8x16_replace_lane_v0), 0, blackbox(i8x16_replace_lane_x)));
  else { blackbox(i8x16_swar.replace_lane(blackbox(i8x16_replace_lane_a), blackbox(i8x16_replace_lane_hi), blackbox(i8x16_replace_lane_lane), blackbox(i8x16_replace_lane_x))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "replace-lane");


const i8x16_add_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_add_a: u64 = 0xfedcba9876543210;
const i8x16_add_hi: u64 = 0x0123456789abcdef;

bench("i8x16.add", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.add(blackbox(i8x16_add_v0), blackbox(i8x16_add_v0)));
  else { blackbox(i8x16_swar.add(blackbox(i8x16_add_a), blackbox(i8x16_add_hi), blackbox(i8x16_add_a), blackbox(i8x16_add_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "add");


const i8x16_sub_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_sub_a: u64 = 0xfedcba9876543210;
const i8x16_sub_hi: u64 = 0x0123456789abcdef;

bench("i8x16.sub", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.sub(blackbox(i8x16_sub_v0), blackbox(i8x16_sub_v0)));
  else { blackbox(i8x16_swar.sub(blackbox(i8x16_sub_a), blackbox(i8x16_sub_hi), blackbox(i8x16_sub_a), blackbox(i8x16_sub_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "sub");


const i8x16_mul_a: u64 = 0xfedcba9876543210;
const i8x16_mul_hi: u64 = 0x0123456789abcdef;

bench("i8x16.mul", () => {
  blackbox(i8x16_swar.mul(blackbox(i8x16_mul_a), blackbox(i8x16_mul_hi), blackbox(i8x16_mul_a), blackbox(i8x16_mul_hi)));
  blackbox(i8x16_swar.take_hi());
}, OPS, 8);
dumpToFile("i8x16", "mul");


const i8x16_min_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_min_s_a: u64 = 0xfedcba9876543210;
const i8x16_min_s_hi: u64 = 0x0123456789abcdef;

bench("i8x16.min_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.min_s(blackbox(i8x16_min_s_v0), blackbox(i8x16_min_s_v0)));
  else { blackbox(i8x16_swar.min_s(blackbox(i8x16_min_s_a), blackbox(i8x16_min_s_hi), blackbox(i8x16_min_s_a), blackbox(i8x16_min_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "min-s");


const i8x16_min_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_min_u_a: u64 = 0xfedcba9876543210;
const i8x16_min_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.min_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.min_u(blackbox(i8x16_min_u_v0), blackbox(i8x16_min_u_v0)));
  else { blackbox(i8x16_swar.min_u(blackbox(i8x16_min_u_a), blackbox(i8x16_min_u_hi), blackbox(i8x16_min_u_a), blackbox(i8x16_min_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "min-u");


const i8x16_max_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_max_s_a: u64 = 0xfedcba9876543210;
const i8x16_max_s_hi: u64 = 0x0123456789abcdef;

bench("i8x16.max_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.max_s(blackbox(i8x16_max_s_v0), blackbox(i8x16_max_s_v0)));
  else { blackbox(i8x16_swar.max_s(blackbox(i8x16_max_s_a), blackbox(i8x16_max_s_hi), blackbox(i8x16_max_s_a), blackbox(i8x16_max_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "max-s");


const i8x16_max_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_max_u_a: u64 = 0xfedcba9876543210;
const i8x16_max_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.max_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.max_u(blackbox(i8x16_max_u_v0), blackbox(i8x16_max_u_v0)));
  else { blackbox(i8x16_swar.max_u(blackbox(i8x16_max_u_a), blackbox(i8x16_max_u_hi), blackbox(i8x16_max_u_a), blackbox(i8x16_max_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "max-u");


const i8x16_avgr_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_avgr_u_a: u64 = 0xfedcba9876543210;
const i8x16_avgr_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.avgr_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.avgr_u(blackbox(i8x16_avgr_u_v0), blackbox(i8x16_avgr_u_v0)));
  else { blackbox(i8x16_swar.avgr_u(blackbox(i8x16_avgr_u_a), blackbox(i8x16_avgr_u_hi), blackbox(i8x16_avgr_u_a), blackbox(i8x16_avgr_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "avgr-u");


const i8x16_abs_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_abs_a: u64 = 0xfedcba9876543210;
const i8x16_abs_hi: u64 = 0x0123456789abcdef;

bench("i8x16.abs", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.abs(blackbox(i8x16_abs_v0)));
  else { blackbox(i8x16_swar.abs(blackbox(i8x16_abs_a), blackbox(i8x16_abs_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "abs");


const i8x16_neg_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_neg_a: u64 = 0xfedcba9876543210;
const i8x16_neg_hi: u64 = 0x0123456789abcdef;

bench("i8x16.neg", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.neg(blackbox(i8x16_neg_v0)));
  else { blackbox(i8x16_swar.neg(blackbox(i8x16_neg_a), blackbox(i8x16_neg_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "neg");


const i8x16_add_sat_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_add_sat_s_a: u64 = 0xfedcba9876543210;
const i8x16_add_sat_s_hi: u64 = 0x0123456789abcdef;

bench("i8x16.add_sat_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.add_sat_s(blackbox(i8x16_add_sat_s_v0), blackbox(i8x16_add_sat_s_v0)));
  else { blackbox(i8x16_swar.add_sat_s(blackbox(i8x16_add_sat_s_a), blackbox(i8x16_add_sat_s_hi), blackbox(i8x16_add_sat_s_a), blackbox(i8x16_add_sat_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "add-sat-s");


const i8x16_add_sat_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_add_sat_u_a: u64 = 0xfedcba9876543210;
const i8x16_add_sat_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.add_sat_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.add_sat_u(blackbox(i8x16_add_sat_u_v0), blackbox(i8x16_add_sat_u_v0)));
  else { blackbox(i8x16_swar.add_sat_u(blackbox(i8x16_add_sat_u_a), blackbox(i8x16_add_sat_u_hi), blackbox(i8x16_add_sat_u_a), blackbox(i8x16_add_sat_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "add-sat-u");


const i8x16_sub_sat_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_sub_sat_s_a: u64 = 0xfedcba9876543210;
const i8x16_sub_sat_s_hi: u64 = 0x0123456789abcdef;

bench("i8x16.sub_sat_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.sub_sat_s(blackbox(i8x16_sub_sat_s_v0), blackbox(i8x16_sub_sat_s_v0)));
  else { blackbox(i8x16_swar.sub_sat_s(blackbox(i8x16_sub_sat_s_a), blackbox(i8x16_sub_sat_s_hi), blackbox(i8x16_sub_sat_s_a), blackbox(i8x16_sub_sat_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "sub-sat-s");


const i8x16_sub_sat_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_sub_sat_u_a: u64 = 0xfedcba9876543210;
const i8x16_sub_sat_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.sub_sat_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.sub_sat_u(blackbox(i8x16_sub_sat_u_v0), blackbox(i8x16_sub_sat_u_v0)));
  else { blackbox(i8x16_swar.sub_sat_u(blackbox(i8x16_sub_sat_u_a), blackbox(i8x16_sub_sat_u_hi), blackbox(i8x16_sub_sat_u_a), blackbox(i8x16_sub_sat_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "sub-sat-u");


const i8x16_shl_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_shl_a: u64 = 0xfedcba9876543210;
const i8x16_shl_hi: u64 = 0x0123456789abcdef;
const i8x16_shl_shift: i32 = 3;

bench("i8x16.shl", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.shl(blackbox(i8x16_shl_v0), blackbox(i8x16_shl_shift)));
  else { blackbox(i8x16_swar.shl(blackbox(i8x16_shl_a), blackbox(i8x16_shl_hi), blackbox(i8x16_shl_shift))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "shl");


const i8x16_shr_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_shr_s_a: u64 = 0xfedcba9876543210;
const i8x16_shr_s_hi: u64 = 0x0123456789abcdef;
const i8x16_shr_s_shift: i32 = 3;

bench("i8x16.shr_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.shr_s(blackbox(i8x16_shr_s_v0), blackbox(i8x16_shr_s_shift)));
  else { blackbox(i8x16_swar.shr_s(blackbox(i8x16_shr_s_a), blackbox(i8x16_shr_s_hi), blackbox(i8x16_shr_s_shift))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "shr-s");


const i8x16_shr_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_shr_u_a: u64 = 0xfedcba9876543210;
const i8x16_shr_u_hi: u64 = 0x0123456789abcdef;
const i8x16_shr_u_shift: i32 = 3;

bench("i8x16.shr_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.shr_u(blackbox(i8x16_shr_u_v0), blackbox(i8x16_shr_u_shift)));
  else { blackbox(i8x16_swar.shr_u(blackbox(i8x16_shr_u_a), blackbox(i8x16_shr_u_hi), blackbox(i8x16_shr_u_shift))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "shr-u");


const i8x16_all_true_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_all_true_a: u64 = 0xfedcba9876543210;
const i8x16_all_true_hi: u64 = 0x0123456789abcdef;

bench("i8x16.all_true", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.all_true(blackbox(i8x16_all_true_v0)));
  else blackbox(i8x16_swar.all_true(blackbox(i8x16_all_true_a), blackbox(i8x16_all_true_hi)));
}, OPS, 8);
dumpToFile("i8x16", "all-true");


const i8x16_bitmask_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_bitmask_a: u64 = 0xfedcba9876543210;
const i8x16_bitmask_hi: u64 = 0x0123456789abcdef;

bench("i8x16.bitmask", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.bitmask(blackbox(i8x16_bitmask_v0)));
  else blackbox(i8x16_swar.bitmask(blackbox(i8x16_bitmask_a), blackbox(i8x16_bitmask_hi)));
}, OPS, 8);
dumpToFile("i8x16", "bitmask");


const i8x16_eq_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_eq_a: u64 = 0xfedcba9876543210;
const i8x16_eq_hi: u64 = 0x0123456789abcdef;

bench("i8x16.eq", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.eq(blackbox(i8x16_eq_v0), blackbox(i8x16_eq_v0)));
  else { blackbox(i8x16_swar.eq(blackbox(i8x16_eq_a), blackbox(i8x16_eq_hi), blackbox(i8x16_eq_a), blackbox(i8x16_eq_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "eq");


const i8x16_ne_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_ne_a: u64 = 0xfedcba9876543210;
const i8x16_ne_hi: u64 = 0x0123456789abcdef;

bench("i8x16.ne", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.ne(blackbox(i8x16_ne_v0), blackbox(i8x16_ne_v0)));
  else { blackbox(i8x16_swar.ne(blackbox(i8x16_ne_a), blackbox(i8x16_ne_hi), blackbox(i8x16_ne_a), blackbox(i8x16_ne_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "ne");


const i8x16_lt_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_lt_s_a: u64 = 0xfedcba9876543210;
const i8x16_lt_s_hi: u64 = 0x0123456789abcdef;

bench("i8x16.lt_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.lt_s(blackbox(i8x16_lt_s_v0), blackbox(i8x16_lt_s_v0)));
  else { blackbox(i8x16_swar.lt_s(blackbox(i8x16_lt_s_a), blackbox(i8x16_lt_s_hi), blackbox(i8x16_lt_s_a), blackbox(i8x16_lt_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "lt-s");


const i8x16_lt_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_lt_u_a: u64 = 0xfedcba9876543210;
const i8x16_lt_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.lt_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.lt_u(blackbox(i8x16_lt_u_v0), blackbox(i8x16_lt_u_v0)));
  else { blackbox(i8x16_swar.lt_u(blackbox(i8x16_lt_u_a), blackbox(i8x16_lt_u_hi), blackbox(i8x16_lt_u_a), blackbox(i8x16_lt_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "lt-u");


const i8x16_le_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_le_s_a: u64 = 0xfedcba9876543210;
const i8x16_le_s_hi: u64 = 0x0123456789abcdef;

bench("i8x16.le_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.le_s(blackbox(i8x16_le_s_v0), blackbox(i8x16_le_s_v0)));
  else { blackbox(i8x16_swar.le_s(blackbox(i8x16_le_s_a), blackbox(i8x16_le_s_hi), blackbox(i8x16_le_s_a), blackbox(i8x16_le_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "le-s");


const i8x16_le_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_le_u_a: u64 = 0xfedcba9876543210;
const i8x16_le_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.le_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.le_u(blackbox(i8x16_le_u_v0), blackbox(i8x16_le_u_v0)));
  else { blackbox(i8x16_swar.le_u(blackbox(i8x16_le_u_a), blackbox(i8x16_le_u_hi), blackbox(i8x16_le_u_a), blackbox(i8x16_le_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "le-u");


const i8x16_gt_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_gt_s_a: u64 = 0xfedcba9876543210;
const i8x16_gt_s_hi: u64 = 0x0123456789abcdef;

bench("i8x16.gt_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.gt_s(blackbox(i8x16_gt_s_v0), blackbox(i8x16_gt_s_v0)));
  else { blackbox(i8x16_swar.gt_s(blackbox(i8x16_gt_s_a), blackbox(i8x16_gt_s_hi), blackbox(i8x16_gt_s_a), blackbox(i8x16_gt_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "gt-s");


const i8x16_gt_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_gt_u_a: u64 = 0xfedcba9876543210;
const i8x16_gt_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.gt_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.gt_u(blackbox(i8x16_gt_u_v0), blackbox(i8x16_gt_u_v0)));
  else { blackbox(i8x16_swar.gt_u(blackbox(i8x16_gt_u_a), blackbox(i8x16_gt_u_hi), blackbox(i8x16_gt_u_a), blackbox(i8x16_gt_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "gt-u");


const i8x16_ge_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_ge_s_a: u64 = 0xfedcba9876543210;
const i8x16_ge_s_hi: u64 = 0x0123456789abcdef;

bench("i8x16.ge_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.ge_s(blackbox(i8x16_ge_s_v0), blackbox(i8x16_ge_s_v0)));
  else { blackbox(i8x16_swar.ge_s(blackbox(i8x16_ge_s_a), blackbox(i8x16_ge_s_hi), blackbox(i8x16_ge_s_a), blackbox(i8x16_ge_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "ge-s");


const i8x16_ge_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_ge_u_a: u64 = 0xfedcba9876543210;
const i8x16_ge_u_hi: u64 = 0x0123456789abcdef;

bench("i8x16.ge_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.ge_u(blackbox(i8x16_ge_u_v0), blackbox(i8x16_ge_u_v0)));
  else { blackbox(i8x16_swar.ge_u(blackbox(i8x16_ge_u_a), blackbox(i8x16_ge_u_hi), blackbox(i8x16_ge_u_a), blackbox(i8x16_ge_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "ge-u");


const i8x16_narrow_i16x8_s_a: u64 = 0xfedcba9876543210;
const i8x16_narrow_i16x8_s_hi: u64 = 0x0123456789abcdef;
const i8x16_narrow_i16x8_s_x: i8 = -37;

bench("i8x16.narrow_i16x8_s", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.narrow_i16x8_s(i16x8.splat(blackbox(i8x16_narrow_i16x8_s_x) as i16), i16x8.splat(blackbox(i8x16_narrow_i16x8_s_x) as i16)));
  else { blackbox(i8x16_swar.narrow_i16x8_s(blackbox(i8x16_narrow_i16x8_s_a), blackbox(i8x16_narrow_i16x8_s_hi), blackbox(i8x16_narrow_i16x8_s_a), blackbox(i8x16_narrow_i16x8_s_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "narrow-i16x8-s");


const i8x16_narrow_i16x8_u_a: u64 = 0xfedcba9876543210;
const i8x16_narrow_i16x8_u_hi: u64 = 0x0123456789abcdef;
const i8x16_narrow_i16x8_u_x: i8 = -37;

bench("i8x16.narrow_i16x8_u", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.narrow_i16x8_u(i16x8.splat(blackbox(i8x16_narrow_i16x8_u_x) as i16), i16x8.splat(blackbox(i8x16_narrow_i16x8_u_x) as i16)));
  else { blackbox(i8x16_swar.narrow_i16x8_u(blackbox(i8x16_narrow_i16x8_u_a), blackbox(i8x16_narrow_i16x8_u_hi), blackbox(i8x16_narrow_i16x8_u_a), blackbox(i8x16_narrow_i16x8_u_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "narrow-i16x8-u");


const i8x16_shuffle_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_shuffle_a: u64 = 0xfedcba9876543210;
const i8x16_shuffle_hi: u64 = 0x0123456789abcdef;

bench("i8x16.shuffle", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.shuffle(blackbox(i8x16_shuffle_v0), blackbox(i8x16_shuffle_v0), 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0));
  else {
    blackbox(i8x16_swar.shuffle(blackbox(i8x16_shuffle_a), blackbox(i8x16_shuffle_hi), blackbox(i8x16_shuffle_a), blackbox(i8x16_shuffle_hi), 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0));
    blackbox(i8x16_swar.take_hi());
  }
}, OPS, 16);
dumpToFile("i8x16", "shuffle");


const i8x16_swizzle_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_swizzle_a: u64 = 0xfedcba9876543210;
const i8x16_swizzle_hi: u64 = 0x0123456789abcdef;

bench("i8x16.swizzle", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.swizzle(blackbox(i8x16_swizzle_v0), blackbox(i8x16_swizzle_v0)));
  else { blackbox(i8x16_swar.swizzle(blackbox(i8x16_swizzle_a), blackbox(i8x16_swizzle_hi), blackbox(i8x16_swizzle_a), blackbox(i8x16_swizzle_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "swizzle");


const i8x16_relaxed_swizzle_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_relaxed_laneselect_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_relaxed_swizzle_a: u64 = 0xfedcba9876543210;
const i8x16_relaxed_swizzle_hi: u64 = 0x0123456789abcdef;
const i8x16_relaxed_laneselect_a: u64 = 0xfedcba9876543210;
const i8x16_relaxed_laneselect_b: u64 = 0x7766554433221100;
const i8x16_relaxed_laneselect_hi: u64 = 0x0123456789abcdef;
const i8x16_relaxed_laneselect_m: u64 = 0x00ff807f55aa33cc;

if (ASC_FEATURE_RELAXED_SIMD) {
  bench("i8x16.relaxed_swizzle", () => {
    blackbox(i8x16.relaxed_swizzle(blackbox(i8x16_relaxed_swizzle_v0), blackbox(i8x16_relaxed_swizzle_v0)));
  }, OPS, 8);
  dumpToFile("i8x16", "relaxed-swizzle");


  bench("i8x16.relaxed_laneselect", () => {
    blackbox(i8x16.relaxed_laneselect(blackbox(i8x16_relaxed_laneselect_v0), blackbox(i8x16_relaxed_laneselect_v0), blackbox(i8x16_relaxed_laneselect_v0)));
  }, OPS, 24);
  dumpToFile("i8x16", "relaxed-laneselect");

} else {
  bench("i8x16.relaxed_swizzle", () => {
    blackbox(i8x16_swar.relaxed_swizzle(blackbox(i8x16_relaxed_swizzle_a), blackbox(i8x16_relaxed_swizzle_hi), blackbox(i8x16_relaxed_swizzle_a), blackbox(i8x16_relaxed_swizzle_hi)));
    blackbox(i8x16_swar.take_hi());
  }, OPS, 8);
  dumpToFile("i8x16", "relaxed-swizzle");


  bench("i8x16.relaxed_laneselect", () => {
    blackbox(i8x16_swar.relaxed_laneselect(blackbox(i8x16_relaxed_laneselect_a), blackbox(i8x16_relaxed_laneselect_hi), blackbox(i8x16_relaxed_laneselect_a), blackbox(i8x16_relaxed_laneselect_hi), blackbox(i8x16_relaxed_laneselect_m), blackbox(i8x16_relaxed_laneselect_b)));
    blackbox(i8x16_swar.take_hi());
  }, OPS, 24);
  dumpToFile("i8x16", "relaxed-laneselect");

}

const i8x16_popcnt_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i8x16_popcnt_a: u64 = 0xfedcba9876543210;
const i8x16_popcnt_hi: u64 = 0x0123456789abcdef;

bench("i8x16.popcnt", () => {
  if (ASC_FEATURE_SIMD) blackbox(i8x16.popcnt(blackbox(i8x16_popcnt_v0)));
  else { blackbox(i8x16_swar.popcnt(blackbox(i8x16_popcnt_a), blackbox(i8x16_popcnt_hi))); blackbox(i8x16_swar.take_hi()); }
}, OPS, 8);
dumpToFile("i8x16", "popcnt");

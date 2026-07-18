// Native-SIMD half of the physically split i16x8 benchmark suite.
import { i16x8_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;

const i16x8_ctor_x: i16 = -12345;

bench(
  "i16x8.ctor",
  () => {
    if (ASC_FEATURE_SIMD) {
      blackbox(i16x8(
        blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x),
        blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x),
      ));
    } else {
      blackbox(i16x8_swar(
        blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x),
        blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x), blackbox(i16x8_ctor_x),
      ));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "ctor");

const i16x8_splat_x: i16 = -12345;

bench(
  "i16x8.splat",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.splat(blackbox(i16x8_splat_x)));
    else {
      blackbox(i16x8_swar.splat(blackbox(i16x8_splat_x)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "splat");

const i16x8_extract_lane_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_extract_lane_s_lo: u64 = 0xfedcba9876543210;
const i16x8_extract_lane_s_hi: u64 = 0x0123456789abcdef;
const i16x8_extract_lane_s_lane: u8 = 5;

bench(
  "i16x8.extract_lane_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.extract_lane_s(blackbox(i16x8_extract_lane_s_v0), 5));
    else blackbox(i16x8_swar.extract_lane_s(blackbox(i16x8_extract_lane_s_lo), blackbox(i16x8_extract_lane_s_hi), blackbox(i16x8_extract_lane_s_lane)));
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extract-lane-s");

const i16x8_extract_lane_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_extract_lane_u_lo: u64 = 0xfedcba9876543210;
const i16x8_extract_lane_u_hi: u64 = 0x0123456789abcdef;
const i16x8_extract_lane_u_lane: u8 = 5;

bench(
  "i16x8.extract_lane_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.extract_lane_u(blackbox(i16x8_extract_lane_u_v0), 5));
    else blackbox(i16x8_swar.extract_lane_u(blackbox(i16x8_extract_lane_u_lo), blackbox(i16x8_extract_lane_u_hi), blackbox(i16x8_extract_lane_u_lane)));
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extract-lane-u");

const i16x8_replace_lane_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_replace_lane_lo: u64 = 0xfedcba9876543210;
const i16x8_replace_lane_hi: u64 = 0x0123456789abcdef;
const i16x8_replace_lane_x: i16 = -12345;
const i16x8_replace_lane_lane: u8 = 5;

bench(
  "i16x8.replace_lane",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.replace_lane(blackbox(i16x8_replace_lane_v0), 5, blackbox(i16x8_replace_lane_x)));
    else {
      blackbox(i16x8_swar.replace_lane(blackbox(i16x8_replace_lane_lo), blackbox(i16x8_replace_lane_hi), blackbox(i16x8_replace_lane_lane), blackbox(i16x8_replace_lane_x)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "replace-lane");

const i16x8_add_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_add_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_add_lo0: u64 = 0xfedcba9876543210;
const i16x8_add_hi0: u64 = 0x0123456789abcdef;
const i16x8_add_lo1: u64 = 0x7766554433221100;
const i16x8_add_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.add",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.add(blackbox(i16x8_add_v0), blackbox(i16x8_add_v1)));
    else {
      blackbox(i16x8_swar.add(blackbox(i16x8_add_lo0), blackbox(i16x8_add_hi0), blackbox(i16x8_add_lo1), blackbox(i16x8_add_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "add");

const i16x8_sub_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_sub_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_sub_lo0: u64 = 0xfedcba9876543210;
const i16x8_sub_hi0: u64 = 0x0123456789abcdef;
const i16x8_sub_lo1: u64 = 0x7766554433221100;
const i16x8_sub_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.sub",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.sub(blackbox(i16x8_sub_v0), blackbox(i16x8_sub_v1)));
    else {
      blackbox(i16x8_swar.sub(blackbox(i16x8_sub_lo0), blackbox(i16x8_sub_hi0), blackbox(i16x8_sub_lo1), blackbox(i16x8_sub_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "sub");

const i16x8_mul_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_mul_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_mul_lo0: u64 = 0xfedcba9876543210;
const i16x8_mul_hi0: u64 = 0x0123456789abcdef;
const i16x8_mul_lo1: u64 = 0x7766554433221100;
const i16x8_mul_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.mul",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.mul(blackbox(i16x8_mul_v0), blackbox(i16x8_mul_v1)));
    else {
      blackbox(i16x8_swar.mul(blackbox(i16x8_mul_lo0), blackbox(i16x8_mul_hi0), blackbox(i16x8_mul_lo1), blackbox(i16x8_mul_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "mul");

const i16x8_min_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_min_s_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_min_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_min_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_min_s_lo1: u64 = 0x7766554433221100;
const i16x8_min_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.min_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.min_s(blackbox(i16x8_min_s_v0), blackbox(i16x8_min_s_v1)));
    else {
      blackbox(i16x8_swar.min_s(blackbox(i16x8_min_s_lo0), blackbox(i16x8_min_s_hi0), blackbox(i16x8_min_s_lo1), blackbox(i16x8_min_s_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "min-s");

const i16x8_min_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_min_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_min_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_min_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_min_u_lo1: u64 = 0x7766554433221100;
const i16x8_min_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.min_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.min_u(blackbox(i16x8_min_u_v0), blackbox(i16x8_min_u_v1)));
    else {
      blackbox(i16x8_swar.min_u(blackbox(i16x8_min_u_lo0), blackbox(i16x8_min_u_hi0), blackbox(i16x8_min_u_lo1), blackbox(i16x8_min_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "min-u");

const i16x8_max_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_max_s_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_max_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_max_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_max_s_lo1: u64 = 0x7766554433221100;
const i16x8_max_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.max_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.max_s(blackbox(i16x8_max_s_v0), blackbox(i16x8_max_s_v1)));
    else {
      blackbox(i16x8_swar.max_s(blackbox(i16x8_max_s_lo0), blackbox(i16x8_max_s_hi0), blackbox(i16x8_max_s_lo1), blackbox(i16x8_max_s_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "max-s");

const i16x8_max_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_max_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_max_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_max_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_max_u_lo1: u64 = 0x7766554433221100;
const i16x8_max_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.max_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.max_u(blackbox(i16x8_max_u_v0), blackbox(i16x8_max_u_v1)));
    else {
      blackbox(i16x8_swar.max_u(blackbox(i16x8_max_u_lo0), blackbox(i16x8_max_u_hi0), blackbox(i16x8_max_u_lo1), blackbox(i16x8_max_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "max-u");

const i16x8_avgr_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_avgr_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_avgr_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_avgr_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_avgr_u_lo1: u64 = 0x7766554433221100;
const i16x8_avgr_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.avgr_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.avgr_u(blackbox(i16x8_avgr_u_v0), blackbox(i16x8_avgr_u_v1)));
    else {
      blackbox(i16x8_swar.avgr_u(blackbox(i16x8_avgr_u_lo0), blackbox(i16x8_avgr_u_hi0), blackbox(i16x8_avgr_u_lo1), blackbox(i16x8_avgr_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "avgr-u");

const i16x8_abs_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_abs_lo: u64 = 0xfedcba9876543210;
const i16x8_abs_hi: u64 = 0x0123456789abcdef;

bench(
  "i16x8.abs",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.abs(blackbox(i16x8_abs_v0)));
    else {
      blackbox(i16x8_swar.abs(blackbox(i16x8_abs_lo), blackbox(i16x8_abs_hi)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "abs");

const i16x8_neg_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_neg_lo: u64 = 0xfedcba9876543210;
const i16x8_neg_hi: u64 = 0x0123456789abcdef;

bench(
  "i16x8.neg",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.neg(blackbox(i16x8_neg_v0)));
    else {
      blackbox(i16x8_swar.neg(blackbox(i16x8_neg_lo), blackbox(i16x8_neg_hi)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "neg");

const i16x8_add_sat_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_add_sat_s_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_add_sat_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_add_sat_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_add_sat_s_lo1: u64 = 0x7766554433221100;
const i16x8_add_sat_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.add_sat_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.add_sat_s(blackbox(i16x8_add_sat_s_v0), blackbox(i16x8_add_sat_s_v1)));
    else {
      blackbox(i16x8_swar.add_sat_s(blackbox(i16x8_add_sat_s_lo0), blackbox(i16x8_add_sat_s_hi0), blackbox(i16x8_add_sat_s_lo1), blackbox(i16x8_add_sat_s_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "add-sat-s");

const i16x8_add_sat_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_add_sat_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_add_sat_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_add_sat_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_add_sat_u_lo1: u64 = 0x7766554433221100;
const i16x8_add_sat_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.add_sat_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.add_sat_u(blackbox(i16x8_add_sat_u_v0), blackbox(i16x8_add_sat_u_v1)));
    else {
      blackbox(i16x8_swar.add_sat_u(blackbox(i16x8_add_sat_u_lo0), blackbox(i16x8_add_sat_u_hi0), blackbox(i16x8_add_sat_u_lo1), blackbox(i16x8_add_sat_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "add-sat-u");

const i16x8_sub_sat_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_sub_sat_s_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_sub_sat_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_sub_sat_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_sub_sat_s_lo1: u64 = 0x7766554433221100;
const i16x8_sub_sat_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.sub_sat_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.sub_sat_s(blackbox(i16x8_sub_sat_s_v0), blackbox(i16x8_sub_sat_s_v1)));
    else {
      blackbox(i16x8_swar.sub_sat_s(blackbox(i16x8_sub_sat_s_lo0), blackbox(i16x8_sub_sat_s_hi0), blackbox(i16x8_sub_sat_s_lo1), blackbox(i16x8_sub_sat_s_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "sub-sat-s");

const i16x8_sub_sat_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_sub_sat_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_sub_sat_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_sub_sat_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_sub_sat_u_lo1: u64 = 0x7766554433221100;
const i16x8_sub_sat_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.sub_sat_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.sub_sat_u(blackbox(i16x8_sub_sat_u_v0), blackbox(i16x8_sub_sat_u_v1)));
    else {
      blackbox(i16x8_swar.sub_sat_u(blackbox(i16x8_sub_sat_u_lo0), blackbox(i16x8_sub_sat_u_hi0), blackbox(i16x8_sub_sat_u_lo1), blackbox(i16x8_sub_sat_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "sub-sat-u");

const i16x8_shl_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_shl_lo: u64 = 0xfedcba9876543210;
const i16x8_shl_hi: u64 = 0x0123456789abcdef;
const i16x8_shl_shift: i32 = 5;

bench(
  "i16x8.shl",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.shl(blackbox(i16x8_shl_v0), blackbox(i16x8_shl_shift)));
    else {
      blackbox(i16x8_swar.shl(blackbox(i16x8_shl_lo), blackbox(i16x8_shl_hi), blackbox(i16x8_shl_shift)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "shl");

const i16x8_shr_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_shr_s_lo: u64 = 0xfedcba9876543210;
const i16x8_shr_s_hi: u64 = 0x0123456789abcdef;
const i16x8_shr_s_shift: i32 = 5;

bench(
  "i16x8.shr_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.shr_s(blackbox(i16x8_shr_s_v0), blackbox(i16x8_shr_s_shift)));
    else {
      blackbox(i16x8_swar.shr_s(blackbox(i16x8_shr_s_lo), blackbox(i16x8_shr_s_hi), blackbox(i16x8_shr_s_shift)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "shr-s");

const i16x8_shr_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_shr_u_lo: u64 = 0xfedcba9876543210;
const i16x8_shr_u_hi: u64 = 0x0123456789abcdef;
const i16x8_shr_u_shift: i32 = 5;

bench(
  "i16x8.shr_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.shr_u(blackbox(i16x8_shr_u_v0), blackbox(i16x8_shr_u_shift)));
    else {
      blackbox(i16x8_swar.shr_u(blackbox(i16x8_shr_u_lo), blackbox(i16x8_shr_u_hi), blackbox(i16x8_shr_u_shift)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "shr-u");

const i16x8_all_true_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_all_true_lo: u64 = 0xfedcba9876543210;
const i16x8_all_true_hi: u64 = 0x0123456789abcdef;

bench(
  "i16x8.all_true",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.all_true(blackbox(i16x8_all_true_v0)));
    else blackbox(i16x8_swar.all_true(blackbox(i16x8_all_true_lo), blackbox(i16x8_all_true_hi)));
  },
  OPS,
  8,
);
dumpToFile("i16x8", "all-true");

const i16x8_bitmask_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_bitmask_lo: u64 = 0xfedcba9876543210;
const i16x8_bitmask_hi: u64 = 0x0123456789abcdef;

bench(
  "i16x8.bitmask",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.bitmask(blackbox(i16x8_bitmask_v0)));
    else blackbox(i16x8_swar.bitmask(blackbox(i16x8_bitmask_lo), blackbox(i16x8_bitmask_hi)));
  },
  OPS,
  8,
);
dumpToFile("i16x8", "bitmask");

const i16x8_eq_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_eq_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_eq_lo0: u64 = 0xfedcba9876543210;
const i16x8_eq_hi0: u64 = 0x0123456789abcdef;
const i16x8_eq_lo1: u64 = 0x7766554433221100;
const i16x8_eq_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.eq",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.eq(blackbox(i16x8_eq_v0), blackbox(i16x8_eq_v1)));
    else {
      blackbox(i16x8_swar.eq(blackbox(i16x8_eq_lo0), blackbox(i16x8_eq_hi0), blackbox(i16x8_eq_lo1), blackbox(i16x8_eq_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "eq");

const i16x8_ne_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_ne_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_ne_lo0: u64 = 0xfedcba9876543210;
const i16x8_ne_hi0: u64 = 0x0123456789abcdef;
const i16x8_ne_lo1: u64 = 0x7766554433221100;
const i16x8_ne_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.ne",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.ne(blackbox(i16x8_ne_v0), blackbox(i16x8_ne_v1)));
    else {
      blackbox(i16x8_swar.ne(blackbox(i16x8_ne_lo0), blackbox(i16x8_ne_hi0), blackbox(i16x8_ne_lo1), blackbox(i16x8_ne_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "ne");

const i16x8_lt_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_lt_s_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_lt_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_lt_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_lt_s_lo1: u64 = 0x7766554433221100;
const i16x8_lt_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.lt_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.lt_s(blackbox(i16x8_lt_s_v0), blackbox(i16x8_lt_s_v1)));
    else {
      blackbox(i16x8_swar.lt_s(blackbox(i16x8_lt_s_lo0), blackbox(i16x8_lt_s_hi0), blackbox(i16x8_lt_s_lo1), blackbox(i16x8_lt_s_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "lt-s");

const i16x8_lt_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_lt_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_lt_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_lt_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_lt_u_lo1: u64 = 0x7766554433221100;
const i16x8_lt_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.lt_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.lt_u(blackbox(i16x8_lt_u_v0), blackbox(i16x8_lt_u_v1)));
    else {
      blackbox(i16x8_swar.lt_u(blackbox(i16x8_lt_u_lo0), blackbox(i16x8_lt_u_hi0), blackbox(i16x8_lt_u_lo1), blackbox(i16x8_lt_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "lt-u");

const i16x8_le_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_le_s_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_le_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_le_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_le_s_lo1: u64 = 0x7766554433221100;
const i16x8_le_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.le_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.le_s(blackbox(i16x8_le_s_v0), blackbox(i16x8_le_s_v1)));
    else {
      blackbox(i16x8_swar.le_s(blackbox(i16x8_le_s_lo0), blackbox(i16x8_le_s_hi0), blackbox(i16x8_le_s_lo1), blackbox(i16x8_le_s_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "le-s");

const i16x8_le_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_le_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_le_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_le_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_le_u_lo1: u64 = 0x7766554433221100;
const i16x8_le_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.le_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.le_u(blackbox(i16x8_le_u_v0), blackbox(i16x8_le_u_v1)));
    else {
      blackbox(i16x8_swar.le_u(blackbox(i16x8_le_u_lo0), blackbox(i16x8_le_u_hi0), blackbox(i16x8_le_u_lo1), blackbox(i16x8_le_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "le-u");

const i16x8_gt_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_gt_s_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_gt_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_gt_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_gt_s_lo1: u64 = 0x7766554433221100;
const i16x8_gt_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.gt_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.gt_s(blackbox(i16x8_gt_s_v0), blackbox(i16x8_gt_s_v1)));
    else {
      blackbox(i16x8_swar.gt_s(blackbox(i16x8_gt_s_lo0), blackbox(i16x8_gt_s_hi0), blackbox(i16x8_gt_s_lo1), blackbox(i16x8_gt_s_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "gt-s");

const i16x8_gt_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_gt_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_gt_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_gt_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_gt_u_lo1: u64 = 0x7766554433221100;
const i16x8_gt_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.gt_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.gt_u(blackbox(i16x8_gt_u_v0), blackbox(i16x8_gt_u_v1)));
    else {
      blackbox(i16x8_swar.gt_u(blackbox(i16x8_gt_u_lo0), blackbox(i16x8_gt_u_hi0), blackbox(i16x8_gt_u_lo1), blackbox(i16x8_gt_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "gt-u");

const i16x8_ge_s_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_ge_s_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_ge_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_ge_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_ge_s_lo1: u64 = 0x7766554433221100;
const i16x8_ge_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.ge_s",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.ge_s(blackbox(i16x8_ge_s_v0), blackbox(i16x8_ge_s_v1)));
    else {
      blackbox(i16x8_swar.ge_s(blackbox(i16x8_ge_s_lo0), blackbox(i16x8_ge_s_hi0), blackbox(i16x8_ge_s_lo1), blackbox(i16x8_ge_s_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "ge-s");

const i16x8_ge_u_v0 = i64x2(0xfedcba9876543210, 0x0123456789abcdef);
const i16x8_ge_u_v1 = i64x2(0x7766554433221100, 0x13579bdf2468ace0);
const i16x8_ge_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_ge_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_ge_u_lo1: u64 = 0x7766554433221100;
const i16x8_ge_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.ge_u",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i16x8.ge_u(blackbox(i16x8_ge_u_v0), blackbox(i16x8_ge_u_v1)));
    else {
      blackbox(i16x8_swar.ge_u(blackbox(i16x8_ge_u_lo0), blackbox(i16x8_ge_u_hi0), blackbox(i16x8_ge_u_lo1), blackbox(i16x8_ge_u_hi1)));
      blackbox(i16x8_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i16x8", "ge-u");

const i16x8_narrow_i32x4_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_narrow_i32x4_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_narrow_i32x4_s_lo1: u64 = 0x7766554433221100;
const i16x8_narrow_i32x4_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.narrow_i32x4_s",
  () => {
    blackbox(i16x8_swar.narrow_i32x4_s(blackbox(i16x8_narrow_i32x4_s_lo0), blackbox(i16x8_narrow_i32x4_s_hi0), blackbox(i16x8_narrow_i32x4_s_lo1), blackbox(i16x8_narrow_i32x4_s_hi1)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "narrow-i32x4-s");

const i16x8_narrow_i32x4_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_narrow_i32x4_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_narrow_i32x4_u_lo1: u64 = 0x7766554433221100;
const i16x8_narrow_i32x4_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.narrow_i32x4_u",
  () => {
    blackbox(i16x8_swar.narrow_i32x4_u(blackbox(i16x8_narrow_i32x4_u_lo0), blackbox(i16x8_narrow_i32x4_u_hi0), blackbox(i16x8_narrow_i32x4_u_lo1), blackbox(i16x8_narrow_i32x4_u_hi1)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "narrow-i32x4-u");

const i16x8_extend_low_i8x16_s_lo: u64 = 0xfedcba9876543210;
const i16x8_extend_low_i8x16_s_hi: u64 = 0x0123456789abcdef;

bench(
  "i16x8.extend_low_i8x16_s",
  () => {
    blackbox(i16x8_swar.extend_low_i8x16_s(blackbox(i16x8_extend_low_i8x16_s_lo), blackbox(i16x8_extend_low_i8x16_s_hi)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extend-low-i8x16-s");

const i16x8_extend_low_i8x16_u_lo: u64 = 0xfedcba9876543210;
const i16x8_extend_low_i8x16_u_hi: u64 = 0x0123456789abcdef;

bench(
  "i16x8.extend_low_i8x16_u",
  () => {
    blackbox(i16x8_swar.extend_low_i8x16_u(blackbox(i16x8_extend_low_i8x16_u_lo), blackbox(i16x8_extend_low_i8x16_u_hi)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extend-low-i8x16-u");

const i16x8_extend_high_i8x16_s_lo: u64 = 0xfedcba9876543210;
const i16x8_extend_high_i8x16_s_hi: u64 = 0x0123456789abcdef;

bench(
  "i16x8.extend_high_i8x16_s",
  () => {
    blackbox(i16x8_swar.extend_high_i8x16_s(blackbox(i16x8_extend_high_i8x16_s_lo), blackbox(i16x8_extend_high_i8x16_s_hi)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extend-high-i8x16-s");

const i16x8_extend_high_i8x16_u_lo: u64 = 0xfedcba9876543210;
const i16x8_extend_high_i8x16_u_hi: u64 = 0x0123456789abcdef;

bench(
  "i16x8.extend_high_i8x16_u",
  () => {
    blackbox(i16x8_swar.extend_high_i8x16_u(blackbox(i16x8_extend_high_i8x16_u_lo), blackbox(i16x8_extend_high_i8x16_u_hi)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extend-high-i8x16-u");

const i16x8_q15mulr_sat_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_q15mulr_sat_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_q15mulr_sat_s_lo1: u64 = 0x7766554433221100;
const i16x8_q15mulr_sat_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.q15mulr_sat_s",
  () => {
    blackbox(i16x8_swar.q15mulr_sat_s(blackbox(i16x8_q15mulr_sat_s_lo0), blackbox(i16x8_q15mulr_sat_s_hi0), blackbox(i16x8_q15mulr_sat_s_lo1), blackbox(i16x8_q15mulr_sat_s_hi1)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "q15mulr-sat-s");

const i16x8_extmul_low_i8x16_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_extmul_low_i8x16_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_extmul_low_i8x16_s_lo1: u64 = 0x7766554433221100;
const i16x8_extmul_low_i8x16_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.extmul_low_i8x16_s",
  () => {
    blackbox(i16x8_swar.extmul_low_i8x16_s(blackbox(i16x8_extmul_low_i8x16_s_lo0), blackbox(i16x8_extmul_low_i8x16_s_hi0), blackbox(i16x8_extmul_low_i8x16_s_lo1), blackbox(i16x8_extmul_low_i8x16_s_hi1)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extmul-low-i8x16-s");

const i16x8_extmul_low_i8x16_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_extmul_low_i8x16_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_extmul_low_i8x16_u_lo1: u64 = 0x7766554433221100;
const i16x8_extmul_low_i8x16_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.extmul_low_i8x16_u",
  () => {
    blackbox(i16x8_swar.extmul_low_i8x16_u(blackbox(i16x8_extmul_low_i8x16_u_lo0), blackbox(i16x8_extmul_low_i8x16_u_hi0), blackbox(i16x8_extmul_low_i8x16_u_lo1), blackbox(i16x8_extmul_low_i8x16_u_hi1)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extmul-low-i8x16-u");

const i16x8_extmul_high_i8x16_s_lo0: u64 = 0xfedcba9876543210;
const i16x8_extmul_high_i8x16_s_hi0: u64 = 0x0123456789abcdef;
const i16x8_extmul_high_i8x16_s_lo1: u64 = 0x7766554433221100;
const i16x8_extmul_high_i8x16_s_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.extmul_high_i8x16_s",
  () => {
    blackbox(i16x8_swar.extmul_high_i8x16_s(blackbox(i16x8_extmul_high_i8x16_s_lo0), blackbox(i16x8_extmul_high_i8x16_s_hi0), blackbox(i16x8_extmul_high_i8x16_s_lo1), blackbox(i16x8_extmul_high_i8x16_s_hi1)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extmul-high-i8x16-s");

const i16x8_extmul_high_i8x16_u_lo0: u64 = 0xfedcba9876543210;
const i16x8_extmul_high_i8x16_u_hi0: u64 = 0x0123456789abcdef;
const i16x8_extmul_high_i8x16_u_lo1: u64 = 0x7766554433221100;
const i16x8_extmul_high_i8x16_u_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.extmul_high_i8x16_u",
  () => {
    blackbox(i16x8_swar.extmul_high_i8x16_u(blackbox(i16x8_extmul_high_i8x16_u_lo0), blackbox(i16x8_extmul_high_i8x16_u_hi0), blackbox(i16x8_extmul_high_i8x16_u_lo1), blackbox(i16x8_extmul_high_i8x16_u_hi1)));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "extmul-high-i8x16-u");

const i16x8_shuffle_lo0: u64 = 0xfedcba9876543210;
const i16x8_shuffle_hi0: u64 = 0x0123456789abcdef;
const i16x8_shuffle_lo1: u64 = 0x7766554433221100;
const i16x8_shuffle_hi1: u64 = 0x13579bdf2468ace0;

bench(
  "i16x8.shuffle",
  () => {
    blackbox(i16x8_swar.shuffle(blackbox(i16x8_shuffle_lo0), blackbox(i16x8_shuffle_hi0), blackbox(i16x8_shuffle_lo1), blackbox(i16x8_shuffle_hi1), 7, 6, 5, 4, 3, 2, 1, 0));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i16x8", "shuffle");

const i16x8_relaxed_laneselect_lo0: u64 = 0xfedcba9876543210;
const i16x8_relaxed_laneselect_hi0: u64 = 0x0123456789abcdef;
const i16x8_relaxed_laneselect_lo1: u64 = 0x7766554433221100;
const i16x8_relaxed_laneselect_hi1: u64 = 0x13579bdf2468ace0;
const i16x8_relaxed_laneselect_mask_lo: u64 = 0x80ff00ff80ff00ff;
const i16x8_relaxed_laneselect_mask_hi: u64 = 0xff0080ff00ff80ff;

bench(
  "i16x8.relaxed_laneselect",
  () => {
    blackbox(i16x8_swar.relaxed_laneselect(
      blackbox(i16x8_relaxed_laneselect_lo0), blackbox(i16x8_relaxed_laneselect_hi0),
      blackbox(i16x8_relaxed_laneselect_lo1), blackbox(i16x8_relaxed_laneselect_hi1),
      blackbox(i16x8_relaxed_laneselect_mask_lo), blackbox(i16x8_relaxed_laneselect_mask_hi),
    ));
    blackbox(i16x8_swar.take_hi());
  },
  OPS,
  24,
);
dumpToFile("i16x8", "relaxed-laneselect");

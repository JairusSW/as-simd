import { i16x4 } from "../v64/lanes";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(96);
const BENCH_A: u64 = 0xfedcba9876543210;
const BENCH_B: u64 = 0x7766554433221100;
const BENCH_M: u64 = 0x80ff00ff80ff00ff;
const BENCH_I16: i16 = -12345;
const BENCH_SHIFT: i32 = 5;
const BENCH_LANE2: u8 = 1;
const BENCH_LANE4: u8 = 3;
const BENCH_LANE8: u8 = 5;
const BENCH_LEN: i32 = 3;
const BENCH_PTR: usize = IO_PTR + 0x20;
const BENCH_128_LO: u64 = 0xfedcba9876543210;
const BENCH_128_HI: u64 = 0x0123456789abcdef;

bench(
  "i16x4.ctor",
  () => {
    blackbox(
      i16x4(
        blackbox(BENCH_I16),
        blackbox(BENCH_I16),
        blackbox(BENCH_I16),
        blackbox(BENCH_I16),
      ),
    );
  },
  OPS,
  8,
);
dumpToFile("i16x4", "ctor");

bench(
  "i16x4.splat",
  () => {
    blackbox(i16x4.splat(blackbox(BENCH_I16)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "splat");

bench(
  "i16x4.load",
  () => {
    blackbox(load<u64>(blackbox(BENCH_PTR)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "load");

bench(
  "i16x4.store",
  () => {
    store<u64>(blackbox(BENCH_PTR), blackbox(BENCH_A));
    blackbox(load<u64>(IO_PTR));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "store");

bench(
  "i16x4.loadPartial",
  () => {
    blackbox(
      i16x4.loadPartial(
        blackbox(BENCH_PTR),
        blackbox(BENCH_LEN),
        0,
        2,
        blackbox(BENCH_I16),
      ),
    );
  },
  OPS,
  8,
);
dumpToFile("i16x4", "load-partial");

bench(
  "i16x4.storePartial",
  () => {
    i16x4.storePartial(
      blackbox(BENCH_PTR),
      blackbox(BENCH_A),
      blackbox(BENCH_LEN),
      0,
      2,
    );
    blackbox(load<u64>(IO_PTR));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "store-partial");

bench(
  "i16x4.extract_lane_s",
  () => {
    blackbox(i16x4.extract_lane_s(blackbox(BENCH_A), blackbox(BENCH_LANE4)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extract-lane-s");

bench(
  "i16x4.extract_lane_u",
  () => {
    blackbox(i16x4.extract_lane_u(blackbox(BENCH_A), blackbox(BENCH_LANE4)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extract-lane-u");

bench(
  "i16x4.replace_lane",
  () => {
    blackbox(
      i16x4.replace_lane(
        blackbox(BENCH_A),
        blackbox(BENCH_LANE4),
        blackbox(BENCH_I16),
      ),
    );
  },
  OPS,
  8,
);
dumpToFile("i16x4", "replace-lane");

bench(
  "i16x4.add",
  () => {
    blackbox(i16x4.add(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "add");

bench(
  "i16x4.sub",
  () => {
    blackbox(i16x4.sub(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "sub");

bench(
  "i16x4.mul",
  () => {
    blackbox(i16x4.mul(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "mul");

bench(
  "i16x4.min_s",
  () => {
    blackbox(i16x4.min_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "min-s");

bench(
  "i16x4.min_u",
  () => {
    blackbox(i16x4.min_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "min-u");

bench(
  "i16x4.max_s",
  () => {
    blackbox(i16x4.max_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "max-s");

bench(
  "i16x4.max_u",
  () => {
    blackbox(i16x4.max_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "max-u");

bench(
  "i16x4.avgr_u",
  () => {
    blackbox(i16x4.avgr_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "avgr-u");

bench(
  "i16x4.abs",
  () => {
    blackbox(i16x4.abs(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "abs");

bench(
  "i16x4.neg",
  () => {
    blackbox(i16x4.neg(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "neg");

bench(
  "i16x4.add_sat_s",
  () => {
    blackbox(i16x4.add_sat_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "add-sat-s");

bench(
  "i16x4.add_sat_u",
  () => {
    blackbox(i16x4.add_sat_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "add-sat-u");

bench(
  "i16x4.sub_sat_s",
  () => {
    blackbox(i16x4.sub_sat_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "sub-sat-s");

bench(
  "i16x4.sub_sat_u",
  () => {
    blackbox(i16x4.sub_sat_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "sub-sat-u");

bench(
  "i16x4.shl",
  () => {
    blackbox(i16x4.shl(blackbox(BENCH_A), blackbox(BENCH_SHIFT)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "shl");

bench(
  "i16x4.shr_s",
  () => {
    blackbox(i16x4.shr_s(blackbox(BENCH_A), blackbox(BENCH_SHIFT)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "shr-s");

bench(
  "i16x4.shr_u",
  () => {
    blackbox(i16x4.shr_u(blackbox(BENCH_A), blackbox(BENCH_SHIFT)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "shr-u");

bench(
  "i16x4.all_true",
  () => {
    blackbox(i16x4.all_true(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "all-true");

bench(
  "i16x4.any_true",
  () => {
    blackbox(i16x4.any_true(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "any-true");

bench(
  "i16x4.bitmask",
  () => {
    blackbox(i16x4.bitmask(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "bitmask");

bench(
  "i16x4.bitmask_lane",
  () => {
    blackbox(i16x4.bitmask_lane(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "bitmask-lane");

bench(
  "i16x4.popcnt",
  () => {
    blackbox(i16x4.popcnt(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "popcnt");

bench(
  "i16x4.eq",
  () => {
    blackbox(i16x4.eq(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "eq");

bench(
  "i16x4.ne",
  () => {
    blackbox(i16x4.ne(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "ne");

bench(
  "i16x4.lt_s",
  () => {
    blackbox(i16x4.lt_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "lt-s");

bench(
  "i16x4.lt_u",
  () => {
    blackbox(i16x4.lt_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "lt-u");

bench(
  "i16x4.le_s",
  () => {
    blackbox(i16x4.le_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "le-s");

bench(
  "i16x4.le_u",
  () => {
    blackbox(i16x4.le_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "le-u");

bench(
  "i16x4.gt_s",
  () => {
    blackbox(i16x4.gt_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "gt-s");

bench(
  "i16x4.gt_u",
  () => {
    blackbox(i16x4.gt_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "gt-u");

bench(
  "i16x4.ge_s",
  () => {
    blackbox(i16x4.ge_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "ge-s");

bench(
  "i16x4.ge_u",
  () => {
    blackbox(i16x4.ge_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "ge-u");

bench(
  "i16x4.narrow_i32x2_s",
  () => {
    blackbox(i16x4.narrow_i32x2_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "narrow-i32x2-s");

bench(
  "i16x4.narrow_i32x2_u",
  () => {
    blackbox(i16x4.narrow_i32x2_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "narrow-i32x2-u");

bench(
  "i16x4.extend_low_i8x8_s",
  () => {
    blackbox(i16x4.extend_low_i8x8_s(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extend-low-i8x8-s");

bench(
  "i16x4.extend_low_i8x8_u",
  () => {
    blackbox(i16x4.extend_low_i8x8_u(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extend-low-i8x8-u");

bench(
  "i16x4.extend_high_i8x8_s",
  () => {
    blackbox(i16x4.extend_high_i8x8_s(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extend-high-i8x8-s");

bench(
  "i16x4.extend_high_i8x8_u",
  () => {
    blackbox(i16x4.extend_high_i8x8_u(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extend-high-i8x8-u");

bench(
  "i16x4.extadd_pairwise_i8x8_s",
  () => {
    blackbox(i16x4.extadd_pairwise_i8x8_s(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extadd-pairwise-i8x8-s");

bench(
  "i16x4.extadd_pairwise_i8x8_u",
  () => {
    blackbox(i16x4.extadd_pairwise_i8x8_u(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extadd-pairwise-i8x8-u");

bench(
  "i16x4.q15mulr_sat_s",
  () => {
    blackbox(i16x4.q15mulr_sat_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "q15mulr-sat-s");

bench(
  "i16x4.extmul_low_i8x8_s",
  () => {
    blackbox(i16x4.extmul_low_i8x8_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extmul-low-i8x8-s");

bench(
  "i16x4.extmul_low_i8x8_u",
  () => {
    blackbox(i16x4.extmul_low_i8x8_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extmul-low-i8x8-u");

bench(
  "i16x4.extmul_high_i8x8_s",
  () => {
    blackbox(i16x4.extmul_high_i8x8_s(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extmul-high-i8x8-s");

bench(
  "i16x4.extmul_high_i8x8_u",
  () => {
    blackbox(i16x4.extmul_high_i8x8_u(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("i16x4", "extmul-high-i8x8-u");

bench(
  "i16x4.shuffle",
  () => {
    blackbox(
      i16x4.shuffle(
        blackbox(BENCH_A),
        blackbox(BENCH_B),
        blackbox(BENCH_LANE8),
        blackbox(BENCH_LANE8),
        blackbox(BENCH_LANE8),
        blackbox(BENCH_LANE8),
      ),
    );
  },
  OPS,
  8,
);
dumpToFile("i16x4", "shuffle");

if (ASC_FEATURE_RELAXED_SIMD) {
  bench(
    "i16x4.relaxed_laneselect",
    () => {
      blackbox(
        i16x4.relaxed_laneselect(
          blackbox(BENCH_A),
          blackbox(BENCH_B),
          blackbox(BENCH_M),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("i16x4", "relaxed-laneselect");

  bench(
    "i16x4.relaxed_q15mulr_s",
    () => {
      blackbox(i16x4.relaxed_q15mulr_s(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("i16x4", "relaxed-q15mulr-s");

  bench(
    "i16x4.relaxed_dot_i8x8_i7x8_s",
    () => {
      blackbox(
        i16x4.relaxed_dot_i8x8_i7x8_s(blackbox(BENCH_A), blackbox(BENCH_B)),
      );
    },
    OPS,
    8,
  );
  dumpToFile("i16x4", "relaxed-dot-i8x8-i7x8-s");
} else {
  bench(
    "i16x4.relaxed_laneselect",
    () => {
      blackbox(
        i16x4.relaxed_laneselect(
          blackbox(BENCH_A),
          blackbox(BENCH_B),
          blackbox(BENCH_M),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("i16x4", "relaxed-laneselect");

  bench(
    "i16x4.relaxed_q15mulr_s",
    () => {
      blackbox(i16x4.q15mulr_sat_s(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("i16x4", "relaxed-q15mulr-s");

  bench(
    "i16x4.relaxed_dot_i8x8_i7x8_s",
    () => {
      blackbox(
        i16x4.relaxed_dot_i8x8_i7x8_s(blackbox(BENCH_A), blackbox(BENCH_B)),
      );
    },
    OPS,
    8,
  );
  dumpToFile("i16x4", "relaxed-dot-i8x8-i7x8-s");
}

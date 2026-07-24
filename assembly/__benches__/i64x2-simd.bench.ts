// Native-SIMD half of the physically split i64x2 benchmark suite.
import { i64x2_swar } from "../index";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);
const BENCH_A: u64 = 0xfedcba9876543210;
const BENCH_B: u64 = 0x7766554433221100;
const BENCH_M: u64 = 0x80ff00ff80ff00ff;
const BENCH_I64: i64 = -81985529216486896;
const BENCH_SHIFT: i32 = 17;
const BENCH_LANE2: u8 = 1;
const BENCH_LANE4: u8 = 3;
const BENCH_LANE8: u8 = 5;
const BENCH_LEN: i32 = 1;
const BENCH_PTR: usize = IO_PTR + 0x20;
const BENCH_128_LO: u64 = 0xfedcba9876543210;
const BENCH_128_HI: u64 = 0x0123456789abcdef;

bench(
  "i64x2.ctor",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef));
    else {
      blackbox(i64x2_swar(blackbox(BENCH_I64), blackbox(BENCH_I64)));
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "ctor");
bench(
  "i64x2.splat",
  () => {
    if (ASC_FEATURE_SIMD) blackbox(i64x2.splat(blackbox(BENCH_I64)));
    else {
      blackbox(i64x2_swar.splat(blackbox(BENCH_I64)));
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "splat");
bench(
  "i64x2.extract_lane",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.extract_lane(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          0,
        ),
      );
    else
      blackbox(
        i64x2_swar.extract_lane(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_LANE2),
        ),
      );
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extract-lane");
bench(
  "i64x2.replace_lane",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.replace_lane(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          0,
          blackbox(BENCH_I64),
        ),
      );
    else {
      blackbox(
        i64x2_swar.replace_lane(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_LANE2),
          blackbox(BENCH_I64),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "replace-lane");
bench(
  "i64x2.add",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.add(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.add(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "add");
bench(
  "i64x2.sub",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.sub(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.sub(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "sub");
bench(
  "i64x2.mul",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.mul(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.mul(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "mul");
bench(
  "i64x2.abs",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.abs(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef))),
      );
    else {
      blackbox(i64x2_swar.abs(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI)));
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "abs");
bench(
  "i64x2.neg",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.neg(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef))),
      );
    else {
      blackbox(i64x2_swar.neg(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI)));
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "neg");
bench(
  "i64x2.shl",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.shl(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(BENCH_SHIFT),
        ),
      );
    else {
      blackbox(
        i64x2_swar.shl(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_SHIFT),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "shl");
bench(
  "i64x2.shr_s",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.shr_s(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(BENCH_SHIFT),
        ),
      );
    else {
      blackbox(
        i64x2_swar.shr_s(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_SHIFT),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "shr-s");
bench(
  "i64x2.shr_u",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.shr_u(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(BENCH_SHIFT),
        ),
      );
    else {
      blackbox(
        i64x2_swar.shr_u(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_SHIFT),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "shr-u");
bench(
  "i64x2.all_true",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.all_true(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef))),
      );
    else
      blackbox(
        i64x2_swar.all_true(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI)),
      );
  },
  OPS,
  8,
);
dumpToFile("i64x2", "all-true");
bench(
  "i64x2.bitmask",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.bitmask(blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef))),
      );
    else
      blackbox(
        i64x2_swar.bitmask(blackbox(BENCH_128_LO), blackbox(BENCH_128_HI)),
      );
  },
  OPS,
  8,
);
dumpToFile("i64x2", "bitmask");
bench(
  "i64x2.eq",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.eq(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.eq(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "eq");
bench(
  "i64x2.ne",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.ne(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.ne(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "ne");
bench(
  "i64x2.lt_s",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.lt_s(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.lt_s(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "lt-s");
bench(
  "i64x2.le_s",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.le_s(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.le_s(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "le-s");
bench(
  "i64x2.gt_s",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.gt_s(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.gt_s(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "gt-s");
bench(
  "i64x2.ge_s",
  () => {
    if (ASC_FEATURE_SIMD)
      blackbox(
        i64x2.ge_s(
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
          blackbox(i64x2(0xfedcba9876543210, 0x0123456789abcdef)),
        ),
      );
    else {
      blackbox(
        i64x2_swar.ge_s(
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
          blackbox(BENCH_128_LO),
          blackbox(BENCH_128_HI),
        ),
      );
      blackbox(i64x2_swar.take_hi());
    }
  },
  OPS,
  8,
);
dumpToFile("i64x2", "ge-s");
bench(
  "i64x2.extend_low_i32x4_s",
  () => {
    blackbox(
      i64x2_swar.extend_low_i32x4_s(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extend-low-i32x4-s");
bench(
  "i64x2.extend_low_i32x4_u",
  () => {
    blackbox(
      i64x2_swar.extend_low_i32x4_u(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extend-low-i32x4-u");
bench(
  "i64x2.extend_high_i32x4_s",
  () => {
    blackbox(
      i64x2_swar.extend_high_i32x4_s(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extend-high-i32x4-s");
bench(
  "i64x2.extend_high_i32x4_u",
  () => {
    blackbox(
      i64x2_swar.extend_high_i32x4_u(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extend-high-i32x4-u");
bench(
  "i64x2.extmul_low_i32x4_s",
  () => {
    blackbox(
      i64x2_swar.extmul_low_i32x4_s(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extmul-low-i32x4-s");
bench(
  "i64x2.extmul_low_i32x4_u",
  () => {
    blackbox(
      i64x2_swar.extmul_low_i32x4_u(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extmul-low-i32x4-u");
bench(
  "i64x2.extmul_high_i32x4_s",
  () => {
    blackbox(
      i64x2_swar.extmul_high_i32x4_s(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extmul-high-i32x4-s");
bench(
  "i64x2.extmul_high_i32x4_u",
  () => {
    blackbox(
      i64x2_swar.extmul_high_i32x4_u(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "extmul-high-i32x4-u");
bench(
  "i64x2.shuffle",
  () => {
    blackbox(
      i64x2_swar.shuffle(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
        1,
        0,
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  8,
);
dumpToFile("i64x2", "shuffle");
bench(
  "i64x2.relaxed_laneselect",
  () => {
    blackbox(
      i64x2_swar.relaxed_laneselect(
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
        blackbox(BENCH_128_LO),
        blackbox(BENCH_128_HI),
        blackbox(BENCH_M),
        blackbox(BENCH_B),
      ),
    );
    blackbox(i64x2_swar.take_hi());
  },
  OPS,
  24,
);
dumpToFile("i64x2", "relaxed-laneselect");

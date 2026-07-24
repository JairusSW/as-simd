import { v64 } from "../v64/value";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const IO_PTR: usize = memory.data(256);

const LANES_I8 = StaticArray.fromArray<u8>([7, 6, 5, 4, 3, 2, 1, 0]);
const LANES_I16 = StaticArray.fromArray<u8>([3, 2, 1, 0]);
const LANES_I32 = StaticArray.fromArray<u8>([1, 0]);
const LANES_I64 = StaticArray.fromArray<u8>([0]);
const BENCH_A: u64 = 0xfedcba9876543210;
const BENCH_B: u64 = 0x7766554433221100;
const BENCH_M: u64 = 0x80ff00ff80ff00ff;
const BENCH_I8: i8 = -37;
const BENCH_U8: u8 = 219;
const BENCH_I16: i16 = -12345;
const BENCH_U16: u16 = 53191;
const BENCH_I32: i32 = -123456789;
const BENCH_U32: u32 = 4171510507;
const BENCH_I64: i64 = -81985529216486896;
const BENCH_F32: f32 = 1.25;
const BENCH_F64: f64 = 1.25;
const BENCH_F32_VEC: u64 = 0x3fa000003fa00000;
const BENCH_F64_VEC: u64 = 0x3ff4000000000000;
const BENCH_SHIFT: i32 = 3;
const BENCH_LANE8: u8 = 5;
const BENCH_LANE4: u8 = 3;
const BENCH_LANE2: u8 = 1;
const BENCH_PTR: usize = IO_PTR + 0x20;
const BENCH_128_LO: u64 = 0xfedcba9876543210;
const BENCH_128_HI: u64 = 0x0123456789abcdef;

bench(
  "v64.ctor",
  () => {
    blackbox(
      v64(
        blackbox(BENCH_I8),
        blackbox(BENCH_I8),
        blackbox(BENCH_I8),
        blackbox(BENCH_I8),
        blackbox(BENCH_I8),
        blackbox(BENCH_I8),
        blackbox(BENCH_I8),
        blackbox(BENCH_I8),
      ),
    );
  },
  OPS,
  8,
);
dumpToFile("v64", "ctor");

bench(
  "v64.splat",
  () => {
    blackbox(v64.splat<i8>(blackbox(BENCH_I8)));
  },
  OPS,
  8,
);
dumpToFile("v64", "splat");
bench(
  "v64.extract-lane",
  () => {
    blackbox(v64.extract_lane<i8>(blackbox(BENCH_A), blackbox(BENCH_LANE8)));
  },
  OPS,
  8,
);
dumpToFile("v64", "extract-lane");
bench(
  "v64.replace-lane",
  () => {
    blackbox(
      v64.replace_lane<i8>(
        blackbox(BENCH_A),
        blackbox(BENCH_LANE8),
        blackbox(BENCH_I8),
      ),
    );
  },
  OPS,
  8,
);
dumpToFile("v64", "replace-lane");
bench(
  "v64.shuffle-i8",
  () => {
    blackbox(v64.shuffle<i8>(blackbox(BENCH_A), blackbox(BENCH_B), LANES_I8));
  },
  OPS,
  16,
);
dumpToFile("v64", "shuffle-i8");
bench(
  "v64.shuffle-i16",
  () => {
    blackbox(v64.shuffle<i16>(blackbox(BENCH_A), blackbox(BENCH_B), LANES_I16));
  },
  OPS,
  16,
);
dumpToFile("v64", "shuffle-i16");
bench(
  "v64.shuffle-i32",
  () => {
    blackbox(v64.shuffle<i32>(blackbox(BENCH_A), blackbox(BENCH_B), LANES_I32));
  },
  OPS,
  16,
);
dumpToFile("v64", "shuffle-i32");
bench(
  "v64.shuffle-i64",
  () => {
    blackbox(v64.shuffle<i64>(blackbox(BENCH_A), blackbox(BENCH_B), LANES_I64));
  },
  OPS,
  16,
);
dumpToFile("v64", "shuffle-i64");
bench(
  "v64.swizzle",
  () => {
    blackbox(v64.swizzle(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "swizzle");

bench(
  "v64.load",
  () => {
    blackbox(v64.load(blackbox(BENCH_PTR)));
  },
  OPS,
  8,
);
dumpToFile("v64", "load");
bench(
  "v64.load-ext",
  () => {
    blackbox(v64.load_ext<i8>(blackbox(BENCH_PTR)));
  },
  OPS,
  8,
);
dumpToFile("v64", "load-ext");
bench(
  "v64.load-zero",
  () => {
    blackbox(v64.load_zero<i16>(blackbox(BENCH_PTR)));
  },
  OPS,
  8,
);
dumpToFile("v64", "load-zero");
bench(
  "v64.load-lane",
  () => {
    blackbox(
      v64.load_lane<i8>(
        blackbox(BENCH_PTR),
        blackbox(BENCH_A),
        blackbox(BENCH_LANE8),
      ),
    );
  },
  OPS,
  8,
);
dumpToFile("v64", "load-lane");
bench(
  "v64.store-lane",
  () => {
    v64.store_lane<i8>(
      blackbox(BENCH_PTR),
      blackbox(BENCH_A),
      blackbox(BENCH_LANE8),
    );
    blackbox(v64.load(IO_PTR));
  },
  OPS,
  8,
);
dumpToFile("v64", "store-lane");
bench(
  "v64.load8x4-s",
  () => {
    blackbox(v64.load8x4_s(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load8x4-s");
bench(
  "v64.load8x4-u",
  () => {
    blackbox(v64.load8x4_u(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load8x4-u");
bench(
  "v64.load16x2-s",
  () => {
    blackbox(v64.load16x2_s(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load16x2-s");
bench(
  "v64.load16x2-u",
  () => {
    blackbox(v64.load16x2_u(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load16x2-u");
bench(
  "v64.load32x1-s",
  () => {
    blackbox(v64.load32x1_s(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load32x1-s");
bench(
  "v64.load32x1-u",
  () => {
    blackbox(v64.load32x1_u(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load32x1-u");
bench(
  "v64.load8x8-s",
  () => {
    blackbox(v64.load8x8_s(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load8x8-s");
bench(
  "v64.load8x8-u",
  () => {
    blackbox(v64.load8x8_u(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load8x8-u");
bench(
  "v64.load16x4-s",
  () => {
    blackbox(v64.load16x4_s(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load16x4-s");
bench(
  "v64.load16x4-u",
  () => {
    blackbox(v64.load16x4_u(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load16x4-u");
bench(
  "v64.load32x2-s",
  () => {
    blackbox(v64.load32x2_s(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load32x2-s");
bench(
  "v64.load32x2-u",
  () => {
    blackbox(v64.load32x2_u(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load32x2-u");
bench(
  "v64.load-splat",
  () => {
    blackbox(v64.load_splat<i8>(blackbox(BENCH_PTR)));
  },
  OPS,
  1,
);
dumpToFile("v64", "load-splat");
bench(
  "v64.load8-splat",
  () => {
    blackbox(v64.load8_splat(blackbox(BENCH_PTR)));
  },
  OPS,
  1,
);
dumpToFile("v64", "load8-splat");
bench(
  "v64.load16-splat",
  () => {
    blackbox(v64.load16_splat(blackbox(BENCH_PTR)));
  },
  OPS,
  2,
);
dumpToFile("v64", "load16-splat");
bench(
  "v64.load32-splat",
  () => {
    blackbox(v64.load32_splat(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load32-splat");
bench(
  "v64.load64-splat",
  () => {
    blackbox(v64.load64_splat(blackbox(BENCH_PTR)));
  },
  OPS,
  8,
);
dumpToFile("v64", "load64-splat");
bench(
  "v64.load32-zero",
  () => {
    blackbox(v64.load32_zero(blackbox(BENCH_PTR)));
  },
  OPS,
  4,
);
dumpToFile("v64", "load32-zero");
bench(
  "v64.load64-zero",
  () => {
    blackbox(v64.load64_zero(blackbox(BENCH_PTR)));
  },
  OPS,
  8,
);
dumpToFile("v64", "load64-zero");
bench(
  "v64.load8-lane",
  () => {
    blackbox(
      v64.load8_lane(
        blackbox(BENCH_PTR),
        blackbox(BENCH_A),
        blackbox(BENCH_LANE8),
      ),
    );
  },
  OPS,
  1,
);
dumpToFile("v64", "load8-lane");
bench(
  "v64.load16-lane",
  () => {
    blackbox(
      v64.load16_lane(
        blackbox(BENCH_PTR),
        blackbox(BENCH_A),
        blackbox(BENCH_LANE4),
      ),
    );
  },
  OPS,
  2,
);
dumpToFile("v64", "load16-lane");
bench(
  "v64.load32-lane",
  () => {
    blackbox(
      v64.load32_lane(
        blackbox(BENCH_PTR),
        blackbox(BENCH_A),
        blackbox(BENCH_LANE2),
      ),
    );
  },
  OPS,
  4,
);
dumpToFile("v64", "load32-lane");
bench(
  "v64.load64-lane",
  () => {
    blackbox(v64.load64_lane(blackbox(BENCH_PTR), blackbox(BENCH_A), 0));
  },
  OPS,
  8,
);
dumpToFile("v64", "load64-lane");
bench(
  "v64.store8-lane",
  () => {
    v64.store8_lane(
      blackbox(BENCH_PTR),
      blackbox(BENCH_A),
      blackbox(BENCH_LANE8),
    );
    blackbox(v64.load(IO_PTR));
  },
  OPS,
  1,
);
dumpToFile("v64", "store8-lane");
bench(
  "v64.store16-lane",
  () => {
    v64.store16_lane(
      blackbox(BENCH_PTR),
      blackbox(BENCH_A),
      blackbox(BENCH_LANE4),
    );
    blackbox(v64.load(IO_PTR));
  },
  OPS,
  2,
);
dumpToFile("v64", "store16-lane");
bench(
  "v64.store32-lane",
  () => {
    v64.store32_lane(
      blackbox(BENCH_PTR),
      blackbox(BENCH_A),
      blackbox(BENCH_LANE2),
    );
    blackbox(v64.load(IO_PTR));
  },
  OPS,
  4,
);
dumpToFile("v64", "store32-lane");
bench(
  "v64.store64-lane",
  () => {
    v64.store64_lane(blackbox(BENCH_PTR), blackbox(BENCH_A), 0);
    blackbox(v64.load(IO_PTR));
  },
  OPS,
  8,
);
dumpToFile("v64", "store64-lane");
bench(
  "v64.store",
  () => {
    v64.store(blackbox(BENCH_PTR), blackbox(BENCH_A));
    blackbox(v64.load(IO_PTR));
  },
  OPS,
  8,
);
dumpToFile("v64", "store");

bench(
  "v64.add-i8",
  () => {
    blackbox(v64.add<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "add-i8");
bench(
  "v64.sub-i8",
  () => {
    blackbox(v64.sub<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "sub-i8");
bench(
  "v64.mul-i8",
  () => {
    blackbox(v64.mul<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "mul-i8");
bench(
  "v64.div-f32",
  () => {
    blackbox(v64.div<f32>(blackbox(BENCH_F32_VEC), blackbox(BENCH_F32_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "div-f32");
bench(
  "v64.neg-i8",
  () => {
    blackbox(v64.neg<i8>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "neg-i8");
bench(
  "v64.add-sat-i8",
  () => {
    blackbox(v64.add_sat<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "add-sat-i8");
bench(
  "v64.sub-sat-u8",
  () => {
    blackbox(v64.sub_sat<u8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "sub-sat-u8");
bench(
  "v64.shl-i8",
  () => {
    blackbox(v64.shl<i8>(blackbox(BENCH_A), blackbox(BENCH_SHIFT)));
  },
  OPS,
  8,
);
dumpToFile("v64", "shl-i8");
bench(
  "v64.shr-i8",
  () => {
    blackbox(v64.shr<i8>(blackbox(BENCH_A), blackbox(BENCH_SHIFT)));
  },
  OPS,
  8,
);
dumpToFile("v64", "shr-i8");
bench(
  "v64.and",
  () => {
    blackbox(v64.and(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "and");
bench(
  "v64.or",
  () => {
    blackbox(v64.or(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "or");
bench(
  "v64.xor",
  () => {
    blackbox(v64.xor(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "xor");
bench(
  "v64.andnot",
  () => {
    blackbox(v64.andnot(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "andnot");
bench(
  "v64.not",
  () => {
    blackbox(v64.not(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "not");
bench(
  "v64.bitselect",
  () => {
    blackbox(
      v64.bitselect(blackbox(BENCH_A), blackbox(BENCH_B), blackbox(BENCH_A)),
    );
  },
  OPS,
  24,
);
dumpToFile("v64", "bitselect");
bench(
  "v64.any-true",
  () => {
    blackbox(v64.any_true(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "any-true");
bench(
  "v64.all-true-i8",
  () => {
    blackbox(v64.all_true<i8>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "all-true-i8");
bench(
  "v64.bitmask-i8",
  () => {
    blackbox(v64.bitmask<i8>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "bitmask-i8");
bench(
  "v64.popcnt-i8",
  () => {
    blackbox(v64.popcnt<i8>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "popcnt-i8");
bench(
  "v64.min-i16",
  () => {
    blackbox(v64.min<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "min-i16");
bench(
  "v64.max-i16",
  () => {
    blackbox(v64.max<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "max-i16");
bench(
  "v64.pmin-i16",
  () => {
    blackbox(v64.pmin<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "pmin-i16");
bench(
  "v64.pmax-i16",
  () => {
    blackbox(v64.pmax<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "pmax-i16");
bench(
  "v64.dot-i16",
  () => {
    blackbox(v64.dot<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "dot-i16");
bench(
  "v64.avgr-u8",
  () => {
    blackbox(v64.avgr<u8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "avgr-u8");
bench(
  "v64.abs-i8",
  () => {
    blackbox(v64.abs<i8>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "abs-i8");
bench(
  "v64.sqrt-f32",
  () => {
    blackbox(v64.sqrt<f32>(blackbox(BENCH_F32_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "sqrt-f32");
bench(
  "v64.ceil-f32",
  () => {
    blackbox(v64.ceil<f32>(blackbox(BENCH_F32_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "ceil-f32");
bench(
  "v64.floor-f32",
  () => {
    blackbox(v64.floor<f32>(blackbox(BENCH_F32_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "floor-f32");
bench(
  "v64.trunc-f32",
  () => {
    blackbox(v64.trunc<f32>(blackbox(BENCH_F32_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "trunc-f32");
bench(
  "v64.nearest-f32",
  () => {
    blackbox(v64.nearest<f32>(blackbox(BENCH_F32_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "nearest-f32");
bench(
  "v64.eq-i8",
  () => {
    blackbox(v64.eq<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "eq-i8");
bench(
  "v64.ne-i8",
  () => {
    blackbox(v64.ne<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "ne-i8");
bench(
  "v64.lt-i8",
  () => {
    blackbox(v64.lt<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "lt-i8");
bench(
  "v64.le-i8",
  () => {
    blackbox(v64.le<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "le-i8");
bench(
  "v64.gt-i8",
  () => {
    blackbox(v64.gt<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "gt-i8");
bench(
  "v64.ge-i8",
  () => {
    blackbox(v64.ge<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "ge-i8");
bench(
  "v64.convert-i32",
  () => {
    blackbox(v64.convert<i32>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "convert-i32");
bench(
  "v64.convert-low-i32",
  () => {
    blackbox(v64.convert_low<i32>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "convert-low-i32");
bench(
  "v64.trunc-sat-i32",
  () => {
    blackbox(v64.trunc_sat<i32>(blackbox(BENCH_F32_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "trunc-sat-i32");
bench(
  "v64.trunc-sat-zero-i32",
  () => {
    blackbox(v64.trunc_sat_zero<i32>(blackbox(BENCH_F64_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "trunc-sat-zero-i32");
bench(
  "v64.narrow-i16",
  () => {
    blackbox(v64.narrow<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  16,
);
dumpToFile("v64", "narrow-i16");
bench(
  "v64.extend-low-i8",
  () => {
    blackbox(v64.extend_low<i8>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "extend-low-i8");
bench(
  "v64.extend-high-i8",
  () => {
    blackbox(v64.extend_high<i8>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "extend-high-i8");
bench(
  "v64.extadd-pairwise-i8",
  () => {
    blackbox(v64.extadd_pairwise<i8>(blackbox(BENCH_A)));
  },
  OPS,
  8,
);
dumpToFile("v64", "extadd-pairwise-i8");
bench(
  "v64.demote-zero",
  () => {
    blackbox(v64.demote_zero<f64>(blackbox(BENCH_F64_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "demote-zero");
bench(
  "v64.promote-low",
  () => {
    blackbox(v64.promote_low<f32>(blackbox(BENCH_F32_VEC)));
  },
  OPS,
  8,
);
dumpToFile("v64", "promote-low");
bench(
  "v64.q15mulr-sat",
  () => {
    blackbox(v64.q15mulr_sat<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "q15mulr-sat");
bench(
  "v64.extmul-low-i8",
  () => {
    blackbox(v64.extmul_low<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "extmul-low-i8");
bench(
  "v64.extmul-high-i8",
  () => {
    blackbox(v64.extmul_high<i8>(blackbox(BENCH_A), blackbox(BENCH_B)));
  },
  OPS,
  8,
);
dumpToFile("v64", "extmul-high-i8");
if (ASC_FEATURE_RELAXED_SIMD) {
  bench(
    "v64.relaxed-swizzle",
    () => {
      blackbox(v64.relaxed_swizzle(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-swizzle");
  bench(
    "v64.relaxed-trunc",
    () => {
      blackbox(v64.relaxed_trunc<i32>(blackbox(BENCH_F32_VEC)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-trunc");
  bench(
    "v64.relaxed-trunc-zero",
    () => {
      blackbox(v64.relaxed_trunc_zero<i32>(blackbox(BENCH_F64_VEC)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-trunc-zero");
  bench(
    "v64.relaxed-madd",
    () => {
      blackbox(
        v64.relaxed_madd<i8>(
          blackbox(BENCH_A),
          blackbox(BENCH_B),
          blackbox(BENCH_A),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("v64", "relaxed-madd");
  bench(
    "v64.relaxed-nmadd",
    () => {
      blackbox(
        v64.relaxed_nmadd<i8>(
          blackbox(BENCH_A),
          blackbox(BENCH_B),
          blackbox(BENCH_A),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("v64", "relaxed-nmadd");
  bench(
    "v64.relaxed-laneselect",
    () => {
      blackbox(
        v64.relaxed_laneselect<i8>(
          blackbox(BENCH_A),
          blackbox(BENCH_B),
          blackbox(BENCH_A),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("v64", "relaxed-laneselect");
  bench(
    "v64.relaxed-min",
    () => {
      blackbox(v64.relaxed_min<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-min");
  bench(
    "v64.relaxed-max",
    () => {
      blackbox(v64.relaxed_max<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-max");
  bench(
    "v64.relaxed-q15mulr",
    () => {
      blackbox(v64.relaxed_q15mulr<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-q15mulr");
  bench(
    "v64.relaxed-dot",
    () => {
      blackbox(v64.relaxed_dot<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-dot");
  bench(
    "v64.relaxed-dot-add",
    () => {
      blackbox(
        v64.relaxed_dot_add<i16>(
          blackbox(BENCH_A),
          blackbox(BENCH_B),
          blackbox(BENCH_A),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("v64", "relaxed-dot-add");
} else {
  bench(
    "v64.relaxed-swizzle",
    () => {
      blackbox(v64.swizzle(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-swizzle");
  bench(
    "v64.relaxed-trunc",
    () => {
      blackbox(v64.trunc_sat<i32>(blackbox(BENCH_F32_VEC)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-trunc");
  bench(
    "v64.relaxed-trunc-zero",
    () => {
      blackbox(v64.trunc_sat_zero<i32>(blackbox(BENCH_F64_VEC)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-trunc-zero");
  bench(
    "v64.relaxed-madd",
    () => {
      blackbox(
        v64.add<i8>(
          v64.mul<i8>(blackbox(BENCH_A), blackbox(BENCH_B)),
          blackbox(BENCH_A),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("v64", "relaxed-madd");
  bench(
    "v64.relaxed-nmadd",
    () => {
      blackbox(
        v64.add<i8>(
          v64.neg<i8>(v64.mul<i8>(blackbox(BENCH_A), blackbox(BENCH_B))),
          blackbox(BENCH_A),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("v64", "relaxed-nmadd");
  bench(
    "v64.relaxed-laneselect",
    () => {
      blackbox(
        v64.bitselect(blackbox(BENCH_A), blackbox(BENCH_B), blackbox(BENCH_A)),
      );
    },
    OPS,
    24,
  );
  dumpToFile("v64", "relaxed-laneselect");
  bench(
    "v64.relaxed-min",
    () => {
      blackbox(v64.min<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-min");
  bench(
    "v64.relaxed-max",
    () => {
      blackbox(v64.max<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-max");
  bench(
    "v64.relaxed-q15mulr",
    () => {
      blackbox(v64.q15mulr_sat<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-q15mulr");
  bench(
    "v64.relaxed-dot",
    () => {
      blackbox(v64.dot<i16>(blackbox(BENCH_A), blackbox(BENCH_B)));
    },
    OPS,
    8,
  );
  dumpToFile("v64", "relaxed-dot");
  bench(
    "v64.relaxed-dot-add",
    () => {
      blackbox(
        v64.add<i32>(
          v64.dot<i16>(blackbox(BENCH_A), blackbox(BENCH_B)),
          blackbox(BENCH_A),
        ),
      );
    },
    OPS,
    24,
  );
  dumpToFile("v64", "relaxed-dot-add");
}

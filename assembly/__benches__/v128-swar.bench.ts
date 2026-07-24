import { v128_swar } from "../v128/value";
import { bench_common } from "./common";
import { bench, blackbox, dumpToFile } from "./lib/bench";

const OPS: u64 = bench_common.DEFAULT_OPS;
const A_LO: u64 = 0xfedcba9876543210,
  A_HI: u64 = 0x0123456789abcdef;
const B_LO: u64 = 0x7766554433221100,
  B_HI: u64 = 0x13579bdf2468ace0;
const M_LO: u64 = 0x80ff00ff80ff00ff,
  M_HI: u64 = 0x00ff80ff00ff80ff;
const X8: i8 = -37,
  SHIFT: i32 = 3;
const LANES_I8 = StaticArray.fromArray<u8>([
  15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
]);
const LANES_I16 = StaticArray.fromArray<u8>([7, 6, 5, 4, 3, 2, 1, 0]);
const LANES_I32 = StaticArray.fromArray<u8>([3, 2, 1, 0]);
const LANES_I64 = StaticArray.fromArray<u8>([1, 0]);


@inline function sinkPair(lo: u64): void {
  blackbox(lo);
  blackbox(v128_swar.take_hi());
}

bench("v128.splat", () => sinkPair(v128_swar.splat<i8>(blackbox(X8))), OPS, 8);
dumpToFile("v128", "splat");
bench(
  "v128.extract-lane",
  () =>
    blackbox(v128_swar.extract_lane<i8>(blackbox(A_LO), blackbox(A_HI), 11)),
  OPS,
  8,
);
dumpToFile("v128", "extract-lane");
bench(
  "v128.replace-lane",
  () =>
    sinkPair(
      v128_swar.replace_lane<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        11,
        blackbox(X8),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "replace-lane");
bench(
  "v128.shuffle-i8",
  () =>
    sinkPair(
      v128_swar.shuffle<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
        LANES_I8,
      ),
    ),
  OPS,
  16,
);
dumpToFile("v128", "shuffle-i8");
bench(
  "v128.shuffle-i16",
  () =>
    sinkPair(
      v128_swar.shuffle<i16>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
        LANES_I16,
      ),
    ),
  OPS,
  16,
);
dumpToFile("v128", "shuffle-i16");
bench(
  "v128.shuffle-i32",
  () =>
    sinkPair(
      v128_swar.shuffle<i32>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
        LANES_I32,
      ),
    ),
  OPS,
  16,
);
dumpToFile("v128", "shuffle-i32");
bench(
  "v128.shuffle-i64",
  () =>
    sinkPair(
      v128_swar.shuffle<i64>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
        LANES_I64,
      ),
    ),
  OPS,
  16,
);
dumpToFile("v128", "shuffle-i64");
bench(
  "v128.swizzle",
  () =>
    sinkPair(
      v128_swar.swizzle(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "swizzle");
bench(
  "v128.add-i8",
  () =>
    sinkPair(
      v128_swar.add<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "add-i8");
bench(
  "v128.sub-i8",
  () =>
    sinkPair(
      v128_swar.sub<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "sub-i8");
bench(
  "v128.mul-i8",
  () =>
    sinkPair(
      v128_swar.mul<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "mul-i8");
bench(
  "v128.div-f32",
  () =>
    sinkPair(
      v128_swar.div<f32>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "div-f32");
bench(
  "v128.neg-i8",
  () => sinkPair(v128_swar.neg<i8>(blackbox(A_LO), blackbox(A_HI))),
  OPS,
  8,
);
dumpToFile("v128", "neg-i8");
bench(
  "v128.add-sat-i8",
  () =>
    sinkPair(
      v128_swar.add_sat<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "add-sat-i8");
bench(
  "v128.sub-sat-u8",
  () =>
    sinkPair(
      v128_swar.sub_sat<u8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "sub-sat-u8");
bench(
  "v128.shl-i8",
  () =>
    sinkPair(
      v128_swar.shl<i8>(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT)),
    ),
  OPS,
  8,
);
dumpToFile("v128", "shl-i8");
bench(
  "v128.shr-i8",
  () =>
    sinkPair(
      v128_swar.shr<i8>(blackbox(A_LO), blackbox(A_HI), blackbox(SHIFT)),
    ),
  OPS,
  8,
);
dumpToFile("v128", "shr-i8");
bench(
  "v128.and",
  () =>
    sinkPair(
      v128_swar.and(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "and");
bench(
  "v128.or",
  () =>
    sinkPair(
      v128_swar.or(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "or");
bench(
  "v128.xor",
  () =>
    sinkPair(
      v128_swar.xor(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "xor");
bench(
  "v128.andnot",
  () =>
    sinkPair(
      v128_swar.andnot(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "andnot");
bench(
  "v128.not",
  () => sinkPair(v128_swar.not(blackbox(A_LO), blackbox(A_HI))),
  OPS,
  8,
);
dumpToFile("v128", "not");
bench(
  "v128.bitselect",
  () =>
    sinkPair(
      v128_swar.bitselect(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
        blackbox(M_LO),
        blackbox(M_HI),
      ),
    ),
  OPS,
  24,
);
dumpToFile("v128", "bitselect");
bench(
  "v128.any-true",
  () => blackbox(v128_swar.any_true(blackbox(A_LO), blackbox(A_HI))),
  OPS,
  8,
);
dumpToFile("v128", "any-true");
bench(
  "v128.all-true-i8",
  () => blackbox(v128_swar.all_true<i8>(blackbox(A_LO), blackbox(A_HI))),
  OPS,
  8,
);
dumpToFile("v128", "all-true-i8");
bench(
  "v128.bitmask-i8",
  () => blackbox(v128_swar.bitmask<i8>(blackbox(A_LO), blackbox(A_HI))),
  OPS,
  8,
);
dumpToFile("v128", "bitmask-i8");
bench(
  "v128.popcnt-i8",
  () => sinkPair(v128_swar.popcnt<i8>(blackbox(A_LO), blackbox(A_HI))),
  OPS,
  8,
);
dumpToFile("v128", "popcnt-i8");
bench(
  "v128.min-i16",
  () =>
    sinkPair(
      v128_swar.min<i16>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "min-i16");
bench(
  "v128.max-i16",
  () =>
    sinkPair(
      v128_swar.max<i16>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "max-i16");
bench(
  "v128.dot-i16",
  () =>
    sinkPair(
      v128_swar.dot<i16>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "dot-i16");
bench(
  "v128.avgr-u8",
  () =>
    sinkPair(
      v128_swar.avgr<u8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "avgr-u8");
bench(
  "v128.abs-i8",
  () => sinkPair(v128_swar.abs<i8>(blackbox(A_LO), blackbox(A_HI))),
  OPS,
  8,
);
dumpToFile("v128", "abs-i8");
bench(
  "v128.eq-i8",
  () =>
    sinkPair(
      v128_swar.eq<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "eq-i8");
bench(
  "v128.ne-i8",
  () =>
    sinkPair(
      v128_swar.ne<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "ne-i8");
bench(
  "v128.lt-i8",
  () =>
    sinkPair(
      v128_swar.lt<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "lt-i8");
bench(
  "v128.le-i8",
  () =>
    sinkPair(
      v128_swar.le<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "le-i8");
bench(
  "v128.gt-i8",
  () =>
    sinkPair(
      v128_swar.gt<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "gt-i8");
bench(
  "v128.ge-i8",
  () =>
    sinkPair(
      v128_swar.ge<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "ge-i8");
bench(
  "v128.relaxed-swizzle",
  () =>
    sinkPair(
      v128_swar.relaxed_swizzle(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
      ),
    ),
  OPS,
  8,
);
dumpToFile("v128", "relaxed-swizzle");
bench(
  "v128.relaxed-laneselect",
  () =>
    sinkPair(
      v128_swar.relaxed_laneselect<i8>(
        blackbox(A_LO),
        blackbox(A_HI),
        blackbox(B_LO),
        blackbox(B_HI),
        blackbox(M_LO),
        blackbox(M_HI),
      ),
    ),
  OPS,
  24,
);
dumpToFile("v128", "relaxed-laneselect");

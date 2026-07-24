# API

## Width-generic APIs

`v32`, `v64`, `v128`, `v256`, and `v512` are value APIs. `v128`, `v256`, and
`v512` intentionally expose the same 95 public methods with matching argument
order and generic signatures. A method that returns `v128` at 128-bit width
returns `v256` or `v512` at the corresponding wider width. Every generic method
takes a lane type such as `i8`, `u16`, `i32`, or `f32` where supported.

`v256` and `v512` are immutable value types that store their complete width in
one managed object. Destination-register variants such as `v512r.add(dst, a,
b)` are internal benchmarking and implementation machinery and are not
exported from the package root.

The shared width API includes:

- lane splat/extract/replace and memory load/store
- add, subtract, multiply, minimum, maximum, absolute value, and negation
- saturating add/subtract and unsigned average
- lane shifts, comparisons, bitwise operations, and boolean reductions

`v128.bitmask<T>` returns `i32`, `v256.bitmask<T>` returns `u32`, and
`v512.bitmask<T>` returns `u64`, providing enough bits for every byte lane.

Every width directory uses the same module layout:

- `value.ts` defines the width-generic value interface.
- `lanes.ts` defines the lane-family interfaces.
- `kernels.ts` defines or names the hot kernel implementation.

The scalar-backed `v32` and `v64` widths execute their value namespaces
directly, so their `*_kernels` exports alias those implementations.

## Lane-specific APIs

The six native v128 lane families have width-scaled public counterparts:

| v128 | v256 | v512 |
|---|---|---|
| `i8x16` | `i8x32` | `i8x64` |
| `i16x8` | `i16x16` | `i16x32` |
| `i32x4` | `i32x8` | `i32x16` |
| `i64x2` | `i64x4` | `i64x8` |
| `f32x4` | `f32x8` | `f32x16` |
| `f64x2` | `f64x4` | `f64x8` |

Every wider namespace preserves the corresponding native method set and
argument order. Embedded source widths scale as well: for example,
`i64x4.extend_low_i32x8_s` and `i64x8.extend_low_i32x16_s` correspond to
`i64x2.extend_low_i32x4_s`. Shuffles accept one lane index per result lane.
Their `bitmask` results widen to `u32` for v256 and `u64` for v512.

```ts
import { v512 } from "as-simd";

const a = v512.splat<i8>(10);
const b = v512.splat<i8>(20);
const sum = v512.add<i8>(a, b);
const lane63 = v512.extract_lane<i8>(sum, 63); // 30
```

This file records the public `v64` namespace surface so the lane families stay aligned intentionally.

## Shared `v64` method surface

These methods exist on both [`i8x8`](./assembly/v64/lanes.ts) and [`i16x4`](./assembly/v64/lanes.ts):

- `splat`
- `extract_lane_s`
- `extract_lane_u`
- `replace_lane`
- `loadPartial`
- `storePartial`
- `add`
- `sub`
- `mul`
- `min_s`
- `min_u`
- `max_s`
- `max_u`
- `avgr_u`
- `abs`
- `neg`
- `add_sat_s`
- `add_sat_u`
- `sub_sat_s`
- `sub_sat_u`
- `shl`
- `shr_s`
- `shr_u`
- `all_true`
- `any_true`
- `bitmask`
- `bitmask_lane`
- `popcnt`
- `eq`
- `ne`
- `lt_s`
- `lt_u`
- `le_s`
- `le_u`
- `gt_s`
- `gt_u`
- `ge_s`
- `ge_u`
- `shuffle`
- `relaxed_laneselect`

## `i8x8`-specific methods

These are byte-lane specific and are not mirrored on `i16x4`:

- `narrow_i16x4_s`
- `narrow_i16x4_u`
- `swizzle`
- `relaxed_swizzle`

## `i16x4`-specific methods

These are 16-bit-lane specific and do not have a direct `i8x8` analogue:

- `narrow_i32x2_s`
- `narrow_i32x2_u`
- `extend_low_i8x8_s`
- `extend_low_i8x8_u`
- `extend_high_i8x8_s`
- `extend_high_i8x8_u`
- `extadd_pairwise_i8x8_s`
- `extadd_pairwise_i8x8_u`
- `q15mulr_sat_s`
- `extmul_low_i8x8_s`
- `extmul_low_i8x8_u`
- `extmul_high_i8x8_s`
- `extmul_high_i8x8_u`
- `relaxed_q15mulr_s`
- `relaxed_dot_i8x8_i7x8_s`

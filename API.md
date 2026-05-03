# API

This file records the public `v64` namespace surface so the lane families stay aligned intentionally.

## Shared `v64` method surface

These methods exist on both [`i8x8`](./assembly/v64/i8x8.ts) and [`i16x4`](./assembly/v64/i16x4.ts):

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

type v128 = number;
type i8 = number;
type u8 = number;
type i32 = number;
type bool = boolean;
/** Creates a vector with sixteen identical 8-bit integer lanes. */
export function splat(x: i8): v128;
/** Extracts one 8-bit integer lane as a signed scalar. idx argument needs to be compile time constant. */
export function extract_lane_s(x: v128, idx: u8): i8;
/** Extracts one 8-bit integer lane as an unsigned scalar. idx argument needs to be compile time constant. */
export function extract_lane_u(x: v128, idx: u8): u8;
/** Replaces one 8-bit integer lane. idx argument needs to be compile time constant. */
export function replace_lane(x: v128, idx: u8, value: i8): v128;
/** Adds each 8-bit integer lane. */
export function add(a: v128, b: v128): v128;
/** Subtracts each 8-bit integer lane. */
export function sub(a: v128, b: v128): v128;
/** Multiplies each 8-bit integer lane */
export function mul(a: v128, b: v128): v128;
/** Computes the signed minimum of each 8-bit integer lane. */
export function min_s(a: v128, b: v128): v128;
/** Computes the unsigned minimum of each 8-bit integer lane. */
export function min_u(a: v128, b: v128): v128;
/** Computes the signed maximum of each 8-bit integer lane. */
export function max_s(a: v128, b: v128): v128;
/** Computes the unsigned maximum of each 8-bit integer lane. */
export function max_u(a: v128, b: v128): v128;
/** Computes the unsigned average of each 8-bit integer lane. */
export function avgr_u(a: v128, b: v128): v128;
/** Computes the absolute value of each 8-bit integer lane. */
export function abs(a: v128): v128;
/** Negates each 8-bit integer lane. */
export function neg(a: v128): v128;
/** Adds each 8-bit integer lane using signed saturation. */
export function add_sat_s(a: v128, b: v128): v128;
/** Adds each 8-bit integer lane using unsigned saturation. */
export function add_sat_u(a: v128, b: v128): v128;
/** Subtracts each 8-bit integer lane using signed saturation. */
export function sub_sat_s(a: v128, b: v128): v128;
/** Subtracts each 8-bit integer lane using unsigned saturation. */
export function sub_sat_u(a: v128, b: v128): v128;
/** Performs a bitwise left shift on each 8-bit integer lane by a scalar. */
export function shl(a: v128, b: i32): v128;
/** Performs a bitwise arithmetic right shift on each 8-bit integer lane by a scalar. */
export function shr_s(a: v128, b: i32): v128;
/** Performs a bitwise logical right shift on each 8-bit integer lane by a scalar. */
export function shr_u(a: v128, b: i32): v128;
/** Reduces a vector to a scalar indicating whether all 8-bit integer lanes are considered `true`. */
export function all_true(a: v128): bool;
/** Extracts the high bit of each 8-bit integer lane and produces a scalar mask with all bits concatenated. */
export function bitmask(a: v128): i32;
/** Counts the number of bits set to one within each 8-bit integer lane. */
export function popcnt(a: v128): v128;
/** Computes which 8-bit integer lanes are equal. */
export function eq(a: v128, b: v128): v128;
/** Computes which 8-bit integer lanes are not equal. */
export function ne(a: v128, b: v128): v128;
/** Computes which 8-bit signed integer lanes of the first vector are less than those of the second. */
export function lt_s(a: v128, b: v128): v128;
/** Computes which 8-bit unsigned integer lanes of the first vector are less than those of the second. */
export function lt_u(a: v128, b: v128): v128;
/** Computes which 8-bit signed integer lanes of the first vector are less than or equal those of the second. */
export function le_s(a: v128, b: v128): v128;
/** Computes which 8-bit unsigned integer lanes of the first vector are less than or equal those of the second. */
export function le_u(a: v128, b: v128): v128;
/** Computes which 8-bit signed integer lanes of the first vector are greater than those of the second. */
export function gt_s(a: v128, b: v128): v128;
/** Computes which 8-bit unsigned integer lanes of the first vector are greater than those of the second. */
export function gt_u(a: v128, b: v128): v128;
/** Computes which 8-bit signed integer lanes of the first vector are greater than or equal those of the second. */
export function ge_s(a: v128, b: v128): v128;
/** Computes which 8-bit unsigned integer lanes of the first vector are greater than or equal those of the second. */
export function ge_u(a: v128, b: v128): v128;
/** Narrows each 16-bit signed integer lane to 8-bit signed integer lanes. */
export function narrow_i16x8_s(a: v128, b: v128): v128;
/** Narrows each 16-bit signed integer lane to 8-bit unsigned integer lanes. */
export function narrow_i16x8_u(a: v128, b: v128): v128;
/** Selects 8-bit lanes from either vector according to the specified [0-15] respectively [16-31] lane indexes. */
export function shuffle(a: v128, b: v128, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8, l8: u8, l9: u8, l10: u8, l11: u8, l12: u8, l13: u8, l14: u8, l15: u8): v128;
/** Selects 8-bit lanes from the first vector according to the indexes [0-15] specified by the 8-bit lanes of the second vector. */
export function swizzle(a: v128, s: v128): v128;
/**
 * Selects 8-bit integer lanes from `a` using indices in `s`. Indices in the range [0-15] select the i-th element of
 * `a`.
 *
 * Unlike {@link i8x16.swizzle}, the result of an out of bounds index is implementation-defined, depending on hardware
 * capabilities: Either `0` or `a[s[i]%16]`.
 */
export function relaxed_swizzle(a: v128, s: v128): v128;
/**
 * Selects 8-bit integer lanes from `a` or `b` based on masks in `m`.
 *
 * Behaves like {@link v128.bitselect} if masks in `m` do have all bits either set (result is `a[i]`) or unset (result
 * is `b[i]`). Otherwise the result is implementation-defined, depending on hardware capabilities: If the most
 * significant bit of `m` is set, the result is either `bitselect(a[i], b[i], mask)` or `a[i]`, otherwise the result
 * is `b[i]`.
 */
export function relaxed_laneselect(a: v128, b: v128, m: v128): v128;

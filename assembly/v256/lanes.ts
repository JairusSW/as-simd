import { v256 } from "./value";

export namespace i8x32 {

  @inline export function splat(x: i8): v256 {
    return v256.splat<i8>(x);
  }


  @inline export function extract_lane_s(x: v256, idx: u8): i8 {
    return v256.extract_lane<i8>(x, idx);
  }


  @inline export function extract_lane_u(x: v256, idx: u8): u8 {
    return v256.extract_lane<u8>(x, idx);
  }


  @inline export function replace_lane(x: v256, idx: u8, value: i8): v256 {
    return v256.replace_lane<i8>(x, idx, value);
  }


  @inline export function add(a: v256, b: v256): v256 {
    return v256.add<i8>(a, b);
  }


  @inline export function sub(a: v256, b: v256): v256 {
    return v256.sub<i8>(a, b);
  }


  @inline export function min_s(a: v256, b: v256): v256 {
    return v256.min<i8>(a, b);
  }


  @inline export function min_u(a: v256, b: v256): v256 {
    return v256.min<u8>(a, b);
  }


  @inline export function max_s(a: v256, b: v256): v256 {
    return v256.max<i8>(a, b);
  }


  @inline export function max_u(a: v256, b: v256): v256 {
    return v256.max<u8>(a, b);
  }


  @inline export function avgr_u(a: v256, b: v256): v256 {
    return v256.avgr<u8>(a, b);
  }


  @inline export function abs(a: v256): v256 {
    return v256.abs<i8>(a);
  }


  @inline export function neg(a: v256): v256 {
    return v256.neg<i8>(a);
  }


  @inline export function add_sat_s(a: v256, b: v256): v256 {
    return v256.add_sat<i8>(a, b);
  }


  @inline export function add_sat_u(a: v256, b: v256): v256 {
    return v256.add_sat<u8>(a, b);
  }


  @inline export function sub_sat_s(a: v256, b: v256): v256 {
    return v256.sub_sat<i8>(a, b);
  }


  @inline export function sub_sat_u(a: v256, b: v256): v256 {
    return v256.sub_sat<u8>(a, b);
  }


  @inline export function shl(a: v256, b: i32): v256 {
    return v256.shl<i8>(a, b);
  }


  @inline export function shr_s(a: v256, b: i32): v256 {
    return v256.shr<i8>(a, b);
  }


  @inline export function shr_u(a: v256, b: i32): v256 {
    return v256.shr<u8>(a, b);
  }


  @inline export function all_true(a: v256): bool {
    return v256.all_true<i8>(a);
  }


  @inline export function bitmask(a: v256): u32 {
    return v256.bitmask<i8>(a);
  }


  @inline export function popcnt(a: v256): v256 {
    return v256.popcnt<i8>(a);
  }


  @inline export function eq(a: v256, b: v256): v256 {
    return v256.eq<i8>(a, b);
  }


  @inline export function ne(a: v256, b: v256): v256 {
    return v256.ne<i8>(a, b);
  }


  @inline export function lt_s(a: v256, b: v256): v256 {
    return v256.lt<i8>(a, b);
  }


  @inline export function lt_u(a: v256, b: v256): v256 {
    return v256.lt<u8>(a, b);
  }


  @inline export function le_s(a: v256, b: v256): v256 {
    return v256.le<i8>(a, b);
  }


  @inline export function le_u(a: v256, b: v256): v256 {
    return v256.le<u8>(a, b);
  }


  @inline export function gt_s(a: v256, b: v256): v256 {
    return v256.gt<i8>(a, b);
  }


  @inline export function gt_u(a: v256, b: v256): v256 {
    return v256.gt<u8>(a, b);
  }


  @inline export function ge_s(a: v256, b: v256): v256 {
    return v256.ge<i8>(a, b);
  }


  @inline export function ge_u(a: v256, b: v256): v256 {
    return v256.ge<u8>(a, b);
  }


  @inline export function narrow_i16x16_s(a: v256, b: v256): v256 {
    return v256.narrow<i16>(a, b);
  }


  @inline export function narrow_i16x16_u(a: v256, b: v256): v256 {
    return v256.narrow<u16>(a, b);
  }


  @inline export function shuffle(
    a: v256,
    b: v256,
    l0: u8,
    l1: u8,
    l2: u8,
    l3: u8,
    l4: u8,
    l5: u8,
    l6: u8,
    l7: u8,
    l8: u8,
    l9: u8,
    l10: u8,
    l11: u8,
    l12: u8,
    l13: u8,
    l14: u8,
    l15: u8,
    l16: u8,
    l17: u8,
    l18: u8,
    l19: u8,
    l20: u8,
    l21: u8,
    l22: u8,
    l23: u8,
    l24: u8,
    l25: u8,
    l26: u8,
    l27: u8,
    l28: u8,
    l29: u8,
    l30: u8,
    l31: u8,
  ): v256 {
    return v256.shuffle<i8>(
      a,
      b,
      l0,
      l1,
      l2,
      l3,
      l4,
      l5,
      l6,
      l7,
      l8,
      l9,
      l10,
      l11,
      l12,
      l13,
      l14,
      l15,
      l16,
      l17,
      l18,
      l19,
      l20,
      l21,
      l22,
      l23,
      l24,
      l25,
      l26,
      l27,
      l28,
      l29,
      l30,
      l31,
    );
  }


  @inline export function swizzle(a: v256, s: v256): v256 {
    return v256.swizzle(a, s);
  }


  @inline export function relaxed_swizzle(a: v256, s: v256): v256 {
    return v256.relaxed_swizzle(a, s);
  }


  @inline export function relaxed_laneselect(a: v256, b: v256, m: v256): v256 {
    return v256.relaxed_laneselect<i8>(a, b, m);
  }
}

export namespace i16x16 {

  @inline export function splat(x: i16): v256 {
    return v256.splat<i16>(x);
  }


  @inline export function extract_lane_s(x: v256, idx: u8): i16 {
    return v256.extract_lane<i16>(x, idx);
  }


  @inline export function extract_lane_u(x: v256, idx: u8): u16 {
    return v256.extract_lane<u16>(x, idx);
  }


  @inline export function replace_lane(x: v256, idx: u8, value: i16): v256 {
    return v256.replace_lane<i16>(x, idx, value);
  }


  @inline export function add(a: v256, b: v256): v256 {
    return v256.add<i16>(a, b);
  }


  @inline export function sub(a: v256, b: v256): v256 {
    return v256.sub<i16>(a, b);
  }


  @inline export function mul(a: v256, b: v256): v256 {
    return v256.mul<i16>(a, b);
  }


  @inline export function min_s(a: v256, b: v256): v256 {
    return v256.min<i16>(a, b);
  }


  @inline export function min_u(a: v256, b: v256): v256 {
    return v256.min<u16>(a, b);
  }


  @inline export function max_s(a: v256, b: v256): v256 {
    return v256.max<i16>(a, b);
  }


  @inline export function max_u(a: v256, b: v256): v256 {
    return v256.max<u16>(a, b);
  }


  @inline export function avgr_u(a: v256, b: v256): v256 {
    return v256.avgr<u16>(a, b);
  }


  @inline export function abs(a: v256): v256 {
    return v256.abs<i16>(a);
  }


  @inline export function neg(a: v256): v256 {
    return v256.neg<i16>(a);
  }


  @inline export function add_sat_s(a: v256, b: v256): v256 {
    return v256.add_sat<i16>(a, b);
  }


  @inline export function add_sat_u(a: v256, b: v256): v256 {
    return v256.add_sat<u16>(a, b);
  }


  @inline export function sub_sat_s(a: v256, b: v256): v256 {
    return v256.sub_sat<i16>(a, b);
  }


  @inline export function sub_sat_u(a: v256, b: v256): v256 {
    return v256.sub_sat<u16>(a, b);
  }


  @inline export function shl(a: v256, b: i32): v256 {
    return v256.shl<i16>(a, b);
  }


  @inline export function shr_s(a: v256, b: i32): v256 {
    return v256.shr<i16>(a, b);
  }


  @inline export function shr_u(a: v256, b: i32): v256 {
    return v256.shr<u16>(a, b);
  }


  @inline export function all_true(a: v256): bool {
    return v256.all_true<i16>(a);
  }


  @inline export function bitmask(a: v256): u32 {
    return v256.bitmask<i16>(a);
  }


  @inline export function eq(a: v256, b: v256): v256 {
    return v256.eq<i16>(a, b);
  }


  @inline export function ne(a: v256, b: v256): v256 {
    return v256.ne<i16>(a, b);
  }


  @inline export function lt_s(a: v256, b: v256): v256 {
    return v256.lt<i16>(a, b);
  }


  @inline export function lt_u(a: v256, b: v256): v256 {
    return v256.lt<u16>(a, b);
  }


  @inline export function le_s(a: v256, b: v256): v256 {
    return v256.le<i16>(a, b);
  }


  @inline export function le_u(a: v256, b: v256): v256 {
    return v256.le<u16>(a, b);
  }


  @inline export function gt_s(a: v256, b: v256): v256 {
    return v256.gt<i16>(a, b);
  }


  @inline export function gt_u(a: v256, b: v256): v256 {
    return v256.gt<u16>(a, b);
  }


  @inline export function ge_s(a: v256, b: v256): v256 {
    return v256.ge<i16>(a, b);
  }


  @inline export function ge_u(a: v256, b: v256): v256 {
    return v256.ge<u16>(a, b);
  }


  @inline export function narrow_i32x8_s(a: v256, b: v256): v256 {
    return v256.narrow<i32>(a, b);
  }


  @inline export function narrow_i32x8_u(a: v256, b: v256): v256 {
    return v256.narrow<u32>(a, b);
  }


  @inline export function extend_low_i8x32_s(a: v256): v256 {
    return v256.extend_low<i8>(a);
  }


  @inline export function extend_low_i8x32_u(a: v256): v256 {
    return v256.extend_low<u8>(a);
  }


  @inline export function extend_high_i8x32_s(a: v256): v256 {
    return v256.extend_high<i8>(a);
  }


  @inline export function extend_high_i8x32_u(a: v256): v256 {
    return v256.extend_high<u8>(a);
  }


  @inline export function extadd_pairwise_i8x32_s(a: v256): v256 {
    return v256.extadd_pairwise<i8>(a);
  }


  @inline export function extadd_pairwise_i8x32_u(a: v256): v256 {
    return v256.extadd_pairwise<u8>(a);
  }


  @inline export function q15mulr_sat_s(a: v256, b: v256): v256 {
    return v256.q15mulr_sat<i16>(a, b);
  }


  @inline export function extmul_low_i8x32_s(a: v256, b: v256): v256 {
    return v256.extmul_low<i8>(a, b);
  }


  @inline export function extmul_low_i8x32_u(a: v256, b: v256): v256 {
    return v256.extmul_low<u8>(a, b);
  }


  @inline export function extmul_high_i8x32_s(a: v256, b: v256): v256 {
    return v256.extmul_high<i8>(a, b);
  }


  @inline export function extmul_high_i8x32_u(a: v256, b: v256): v256 {
    return v256.extmul_high<u8>(a, b);
  }


  @inline export function shuffle(
    a: v256,
    b: v256,
    l0: u8,
    l1: u8,
    l2: u8,
    l3: u8,
    l4: u8,
    l5: u8,
    l6: u8,
    l7: u8,
    l8: u8,
    l9: u8,
    l10: u8,
    l11: u8,
    l12: u8,
    l13: u8,
    l14: u8,
    l15: u8,
  ): v256 {
    return v256.shuffle<i16>(
      a,
      b,
      l0,
      l1,
      l2,
      l3,
      l4,
      l5,
      l6,
      l7,
      l8,
      l9,
      l10,
      l11,
      l12,
      l13,
      l14,
      l15,
    );
  }


  @inline export function relaxed_laneselect(a: v256, b: v256, m: v256): v256 {
    return v256.relaxed_laneselect<i16>(a, b, m);
  }


  @inline export function relaxed_q15mulr_s(a: v256, b: v256): v256 {
    return v256.relaxed_q15mulr<i16>(a, b);
  }


  @inline export function relaxed_dot_i8x32_i7x32_s(a: v256, b: v256): v256 {
    return v256.relaxed_dot<i16>(a, b);
  }
}

export namespace i32x8 {

  @inline export function splat(x: i32): v256 {
    return v256.splat<i32>(x);
  }


  @inline export function extract_lane(x: v256, idx: u8): i32 {
    return v256.extract_lane<i32>(x, idx);
  }


  @inline export function replace_lane(x: v256, idx: u8, value: i32): v256 {
    return v256.replace_lane<i32>(x, idx, value);
  }


  @inline export function add(a: v256, b: v256): v256 {
    return v256.add<i32>(a, b);
  }


  @inline export function sub(a: v256, b: v256): v256 {
    return v256.sub<i32>(a, b);
  }


  @inline export function mul(a: v256, b: v256): v256 {
    return v256.mul<i32>(a, b);
  }


  @inline export function min_s(a: v256, b: v256): v256 {
    return v256.min<i32>(a, b);
  }


  @inline export function min_u(a: v256, b: v256): v256 {
    return v256.min<u32>(a, b);
  }


  @inline export function max_s(a: v256, b: v256): v256 {
    return v256.max<i32>(a, b);
  }


  @inline export function max_u(a: v256, b: v256): v256 {
    return v256.max<u32>(a, b);
  }


  @inline export function abs(a: v256): v256 {
    return v256.abs<i32>(a);
  }


  @inline export function neg(a: v256): v256 {
    return v256.neg<i32>(a);
  }


  @inline export function shl(a: v256, b: i32): v256 {
    return v256.shl<i32>(a, b);
  }


  @inline export function shr_s(a: v256, b: i32): v256 {
    return v256.shr<i32>(a, b);
  }


  @inline export function shr_u(a: v256, b: i32): v256 {
    return v256.shr<u32>(a, b);
  }


  @inline export function all_true(a: v256): bool {
    return v256.all_true<i32>(a);
  }


  @inline export function bitmask(a: v256): u32 {
    return v256.bitmask<i32>(a);
  }


  @inline export function eq(a: v256, b: v256): v256 {
    return v256.eq<i32>(a, b);
  }


  @inline export function ne(a: v256, b: v256): v256 {
    return v256.ne<i32>(a, b);
  }


  @inline export function lt_s(a: v256, b: v256): v256 {
    return v256.lt<i32>(a, b);
  }


  @inline export function lt_u(a: v256, b: v256): v256 {
    return v256.lt<u32>(a, b);
  }


  @inline export function le_s(a: v256, b: v256): v256 {
    return v256.le<i32>(a, b);
  }


  @inline export function le_u(a: v256, b: v256): v256 {
    return v256.le<u32>(a, b);
  }


  @inline export function gt_s(a: v256, b: v256): v256 {
    return v256.gt<i32>(a, b);
  }


  @inline export function gt_u(a: v256, b: v256): v256 {
    return v256.gt<u32>(a, b);
  }


  @inline export function ge_s(a: v256, b: v256): v256 {
    return v256.ge<i32>(a, b);
  }


  @inline export function ge_u(a: v256, b: v256): v256 {
    return v256.ge<u32>(a, b);
  }


  @inline export function dot_i16x16_s(a: v256, b: v256): v256 {
    return v256.dot<i16>(a, b);
  }


  @inline export function trunc_sat_f32x8_s(a: v256): v256 {
    return v256.trunc_sat<i32>(a);
  }


  @inline export function trunc_sat_f32x8_u(a: v256): v256 {
    return v256.trunc_sat<u32>(a);
  }


  @inline export function trunc_sat_f64x4_s_zero(a: v256): v256 {
    return v256.trunc_sat_zero<i32>(a);
  }


  @inline export function trunc_sat_f64x4_u_zero(a: v256): v256 {
    return v256.trunc_sat_zero<u32>(a);
  }


  @inline export function extend_low_i16x16_s(a: v256): v256 {
    return v256.extend_low<i16>(a);
  }


  @inline export function extend_low_i16x16_u(a: v256): v256 {
    return v256.extend_low<u16>(a);
  }


  @inline export function extend_high_i16x16_s(a: v256): v256 {
    return v256.extend_high<i16>(a);
  }


  @inline export function extend_high_i16x16_u(a: v256): v256 {
    return v256.extend_high<u16>(a);
  }


  @inline export function extadd_pairwise_i16x16_s(a: v256): v256 {
    return v256.extadd_pairwise<i16>(a);
  }


  @inline export function extadd_pairwise_i16x16_u(a: v256): v256 {
    return v256.extadd_pairwise<u16>(a);
  }


  @inline export function extmul_low_i16x16_s(a: v256, b: v256): v256 {
    return v256.extmul_low<i16>(a, b);
  }


  @inline export function extmul_low_i16x16_u(a: v256, b: v256): v256 {
    return v256.extmul_low<u16>(a, b);
  }


  @inline export function extmul_high_i16x16_s(a: v256, b: v256): v256 {
    return v256.extmul_high<i16>(a, b);
  }


  @inline export function extmul_high_i16x16_u(a: v256, b: v256): v256 {
    return v256.extmul_high<u16>(a, b);
  }


  @inline export function shuffle(
    a: v256,
    b: v256,
    l0: u8,
    l1: u8,
    l2: u8,
    l3: u8,
    l4: u8,
    l5: u8,
    l6: u8,
    l7: u8,
  ): v256 {
    return v256.shuffle<i32>(a, b, l0, l1, l2, l3, l4, l5, l6, l7);
  }


  @inline export function relaxed_trunc_f32x8_s(a: v256): v256 {
    return v256.relaxed_trunc<i32>(a);
  }


  @inline export function relaxed_trunc_f32x8_u(a: v256): v256 {
    return v256.relaxed_trunc<u32>(a);
  }


  @inline export function relaxed_trunc_f64x4_s_zero(a: v256): v256 {
    return v256.relaxed_trunc_zero<i32>(a);
  }


  @inline export function relaxed_trunc_f64x4_u_zero(a: v256): v256 {
    return v256.relaxed_trunc_zero<u32>(a);
  }


  @inline export function relaxed_laneselect(a: v256, b: v256, m: v256): v256 {
    return v256.relaxed_laneselect<i32>(a, b, m);
  }


  @inline export function relaxed_dot_i8x32_i7x32_add_s(
    a: v256,
    b: v256,
    c: v256,
  ): v256 {
    return v256.relaxed_dot_add<i32>(a, b, c);
  }
}

export namespace i64x4 {

  @inline export function splat(x: i64): v256 {
    return v256.splat<i64>(x);
  }


  @inline export function extract_lane(x: v256, idx: u8): i64 {
    return v256.extract_lane<i64>(x, idx);
  }


  @inline export function replace_lane(x: v256, idx: u8, value: i64): v256 {
    return v256.replace_lane<i64>(x, idx, value);
  }


  @inline export function add(a: v256, b: v256): v256 {
    return v256.add<i64>(a, b);
  }


  @inline export function sub(a: v256, b: v256): v256 {
    return v256.sub<i64>(a, b);
  }


  @inline export function mul(a: v256, b: v256): v256 {
    return v256.mul<i64>(a, b);
  }


  @inline export function abs(a: v256): v256 {
    return v256.abs<i64>(a);
  }


  @inline export function neg(a: v256): v256 {
    return v256.neg<i64>(a);
  }


  @inline export function shl(a: v256, b: i32): v256 {
    return v256.shl<i64>(a, b);
  }


  @inline export function shr_s(a: v256, b: i32): v256 {
    return v256.shr<i64>(a, b);
  }


  @inline export function shr_u(a: v256, b: i32): v256 {
    return v256.shr<u64>(a, b);
  }


  @inline export function all_true(a: v256): bool {
    return v256.all_true<i64>(a);
  }


  @inline export function bitmask(a: v256): u32 {
    return v256.bitmask<i64>(a);
  }


  @inline export function eq(a: v256, b: v256): v256 {
    return v256.eq<i64>(a, b);
  }


  @inline export function ne(a: v256, b: v256): v256 {
    return v256.ne<i64>(a, b);
  }


  @inline export function lt_s(a: v256, b: v256): v256 {
    return v256.lt<i64>(a, b);
  }


  @inline export function le_s(a: v256, b: v256): v256 {
    return v256.le<i64>(a, b);
  }


  @inline export function gt_s(a: v256, b: v256): v256 {
    return v256.gt<i64>(a, b);
  }


  @inline export function ge_s(a: v256, b: v256): v256 {
    return v256.ge<i64>(a, b);
  }


  @inline export function extend_low_i32x8_s(a: v256): v256 {
    return v256.extend_low<i32>(a);
  }


  @inline export function extend_low_i32x8_u(a: v256): v256 {
    return v256.extend_low<u32>(a);
  }


  @inline export function extend_high_i32x8_s(a: v256): v256 {
    return v256.extend_high<i32>(a);
  }


  @inline export function extend_high_i32x8_u(a: v256): v256 {
    return v256.extend_high<u32>(a);
  }


  @inline export function extmul_low_i32x8_s(a: v256, b: v256): v256 {
    return v256.extmul_low<i32>(a, b);
  }


  @inline export function extmul_low_i32x8_u(a: v256, b: v256): v256 {
    return v256.extmul_low<u32>(a, b);
  }


  @inline export function extmul_high_i32x8_s(a: v256, b: v256): v256 {
    return v256.extmul_high<i32>(a, b);
  }


  @inline export function extmul_high_i32x8_u(a: v256, b: v256): v256 {
    return v256.extmul_high<u32>(a, b);
  }


  @inline export function shuffle(
    a: v256,
    b: v256,
    l0: u8,
    l1: u8,
    l2: u8,
    l3: u8,
  ): v256 {
    return v256.shuffle<i64>(a, b, l0, l1, l2, l3);
  }


  @inline export function relaxed_laneselect(a: v256, b: v256, m: v256): v256 {
    return v256.relaxed_laneselect<i64>(a, b, m);
  }
}

export namespace f32x8 {

  @inline export function splat(x: f32): v256 {
    return v256.splat<f32>(x);
  }


  @inline export function extract_lane(x: v256, idx: u8): f32 {
    return v256.extract_lane<f32>(x, idx);
  }


  @inline export function replace_lane(x: v256, idx: u8, value: f32): v256 {
    return v256.replace_lane<f32>(x, idx, value);
  }


  @inline export function add(a: v256, b: v256): v256 {
    return v256.add<f32>(a, b);
  }


  @inline export function sub(a: v256, b: v256): v256 {
    return v256.sub<f32>(a, b);
  }


  @inline export function mul(a: v256, b: v256): v256 {
    return v256.mul<f32>(a, b);
  }


  @inline export function div(a: v256, b: v256): v256 {
    return v256.div<f32>(a, b);
  }


  @inline export function neg(a: v256): v256 {
    return v256.neg<f32>(a);
  }


  @inline export function abs(a: v256): v256 {
    return v256.abs<f32>(a);
  }


  @inline export function sqrt(a: v256): v256 {
    return v256.sqrt<f32>(a);
  }


  @inline export function ceil(a: v256): v256 {
    return v256.ceil<f32>(a);
  }


  @inline export function floor(a: v256): v256 {
    return v256.floor<f32>(a);
  }


  @inline export function trunc(a: v256): v256 {
    return v256.trunc<f32>(a);
  }


  @inline export function nearest(a: v256): v256 {
    return v256.nearest<f32>(a);
  }


  @inline export function min(a: v256, b: v256): v256 {
    return v256.min<f32>(a, b);
  }


  @inline export function max(a: v256, b: v256): v256 {
    return v256.max<f32>(a, b);
  }


  @inline export function pmin(a: v256, b: v256): v256 {
    return v256.pmin<f32>(a, b);
  }


  @inline export function pmax(a: v256, b: v256): v256 {
    return v256.pmax<f32>(a, b);
  }


  @inline export function eq(a: v256, b: v256): v256 {
    return v256.eq<f32>(a, b);
  }


  @inline export function ne(a: v256, b: v256): v256 {
    return v256.ne<f32>(a, b);
  }


  @inline export function lt(a: v256, b: v256): v256 {
    return v256.lt<f32>(a, b);
  }


  @inline export function le(a: v256, b: v256): v256 {
    return v256.le<f32>(a, b);
  }


  @inline export function gt(a: v256, b: v256): v256 {
    return v256.gt<f32>(a, b);
  }


  @inline export function ge(a: v256, b: v256): v256 {
    return v256.ge<f32>(a, b);
  }


  @inline export function convert_i32x8_s(a: v256): v256 {
    return v256.convert<i32>(a);
  }


  @inline export function convert_i32x8_u(a: v256): v256 {
    return v256.convert<u32>(a);
  }


  @inline export function demote_f64x4_zero(a: v256): v256 {
    return v256.demote_zero<f64>(a);
  }


  @inline export function shuffle(
    a: v256,
    b: v256,
    l0: u8,
    l1: u8,
    l2: u8,
    l3: u8,
    l4: u8,
    l5: u8,
    l6: u8,
    l7: u8,
  ): v256 {
    return v256.shuffle<f32>(a, b, l0, l1, l2, l3, l4, l5, l6, l7);
  }


  @inline export function relaxed_madd(a: v256, b: v256, c: v256): v256 {
    return v256.relaxed_madd<f32>(a, b, c);
  }


  @inline export function relaxed_nmadd(a: v256, b: v256, c: v256): v256 {
    return v256.relaxed_nmadd<f32>(a, b, c);
  }


  @inline export function relaxed_min(a: v256, b: v256): v256 {
    return v256.relaxed_min<f32>(a, b);
  }


  @inline export function relaxed_max(a: v256, b: v256): v256 {
    return v256.relaxed_max<f32>(a, b);
  }
}

export namespace f64x4 {

  @inline export function splat(x: f64): v256 {
    return v256.splat<f64>(x);
  }


  @inline export function extract_lane(x: v256, idx: u8): f64 {
    return v256.extract_lane<f64>(x, idx);
  }


  @inline export function replace_lane(x: v256, idx: u8, value: f64): v256 {
    return v256.replace_lane<f64>(x, idx, value);
  }


  @inline export function add(a: v256, b: v256): v256 {
    return v256.add<f64>(a, b);
  }


  @inline export function sub(a: v256, b: v256): v256 {
    return v256.sub<f64>(a, b);
  }


  @inline export function mul(a: v256, b: v256): v256 {
    return v256.mul<f64>(a, b);
  }


  @inline export function div(a: v256, b: v256): v256 {
    return v256.div<f64>(a, b);
  }


  @inline export function neg(a: v256): v256 {
    return v256.neg<f64>(a);
  }


  @inline export function abs(a: v256): v256 {
    return v256.abs<f64>(a);
  }


  @inline export function sqrt(a: v256): v256 {
    return v256.sqrt<f64>(a);
  }


  @inline export function ceil(a: v256): v256 {
    return v256.ceil<f64>(a);
  }


  @inline export function floor(a: v256): v256 {
    return v256.floor<f64>(a);
  }


  @inline export function trunc(a: v256): v256 {
    return v256.trunc<f64>(a);
  }


  @inline export function nearest(a: v256): v256 {
    return v256.nearest<f64>(a);
  }


  @inline export function min(a: v256, b: v256): v256 {
    return v256.min<f64>(a, b);
  }


  @inline export function max(a: v256, b: v256): v256 {
    return v256.max<f64>(a, b);
  }


  @inline export function pmin(a: v256, b: v256): v256 {
    return v256.pmin<f64>(a, b);
  }


  @inline export function pmax(a: v256, b: v256): v256 {
    return v256.pmax<f64>(a, b);
  }


  @inline export function eq(a: v256, b: v256): v256 {
    return v256.eq<f64>(a, b);
  }


  @inline export function ne(a: v256, b: v256): v256 {
    return v256.ne<f64>(a, b);
  }


  @inline export function lt(a: v256, b: v256): v256 {
    return v256.lt<f64>(a, b);
  }


  @inline export function le(a: v256, b: v256): v256 {
    return v256.le<f64>(a, b);
  }


  @inline export function gt(a: v256, b: v256): v256 {
    return v256.gt<f64>(a, b);
  }


  @inline export function ge(a: v256, b: v256): v256 {
    return v256.ge<f64>(a, b);
  }


  @inline export function convert_low_i32x8_s(a: v256): v256 {
    return v256.convert_low<i32>(a);
  }


  @inline export function convert_low_i32x8_u(a: v256): v256 {
    return v256.convert_low<u32>(a);
  }


  @inline export function promote_low_f32x8(a: v256): v256 {
    return v256.promote_low<f32>(a);
  }


  @inline export function shuffle(
    a: v256,
    b: v256,
    l0: u8,
    l1: u8,
    l2: u8,
    l3: u8,
  ): v256 {
    return v256.shuffle<f64>(a, b, l0, l1, l2, l3);
  }


  @inline export function relaxed_madd(a: v256, b: v256, c: v256): v256 {
    return v256.relaxed_madd<f64>(a, b, c);
  }


  @inline export function relaxed_nmadd(a: v256, b: v256, c: v256): v256 {
    return v256.relaxed_nmadd<f64>(a, b, c);
  }


  @inline export function relaxed_min(a: v256, b: v256): v256 {
    return v256.relaxed_min<f64>(a, b);
  }


  @inline export function relaxed_max(a: v256, b: v256): v256 {
    return v256.relaxed_max<f64>(a, b);
  }
}

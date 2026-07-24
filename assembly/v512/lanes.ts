import { v512 } from "./value";

export namespace i8x64 {

  @inline export function splat(x: i8): v512 {
    return v512.splat<i8>(x);
  }


  @inline export function extract_lane_s(x: v512, idx: u8): i8 {
    return v512.extract_lane<i8>(x, idx);
  }


  @inline export function extract_lane_u(x: v512, idx: u8): u8 {
    return v512.extract_lane<u8>(x, idx);
  }


  @inline export function replace_lane(x: v512, idx: u8, value: i8): v512 {
    return v512.replace_lane<i8>(x, idx, value);
  }


  @inline export function add(a: v512, b: v512): v512 {
    return v512.add<i8>(a, b);
  }


  @inline export function sub(a: v512, b: v512): v512 {
    return v512.sub<i8>(a, b);
  }


  @inline export function min_s(a: v512, b: v512): v512 {
    return v512.min<i8>(a, b);
  }


  @inline export function min_u(a: v512, b: v512): v512 {
    return v512.min<u8>(a, b);
  }


  @inline export function max_s(a: v512, b: v512): v512 {
    return v512.max<i8>(a, b);
  }


  @inline export function max_u(a: v512, b: v512): v512 {
    return v512.max<u8>(a, b);
  }


  @inline export function avgr_u(a: v512, b: v512): v512 {
    return v512.avgr<u8>(a, b);
  }


  @inline export function abs(a: v512): v512 {
    return v512.abs<i8>(a);
  }


  @inline export function neg(a: v512): v512 {
    return v512.neg<i8>(a);
  }


  @inline export function add_sat_s(a: v512, b: v512): v512 {
    return v512.add_sat<i8>(a, b);
  }


  @inline export function add_sat_u(a: v512, b: v512): v512 {
    return v512.add_sat<u8>(a, b);
  }


  @inline export function sub_sat_s(a: v512, b: v512): v512 {
    return v512.sub_sat<i8>(a, b);
  }


  @inline export function sub_sat_u(a: v512, b: v512): v512 {
    return v512.sub_sat<u8>(a, b);
  }


  @inline export function shl(a: v512, b: i32): v512 {
    return v512.shl<i8>(a, b);
  }


  @inline export function shr_s(a: v512, b: i32): v512 {
    return v512.shr<i8>(a, b);
  }


  @inline export function shr_u(a: v512, b: i32): v512 {
    return v512.shr<u8>(a, b);
  }


  @inline export function all_true(a: v512): bool {
    return v512.all_true<i8>(a);
  }


  @inline export function bitmask(a: v512): u64 {
    return v512.bitmask<i8>(a);
  }


  @inline export function popcnt(a: v512): v512 {
    return v512.popcnt<i8>(a);
  }


  @inline export function eq(a: v512, b: v512): v512 {
    return v512.eq<i8>(a, b);
  }


  @inline export function ne(a: v512, b: v512): v512 {
    return v512.ne<i8>(a, b);
  }


  @inline export function lt_s(a: v512, b: v512): v512 {
    return v512.lt<i8>(a, b);
  }


  @inline export function lt_u(a: v512, b: v512): v512 {
    return v512.lt<u8>(a, b);
  }


  @inline export function le_s(a: v512, b: v512): v512 {
    return v512.le<i8>(a, b);
  }


  @inline export function le_u(a: v512, b: v512): v512 {
    return v512.le<u8>(a, b);
  }


  @inline export function gt_s(a: v512, b: v512): v512 {
    return v512.gt<i8>(a, b);
  }


  @inline export function gt_u(a: v512, b: v512): v512 {
    return v512.gt<u8>(a, b);
  }


  @inline export function ge_s(a: v512, b: v512): v512 {
    return v512.ge<i8>(a, b);
  }


  @inline export function ge_u(a: v512, b: v512): v512 {
    return v512.ge<u8>(a, b);
  }


  @inline export function narrow_i16x32_s(a: v512, b: v512): v512 {
    return v512.narrow<i16>(a, b);
  }


  @inline export function narrow_i16x32_u(a: v512, b: v512): v512 {
    return v512.narrow<u16>(a, b);
  }


  @inline export function shuffle(
    a: v512,
    b: v512,
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
    l32: u8,
    l33: u8,
    l34: u8,
    l35: u8,
    l36: u8,
    l37: u8,
    l38: u8,
    l39: u8,
    l40: u8,
    l41: u8,
    l42: u8,
    l43: u8,
    l44: u8,
    l45: u8,
    l46: u8,
    l47: u8,
    l48: u8,
    l49: u8,
    l50: u8,
    l51: u8,
    l52: u8,
    l53: u8,
    l54: u8,
    l55: u8,
    l56: u8,
    l57: u8,
    l58: u8,
    l59: u8,
    l60: u8,
    l61: u8,
    l62: u8,
    l63: u8,
  ): v512 {
    return v512.shuffle<i8>(
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
      l32,
      l33,
      l34,
      l35,
      l36,
      l37,
      l38,
      l39,
      l40,
      l41,
      l42,
      l43,
      l44,
      l45,
      l46,
      l47,
      l48,
      l49,
      l50,
      l51,
      l52,
      l53,
      l54,
      l55,
      l56,
      l57,
      l58,
      l59,
      l60,
      l61,
      l62,
      l63,
    );
  }


  @inline export function swizzle(a: v512, s: v512): v512 {
    return v512.swizzle(a, s);
  }


  @inline export function relaxed_swizzle(a: v512, s: v512): v512 {
    return v512.relaxed_swizzle(a, s);
  }


  @inline export function relaxed_laneselect(a: v512, b: v512, m: v512): v512 {
    return v512.relaxed_laneselect<i8>(a, b, m);
  }
}

export namespace i16x32 {

  @inline export function splat(x: i16): v512 {
    return v512.splat<i16>(x);
  }


  @inline export function extract_lane_s(x: v512, idx: u8): i16 {
    return v512.extract_lane<i16>(x, idx);
  }


  @inline export function extract_lane_u(x: v512, idx: u8): u16 {
    return v512.extract_lane<u16>(x, idx);
  }


  @inline export function replace_lane(x: v512, idx: u8, value: i16): v512 {
    return v512.replace_lane<i16>(x, idx, value);
  }


  @inline export function add(a: v512, b: v512): v512 {
    return v512.add<i16>(a, b);
  }


  @inline export function sub(a: v512, b: v512): v512 {
    return v512.sub<i16>(a, b);
  }


  @inline export function mul(a: v512, b: v512): v512 {
    return v512.mul<i16>(a, b);
  }


  @inline export function min_s(a: v512, b: v512): v512 {
    return v512.min<i16>(a, b);
  }


  @inline export function min_u(a: v512, b: v512): v512 {
    return v512.min<u16>(a, b);
  }


  @inline export function max_s(a: v512, b: v512): v512 {
    return v512.max<i16>(a, b);
  }


  @inline export function max_u(a: v512, b: v512): v512 {
    return v512.max<u16>(a, b);
  }


  @inline export function avgr_u(a: v512, b: v512): v512 {
    return v512.avgr<u16>(a, b);
  }


  @inline export function abs(a: v512): v512 {
    return v512.abs<i16>(a);
  }


  @inline export function neg(a: v512): v512 {
    return v512.neg<i16>(a);
  }


  @inline export function add_sat_s(a: v512, b: v512): v512 {
    return v512.add_sat<i16>(a, b);
  }


  @inline export function add_sat_u(a: v512, b: v512): v512 {
    return v512.add_sat<u16>(a, b);
  }


  @inline export function sub_sat_s(a: v512, b: v512): v512 {
    return v512.sub_sat<i16>(a, b);
  }


  @inline export function sub_sat_u(a: v512, b: v512): v512 {
    return v512.sub_sat<u16>(a, b);
  }


  @inline export function shl(a: v512, b: i32): v512 {
    return v512.shl<i16>(a, b);
  }


  @inline export function shr_s(a: v512, b: i32): v512 {
    return v512.shr<i16>(a, b);
  }


  @inline export function shr_u(a: v512, b: i32): v512 {
    return v512.shr<u16>(a, b);
  }


  @inline export function all_true(a: v512): bool {
    return v512.all_true<i16>(a);
  }


  @inline export function bitmask(a: v512): u64 {
    return v512.bitmask<i16>(a);
  }


  @inline export function eq(a: v512, b: v512): v512 {
    return v512.eq<i16>(a, b);
  }


  @inline export function ne(a: v512, b: v512): v512 {
    return v512.ne<i16>(a, b);
  }


  @inline export function lt_s(a: v512, b: v512): v512 {
    return v512.lt<i16>(a, b);
  }


  @inline export function lt_u(a: v512, b: v512): v512 {
    return v512.lt<u16>(a, b);
  }


  @inline export function le_s(a: v512, b: v512): v512 {
    return v512.le<i16>(a, b);
  }


  @inline export function le_u(a: v512, b: v512): v512 {
    return v512.le<u16>(a, b);
  }


  @inline export function gt_s(a: v512, b: v512): v512 {
    return v512.gt<i16>(a, b);
  }


  @inline export function gt_u(a: v512, b: v512): v512 {
    return v512.gt<u16>(a, b);
  }


  @inline export function ge_s(a: v512, b: v512): v512 {
    return v512.ge<i16>(a, b);
  }


  @inline export function ge_u(a: v512, b: v512): v512 {
    return v512.ge<u16>(a, b);
  }


  @inline export function narrow_i32x16_s(a: v512, b: v512): v512 {
    return v512.narrow<i32>(a, b);
  }


  @inline export function narrow_i32x16_u(a: v512, b: v512): v512 {
    return v512.narrow<u32>(a, b);
  }


  @inline export function extend_low_i8x64_s(a: v512): v512 {
    return v512.extend_low<i8>(a);
  }


  @inline export function extend_low_i8x64_u(a: v512): v512 {
    return v512.extend_low<u8>(a);
  }


  @inline export function extend_high_i8x64_s(a: v512): v512 {
    return v512.extend_high<i8>(a);
  }


  @inline export function extend_high_i8x64_u(a: v512): v512 {
    return v512.extend_high<u8>(a);
  }


  @inline export function extadd_pairwise_i8x64_s(a: v512): v512 {
    return v512.extadd_pairwise<i8>(a);
  }


  @inline export function extadd_pairwise_i8x64_u(a: v512): v512 {
    return v512.extadd_pairwise<u8>(a);
  }


  @inline export function q15mulr_sat_s(a: v512, b: v512): v512 {
    return v512.q15mulr_sat<i16>(a, b);
  }


  @inline export function extmul_low_i8x64_s(a: v512, b: v512): v512 {
    return v512.extmul_low<i8>(a, b);
  }


  @inline export function extmul_low_i8x64_u(a: v512, b: v512): v512 {
    return v512.extmul_low<u8>(a, b);
  }


  @inline export function extmul_high_i8x64_s(a: v512, b: v512): v512 {
    return v512.extmul_high<i8>(a, b);
  }


  @inline export function extmul_high_i8x64_u(a: v512, b: v512): v512 {
    return v512.extmul_high<u8>(a, b);
  }


  @inline export function shuffle(
    a: v512,
    b: v512,
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
  ): v512 {
    return v512.shuffle<i16>(
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


  @inline export function relaxed_laneselect(a: v512, b: v512, m: v512): v512 {
    return v512.relaxed_laneselect<i16>(a, b, m);
  }


  @inline export function relaxed_q15mulr_s(a: v512, b: v512): v512 {
    return v512.relaxed_q15mulr<i16>(a, b);
  }


  @inline export function relaxed_dot_i8x64_i7x64_s(a: v512, b: v512): v512 {
    return v512.relaxed_dot<i16>(a, b);
  }
}

export namespace i32x16 {

  @inline export function splat(x: i32): v512 {
    return v512.splat<i32>(x);
  }


  @inline export function extract_lane(x: v512, idx: u8): i32 {
    return v512.extract_lane<i32>(x, idx);
  }


  @inline export function replace_lane(x: v512, idx: u8, value: i32): v512 {
    return v512.replace_lane<i32>(x, idx, value);
  }


  @inline export function add(a: v512, b: v512): v512 {
    return v512.add<i32>(a, b);
  }


  @inline export function sub(a: v512, b: v512): v512 {
    return v512.sub<i32>(a, b);
  }


  @inline export function mul(a: v512, b: v512): v512 {
    return v512.mul<i32>(a, b);
  }


  @inline export function min_s(a: v512, b: v512): v512 {
    return v512.min<i32>(a, b);
  }


  @inline export function min_u(a: v512, b: v512): v512 {
    return v512.min<u32>(a, b);
  }


  @inline export function max_s(a: v512, b: v512): v512 {
    return v512.max<i32>(a, b);
  }


  @inline export function max_u(a: v512, b: v512): v512 {
    return v512.max<u32>(a, b);
  }


  @inline export function abs(a: v512): v512 {
    return v512.abs<i32>(a);
  }


  @inline export function neg(a: v512): v512 {
    return v512.neg<i32>(a);
  }


  @inline export function shl(a: v512, b: i32): v512 {
    return v512.shl<i32>(a, b);
  }


  @inline export function shr_s(a: v512, b: i32): v512 {
    return v512.shr<i32>(a, b);
  }


  @inline export function shr_u(a: v512, b: i32): v512 {
    return v512.shr<u32>(a, b);
  }


  @inline export function all_true(a: v512): bool {
    return v512.all_true<i32>(a);
  }


  @inline export function bitmask(a: v512): u64 {
    return v512.bitmask<i32>(a);
  }


  @inline export function eq(a: v512, b: v512): v512 {
    return v512.eq<i32>(a, b);
  }


  @inline export function ne(a: v512, b: v512): v512 {
    return v512.ne<i32>(a, b);
  }


  @inline export function lt_s(a: v512, b: v512): v512 {
    return v512.lt<i32>(a, b);
  }


  @inline export function lt_u(a: v512, b: v512): v512 {
    return v512.lt<u32>(a, b);
  }


  @inline export function le_s(a: v512, b: v512): v512 {
    return v512.le<i32>(a, b);
  }


  @inline export function le_u(a: v512, b: v512): v512 {
    return v512.le<u32>(a, b);
  }


  @inline export function gt_s(a: v512, b: v512): v512 {
    return v512.gt<i32>(a, b);
  }


  @inline export function gt_u(a: v512, b: v512): v512 {
    return v512.gt<u32>(a, b);
  }


  @inline export function ge_s(a: v512, b: v512): v512 {
    return v512.ge<i32>(a, b);
  }


  @inline export function ge_u(a: v512, b: v512): v512 {
    return v512.ge<u32>(a, b);
  }


  @inline export function dot_i16x32_s(a: v512, b: v512): v512 {
    return v512.dot<i16>(a, b);
  }


  @inline export function trunc_sat_f32x16_s(a: v512): v512 {
    return v512.trunc_sat<i32>(a);
  }


  @inline export function trunc_sat_f32x16_u(a: v512): v512 {
    return v512.trunc_sat<u32>(a);
  }


  @inline export function trunc_sat_f64x8_s_zero(a: v512): v512 {
    return v512.trunc_sat_zero<i32>(a);
  }


  @inline export function trunc_sat_f64x8_u_zero(a: v512): v512 {
    return v512.trunc_sat_zero<u32>(a);
  }


  @inline export function extend_low_i16x32_s(a: v512): v512 {
    return v512.extend_low<i16>(a);
  }


  @inline export function extend_low_i16x32_u(a: v512): v512 {
    return v512.extend_low<u16>(a);
  }


  @inline export function extend_high_i16x32_s(a: v512): v512 {
    return v512.extend_high<i16>(a);
  }


  @inline export function extend_high_i16x32_u(a: v512): v512 {
    return v512.extend_high<u16>(a);
  }


  @inline export function extadd_pairwise_i16x32_s(a: v512): v512 {
    return v512.extadd_pairwise<i16>(a);
  }


  @inline export function extadd_pairwise_i16x32_u(a: v512): v512 {
    return v512.extadd_pairwise<u16>(a);
  }


  @inline export function extmul_low_i16x32_s(a: v512, b: v512): v512 {
    return v512.extmul_low<i16>(a, b);
  }


  @inline export function extmul_low_i16x32_u(a: v512, b: v512): v512 {
    return v512.extmul_low<u16>(a, b);
  }


  @inline export function extmul_high_i16x32_s(a: v512, b: v512): v512 {
    return v512.extmul_high<i16>(a, b);
  }


  @inline export function extmul_high_i16x32_u(a: v512, b: v512): v512 {
    return v512.extmul_high<u16>(a, b);
  }


  @inline export function shuffle(
    a: v512,
    b: v512,
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
  ): v512 {
    return v512.shuffle<i32>(
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


  @inline export function relaxed_trunc_f32x16_s(a: v512): v512 {
    return v512.relaxed_trunc<i32>(a);
  }


  @inline export function relaxed_trunc_f32x16_u(a: v512): v512 {
    return v512.relaxed_trunc<u32>(a);
  }


  @inline export function relaxed_trunc_f64x8_s_zero(a: v512): v512 {
    return v512.relaxed_trunc_zero<i32>(a);
  }


  @inline export function relaxed_trunc_f64x8_u_zero(a: v512): v512 {
    return v512.relaxed_trunc_zero<u32>(a);
  }


  @inline export function relaxed_laneselect(a: v512, b: v512, m: v512): v512 {
    return v512.relaxed_laneselect<i32>(a, b, m);
  }


  @inline export function relaxed_dot_i8x64_i7x64_add_s(
    a: v512,
    b: v512,
    c: v512,
  ): v512 {
    return v512.relaxed_dot_add<i32>(a, b, c);
  }
}

export namespace i64x8 {

  @inline export function splat(x: i64): v512 {
    return v512.splat<i64>(x);
  }


  @inline export function extract_lane(x: v512, idx: u8): i64 {
    return v512.extract_lane<i64>(x, idx);
  }


  @inline export function replace_lane(x: v512, idx: u8, value: i64): v512 {
    return v512.replace_lane<i64>(x, idx, value);
  }


  @inline export function add(a: v512, b: v512): v512 {
    return v512.add<i64>(a, b);
  }


  @inline export function sub(a: v512, b: v512): v512 {
    return v512.sub<i64>(a, b);
  }


  @inline export function mul(a: v512, b: v512): v512 {
    return v512.mul<i64>(a, b);
  }


  @inline export function abs(a: v512): v512 {
    return v512.abs<i64>(a);
  }


  @inline export function neg(a: v512): v512 {
    return v512.neg<i64>(a);
  }


  @inline export function shl(a: v512, b: i32): v512 {
    return v512.shl<i64>(a, b);
  }


  @inline export function shr_s(a: v512, b: i32): v512 {
    return v512.shr<i64>(a, b);
  }


  @inline export function shr_u(a: v512, b: i32): v512 {
    return v512.shr<u64>(a, b);
  }


  @inline export function all_true(a: v512): bool {
    return v512.all_true<i64>(a);
  }


  @inline export function bitmask(a: v512): u64 {
    return v512.bitmask<i64>(a);
  }


  @inline export function eq(a: v512, b: v512): v512 {
    return v512.eq<i64>(a, b);
  }


  @inline export function ne(a: v512, b: v512): v512 {
    return v512.ne<i64>(a, b);
  }


  @inline export function lt_s(a: v512, b: v512): v512 {
    return v512.lt<i64>(a, b);
  }


  @inline export function le_s(a: v512, b: v512): v512 {
    return v512.le<i64>(a, b);
  }


  @inline export function gt_s(a: v512, b: v512): v512 {
    return v512.gt<i64>(a, b);
  }


  @inline export function ge_s(a: v512, b: v512): v512 {
    return v512.ge<i64>(a, b);
  }


  @inline export function extend_low_i32x16_s(a: v512): v512 {
    return v512.extend_low<i32>(a);
  }


  @inline export function extend_low_i32x16_u(a: v512): v512 {
    return v512.extend_low<u32>(a);
  }


  @inline export function extend_high_i32x16_s(a: v512): v512 {
    return v512.extend_high<i32>(a);
  }


  @inline export function extend_high_i32x16_u(a: v512): v512 {
    return v512.extend_high<u32>(a);
  }


  @inline export function extmul_low_i32x16_s(a: v512, b: v512): v512 {
    return v512.extmul_low<i32>(a, b);
  }


  @inline export function extmul_low_i32x16_u(a: v512, b: v512): v512 {
    return v512.extmul_low<u32>(a, b);
  }


  @inline export function extmul_high_i32x16_s(a: v512, b: v512): v512 {
    return v512.extmul_high<i32>(a, b);
  }


  @inline export function extmul_high_i32x16_u(a: v512, b: v512): v512 {
    return v512.extmul_high<u32>(a, b);
  }


  @inline export function shuffle(
    a: v512,
    b: v512,
    l0: u8,
    l1: u8,
    l2: u8,
    l3: u8,
    l4: u8,
    l5: u8,
    l6: u8,
    l7: u8,
  ): v512 {
    return v512.shuffle<i64>(a, b, l0, l1, l2, l3, l4, l5, l6, l7);
  }


  @inline export function relaxed_laneselect(a: v512, b: v512, m: v512): v512 {
    return v512.relaxed_laneselect<i64>(a, b, m);
  }
}

export namespace f32x16 {

  @inline export function splat(x: f32): v512 {
    return v512.splat<f32>(x);
  }


  @inline export function extract_lane(x: v512, idx: u8): f32 {
    return v512.extract_lane<f32>(x, idx);
  }


  @inline export function replace_lane(x: v512, idx: u8, value: f32): v512 {
    return v512.replace_lane<f32>(x, idx, value);
  }


  @inline export function add(a: v512, b: v512): v512 {
    return v512.add<f32>(a, b);
  }


  @inline export function sub(a: v512, b: v512): v512 {
    return v512.sub<f32>(a, b);
  }


  @inline export function mul(a: v512, b: v512): v512 {
    return v512.mul<f32>(a, b);
  }


  @inline export function div(a: v512, b: v512): v512 {
    return v512.div<f32>(a, b);
  }


  @inline export function neg(a: v512): v512 {
    return v512.neg<f32>(a);
  }


  @inline export function abs(a: v512): v512 {
    return v512.abs<f32>(a);
  }


  @inline export function sqrt(a: v512): v512 {
    return v512.sqrt<f32>(a);
  }


  @inline export function ceil(a: v512): v512 {
    return v512.ceil<f32>(a);
  }


  @inline export function floor(a: v512): v512 {
    return v512.floor<f32>(a);
  }


  @inline export function trunc(a: v512): v512 {
    return v512.trunc<f32>(a);
  }


  @inline export function nearest(a: v512): v512 {
    return v512.nearest<f32>(a);
  }


  @inline export function min(a: v512, b: v512): v512 {
    return v512.min<f32>(a, b);
  }


  @inline export function max(a: v512, b: v512): v512 {
    return v512.max<f32>(a, b);
  }


  @inline export function pmin(a: v512, b: v512): v512 {
    return v512.pmin<f32>(a, b);
  }


  @inline export function pmax(a: v512, b: v512): v512 {
    return v512.pmax<f32>(a, b);
  }


  @inline export function eq(a: v512, b: v512): v512 {
    return v512.eq<f32>(a, b);
  }


  @inline export function ne(a: v512, b: v512): v512 {
    return v512.ne<f32>(a, b);
  }


  @inline export function lt(a: v512, b: v512): v512 {
    return v512.lt<f32>(a, b);
  }


  @inline export function le(a: v512, b: v512): v512 {
    return v512.le<f32>(a, b);
  }


  @inline export function gt(a: v512, b: v512): v512 {
    return v512.gt<f32>(a, b);
  }


  @inline export function ge(a: v512, b: v512): v512 {
    return v512.ge<f32>(a, b);
  }


  @inline export function convert_i32x16_s(a: v512): v512 {
    return v512.convert<i32>(a);
  }


  @inline export function convert_i32x16_u(a: v512): v512 {
    return v512.convert<u32>(a);
  }


  @inline export function demote_f64x8_zero(a: v512): v512 {
    return v512.demote_zero<f64>(a);
  }


  @inline export function shuffle(
    a: v512,
    b: v512,
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
  ): v512 {
    return v512.shuffle<f32>(
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


  @inline export function relaxed_madd(a: v512, b: v512, c: v512): v512 {
    return v512.relaxed_madd<f32>(a, b, c);
  }


  @inline export function relaxed_nmadd(a: v512, b: v512, c: v512): v512 {
    return v512.relaxed_nmadd<f32>(a, b, c);
  }


  @inline export function relaxed_min(a: v512, b: v512): v512 {
    return v512.relaxed_min<f32>(a, b);
  }


  @inline export function relaxed_max(a: v512, b: v512): v512 {
    return v512.relaxed_max<f32>(a, b);
  }
}

export namespace f64x8 {

  @inline export function splat(x: f64): v512 {
    return v512.splat<f64>(x);
  }


  @inline export function extract_lane(x: v512, idx: u8): f64 {
    return v512.extract_lane<f64>(x, idx);
  }


  @inline export function replace_lane(x: v512, idx: u8, value: f64): v512 {
    return v512.replace_lane<f64>(x, idx, value);
  }


  @inline export function add(a: v512, b: v512): v512 {
    return v512.add<f64>(a, b);
  }


  @inline export function sub(a: v512, b: v512): v512 {
    return v512.sub<f64>(a, b);
  }


  @inline export function mul(a: v512, b: v512): v512 {
    return v512.mul<f64>(a, b);
  }


  @inline export function div(a: v512, b: v512): v512 {
    return v512.div<f64>(a, b);
  }


  @inline export function neg(a: v512): v512 {
    return v512.neg<f64>(a);
  }


  @inline export function abs(a: v512): v512 {
    return v512.abs<f64>(a);
  }


  @inline export function sqrt(a: v512): v512 {
    return v512.sqrt<f64>(a);
  }


  @inline export function ceil(a: v512): v512 {
    return v512.ceil<f64>(a);
  }


  @inline export function floor(a: v512): v512 {
    return v512.floor<f64>(a);
  }


  @inline export function trunc(a: v512): v512 {
    return v512.trunc<f64>(a);
  }


  @inline export function nearest(a: v512): v512 {
    return v512.nearest<f64>(a);
  }


  @inline export function min(a: v512, b: v512): v512 {
    return v512.min<f64>(a, b);
  }


  @inline export function max(a: v512, b: v512): v512 {
    return v512.max<f64>(a, b);
  }


  @inline export function pmin(a: v512, b: v512): v512 {
    return v512.pmin<f64>(a, b);
  }


  @inline export function pmax(a: v512, b: v512): v512 {
    return v512.pmax<f64>(a, b);
  }


  @inline export function eq(a: v512, b: v512): v512 {
    return v512.eq<f64>(a, b);
  }


  @inline export function ne(a: v512, b: v512): v512 {
    return v512.ne<f64>(a, b);
  }


  @inline export function lt(a: v512, b: v512): v512 {
    return v512.lt<f64>(a, b);
  }


  @inline export function le(a: v512, b: v512): v512 {
    return v512.le<f64>(a, b);
  }


  @inline export function gt(a: v512, b: v512): v512 {
    return v512.gt<f64>(a, b);
  }


  @inline export function ge(a: v512, b: v512): v512 {
    return v512.ge<f64>(a, b);
  }


  @inline export function convert_low_i32x16_s(a: v512): v512 {
    return v512.convert_low<i32>(a);
  }


  @inline export function convert_low_i32x16_u(a: v512): v512 {
    return v512.convert_low<u32>(a);
  }


  @inline export function promote_low_f32x16(a: v512): v512 {
    return v512.promote_low<f32>(a);
  }


  @inline export function shuffle(
    a: v512,
    b: v512,
    l0: u8,
    l1: u8,
    l2: u8,
    l3: u8,
    l4: u8,
    l5: u8,
    l6: u8,
    l7: u8,
  ): v512 {
    return v512.shuffle<f64>(a, b, l0, l1, l2, l3, l4, l5, l6, l7);
  }


  @inline export function relaxed_madd(a: v512, b: v512, c: v512): v512 {
    return v512.relaxed_madd<f64>(a, b, c);
  }


  @inline export function relaxed_nmadd(a: v512, b: v512, c: v512): v512 {
    return v512.relaxed_nmadd<f64>(a, b, c);
  }


  @inline export function relaxed_min(a: v512, b: v512): v512 {
    return v512.relaxed_min<f64>(a, b);
  }


  @inline export function relaxed_max(a: v512, b: v512): v512 {
    return v512.relaxed_max<f64>(a, b);
  }
}

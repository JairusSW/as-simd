import { i8x8 } from "../64/i8x8";
import { expect, fuzz, FuzzSeed } from "as-test";

let state: u64 = 0;
let checkId: i32 = 0;

// @ts-expect-error: decorator
@inline function nextU32(): u32 {
  state += 0x9e3779b97f4a7c15;
  let z = state;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return <u32>(z ^ (z >> 31));
}

// @ts-expect-error: decorator
@inline function nextU64(): u64 {
  return (<u64>nextU32() << 32) | <u64>nextU32();
}

// @ts-expect-error: decorator
@inline function get8(x: u64, i: i32): u8 {
  return <u8>((x >> (i * 8)) & 0xff);
}

// @ts-expect-error: decorator
@inline function get8s(x: u64, i: i32): i8 {
  return <i8>get8(x, i);
}

// @ts-expect-error: decorator
@inline function set8(x: u64, i: i32, v: u8): u64 {
  const shift = i * 8;
  const mask = (<u64>0xff) << shift;
  return (x & ~mask) | ((<u64>v) << shift);
}

// @ts-expect-error: decorator
@inline function pack8(
  a0: u8, a1: u8, a2: u8, a3: u8,
  a4: u8, a5: u8, a6: u8, a7: u8,
): u64 {
  return (<u64>a0)
    | (<u64>a1 << 8)
    | (<u64>a2 << 16)
    | (<u64>a3 << 24)
    | (<u64>a4 << 32)
    | (<u64>a5 << 40)
    | (<u64>a6 << 48)
    | (<u64>a7 << 56);
}

// @ts-expect-error: decorator
@inline function satS(x: i16): i8 {
  return x > 127 ? 127 : (x < -128 ? -128 : <i8>x);
}

// @ts-expect-error: decorator
@inline function satU(x: i16): u8 {
  return x < 0 ? 0 : (x > 255 ? 255 : <u8>x);
}

// @ts-expect-error: decorator
@inline function pop8(x: u8): u8 {
  let c: u8 = 0;
  let v = x;
  while (v) {
    c += v & 1;
    v >>= 1;
  }
  return c;
}

// @ts-expect-error: decorator
@inline function check64(actual: u64, expected: u64): bool {
  if (actual != expected) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

// @ts-expect-error: decorator
@inline function check32(actual: i32, expected: i32): bool {
  if (actual != expected) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

// @ts-expect-error: decorator
@inline function checkBool(actual: bool, expected: bool): bool {
  if (actual != expected) {
    expect<i32>(checkId).toBe(0);
    return false;
  }
  checkId++;
  return true;
}

function ref_splat(x: i8): u64 {
  const u = <u8>x;
  return pack8(u, u, u, u, u, u, u, u);
}

function ref_extract_lane_s(x: u64, idx: u8): i8 {
  return get8s(x, <i32>(idx & 7));
}

function ref_extract_lane_u(x: u64, idx: u8): u8 {
  return get8(x, <i32>(idx & 7));
}

function ref_replace_lane(x: u64, idx: u8, value: i8): u64 {
  return set8(x, <i32>(idx & 7), <u8>value);
}

function ref_add(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(get8(a, i) + get8(b, i)));
  return out;
}

function ref_sub(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(get8(a, i) - get8(b, i)));
  return out;
}

function ref_mul(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(get8(a, i) * get8(b, i)));
  return out;
}

function ref_min_s(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const ai = get8s(a, i);
    const bi = get8s(b, i);
    out = set8(out, i, <u8>(ai < bi ? ai : bi));
  }
  return out;
}

function ref_min_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const ai = get8(a, i);
    const bi = get8(b, i);
    out = set8(out, i, ai < bi ? ai : bi);
  }
  return out;
}

function ref_max_s(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const ai = get8s(a, i);
    const bi = get8s(b, i);
    out = set8(out, i, <u8>(ai > bi ? ai : bi));
  }
  return out;
}

function ref_max_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const ai = get8(a, i);
    const bi = get8(b, i);
    out = set8(out, i, ai > bi ? ai : bi);
  }
  return out;
}

function ref_avgr_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const ai = <u16>get8(a, i);
    const bi = <u16>get8(b, i);
    out = set8(out, i, <u8>((ai + bi + 1) >> 1));
  }
  return out;
}

function ref_abs(a: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const ai = get8s(a, i);
    out = set8(out, i, <u8>(ai < 0 ? -ai : ai));
  }
  return out;
}

function ref_neg(a: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(-get8s(a, i)));
  return out;
}

function ref_add_sat_s(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const s = <i16>get8s(a, i) + <i16>get8s(b, i);
    out = set8(out, i, <u8>satS(s));
  }
  return out;
}

function ref_add_sat_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const s = <u16>get8(a, i) + <u16>get8(b, i);
    out = set8(out, i, <u8>(s > 255 ? 255 : s));
  }
  return out;
}

function ref_sub_sat_s(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const d = <i16>get8s(a, i) - <i16>get8s(b, i);
    out = set8(out, i, <u8>satS(d));
  }
  return out;
}

function ref_sub_sat_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const ai = get8(a, i);
    const bi = get8(b, i);
    out = set8(out, i, ai >= bi ? <u8>(ai - bi) : 0);
  }
  return out;
}

function ref_shl(a: u64, b: i32): u64 {
  const s = b & 7;
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(<u32>get8(a, i) << <u32>s));
  return out;
}

function ref_shr_s(a: u64, b: i32): u64 {
  const s = b & 7;
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(<i32>get8s(a, i) >> s));
  return out;
}

function ref_shr_u(a: u64, b: i32): u64 {
  const s = b & 7;
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, <u8>(<u32>get8(a, i) >> <u32>s));
  return out;
}

function ref_all_true(a: u64): bool {
  for (let i = 0; i < 8; i++) if (get8(a, i) == 0) return false;
  return true;
}

function ref_bitmask(a: u64): i32 {
  let m: i32 = 0;
  for (let i = 0; i < 8; i++) m |= (<i32>((get8(a, i) >> 7) & 1)) << i;
  return m;
}

function ref_popcnt(a: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, pop8(get8(a, i)));
  return out;
}

function ref_cmp_mask(pred: bool): u8 {
  return pred ? 0xff : 0;
}

function ref_eq(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8(a, i) == get8(b, i)));
  return out;
}

function ref_ne(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8(a, i) != get8(b, i)));
  return out;
}

function ref_lt_s(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8s(a, i) < get8s(b, i)));
  return out;
}

function ref_lt_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8(a, i) < get8(b, i)));
  return out;
}

function ref_le_s(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8s(a, i) <= get8s(b, i)));
  return out;
}

function ref_le_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8(a, i) <= get8(b, i)));
  return out;
}

function ref_gt_s(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8s(a, i) > get8s(b, i)));
  return out;
}

function ref_gt_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8(a, i) > get8(b, i)));
  return out;
}

function ref_ge_s(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8s(a, i) >= get8s(b, i)));
  return out;
}

function ref_ge_u(a: u64, b: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, ref_cmp_mask(get8(a, i) >= get8(b, i)));
  return out;
}

// @ts-expect-error: decorator
@inline function get16s(x: u64, i: i32): i16 {
  return <i16>((x >> (i * 16)) & 0xffff);
}

function ref_narrow_i16x4_s(a: u64, b: u64): u64 {
  return pack8(
    <u8>satS(get16s(a, 0)),
    <u8>satS(get16s(a, 1)),
    <u8>satS(get16s(a, 2)),
    <u8>satS(get16s(a, 3)),
    <u8>satS(get16s(b, 0)),
    <u8>satS(get16s(b, 1)),
    <u8>satS(get16s(b, 2)),
    <u8>satS(get16s(b, 3)),
  );
}

function ref_narrow_i16x4_u(a: u64, b: u64): u64 {
  return pack8(
    satU(get16s(a, 0)),
    satU(get16s(a, 1)),
    satU(get16s(a, 2)),
    satU(get16s(a, 3)),
    satU(get16s(b, 0)),
    satU(get16s(b, 1)),
    satU(get16s(b, 2)),
    satU(get16s(b, 3)),
  );
}

function ref_shuffle(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const lanes = [l0, l1, l2, l3, l4, l5, l6, l7];
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const l = lanes[i] & 15;
    const src = l < 8 ? a : b;
    out = set8(out, i, get8(src, <i32>(l & 7)));
  }
  return out;
}

function ref_swizzle(a: u64, s: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const idx = get8(s, i);
    out = set8(out, i, idx < 8 ? get8(a, <i32>idx) : 0);
  }
  return out;
}

function ref_relaxed_swizzle(a: u64, s: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) out = set8(out, i, get8(a, <i32>(get8(s, i) & 7)));
  return out;
}

function ref_relaxed_laneselect(a: u64, b: u64, m: u64): u64 {
  let out: u64 = 0;
  for (let i = 0; i < 8; i++) {
    const selA = (get8(m, i) & 0x80) != 0;
    out = set8(out, i, selA ? get8(a, i) : get8(b, i));
  }
  return out;
}

fuzz("i8x8 scalar reference parity", (seedValue: i32): bool => {
  state = <u64>seedValue;
  const a = nextU64();
  const b = nextU64();
  const c = nextU64();
  const d = nextU64();
  const s = nextU64();
  const m = nextU64();
  const idx = <u8>(nextU32() & 7);
  const shift = <i32>(nextU32() & 31);
  const laneVal = <i8>nextU32();

  const l0 = <u8>(nextU32() & 15);
  const l1 = <u8>(nextU32() & 15);
  const l2 = <u8>(nextU32() & 15);
  const l3 = <u8>(nextU32() & 15);
  const l4 = <u8>(nextU32() & 15);
  const l5 = <u8>(nextU32() & 15);
  const l6 = <u8>(nextU32() & 15);
  const l7 = <u8>(nextU32() & 15);

  checkId = 1;

  if (!check64(i8x8.splat(laneVal), ref_splat(laneVal))) return false;
  if (!check32(i8x8.extract_lane_s(a, idx), ref_extract_lane_s(a, idx))) return false;
  if (!check32(i8x8.extract_lane_u(a, idx), ref_extract_lane_u(a, idx))) return false;
  if (!check64(i8x8.replace_lane(a, idx, laneVal), ref_replace_lane(a, idx, laneVal))) return false;
  if (!check64(i8x8.add(a, b), ref_add(a, b))) return false;
  if (!check64(i8x8.sub(a, b), ref_sub(a, b))) return false;
  if (!check64(i8x8.mul(a, b), ref_mul(a, b))) return false;
  if (!check64(i8x8.min_s(a, b), ref_min_s(a, b))) return false;
  if (!check64(i8x8.min_u(a, b), ref_min_u(a, b))) return false;
  if (!check64(i8x8.max_s(a, b), ref_max_s(a, b))) return false;
  if (!check64(i8x8.max_u(a, b), ref_max_u(a, b))) return false;
  if (!check64(i8x8.avgr_u(a, b), ref_avgr_u(a, b))) return false;
  if (!check64(i8x8.abs(a), ref_abs(a))) return false;
  if (!check64(i8x8.neg(a), ref_neg(a))) return false;
  if (!check64(i8x8.add_sat_s(a, b), ref_add_sat_s(a, b))) return false;
  if (!check64(i8x8.add_sat_u(a, b), ref_add_sat_u(a, b))) return false;
  if (!check64(i8x8.sub_sat_s(a, b), ref_sub_sat_s(a, b))) return false;
  if (!check64(i8x8.sub_sat_u(a, b), ref_sub_sat_u(a, b))) return false;
  if (!check64(i8x8.shl(a, shift), ref_shl(a, shift))) return false;
  if (!check64(i8x8.shr_s(a, shift), ref_shr_s(a, shift))) return false;
  if (!check64(i8x8.shr_u(a, shift), ref_shr_u(a, shift))) return false;
  if (!checkBool(i8x8.all_true(a), ref_all_true(a))) return false;
  if (!check32(i8x8.bitmask(a), ref_bitmask(a))) return false;
  if (!check64(i8x8.popcnt(a), ref_popcnt(a))) return false;
  if (!check64(i8x8.eq(a, b), ref_eq(a, b))) return false;
  if (!check64(i8x8.ne(a, b), ref_ne(a, b))) return false;
  if (!check64(i8x8.lt_s(a, b), ref_lt_s(a, b))) return false;
  if (!check64(i8x8.lt_u(a, b), ref_lt_u(a, b))) return false;
  if (!check64(i8x8.le_s(a, b), ref_le_s(a, b))) return false;
  if (!check64(i8x8.le_u(a, b), ref_le_u(a, b))) return false;
  if (!check64(i8x8.gt_s(a, b), ref_gt_s(a, b))) return false;
  if (!check64(i8x8.gt_u(a, b), ref_gt_u(a, b))) return false;
  if (!check64(i8x8.ge_s(a, b), ref_ge_s(a, b))) return false;
  if (!check64(i8x8.ge_u(a, b), ref_ge_u(a, b))) return false;
  if (!check64(i8x8.narrow_i16x4_s(c, d), ref_narrow_i16x4_s(c, d))) return false;
  if (!check64(i8x8.narrow_i16x4_u(c, d), ref_narrow_i16x4_u(c, d))) return false;
  if (!check64(i8x8.shuffle(a, b, l0, l1, l2, l3, l4, l5, l6, l7), ref_shuffle(a, b, l0, l1, l2, l3, l4, l5, l6, l7))) return false;
  if (!check64(i8x8.swizzle(a, s), ref_swizzle(a, s))) return false;
  if (!check64(i8x8.relaxed_swizzle(a, s), ref_relaxed_swizzle(a, s))) return false;
  if (!check64(i8x8.relaxed_laneselect(a, b, m), ref_relaxed_laneselect(a, b, m))) return false;

  return true;
}).generate((seed: FuzzSeed, run: (seedValue: i32) => bool): void => {
  run(<i32>seed.u32());
});

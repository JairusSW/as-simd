import { i8x8 } from "../../v64/i8x8";
import { bench, blackbox, dumpToFile } from "../lib/bench";

const OPS: u64 = 25_000_000;

let s0: u64 = 0x0123456789abcdef;
let s1: u64 = 0x8899aabbccddeeff;
let s2: u64 = 0xfedcba9876543210;
let s3: u64 = 0x7766554433221100;

// @ts-expect-error: decorator
@inline function next64(x: u64): u64 {
  x ^= x << 13;
  x ^= x >> 7;
  x ^= x << 17;
  return x;
}

// @ts-expect-error: decorator
@inline function nextA(): u64 {
  s0 = next64(s0);
  s2 = next64(s2);
  return blackbox(s0 ^ (s2 >> 17));
}

// @ts-expect-error: decorator
@inline function nextB(): u64 {
  s1 = next64(s1);
  s3 = next64(s3);
  return blackbox(s1 ^ (s3 << 13));
}

// @ts-expect-error: decorator
@inline function nextLane16(): u8 {
  return <u8>(nextA() & 15);
}

// @ts-expect-error: decorator
@inline function pack8(
  b0: u64, b1: u64, b2: u64, b3: u64,
  b4: u64, b5: u64, b6: u64, b7: u64,
): u64 {
  return b0 | (b1 << 8) | (b2 << 16) | (b3 << 24) | (b4 << 32) | (b5 << 40) | (b6 << 48) | (b7 << 56);
}

// @ts-expect-error: decorator
@inline function zero_mask(x: u64): u64 {
  return ((~(((x & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) & 0x8080808080808080) & ~x & 0x8080808080808080) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function byte_at(x: u64, idx: u8): u64 {
  return (x >> ((idx as u64) << 3)) & 0xff;
}

// @ts-expect-error: decorator
@inline function ge8_mask_byte(l: u8): u64 {
  return (<u64>((<i32>l << 28) >> 31)) & 0xff;
}

// baseline (current library implementation)
// @ts-expect-error: decorator
@inline function shuffle_base(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  return i8x8.shuffle(a, b, l0, l1, l2, l3, l4, l5, l6, l7);
}

// direct gather + select
// @ts-expect-error: decorator
@inline function shuffle_select(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const i0 = l0 & 7, i1 = l1 & 7, i2 = l2 & 7, i3 = l3 & 7, i4 = l4 & 7, i5 = l5 & 7, i6 = l6 & 7, i7 = l7 & 7;
  const a0 = byte_at(a, i0), a1 = byte_at(a, i1), a2 = byte_at(a, i2), a3 = byte_at(a, i3);
  const a4 = byte_at(a, i4), a5 = byte_at(a, i5), a6 = byte_at(a, i6), a7 = byte_at(a, i7);
  const b0 = byte_at(b, i0), b1 = byte_at(b, i1), b2 = byte_at(b, i2), b3 = byte_at(b, i3);
  const b4 = byte_at(b, i4), b5 = byte_at(b, i5), b6 = byte_at(b, i6), b7 = byte_at(b, i7);
  return pack8(
    select(b0, a0, l0 < 8), select(b1, a1, l1 < 8), select(b2, a2, l2 < 8), select(b3, a3, l3 < 8),
    select(b4, a4, l4 < 8), select(b5, a5, l5 < 8), select(b6, a6, l6 < 8), select(b7, a7, l7 < 8),
  );
}

// direct gather + select, with extraction inlined (no helper calls)
// @ts-expect-error: decorator
@inline function shuffle_inline(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const i0 = (l0 & 7) as u64, i1 = (l1 & 7) as u64, i2 = (l2 & 7) as u64, i3 = (l3 & 7) as u64;
  const i4 = (l4 & 7) as u64, i5 = (l5 & 7) as u64, i6 = (l6 & 7) as u64, i7 = (l7 & 7) as u64;

  const a0 = (a >> (i0 << 3)) & 0xff, a1 = (a >> (i1 << 3)) & 0xff, a2 = (a >> (i2 << 3)) & 0xff, a3 = (a >> (i3 << 3)) & 0xff;
  const a4 = (a >> (i4 << 3)) & 0xff, a5 = (a >> (i5 << 3)) & 0xff, a6 = (a >> (i6 << 3)) & 0xff, a7 = (a >> (i7 << 3)) & 0xff;
  const b0 = (b >> (i0 << 3)) & 0xff, b1 = (b >> (i1 << 3)) & 0xff, b2 = (b >> (i2 << 3)) & 0xff, b3 = (b >> (i3 << 3)) & 0xff;
  const b4 = (b >> (i4 << 3)) & 0xff, b5 = (b >> (i5 << 3)) & 0xff, b6 = (b >> (i6 << 3)) & 0xff, b7 = (b >> (i7 << 3)) & 0xff;

  return pack8(
    select(b0, a0, l0 < 8), select(b1, a1, l1 < 8), select(b2, a2, l2 < 8), select(b3, a3, l3 < 8),
    select(b4, a4, l4 < 8), select(b5, a5, l5 < 8), select(b6, a6, l6 < 8), select(b7, a7, l7 < 8),
  );
}

// direct gather + ternary blend
// @ts-expect-error: decorator
@inline function shuffle_ternary(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const i0 = (l0 & 7) as u64, i1 = (l1 & 7) as u64, i2 = (l2 & 7) as u64, i3 = (l3 & 7) as u64;
  const i4 = (l4 & 7) as u64, i5 = (l5 & 7) as u64, i6 = (l6 & 7) as u64, i7 = (l7 & 7) as u64;

  const a0 = (a >> (i0 << 3)) & 0xff, a1 = (a >> (i1 << 3)) & 0xff, a2 = (a >> (i2 << 3)) & 0xff, a3 = (a >> (i3 << 3)) & 0xff;
  const a4 = (a >> (i4 << 3)) & 0xff, a5 = (a >> (i5 << 3)) & 0xff, a6 = (a >> (i6 << 3)) & 0xff, a7 = (a >> (i7 << 3)) & 0xff;
  const b0 = (b >> (i0 << 3)) & 0xff, b1 = (b >> (i1 << 3)) & 0xff, b2 = (b >> (i2 << 3)) & 0xff, b3 = (b >> (i3 << 3)) & 0xff;
  const b4 = (b >> (i4 << 3)) & 0xff, b5 = (b >> (i5 << 3)) & 0xff, b6 = (b >> (i6 << 3)) & 0xff, b7 = (b >> (i7 << 3)) & 0xff;

  return pack8(
    l0 < 8 ? a0 : b0, l1 < 8 ? a1 : b1, l2 < 8 ? a2 : b2, l3 < 8 ? a3 : b3,
    l4 < 8 ? a4 : b4, l5 < 8 ? a5 : b5, l6 < 8 ? a6 : b6, l7 < 8 ? a7 : b7,
  );
}

// direct gather + select with precomputed flags
// @ts-expect-error: decorator
@inline function shuffle_select_flags(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const f0 = l0 < 8, f1 = l1 < 8, f2 = l2 < 8, f3 = l3 < 8, f4 = l4 < 8, f5 = l5 < 8, f6 = l6 < 8, f7 = l7 < 8;
  const i0 = (l0 & 7) as u64, i1 = (l1 & 7) as u64, i2 = (l2 & 7) as u64, i3 = (l3 & 7) as u64;
  const i4 = (l4 & 7) as u64, i5 = (l5 & 7) as u64, i6 = (l6 & 7) as u64, i7 = (l7 & 7) as u64;

  const a0 = (a >> (i0 << 3)) & 0xff, a1 = (a >> (i1 << 3)) & 0xff, a2 = (a >> (i2 << 3)) & 0xff, a3 = (a >> (i3 << 3)) & 0xff;
  const a4 = (a >> (i4 << 3)) & 0xff, a5 = (a >> (i5 << 3)) & 0xff, a6 = (a >> (i6 << 3)) & 0xff, a7 = (a >> (i7 << 3)) & 0xff;
  const b0 = (b >> (i0 << 3)) & 0xff, b1 = (b >> (i1 << 3)) & 0xff, b2 = (b >> (i2 << 3)) & 0xff, b3 = (b >> (i3 << 3)) & 0xff;
  const b4 = (b >> (i4 << 3)) & 0xff, b5 = (b >> (i5 << 3)) & 0xff, b6 = (b >> (i6 << 3)) & 0xff, b7 = (b >> (i7 << 3)) & 0xff;

  return pack8(
    select(a0, b0, f0), select(a1, b1, f1), select(a2, b2, f2), select(a3, b3, f3),
    select(a4, b4, f4), select(a5, b5, f5), select(a6, b6, f6), select(a7, b7, f7),
  );
}

// direct gather + select, with index math fully inlined
// @ts-expect-error: decorator
@inline function shuffle_inline_noidx(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const a0 = (a >> ((((l0 as u64) & 7) << 3))) & 0xff, a1 = (a >> ((((l1 as u64) & 7) << 3))) & 0xff;
  const a2 = (a >> ((((l2 as u64) & 7) << 3))) & 0xff, a3 = (a >> ((((l3 as u64) & 7) << 3))) & 0xff;
  const a4 = (a >> ((((l4 as u64) & 7) << 3))) & 0xff, a5 = (a >> ((((l5 as u64) & 7) << 3))) & 0xff;
  const a6 = (a >> ((((l6 as u64) & 7) << 3))) & 0xff, a7 = (a >> ((((l7 as u64) & 7) << 3))) & 0xff;

  const b0 = (b >> ((((l0 as u64) & 7) << 3))) & 0xff, b1 = (b >> ((((l1 as u64) & 7) << 3))) & 0xff;
  const b2 = (b >> ((((l2 as u64) & 7) << 3))) & 0xff, b3 = (b >> ((((l3 as u64) & 7) << 3))) & 0xff;
  const b4 = (b >> ((((l4 as u64) & 7) << 3))) & 0xff, b5 = (b >> ((((l5 as u64) & 7) << 3))) & 0xff;
  const b6 = (b >> ((((l6 as u64) & 7) << 3))) & 0xff, b7 = (b >> ((((l7 as u64) & 7) << 3))) & 0xff;

  return pack8(
    select(a0, b0, l0 < 8), select(a1, b1, l1 < 8), select(a2, b2, l2 < 8), select(a3, b3, l3 < 8),
    select(a4, b4, l4 < 8), select(a5, b5, l5 < 8), select(a6, b6, l6 < 8), select(a7, b7, l7 < 8),
  );
}

// direct gather + select, precomputing shift amounts
// @ts-expect-error: decorator
@inline function shuffle_inline_shifts(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const s0 = (((l0 as u64) << 3) & 56), s1 = (((l1 as u64) << 3) & 56), s2 = (((l2 as u64) << 3) & 56), s3 = (((l3 as u64) << 3) & 56);
  const s4 = (((l4 as u64) << 3) & 56), s5 = (((l5 as u64) << 3) & 56), s6 = (((l6 as u64) << 3) & 56), s7 = (((l7 as u64) << 3) & 56);

  const a0 = (a >> s0) & 0xff, a1 = (a >> s1) & 0xff, a2 = (a >> s2) & 0xff, a3 = (a >> s3) & 0xff;
  const a4 = (a >> s4) & 0xff, a5 = (a >> s5) & 0xff, a6 = (a >> s6) & 0xff, a7 = (a >> s7) & 0xff;
  const b0 = (b >> s0) & 0xff, b1 = (b >> s1) & 0xff, b2 = (b >> s2) & 0xff, b3 = (b >> s3) & 0xff;
  const b4 = (b >> s4) & 0xff, b5 = (b >> s5) & 0xff, b6 = (b >> s6) & 0xff, b7 = (b >> s7) & 0xff;

  return pack8(
    select(a0, b0, l0 < 8), select(a1, b1, l1 < 8), select(a2, b2, l2 < 8), select(a3, b3, l3 < 8),
    select(a4, b4, l4 < 8), select(a5, b5, l5 < 8), select(a6, b6, l6 < 8), select(a7, b7, l7 < 8),
  );
}

// select source first, then gather one byte from that source
// @ts-expect-error: decorator
@inline function shuffle_select_src(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const i0 = (l0 & 7) as u64, i1 = (l1 & 7) as u64, i2 = (l2 & 7) as u64, i3 = (l3 & 7) as u64;
  const i4 = (l4 & 7) as u64, i5 = (l5 & 7) as u64, i6 = (l6 & 7) as u64, i7 = (l7 & 7) as u64;
  const s0 = select<u64>(a, b, l0 < 8), s1 = select<u64>(a, b, l1 < 8), s2 = select<u64>(a, b, l2 < 8), s3 = select<u64>(a, b, l3 < 8);
  const s4 = select<u64>(a, b, l4 < 8), s5 = select<u64>(a, b, l5 < 8), s6 = select<u64>(a, b, l6 < 8), s7 = select<u64>(a, b, l7 < 8);
  return pack8(
    (s0 >> (i0 << 3)) & 0xff, (s1 >> (i1 << 3)) & 0xff, (s2 >> (i2 << 3)) & 0xff, (s3 >> (i3 << 3)) & 0xff,
    (s4 >> (i4 << 3)) & 0xff, (s5 >> (i5 << 3)) & 0xff, (s6 >> (i6 << 3)) & 0xff, (s7 >> (i7 << 3)) & 0xff,
  );
}

// direct gather + arithmetic blend mask (no select in hot blend)
// @ts-expect-error: decorator
@inline function shuffle_mask(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const i0 = l0 & 7, i1 = l1 & 7, i2 = l2 & 7, i3 = l3 & 7, i4 = l4 & 7, i5 = l5 & 7, i6 = l6 & 7, i7 = l7 & 7;
  const m0 = ge8_mask_byte(l0), m1 = ge8_mask_byte(l1), m2 = ge8_mask_byte(l2), m3 = ge8_mask_byte(l3);
  const m4 = ge8_mask_byte(l4), m5 = ge8_mask_byte(l5), m6 = ge8_mask_byte(l6), m7 = ge8_mask_byte(l7);
  const o0 = (byte_at(a, i0) & ~m0) | (byte_at(b, i0) & m0);
  const o1 = (byte_at(a, i1) & ~m1) | (byte_at(b, i1) & m1);
  const o2 = (byte_at(a, i2) & ~m2) | (byte_at(b, i2) & m2);
  const o3 = (byte_at(a, i3) & ~m3) | (byte_at(b, i3) & m3);
  const o4 = (byte_at(a, i4) & ~m4) | (byte_at(b, i4) & m4);
  const o5 = (byte_at(a, i5) & ~m5) | (byte_at(b, i5) & m5);
  const o6 = (byte_at(a, i6) & ~m6) | (byte_at(b, i6) & m6);
  const o7 = (byte_at(a, i7) & ~m7) | (byte_at(b, i7) & m7);
  return pack8(o0, o1, o2, o3, o4, o5, o6, o7);
}

// packed-lane SWAR pre-processing:
// - all (l < 8) checks in one op
// - all (l & 7) masks in one op
// @ts-expect-error: decorator
@inline function shuffle_batch(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const lanes = pack8(l0 as u64, l1 as u64, l2 as u64, l3 as u64, l4 as u64, l5 as u64, l6 as u64, l7 as u64);
  const idx = lanes & 0x0707070707070707;
  const keepA = zero_mask(lanes & 0xf8f8f8f8f8f8f8f8);

  const i0 = (idx & 0xff) as u64, i1 = ((idx >> 8) & 0xff) as u64, i2 = ((idx >> 16) & 0xff) as u64, i3 = ((idx >> 24) & 0xff) as u64;
  const i4 = ((idx >> 32) & 0xff) as u64, i5 = ((idx >> 40) & 0xff) as u64, i6 = ((idx >> 48) & 0xff) as u64, i7 = ((idx >> 56) & 0xff) as u64;

  const a0 = (a >> (i0 << 3)) & 0xff, a1 = (a >> (i1 << 3)) & 0xff, a2 = (a >> (i2 << 3)) & 0xff, a3 = (a >> (i3 << 3)) & 0xff;
  const a4 = (a >> (i4 << 3)) & 0xff, a5 = (a >> (i5 << 3)) & 0xff, a6 = (a >> (i6 << 3)) & 0xff, a7 = (a >> (i7 << 3)) & 0xff;
  const b0 = (b >> (i0 << 3)) & 0xff, b1 = (b >> (i1 << 3)) & 0xff, b2 = (b >> (i2 << 3)) & 0xff, b3 = (b >> (i3 << 3)) & 0xff;
  const b4 = (b >> (i4 << 3)) & 0xff, b5 = (b >> (i5 << 3)) & 0xff, b6 = (b >> (i6 << 3)) & 0xff, b7 = (b >> (i7 << 3)) & 0xff;

  const outA = pack8(a0, a1, a2, a3, a4, a5, a6, a7);
  const outB = pack8(b0, b1, b2, b3, b4, b5, b6, b7);
  return (outA & keepA) | (outB & ~keepA);
}

// strict SWAR-only shape:
// - pack lane controls once
// - sanitize all lanes in parallel (idx & 7)
// - build all validity masks in parallel (idx < 8)
// - branchless whole-word blend
// @ts-expect-error: decorator
@inline function relaxed_swizzle_swar(a: u64, idx: u64): u64 {
  const i0 = (idx & 0xff) as u64, i1 = ((idx >> 8) & 0xff) as u64, i2 = ((idx >> 16) & 0xff) as u64, i3 = ((idx >> 24) & 0xff) as u64;
  const i4 = ((idx >> 32) & 0xff) as u64, i5 = ((idx >> 40) & 0xff) as u64, i6 = ((idx >> 48) & 0xff) as u64, i7 = ((idx >> 56) & 0xff) as u64;
  return pack8(
    (a >> (i0 << 3)) & 0xff, (a >> (i1 << 3)) & 0xff, (a >> (i2 << 3)) & 0xff, (a >> (i3 << 3)) & 0xff,
    (a >> (i4 << 3)) & 0xff, (a >> (i5 << 3)) & 0xff, (a >> (i6 << 3)) & 0xff, (a >> (i7 << 3)) & 0xff,
  );
}

// @ts-expect-error: decorator
@inline function shuffle_swar_only(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const lanes = pack8(l0 as u64, l1 as u64, l2 as u64, l3 as u64, l4 as u64, l5 as u64, l6 as u64, l7 as u64);
  const idx = lanes & 0x0707070707070707;
  const keepA = zero_mask(lanes & 0xf8f8f8f8f8f8f8f8);
  const outA = relaxed_swizzle_swar(a, idx);
  const outB = relaxed_swizzle_swar(b, idx);
  return (outA & keepA) | (outB & ~keepA);
}

// packed SWAR controls + library relaxed swizzle
// @ts-expect-error: decorator
@inline function shuffle_swar_lib(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const lanes = pack8(l0 as u64, l1 as u64, l2 as u64, l3 as u64, l4 as u64, l5 as u64, l6 as u64, l7 as u64);
  const idx = lanes & 0x0707070707070707;
  const keepA = zero_mask(lanes & 0xf8f8f8f8f8f8f8f8);
  const outA = i8x8.relaxed_swizzle(a, idx);
  const outB = i8x8.relaxed_swizzle(b, idx);
  return (outA & keepA) | (outB & ~keepA);
}

// compact loop gather
// @ts-expect-error: decorator
@inline function shuffle_loop(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  let out: u64 = 0;
  const lanes = pack8(l0 as u64, l1 as u64, l2 as u64, l3 as u64, l4 as u64, l5 as u64, l6 as u64, l7 as u64);
  for (let i = 0; i < 8; i++) {
    const l = ((lanes >> (<u64>i << 3)) & 0xff) as u8;
    const src = select(a, b, l < 8);
    out |= ((src >> (((l & 7) as u64) << 3)) & 0xff) << (<u64>i << 3);
  }
  return out;
}

// via two relaxed_swizzle gathers + lane-select blend
// @ts-expect-error: decorator
@inline function shuffle_swizzle_blend(a: u64, b: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8): u64 {
  const idx = pack8(
    (l0 & 7) as u64, (l1 & 7) as u64, (l2 & 7) as u64, (l3 & 7) as u64,
    (l4 & 7) as u64, (l5 & 7) as u64, (l6 & 7) as u64, (l7 & 7) as u64,
  );
  const mask = pack8(
    select<u64>(0, 0x80, l0 < 8), select<u64>(0, 0x80, l1 < 8), select<u64>(0, 0x80, l2 < 8), select<u64>(0, 0x80, l3 < 8),
    select<u64>(0, 0x80, l4 < 8), select<u64>(0, 0x80, l5 < 8), select<u64>(0, 0x80, l6 < 8), select<u64>(0, 0x80, l7 < 8),
  );
  const av = i8x8.relaxed_swizzle(a, idx);
  const bv = i8x8.relaxed_swizzle(b, idx);
  return i8x8.relaxed_laneselect(av, bv, mask);
}

bench("shuffle.base", () => {
  blackbox(shuffle_base(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "base");

bench("shuffle.select", () => {
  blackbox(shuffle_select(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "select");

bench("shuffle.inline", () => {
  blackbox(shuffle_inline(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "inline");

bench("shuffle.ternary", () => {
  blackbox(shuffle_ternary(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "ternary");

bench("shuffle.select-flags", () => {
  blackbox(shuffle_select_flags(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "select-flags");

bench("shuffle.inline-noidx", () => {
  blackbox(shuffle_inline_noidx(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "inline-noidx");

bench("shuffle.inline-shifts", () => {
  blackbox(shuffle_inline_shifts(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "inline-shifts");

bench("shuffle.select-src", () => {
  blackbox(shuffle_select_src(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "select-src");

bench("shuffle.batch", () => {
  blackbox(shuffle_batch(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "batch");

bench("shuffle.swar-only", () => {
  blackbox(shuffle_swar_only(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "swar-only");

bench("shuffle.swar-lib", () => {
  blackbox(shuffle_swar_lib(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "swar-lib");

bench("shuffle.loop", () => {
  blackbox(shuffle_loop(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "loop");

bench("shuffle.mask", () => {
  blackbox(shuffle_mask(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "mask");

bench("shuffle.swizzle-blend", () => {
  blackbox(shuffle_swizzle_blend(
    nextA(), nextB(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
    nextLane16(), nextLane16(), nextLane16(), nextLane16(),
  ));
}, OPS, 16);
dumpToFile("shuffle-comp", "swizzle-blend");

let __as_simd_i8x16_hi: u64 = 0;

export function i8x16_swar(
  a0: i8, a1: i8, a2: i8, a3: i8,
  a4: i8, a5: i8, a6: i8, a7: i8,
  a8: i8, a9: i8, a10: i8, a11: i8,
  a12: i8, a13: i8, a14: i8, a15: i8,
): u64 {
  const lo =
    (a0 as u8 as u64) |
    ((a1 as u8 as u64) << 8) |
    ((a2 as u8 as u64) << 16) |
    ((a3 as u8 as u64) << 24) |
    ((a4 as u8 as u64) << 32) |
    ((a5 as u8 as u64) << 40) |
    ((a6 as u8 as u64) << 48) |
    ((a7 as u8 as u64) << 56);
  const hi =
    (a8 as u8 as u64) |
    ((a9 as u8 as u64) << 8) |
    ((a10 as u8 as u64) << 16) |
    ((a11 as u8 as u64) << 24) |
    ((a12 as u8 as u64) << 32) |
    ((a13 as u8 as u64) << 40) |
    ((a14 as u8 as u64) << 48) |
    ((a15 as u8 as u64) << 56);
  __as_simd_i8x16_hi = hi;
  return lo;
}

export namespace i8x16_swar {
  /** Returns the high 64 bits produced by the most recent `i8x16_swar` operation. */
  // @ts-expect-error: decorator
  @inline export function take_hi(): u64 { return __as_simd_i8x16_hi; }
  // @ts-expect-error: decorator
  @inline function set_pair(lo: u64, hi: u64): u64 {
    __as_simd_i8x16_hi = hi;
    return lo;
  }

  // @ts-expect-error: decorator
  @inline export function splat(x: i8): u64 {
    const p = (((x as u64) & 0xff) * 0x0101010101010101);
    return set_pair(p, p);
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane_s(lo: u64, hi: u64, idx: u8): i8 {
    return ((select<u64>(lo, hi, idx < 8) >> ((idx & 7) << 3)) as u8) as i8;
  }
  // @ts-expect-error: decorator
  @inline export function extract_lane_u(lo: u64, hi: u64, idx: u8): u8 {
    return ((select<u64>(lo, hi, idx < 8) >> ((idx & 7) << 3)) as u8);
  }
  // @ts-expect-error: decorator
  @inline export function replace_lane(lo: u64, hi: u64, idx: u8, value: i8): u64 {
    const i = idx & 15;
    const j = i & 7;
    const shift = (j << 3) as u64;
    const byte = (value as u8 as u64) << shift;
    const mask = ~((0xff as u64) << shift);
    if (i < 8) return set_pair((lo & mask) | byte, hi);
    return set_pair(lo, (hi & mask) | byte);
  }
  // @ts-expect-error: decorator
  @inline export function loadPartial(ptr: usize, len: i32, immOffset: usize = 0, immAlign: usize = 1, fill: i8 = 0): u64 {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(16, nn, nn > 16);
    const p = ptr + immOffset;
    const fillWord = (((fill as u64) & 0xff) * 0x0101010101010101);
    if (n <= 0) return set_pair(fillWord, fillWord);
    if (n >= 16) return set_pair(load<u64>(p), load<u64>(p + 8));
    if (n < 8) {
      const bits = n << 3;
      const mask = ((1 as u64) << bits) - 1;
      return set_pair((load<u64>(p) & mask) | (fillWord & ~mask), fillWord);
    }
    const bits = (n - 8) << 3;
    const mask = bits == 0 ? 0 : (((1 as u64) << bits) - 1);
    return set_pair(
      load<u64>(p),
      bits == 0 ? fillWord : ((load<u64>(p + 8) & mask) | (fillWord & ~mask)),
    );
  }
  // @ts-expect-error: decorator
  @inline export function storePartial(ptr: usize, lo: u64, hi: u64, len: i32, immOffset: usize = 0, immAlign: usize = 1): void {
    const nn = select<i32>(0, len, len < 0);
    const n = select<i32>(16, nn, nn > 16);
    const p = ptr + immOffset;
    if (n <= 0) return;
    if (n >= 16) {
      store<u64>(p, lo);
      store<u64>(p + 8, hi);
      return;
    }
    if (n < 8) {
      const bits = n << 3;
      const mask = ((1 as u64) << bits) - 1;
      store<u64>(p, (load<u64>(p) & ~mask) | (lo & mask));
      return;
    }
    store<u64>(p, lo);
    const bits = (n - 8) << 3;
    if (bits == 0) return;
    const mask = ((1 as u64) << bits) - 1;
    store<u64>(p + 8, (load<u64>(p + 8) & ~mask) | (hi & mask));
  }

  // @ts-expect-error: decorator
  @inline export function add(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      ((aLo & ~0x8080808080808080) + (bLo & ~0x8080808080808080)) ^ ((aLo ^ bLo) & 0x8080808080808080),
      ((aHi & ~0x8080808080808080) + (bHi & ~0x8080808080808080)) ^ ((aHi ^ bHi) & 0x8080808080808080),
    );
  }
  // @ts-expect-error: decorator
  @inline export function sub(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      ((aLo | 0x8080808080808080) - (bLo & ~0x8080808080808080)) ^ ((aLo ^ ~bLo) & 0x8080808080808080),
      ((aHi | 0x8080808080808080) - (bHi & ~0x8080808080808080)) ^ ((aHi ^ ~bHi) & 0x8080808080808080),
    );
  }
  // @ts-expect-error: decorator
  @inline export function mul(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      (((aLo & 0xff) * (bLo & 0xff)) & 0xff) |
      (((((aLo >> 8) & 0xff) * ((bLo >> 8) & 0xff)) & 0xff) << 8) |
      (((((aLo >> 16) & 0xff) * ((bLo >> 16) & 0xff)) & 0xff) << 16) |
      (((((aLo >> 24) & 0xff) * ((bLo >> 24) & 0xff)) & 0xff) << 24) |
      (((((aLo >> 32) & 0xff) * ((bLo >> 32) & 0xff)) & 0xff) << 32) |
      (((((aLo >> 40) & 0xff) * ((bLo >> 40) & 0xff)) & 0xff) << 40) |
      (((((aLo >> 48) & 0xff) * ((bLo >> 48) & 0xff)) & 0xff) << 48) |
      (((((aLo >> 56) & 0xff) * ((bLo >> 56) & 0xff)) & 0xff) << 56),
      (((aHi & 0xff) * (bHi & 0xff)) & 0xff) |
      (((((aHi >> 8) & 0xff) * ((bHi >> 8) & 0xff)) & 0xff) << 8) |
      (((((aHi >> 16) & 0xff) * ((bHi >> 16) & 0xff)) & 0xff) << 16) |
      (((((aHi >> 24) & 0xff) * ((bHi >> 24) & 0xff)) & 0xff) << 24) |
      (((((aHi >> 32) & 0xff) * ((bHi >> 32) & 0xff)) & 0xff) << 32) |
      (((((aHi >> 40) & 0xff) * ((bHi >> 40) & 0xff)) & 0xff) << 40) |
      (((((aHi >> 48) & 0xff) * ((bHi >> 48) & 0xff)) & 0xff) << 48) |
      (((((aHi >> 56) & 0xff) * ((bHi >> 56) & 0xff)) & 0xff) << 56),
    );
  }
  // @ts-expect-error: decorator
  @inline export function min_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const axLo = aLo ^ 0x8080808080808080;
    const bxLo = bLo ^ 0x8080808080808080;
    const dLo = ((axLo | 0x8080808080808080) - (bxLo & 0x7f7f7f7f7f7f7f7f)) ^ ((axLo ^ ~bxLo) & 0x8080808080808080);
    const mLo = ((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
    const axHi = aHi ^ 0x8080808080808080;
    const bxHi = bHi ^ 0x8080808080808080;
    const dHi = ((axHi | 0x8080808080808080) - (bxHi & 0x7f7f7f7f7f7f7f7f)) ^ ((axHi ^ ~bxHi) & 0x8080808080808080);
    const mHi = ((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
    return set_pair(bLo ^ ((aLo ^ bLo) & mLo), bHi ^ ((aHi ^ bHi) & mHi));
  }
  // @ts-expect-error: decorator
  @inline export function min_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const dLo = ((aLo | 0x8080808080808080) - (bLo & 0x7f7f7f7f7f7f7f7f)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
    const mLo = ((((~aLo & bLo) | (~(aLo ^ bLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
    const dHi = ((aHi | 0x8080808080808080) - (bHi & 0x7f7f7f7f7f7f7f7f)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
    const mHi = ((((~aHi & bHi) | (~(aHi ^ bHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
    return set_pair(bLo ^ ((aLo ^ bLo) & mLo), bHi ^ ((aHi ^ bHi) & mHi));
  }
  // @ts-expect-error: decorator
  @inline export function max_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const axLo = aLo ^ 0x8080808080808080;
    const bxLo = bLo ^ 0x8080808080808080;
    const dLo = ((axLo | 0x8080808080808080) - (bxLo & 0x7f7f7f7f7f7f7f7f)) ^ ((axLo ^ ~bxLo) & 0x8080808080808080);
    const mLo = ((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
    const axHi = aHi ^ 0x8080808080808080;
    const bxHi = bHi ^ 0x8080808080808080;
    const dHi = ((axHi | 0x8080808080808080) - (bxHi & 0x7f7f7f7f7f7f7f7f)) ^ ((axHi ^ ~bxHi) & 0x8080808080808080);
    const mHi = ((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
    return set_pair(aLo ^ ((aLo ^ bLo) & mLo), aHi ^ ((aHi ^ bHi) & mHi));
  }
  // @ts-expect-error: decorator
  @inline export function max_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const dLo = ((aLo | 0x8080808080808080) - (bLo & 0x7f7f7f7f7f7f7f7f)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
    const mLo = ((((~aLo & bLo) | (~(aLo ^ bLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
    const dHi = ((aHi | 0x8080808080808080) - (bHi & 0x7f7f7f7f7f7f7f7f)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
    const mHi = ((((~aHi & bHi) | (~(aHi ^ bHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
    return set_pair(aLo ^ ((aLo ^ bLo) & mLo), aHi ^ ((aHi ^ bHi) & mHi));
  }
  // @ts-expect-error: decorator
  @inline export function avgr_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      (aLo | bLo) - (((aLo ^ bLo) & 0xfefefefefefefefe) >> 1),
      (aHi | bHi) - (((aHi ^ bHi) & 0xfefefefefefefefe) >> 1),
    );
  }
  // @ts-expect-error: decorator
  @inline export function abs(aLo: u64, aHi: u64): u64 {
    const mLo = ((aLo & 0x8080808080808080) >> 7) * 0xff;
    const xLo = aLo ^ mLo;
    const bLo = mLo & 0x0101010101010101;
    let lo = (xLo & 0x0f0f0f0f0f0f0f0f) + (bLo & 0x0f0f0f0f0f0f0f0f);
    let hi = (xLo & 0xf0f0f0f0f0f0f0f0) + (bLo & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010);
    const outLo = (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0);
    const mHi = ((aHi & 0x8080808080808080) >> 7) * 0xff;
    const xHi = aHi ^ mHi;
    const bHi = mHi & 0x0101010101010101;
    lo = (xHi & 0x0f0f0f0f0f0f0f0f) + (bHi & 0x0f0f0f0f0f0f0f0f);
    hi = (xHi & 0xf0f0f0f0f0f0f0f0) + (bHi & 0xf0f0f0f0f0f0f0f0) + (lo & 0x1010101010101010);
    return set_pair(outLo, (lo & 0x0f0f0f0f0f0f0f0f) | (hi & 0xf0f0f0f0f0f0f0f0));
  }
  // @ts-expect-error: decorator
  @inline export function neg(aLo: u64, aHi: u64): u64 {
    return set_pair(
      (0x8080808080808080 - (aLo & ~0x8080808080808080)) ^ ((~aLo) & 0x8080808080808080),
      (0x8080808080808080 - (aHi & ~0x8080808080808080)) ^ ((~aHi) & 0x8080808080808080),
    );
  }
  // @ts-expect-error: decorator
  @inline export function add_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const sLo = ((aLo & ~0x8080808080808080) + (bLo & ~0x8080808080808080)) ^ ((aLo ^ bLo) & 0x8080808080808080);
    const oLo = (~(aLo ^ bLo) & (aLo ^ sLo) & 0x8080808080808080) >> 7;
    const mLo = oLo * 0xff;
    const lLo = ((((aLo & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    const sHi = ((aHi & ~0x8080808080808080) + (bHi & ~0x8080808080808080)) ^ ((aHi ^ bHi) & 0x8080808080808080);
    const oHi = (~(aHi ^ bHi) & (aHi ^ sHi) & 0x8080808080808080) >> 7;
    const mHi = oHi * 0xff;
    const lHi = ((((aHi & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return set_pair((sLo & ~mLo) | (lLo & mLo), (sHi & ~mHi) | (lHi & mHi));
  }
  // @ts-expect-error: decorator
  @inline export function add_sat_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    let lo = (aLo & 0x00ff00ff00ff00ff) + (bLo & 0x00ff00ff00ff00ff);
    let hi = ((aLo >> 8) & 0x00ff00ff00ff00ff) + ((bLo >> 8) & 0x00ff00ff00ff00ff);
    let lc = lo & 0x0100010001000100;
    let hc = hi & 0x0100010001000100;
    const outLo = (lo & 0x00ff00ff00ff00ff) | ((hi & 0x00ff00ff00ff00ff) << 8) | (lc - (lc >> 8)) | (hc * 0xff);
    lo = (aHi & 0x00ff00ff00ff00ff) + (bHi & 0x00ff00ff00ff00ff);
    hi = ((aHi >> 8) & 0x00ff00ff00ff00ff) + ((bHi >> 8) & 0x00ff00ff00ff00ff);
    lc = lo & 0x0100010001000100;
    hc = hi & 0x0100010001000100;
    return set_pair(outLo, (lo & 0x00ff00ff00ff00ff) | ((hi & 0x00ff00ff00ff00ff) << 8) | (lc - (lc >> 8)) | (hc * 0xff));
  }
  // @ts-expect-error: decorator
  @inline export function sub_sat_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const d0 = ((aLo | 0x0080008000800080) - (bLo & 0x007f007f007f007f)) ^ ((aLo ^ ~bLo) & 0x0080008000800080);
    const d1 = ((aLo | 0x8000800080008000) - (bLo & 0x7f007f007f007f00)) ^ ((aLo ^ ~bLo) & 0x8000800080008000);
    const diffLo = (d0 & 0x00ff00ff00ff00ff) | (d1 & 0xff00ff00ff00ff00);
    const oLo = ((aLo ^ bLo) & (aLo ^ diffLo) & 0x8080808080808080) >> 7;
    const mLo = oLo * 0xff;
    const lLo = ((((aLo & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    const e0 = ((aHi | 0x0080008000800080) - (bHi & 0x007f007f007f007f)) ^ ((aHi ^ ~bHi) & 0x0080008000800080);
    const e1 = ((aHi | 0x8000800080008000) - (bHi & 0x7f007f007f007f00)) ^ ((aHi ^ ~bHi) & 0x8000800080008000);
    const diffHi = (e0 & 0x00ff00ff00ff00ff) | (e1 & 0xff00ff00ff00ff00);
    const oHi = ((aHi ^ bHi) & (aHi ^ diffHi) & 0x8080808080808080) >> 7;
    const mHi = oHi * 0xff;
    const lHi = ((((aHi & 0x8080808080808080) >> 7) * 0xff) ^ 0x7f7f7f7f7f7f7f7f);
    return set_pair((diffLo & ~mLo) | (lLo & mLo), (diffHi & ~mHi) | (lHi & mHi));
  }
  // @ts-expect-error: decorator
  @inline export function sub_sat_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const dLo = ((aLo | 0x8080808080808080) - (bLo & ~0x8080808080808080)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
    const mLo = ((((~aLo & bLo) | (~(aLo ^ bLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff;
    const dHi = ((aHi | 0x8080808080808080) - (bHi & ~0x8080808080808080)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
    const mHi = ((((~aHi & bHi) | (~(aHi ^ bHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff;
    return set_pair(dLo & ~mLo, dHi & ~mHi);
  }
  // @ts-expect-error: decorator
  @inline export function shl(aLo: u64, aHi: u64, b: i32): u64 {
    const s = b & 7;
    const mask = ((0xff >> s) as u64) * 0x0101010101010101;
    return set_pair((aLo & mask) << s, (aHi & mask) << s);
  }
  // @ts-expect-error: decorator
  @inline export function shr_s(aLo: u64, aHi: u64, b: i32): u64 {
    const s = b & 7;
    if (s == 0) return set_pair(aLo, aHi);
    const keep = (((0xff >> s) & 0xff) as u64) * 0x0101010101010101;
    return set_pair(
      ((aLo >> s) & keep) | ((((aLo & 0x8080808080808080) >> 7) * 0xff) & ~keep),
      ((aHi >> s) & keep) | ((((aHi & 0x8080808080808080) >> 7) * 0xff) & ~keep),
    );
  }
  // @ts-expect-error: decorator
  @inline export function shr_u(aLo: u64, aHi: u64, b: i32): u64 {
    switch (b & 7) {
      case 0: return set_pair(aLo, aHi);
      case 1: return set_pair((aLo >> 1) & 0x7f7f7f7f7f7f7f7f, (aHi >> 1) & 0x7f7f7f7f7f7f7f7f);
      case 2: return set_pair((aLo >> 2) & 0x3f3f3f3f3f3f3f3f, (aHi >> 2) & 0x3f3f3f3f3f3f3f3f);
      case 3: return set_pair((aLo >> 3) & 0x1f1f1f1f1f1f1f1f, (aHi >> 3) & 0x1f1f1f1f1f1f1f1f);
      case 4: return set_pair((aLo >> 4) & 0x0f0f0f0f0f0f0f0f, (aHi >> 4) & 0x0f0f0f0f0f0f0f0f);
      case 5: return set_pair((aLo >> 5) & 0x0707070707070707, (aHi >> 5) & 0x0707070707070707);
      case 6: return set_pair((aLo >> 6) & 0x0303030303030303, (aHi >> 6) & 0x0303030303030303);
      default: return set_pair((aLo >> 7) & 0x0101010101010101, (aHi >> 7) & 0x0101010101010101);
    }
  }
  // @ts-expect-error: decorator
  @inline export function all_true(aLo: u64, aHi: u64): bool {
    return (((aLo - 0x0101010101010101) & ~aLo & 0x8080808080808080) | ((aHi - 0x0101010101010101) & ~aHi & 0x8080808080808080)) == 0;
  }
  // @ts-expect-error: decorator
  @inline export function bitmask(aLo: u64, aHi: u64): i32 {
    return ((((aLo & 0x8080808080808080) * 0x0002040810204081) >> 56) as i32) | (((((aHi & 0x8080808080808080) * 0x0002040810204081) >> 56) as i32) << 8);
  }
  // @ts-expect-error: decorator
  @inline export function bitmask_lane(aLo: u64, aHi: u64): u64 {
    return set_pair(
      (((aLo & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | aLo) & 0x8080808080808080,
      (((aHi & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | aHi) & 0x8080808080808080,
    );
  }
  // @ts-expect-error: decorator
  @inline export function popcnt(aLo: u64, aHi: u64): u64 {
    aLo = aLo - ((aLo >> 1) & 0x5555555555555555);
    aLo = (aLo & 0x3333333333333333) + ((aLo >> 2) & 0x3333333333333333);
    aLo = (aLo + (aLo >> 4)) & 0x0f0f0f0f0f0f0f0f;
    aHi = aHi - ((aHi >> 1) & 0x5555555555555555);
    aHi = (aHi & 0x3333333333333333) + ((aHi >> 2) & 0x3333333333333333);
    aHi = (aHi + (aHi >> 4)) & 0x0f0f0f0f0f0f0f0f;
    return set_pair(aLo, aHi);
  }
  // @ts-expect-error: decorator
  @inline export function eq(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const xLo = aLo ^ bLo;
    const mLo = (((xLo & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | xLo) & 0x8080808080808080;
    const xHi = aHi ^ bHi;
    const mHi = (((xHi & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | xHi) & 0x8080808080808080;
    return set_pair(~((mLo >> 7) * 0xff), ~((mHi >> 7) * 0xff));
  }
  // @ts-expect-error: decorator
  @inline export function ne(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const xLo = aLo ^ bLo;
    const mLo = (((xLo & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | xLo) & 0x8080808080808080;
    const xHi = aHi ^ bHi;
    const mHi = (((xHi & 0x7f7f7f7f7f7f7f7f) + 0x7f7f7f7f7f7f7f7f) | xHi) & 0x8080808080808080;
    return set_pair((mLo >> 7) * 0xff, (mHi >> 7) * 0xff);
  }
  // @ts-expect-error: decorator
  @inline export function lt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const loGe = ge_s(aLo, aHi, bLo, bHi);
    const hiGe = take_hi();
    return set_pair(~loGe, ~hiGe);
  }
  // @ts-expect-error: decorator
  @inline export function lt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const dLo = ((aLo | 0x8080808080808080) - (bLo & 0x7f7f7f7f7f7f7f7f)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
    const dHi = ((aHi | 0x8080808080808080) - (bHi & 0x7f7f7f7f7f7f7f7f)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
    return set_pair(
      ((((~aLo & bLo) | (~(aLo ^ bLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff,
      ((((~aHi & bHi) | (~(aHi ^ bHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff,
    );
  }
  // @ts-expect-error: decorator
  @inline export function le_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return ge_s(bLo, bHi, aLo, aHi);
  }
  // @ts-expect-error: decorator
  @inline export function le_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const dLo = ((bLo | 0x8080808080808080) - (aLo & 0x7f7f7f7f7f7f7f7f)) ^ ((bLo ^ ~aLo) & 0x8080808080808080);
    const dHi = ((bHi | 0x8080808080808080) - (aHi & 0x7f7f7f7f7f7f7f7f)) ^ ((bHi ^ ~aHi) & 0x8080808080808080);
    return set_pair(
      ~(((((~bLo & aLo) | (~(bLo ^ aLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff),
      ~(((((~bHi & aHi) | (~(bHi ^ aHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff),
    );
  }
  // @ts-expect-error: decorator
  @inline export function gt_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const bxLo = bLo ^ 0x8080808080808080;
    const axLo = aLo ^ 0x8080808080808080;
    const dLo = ((bxLo | 0x8080808080808080) - (axLo & 0x7f7f7f7f7f7f7f7f)) ^ ((bxLo ^ ~axLo) & 0x8080808080808080);
    const bxHi = bHi ^ 0x8080808080808080;
    const axHi = aHi ^ 0x8080808080808080;
    const dHi = ((bxHi | 0x8080808080808080) - (axHi & 0x7f7f7f7f7f7f7f7f)) ^ ((bxHi ^ ~axHi) & 0x8080808080808080);
    return set_pair(
      ((((~bxLo & axLo) | (~(bxLo ^ axLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff,
      ((((~bxHi & axHi) | (~(bxHi ^ axHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff,
    );
  }
  // @ts-expect-error: decorator
  @inline export function gt_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const dLo = ((bLo | 0x8080808080808080) - (aLo & 0x7f7f7f7f7f7f7f7f)) ^ ((bLo ^ ~aLo) & 0x8080808080808080);
    const dHi = ((bHi | 0x8080808080808080) - (aHi & 0x7f7f7f7f7f7f7f7f)) ^ ((bHi ^ ~aHi) & 0x8080808080808080);
    return set_pair(
      ((((~bLo & aLo) | (~(bLo ^ aLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff,
      ((((~bHi & aHi) | (~(bHi ^ aHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff,
    );
  }
  // @ts-expect-error: decorator
  @inline export function ge_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const axLo = aLo ^ 0x8080808080808080;
    const bxLo = bLo ^ 0x8080808080808080;
    const dLo = ((axLo | 0x8080808080808080) - (bxLo & 0x7f7f7f7f7f7f7f7f)) ^ ((axLo ^ ~bxLo) & 0x8080808080808080);
    const axHi = aHi ^ 0x8080808080808080;
    const bxHi = bHi ^ 0x8080808080808080;
    const dHi = ((axHi | 0x8080808080808080) - (bxHi & 0x7f7f7f7f7f7f7f7f)) ^ ((axHi ^ ~bxHi) & 0x8080808080808080);
    return set_pair(
      ~(((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff),
      ~(((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff),
    );
  }
  // @ts-expect-error: decorator
  @inline export function ge_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const dLo = ((aLo | 0x8080808080808080) - (bLo & 0x7f7f7f7f7f7f7f7f)) ^ ((aLo ^ ~bLo) & 0x8080808080808080);
    const dHi = ((aHi | 0x8080808080808080) - (bHi & 0x7f7f7f7f7f7f7f7f)) ^ ((aHi ^ ~bHi) & 0x8080808080808080);
    return set_pair(
      ~(((((~aLo & bLo) | (~(aLo ^ bLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff),
      ~(((((~aHi & bHi) | (~(aHi ^ bHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff),
    );
  }

  // @ts-expect-error: decorator
  @inline export function narrow_i16x8_s(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    return set_pair(
      (((((aLo & 0xffff) as i16 as i32) > 127 ? 127 : ((((aLo & 0xffff) as i16 as i32) < -128 ? -128 : ((aLo & 0xffff) as i16 as i32))) as i8) as u8) as u64) |
      (((((((aLo >> 16) & 0xffff) as i16 as i32) > 127 ? 127 : (((((aLo >> 16) & 0xffff) as i16 as i32) < -128 ? -128 : (((aLo >> 16) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 8) |
      (((((((aLo >> 32) & 0xffff) as i16 as i32) > 127 ? 127 : (((((aLo >> 32) & 0xffff) as i16 as i32) < -128 ? -128 : (((aLo >> 32) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 16) |
      (((((((aLo >> 48) & 0xffff) as i16 as i32) > 127 ? 127 : (((((aLo >> 48) & 0xffff) as i16 as i32) < -128 ? -128 : (((aLo >> 48) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 24) |
      ((((((aHi & 0xffff) as i16 as i32) > 127 ? 127 : ((((aHi & 0xffff) as i16 as i32) < -128 ? -128 : ((aHi & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 32) |
      (((((((aHi >> 16) & 0xffff) as i16 as i32) > 127 ? 127 : (((((aHi >> 16) & 0xffff) as i16 as i32) < -128 ? -128 : (((aHi >> 16) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 40) |
      (((((((aHi >> 32) & 0xffff) as i16 as i32) > 127 ? 127 : (((((aHi >> 32) & 0xffff) as i16 as i32) < -128 ? -128 : (((aHi >> 32) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 48) |
      (((((((aHi >> 48) & 0xffff) as i16 as i32) > 127 ? 127 : (((((aHi >> 48) & 0xffff) as i16 as i32) < -128 ? -128 : (((aHi >> 48) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 56),
      (((((bLo & 0xffff) as i16 as i32) > 127 ? 127 : ((((bLo & 0xffff) as i16 as i32) < -128 ? -128 : ((bLo & 0xffff) as i16 as i32))) as i8) as u8) as u64) |
      (((((((bLo >> 16) & 0xffff) as i16 as i32) > 127 ? 127 : (((((bLo >> 16) & 0xffff) as i16 as i32) < -128 ? -128 : (((bLo >> 16) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 8) |
      (((((((bLo >> 32) & 0xffff) as i16 as i32) > 127 ? 127 : (((((bLo >> 32) & 0xffff) as i16 as i32) < -128 ? -128 : (((bLo >> 32) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 16) |
      (((((((bLo >> 48) & 0xffff) as i16 as i32) > 127 ? 127 : (((((bLo >> 48) & 0xffff) as i16 as i32) < -128 ? -128 : (((bLo >> 48) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 24) |
      ((((((bHi & 0xffff) as i16 as i32) > 127 ? 127 : ((((bHi & 0xffff) as i16 as i32) < -128 ? -128 : ((bHi & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 32) |
      (((((((bHi >> 16) & 0xffff) as i16 as i32) > 127 ? 127 : (((((bHi >> 16) & 0xffff) as i16 as i32) < -128 ? -128 : (((bHi >> 16) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 40) |
      (((((((bHi >> 32) & 0xffff) as i16 as i32) > 127 ? 127 : (((((bHi >> 32) & 0xffff) as i16 as i32) < -128 ? -128 : (((bHi >> 32) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 48) |
      (((((((bHi >> 48) & 0xffff) as i16 as i32) > 127 ? 127 : (((((bHi >> 48) & 0xffff) as i16 as i32) < -128 ? -128 : (((bHi >> 48) & 0xffff) as i16 as i32))) as i8) as u8) as u64) << 56),
    );
  }
  // @ts-expect-error: decorator
  @inline export function narrow_i16x8_u(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const a0 = (aLo & 0xffff) as i16 as i32;
    const a1 = ((aLo >> 16) & 0xffff) as i16 as i32;
    const a2 = ((aLo >> 32) & 0xffff) as i16 as i32;
    const a3 = ((aLo >> 48) & 0xffff) as i16 as i32;
    const a4 = (aHi & 0xffff) as i16 as i32;
    const a5 = ((aHi >> 16) & 0xffff) as i16 as i32;
    const a6 = ((aHi >> 32) & 0xffff) as i16 as i32;
    const a7 = ((aHi >> 48) & 0xffff) as i16 as i32;
    const b0 = (bLo & 0xffff) as i16 as i32;
    const b1 = ((bLo >> 16) & 0xffff) as i16 as i32;
    const b2 = ((bLo >> 32) & 0xffff) as i16 as i32;
    const b3 = ((bLo >> 48) & 0xffff) as i16 as i32;
    const b4 = (bHi & 0xffff) as i16 as i32;
    const b5 = ((bHi >> 16) & 0xffff) as i16 as i32;
    const b6 = ((bHi >> 32) & 0xffff) as i16 as i32;
    const b7 = ((bHi >> 48) & 0xffff) as i16 as i32;
    return set_pair(
      (a0 < 0 ? 0 : (a0 > 255 ? 255 : a0 as u64)) |
      ((a1 < 0 ? 0 : (a1 > 255 ? 255 : a1 as u64)) << 8) |
      ((a2 < 0 ? 0 : (a2 > 255 ? 255 : a2 as u64)) << 16) |
      ((a3 < 0 ? 0 : (a3 > 255 ? 255 : a3 as u64)) << 24) |
      ((a4 < 0 ? 0 : (a4 > 255 ? 255 : a4 as u64)) << 32) |
      ((a5 < 0 ? 0 : (a5 > 255 ? 255 : a5 as u64)) << 40) |
      ((a6 < 0 ? 0 : (a6 > 255 ? 255 : a6 as u64)) << 48) |
      ((a7 < 0 ? 0 : (a7 > 255 ? 255 : a7 as u64)) << 56),
      (b0 < 0 ? 0 : (b0 > 255 ? 255 : b0 as u64)) |
      ((b1 < 0 ? 0 : (b1 > 255 ? 255 : b1 as u64)) << 8) |
      ((b2 < 0 ? 0 : (b2 > 255 ? 255 : b2 as u64)) << 16) |
      ((b3 < 0 ? 0 : (b3 > 255 ? 255 : b3 as u64)) << 24) |
      ((b4 < 0 ? 0 : (b4 > 255 ? 255 : b4 as u64)) << 32) |
      ((b5 < 0 ? 0 : (b5 > 255 ? 255 : b5 as u64)) << 40) |
      ((b6 < 0 ? 0 : (b6 > 255 ? 255 : b6 as u64)) << 48) |
      ((b7 < 0 ? 0 : (b7 > 255 ? 255 : b7 as u64)) << 56),
    );
  }

  // @ts-expect-error: decorator
  @inline export function shuffle(aLo: u64, aHi: u64, bLo: u64, bHi: u64, l0: u8, l1: u8, l2: u8, l3: u8, l4: u8, l5: u8, l6: u8, l7: u8, l8: u8, l9: u8, l10: u8, l11: u8, l12: u8, l13: u8, l14: u8, l15: u8): u64 {
    const i0 = (l0 & 7) as u64, i1 = (l1 & 7) as u64, i2 = (l2 & 7) as u64, i3 = (l3 & 7) as u64;
    const i4 = (l4 & 7) as u64, i5 = (l5 & 7) as u64, i6 = (l6 & 7) as u64, i7 = (l7 & 7) as u64;
    const i8 = (l8 & 7) as u64, i9 = (l9 & 7) as u64, i10 = (l10 & 7) as u64, i11 = (l11 & 7) as u64;
    const i12 = (l12 & 7) as u64, i13 = (l13 & 7) as u64, i14 = (l14 & 7) as u64, i15 = (l15 & 7) as u64;
    const s0 = select<u64>(bLo, select<u64>(aHi, aLo, l0 < 8), l0 < 16);
    const s1 = select<u64>(bLo, select<u64>(aHi, aLo, l1 < 8), l1 < 16);
    const s2 = select<u64>(bLo, select<u64>(aHi, aLo, l2 < 8), l2 < 16);
    const s3 = select<u64>(bLo, select<u64>(aHi, aLo, l3 < 8), l3 < 16);
    const s4 = select<u64>(bLo, select<u64>(aHi, aLo, l4 < 8), l4 < 16);
    const s5 = select<u64>(bLo, select<u64>(aHi, aLo, l5 < 8), l5 < 16);
    const s6 = select<u64>(bLo, select<u64>(aHi, aLo, l6 < 8), l6 < 16);
    const s7 = select<u64>(bLo, select<u64>(aHi, aLo, l7 < 8), l7 < 16);
    const s8 = select<u64>(bHi, select<u64>(aHi, aLo, l8 < 8), l8 < 24);
    const s9 = select<u64>(bHi, select<u64>(aHi, aLo, l9 < 8), l9 < 24);
    const s10 = select<u64>(bHi, select<u64>(aHi, aLo, l10 < 8), l10 < 24);
    const s11 = select<u64>(bHi, select<u64>(aHi, aLo, l11 < 8), l11 < 24);
    const s12 = select<u64>(bHi, select<u64>(aHi, aLo, l12 < 8), l12 < 24);
    const s13 = select<u64>(bHi, select<u64>(aHi, aLo, l13 < 8), l13 < 24);
    const s14 = select<u64>(bHi, select<u64>(aHi, aLo, l14 < 8), l14 < 24);
    const s15 = select<u64>(bHi, select<u64>(aHi, aLo, l15 < 8), l15 < 24);
    return set_pair(
      ((s0 >> (i0 << 3)) & 0xff) |
      (((s1 >> (i1 << 3)) & 0xff) << 8) |
      (((s2 >> (i2 << 3)) & 0xff) << 16) |
      (((s3 >> (i3 << 3)) & 0xff) << 24) |
      (((s4 >> (i4 << 3)) & 0xff) << 32) |
      (((s5 >> (i5 << 3)) & 0xff) << 40) |
      (((s6 >> (i6 << 3)) & 0xff) << 48) |
      (((s7 >> (i7 << 3)) & 0xff) << 56),
      ((s8 >> (i8 << 3)) & 0xff) |
      (((s9 >> (i9 << 3)) & 0xff) << 8) |
      (((s10 >> (i10 << 3)) & 0xff) << 16) |
      (((s11 >> (i11 << 3)) & 0xff) << 24) |
      (((s12 >> (i12 << 3)) & 0xff) << 32) |
      (((s13 >> (i13 << 3)) & 0xff) << 40) |
      (((s14 >> (i14 << 3)) & 0xff) << 48) |
      (((s15 >> (i15 << 3)) & 0xff) << 56),
    );
  }
  // @ts-expect-error: decorator
  @inline export function swizzle(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
    const i0 = sLo as u8, i1 = (sLo >> 8) as u8, i2 = (sLo >> 16) as u8, i3 = (sLo >> 24) as u8;
    const i4 = (sLo >> 32) as u8, i5 = (sLo >> 40) as u8, i6 = (sLo >> 48) as u8, i7 = (sLo >> 56) as u8;
    const i8 = sHi as u8, i9 = (sHi >> 8) as u8, i10 = (sHi >> 16) as u8, i11 = (sHi >> 24) as u8;
    const i12 = (sHi >> 32) as u8, i13 = (sHi >> 40) as u8, i14 = (sHi >> 48) as u8, i15 = (sHi >> 56) as u8;
    const x0 = i0 < 8 ? aLo : aHi, x1 = i1 < 8 ? aLo : aHi, x2 = i2 < 8 ? aLo : aHi, x3 = i3 < 8 ? aLo : aHi;
    const x4 = i4 < 8 ? aLo : aHi, x5 = i5 < 8 ? aLo : aHi, x6 = i6 < 8 ? aLo : aHi, x7 = i7 < 8 ? aLo : aHi;
    const x8 = i8 < 8 ? aLo : aHi, x9 = i9 < 8 ? aLo : aHi, x10 = i10 < 8 ? aLo : aHi, x11 = i11 < 8 ? aLo : aHi;
    const x12 = i12 < 8 ? aLo : aHi, x13 = i13 < 8 ? aLo : aHi, x14 = i14 < 8 ? aLo : aHi, x15 = i15 < 8 ? aLo : aHi;
    const v0 = i0 > 15 ? 0 : ((x0 >> ((i0 & 7) << 3)) & 0xff);
    const v1 = i1 > 15 ? 0 : ((x1 >> ((i1 & 7) << 3)) & 0xff);
    const v2 = i2 > 15 ? 0 : ((x2 >> ((i2 & 7) << 3)) & 0xff);
    const v3 = i3 > 15 ? 0 : ((x3 >> ((i3 & 7) << 3)) & 0xff);
    const v4 = i4 > 15 ? 0 : ((x4 >> ((i4 & 7) << 3)) & 0xff);
    const v5 = i5 > 15 ? 0 : ((x5 >> ((i5 & 7) << 3)) & 0xff);
    const v6 = i6 > 15 ? 0 : ((x6 >> ((i6 & 7) << 3)) & 0xff);
    const v7 = i7 > 15 ? 0 : ((x7 >> ((i7 & 7) << 3)) & 0xff);
    const v8 = i8 > 15 ? 0 : ((x8 >> ((i8 & 7) << 3)) & 0xff);
    const v9 = i9 > 15 ? 0 : ((x9 >> ((i9 & 7) << 3)) & 0xff);
    const v10 = i10 > 15 ? 0 : ((x10 >> ((i10 & 7) << 3)) & 0xff);
    const v11 = i11 > 15 ? 0 : ((x11 >> ((i11 & 7) << 3)) & 0xff);
    const v12 = i12 > 15 ? 0 : ((x12 >> ((i12 & 7) << 3)) & 0xff);
    const v13 = i13 > 15 ? 0 : ((x13 >> ((i13 & 7) << 3)) & 0xff);
    const v14 = i14 > 15 ? 0 : ((x14 >> ((i14 & 7) << 3)) & 0xff);
    const v15 = i15 > 15 ? 0 : ((x15 >> ((i15 & 7) << 3)) & 0xff);
    return set_pair(
      v0 | (v1 << 8) | (v2 << 16) | (v3 << 24) | (v4 << 32) | (v5 << 40) | (v6 << 48) | (v7 << 56),
      v8 | (v9 << 8) | (v10 << 16) | (v11 << 24) | (v12 << 32) | (v13 << 40) | (v14 << 48) | (v15 << 56),
    );
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_swizzle(aLo: u64, aHi: u64, sLo: u64, sHi: u64): u64 {
    const i0 = sLo as u8, i1 = (sLo >> 8) as u8, i2 = (sLo >> 16) as u8, i3 = (sLo >> 24) as u8;
    const i4 = (sLo >> 32) as u8, i5 = (sLo >> 40) as u8, i6 = (sLo >> 48) as u8, i7 = (sLo >> 56) as u8;
    const i8 = sHi as u8, i9 = (sHi >> 8) as u8, i10 = (sHi >> 16) as u8, i11 = (sHi >> 24) as u8;
    const i12 = (sHi >> 32) as u8, i13 = (sHi >> 40) as u8, i14 = (sHi >> 48) as u8, i15 = (sHi >> 56) as u8;
    const x0 = i0 < 8 ? aLo : aHi, x1 = i1 < 8 ? aLo : aHi, x2 = i2 < 8 ? aLo : aHi, x3 = i3 < 8 ? aLo : aHi;
    const x4 = i4 < 8 ? aLo : aHi, x5 = i5 < 8 ? aLo : aHi, x6 = i6 < 8 ? aLo : aHi, x7 = i7 < 8 ? aLo : aHi;
    const x8 = i8 < 8 ? aLo : aHi, x9 = i9 < 8 ? aLo : aHi, x10 = i10 < 8 ? aLo : aHi, x11 = i11 < 8 ? aLo : aHi;
    const x12 = i12 < 8 ? aLo : aHi, x13 = i13 < 8 ? aLo : aHi, x14 = i14 < 8 ? aLo : aHi, x15 = i15 < 8 ? aLo : aHi;
    return set_pair(
      ((x0 >> ((i0 & 7) << 3)) & 0xff) |
      (((x1 >> ((i1 & 7) << 3)) & 0xff) << 8) |
      (((x2 >> ((i2 & 7) << 3)) & 0xff) << 16) |
      (((x3 >> ((i3 & 7) << 3)) & 0xff) << 24) |
      (((x4 >> ((i4 & 7) << 3)) & 0xff) << 32) |
      (((x5 >> ((i5 & 7) << 3)) & 0xff) << 40) |
      (((x6 >> ((i6 & 7) << 3)) & 0xff) << 48) |
      (((x7 >> ((i7 & 7) << 3)) & 0xff) << 56),
      ((x8 >> ((i8 & 7) << 3)) & 0xff) |
      (((x9 >> ((i9 & 7) << 3)) & 0xff) << 8) |
      (((x10 >> ((i10 & 7) << 3)) & 0xff) << 16) |
      (((x11 >> ((i11 & 7) << 3)) & 0xff) << 24) |
      (((x12 >> ((i12 & 7) << 3)) & 0xff) << 32) |
      (((x13 >> ((i13 & 7) << 3)) & 0xff) << 40) |
      (((x14 >> ((i14 & 7) << 3)) & 0xff) << 48) |
      (((x15 >> ((i15 & 7) << 3)) & 0xff) << 56),
    );
  }
  // @ts-expect-error: decorator
  @inline export function relaxed_laneselect(aLo: u64, aHi: u64, bLo: u64, bHi: u64, mLo: u64, mHi: u64): u64 {
    const ml = ((mLo & 0x8080808080808080) >> 7) * 0xff;
    const mh = ((mHi & 0x8080808080808080) >> 7) * 0xff;
    return set_pair((bLo & ~ml) | (aLo & ml), (bHi & ~mh) | (aHi & mh));
  }
}

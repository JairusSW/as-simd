import { expect, fuzz, FuzzSeed } from "as-test";
import { v32 } from "../v32/value";
import { v64 } from "../v64/value";
import { v128_swar } from "../v128/value";
import { v256 } from "../v256/value";
import { v512 } from "../v512/value";
import { wrf } from "../wide/regfile";
import { v256r, v512r } from "../wide/wide";

fuzz("v32/v256/v512 compositional parity", (words: u64[]): bool => {
  const a = unchecked(words[0]),
    b = unchecked(words[1]);
  const shift = <i32>(unchecked(words[2]) & 31);
  if (v32.add<i8>(a as u32, b as u32) != (v64.add<i8>(a, b) as u32))
    return false;
  if (v32.shr<u16>(a as u32, shift) != (v64.shr<u16>(a, shift) as u32))
    return false;

  for (let c: u32 = 0; c < 4; c++) {
    const i = (c as i32) << 2;
    wrf.set128(0, c, unchecked(words[i]), unchecked(words[i + 1]));
    wrf.set128(1, c, unchecked(words[i + 2]), unchecked(words[i + 3]));
  }
  v256r.mul<i16>(2, 0, 1);
  v512r.lt<u32>(3, 0, 1);
  v512r.mul<i8>(4, 0, 1);
  v256r.add<i64>(5, 0, 1);
  v256r.sub<i64>(6, 0, 1);
  v256r.min<i32>(7, 0, 1);
  v256r.min<i64>(8, 0, 1);
  v512r.add<i64>(9, 0, 1);
  v512r.sub<i64>(10, 0, 1);
  v512r.min<i32>(11, 0, 1);
  v512r.min<i64>(12, 0, 1);
  v256r.lt<i32>(13, 0, 1);
  v256r.lt<i64>(14, 0, 1);
  v256r.lt<u64>(15, 0, 1);
  v256r.eq<i64>(16, 0, 1);
  v512r.lt<i32>(17, 0, 1);
  v512r.lt<i64>(18, 0, 1);
  v512r.lt<u64>(19, 0, 1);
  v512r.eq<i64>(20, 0, 1);
  v256r.neg<i64>(21, 0);
  v256r.abs<i64>(22, 0);
  v256r.shl<i64>(23, 0, shift);
  v512r.neg<i64>(24, 0);
  v512r.abs<i64>(25, 0);
  v512r.shl<i64>(26, 0, shift);
  v256r.neg<i32>(27, 0);
  v256r.abs<i32>(28, 0);
  v256r.shl<i32>(29, 0, shift);
  v512r.neg<i32>(30, 0);
  v512r.abs<i32>(31, 0);
  v512r.shl<i32>(32, 0, shift);
  v256r.abs<i8>(33, 0);
  v256r.abs<i16>(34, 0);
  v256r.neg<i16>(35, 0);
  v256r.shr<i16>(36, 0, shift);
  v256r.avgr<u16>(37, 0, 1);
  for (let c: u32 = 0; c < 4; c++) {
    if (c < 2) {
      const lo = v128_swar.mul<i16>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      );
      const hi = v128_swar.take_hi();
      if (wrf.lo(2, c) != lo || wrf.hi(2, c) != hi) return false;
      const addLo = v128_swar.add<i64>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        addHi = v128_swar.take_hi();
      if (wrf.lo(5, c) != addLo || wrf.hi(5, c) != addHi) return false;
      const subLo = v128_swar.sub<i64>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        subHi = v128_swar.take_hi();
      if (wrf.lo(6, c) != subLo || wrf.hi(6, c) != subHi) return false;
      const min32Lo = v128_swar.min<i32>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        min32Hi = v128_swar.take_hi();
      if (wrf.lo(7, c) != min32Lo || wrf.hi(7, c) != min32Hi) return false;
      const min64Lo = v128_swar.min<i64>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        min64Hi = v128_swar.take_hi();
      if (wrf.lo(8, c) != min64Lo || wrf.hi(8, c) != min64Hi) return false;
      const lt32Lo = v128_swar.lt<i32>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        lt32Hi = v128_swar.take_hi();
      if (wrf.lo(13, c) != lt32Lo || wrf.hi(13, c) != lt32Hi) return false;
      const lt64Lo = v128_swar.lt<i64>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        lt64Hi = v128_swar.take_hi();
      if (wrf.lo(14, c) != lt64Lo || wrf.hi(14, c) != lt64Hi) return false;
      const ltu64Lo = v128_swar.lt<u64>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        ltu64Hi = v128_swar.take_hi();
      if (wrf.lo(15, c) != ltu64Lo || wrf.hi(15, c) != ltu64Hi) return false;
      const eq64Lo = v128_swar.eq<i64>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        eq64Hi = v128_swar.take_hi();
      if (wrf.lo(16, c) != eq64Lo || wrf.hi(16, c) != eq64Hi) return false;
      const negLo = v128_swar.neg<i64>(wrf.lo(0, c), wrf.hi(0, c)),
        negHi = v128_swar.take_hi();
      if (wrf.lo(21, c) != negLo || wrf.hi(21, c) != negHi) return false;
      const absLo = v128_swar.abs<i64>(wrf.lo(0, c), wrf.hi(0, c)),
        absHi = v128_swar.take_hi();
      if (wrf.lo(22, c) != absLo || wrf.hi(22, c) != absHi) return false;
      const shlLo = v128_swar.shl<i64>(wrf.lo(0, c), wrf.hi(0, c), shift),
        shlHi = v128_swar.take_hi();
      if (wrf.lo(23, c) != shlLo || wrf.hi(23, c) != shlHi) return false;
      const neg32Lo = v128_swar.neg<i32>(wrf.lo(0, c), wrf.hi(0, c)),
        neg32Hi = v128_swar.take_hi();
      if (wrf.lo(27, c) != neg32Lo || wrf.hi(27, c) != neg32Hi) return false;
      const abs32Lo = v128_swar.abs<i32>(wrf.lo(0, c), wrf.hi(0, c)),
        abs32Hi = v128_swar.take_hi();
      if (wrf.lo(28, c) != abs32Lo || wrf.hi(28, c) != abs32Hi) return false;
      const shl32Lo = v128_swar.shl<i32>(wrf.lo(0, c), wrf.hi(0, c), shift),
        shl32Hi = v128_swar.take_hi();
      if (wrf.lo(29, c) != shl32Lo || wrf.hi(29, c) != shl32Hi) return false;
      const abs8Lo = v128_swar.abs<i8>(wrf.lo(0, c), wrf.hi(0, c)),
        abs8Hi = v128_swar.take_hi();
      if (wrf.lo(33, c) != abs8Lo || wrf.hi(33, c) != abs8Hi) return false;
      const abs16Lo = v128_swar.abs<i16>(wrf.lo(0, c), wrf.hi(0, c)),
        abs16Hi = v128_swar.take_hi();
      if (wrf.lo(34, c) != abs16Lo || wrf.hi(34, c) != abs16Hi) return false;
      const neg16Lo = v128_swar.neg<i16>(wrf.lo(0, c), wrf.hi(0, c)),
        neg16Hi = v128_swar.take_hi();
      if (wrf.lo(35, c) != neg16Lo || wrf.hi(35, c) != neg16Hi) return false;
      const shr16Lo = v128_swar.shr<i16>(wrf.lo(0, c), wrf.hi(0, c), shift),
        shr16Hi = v128_swar.take_hi();
      if (wrf.lo(36, c) != shr16Lo || wrf.hi(36, c) != shr16Hi) return false;
      const avgr16Lo = v128_swar.avgr<u16>(
          wrf.lo(0, c),
          wrf.hi(0, c),
          wrf.lo(1, c),
          wrf.hi(1, c),
        ),
        avgr16Hi = v128_swar.take_hi();
      if (wrf.lo(37, c) != avgr16Lo || wrf.hi(37, c) != avgr16Hi) return false;
    }
    const lo = v128_swar.lt<u32>(
      wrf.lo(0, c),
      wrf.hi(0, c),
      wrf.lo(1, c),
      wrf.hi(1, c),
    );
    const hi = v128_swar.take_hi();
    if (wrf.lo(3, c) != lo || wrf.hi(3, c) != hi) return false;
    const mulLo = v128_swar.mul<i8>(
      wrf.lo(0, c),
      wrf.hi(0, c),
      wrf.lo(1, c),
      wrf.hi(1, c),
    );
    const mulHi = v128_swar.take_hi();
    if (wrf.lo(4, c) != mulLo || wrf.hi(4, c) != mulHi) return false;
    const addLo = v128_swar.add<i64>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      ),
      addHi = v128_swar.take_hi();
    if (wrf.lo(9, c) != addLo || wrf.hi(9, c) != addHi) return false;
    const subLo = v128_swar.sub<i64>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      ),
      subHi = v128_swar.take_hi();
    if (wrf.lo(10, c) != subLo || wrf.hi(10, c) != subHi) return false;
    const min32Lo = v128_swar.min<i32>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      ),
      min32Hi = v128_swar.take_hi();
    if (wrf.lo(11, c) != min32Lo || wrf.hi(11, c) != min32Hi) return false;
    const min64Lo = v128_swar.min<i64>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      ),
      min64Hi = v128_swar.take_hi();
    if (wrf.lo(12, c) != min64Lo || wrf.hi(12, c) != min64Hi) return false;
    const lt32Lo = v128_swar.lt<i32>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      ),
      lt32Hi = v128_swar.take_hi();
    if (wrf.lo(17, c) != lt32Lo || wrf.hi(17, c) != lt32Hi) return false;
    const lt64Lo = v128_swar.lt<i64>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      ),
      lt64Hi = v128_swar.take_hi();
    if (wrf.lo(18, c) != lt64Lo || wrf.hi(18, c) != lt64Hi) return false;
    const ltu64Lo = v128_swar.lt<u64>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      ),
      ltu64Hi = v128_swar.take_hi();
    if (wrf.lo(19, c) != ltu64Lo || wrf.hi(19, c) != ltu64Hi) return false;
    const eq64Lo = v128_swar.eq<i64>(
        wrf.lo(0, c),
        wrf.hi(0, c),
        wrf.lo(1, c),
        wrf.hi(1, c),
      ),
      eq64Hi = v128_swar.take_hi();
    if (wrf.lo(20, c) != eq64Lo || wrf.hi(20, c) != eq64Hi) return false;
    const negLo = v128_swar.neg<i64>(wrf.lo(0, c), wrf.hi(0, c)),
      negHi = v128_swar.take_hi();
    if (wrf.lo(24, c) != negLo || wrf.hi(24, c) != negHi) return false;
    const absLo = v128_swar.abs<i64>(wrf.lo(0, c), wrf.hi(0, c)),
      absHi = v128_swar.take_hi();
    if (wrf.lo(25, c) != absLo || wrf.hi(25, c) != absHi) return false;
    const shlLo = v128_swar.shl<i64>(wrf.lo(0, c), wrf.hi(0, c), shift),
      shlHi = v128_swar.take_hi();
    if (wrf.lo(26, c) != shlLo || wrf.hi(26, c) != shlHi) return false;
    const neg32Lo = v128_swar.neg<i32>(wrf.lo(0, c), wrf.hi(0, c)),
      neg32Hi = v128_swar.take_hi();
    if (wrf.lo(30, c) != neg32Lo || wrf.hi(30, c) != neg32Hi) return false;
    const abs32Lo = v128_swar.abs<i32>(wrf.lo(0, c), wrf.hi(0, c)),
      abs32Hi = v128_swar.take_hi();
    if (wrf.lo(31, c) != abs32Lo || wrf.hi(31, c) != abs32Hi) return false;
    const shl32Lo = v128_swar.shl<i32>(wrf.lo(0, c), wrf.hi(0, c), shift),
      shl32Hi = v128_swar.take_hi();
    if (wrf.lo(32, c) != shl32Lo || wrf.hi(32, c) != shl32Hi) return false;
  }

  const x256 = new v256(
    unchecked(words[0]),
    unchecked(words[1]),
    unchecked(words[2]),
    unchecked(words[3]),
  );
  const y256 = new v256(
    unchecked(words[4]),
    unchecked(words[5]),
    unchecked(words[6]),
    unchecked(words[7]),
  );
  const p256 = v256.mul<i16>(x256, y256);
  const p0 = v128_swar.mul<i16>(x256.w0, x256.w1, y256.w0, y256.w1),
    p1 = v128_swar.take_hi();
  const p2 = v128_swar.mul<i16>(x256.w2, x256.w3, y256.w2, y256.w3),
    p3 = v128_swar.take_hi();
  if (p256.w0 != p0 || p256.w1 != p1 || p256.w2 != p2 || p256.w3 != p3)
    return false;

  const x512 = new v512(
    unchecked(words[0]),
    unchecked(words[1]),
    unchecked(words[2]),
    unchecked(words[3]),
    unchecked(words[4]),
    unchecked(words[5]),
    unchecked(words[6]),
    unchecked(words[7]),
  );
  const y512 = new v512(
    unchecked(words[8]),
    unchecked(words[9]),
    unchecked(words[10]),
    unchecked(words[11]),
    unchecked(words[12]),
    unchecked(words[13]),
    unchecked(words[14]),
    unchecked(words[15]),
  );
  const q512 = v512.lt<u32>(x512, y512);
  const q0 = v128_swar.lt<u32>(x512.w0, x512.w1, y512.w0, y512.w1),
    q1 = v128_swar.take_hi();
  const q2 = v128_swar.lt<u32>(x512.w2, x512.w3, y512.w2, y512.w3),
    q3 = v128_swar.take_hi();
  const q4 = v128_swar.lt<u32>(x512.w4, x512.w5, y512.w4, y512.w5),
    q5 = v128_swar.take_hi();
  const q6 = v128_swar.lt<u32>(x512.w6, x512.w7, y512.w6, y512.w7),
    q7 = v128_swar.take_hi();
  if (
    q512.w0 != q0 ||
    q512.w1 != q1 ||
    q512.w2 != q2 ||
    q512.w3 != q3 ||
    q512.w4 != q4 ||
    q512.w5 != q5 ||
    q512.w6 != q6 ||
    q512.w7 != q7
  )
    return false;
  return true;
}).generate((seed: FuzzSeed, run: (words: u64[]) => bool): void => {
  const words = seed.array<u64>((s: FuzzSeed): u64 => s.u64(), {
    min: 16,
    max: 16,
  });
  expect<bool>(run(words)).toBe(true);
});

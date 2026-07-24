import { V128Fallback } from "../v128/value";

/** Immutable, value-semantics 256-bit facade composed from two 128-bit chunks. */
export class V256 {
  readonly c0: V128Fallback;
  readonly c1: V128Fallback;


  @inline constructor(c0: V128Fallback, c1: V128Fallback) {
    this.c0 = c0;
    this.c1 = c1;
  }


  @inline static load(ptr: usize, offset: usize = 0): V256 {
    return new V256(
      V128Fallback.load(ptr, offset),
      V128Fallback.load(ptr, offset + 16),
    );
  }


  @inline static store(ptr: usize, value: V256, offset: usize = 0): void {
    V128Fallback.store(ptr, value.c0, offset);
    V128Fallback.store(ptr, value.c1, offset + 16);
  }


  @inline static splat<T>(x: T): V256 {
    const c = V128Fallback.splat<T>(x);
    return new V256(c, c);
  }


  @inline static add<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.add<T>(a.c0, b.c0),
      V128Fallback.add<T>(a.c1, b.c1),
    );
  }


  @inline static sub<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.sub<T>(a.c0, b.c0),
      V128Fallback.sub<T>(a.c1, b.c1),
    );
  }


  @inline static mul<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.mul<T>(a.c0, b.c0),
      V128Fallback.mul<T>(a.c1, b.c1),
    );
  }


  @inline static neg<T>(a: V256): V256 {
    return new V256(V128Fallback.neg<T>(a.c0), V128Fallback.neg<T>(a.c1));
  }


  @inline static abs<T>(a: V256): V256 {
    return new V256(V128Fallback.abs<T>(a.c0), V128Fallback.abs<T>(a.c1));
  }


  @inline static add_sat<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.add_sat<T>(a.c0, b.c0),
      V128Fallback.add_sat<T>(a.c1, b.c1),
    );
  }


  @inline static sub_sat<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.sub_sat<T>(a.c0, b.c0),
      V128Fallback.sub_sat<T>(a.c1, b.c1),
    );
  }


  @inline static avgr<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.avgr<T>(a.c0, b.c0),
      V128Fallback.avgr<T>(a.c1, b.c1),
    );
  }


  @inline static min<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.min<T>(a.c0, b.c0),
      V128Fallback.min<T>(a.c1, b.c1),
    );
  }


  @inline static max<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.max<T>(a.c0, b.c0),
      V128Fallback.max<T>(a.c1, b.c1),
    );
  }


  @inline static shl<T>(a: V256, shift: i32): V256 {
    return new V256(
      V128Fallback.shl<T>(a.c0, shift),
      V128Fallback.shl<T>(a.c1, shift),
    );
  }


  @inline static shr<T>(a: V256, shift: i32): V256 {
    return new V256(
      V128Fallback.shr<T>(a.c0, shift),
      V128Fallback.shr<T>(a.c1, shift),
    );
  }


  @inline static eq<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.eq<T>(a.c0, b.c0),
      V128Fallback.eq<T>(a.c1, b.c1),
    );
  }


  @inline static ne<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.ne<T>(a.c0, b.c0),
      V128Fallback.ne<T>(a.c1, b.c1),
    );
  }


  @inline static lt<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.lt<T>(a.c0, b.c0),
      V128Fallback.lt<T>(a.c1, b.c1),
    );
  }


  @inline static le<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.le<T>(a.c0, b.c0),
      V128Fallback.le<T>(a.c1, b.c1),
    );
  }


  @inline static gt<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.gt<T>(a.c0, b.c0),
      V128Fallback.gt<T>(a.c1, b.c1),
    );
  }


  @inline static ge<T>(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.ge<T>(a.c0, b.c0),
      V128Fallback.ge<T>(a.c1, b.c1),
    );
  }


  @inline static and(a: V256, b: V256): V256 {
    return new V256(V128Fallback.and(a.c0, b.c0), V128Fallback.and(a.c1, b.c1));
  }


  @inline static or(a: V256, b: V256): V256 {
    return new V256(V128Fallback.or(a.c0, b.c0), V128Fallback.or(a.c1, b.c1));
  }


  @inline static xor(a: V256, b: V256): V256 {
    return new V256(V128Fallback.xor(a.c0, b.c0), V128Fallback.xor(a.c1, b.c1));
  }


  @inline static andnot(a: V256, b: V256): V256 {
    return new V256(
      V128Fallback.andnot(a.c0, b.c0),
      V128Fallback.andnot(a.c1, b.c1),
    );
  }


  @inline static not(a: V256): V256 {
    return new V256(V128Fallback.not(a.c0), V128Fallback.not(a.c1));
  }


  @inline static bitselect(a: V256, b: V256, m: V256): V256 {
    return new V256(
      V128Fallback.bitselect(a.c0, b.c0, m.c0),
      V128Fallback.bitselect(a.c1, b.c1, m.c1),
    );
  }


  @inline static any_true(a: V256): bool {
    return V128Fallback.any_true(a.c0) || V128Fallback.any_true(a.c1);
  }


  @inline static all_true<T>(a: V256): bool {
    return V128Fallback.all_true<T>(a.c0) && V128Fallback.all_true<T>(a.c1);
  }


  @inline static bitmask<T>(a: V256): u64 {
    return (
      (V128Fallback.bitmask<T>(a.c0) as u32 as u64) |
      ((V128Fallback.bitmask<T>(a.c1) as u32 as u64) << (16 / sizeof<T>()))
    );
  }


  @inline static extract_lane<T>(a: V256, idx: u32): T {
    const n = (16 / sizeof<T>()) as u32;
    const lane = idx % (n * 2);
    return lane < n
      ? V128Fallback.extract_lane<T>(a.c0, lane as u8)
      : V128Fallback.extract_lane<T>(a.c1, (lane - n) as u8);
  }


  @inline static replace_lane<T>(a: V256, idx: u32, value: T): V256 {
    const n = (16 / sizeof<T>()) as u32;
    const lane = idx % (n * 2);
    return lane < n
      ? new V256(V128Fallback.replace_lane<T>(a.c0, lane as u8, value), a.c1)
      : new V256(
          a.c0,
          V128Fallback.replace_lane<T>(a.c1, (lane - n) as u8, value),
        );
  }
}

/** Immutable, value-semantics 512-bit facade composed from four 128-bit chunks. */
export class V512 {
  readonly c0: V128Fallback;
  readonly c1: V128Fallback;
  readonly c2: V128Fallback;
  readonly c3: V128Fallback;


  @inline constructor(
    c0: V128Fallback,
    c1: V128Fallback,
    c2: V128Fallback,
    c3: V128Fallback,
  ) {
    this.c0 = c0;
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
  }


  @inline static load(ptr: usize, offset: usize = 0): V512 {
    return new V512(
      V128Fallback.load(ptr, offset),
      V128Fallback.load(ptr, offset + 16),
      V128Fallback.load(ptr, offset + 32),
      V128Fallback.load(ptr, offset + 48),
    );
  }


  @inline static store(ptr: usize, value: V512, offset: usize = 0): void {
    V128Fallback.store(ptr, value.c0, offset);
    V128Fallback.store(ptr, value.c1, offset + 16);
    V128Fallback.store(ptr, value.c2, offset + 32);
    V128Fallback.store(ptr, value.c3, offset + 48);
  }


  @inline static splat<T>(x: T): V512 {
    const c = V128Fallback.splat<T>(x);
    return new V512(c, c, c, c);
  }


  @inline static add<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.add<T>(a.c0, b.c0),
      V128Fallback.add<T>(a.c1, b.c1),
      V128Fallback.add<T>(a.c2, b.c2),
      V128Fallback.add<T>(a.c3, b.c3),
    );
  }


  @inline static sub<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.sub<T>(a.c0, b.c0),
      V128Fallback.sub<T>(a.c1, b.c1),
      V128Fallback.sub<T>(a.c2, b.c2),
      V128Fallback.sub<T>(a.c3, b.c3),
    );
  }


  @inline static mul<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.mul<T>(a.c0, b.c0),
      V128Fallback.mul<T>(a.c1, b.c1),
      V128Fallback.mul<T>(a.c2, b.c2),
      V128Fallback.mul<T>(a.c3, b.c3),
    );
  }


  @inline static neg<T>(a: V512): V512 {
    return new V512(
      V128Fallback.neg<T>(a.c0),
      V128Fallback.neg<T>(a.c1),
      V128Fallback.neg<T>(a.c2),
      V128Fallback.neg<T>(a.c3),
    );
  }


  @inline static abs<T>(a: V512): V512 {
    return new V512(
      V128Fallback.abs<T>(a.c0),
      V128Fallback.abs<T>(a.c1),
      V128Fallback.abs<T>(a.c2),
      V128Fallback.abs<T>(a.c3),
    );
  }


  @inline static add_sat<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.add_sat<T>(a.c0, b.c0),
      V128Fallback.add_sat<T>(a.c1, b.c1),
      V128Fallback.add_sat<T>(a.c2, b.c2),
      V128Fallback.add_sat<T>(a.c3, b.c3),
    );
  }


  @inline static sub_sat<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.sub_sat<T>(a.c0, b.c0),
      V128Fallback.sub_sat<T>(a.c1, b.c1),
      V128Fallback.sub_sat<T>(a.c2, b.c2),
      V128Fallback.sub_sat<T>(a.c3, b.c3),
    );
  }


  @inline static avgr<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.avgr<T>(a.c0, b.c0),
      V128Fallback.avgr<T>(a.c1, b.c1),
      V128Fallback.avgr<T>(a.c2, b.c2),
      V128Fallback.avgr<T>(a.c3, b.c3),
    );
  }


  @inline static min<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.min<T>(a.c0, b.c0),
      V128Fallback.min<T>(a.c1, b.c1),
      V128Fallback.min<T>(a.c2, b.c2),
      V128Fallback.min<T>(a.c3, b.c3),
    );
  }


  @inline static max<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.max<T>(a.c0, b.c0),
      V128Fallback.max<T>(a.c1, b.c1),
      V128Fallback.max<T>(a.c2, b.c2),
      V128Fallback.max<T>(a.c3, b.c3),
    );
  }


  @inline static shl<T>(a: V512, shift: i32): V512 {
    return new V512(
      V128Fallback.shl<T>(a.c0, shift),
      V128Fallback.shl<T>(a.c1, shift),
      V128Fallback.shl<T>(a.c2, shift),
      V128Fallback.shl<T>(a.c3, shift),
    );
  }


  @inline static shr<T>(a: V512, shift: i32): V512 {
    return new V512(
      V128Fallback.shr<T>(a.c0, shift),
      V128Fallback.shr<T>(a.c1, shift),
      V128Fallback.shr<T>(a.c2, shift),
      V128Fallback.shr<T>(a.c3, shift),
    );
  }


  @inline static eq<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.eq<T>(a.c0, b.c0),
      V128Fallback.eq<T>(a.c1, b.c1),
      V128Fallback.eq<T>(a.c2, b.c2),
      V128Fallback.eq<T>(a.c3, b.c3),
    );
  }


  @inline static ne<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.ne<T>(a.c0, b.c0),
      V128Fallback.ne<T>(a.c1, b.c1),
      V128Fallback.ne<T>(a.c2, b.c2),
      V128Fallback.ne<T>(a.c3, b.c3),
    );
  }


  @inline static lt<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.lt<T>(a.c0, b.c0),
      V128Fallback.lt<T>(a.c1, b.c1),
      V128Fallback.lt<T>(a.c2, b.c2),
      V128Fallback.lt<T>(a.c3, b.c3),
    );
  }


  @inline static le<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.le<T>(a.c0, b.c0),
      V128Fallback.le<T>(a.c1, b.c1),
      V128Fallback.le<T>(a.c2, b.c2),
      V128Fallback.le<T>(a.c3, b.c3),
    );
  }


  @inline static gt<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.gt<T>(a.c0, b.c0),
      V128Fallback.gt<T>(a.c1, b.c1),
      V128Fallback.gt<T>(a.c2, b.c2),
      V128Fallback.gt<T>(a.c3, b.c3),
    );
  }


  @inline static ge<T>(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.ge<T>(a.c0, b.c0),
      V128Fallback.ge<T>(a.c1, b.c1),
      V128Fallback.ge<T>(a.c2, b.c2),
      V128Fallback.ge<T>(a.c3, b.c3),
    );
  }


  @inline static and(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.and(a.c0, b.c0),
      V128Fallback.and(a.c1, b.c1),
      V128Fallback.and(a.c2, b.c2),
      V128Fallback.and(a.c3, b.c3),
    );
  }


  @inline static or(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.or(a.c0, b.c0),
      V128Fallback.or(a.c1, b.c1),
      V128Fallback.or(a.c2, b.c2),
      V128Fallback.or(a.c3, b.c3),
    );
  }


  @inline static xor(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.xor(a.c0, b.c0),
      V128Fallback.xor(a.c1, b.c1),
      V128Fallback.xor(a.c2, b.c2),
      V128Fallback.xor(a.c3, b.c3),
    );
  }


  @inline static andnot(a: V512, b: V512): V512 {
    return new V512(
      V128Fallback.andnot(a.c0, b.c0),
      V128Fallback.andnot(a.c1, b.c1),
      V128Fallback.andnot(a.c2, b.c2),
      V128Fallback.andnot(a.c3, b.c3),
    );
  }


  @inline static not(a: V512): V512 {
    return new V512(
      V128Fallback.not(a.c0),
      V128Fallback.not(a.c1),
      V128Fallback.not(a.c2),
      V128Fallback.not(a.c3),
    );
  }


  @inline static bitselect(a: V512, b: V512, m: V512): V512 {
    return new V512(
      V128Fallback.bitselect(a.c0, b.c0, m.c0),
      V128Fallback.bitselect(a.c1, b.c1, m.c1),
      V128Fallback.bitselect(a.c2, b.c2, m.c2),
      V128Fallback.bitselect(a.c3, b.c3, m.c3),
    );
  }


  @inline static any_true(a: V512): bool {
    return (
      V128Fallback.any_true(a.c0) ||
      V128Fallback.any_true(a.c1) ||
      V128Fallback.any_true(a.c2) ||
      V128Fallback.any_true(a.c3)
    );
  }


  @inline static all_true<T>(a: V512): bool {
    return (
      V128Fallback.all_true<T>(a.c0) &&
      V128Fallback.all_true<T>(a.c1) &&
      V128Fallback.all_true<T>(a.c2) &&
      V128Fallback.all_true<T>(a.c3)
    );
  }


  @inline static bitmask<T>(a: V512): u64 {
    const n = 16 / sizeof<T>();
    return (
      (V128Fallback.bitmask<T>(a.c0) as u32 as u64) |
      ((V128Fallback.bitmask<T>(a.c1) as u32 as u64) << n) |
      ((V128Fallback.bitmask<T>(a.c2) as u32 as u64) << (n * 2)) |
      ((V128Fallback.bitmask<T>(a.c3) as u32 as u64) << (n * 3))
    );
  }


  @inline static extract_lane<T>(a: V512, idx: u32): T {
    const n = (16 / sizeof<T>()) as u32;
    const lane = idx % (n * 4),
      chunk = lane / n,
      inner = (lane % n) as u8;
    if (chunk == 0) return V128Fallback.extract_lane<T>(a.c0, inner);
    if (chunk == 1) return V128Fallback.extract_lane<T>(a.c1, inner);
    if (chunk == 2) return V128Fallback.extract_lane<T>(a.c2, inner);
    return V128Fallback.extract_lane<T>(a.c3, inner);
  }


  @inline static replace_lane<T>(a: V512, idx: u32, value: T): V512 {
    const n = (16 / sizeof<T>()) as u32;
    const lane = idx % (n * 4),
      chunk = lane / n,
      inner = (lane % n) as u8;
    if (chunk == 0)
      return new V512(
        V128Fallback.replace_lane<T>(a.c0, inner, value),
        a.c1,
        a.c2,
        a.c3,
      );
    if (chunk == 1)
      return new V512(
        a.c0,
        V128Fallback.replace_lane<T>(a.c1, inner, value),
        a.c2,
        a.c3,
      );
    if (chunk == 2)
      return new V512(
        a.c0,
        a.c1,
        V128Fallback.replace_lane<T>(a.c2, inner, value),
        a.c3,
      );
    return new V512(
      a.c0,
      a.c1,
      a.c2,
      V128Fallback.replace_lane<T>(a.c3, inner, value),
    );
  }
}

let __as_simd_tmp_hi: u64 = 0;

export namespace i32x4_pair {
  // @ts-expect-error: decorator
  @inline export function pack2(a: i32, b: i32): u64 {
    return (a as u32 as u64) | ((b as u32 as u64) << 32);
  }
  // @ts-expect-error: decorator
  @inline export function unpack_lo(x: u64): i32 { return (x as u32) as i32; }
  // @ts-expect-error: decorator
  @inline export function unpack_hi(x: u64): i32 { return ((x >> 32) as u32) as i32; }
  // @ts-expect-error: decorator
  @inline export function take_hi(): u64 { return __as_simd_tmp_hi; }

  // @ts-expect-error: decorator
  @inline export function add_lo(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
    const rLo = pack2(unpack_lo(aLo) + unpack_lo(bLo), unpack_hi(aLo) + unpack_hi(bLo));
    __as_simd_tmp_hi = pack2(unpack_lo(aHi) + unpack_lo(bHi), unpack_hi(aHi) + unpack_hi(bHi));
    return rLo;
  }

  // @ts-expect-error: decorator
  @inline export function load_lo(ptr: usize, immOffset: usize = 0, immAlign: usize = 1): u64 {
    const lo = pack2(load<i32>(ptr, immOffset, immAlign), load<i32>(ptr, immOffset + 4, immAlign));
    __as_simd_tmp_hi = pack2(load<i32>(ptr, immOffset + 8, immAlign), load<i32>(ptr, immOffset + 12, immAlign));
    return lo;
  }

  // @ts-expect-error: decorator
  @inline export function store_pair(ptr: usize, lo: u64, hi: u64, immOffset: usize = 0, immAlign: usize = 1): void {
    store<u64>(ptr, lo, immOffset, immAlign);
    store<u64>(ptr, hi, immOffset + 8, immAlign);
  }

  // @ts-expect-error: decorator
  @inline export function extract_lane_pair(lo: u64, hi: u64, idx: u8): i32 {
    switch (idx & 3) {
      case 0: return unpack_lo(lo);
      case 1: return unpack_hi(lo);
      case 2: return unpack_lo(hi);
      default: return unpack_hi(hi);
    }
  }
}

/** 64 registers large enough for a full 512-bit vector each. */
export const WRF_REGS: u32 = 64;
export const WRF_SLOT_BYTES: usize = 64;
const WRF_BYTES: usize = (WRF_REGS as usize) * WRF_SLOT_BYTES;

export namespace wrf {
  // `memory.data` is resolved to a fixed, aligned static segment by asc. Eager
  // allocation removes three repeated lazy-base branches from every ternary
  // wide kernel (dst/a/b), without adding runtime initialization work.
  const _base: usize = memory.data(WRF_BYTES as i32, 16);
  // @ts-expect-error: decorator
  @inline export function base(): usize { return _base; }
  // @ts-expect-error: decorator
  @inline export function addr(reg: u32): usize { return _base + ((reg as usize) << 6); }
  // @ts-expect-error: decorator
  @inline export function lo(reg: u32, chunk: u32 = 0): u64 { return load<u64>(addr(reg) + ((chunk as usize) << 4)); }
  // @ts-expect-error: decorator
  @inline export function hi(reg: u32, chunk: u32 = 0): u64 { return load<u64>(addr(reg) + ((chunk as usize) << 4), 8); }
  // @ts-expect-error: decorator
  @inline export function set128(reg: u32, chunk: u32, lo: u64, hi: u64): void {
    const p = addr(reg) + ((chunk as usize) << 4);
    store<u64>(p, lo); store<u64>(p, hi, 8);
  }
  // @ts-expect-error: decorator
  @inline export function loadBits(reg: u32, ptr: usize, bits: u32, immOffset: usize = 0): void {
    memory.copy(addr(reg), ptr + immOffset, bits >> 3);
  }
  // @ts-expect-error: decorator
  @inline export function storeBits(ptr: usize, reg: u32, bits: u32, immOffset: usize = 0): void {
    memory.copy(ptr + immOffset, addr(reg), bits >> 3);
  }
  // @ts-expect-error: decorator
  @inline export function clear(): void { memory.fill(_base, 0, WRF_BYTES); }
}

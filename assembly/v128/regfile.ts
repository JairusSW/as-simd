// Statically reserved 128-bit register file.
//
// WebAssembly globals cannot be indexed by a runtime value, so an indexed
// register file must live in linear memory. This module reserves a fixed,
// zero-initialized data segment of `RF_REGS` slots of 16 bytes each (lo:u64 at
// +0, hi:u64 at +8) and exposes typed accessors over it.
//
// It is the canonical place a 128-bit SWAR value is materialized and read back
// between operations — replacing both the `readonly [u64, u64]` multi-value
// returns and the per-type `__hi` globals as the *inter-op* storage mechanism.
// Inside a single op, the SWAR kernels still return `lo` directly and stash
// `hi` in a transient per-type global (the "global hot-path"); the register
// file is what lets callers keep many live vectors without clobbering.
//
// Caveats (identical in kind to the old `__hi` globals, just 64-wide):
//   * The file is a single module-global region — shared mutable state, not
//     reentrant across host calls and not thread-safe under wasm threads.
//   * Aliasing is safe (`dst == src`) as long as callers read every operand
//     half into locals before writing the destination slot.

/** Number of 128-bit registers in the file. MMX had 8, SSE 16 — we bump to 64. */
export const RF_REGS: u32 = 64;
/** Bytes per register slot (lo:u64 + hi:u64). */
export const RF_SLOT_BYTES: usize = 16;
const RF_BYTES: usize = (RF_REGS as usize) * RF_SLOT_BYTES;

export namespace rf {
  const _base: usize = memory.data(RF_BYTES as i32, 16);

  /** Base address of the register file (lazily allocated, 16-byte aligned). */
  // @ts-expect-error: decorator
  @inline export function base(): usize { return _base; }

  /** Byte address of register `reg`'s low half. `reg` may be a runtime value. */
  // @ts-expect-error: decorator
  @inline export function addr(reg: u32): usize { return _base + ((reg as usize) << 4); }

  /** Reads the low 64 bits of register `reg`. */
  // @ts-expect-error: decorator
  @inline export function lo(reg: u32): u64 { return load<u64>(_base + ((reg as usize) << 4)); }

  /** Reads the high 64 bits of register `reg`. */
  // @ts-expect-error: decorator
  @inline export function hi(reg: u32): u64 { return load<u64>(_base + ((reg as usize) << 4), 8); }

  /** Writes both halves of register `reg`. */
  // @ts-expect-error: decorator
  @inline export function set(reg: u32, lo: u64, hi: u64): void {
    const p = _base + ((reg as usize) << 4);
    store<u64>(p, lo);
    store<u64>(p, hi, 8);
  }

  /** Writes only the low half of register `reg`. */
  // @ts-expect-error: decorator
  @inline export function setLo(reg: u32, lo: u64): void { store<u64>(_base + ((reg as usize) << 4), lo); }

  /** Writes only the high half of register `reg`. */
  // @ts-expect-error: decorator
  @inline export function setHi(reg: u32, hi: u64): void { store<u64>(_base + ((reg as usize) << 4), hi, 8); }

  /** Loads a 128-bit value from memory into register `reg`. */
  // @ts-expect-error: decorator
  @inline export function load128(reg: u32, ptr: usize, immOffset: usize = 0, immAlign: usize = 1): void {
    set(reg, load<u64>(ptr, immOffset, immAlign), load<u64>(ptr, immOffset + 8, immAlign));
  }

  /** Stores register `reg` to memory as a 128-bit value. */
  // @ts-expect-error: decorator
  @inline export function store128(reg: u32, ptr: usize, immOffset: usize = 0, immAlign: usize = 1): void {
    const p = _base + ((reg as usize) << 4);
    store<u64>(ptr, load<u64>(p), immOffset, immAlign);
    store<u64>(ptr, load<u64>(p, 8), immOffset + 8, immAlign);
  }

  /** Zeroes every register. Primarily for tests/determinism. */
  // @ts-expect-error: decorator
  @inline export function clear(): void { memory.fill(_base, 0, RF_BYTES); }
}

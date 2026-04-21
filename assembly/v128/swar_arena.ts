const SWAR_ARENA_BYTES: usize = 16 * 1024;
const SWAR_SLOT_BYTES: usize = 16;

export namespace swar_arena {
  let base: usize = 0;
  let cursor: usize = 0;
  let end: usize = 0;

  // @ts-expect-error: decorator
  @inline function ensure(): void {
    if (base != 0) return;
    base = memory.data(SWAR_ARENA_BYTES);
    cursor = base;
    end = base + SWAR_ARENA_BYTES;
  }

  // @ts-expect-error: decorator
  @inline export function alloc16(): usize {
    ensure();
    const ptr = cursor;
    cursor += SWAR_SLOT_BYTES;
    if (cursor >= end) cursor = base;
    return ptr;
  }
}

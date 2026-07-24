import { v512r } from "./wide";

/**
 * Copies and classifies one fixed 64-byte UTF-16 block.
 *
 * This fallback is executable standard Wasm. With `WAGO_PLUGINS=wide`, the
 * as-simd transform replaces calls with Wide's scalar-result custom
 * instruction while preserving the same `(src, dst) -> u32` contract.
 */
export function json_escape_copy_utf16_64(src: usize, dst: usize): u32 {
  return v512r.copy_json_escape_bitmask_utf16_64(src, dst);
}

/** AVX-512-selectable spelling of the same portable semantic operation. */
export function json_escape_copy_utf16_64_v512(src: usize, dst: usize): u32 {
  return v512r.copy_json_escape_bitmask_utf16_64(src, dst);
}

/** Finds quote or backslash lanes in one 64-byte UTF-16 block. */
export function json_find_quote_backslash_utf16_64_v512(src: usize): u32 {
  return <u32>v512r.eq_either_splat_bitmask<i16>(src, 0x22, 0x5c);
}

/** Four fixed 64-byte blocks under one custom-instruction boundary. */
export function json_escape_copy_utf16_256_v512(src: usize, dst: usize): u32 {
  return (
    v512r.copy_json_escape_bitmask_utf16_64(src, dst) |
    v512r.copy_json_escape_bitmask_utf16_64(src + 64, dst + 64) |
    v512r.copy_json_escape_bitmask_utf16_64(src + 128, dst + 128) |
    v512r.copy_json_escape_bitmask_utf16_64(src + 192, dst + 192)
  );
}

/**
 * Copies and classifies an inclusive run of complete 64-byte blocks.
 *
 * `lastSrc` and `lastDst` point at the first byte of the final block. Keeping
 * the checked end pointers explicit lets a native plugin validate the dynamic
 * memory range once before entering its loop.
 */
@noInline
export function json_escape_copy_utf16_bulk_v512(
  src: usize,
  dst: usize,
  lastSrc: usize,
  lastDst: usize,
): u32 {
  let found: u32 = 0;
  while (src <= lastSrc) {
    found |= v512r.copy_json_escape_bitmask_utf16_64(src, dst);
    src += 64;
    dst += 64;
  }
  return found;
}

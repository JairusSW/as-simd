/**
 * Returns a nonzero value if any byte in an inclusive run of 32-byte blocks
 * has its high bit set. `last` points to the first byte of the final block.
 * The caller must provide at least one complete block.
 */
@noInline
export function ascii_scan_256(ptr: usize, last: usize): u32 {
  let found: u32 = 0;
  while (ptr <= last) {
    if (ASC_FEATURE_SIMD) {
      found |= i8x16.bitmask(v128.load(ptr)) as u32;
      found |= i8x16.bitmask(v128.load(ptr + 16)) as u32;
    } else {
      for (let i: usize = 0; i < 32; i++) found |= load<u8>(ptr + i) & 0x80;
    }
    ptr += 32;
  }
  return found;
}

/** Like ascii_scan_256, but scans inclusive 64-byte blocks. */
@noInline
export function ascii_scan_512(ptr: usize, last: usize): u32 {
  let found: u32 = 0;
  while (ptr <= last) {
    if (ASC_FEATURE_SIMD) {
      found |= i8x16.bitmask(v128.load(ptr)) as u32;
      found |= i8x16.bitmask(v128.load(ptr + 16)) as u32;
      found |= i8x16.bitmask(v128.load(ptr + 32)) as u32;
      found |= i8x16.bitmask(v128.load(ptr + 48)) as u32;
    } else {
      for (let i: usize = 0; i < 64; i++) found |= load<u8>(ptr + i) & 0x80;
    }
    ptr += 64;
  }
  return found;
}

/** Portable fallbacks for fused native Wide UTF length instructions. */
@noInline export function utf16_length_utf8_block_256(ptr: usize): i32 {
  let total = 32;
  for (let i: usize = 0; i < 32; i++) {
    const b = load<u8>(ptr + i);
    if ((b & 0xc0) == 0x80) total--;
    if ((b & 0xf8) == 0xf0) total++;
  }
  return total;
}
@noInline export function utf16_length_utf8_block_512(ptr: usize): i32 {
  let total = 64;
  for (let i: usize = 0; i < 64; i++) {
    const b = load<u8>(ptr + i);
    if ((b & 0xc0) == 0x80) total--;
    if ((b & 0xf8) == 0xf0) total++;
  }
  return total;
}
@noInline export function utf8_length_utf16_block_256(ptr: usize): i32 {
  let total = 16;
  for (let i: usize = 0; i < 16; i++) {
    const u = load<u16>(ptr + (i << 1));
    if (u >= 0x80) total++;
    if (u >= 0x800) total++;
    if (u >= 0xdc00 && u <= 0xdfff) total -= 2;
  }
  return total;
}
@noInline export function utf8_length_utf16_block_512(ptr: usize): i32 {
  let total = 32;
  for (let i: usize = 0; i < 32; i++) {
    const u = load<u16>(ptr + (i << 1));
    if (u >= 0x80) total++;
    if (u >= 0x800) total++;
    if (u >= 0xdc00 && u <= 0xdfff) total -= 2;
  }
  return total;
}

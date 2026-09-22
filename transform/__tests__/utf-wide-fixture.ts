import { utf8_validate_block_256, utf8_validate_block_512 } from "../../assembly/wide/utf8";
import { utf16_validate_block_256, utf16_validate_block_512 } from "../../assembly/wide/utf16";
import {
  utf16_length_utf8_block_256, utf16_length_utf8_block_512,
  utf8_length_utf16_block_256, utf8_length_utf16_block_512,
} from "../../assembly/wide/utf_length";

const data: usize = memory.data(128);
export function check(): i32 {
  memory.fill(data, 0, 128);
  return i32(utf8_validate_block_256(data)) + i32(utf8_validate_block_512(data))
    + i32(utf16_validate_block_256(data)) + i32(utf16_validate_block_512(data))
    + utf16_length_utf8_block_256(data) + utf16_length_utf8_block_512(data)
    + utf8_length_utf16_block_256(data) + utf8_length_utf16_block_512(data);
}

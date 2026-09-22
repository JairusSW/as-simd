import { ascii_scan_256, ascii_scan_512 } from "../../assembly/wide/ascii";

const data = memory.data(4096);

export function init(): void {
  memory.fill(data, 0x61, 4096);
}

export function scan256(n: i32): i32 {
  let sum = 0;
  for (let i = 0; i < n; i++)
    sum += ascii_scan_256(data, data + 4096 - 32) == 0;
  return sum;
}

export function scan512(n: i32): i32 {
  let sum = 0;
  for (let i = 0; i < n; i++)
    sum += ascii_scan_512(data, data + 4096 - 64) == 0;
  return sum;
}

export function check(): i32 {
  if (
    ascii_scan_256(data, data + 4096 - 32) != 0 ||
    ascii_scan_512(data, data + 4096 - 64) != 0
  )
    return 0;
  for (let i = 0; i < 4096; i++) {
    store<u8>(data + i, 0x80);
    if (
      ascii_scan_256(data, data + 4096 - 32) == 0 ||
      ascii_scan_512(data, data + 4096 - 64) == 0
    )
      return i + 1;
    store<u8>(data + i, 0x61);
  }
  return -1;
}

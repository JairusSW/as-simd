# i16x8 SIMD vs SWAR

Source: `build/logs/as/simd` (native: `i16x8.*`, swar wrapper: `i16x8-swar.*`)
Sort: highest to lowest average ops/s between SIMD and SWAR

| op | SIMD Mops/s | SWAR Mops/s | delta (SWAR vs SIMD) |
|---|---:|---:|---:|
| `extend-low-i8x16-u` | 212.3 | — | — |
| `extend-low-i8x16-s` | 211.9 | — | — |
| `extend-high-i8x16-u` | 211.8 | — | — |
| `extadd-pairwise-i8x16-s` | 210.4 | — | — |
| `extadd-pairwise-i8x16-u` | 210.4 | — | — |
| `extend-high-i8x16-s` | 206.0 | — | — |
| `extract-lane-s` | 131.5 | 273.3 | 107.8% |
| `extract-lane-u` | 136.6 | 267.1 | 95.6% |
| `shuffle` | 165.7 | — | — |
| `q15mulr-sat-s` | 164.8 | — | — |
| `narrow-i32x4-u` | 164.8 | — | — |
| `extmul-low-i8x16-u` | 163.4 | — | — |
| `extmul-high-i8x16-u` | 162.4 | — | — |
| `extmul-low-i8x16-s` | 161.9 | — | — |
| `extmul-high-i8x16-s` | 158.6 | — | — |
| `narrow-i32x4-s` | 156.7 | — | — |
| `abs` | 172.6 | 138.8 | -19.6% |
| `neg` | 137.8 | 171.3 | 24.3% |
| `avgr-u` | 136.7 | 147.7 | 8.1% |
| `ge-u` | 152.5 | 118.1 | -22.6% |
| `gt-s` | 162.0 | 107.2 | -33.8% |
| `gt-u` | 154.8 | 111.7 | -27.8% |
| `replace-lane` | 91.7 | 173.5 | 89.2% |
| `ge-s` | 154.3 | 110.9 | -28.1% |
| `all-true` | 85.2 | 170.0 | 99.6% |
| `add` | 95.2 | 155.1 | 62.9% |
| `sub` | 96.2 | 146.5 | 52.3% |
| `splat` | 137.5 | 102.1 | -25.7% |
| `max-u` | 136.8 | 100.3 | -26.6% |
| `sub-sat-u` | 135.9 | 97.5 | -28.2% |
| `sub-sat-s` | 140.3 | 91.9 | -34.5% |
| `add-sat-s` | 138.5 | 93.1 | -32.8% |
| `add-sat-u` | 141.1 | 89.5 | -36.6% |
| `le-u` | 161.0 | 64.9 | -59.7% |
| `bitmask` | 86.5 | 137.5 | 59.0% |
| `le-s` | 160.6 | 61.5 | -61.7% |
| `min-u` | 97.0 | 103.5 | 6.7% |
| `max-s` | 96.1 | 98.0 | 2.0% |
| `min-s` | 92.8 | 100.4 | 8.2% |
| `shl` | 58.7 | 131.7 | 124.4% |
| `shr-u` | 59.7 | 128.9 | 115.9% |
| `mul` | 88.0 | 95.1 | 8.1% |
| `shr-s` | 60.3 | 117.2 | 94.3% |
| `eq` | 68.4 | 103.8 | 51.7% |
| `ne` | 69.0 | 73.7 | 6.8% |
| `lt-u` | 68.8 | 65.0 | -5.6% |
| `lt-s` | 69.8 | 58.4 | -16.3% |

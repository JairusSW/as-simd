# i32x4 SIMD vs SWAR

Source: `build/logs/as/simd` (native: `i32x4.*`, swar wrapper: `i32x4-swar.*`)
Sort: highest to lowest average ops/s between SIMD and SWAR

| op | SIMD Mops/s | SWAR Mops/s | delta (SWAR vs SIMD) |
|---|---:|---:|---:|
| `bitmask` | 263.2 | 304.5 | 15.7% |
| `abs` | 269.6 | 296.0 | 9.8% |
| `neg` | 266.0 | 292.7 | 10.1% |
| `extract-lane` | 258.9 | 290.7 | 12.3% |
| `all-true` | 257.1 | 277.2 | 7.8% |
| `extend-low-i16x8-s` | 261.4 | — | — |
| `extend-low-i16x8-u` | 256.8 | — | — |
| `extadd-pairwise-i16x8-s` | 255.4 | — | — |
| `extend-high-i16x8-u` | 252.8 | — | — |
| `load` | 246.9 | 254.0 | 2.9% |
| `extend-high-i16x8-s` | 249.9 | — | — |
| `splat` | 237.7 | 254.2 | 6.9% |
| `extadd-pairwise-i16x8-u` | 244.7 | — | — |
| `sub` | 211.7 | 246.6 | 16.5% |
| `add` | 213.3 | 240.2 | 12.6% |
| `dot-i16x8-s` | 218.2 | 233.2 | 6.8% |
| `eq` | 210.7 | 239.8 | 13.8% |
| `max-u` | 214.6 | 231.6 | 7.9% |
| `ge-u` | 202.7 | 240.5 | 18.6% |
| `max-s` | 214.2 | 228.9 | 6.9% |
| `min-u` | 214.0 | 221.2 | 3.4% |
| `lt-s` | 213.6 | 220.0 | 3.0% |
| `ge-s` | 188.1 | 245.0 | 30.3% |
| `gt-s` | 210.6 | 221.4 | 5.2% |
| `min-s` | 214.4 | 217.3 | 1.4% |
| `ne` | 208.5 | 221.8 | 6.4% |
| `mul` | 209.7 | 218.9 | 4.4% |
| `le-u` | 206.2 | 218.5 | 5.9% |
| `le-s` | 204.8 | 219.7 | 7.3% |
| `gt-u` | 200.3 | 215.0 | 7.3% |
| `lt-u` | 201.1 | 214.1 | 6.5% |
| `shuffle` | 202.7 | — | — |
| `replace-lane` | 187.0 | 216.5 | 15.8% |
| `extmul-high-i16x8-s` | 198.3 | — | — |
| `extmul-low-i16x8-u` | 198.1 | — | — |
| `extmul-low-i16x8-s` | 197.7 | — | — |
| `shr-s` | 185.6 | 209.0 | 12.6% |
| `extmul-high-i16x8-u` | 197.1 | — | — |
| `shr-u` | 185.6 | 208.2 | 12.2% |
| `shl` | 185.4 | 208.2 | 12.3% |
| `store` | 180.4 | 189.3 | 4.9% |
| `load-partial` | 52.0 | 50.6 | -2.7% |
| `store-partial` | 42.9 | 47.1 | 9.8% |

# i32x4 SIMD vs SWAR

Source: `build/logs/as/simd` (native: `i32x4.*`, swar wrapper: `i32x4-swar.*`)
Sort: highest to lowest average ops/s between SIMD and SWAR

| op | SIMD Mops/s | SWAR Mops/s | delta (SWAR vs SIMD) |
|---|---:|---:|---:|
| `extract-lane` | 181.6 | 241.3 | 32.9% |
| `splat` | 176.4 | 239.1 | 35.5% |
| `extadd-pairwise-i16x8-s` | 206.2 | — | — |
| `extadd-pairwise-i16x8-u` | 196.7 | — | — |
| `bitmask` | 176.1 | 195.3 | 10.9% |
| `neg` | 179.6 | 183.9 | 2.4% |
| `all-true` | 169.2 | 170.4 | 0.7% |
| `abs` | 182.6 | 138.4 | -24.2% |
| `extmul-low-i16x8-s` | 157.3 | — | — |
| `extmul-low-i16x8-u` | 156.4 | — | — |
| `shuffle` | 154.4 | — | — |
| `extmul-high-i16x8-s` | 152.1 | — | — |
| `extmul-high-i16x8-u` | 150.8 | — | — |
| `sub` | 145.3 | 148.3 | 2.1% |
| `replace-lane` | 130.6 | 161.9 | 24.0% |
| `mul` | 141.8 | 149.3 | 5.3% |
| `add` | 146.6 | 141.1 | -3.8% |
| `eq` | 136.3 | 133.7 | -1.9% |
| `ne` | 133.5 | 130.5 | -2.3% |
| `lt-s` | 137.5 | 122.9 | -10.6% |
| `shl` | 121.3 | 136.8 | 12.8% |
| `lt-u` | 125.8 | 127.2 | 1.1% |
| `shr-u` | 115.3 | 136.3 | 18.3% |
| `max-u` | 141.8 | 95.3 | -32.8% |
| `min-s` | 141.7 | 94.5 | -33.3% |
| `shr-s` | 115.4 | 120.4 | 4.4% |
| `min-u` | 138.8 | 95.8 | -31.0% |
| `max-s` | 141.6 | 92.3 | -34.8% |
| `dot-i16x8-s` | 141.9 | 72.9 | -48.6% |
| `gt-u` | 73.8 | 127.3 | 72.4% |
| `gt-s` | 72.8 | 120.7 | 65.8% |
| `le-u` | 68.8 | 123.5 | 79.5% |
| `ge-s` | 70.3 | 120.7 | 71.6% |
| `ge-u` | 66.2 | 123.3 | 86.4% |
| `le-s` | 66.7 | 118.7 | 77.8% |
| `extend-high-i16x8-u` | 87.9 | — | — |
| `extend-low-i16x8-s` | 87.4 | — | — |
| `extend-high-i16x8-s` | 86.3 | — | — |
| `extend-low-i16x8-u` | 84.9 | — | — |

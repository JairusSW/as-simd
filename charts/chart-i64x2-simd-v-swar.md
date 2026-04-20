# i64x2 SIMD vs SWAR

Source: `build/logs/as/simd` (native: `i64x2.*`, swar wrapper: `i64x2-swar.*`)
Sort: highest to lowest average ops/s between SIMD and SWAR

| op | SIMD Mops/s | SWAR Mops/s | delta (SWAR vs SIMD) |
|---|---:|---:|---:|
| `extract-lane` | 254.9 | 269.0 | 5.5% |
| `splat` | 259.7 | 246.0 | -5.3% |
| `load` | 248.7 | 251.5 | 1.1% |
| `neg` | 256.0 | 218.3 | -14.7% |
| `bitmask` | 242.8 | 231.1 | -4.8% |
| `all-true` | 222.3 | 232.4 | 4.5% |
| `add` | 207.4 | 172.2 | -17.0% |
| `replace-lane` | 185.8 | 181.9 | -2.1% |
| `sub` | 193.2 | 166.5 | -13.8% |
| `store` | 174.4 | 178.0 | 2.0% |
| `eq` | 182.9 | 167.6 | -8.4% |
| `ne` | 177.9 | 166.2 | -6.6% |
| `shr-u` | 160.6 | 156.4 | -2.6% |
| `shl` | 161.0 | 154.9 | -3.7% |
| `shr-s` | 153.3 | 154.2 | 0.6% |
| `gt-s` | 186.1 | 65.5 | -64.8% |
| `lt-s` | 185.1 | 65.5 | -64.6% |
| `ge-s` | 182.5 | 63.3 | -65.3% |
| `le-s` | 179.7 | 65.7 | -63.5% |
| `load-partial` | 52.5 | 53.5 | 1.9% |
| `store-partial` | 48.0 | 49.3 | 2.8% |

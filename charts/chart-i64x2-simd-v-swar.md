# i64x2 SIMD vs SWAR

Source: `build/logs/as/simd` (native: `i64x2.*`, swar wrapper: `i64x2-swar.*`)
Sort: highest to lowest average ops/s between SIMD and SWAR

| op | SIMD Mops/s | SWAR Mops/s | delta (SWAR vs SIMD) |
|---|---:|---:|---:|
| `neg` | 302.6 | 287.3 | -5.1% |
| `splat` | 294.0 | 276.4 | -6.0% |
| `extract-lane` | 288.7 | 278.7 | -3.5% |
| `load` | 290.5 | 267.3 | -8.0% |
| `all-true` | 288.8 | 263.5 | -8.8% |
| `eq` | 243.7 | 224.3 | -8.0% |
| `add` | 236.2 | 226.8 | -4.0% |
| `bitmask` | 312.5 | 149.9 | -52.0% |
| `lt-s` | 232.9 | 224.1 | -3.8% |
| `sub` | 230.1 | 224.2 | -2.6% |
| `ne` | 228.7 | 217.1 | -5.1% |
| `le-s` | 210.3 | 221.8 | 5.5% |
| `gt-s` | 203.9 | 226.8 | 11.2% |
| `ge-s` | 200.4 | 219.1 | 9.4% |
| `replace-lane` | 213.5 | 202.6 | -5.1% |
| `shr-u` | 214.9 | 197.4 | -8.1% |
| `shl` | 205.1 | 199.2 | -2.9% |
| `store` | 208.7 | 192.2 | -7.9% |
| `shr-s` | 185.5 | 185.5 | -0.0% |
| `load-partial` | 59.1 | 57.4 | -2.8% |
| `store-partial` | 54.2 | 53.9 | -0.5% |

# i64x2 SIMD vs SWAR

Source: `build/logs/as/simd` (native: `i64x2.*`, swar wrapper: `i64x2-swar.*`)
Sort: highest to lowest average ops/s between SIMD and SWAR

| op | SIMD Mops/s | SWAR Mops/s | delta (SWAR vs SIMD) |
|---|---:|---:|---:|
| `extract-lane` | 219.8 | 262.7 | 19.5% |
| `neg` | 233.0 | 247.6 | 6.2% |
| `splat` | 214.0 | 245.8 | 14.9% |
| `bitmask` | 223.0 | 234.1 | 5.0% |
| `all-true` | 209.4 | 232.1 | 10.8% |
| `sub` | 176.8 | 199.4 | 12.8% |
| `add` | 180.0 | 175.3 | -2.6% |
| `eq` | 169.6 | 181.0 | 6.7% |
| `ne` | 162.7 | 177.5 | 9.1% |
| `replace-lane` | 157.4 | 175.9 | 11.8% |
| `shl` | 149.4 | 180.9 | 21.1% |
| `shr-s` | 139.6 | 180.5 | 29.3% |
| `shr-u` | 145.9 | 164.5 | 12.8% |
| `gt-s` | 173.9 | 68.4 | -60.7% |
| `ge-s` | 169.1 | 73.1 | -56.8% |
| `le-s` | 167.7 | 71.8 | -57.2% |
| `lt-s` | 165.5 | 68.8 | -58.5% |

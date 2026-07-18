# V8 SIMD/SWAR overview

Geometric means summarize each checked-in same-width benchmark table. Each operation receives equal weight; absolute throughput is not compared across families with different operation sets.

| family | operations | SWAR Mops/s | SIMD Mops/s | geo-mean speedup | median speedup | SIMD wins | best SIMD delta | worst SIMD delta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| v64 | 103 | 292.1 | 304.5 | +4.3% | +0.6% | 67/103 | `swizzle` (+125.1%) | `relaxed-laneselect` (-22.1%) |
| v128 | 40 | 230.0 | 254.2 | +10.5% | +11.5% | 38/40 | `extract-lane` (+48.4%) | `relaxed-laneselect` (-3.1%) |
| 8 × i8 | 46 | 239.3 | 249.0 | +4.1% | +0.4% | 27/46 | `swizzle` (+89.4%) | `relaxed-laneselect` (-24.1%) |
| 16 × i8 | 39 | 260.4 | 364.0 | +39.8% | +30.1% | 36/39 | `relaxed-swizzle` (+452.1%) | `shl` (-6.5%) |
| 4 × i16 | 58 | 236.1 | 231.6 | -1.9% | +0.1% | 30/58 | `abs` (+44.7%) | `gt-u` (-43.5%) |
| 8 × i16 | 47 | 239.6 | 201.9 | -15.7% | -14.0% | 1/47 | `shuffle` (+9.3%) | `ctor` (-60.6%) |
| 2 × i32 | 46 | 219.0 | 232.5 | +6.2% | +0.0% | 23/46 | `ge-u` (+102.9%) | `min-u` (-38.1%) |
| 4 × i32 | 29 | 201.9 | 246.4 | +22.0% | +25.5% | 21/29 | `bitmask` (+135.0%) | `relaxed-laneselect` (-39.2%) |
| 2 × i64 | 30 | 291.2 | 285.3 | -2.0% | -1.9% | 11/30 | `extend-low-i32x4-u` (+6.4%) | `lt-s` (-11.5%) |

Sources: the corresponding `charts/chart-*-swar-v-*-simd.md` tables. Regenerate those benchmarks before publishing a new overview.

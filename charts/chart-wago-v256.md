# Native v256 byte-add throughput

Wago Railshot; AMD Ryzen 7 7800X3D 8-Core Processor; 10 rounds; 128 dependent i8x32.add operations per invocation.

| implementation | mean ns/32B-op | min–max | million ops/s | relative native time |
|---|---:|---:|---:|---:|
| AVX2 / YMM | 0.207 | 0.206–0.211 | 4830 | 1.00× |
| paired v128 | 0.373 | 0.370–0.378 | 2684 | 1.80× |
| SWAR / i64 | 2.789 | 2.782–2.797 | 359 | 13.47× |

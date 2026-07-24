# Native v256 byte-add throughput

Wago Railshot; AMD Ryzen 7 7800X3D 8-Core Processor; 10 rounds; 128 dependent i8x32.add operations per invocation.

| implementation | mean ns/32B-op | min–max | million ops/s | relative native time |
|---|---:|---:|---:|---:|
| AVX2 / YMM | 0.195 | 0.194–0.196 | 5125 | 1.00× |
| paired v128 | 0.355 | 0.353–0.355 | 2820 | 1.82× |
| SWAR / i64 | 2.699 | 2.691–2.706 | 371 | 13.83× |

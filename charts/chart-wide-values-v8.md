# Dedicated wide-value throughput on V8

Runtime: Node v24.18.0 / V8 13.6.233.17-node.50; AMD Ryzen 7 7800X3D 8-Core Processor; median of 7 rounds.

| width | nested Mops/s | dedicated Mops/s | speedup |
|---|---:|---:|---:|
| v256 | 2.00 | 4.90 | 2.45× |
| v512 | 1.38 | 4.34 | 3.14× |

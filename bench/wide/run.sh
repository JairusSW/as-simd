#!/bin/sh
set -eu
node node_modules/assemblyscript/bin/asc.js bench/wide/bench.ts --runtime stub --transform ./transform -O3 --converge -o bench/wide/swar.wasm
node node_modules/assemblyscript/bin/asc.js bench/wide/bench.ts --runtime stub --transform ./transform --enable simd -O3 --converge -o bench/wide/simd.wasm
node bench/wide/run.mjs

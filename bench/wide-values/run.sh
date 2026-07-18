#!/bin/sh
set -eu
node node_modules/assemblyscript/bin/asc.js bench/wide-values/bench.ts --transform ./transform --enable simd -O3 --converge -o bench/wide-values/bench.wasm
node bench/wide-values/run.mjs

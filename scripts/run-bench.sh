#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUNTIMES=${RUNTIMES:-"incremental"}
ENGINES=${ENGINES:-"turbofan"}
MODE_FILTER=${JSON_MODE:-""}
TURBOFAN_FLAGS=${TURBOFAN_FLAGS:-"--no-liftoff"}
BENCH_SAMPLES=${BENCH_SAMPLES:-1}
D8_BIN=${D8_BIN:-""}
WAVM_BIN=${WAVM_BIN:-"wavm"}
WASMER_BIN=${WASMER_BIN:-"wasmer"}
WAVM_RUN_FLAGS=${WAVM_RUN_FLAGS:-"--abi=wasi --enable simd --enable bulk-memory --enable sign-extension"}
WASMER_RUN_FLAGS=${WASMER_RUN_FLAGS:-"--llvm --enable-simd --enable-relaxed-simd --enable-bulk-memory --enable-reference-types --enable-multi-value"}
# Deserialize-biased alternative to try manually:
# TURBOFAN_FLAGS="--no-liftoff --no-wasm-stack-checks --no-wasm-bounds-checks --no-wasm-tier-up --experimental-wasm-revectorize --minor-ms --minor-ms-concurrent-marking-trigger=30 --turboshaft-wasm-load-elimination"
BENCH_NAME=""
ARGS=()
RUN_V8=0
RUN_WAVM=0
RUN_WASMER=0

read -r -a WAVM_RUN_FLAGS_ARR <<< "$WAVM_RUN_FLAGS"
read -r -a WASMER_RUN_FLAGS_ARR <<< "$WASMER_RUN_FLAGS"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      [[ $# -lt 2 ]] && { echo "Missing value for --mode"; exit 1; }
      MODE_FILTER="${2^^}"
      shift 2
      ;;
    --v8)
      RUN_V8=1
      shift
      ;;
    --wavm)
      RUN_WAVM=1
      shift
      ;;
    --wasmer)
      RUN_WASMER=1
      shift
      ;;
    --compile)
      echo "The --compile flag has been removed (AOT path disabled)."
      exit 1
      ;;
    --llvm)
      RUN_WAVM=1
      shift
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ $RUN_V8 -eq 0 && $RUN_WAVM -eq 0 && $RUN_WASMER -eq 0 ]]; then
  RUN_V8=1
  RUN_WAVM=1
fi

if [[ $RUN_V8 -eq 1 ]]; then
  if [[ -z "$D8_BIN" ]]; then
    if command -v d8 >/dev/null 2>&1; then
      D8_BIN="d8"
    elif command -v v8 >/dev/null 2>&1; then
      D8_BIN="v8"
    else
      echo "❌ Neither d8 nor v8 was found in PATH"
      exit 1
    fi
  fi
fi

if [[ $RUN_WAVM -eq 1 ]]; then
  if ! command -v "$WAVM_BIN" >/dev/null 2>&1; then
    echo "❌ wavm not found in PATH (or WAVM_BIN is invalid)"
    exit 1
  fi
fi

if [[ $RUN_WASMER -eq 1 ]]; then
  if ! command -v "$WASMER_BIN" >/dev/null 2>&1; then
    echo "❌ wasmer not found in PATH (or WASMER_BIN is invalid)"
    exit 1
  fi
fi

if [[ ${#ARGS[@]} -gt 0 ]]; then
  BENCH_NAME="${ARGS[0]}"
fi

if [[ -n "$MODE_FILTER" ]]; then
  case "$MODE_FILTER" in
    SWAR|SIMD)
      ;;
    *)
      echo "Invalid mode '$MODE_FILTER'. Expected one of: swar, simd"
      exit 1
      ;;
  esac
fi

mkdir -p ./build/logs/as/{swar,simd}
mkdir -p ./build/charts

FILES=()
SWAR_ALIAS_SIMD_BENCHES=(
  "i8x16.bench.ts"
  "i16x8.bench.ts"
  "i32x4.bench.ts"
  "i64x2.bench.ts"
  "v128.bench.ts"
)

if [[ -n "$BENCH_NAME" ]]; then
  # Allow passing `abc` or `abc.bench.ts`
  RAW_BENCH_NAME="$BENCH_NAME"
  [[ "$BENCH_NAME" != *.bench.ts ]] && BENCH_NAME="$BENCH_NAME.bench.ts"

  CANDIDATES=(
    "./assembly/__benches__/$BENCH_NAME"
  )

  if [[ "$RAW_BENCH_NAME" == custom/* ]]; then
    CUSTOM_REL="${BENCH_NAME#custom/}"
    CANDIDATES+=( "./assembly/__benches__/custom/$CUSTOM_REL" )
  fi

  for f in "${CANDIDATES[@]}"; do
    [[ -f "$f" ]] && FILES+=("$f")
  done

  if [[ ${#FILES[@]} -eq 0 ]]; then
    echo "❌ No benchmark found for '$RAW_BENCH_NAME'"
    exit 1
  fi
else
  FILES=(
    ./assembly/__benches__/*.bench.ts
  )
fi

run_v8_module() {
  local engine="$1"
  local wasm_arg="$2"
  case "$engine" in
    ignition)
      "$D8_BIN" --no-opt --module ./bench/runners/assemblyscript.js -- "$wasm_arg"
      ;;
    liftoff)
      "$D8_BIN" --liftoff-only --no-opt --module ./bench/runners/assemblyscript.js -- "$wasm_arg"
      ;;
    sparkplug)
      "$D8_BIN" --sparkplug --always-sparkplug --no-opt --module ./bench/runners/assemblyscript.js -- "$wasm_arg"
      ;;
    turbofan)
      # shellcheck disable=SC2086
      "$D8_BIN" $TURBOFAN_FLAGS --module ./bench/runners/assemblyscript.js -- "$wasm_arg"
      ;;
    *)
      echo "❌ Unknown V8 engine '$engine'"
      return 1
      ;;
  esac
}

consume_bench_output() {
  local tmp
  tmp="$1"

  while IFS= read -r line; do
    if [[ "$line" == __AS_BENCH_JSON__* ]]; then
      local payload file_name json
      payload="${line#__AS_BENCH_JSON__}"
      file_name="${payload%%$'\t'*}"
      json="${payload#*$'\t'}"
      mkdir -p "$(dirname "$file_name")"
      printf "%s" "$json" >"$file_name"
    else
      echo "$line"
    fi
  done <"$tmp"
}

run_wavm_module() {
  local wasm_arg="$1"
  local tmp
  tmp="$(mktemp)"
  if ! "$WAVM_BIN" run "${WAVM_RUN_FLAGS_ARR[@]}" "./build/$wasm_arg" >"$tmp" 2>&1; then
    cat "$tmp"
    rm -f "$tmp"
    return 1
  fi

  consume_bench_output "$tmp"

  rm -f "$tmp"
}

run_wasmer_module() {
  local wasm_arg="$1"
  local tmp
  tmp="$(mktemp)"

  if ! "$WASMER_BIN" run "${WASMER_RUN_FLAGS_ARR[@]}" "./build/$wasm_arg" >"$tmp" 2>&1; then
    cat "$tmp"
    rm -f "$tmp"
    return 1
  fi

  consume_bench_output "$tmp"

  rm -f "$tmp"
}

optimize_or_fallback() {
  local in_wasm="$1"
  local out_wasm="$2"
  mv "$in_wasm" "$out_wasm"
}

for file in "${FILES[@]}"; do
    filename=$(basename -- "$file")
    filename_lower="${filename,,}"
    swar_alias_simd=0
    skip_swar_no_simd=0
    for alias_file in "${SWAR_ALIAS_SIMD_BENCHES[@]}"; do
      if [[ "$filename" == "$alias_file" ]]; then
        swar_alias_simd=1
        skip_swar_no_simd=1
        break
      fi
    done
    file_mode=""
    if [[ "$filename_lower" == simd-* || "$filename_lower" == *-simd.bench.ts ]]; then
        file_mode="SIMD"
    elif [[ "$filename_lower" == i8x16-swar.bench.ts || "$filename_lower" == i16x8-swar.bench.ts || "$filename_lower" == i32x4-swar.bench.ts || "$filename_lower" == i64x2-swar.bench.ts ]]; then
        # v128 SWAR wrappers still require SIMD-enabled builds for v128 support.
        file_mode="SIMD"
    elif [[ "$filename_lower" == swar-* || "$filename_lower" == *-swar.bench.ts ]]; then
        file_mode="SWAR"
    fi

    if [[ -n "$file_mode" && -n "$MODE_FILTER" && "$file_mode" != "$MODE_FILTER" ]]; then
        continue
    fi

    if [[ $skip_swar_no_simd -eq 1 && (-z "$MODE_FILTER" || "$MODE_FILTER" == "SWAR") ]]; then
        echo "⚠️  Skipping SWAR (SIMD-disabled) for $filename: v128-family benches require SIMD feature support in AssemblyScript."
    fi

    for runtime in $RUNTIMES; do
        output="./build/${filename%.ts}.${runtime}"

        if [[ (-z "$MODE_FILTER" || "$MODE_FILTER" == "SIMD") && (-z "$file_mode" || "$file_mode" == "SIMD") ]]; then
            npx asc "$file" -o "${output}.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime $runtime --use BENCH_SAMPLES=$BENCH_SAMPLES --use AS_BENCH_RUNTIME_V8=1 --use AS_BENCH_FORCE_SIMD=1 --enable bulk-memory --enable simd --enable relaxed-simd --enable sign-extension --exportStart start --exportRuntime || {
                echo "Build failed"
                exit 1
            }

            optimize_or_fallback "${output}.tmp" "${output}.simd.wasm"

        fi

        if [[ $skip_swar_no_simd -eq 0 && (-z "$MODE_FILTER" || "$MODE_FILTER" == "SWAR") && (-z "$file_mode" || "$file_mode" == "SWAR") ]]; then
            if [[ $swar_alias_simd -eq 1 ]]; then
              AS_SIMD_FORCE_SWAR_V128=1 npx asc "$file" -o "${output}.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime $runtime --use BENCH_SAMPLES=$BENCH_SAMPLES --use AS_BENCH_RUNTIME_V8=1 --use AS_BENCH_FORCE_SWAR=1 --transform ./transform/index.mjs --enable bulk-memory --enable sign-extension --exportStart start --exportRuntime || {
                  echo "Build failed"
                  exit 1
              }
            else
              npx asc "$file" -o "${output}.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime $runtime --use BENCH_SAMPLES=$BENCH_SAMPLES --use AS_BENCH_RUNTIME_V8=1 --use AS_BENCH_FORCE_SWAR=1 --enable bulk-memory --enable sign-extension --exportStart start --exportRuntime || {
                  echo "Build failed"
                  exit 1
              }
            fi

            optimize_or_fallback "${output}.tmp" "${output}.swar.wasm"
        fi

        argSwar="${filename%.ts}.${runtime}.swar.wasm"
        argSimd="${filename%.ts}.${runtime}.simd.wasm"

        if [[ $RUN_V8 -eq 1 ]]; then
          for engine in $ENGINES; do
            if [[ $skip_swar_no_simd -eq 0 && (-z "$MODE_FILTER" || "$MODE_FILTER" == "SWAR") && (-z "$file_mode" || "$file_mode" == "SWAR") ]]; then
              echo -e "$filename (asc/$runtime/$engine/swar/v8)\n"
              run_v8_module "$engine" "$argSwar"
            fi
            if [[ (-z "$MODE_FILTER" || "$MODE_FILTER" == "SIMD") && (-z "$file_mode" || "$file_mode" == "SIMD") ]]; then
              echo -e "$filename (asc/$runtime/$engine/simd/v8)\n"
              run_v8_module "$engine" "$argSimd"
            fi
          done
        fi

        if [[ $RUN_WAVM -eq 1 ]]; then
          if [[ (-z "$MODE_FILTER" || "$MODE_FILTER" == "SIMD") && (-z "$file_mode" || "$file_mode" == "SIMD") ]]; then
            npx asc "$file" -o "${output}.wavm.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime "$runtime" --use BENCH_SAMPLES="$BENCH_SAMPLES" --use AS_BENCH_WASI=1 --use AS_BENCH_RUNTIME_WAVM=1 --use AS_BENCH_FORCE_SIMD=1 --config ./node_modules/@assemblyscript/wasi-shim/asconfig.json --enable bulk-memory --enable simd --enable sign-extension --exportRuntime || {
              echo "WAVM WASI SIMD build failed"
              exit 1
            }
            optimize_or_fallback "${output}.wavm.tmp" "${output}.wavm.simd.wasm"
            echo -e "$filename (asc/$runtime/wavm/simd/wavm)\n"
            run_wavm_module "${filename%.ts}.${runtime}.wavm.simd.wasm"
          fi
          if [[ $skip_swar_no_simd -eq 0 && (-z "$MODE_FILTER" || "$MODE_FILTER" == "SWAR") && (-z "$file_mode" || "$file_mode" == "SWAR") ]]; then
            if [[ $swar_alias_simd -eq 1 ]]; then
              AS_SIMD_FORCE_SWAR_V128=1 npx asc "$file" -o "${output}.wavm.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime "$runtime" --use BENCH_SAMPLES="$BENCH_SAMPLES" --use AS_BENCH_WASI=1 --use AS_BENCH_RUNTIME_WAVM=1 --use AS_BENCH_FORCE_SWAR=1 --config ./node_modules/@assemblyscript/wasi-shim/asconfig.json --transform ./transform/index.mjs --enable bulk-memory --enable simd --enable sign-extension --exportRuntime || {
                echo "WAVM WASI SWAR build failed"
                exit 1
              }
            else
              npx asc "$file" -o "${output}.wavm.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime "$runtime" --use BENCH_SAMPLES="$BENCH_SAMPLES" --use AS_BENCH_WASI=1 --use AS_BENCH_RUNTIME_WAVM=1 --use AS_BENCH_FORCE_SWAR=1 --config ./node_modules/@assemblyscript/wasi-shim/asconfig.json --enable bulk-memory --enable sign-extension --exportRuntime || {
                echo "WAVM WASI SWAR build failed"
                exit 1
              }
            fi
            optimize_or_fallback "${output}.wavm.tmp" "${output}.wavm.swar.wasm"
            echo -e "$filename (asc/$runtime/wavm/swar/wavm)\n"
            run_wavm_module "${filename%.ts}.${runtime}.wavm.swar.wasm"
          fi
        fi

        if [[ $RUN_WASMER -eq 1 ]]; then
          if [[ (-z "$MODE_FILTER" || "$MODE_FILTER" == "SIMD") && (-z "$file_mode" || "$file_mode" == "SIMD") ]]; then
            npx asc "$file" -o "${output}.wasmer.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime "$runtime" --use BENCH_SAMPLES="$BENCH_SAMPLES" --use AS_BENCH_WASI=1 --use AS_BENCH_RUNTIME_WASMER=1 --use AS_BENCH_FORCE_SIMD=1 --config ./node_modules/@assemblyscript/wasi-shim/asconfig.json --enable bulk-memory --enable simd --enable relaxed-simd --enable sign-extension --exportRuntime || {
              echo "Wasmer WASI SIMD build failed"
              exit 1
            }
            optimize_or_fallback "${output}.wasmer.tmp" "${output}.wasmer.simd.wasm"
            echo -e "$filename (asc/$runtime/wasmer/simd/wasmer)\n"
            run_wasmer_module "${filename%.ts}.${runtime}.wasmer.simd.wasm"
          fi
          if [[ $skip_swar_no_simd -eq 0 && (-z "$MODE_FILTER" || "$MODE_FILTER" == "SWAR") && (-z "$file_mode" || "$file_mode" == "SWAR") ]]; then
            if [[ $swar_alias_simd -eq 1 ]]; then
              AS_SIMD_FORCE_SWAR_V128=1 npx asc "$file" -o "${output}.wasmer.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime "$runtime" --use BENCH_SAMPLES="$BENCH_SAMPLES" --use AS_BENCH_WASI=1 --use AS_BENCH_RUNTIME_WASMER=1 --use AS_BENCH_FORCE_SWAR=1 --config ./node_modules/@assemblyscript/wasi-shim/asconfig.json --transform ./transform/index.mjs --enable bulk-memory --enable simd --enable relaxed-simd --enable sign-extension --exportRuntime || {
                echo "Wasmer WASI SWAR build failed"
                exit 1
              }
            else
              npx asc "$file" -o "${output}.wasmer.tmp" -O3 --converge --noAssert --uncheckedBehavior always --runtime "$runtime" --use BENCH_SAMPLES="$BENCH_SAMPLES" --use AS_BENCH_WASI=1 --use AS_BENCH_RUNTIME_WASMER=1 --use AS_BENCH_FORCE_SWAR=1 --config ./node_modules/@assemblyscript/wasi-shim/asconfig.json --enable bulk-memory --enable sign-extension --exportRuntime || {
                echo "Wasmer WASI SWAR build failed"
                exit 1
              }
            fi
            optimize_or_fallback "${output}.wasmer.tmp" "${output}.wasmer.swar.wasm"
            echo -e "$filename (asc/$runtime/wasmer/swar/wasmer)\n"
            run_wasmer_module "${filename%.ts}.${runtime}.wasmer.swar.wasm"
          fi
        fi
    done
done

echo "Finished benchmarks"

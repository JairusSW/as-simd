// @ts-ignore: decorator allowed
@external("env", "writeFile")
declare function hostWriteFile(fileName: string, data: string): void;

// @ts-ignore: decorator allowed
@external("env", "readFile")
declare function hostReadFileBuffer(filePath: string): ArrayBuffer;

// @ts-expect-error: AS_BENCH_FORCE_SWAR may be undefined.
const BENCH_FORCE_SWAR: bool = isDefined(AS_BENCH_FORCE_SWAR);
// @ts-expect-error: AS_BENCH_FORCE_SIMD may be undefined.
const BENCH_FORCE_SIMD: bool = isDefined(AS_BENCH_FORCE_SIMD);
const SIMD_ENABLED = BENCH_FORCE_SWAR
  ? "swar"
  : BENCH_FORCE_SIMD
    ? "simd"
    : (ASC_FEATURE_SIMD ? "simd" : "swar");

@json
class BenchResult {
  language: string = "assemblyscript";
  description!: string;
  elapsed!: f64;
  bytes!: u64;
  operations!: u64;
  features!: string[];
  mbps!: f64;
  gbps!: f64;
  samples!: i32;
  elapsed_min!: f64;
  elapsed_max!: f64;
  elapsed_mean!: f64;
  elapsed_median!: f64;
  elapsed_stddev!: f64;
  ops_min!: f64;
  ops_max!: f64;
  ops_mean!: f64;
  ops_median!: f64;
  ops_stddev!: f64;
}

let result: BenchResult | null = null;

// 64KB per WebAssembly memory page
const WASM_PAGE_SIZE: usize = 64 * 1024;
// @ts-expect-error: BENCH_PREALLOC_BYTES may be undefined.
const PREALLOC_BYTES: usize = isDefined(BENCH_PREALLOC_BYTES) ? BENCH_PREALLOC_BYTES : 1 << 30; // 1GB
let preallocated = false;
// @ts-expect-error: BENCH_SAMPLES may be undefined.
const BENCH_SAMPLE_COUNT: i32 = isDefined(BENCH_SAMPLES) ? BENCH_SAMPLES : 7;
// @ts-expect-error: AS_BENCH_RUNTIME_V8 may be undefined.
const BENCH_RUNTIME_V8: bool = isDefined(AS_BENCH_RUNTIME_V8);
// @ts-expect-error: AS_BENCH_RUNTIME_LLVM may be undefined.
const BENCH_RUNTIME_LLVM: bool = isDefined(AS_BENCH_RUNTIME_LLVM);
// @ts-expect-error: AS_BENCH_RUNTIME_WAVM may be undefined.
const BENCH_RUNTIME_WAVM: bool = isDefined(AS_BENCH_RUNTIME_WAVM);
// @ts-expect-error: AS_BENCH_RUNTIME_WASMER may be undefined.
const BENCH_RUNTIME_WASMER: bool = isDefined(AS_BENCH_RUNTIME_WASMER);
const BENCH_RUNTIME_STDOUT: bool = !BENCH_RUNTIME_V8;
const BENCH_RUNTIME_NAME: string = BENCH_RUNTIME_V8
  ? "v8"
  : BENCH_RUNTIME_WAVM
    ? "wavm"
    : BENCH_RUNTIME_WASMER
      ? "wasmer"
      : BENCH_RUNTIME_LLVM
        ? "llvm"
        : "runtime";

// @ts-expect-error: @inline is a valid decorator
@inline function preallocateMemory(): void {
  if (preallocated) return;
  preallocated = true;
  if (PREALLOC_BYTES == 0) return;
  const currentPages = usize(memory.size());
  const targetPages: usize = (PREALLOC_BYTES + (WASM_PAGE_SIZE - 1)) / WASM_PAGE_SIZE;
  if (targetPages > currentPages) {
    // Ignore failure (memory.grow returns -1 on failure)
    memory.grow(i32(targetPages - currentPages));
  }
}

export function bench(description: string, routine: () => void, ops: u64 = 1_000_000, bytesPerOp: u64 = 0): void {
  preallocateMemory();
  // Run a full GC cycle before timing to reduce cross-bench noise.
  __collect();
  console.log(" - Benchmarking " + description);
  let warmup = ops / 10;
  while (--warmup) {
    routine();
  }

  const samples = BENCH_SAMPLE_COUNT > 0 ? BENCH_SAMPLE_COUNT : 1;
  const elapsedSamples = new Array<f64>(samples);
  const opsSamples = new Array<f64>(samples);

  for (let i = 0; i < samples; i++) {
    const start = performance.now();

    let count = ops;
    while (count--) {
      routine();
    }

    const end = performance.now();
    const elapsed = Math.max(1, end - start);
    const opsPerSecond = f64(ops * 1000) / elapsed;
    elapsedSamples[i] = elapsed;
    opsSamples[i] = opsPerSecond;
  }

  elapsedSamples.sort((a: f64, b: f64): i32 => a < b ? -1 : (a > b ? 1 : 0));
  opsSamples.sort((a: f64, b: f64): i32 => a < b ? -1 : (a > b ? 1 : 0));

  const elapsedMin = elapsedSamples[0];
  const elapsedMax = elapsedSamples[samples - 1];
  const elapsedMedian = elapsedSamples[samples >> 1];
  const opsMin = opsSamples[0];
  const opsMax = opsSamples[samples - 1];
  const opsMedian = opsSamples[samples >> 1];

  let elapsedSum: f64 = 0;
  let opsSum: f64 = 0;
  for (let i = 0; i < samples; i++) {
    elapsedSum += elapsedSamples[i];
    opsSum += opsSamples[i];
  }

  const elapsedMean = elapsedSum / samples;
  const opsMean = opsSum / samples;

  let elapsedVar: f64 = 0;
  let opsVar: f64 = 0;
  for (let i = 0; i < samples; i++) {
    const de = elapsedSamples[i] - elapsedMean;
    const do_ = opsSamples[i] - opsMean;
    elapsedVar += de * de;
    opsVar += do_ * do_;
  }
  const elapsedStd = Math.sqrt(elapsedVar / samples);
  const opsStd = Math.sqrt(opsVar / samples);

  let log = `   Completed benchmark in ${formatNumber(u64(Math.round(elapsedMedian)))}ms @ median ${formatNumber(u64(Math.round(opsMedian)))} ops/s`;
  log += ` [n=${samples}, mean=${formatNumber(u64(Math.round(opsMean)))}, min=${formatNumber(u64(Math.round(opsMin)))}, max=${formatNumber(u64(Math.round(opsMax)))}, sd=${formatNumber(u64(Math.round(opsStd)))}]`;

  let mbPerSec: f64 = 0;
  if (bytesPerOp > 0) {
    const totalBytes = bytesPerOp * ops;
    mbPerSec = f64(totalBytes) / (elapsedMedian / 1000) / (1000 * 1000);
    log += ` @ ${formatNumber(u64(Math.round(mbPerSec)))}MB/s`;
  }

  const features: string[] = [];
  if (ASC_FEATURE_SIMD) features.push("simd");

  result = {
    language: "assemblycript",
    description,
    elapsed: elapsedMedian,
    bytes: bytesPerOp,
    operations: ops,
    features,
    mbps: mbPerSec,
    gbps: mbPerSec / 1000,
    samples,
    elapsed_min: elapsedMin,
    elapsed_max: elapsedMax,
    elapsed_mean: elapsedMean,
    elapsed_median: elapsedMedian,
    elapsed_stddev: elapsedStd,
    ops_min: opsMin,
    ops_max: opsMax,
    ops_mean: opsMean,
    ops_median: opsMedian,
    ops_stddev: opsStd,
  };

  console.log(log + "\n");
}
export function dumpToFile(suite: string, type: string): void {
  if (result == null) return;
  const r = result!;
  const json =
    "{"
    + "\"language\":\"" + r.language + "\","
    + "\"description\":\"" + r.description + "\","
    + "\"elapsed\":" + r.elapsed.toString() + ","
    + "\"bytes\":" + r.bytes.toString() + ","
    + "\"operations\":" + r.operations.toString() + ","
    + "\"features\":[" + (r.features.length ? ("\"" + r.features.join("\",\"") + "\"") : "") + "],"
    + "\"mbps\":" + r.mbps.toString() + ","
    + "\"gbps\":" + r.gbps.toString() + ","
    + "\"samples\":" + r.samples.toString() + ","
    + "\"elapsed_min\":" + r.elapsed_min.toString() + ","
    + "\"elapsed_max\":" + r.elapsed_max.toString() + ","
    + "\"elapsed_mean\":" + r.elapsed_mean.toString() + ","
    + "\"elapsed_median\":" + r.elapsed_median.toString() + ","
    + "\"elapsed_stddev\":" + r.elapsed_stddev.toString() + ","
    + "\"ops_min\":" + r.ops_min.toString() + ","
    + "\"ops_max\":" + r.ops_max.toString() + ","
    + "\"ops_mean\":" + r.ops_mean.toString() + ","
    + "\"ops_median\":" + r.ops_median.toString() + ","
    + "\"ops_stddev\":" + r.ops_stddev.toString()
    + "}";
  const fileName = "./build/logs/as/" + SIMD_ENABLED + "/" + suite + "." + type + "." + BENCH_RUNTIME_NAME + ".json";
  if (BENCH_RUNTIME_STDOUT) {
    // LLVM/WASI path: emit structured payload to stdout for scripts/run-bench.sh.
    console.log("__AS_BENCH_JSON__" + fileName + "\t" + json);
    return;
  }
  hostWriteFile(fileName, json);
}

export function readFile(path: string): string {
  if (BENCH_RUNTIME_STDOUT) return "";
  return String.UTF8.decode(hostReadFileBuffer(path));
}

function formatNumber(n: u64): string {
  let str = n.toString();
  let len = str.length;
  let result = "";
  let commaOffset = len % 3;
  for (let i = 0; i < len; i++) {
    if (i > 0 && (i - commaOffset) % 3 == 0) result += ",";
    result += str.charAt(i);
  }
  return result;
}

const blackBoxArea = memory.data(128);
export function blackbox<T>(value: T): T {
  store<T>(blackBoxArea, value);
  return load<T>(blackBoxArea);
}

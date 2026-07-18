<h1 align="center"><pre>╔═╗ ╔═╗    ╔═╗ ╦ ╔╦╗ ╦═╗
╠═╣ ╚═╗ ══ ╚═╗ ║ ║║║ ║ ║
╩ ╩ ╚═╝    ╚═╝ ╩ ╩ ╩ ╩═╝</pre></h1>

`as-simd` is a portable vector layer and AssemblyScript transform. Write one
`v64`/`v128`/`v256`/`v512` code path; builds with `--enable simd` select measured
native WebAssembly SIMD kernels, while builds without it use allocation-free
SWAR fallbacks.

<details>
<summary>Table of Contents</summary>

- [Installation](#installation)
- [Docs](#docs)
- [Usage](#usage)
- [Examples](#examples)
- [Performance](#performance)
  - [Benchmark Overview](#benchmark-overview)
  - [Comparison to SIMD](#comparison-to-simd)
  - [Running Benchmarks Locally](#running-benchmarks-locally)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

</details>

## Installation

```bash
npm install as-simd
```

## Docs

Half-width (64-bit) usage follows the same value-oriented convention as the
AssemblyScript SIMD API. The complete width-generic surface is summarized in
[API.md](./API.md).

### One API at every width

`v128`, `v256`, and `v512` have the same method names, argument order, generic
parameters, and value semantics. Only the vector parameter/return type and the
width of `bitmask` differ:

```ts
const a128: v128 = v128.splat<i16>(10);
const b128: v128 = v128.add<i16>(a128, a128);

const a256: v256 = v256.splat<i16>(10);
const b256: v256 = v256.add<i16>(a256, a256);

const a512: v512 = v512.splat<i16>(10);
const b512: v512 = v512.add<i16>(a512, a512);
```

The native lane namespaces scale the same way:

| lanes | 128-bit | 256-bit | 512-bit |
|---|---|---|---|
| signed bytes | `i8x16` | `i8x32` | `i8x64` |
| signed 16-bit | `i16x8` | `i16x16` | `i16x32` |
| signed 32-bit | `i32x4` | `i32x8` | `i32x16` |
| signed 64-bit | `i64x2` | `i64x4` | `i64x8` |
| 32-bit floats | `f32x4` | `f32x8` | `f32x16` |
| 64-bit floats | `f64x2` | `f64x4` | `f64x8` |

Each wider namespace mirrors its v128 counterpart, with lane counts embedded
in conversion, narrowing, extension, dot-product, and shuffle method names
scaled to the vector width.

The public API does not expose destination-register forms such as
`v512r.add(dst, a, b)`. Operations take vector values and return vector values,
just like AssemblyScript's native `v128` namespace. `v128_swar` remains
available as an explicit low-level two-`u64` interface.

### Vector widths

- `v32` is a packed scalar value and delegates to the tuned `v64` SWAR kernels.
- `v64` is the allocation-free SWAR hot path.
- `v128`, `v256`, and `v512` are immutable value-semantics facades. Lowercase
  `v256` and `v512` use one raw-width managed object per result rather than a
  tree of 128-bit wrapper objects.
- `v128_swar` is the explicit allocation-free two-half primitive.
- Width-specific implementation code lives independently under
  `assembly/v256` and `assembly/v512`, allowing each width to be tuned without
  changing the shared public signatures.

The generic operations dispatch at compile time. Without `--enable simd`, the
exact same APIs use SWAR. With SIMD enabled, their 128-bit chunks use the
adaptive native/SWAR kernels selected for `v128`; enabling SIMD does not force
every operation through a native instruction.

The repository also retains width-specific register kernels as internal
benchmark and tuning machinery. Those experiments show that the native/SWAR
crossover can change with width:

| representative operation | v256 SIMD build | v512 SIMD build |
|---|---|---|
| i64 add/subtract | SWAR | 4 native chunks |
| integer negation and i32/i64 shifts | SWAR | 4 native chunks |
| u8/u16 rounded average | SWAR | 4 native chunks |
| `all_true<i64>` | SWAR | 4 native chunks |
| bitmask and saturating arithmetic | 2 native chunks | 4 native chunks |

These internal choices are backed by the repository benchmark suite and
protected by WAT code-shape tests; they are not a second public API. A separate
API-parity gate compares all 95 public methods and compiles every signature for
both v256 and v512 in SWAR and SIMD builds.

## Usage

### Transform-only flow (recommended)

Use `as-simd` directly as a transform. Its TypeScript implementation follows a
Valent-Block-style pipeline: inline small helpers, remove control-flow shells,
then rewrite the resulting pure Binaryen expression islands bottom-up to a
bounded fixed point, so one contraction can expose another outer fusion. The
domain-specific rules fuse masked bitselects, merge or factor constant masks,
turn addition of disjoint masked fields into one mask, cancel shift/repack
pairs, and avoid expanding a one-bit-per-lane comparison mask when a bitmask or
`any_true`/`all_true` reduction immediately contracts it again. Binaryen's
normal cleanup passes run after these rewrites.

Set `AS_SIMD_OPTIMIZE=0` to disable the extra pipeline for diagnostic builds.
Set `AS_SIMD_OPTIMIZE_DEBUG=1` to print the number of inspected expressions and
successful SWAR fusions.

CLI:

```bash
npx asc assembly/index.ts --transform as-simd
```

Programmatic `asc.main()`:

```js
await asc.main(["assembly/index.ts", "--transform", "as-simd"]);
```

If a tool expects a direct source entrypoint, use `as-simd/sources`.

To opt into real SIMD codegen, explicitly enable SIMD:

```bash
npx asc assembly/index.ts --transform as-simd --enable simd
```

Without explicit SIMD opt-in, imported `as-simd` APIs compile to strict SWAR.
The transform also redirects the generic AssemblyScript `v128` API as
described below; lane-specific native globals still require `--enable simd`.

### Portable vector imports and automatic injection

Portable value-semantics widths can be imported normally from the package:

```ts
import { v64, v128, v256, v512 } from "as-simd";

const a: v256 = v256.splat<i16>(4);
const b: v256 = v256.add<i16>(a, a);
```

With `--transform as-simd`, the imports may be omitted. The transform detects
uses of `v64`, `v128`, `v256`, `v512`, and the twelve wide lane namespaces in
each user source and injects only the missing names. Existing declarations and
manual imports are never overridden. The injected module specifier is derived from the transform's real
package location and the current source file, so it works from the repository
itself as well as flat npm, pnpm, linked, nested, and workspace installs. In
SIMD builds an unimported `v128` remains AssemblyScript's native
type; without SIMD it is redirected to the two-`u64` facade. The other widths
are imported from `as-simd` in both modes and dispatch their 128-bit chunks to
native SIMD or SWAR as appropriate.

For example, this source needs no import when the transform is enabled:

```ts
const a = v256.splat<i16>(4);
const b = v256.add<i16>(a, a);
export const lane0 = v256.extract_lane<i16>(b, 0);
```

Compile it as strict portable SWAR or adaptive SIMD without changing the source:

```bash
npx asc assembly/index.ts --transform as-simd
npx asc assembly/index.ts --transform as-simd --enable simd
```

Set `AS_SIMD_AUTO_INJECT=0` to require explicit imports. The narrower
`AS_SIMD_V128_FALLBACK=0` switch leaves an unimported `v128` native-only while
continuing to inject the other widths. Lane-specific builtin namespaces such
as `i8x16` remain native-only; portable source should use the generic width
names or explicit `i8x16_swar` APIs.

The lowercase `v256` and `v512` value types store all four or eight scalar words
directly in one immutable value object. For a strict zero-allocation low-level
loop, use `v64` or `v128_swar`.

For IntelliSense on global aliases, include:

```json
{
  "include": ["./node_modules/as-simd/globals.d.ts"]
}
```

### Explicit import flow

```ts
import { i8x8 } from "as-simd";

const a = i8x8(1, 2, 3, 4, 5, 6, 7, 8);
const b = i8x8(8, 7, 6, 5, 4, 3, 2, 1);

const sum = i8x8.add(a, b);
const product = i8x8.mul(a, b);
const sat = i8x8.add_sat_s(a, b);

const lane3 = i8x8.extract_lane_s(sum, 3);
```

## Examples

### Lane operations

```ts
import { i8x8 } from "as-simd";

let x = i8x8.splat(5); // [5,5,5,5,5,5,5,5]
x = i8x8.replace_lane(x, 2, -7); // [5,5,-7,5,5,5,5,5]
const v = i8x8.extract_lane_s(x, 2); // -7
```

### Wide vectors

```ts
import { v512 } from "as-simd";

const a = v512.splat<i16>(32000);
const b = v512.splat<i16>(1000);
const sum = v512.add_sat<i16>(a, b);

const last = v512.extract_lane<i16>(sum, 31); // 32767
```

### Arithmetic and comparisons

```ts
import { i8x8 } from "as-simd";

const a = i8x8(10, -2, 30, -40, 50, -60, 70, -80);
const b = i8x8(1, 2, 3, 4, 5, 6, 7, 8);

const sub = i8x8.sub(a, b);
const mul = i8x8.mul(a, b);
const lt = i8x8.lt_s(a, b); // lane masks: 0x00 or 0xFF per lane
const laneMask = i8x8.bitmask_lane(lt); // 0x80 in each truthy lane

// Existing bitmask() returns packed lane bits. ctz(mask) << 3 gives
// the byte shift for the first truthy lane.
const firstByteShift = ctz(i8x8.bitmask(lt)) << 3;

// bitmask_lane() returns a vector-shaped mask. ctz(mask) >> 3 gives
// the first truthy lane index.
const firstLane = ctz(laneMask) >> 3;
```

### Saturating and narrowing operations

```ts
import { i8x8 } from "as-simd";

const hi = i8x8(120, 120, -120, -120, 100, -100, 127, -128);
const lo = i8x8(20, 40, -20, -40, 50, -50, 1, -1);

const satAdd = i8x8.add_sat_s(hi, lo);
const satSubU = i8x8.sub_sat_u(hi, lo);

// narrow from packed i16 lanes in two v64 values -> one i8x8
const narrowed = i8x8.narrow_i16x4_s(0x0001000200030004, 0xfff0fff1fff2fff3);
```

### Shuffle and swizzle

```ts
import { i8x8 } from "as-simd";

const a = i8x8(0, 1, 2, 3, 4, 5, 6, 7);
const b = i8x8(10, 11, 12, 13, 14, 15, 16, 17);

const mixed = i8x8.shuffle(a, b, 0, 1, 8, 9, 2, 10, 3, 11);
const indexed = i8x8.swizzle(a, i8x8(7, 6, 5, 4, 3, 2, 1, 0));
```

## Performance

`as-simd` focuses on lane-parallel `i8x8` behavior with multiple implementations:

- scalar mirror (`assembly/scalar/i8x8.ts`) for correctness oracle behavior
- SWAR implementation (`assembly/v64/i8x8.ts`) for baseline portability
- SIMD-enabled code paths (compile-time gated by `ASC_FEATURE_SIMD`) where profitable

Correctness is validated by:

- deterministic unit parity tests against scalar
- mode-specific fuzz parity in SWAR and SIMD builds

All generated charts and exact Markdown result tables are in
[charts](./charts/).

### Benchmark Overview

These summaries use the geometric mean across every operation in each
same-width V8 benchmark suite. Each operation gets equal weight, and the
families are not treated as equivalent workloads. The [overview table](charts/chart-overview-v8.md)
includes sample counts, medians, win counts, and the best and worst operation
for each family.

![V8 SWAR and SIMD throughput overview](https://raw.githubusercontent.com/JairusSW/as-simd/refs/heads/main/charts/chart-overview-v8.svg)

![Native SIMD speedup over SWAR on V8](https://raw.githubusercontent.com/JairusSW/as-simd/refs/heads/main/charts/chart-speedup-v8.svg)

The register-kernel chart records internal implementation research used to
choose native SIMD versus SWAR paths. These destination-register helpers are
not a second public API. See the [register benchmark table](charts/chart-register-v8.md)
for exact values.

![Register-backed v128 throughput on V8](https://raw.githubusercontent.com/JairusSW/as-simd/refs/heads/main/charts/chart-register-v8.svg)

The focused wide-kernel chart measures the dedicated fixed-width scheduler.
Its fallback module is compiled without the WebAssembly SIMD feature, while
the adaptive module is compiled with SIMD enabled and still retains SWAR for
operations where two native chunks lose at v256 width. The exact values and
runtime metadata are also available in the
[wide benchmark table](charts/chart-wide-v8.md).

![Dedicated wide-kernel throughput on V8](https://raw.githubusercontent.com/JairusSW/as-simd/refs/heads/main/charts/chart-wide-v8.svg)

The immutable-value benchmark isolates the documented lowercase facades from
the retained nested compatibility classes. It runs the same splat/add/subtract/
extract expression chain through both representations; the raw-width layout is
2.45× faster for v256 and 3.14× faster for v512 on this V8 host. Exact values
are in the [wide-value benchmark table](charts/chart-wide-values-v8.md).

![Dedicated wide-value throughput on V8](https://raw.githubusercontent.com/JairusSW/as-simd/refs/heads/main/charts/chart-wide-values-v8.svg)

### Comparison to SIMD

Here's some results comparing `i16x4 (SWAR)` versus the native `i16x8 (SIMD)` implementation.

![i16x4-swar-vs-i16x8-simd](https://raw.githubusercontent.com/JairusSW/as-simd/refs/heads/main/charts/chart-i16x4-swar-v-i16x8-simd.svg)

### Running Benchmarks Locally

Benchmarks are run directly on top of `v8` for tighter control over the engine configuration.

1. Install the local benchmark prerequisites:

```bash
npm install -g jsvu
jsvu --engines=v8
```

2. Add `~/.jsvu/bin` to your `PATH` and make sure `wasm-opt` is installed:

```bash
export PATH="${HOME}/.jsvu/bin:${PATH}"
sudo apt-get install -y binaryen
```

3. Install project dependencies:

```bash
npm install
```

4. Run benchmarks:

```bash
npm run bench -- --v8
```

Run one suite and mode explicitly:

```bash
BENCH_SAMPLES=7 npm run bench -- i32x4 --mode swar --v8
BENCH_SAMPLES=7 npm run bench -- i32x4 --mode simd --v8
```

Run the dedicated v256/v512 register-kernel benchmark:

```bash
npm run bench:wide
```

Run the lowercase raw-width value-layout benchmark:

```bash
npm run bench:wide-values
```

Regenerate its chart after the benchmark:

```bash
npm run charts:wide
```

The i8x16, i16x8, i32x4, i64x2, and generic v128 fallback benchmarks are
compiled without the WebAssembly SIMD feature. Transform tests inspect their
emitted WAT and reject any `v128` type or SIMD opcode.

5. Build charts:

```bash
npm run charts
```

## Contributing

Contributions are welcome. For changes to core vector behavior:

1. keep scalar and vector implementations behaviorally aligned
2. update or add deterministic tests in `assembly/__tests__`
3. update or add fuzz checks in `assembly/__fuzz__`
4. run the deterministic, transform, and full multi-mode fuzz suites before
   opening a PR

The full local verification gate is:

```bash
npm run test:transform
npm test
npm run fuzz
npm pack --dry-run
```

Prefer narrowly scoped commits with Conventional Commit messages.

## License

This project is distributed under an open source license. Work on this project is done by passion, but if you want to support it financially, you can do so by making a donation to the project's [GitHub Sponsors](https://github.com/sponsors/JairusSW) page.

You can view the full license using the following link: [License](./LICENSE)

## Contact

Please send all issues to [GitHub Issues](https://github.com/JairusSW/as-simd/issues) and to converse, please send me an email at [me@jairus.dev](mailto:me@jairus.dev)

- **Email:** Send me inquiries, questions, or requests at [me@jairus.dev](mailto:me@jairus.dev)
- **GitHub:** Visit the official GitHub repository [Here](https://github.com/JairusSW/as-simd)
- **Website:** Visit my official website at [jairus.dev](https://jairus.dev/)
- **Discord:** Contact me at [My Discord](https://discord.com/users/600700584038760448) or on the [AssemblyScript Discord Server](https://discord.gg/assemblyscript/)

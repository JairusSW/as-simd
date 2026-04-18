<h1 align="center"><pre>╔═╗ ╔═╗    ╔═╗ ╦ ╔╦╗ ╦═╗
╠═╣ ╚═╗ ══ ╚═╗ ║ ║║║ ║ ║
╩ ╩ ╚═╝    ╚═╝ ╩ ╩ ╩ ╩═╝</pre></h1>

<details>
<summary>Table of Contents</summary>

- [Installation](#installation)
- [Docs](#docs)
- [Usage](#usage)
- [Examples](#examples)
- [Performance](#performance)
  - [Comparison to SIMD](#comparison-to-simd)
  - [Running Benchmarks Locally](#running-benchmarks-locally)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

</details>

## Installation

Install dependencies:

```bash
npm install
```

This project targets AssemblyScript and uses `as-test` for tests/fuzzing and `as-bench` tooling for benchmark output.

Common local commands:

```bash
npm test
npm run fuzz -- --mode swar --runs 200
npm run fuzz -- --mode simd --runs 200
```

## Docs

This repository is currently code-first. The source files below are the primary reference:

- `assembly/v64/i8x8.ts`: SWAR/SIMD-backed `i8x8` implementation
- `assembly/scalar/i8x8.ts`: scalar mirror implementation used as oracle
- `assembly/__tests__/i8x8.spec.ts`: API sync + deterministic parity tests
- `assembly/__fuzz__/i8x8.fuzz.ts`: randomized parity fuzzing
- `scripts/run-bench.sh`: benchmark build/runner orchestration

## Usage

`i8x8` is a packed 8-lane `i8` vector represented as a `v64` (`u64`) with lane-wise operations implemented in SWAR, with SIMD paths enabled when available.

```ts
import { i8x8 } from "./v64/i8x8";

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
import { i8x8 } from "./v64/i8x8";

let x = i8x8.splat(5);           // [5,5,5,5,5,5,5,5]
x = i8x8.replace_lane(x, 2, -7); // [5,5,-7,5,5,5,5,5]
const v = i8x8.extract_lane_s(x, 2); // -7
```

### Arithmetic and comparisons

```ts
import { i8x8 } from "./v64/i8x8";

const a = i8x8(10, -2, 30, -40, 50, -60, 70, -80);
const b = i8x8(1, 2, 3, 4, 5, 6, 7, 8);

const sub = i8x8.sub(a, b);
const mul = i8x8.mul(a, b);
const lt = i8x8.lt_s(a, b); // lane masks: 0x00 or 0xFF per lane
```

### Saturating and narrowing operations

```ts
import { i8x8 } from "./v64/i8x8";

const hi = i8x8(120, 120, -120, -120, 100, -100, 127, -128);
const lo = i8x8(20, 40, -20, -40, 50, -50, 1, -1);

const satAdd = i8x8.add_sat_s(hi, lo);
const satSubU = i8x8.sub_sat_u(hi, lo);

// narrow from packed i16 lanes in two v64 values -> one i8x8
const narrowed = i8x8.narrow_i16x4_s(0x0001000200030004, 0xfff0fff1fff2fff3);
```

### Shuffle and swizzle

```ts
import { i8x8 } from "./v64/i8x8";

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

### Comparison to SIMD

The current setup compares modes by compiling and running the same benchmarks in:

- `SWAR` mode (`--mode swar`)
- `SIMD` mode (`--mode simd`)

Use `scripts/run-bench.sh` to build optimized wasm artifacts and execute benchmarks through V8.

### Running Benchmarks Locally

Requirements:

1. `v8` shell on `PATH` (for example via `jsvu`)
2. `wasm-opt` (Binaryen)
3. project dependencies installed (`npm install`)

Examples:

```bash
# Run all benches in SWAR mode
./scripts/run-bench.sh --mode swar

# Run all benches in SIMD mode
./scripts/run-bench.sh --mode simd

# Run one bench by name
./scripts/run-bench.sh i8x8 --mode swar
```

The script emits wasm builds to `build/` and logs/charts under `build/logs/as/` and `build/charts/`.

## Contributing

Contributions are welcome. For changes to core vector behavior:

1. keep scalar and vector implementations behaviorally aligned
2. update or add deterministic tests in `assembly/__tests__`
3. update or add fuzz checks in `assembly/__fuzz__`
4. run `npm test` and both fuzz modes before opening a PR

Prefer narrowly scoped commits with Conventional Commit messages.

## License

This project is distributed under an open source license. Work on this project is done by passion, but if you want to support it financially, you can do so by making a donation to the project's [GitHub Sponsors](https://github.com/sponsors/JairusSW) page.

You can view the full license using the following link: [License](./LICENSE)

## Contact

Please send all issues to [GitHub Issues](https://github.com/JairusSW/json-as/issues) and to converse, please send me an email at [me@jairus.dev](mailto:me@jairus.dev)

- **Email:** Send me inquiries, questions, or requests at [me@jairus.dev](mailto:me@jairus.dev)
- **GitHub:** Visit the official GitHub repository [Here](https://github.com/JairusSW/json-as)
- **Website:** Visit my official website at [jairus.dev](https://jairus.dev/)
- **Discord:** Contact me at [My Discord](https://discord.com/users/600700584038760448) or on the [AssemblyScript Discord Server](https://discord.gg/assemblyscript/)

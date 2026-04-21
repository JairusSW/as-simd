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

```bash
npm install as-simd
```

## Docs

I'll write them soon. Usage is exactly the same as existing SIMD api though.

## Usage

### Transform-only flow (recommended)

Use `as-simd` directly as a transform.

CLI:

```bash
npx asc assembly/index.ts --transform as-simd/transform
```

Programmatic `asc.main()`:

```js
await asc.main([
  "assembly/index.ts",
  "--transform",
  "as-simd/transform",
]);
```

If a tool expects a direct source entrypoint, use `as-simd/sources`.

To opt into real SIMD codegen, explicitly enable SIMD:

```bash
npx asc assembly/index.ts --transform as-simd/transform --enable simd
```

Without explicit SIMD opt-in, `as-simd` runs in strict SWAR mode. `v128`-family globals (`v128`, `i8x16`, `i16x8`, `i32x4`, `i64x2`) will fail with a clear diagnostic.

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

### Arithmetic and comparisons

```ts
import { i8x8 } from "as-simd";

const a = i8x8(10, -2, 30, -40, 50, -60, 70, -80);
const b = i8x8(1, 2, 3, 4, 5, 6, 7, 8);

const sub = i8x8.sub(a, b);
const mul = i8x8.mul(a, b);
const lt = i8x8.lt_s(a, b); // lane masks: 0x00 or 0xFF per lane
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

### Comparison to SIMD

![ahh](https://raw.githubusercontent.com/JairusSW/as-simd/refs/heads/main/charts/chart-i8x8-v-i8x16.svg)

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
npm run bench
```

Run modes separately:

```bash
npm run bench:swar
npm run bench:simd
```

Run both sequentially:

```bash
npm run bench:split
```

Focused split benchmark (single dispatcher benchmark with mode-based branch):

```bash
npm run bench:swar:i32x4
npm run bench:simd:i32x4
```

5. Build charts:

```bash
npm run charts
```

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

Please send all issues to [GitHub Issues](https://github.com/JairusSW/as-simd/issues) and to converse, please send me an email at [me@jairus.dev](mailto:me@jairus.dev)

- **Email:** Send me inquiries, questions, or requests at [me@jairus.dev](mailto:me@jairus.dev)
- **GitHub:** Visit the official GitHub repository [Here](https://github.com/JairusSW/as-simd)
- **Website:** Visit my official website at [jairus.dev](https://jairus.dev/)
- **Discord:** Contact me at [My Discord](https://discord.com/users/600700584038760448) or on the [AssemblyScript Discord Server](https://discord.gg/assemblyscript/)

# Quansync

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> Create sync/async APIs with seamless interoperability

## 🌟 Features

- **Quantum Superposition**: Exist in both `sync` and `async` states
- **Type Safety**: Full TypeScript support with precise types
- **Zero Dependencies**: Lightweight and efficient
- **Modern JavaScript**: ESM and CommonJS support
- **Performance**: Minimal overhead (~150ns per yield)
- **Flexible**: Multiple implementation approaches

## 📦 Installation

```bash
# npm
npm install quansync

# yarn
yarn add quansync

# pnpm
pnpm add quansync
```

## 🚀 Quick Start

```typescript
import fs from 'node:fs'
import { quansync } from 'quansync'

// Create a quansync function
const readFile = quansync({
  sync: (path: string) => fs.readFileSync(path),
  async: (path: string) => fs.promises.readFile(path)
})

// Use synchronously
const content = readFile.sync('./config.json')

// Use asynchronously
const asyncContent = await readFile.async('./config.json')
```

## 📚 Documentation

### Getting Started
- [Installation & Setup](./docs/tutorials/getting-started.md#installation)
- [Basic Usage](./docs/tutorials/getting-started.md#basic-usage)
- [Quick Examples](./docs/tutorials/getting-started.md#examples)

### Core Concepts
- [Architecture Overview](./docs/guides/core-concepts.md#architecture)
- [Execution Flow](./docs/guides/core-concepts.md#execution-flow)
- [Type System](./docs/guides/core-concepts.md#type-system)

### Features
- Creating Functions
  - [Object Approach](./docs/features/creating-functions.md#object-approach)
  - [Generator Functions](./docs/features/creating-functions.md#generator-functions)
  - [Build-time Macro](./docs/features/creating-functions.md#macro-approach)

- Using Functions
  - [Synchronous Usage](./docs/features/using-functions.md#synchronous-usage)
  - [Asynchronous Usage](./docs/features/using-functions.md#asynchronous-usage)
  - [Error Handling](./docs/features/using-functions.md#error-handling)

- Advanced Features
  - [Generator Composition](./docs/features/generator-composition.md)
  - [Context Management](./docs/features/context-management.md)
  - [Build-time Macros](./docs/features/build-time-macro.md)

### Guides
- [Best Practices](./docs/guides/best-practices.md)
- [Performance Optimization](./docs/guides/performance.md)
- [Troubleshooting](./docs/guides/troubleshooting.md)

### API Reference
- [Core Functions](./docs/api/api-reference.md#core-functions)
- [Types](./docs/api/api-reference.md#types)
- [Error Handling](./docs/api/api-reference.md#errors)

## 💡 Examples

### Build-time Macro Usage

```typescript
import { quansync } from 'quansync/macro'

const processFile = quansync(async (filename) => {
  const content = await readFile(filename, 'utf8')
  return content.toUpperCase()
})

// Works in both modes
const sync = processFile.sync('./input.txt')
const async = await processFile.async('./input.txt')
```

## 🔍 Why Quansync?

Learn about the motivation and design philosophy in Anthony's blog post: [**Async, Sync, in Between**](https://antfu.me/posts/async-sync-in-between)

## ⚡ Performance

```bash
# Run benchmarks
pnpm run build && pnpm run benchmark
```

Each `yield` operation adds ~150ns overhead (comparable to `await sync()`).

## 🤝 Contributing

- 📥 [Pull Requests](https://github.com/quansync-dev/quansync/pulls)
- 🐛 [Bug Reports](https://github.com/quansync-dev/quansync/issues)
- 📚 [Documentation](./CONTRIBUTING.md)

## 💖 Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## 📜 License

[MIT](./LICENSE) © [Anthony Fu](https://github.com/antfu) and [Kevin Deng](https://github.com/sxzz)

## 🙏 Credits

Inspired by [`genasync`](https://github.com/loganfsmyth/gensync) by [@loganfsmyth](https://github.com/loganfsmyth)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/quansync?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/quansync
[npm-downloads-src]: https://img.shields.io/npm/dm/quansync?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/quansync
[bundle-src]: https://img.shields.io/bundlephobia/minzip/quansync?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=quansync
[license-src]: https://img.shields.io/github/license/antfu/quansync.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/quansync/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/quansync

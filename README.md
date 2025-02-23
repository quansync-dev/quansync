# a?sync

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Create sync/async APIs with same, usable logic.

- Typesafe
- ESM, modern JavaScript
- Zero dependencies

Heavily inspired by [`genasync`](https://github.com/loganfsmyth/gensync) by [@loganfsmyth](https://github.com/loganfsmyth).

## Usage

```bash
pnpm i axsync
```

```ts
import fs from 'node:fs'
import { axsync } from 'axsync'

// Create an axsync function by providing `sync` and `async` implementations
const readFile = axsync({
  sync: fs.readFileSync,
  async: fs.promises.readFile,
})

// Create an axsync function by providing a generator function
const myFunction = axsync(function* (filename) {
  // Use `yield*` to call another axsync function
  const code = yield * readFile(filename, 'utf8')

  return `// some custom prefix\n${code}`
})

// Use it as a sync function
const result = myFunction.sync('./some-file.js')

// Use it as an async function
const asyncResult = await myFunction.async('./some-file.js')
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © [Anthony Fu](https://github.com/antfu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/axsync?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/axsync
[npm-downloads-src]: https://img.shields.io/npm/dm/axsync?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/axsync
[bundle-src]: https://img.shields.io/bundlephobia/minzip/axsync?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=axsync
[license-src]: https://img.shields.io/github/license/antfu/axsync.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/axsync/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/axsync

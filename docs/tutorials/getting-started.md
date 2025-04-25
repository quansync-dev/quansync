# Getting Started with Quansync

## Installation {#installation}

Install Quansync using your preferred package manager:

```bash
# Using npm
npm install quansync

# Using yarn
yarn add quansync

# Using pnpm
pnpm add quansync
```

## Quick Start {#basic-usage}

Here's a simple example to get you started with Quansync:

```typescript
import { quansync } from 'quansync'

// Create a simple quansync function
const greet = quansync({
  sync: (name: string) => `Hello, ${name}!`,
  async: async (name: string) => `Hello, ${name}!`
})

// Use synchronously
console.log(greet.sync('World'))  // Output: Hello, World!

// Use asynchronously
await greet.async('World')        // Output: Hello, World!
// or
await greet('World')             // Output: Hello, World!
```

## Basic Examples {#examples}

### 1. File Operations {#file-operations}

```typescript
import fs from 'node:fs'
import { quansync } from 'quansync'

const readFile = quansync({
  sync: (path: string) => fs.readFileSync(path, 'utf8'),
  async: (path: string) => fs.promises.readFile(path, 'utf8')
})

// Sync usage
const content = readFile.sync('./config.json')

// Async usage
const asyncContent = await readFile.async('./config.json')
```

### 2. Generator Function Usage {#generator-functions}

```typescript
import { quansync } from 'quansync'

const processData = quansync(function* (data: string) {
  // Use yield* to call other quansync functions
  const isAsync = yield* getIsAsync()
  
  return {
    processed: data.toUpperCase(),
    mode: isAsync ? 'async' : 'sync'
  }
})
```

### 3. Using the Macro {#using-macro}

```typescript
import { quansync } from 'quansync/macro'

const processFile = quansync(async (filename: string) => {
  const content = await readFile(filename)
  return content.toUpperCase()
})
```

## Library Features {#features}

- ✨ Typesafe API
- 🚀 Zero dependencies
- 📦 ESM and CommonJS support
- ⚡ Minimal performance overhead
- 🛠️ Build-time macro support
- 🔄 Generator composition

## Next Steps {#next-steps}

- Read [Core Concepts](../guides/core-concepts.md) to understand how Quansync works
- Explore [Features](../features/README.md) for detailed functionality
- Check [API Reference](../api/api-reference.md) for complete API documentation
- Review [Best Practices](../guides/best-practices.md) for optimization tips

## Requirements {#requirements}

- Node.js 14.0.0 or later
- TypeScript 4.7.0 or later (for TypeScript users)

## Related Resources {#resources}

- [Anthony's Blog Post: Async, Sync, in Between](https://antfu.me/posts/async-sync-in-between)
- [unplugin-quansync Documentation](https://github.com/unplugin/unplugin-quansync#usage)

## Common Issues {#troubleshooting}

For help with common issues and troubleshooting, see our [Troubleshooting Guide](../guides/troubleshooting.md).

## Performance {#performance}

For detailed performance considerations and optimization tips, see our [Performance Guide](../guides/performance.md).
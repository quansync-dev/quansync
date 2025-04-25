# Build-time Macro for Quansync

This guide explains how to use the build-time macro functionality provided by unplugin-quansync to write cleaner Quansync code using async/await syntax.

## Table of Contents
- [Setup](#setup)
- [Usage](#usage)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Setup

### 1. Installation

```bash
# Install Quansync and the unplugin
npm install quansync
npm install -D unplugin-quansync

# or with yarn
yarn add quansync
yarn add -D unplugin-quansync

# or with pnpm
pnpm add quansync
pnpm add -D unplugin-quansync
```

### 2. Build Tool Configuration

#### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import QuansyncPlugin from 'unplugin-quansync/vite'

export default defineConfig({
  plugins: [
    QuansyncPlugin()
  ]
})
```

#### Webpack

```javascript
// webpack.config.js
const QuansyncPlugin = require('unplugin-quansync/webpack')

module.exports = {
  plugins: [
    QuansyncPlugin()
  ]
}
```

#### Rollup

```javascript
// rollup.config.js
import QuansyncPlugin from 'unplugin-quansync/rollup'

export default {
  plugins: [
    QuansyncPlugin()
  ]
}
```

#### esbuild

```javascript
// esbuild.config.js
import { build } from 'esbuild'
import QuansyncPlugin from 'unplugin-quansync/esbuild'

build({
  plugins: [QuansyncPlugin()]
})
```

## Usage

### Basic Usage

```typescript
import { quansync } from 'quansync/macro'

// Write async/await style code
const readFile = quansync(async (filename: string) => {
  const content = await fs.promises.readFile(filename, 'utf8')
  return content
})

// Use as sync or async
const syncContent = readFile.sync('config.json')
const asyncContent = await readFile.async('config.json')
```

### Composing Functions

```typescript
const processFile = quansync(async (filename: string) => {
  // Use await instead of yield*
  const content = await readFile(filename)
  const data = await parseJson(content)
  return await transform(data)
})
```

### Error Handling

```typescript
const safeOperation = quansync(async () => {
  try {
    const result = await riskyOperation()
    return result
  } catch (error) {
    console.error('Operation failed:', error)
    return null
  }
})
```

## Configuration

### Plugin Options

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import QuansyncPlugin from 'unplugin-quansync/vite'

export default defineConfig({
  plugins: [
    QuansyncPlugin({
      // Include specific files/directories
      include: ['src/**/*.ts'],
      
      // Exclude specific files/directories
      exclude: ['**/*.spec.ts'],
      
      // Custom transform options
      transformOptions: {
        // Plugin-specific options
      }
    })
  ]
})
```

### Source Maps

The plugin automatically handles source maps. No additional configuration is needed.

## Best Practices

### 1. Keep Async/Sync Logic Separate

```typescript
// ✅ Good: Clear separation
const processData = quansync(async (data: any) => {
  // Async-specific logic
  const processed = await heavyProcessing(data)
  return processed
})

// ❌ Bad: Mixing concerns
const mixedProcess = quansync(async (data: any) => {
  if (someCondition) {
    return syncOperation(data) // Avoid mixing sync operations
  }
  return await asyncOperation(data)
})
```

### 2. Proper Error Handling

```typescript
const robustOperation = quansync(async () => {
  try {
    const result = await riskyOperation()
    return result
  } catch (error) {
    // Handle errors appropriately
    throw new Error(`Operation failed: ${error.message}`)
  }
})
```

### 3. Resource Management

```typescript
const withResource = quansync(async () => {
  const resource = await acquire()
  try {
    return await useResource(resource)
  } finally {
    await release(resource)
  }
})
```

## Common Patterns

### 1. Conditional Operations

```typescript
const smartProcess = quansync(async (data: any) => {
  if (await validateData(data)) {
    return await processValid(data)
  } else {
    return await handleInvalid(data)
  }
})
```

### 2. Batch Processing

```typescript
const batchProcess = quansync(async (items: any[]) => {
  const results = []
  for (const chunk of chunks(items, 10)) {
    const processed = await Promise.all(
      chunk.map(item => processItem(item))
    )
    results.push(...processed)
  }
  return results
})
```

### 3. Retry Logic

```typescript
const withRetry = quansync(async (operation: () => Promise<any>) => {
  let lastError
  for (let i = 0; i < 3; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      await delay(Math.pow(2, i) * 1000)
    }
  }
  throw lastError
})
```

## Troubleshooting

### Common Issues

1. **Macro Not Transforming**
   ```typescript
   // Check if file is included in plugin config
   // Ensure file extension is correct
   // Verify import path is 'quansync/macro'
   ```

2. **Runtime Errors**
   ```typescript
   // ❌ Wrong
   import { quansync } from 'quansync'
   
   // ✅ Correct
   import { quansync } from 'quansync/macro'
   ```

3. **Type Errors**
   ```typescript
   // Ensure TypeScript version is compatible
   // Check that types are properly imported
   ```

### Debug Tips

1. Check build tool configuration
2. Verify file is being processed by the plugin
3. Look for transformation artifacts in build output
4. Enable source maps for better debugging

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `'quansync/macro' not found` | Incorrect import | Check import path and installation |
| `Transformation failed` | Plugin configuration | Verify build tool setup |
| `Type ... is not assignable` | Type mismatch | Check function signatures |

## Next Steps

- Learn about [Error Handling](./error-handling.md)
- Explore [Generator Composition](./generator-composition.md)
- Study [Performance Optimization](../performance.md)
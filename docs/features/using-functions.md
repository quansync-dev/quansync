# Using Quansync Functions

This guide explains how to use Quansync functions effectively in both synchronous and asynchronous contexts.

## Table of Contents
- [Basic Usage](#basic-usage)
- [Advanced Usage](#advanced-usage)
- [Error Handling](#error-handling)
- [Context Management](#context-management)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Basic Usage {#basic-usage}

### Synchronous Usage {#synchronous-usage}

```typescript
import { quansync } from 'quansync'

const readFile = quansync({
  sync: fs.readFileSync,
  async: fs.promises.readFile
})

// Use .sync for synchronous execution
const content = readFile.sync('./config.json', 'utf8')
console.log(content)
```

### Asynchronous Usage {#asynchronous-usage}

```typescript
// Method 1: Using .async
const content = await readFile.async('./config.json', 'utf8')

// Method 2: Direct await (same as .async)
const content = await readFile('./config.json', 'utf8')

// Method 3: Promise chain
readFile('./config.json', 'utf8')
  .then(content => console.log(content))
  .catch(error => console.error(error))
```

## Advanced Usage {#advanced-usage}

### Function Composition {#composition}

```typescript
const processConfig = quansync(function* () {
  // Compose multiple quansync functions
  const content = yield* readFile('./config.json', 'utf8')
  const data = JSON.parse(content)
  const processed = yield* transform(data)
  return processed
})
```

### Context-Aware Behavior {#context-aware}

```typescript
const smartOperation = quansync(function* () {
  const isAsync = yield* getIsAsync()
  
  if (isAsync) {
    // Do async-specific optimizations
    return yield* asyncOptimizedPath()
  } else {
    // Do sync-specific optimizations
    return yield* syncOptimizedPath()
  }
})
```

## Error Handling {#error-handling}

### Synchronous Error Handling {#sync-errors}

```typescript
try {
  const result = myFunction.sync()
} catch (error) {
  if (error instanceof QuansyncError) {
    // Handle Quansync-specific errors
  } else {
    // Handle other errors
  }
}
```

### Asynchronous Error Handling {#async-errors}

```typescript
// Using try/catch with async/await
try {
  const result = await myFunction.async()
} catch (error) {
  console.error('Operation failed:', error)
}

// Using promise catch
myFunction.async()
  .then(result => {
    // Handle success
  })
  .catch(error => {
    // Handle error
  })
```

### Error Recovery {#error-recovery}

```typescript
const robustOperation = quansync(function* () {
  try {
    return yield* riskyOperation()
  } catch (error) {
    console.warn('Operation failed, using fallback')
    return yield* fallbackOperation()
  }
})
```

[... rest of the content remains the same ...]

## Best Practices {#best-practices}

[... existing best practices content ...]

## Common Patterns {#common-patterns}

[... existing patterns content ...]

## Troubleshooting {#troubleshooting}

[... existing troubleshooting content ...]

## Next Steps

- Learn about [Error Handling](./error-handling.md)
- Explore [Generator Composition](./generator-composition.md)
- Study [Performance Optimization](../guides/performance.md)
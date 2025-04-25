# Troubleshooting Quansync

This guide helps you diagnose and fix common issues when working with Quansync.

## Table of Contents
- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Debug Strategies](#debug-strategies)
- [Best Practices](#best-practices)

## Common Issues

### 1. Unexpected Promise in Sync Context

#### Problem
```typescript
const badFunction = quansync({
  sync: () => Promise.resolve(value)  // Error!
})
```

#### Solution
```typescript
const goodFunction = quansync({
  sync: () => value,                  // Direct return
  async: () => Promise.resolve(value) // Promise only in async
})
```

### 2. Missing yield*

#### Problem
```typescript
function* wrong() {
  return otherQuansync() // Won't work
}
```

#### Solution
```typescript
function* correct() {
  return yield* otherQuansync() // Correct usage
}
```

### 3. Context Mismatch

#### Problem
```typescript
// Mixing sync/async operations incorrectly
const results = items.map(item => myFunction.sync(item))
```

#### Solution
```typescript
// Use consistent context
const results = isAsync
  ? await Promise.all(items.map(item => myFunction.async(item)))
  : items.map(item => myFunction.sync(item))
```

## Error Messages

### QuansyncError: Unexpected promise in sync context

#### Causes
- Returning a Promise from sync implementation
- Using async operations in sync context
- Incorrect error handling in sync mode

#### Solutions
1. Use separate sync/async implementations
2. Handle promises only in async context
3. Use proper error boundaries

### TypeError: Cannot yield* non-generator

#### Causes
- Missing quansync wrapper
- Incorrect function composition
- Wrong import path

#### Solutions
1. Ensure functions are wrapped with quansync
2. Use yield* with quansync functions only
3. Check import statements

### Type Errors

#### Common Type Issues
```typescript
// Type mismatch between sync/async
const wrong = quansync({
  sync: () => 'string',
  async: () => Promise.resolve(123)  // Type mismatch
})

// Solution
const correct = quansync({
  sync: () => 'string',
  async: () => Promise.resolve('string')  // Matching types
})
```

## Debug Strategies

### 1. Context Checking

```typescript
const debugFunction = quansync(function* () {
  const isAsync = yield* getIsAsync()
  console.log(`Running in ${isAsync ? 'async' : 'sync'} mode`)
  
  try {
    return yield* operation()
  } catch (error) {
    console.error(`Operation failed in ${isAsync ? 'async' : 'sync'} mode:`, error)
    throw error
  }
})
```

### 2. Error Tracking

```typescript
const withErrorTracking = quansync(function* () {
  const startTime = Date.now()
  try {
    return yield* operation()
  } catch (error) {
    console.error('Operation failed:', {
      error,
      duration: Date.now() - startTime,
      stack: error.stack,
      context: yield* getIsAsync() ? 'async' : 'sync'
    })
    throw error
  }
})
```

### 3. Performance Monitoring

```typescript
const withTiming = quansync(function* () {
  const start = performance.now()
  try {
    return yield* operation()
  } finally {
    const duration = performance.now() - start
    console.log(`Operation took ${duration}ms`)
  }
})
```

## Best Practices

### 1. Error Handling

```typescript
const robustFunction = quansync(function* () {
  try {
    return yield* operation()
  } catch (error) {
    if (error instanceof QuansyncError) {
      // Handle Quansync-specific errors
    } else if (error instanceof TypeError) {
      // Handle type errors
    } else {
      // Handle other errors
    }
    throw error
  }
})
```

### 2. Resource Management

```typescript
const safeResource = quansync(function* () {
  const resource = yield* acquire()
  try {
    return yield* useResource(resource)
  } finally {
    yield* release(resource)
  }
})
```

### 3. Testing

```typescript
describe('quansync function', () => {
  it('works in sync mode', () => {
    const result = myFunction.sync()
    expect(result).toBeDefined()
  })

  it('works in async mode', async () => {
    const result = await myFunction.async()
    expect(result).toBeDefined()
  })
})
```

## Next Steps

- Review [Best Practices](./best-practices.md)
- Study [Performance Optimization](./performance.md)
- Check [API Reference](./api-reference.md)
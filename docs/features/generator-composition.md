# Generator Composition in Quansync

This guide explains how to compose Quansync functions using generators for powerful and maintainable code.

## Table of Contents
- [Basic Composition](#basic-composition)
- [Advanced Patterns](#advanced-patterns)
- [Performance Considerations](#performance-considerations)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Basic Composition

### Simple Function Composition

```typescript
import { quansync } from 'quansync'

const readFile = quansync({
  sync: fs.readFileSync,
  async: fs.promises.readFile
})

const parseJson = quansync(function* (content: string) {
  return JSON.parse(content)
})

// Compose functions together
const readJsonFile = quansync(function* (filename: string) {
  const content = yield* readFile(filename, 'utf8')
  return yield* parseJson(content)
})
```

### Sequential Operations

```typescript
const processUser = quansync(function* (userId: string) {
  const user = yield* fetchUser(userId)
  const permissions = yield* fetchPermissions(userId)
  const preferences = yield* fetchPreferences(userId)
  
  return {
    ...user,
    permissions,
    preferences
  }
})
```

## Advanced Patterns

### Parallel Operations

```typescript
const fetchAllData = quansync(function* (userId: string) {
  const isAsync = yield* getIsAsync()
  
  if (isAsync) {
    // Parallel execution in async mode
    const [user, permissions, preferences] = yield* quansync(Promise.all([
      fetchUser.async(userId),
      fetchPermissions.async(userId),
      fetchPreferences.async(userId)
    ]))
    return { user, permissions, preferences }
  } else {
    // Sequential execution in sync mode
    const user = yield* fetchUser(userId)
    const permissions = yield* fetchPermissions(userId)
    const preferences = yield* fetchPreferences(userId)
    return { user, permissions, preferences }
  }
})
```

### Conditional Composition

```typescript
const smartProcess = quansync(function* (data: any) {
  const isAsync = yield* getIsAsync()
  const needsValidation = yield* checkValidation(data)
  
  if (needsValidation) {
    yield* validate(data)
  }
  
  if (isAsync) {
    return yield* asyncOptimizedProcess(data)
  } else {
    return yield* syncOptimizedProcess(data)
  }
})
```

### Pipeline Pattern

```typescript
const createPipeline = (...operations: QuansyncFn[]) => {
  return quansync(function* (input: any) {
    let result = input
    for (const operation of operations) {
      result = yield* operation(result)
    }
    return result
  })
}

const pipeline = createPipeline(
  validateInput,
  transformData,
  enrichData,
  formatOutput
)
```

## Performance Considerations

### Context-Aware Optimization

```typescript
const optimizedOperation = quansync(function* (data: any[]) {
  const isAsync = yield* getIsAsync()
  
  if (isAsync && data.length > 1000) {
    // Process in chunks when async
    const chunks = chunkArray(data, 100)
    const results = []
    
    for (const chunk of chunks) {
      const chunkResults = yield* quansync(Promise.all(
        chunk.map(item => process.async(item))
      ))
      results.push(...chunkResults)
    }
    
    return results
  } else {
    // Process sequentially when sync or small dataset
    return data.map(item => yield* process(item))
  }
})
```

### Caching Results

```typescript
const withCache = <T>(operation: QuansyncFn<T>) => {
  const cache = new Map()
  
  return quansync(function* (...args: any[]) {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = yield* operation(...args)
    cache.set(key, result)
    return result
  })
}

const cachedOperation = withCache(expensiveOperation)
```

## Best Practices

### 1. Proper Error Handling

```typescript
const robustPipeline = quansync(function* (input: any) {
  try {
    const validated = yield* validate(input)
    const transformed = yield* transform(validated)
    return yield* format(transformed)
  } catch (error) {
    console.error('Pipeline failed:', error)
    throw error
  }
})
```

### 2. Resource Management

```typescript
const withResource = quansync(function* (operation: QuansyncFn) {
  const resource = yield* acquire()
  try {
    return yield* operation(resource)
  } finally {
    yield* release(resource)
  }
})
```

### 3. Context Propagation

```typescript
const withContext = quansync(function* (operation: QuansyncFn) {
  const context = yield* getContext()
  return yield* operation(context)
})
```

## Common Patterns

### 1. Retry Pattern

```typescript
const withRetry = (operation: QuansyncFn, attempts = 3) => {
  return quansync(function* (...args: any[]) {
    for (let i = 0; i < attempts; i++) {
      try {
        return yield* operation(...args)
      } catch (error) {
        if (i === attempts - 1) throw error
        console.warn(`Attempt ${i + 1} failed, retrying...`)
        yield* delay(Math.pow(2, i) * 1000)
      }
    }
  })
}
```

### 2. Circuit Breaker

```typescript
const withCircuitBreaker = (operation: QuansyncFn) => {
  let failures = 0
  const threshold = 5
  const resetTimeout = 60000
  let lastFailure = 0
  
  return quansync(function* (...args: any[]) {
    const now = Date.now()
    
    if (failures >= threshold && now - lastFailure < resetTimeout) {
      throw new Error('Circuit breaker is open')
    }
    
    try {
      const result = yield* operation(...args)
      failures = 0
      return result
    } catch (error) {
      failures++
      lastFailure = now
      throw error
    }
  })
}
```

### 3. Batch Processing

```typescript
const batchProcess = quansync(function* (items: any[], batchSize = 100) {
  const results = []
  const batches = chunkArray(items, batchSize)
  
  for (const batch of batches) {
    const batchResults = yield* processBatch(batch)
    results.push(...batchResults)
  }
  
  return results
})
```

## Troubleshooting

### Common Issues

1. **Missing yield***
   ```typescript
   // ❌ Wrong
   const result = operation()
   
   // ✅ Correct
   const result = yield* operation()
   ```

2. **Improper Async Handling**
   ```typescript
   // ❌ Wrong
   const result = await operation()
   
   // ✅ Correct
   const result = yield* operation()
   ```

3. **Context Loss**
   ```typescript
   // ❌ Wrong
   const boundFunction = operation.bind(this)
   
   // ✅ Correct
   const boundFunction = quansync(function* (...args) {
     return yield* operation.apply(this, args)
   })
   ```

### Debug Tips

1. Use `console.log` to track composition flow
2. Check context with `getIsAsync`
3. Ensure proper error propagation
4. Monitor performance with timing logs

## Next Steps

- Learn about [Error Handling](./error-handling.md)
- Explore [Performance Optimization](../performance.md)
- Study [API Reference](../api-reference.md)
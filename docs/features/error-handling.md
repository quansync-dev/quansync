# Error Handling in Quansync

This guide covers error handling strategies and best practices when working with Quansync functions.

## Table of Contents
- [Error Types](#error-types)
- [Context-Specific Handling](#context-specific-handling)
- [Error Recovery Patterns](#error-recovery-patterns)
- [Best Practices](#best-practices)
- [Advanced Error Handling](#advanced-error-handling)
- [Troubleshooting](#troubleshooting)

## Error Types

### QuansyncError

The primary error type specific to Quansync:

```typescript
export class QuansyncError extends Error {
  constructor(message = 'Unexpected promise in sync context') {
    super(message)
    this.name = 'QuansyncError'
  }
}
```

Common scenarios that throw QuansyncError:

1. Returning a Promise in sync context
2. Using async operations in sync mode
3. Incorrect yield* usage

```typescript
// ❌ Will throw QuansyncError
const badFunction = quansync({
  sync: () => Promise.resolve(value)  // Never return Promise in sync mode
})

// ✅ Correct implementation
const goodFunction = quansync({
  sync: () => value,
  async: () => Promise.resolve(value)
})
```

## Context-Specific Handling

### Synchronous Context

```typescript
try {
  const result = myFunction.sync()
} catch (error) {
  if (error instanceof QuansyncError) {
    // Handle Quansync-specific errors
    console.error('Quansync operation failed:', error.message)
  } else {
    // Handle other errors
    console.error('Operation failed:', error)
  }
}
```

### Asynchronous Context

```typescript
// Using try/catch
try {
  const result = await myFunction.async()
} catch (error) {
  if (error instanceof QuansyncError) {
    // Handle Quansync-specific errors
    console.error('Quansync operation failed:', error.message)
  } else {
    // Handle other errors
    console.error('Operation failed:', error)
  }
}

// Using Promise chain
myFunction.async()
  .then(result => {
    // Handle success
  })
  .catch(error => {
    // Handle error
    if (error instanceof QuansyncError) {
      console.error('Quansync operation failed:', error.message)
    } else {
      console.error('Operation failed:', error)
    }
  })
```

## Error Recovery Patterns

### 1. Fallback Values

```typescript
const safeFetch = quansync(function* (url: string) {
  try {
    return yield* fetch(url)
  } catch (error) {
    console.warn(`Failed to fetch ${url}:`, error)
    return null  // Return fallback value
  }
})
```

### 2. Retry Logic

```typescript
const withRetry = quansync(function* (operation, attempts = 3) {
  let lastError

  for (let i = 0; i < attempts; i++) {
    try {
      return yield* operation()
    } catch (error) {
      lastError = error
      if (i < attempts - 1) {
        console.warn(`Attempt ${i + 1} failed, retrying...`)
        yield* delay(Math.pow(2, i) * 1000) // Exponential backoff
      }
    }
  }

  throw lastError
})
```

### 3. Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailure = 0
  
  constructor(
    private threshold = 5,
    private resetTimeout = 60000
  ) {}

  async execute(operation) {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open')
    }

    try {
      const result = await operation()
      this.reset()
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  private isOpen() {
    if (this.failures >= this.threshold) {
      const now = Date.now()
      if (now - this.lastFailure >= this.resetTimeout) {
        this.reset()
        return false
      }
      return true
    }
    return false
  }

  private recordFailure() {
    this.failures++
    this.lastFailure = Date.now()
  }

  private reset() {
    this.failures = 0
    this.lastFailure = 0
  }
}

const breaker = new CircuitBreaker()

const protectedOperation = quansync(function* () {
  const isAsync = yield* getIsAsync()
  
  if (isAsync) {
    return yield* quansync(breaker.execute(() => riskyOperation.async()))
  } else {
    // In sync mode, just try once
    return yield* riskyOperation()
  }
})
```

## Best Practices

### 1. Always Handle Both Contexts

```typescript
const safeOperation = quansync(function* () {
  const isAsync = yield* getIsAsync()
  
  try {
    return yield* operation()
  } catch (error) {
    // Log appropriately based on context
    if (isAsync) {
      await logToServer(error)
    } else {
      logToFile(error)
    }
    throw error // Re-throw if needed
  }
})
```

### 2. Use Type Guards

```typescript
function isQuansyncError(error: unknown): error is QuansyncError {
  return error instanceof QuansyncError
}

function isNetworkError(error: unknown): error is TypeError {
  return error instanceof TypeError && error.message.includes('network')
}

const robustOperation = quansync(function* () {
  try {
    return yield* operation()
  } catch (error: unknown) {
    if (isQuansyncError(error)) {
      // Handle Quansync-specific errors
    } else if (isNetworkError(error)) {
      // Handle network errors
    } else {
      // Handle other errors
    }
    throw error
  }
})
```

### 3. Error Boundaries

```typescript
const withErrorBoundary = quansync(function* (operation) {
  try {
    return yield* operation()
  } catch (error) {
    // Log error
    console.error('Operation failed:', error)
    
    // Return safe fallback
    return null
  } finally {
    // Cleanup if needed
    yield* cleanup()
  }
})
```

## Advanced Error Handling

### 1. Custom Error Types

```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

const validate = quansync(function* (data: unknown) {
  if (!isValid(data)) {
    throw new ValidationError('Invalid data')
  }
  return yield* process(data)
})
```

### 2. Error Aggregation

```typescript
const batchProcess = quansync(function* (items: any[]) {
  const results = []
  const errors = []

  for (const item of items) {
    try {
      results.push(yield* process(item))
    } catch (error) {
      errors.push({ item, error })
    }
  }

  if (errors.length > 0) {
    console.error('Some items failed:', errors)
  }

  return results
})
```

## Troubleshooting

### Common Issues and Solutions

1. **Unexpected Promise in Sync Context**
   ```typescript
   // Problem
   const result = yield Promise.resolve(value)
   
   // Solution
   const result = yield* quansync(Promise.resolve(value))
   ```

2. **Missing Error Handling**
   ```typescript
   // Problem
   const result = yield* riskyOperation()
   
   // Solution
   try {
     const result = yield* riskyOperation()
   } catch (error) {
     // Handle error
   }
   ```

3. **Inconsistent Error Handling**
   ```typescript
   // Problem
   const inconsistent = quansync({
     sync: () => { throw new Error('Sync error') },
     async: async () => { throw new Error('Async error') }
   })
   
   // Solution
   const consistent = quansync({
     sync: () => {
       throw new QuansyncError('Operation failed')
     },
     async: async () => {
       throw new QuansyncError('Operation failed')
     }
   })
   ```

### Debug Tips

1. Use error boundaries for debugging
2. Log errors with context information
3. Implement proper error reporting
4. Use TypeScript for better error detection

## Next Steps

- Learn about [Generator Composition](./generator-composition.md)
- Explore [Performance Optimization](../performance.md)
- Study [Best Practices](../best-practices.md)
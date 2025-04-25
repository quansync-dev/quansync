# Creating Quansync Functions

This guide covers all approaches to creating Quansync functions and their specific use cases.

## Table of Contents
- [Object Approach](#object-approach)
- [Generator Function Approach](#generator-function-approach)
- [Macro Approach](#macro-approach)
- [Promise Approach](#promise-approach)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Object Approach

The most straightforward way to create a Quansync function is by providing sync and async implementations:

```typescript
import { quansync } from 'quansync'
import fs from 'node:fs'

const readFile = quansync({
  sync: (path: string) => fs.readFileSync(path, 'utf8'),
  async: (path: string) => fs.promises.readFile(path, 'utf8')
})
```

### When to Use

- When you have distinct sync and async implementations
- For wrapping existing sync/async APIs
- When performance is critical
- When you need full control over both execution paths

### Type Safety

```typescript
interface QuansyncInputObject<Return, Args extends any[]> {
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}
```

## Generator Function Approach

Create a single implementation that works for both sync and async contexts:

```typescript
const processData = quansync(function* (data: string) {
  // Check execution context
  const isAsync = yield* getIsAsync()
  
  // Use other quansync functions
  const processed = yield* transform(data)
  
  return processed.toUpperCase()
})
```

### When to Use

- When logic is identical for both sync/async paths
- When composing multiple quansync functions
- When you need context-aware behavior
- For complex operations that need to yield multiple times

### Generator Function Rules

1. Always use `yield*` when calling other quansync functions
2. Don't use regular `await` in generator functions
3. Handle errors appropriately in both contexts
4. Return values directly (not promises)

## Macro Approach

Use async/await syntax with build-time transformation:

```typescript
import { quansync } from 'quansync/macro'

const processFile = quansync(async (filename: string) => {
  // Regular async/await syntax
  const content = await readFile(filename)
  return content.toUpperCase()
})
```

### Setup

1. Install the macro plugin:
```bash
npm install -D unplugin-quansync
```

2. Configure your build tool:

```js
// vite.config.js
import QuansyncPlugin from 'unplugin-quansync/vite'

export default {
  plugins: [
    QuansyncPlugin()
  ]
}
```

### When to Use

- When you prefer async/await syntax
- In projects with existing async/await code
- When generator syntax feels too verbose
- For better code readability

## Promise Approach

Convert promises to quansync functions:

```typescript
import { quansync } from 'quansync'

const fetchData = quansync(
  fetch('https://api.example.com/data')
    .then(res => res.json())
)
```

### When to Use

- When working with existing promises
- For one-off async operations
- When you don't need separate sync logic
- For quick prototyping

## Best Practices

1. **Choose the Right Approach**
   ```typescript
   // Good: Separate implementations when they differ
   const readFile = quansync({
     sync: fs.readFileSync,
     async: fs.promises.readFile
   })

   // Good: Generator when logic is shared
   const processData = quansync(function* (data) {
     return yield* transform(data)
   })
   ```

2. **Type Your Functions**
   ```typescript
   const processUser = quansync({
     sync: (user: User): ProcessedUser => ({ ...user, processed: true }),
     async: async (user: User): Promise<ProcessedUser> => {
       return { ...user, processed: true }
     }
   })
   ```

3. **Handle Errors Consistently**
   ```typescript
   const safeOperation = quansync(function* () {
     try {
       return yield* riskyOperation()
     } catch (error) {
       console.error('Operation failed:', error)
       return null
     }
   })
   ```

4. **Use Composition**
   ```typescript
   const composed = quansync(function* () {
     const data = yield* fetchData()
     return yield* processData(data)
   })
   ```

## Troubleshooting

### Common Issues

1. **Promise in Sync Context**
   ```typescript
   // ❌ Wrong: Will throw QuansyncError
   const wrong = quansync({
     sync: () => Promise.resolve(value)
   })

   // ✅ Correct: Handle promise in async only
   const correct = quansync({
     sync: () => value,
     async: () => Promise.resolve(value)
   })
   ```

2. **Missing yield***
   ```typescript
   // ❌ Wrong: Missing yield*
   function* wrong() {
     return otherQuansync()
   }

   // ✅ Correct: Using yield*
   function* correct() {
     return yield* otherQuansync()
   }
   ```

3. **Type Mismatches**
   ```typescript
   // ❌ Wrong: Return types don't match
   const wrong = quansync({
     sync: () => 'string',
     async: () => Promise.resolve(123)
   })

   // ✅ Correct: Consistent return types
   const correct = quansync({
     sync: () => 'string',
     async: () => Promise.resolve('string')
   })
   ```

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `QuansyncError: Unexpected promise in sync context` | Promise returned in sync mode | Use proper sync implementation |
| `TypeError: Cannot yield* non-generator` | Missing quansync wrapper | Ensure function is wrapped with quansync |
| `Type 'X' is not assignable to type 'Y'` | Type mismatch between sync/async | Make return types consistent |

## Next Steps

- Learn about [Using Functions](./using-functions.md)
- Explore [Error Handling](./error-handling.md)
- Study [Generator Composition](./generator-composition.md)
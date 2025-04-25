# Quansync Best Practices

A comprehensive guide to writing efficient, maintainable, and robust code with Quansync.

## Table of Contents
- [General Guidelines](#general-guidelines)
- [Function Creation](#function-creation)
- [Error Handling](#error-handling)
- [Performance](#performance)
- [Testing](#testing)
- [Code Organization](#code-organization)

## General Guidelines

### 1. Choose the Right Approach

```typescript
// ✅ Use object approach when implementations differ significantly
const readFile = quansync({
  sync: fs.readFileSync,
  async: fs.promises.readFile
})

// ✅ Use generator when logic is shared
const processFile = quansync(function* (filename) {
  const content = yield* readFile(filename)
  return transform(content)
})

// ✅ Use macro for cleaner async/await syntax
const cleanSyntax = quansync(async (filename) => {
  const content = await readFile(filename)
  return transform(content)
})
```

### 2. Maintain Consistent Types

```typescript
// ✅ Consistent return types
const goodTypes = quansync({
  sync: (input: string): number => parseInt(input),
  async: async (input: string): Promise<number> => Promise.resolve(parseInt(input))
})

// ❌ Inconsistent return types
const badTypes = quansync({
  sync: (input: string): number => parseInt(input),
  async: async (input: string): Promise<string> => Promise.resolve(input)
})
```

### 3. Use Clear Naming Conventions

```typescript
// ✅ Clear function names
const validateUserInput = quansync(function* (input) {
  // ...
})

// ❌ Unclear names
const process = quansync(function* (data) {
  // ...
})
```

## Function Creation

### 1. Proper Resource Management

```typescript
// ✅ Resource cleanup in both contexts
const withResource = quansync(function* () {
  const resource = yield* acquire()
  try {
    return yield* useResource(resource)
  } finally {
    yield* release(resource)
  }
})

// ❌ Missing resource cleanup
const leakyResource = quansync(function* () {
  const resource = yield* acquire()
  return yield* useResource(resource)
})
```

### 2. Context-Aware Implementations

```typescript
// ✅ Optimized for each context
const optimizedOperation = quansync(function* (data) {
  const isAsync = yield* getIsAsync()
  
  if (isAsync) {
    return yield* streamProcess(data)
  } else {
    return yield* directProcess(data)
  }
})

// ❌ Not considering context
const ignoringContext = quansync(function* (data) {
  return yield* process(data)
})
```

### 3. Composition Patterns

```typescript
// ✅ Clean composition
const pipeline = quansync(function* (input) {
  const validated = yield* validate(input)
  const processed = yield* process(validated)
  return yield* format(processed)
})

// ❌ Messy composition
const messyPipeline = quansync(function* (input) {
  let result = input
  result = yield* op1(result)
  result = yield* op2(result)
  return result
})
```

## Error Handling

### 1. Comprehensive Error Boundaries

```typescript
// ✅ Proper error handling
const robustOperation = quansync(function* () {
  try {
    return yield* riskyOperation()
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

// ❌ Missing error handling
const fragileOperation = quansync(function* () {
  return yield* riskyOperation()
})
```

### 2. Context-Specific Error Handling

```typescript
// ✅ Context-aware error handling
const smartErrorHandler = quansync(function* () {
  const isAsync = yield* getIsAsync()
  try {
    return yield* operation()
  } catch (error) {
    if (isAsync) {
      yield* logToServer(error)
    } else {
      logToFile(error)
    }
    throw error
  }
})
```

## Performance

### 1. Optimize Heavy Operations

```typescript
// ✅ Optimized batch processing
const batchProcess = quansync(function* (items) {
  const isAsync = yield* getIsAsync()
  
  if (isAsync && items.length > 100) {
    return yield* parallelProcess(items)
  } else {
    return yield* sequentialProcess(items)
  }
})
```

### 2. Smart Caching

```typescript
// ✅ Efficient caching
const withCache = (operation: QuansyncFn) => {
  const cache = new Map()
  
  return quansync(function* (...args) {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = yield* operation(...args)
    cache.set(key, result)
    return result
  })
}
```

## Testing

### 1. Test Both Contexts

```typescript
describe('myFunction', () => {
  // ✅ Testing both contexts
  it('works synchronously', () => {
    const result = myFunction.sync(input)
    expect(result).toBeDefined()
  })
  
  it('works asynchronously', async () => {
    const result = await myFunction.async(input)
    expect(result).toBeDefined()
  })
})
```

### 2. Error Testing

```typescript
// ✅ Comprehensive error testing
test('handles errors properly', () => {
  // Test sync errors
  expect(() => myFunction.sync(badInput)).toThrow(QuansyncError)
  
  // Test async errors
  await expect(myFunction.async(badInput)).rejects.toThrow(QuansyncError)
})
```

## Code Organization

### 1. Module Structure

```typescript
// ✅ Clear module organization
export const operations = {
  readFile: quansync({...}),
  processFile: quansync(function* () {...}),
  writeFile: quansync({...})
}

// ❌ Messy organization
export const read = quansync({...})
export const process = quansync(function* () {...})
export const write = quansync({...})
```

### 2. Documentation

```typescript
// ✅ Well-documented function
/**
 * Processes a file with the given options.
 * @param filename - The file to process
 * @param options - Processing options
 * @returns Processed content
 * @throws {QuansyncError} If file operations fail
 */
const processFile = quansync(function* (filename, options) {
  // ...
})
```

## Next Steps

- Review [Performance Guide](./performance.md)
- Study [Error Handling](./features/error-handling.md)
- Explore [Generator Composition](./features/generator-composition.md)
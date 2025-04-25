# Quansync API Reference

Comprehensive documentation of all Quansync APIs, types, and options.

## Table of Contents
- [Core Functions](#core-functions)
- [Types](#types)
- [Constants](#constants)
- [Errors](#errors)

## Core Functions

### quansync

Creates a new Quansync function that can operate in both synchronous and asynchronous contexts.

#### Signatures

```typescript
function quansync<Return, Args extends any[]>(
  input: QuansyncInputObject<Return, Args>,
): QuansyncFn<Return, Args>

function quansync<Return, Args extends any[]>(
  input: QuansyncGeneratorFn<Return, Args> | Promise<Return>,
  options?: QuansyncOptions
): QuansyncFn<Return, Args>
```

#### Parameters

- `input`: One of:
  - `QuansyncInputObject`: Object with sync and async implementations
  - `QuansyncGeneratorFn`: Generator function implementation
  - `Promise`: Promise to convert to quansync function

- `options`: (Optional) Configuration options
  ```typescript
  interface QuansyncOptions {
    onYield?: (value: any, isAsync: boolean) => any
  }
  ```

#### Returns

Returns a `QuansyncFn` that can be used in both sync and async contexts.

#### Examples

```typescript
// Object implementation
const readFile = quansync({
  sync: fs.readFileSync,
  async: fs.promises.readFile
})

// Generator implementation
const process = quansync(function* (data) {
  const result = yield* transform(data)
  return result
})

// Promise implementation
const fetch = quansync(Promise.resolve(data))
```

### getIsAsync

Returns a boolean indicating whether the current execution is in async mode.

#### Signature

```typescript
const getIsAsync: QuansyncFn<boolean, []>
```

#### Examples

```typescript
const fn = quansync(function* () {
  const isAsync = yield* getIsAsync()
  return isAsync ? 'async' : 'sync'
})
```

### toGenerator

Converts a promise or value to a Quansync generator.

#### Signature

```typescript
function toGenerator<T>(
  promise: Promise<T> | QuansyncGenerator<T> | T
): QuansyncGenerator<T>
```

#### Parameters

- `promise`: Promise, generator, or value to convert

#### Returns

Returns a `QuansyncGenerator` that can be used with yield*.

#### Examples

```typescript
const gen = toGenerator(Promise.resolve(42))
const result = yield* gen // 42
```

## Types

### QuansyncFn

```typescript
type QuansyncFn<Return, Args extends any[] = []> = {
  (...args: Args): QuansyncGenerator<Return>
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}
```

### QuansyncGenerator

```typescript
interface QuansyncGenerator<T, TReturn = any, TNext = unknown> 
  extends Generator<any, T, TNext> {
  __quansync: true
}
```

### QuansyncGeneratorFn

```typescript
type QuansyncGeneratorFn<Return, Args extends any[] = []> = 
  (...args: Args) => QuansyncGenerator<Return>
```

### QuansyncInputObject

```typescript
interface QuansyncInputObject<Return, Args extends any[] = []> {
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}
```

### QuansyncOptions

```typescript
interface QuansyncOptions {
  onYield?: (value: any, isAsync: boolean) => any
}
```

### QuansyncAwaitableGenerator

```typescript
interface QuansyncAwaitableGenerator<T, Args extends any[] = []>
  extends QuansyncGenerator<T> {
  then: Promise<T>['then']
}
```

## Constants

### GET_IS_ASYNC

Symbol used internally for context detection.

```typescript
const GET_IS_ASYNC: symbol
```

## Errors

### QuansyncError

Error thrown when a promise is encountered in sync context.

```typescript
class QuansyncError extends Error {
  constructor(message?: string)
}
```

#### Properties

- `name`: Always 'QuansyncError'
- `message`: Error message (default: 'Unexpected promise in sync context')

## Type Guards

### isThenable

Checks if a value is promise-like.

```typescript
function isThenable<T>(value: any): value is Promise<T>
```

### isQuansyncGenerator

Checks if a value is a Quansync generator.

```typescript
function isQuansyncGenerator<T>(value: any): value is QuansyncGenerator<T>
```

## Build-time Macro Types

When using `quansync/macro`, the following additional type is available:

```typescript
type QuansyncMacroFn<Return, Args extends any[] = []> = 
  (...args: Args) => Promise<Return>
```

## Usage with TypeScript

### Generic Type Parameters

```typescript
// Specify return and argument types
const process = quansync<Result, [Input]>({
  sync: (input: Input): Result => { /* ... */ },
  async: async (input: Input): Promise<Result> => { /* ... */ }
})

// Type inference works too
const inferred = quansync({
  sync: (x: number) => x.toString(),
  async: async (x: number) => x.toString()
})
// inferred type: QuansyncFn<string, [number]>
```

### Type Assertions

```typescript
// Assert generator type
const gen = toGenerator(promise) as QuansyncGenerator<string>

// Assert function type
const fn = quansync(impl) as QuansyncFn<Result, [Input]>
```

## Performance Considerations

- Each `yield*` operation adds ~150ns overhead
- Generator implementation has minimal memory overhead
- Type checking has zero runtime cost
- Build-time macro has no runtime performance impact

## Best Practices

1. Always specify explicit types for better type inference
2. Use type guards when working with dynamic values
3. Leverage TypeScript's strict mode for better type safety
4. Consider using the macro for cleaner type definitions

## See Also

- [Creating Functions](./features/creating-functions.md)
- [Using Functions](./features/using-functions.md)
- [Error Handling](./features/error-handling.md)
- [Type System Guide](./features/type-system.md)
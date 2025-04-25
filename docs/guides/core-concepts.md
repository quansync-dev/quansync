# Core Concepts

## Understanding Quansync {#introduction}

Quansync (Quantum + Sync) creates a "superposition" between synchronous and asynchronous execution modes. This allows functions to operate in either mode depending on how they're called, without requiring different implementations or APIs.

## Architecture Overview {#architecture}

```mermaid
graph TB
    A[Client Code] --> B[Quansync Function]
    B --> C{Execution Mode}
    C -->|Sync| D[Sync Implementation]
    C -->|Async| E[Async Implementation]
    D --> F[Direct Return]
    E --> G[Promise Return]
    
    style B fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
```

## Execution Flow {#execution-flow}

The sequence diagram below illustrates how Quansync handles function calls in different contexts:

```mermaid
sequenceDiagram
    participant Caller
    participant QuanSync
    participant AsyncOperation

    Caller->>QuanSync: Call quansync function
    alt Synchronous Context
        QuanSync->>Caller: Return result directly
    else Asynchronous Context
        QuanSync->>AsyncOperation: Perform asynchronous operation
        AsyncOperation->>QuanSync: Return promise
        QuanSync->>Caller: Return promise
    end
```

## Key Concepts

### 1. Execution Context {#execution-context}

Quansync maintains awareness of its execution context through the `getIsAsync` utility:

```typescript
const isAsync = yield* getIsAsync()
// Returns: true in async context, false in sync context
```

### 2. Generator Functions {#generator-functions}

Quansync uses generators internally to manage control flow:

```mermaid
graph LR
    A[Start] --> B[yield Operation]
    B --> C{Is Async?}
    C -->|Yes| D[Await Result]
    C -->|No| E[Sync Result]
    D --> F[Resume]
    E --> F
    F --> G[Return]
```

### 3. Error Boundaries {#error-boundaries}

```mermaid
graph TB
    A[Operation] --> B{Error?}
    B -->|Yes| C{Context}
    B -->|No| D[Continue]
    C -->|Sync| E[Throw Error]
    C -->|Async| F[Reject Promise]
```

## Implementation Details {#implementation}

### Generator Composition {#composition}

Quansync allows composing generator functions:

```typescript
function* outer() {
    const result = yield* inner()  // Composition
    return result
}

function* inner() {
    return yield* someOperation()
}
```

### Context Management {#context-management}

```mermaid
graph TB
    A[Function Call] --> B{Has Context?}
    B -->|Yes| C[Use Existing]
    B -->|No| D[Create New]
    C --> E[Execute]
    D --> E
```

### Promise Handling {#promises}

In synchronous contexts, Quansync prevents promise leaks:

```typescript
const fn = quansync({
    sync: () => {
        // This would throw QuansyncError
        return Promise.resolve(value)
    },
    async: async () => {
        // This is allowed
        return await someAsyncOperation()
    }
})
```

## Type System Integration {#type-system}

Quansync provides strong TypeScript integration:

```typescript
type QuansyncFn<T, Args extends any[]> = {
    (): QuansyncGenerator<T>
    sync: (...args: Args) => T
    async: (...args: Args) => Promise<T>
}
```

## Performance Model {#performance}

```mermaid
graph LR
    A[Function Call] --> B[Context Switch]
    B --> C[Operation]
    C --> D[Return]
    
    style B fill:#f96,stroke:#333,stroke-width:2px
```

Performance overhead is primarily from:
1. Context switching (~150ns per yield)
2. Generator iteration
3. Promise resolution in async mode

## Under the Hood {#internals}

### Context Resolution {#context-resolution}

```mermaid
graph TB
    A[Call] --> B{Direct Call?}
    B -->|Yes| C[Check Async]
    B -->|No| D[Method Call]
    C --> E{Is Promise?}
    D -->|.sync| F[Sync Mode]
    D -->|.async| G[Async Mode]
    E -->|Yes| G
    E -->|No| F
```

### Error Propagation {#error-propagation}

```mermaid
graph TB
    A[Error Occurs] --> B{In Generator?}
    B -->|Yes| C[Yield Error]
    B -->|No| D[Direct Throw]
    C --> E{Context}
    E -->|Sync| F[Throw]
    E -->|Async| G[Reject]
```

## Further Reading

- [Creating Functions](../features/creating-functions.md)
- [Error Handling](../features/error-handling.md)
- [Generator Composition](../features/generator-composition.md)
- [Performance Optimization](./performance.md)
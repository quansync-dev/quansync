# Quansync API Documentation

This directory contains detailed API documentation for Quansync.

## Contents

- [API Reference](./api-reference.md) - Comprehensive documentation of:
  - Core functions and their signatures
  - Type definitions
  - Configuration options
  - Error types
  - Utility functions
  - Type guards
  - Build-time macro types

## Search Index

### Core Functions
- `quansync()` - Create Quansync functions
- `getIsAsync()` - Check execution context
- `toGenerator()` - Convert to Quansync generator

### Types
- `QuansyncFn` - Main function type
- `QuansyncGenerator` - Generator type
- `QuansyncInputObject` - Input configuration
- `QuansyncOptions` - Options configuration

### Errors
- `QuansyncError` - Main error type
- Error handling patterns
- Type safety

### Context
- Execution context detection
- Context management
- Resource handling

## Related Documentation

- [Core Concepts](../guides/core-concepts.md)
- [Best Practices](../guides/best-practices.md)
- [Error Handling](../features/error-handling.md)
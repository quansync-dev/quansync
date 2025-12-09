export interface QuansyncOptions {
  onYield?: (value: any, isAsync: boolean) => any
}

export interface QuansyncInputObject<Return, Args extends any[]> extends QuansyncOptions {
  name?: string
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}

export type QuansyncGeneratorFn<Return, Args extends any[]>
  = ((...args: Args) => QuansyncGenerator<Return>)

export type QuansyncInput<Return, Args extends any[]>
  = | QuansyncInputObject<Return, Args>
    | QuansyncGeneratorFn<Return, Args>

export type QuansyncGenerator<Return = any, Yield = unknown>
  = Generator<Yield, Return, Awaited<Yield>> & { __quansync?: true }

export type QuansyncAwaitableGenerator<Return = any, Yield = unknown>
  = QuansyncGenerator<Return, Yield> & PromiseLike<Return>

export type QuansyncUnwrapGenerator<T> = T extends QuansyncGenerator<infer R, any>
  ? R
  : T

/**
 * "Superposition" function that can be consumed in both sync and async contexts.
 */
export type QuansyncFn<Return = any, Args extends any[] = []>
  = ((...args: Args) => QuansyncAwaitableGenerator<QuansyncUnwrapGenerator<Return>>)
    & {
    /**
     * **Warning**: The `async` and `sync` methods will be lost after invoked.
     */
      bind: <T, A extends any[], B extends any[]>(
        this: (this: T, ...args: [...A, ...B]) => QuansyncAwaitableGenerator<QuansyncUnwrapGenerator<Return>>,
        thisArg: T,
        ...args: A
      ) => ((...args: B) => QuansyncAwaitableGenerator<QuansyncUnwrapGenerator<Return>>)

      sync: (...args: Args) => QuansyncUnwrapGenerator<Return>
      async: (...args: Args) => Promise<QuansyncUnwrapGenerator<Return>>
    }

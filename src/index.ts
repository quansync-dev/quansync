export interface QuansyncInputObject<Return, Args extends any[]> {
  name?: string
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}

export type QuansyncInputGenerator<Return, Args extends any[]>
  = ((...args: Args) => QuansyncGenerator<Return>)

export type QuansyncInput<Return, Args extends any[]> =
  | QuansyncInputObject<Return, Args>
  | QuansyncInputGenerator<Return, Args>

export interface QuansyncYield<R> {
  name?: string
  sync: () => R
  async: () => Promise<R>
  __isQuansync: true
}

export type UnwrapQuansyncReturn<T> = T extends QuansyncYield<infer R> ? Awaited<R> : Awaited<T>

export type QuansyncGenerator<Return = any, Yield = unknown> =
  Generator<Yield, Return, UnwrapQuansyncReturn<Yield>>

/**
 * "Superposition" function that can be consumed in both sync and async contexts.
 */
export type QuansyncFn<Return = any, Args extends any[] = []> =
  ((...args: Args) => QuansyncGenerator<Return>)
  & {
    sync: (...args: Args) => Return
    async: (...args: Args) => Promise<Return>
  }

const ERROR_PROMISE_IN_SYNC = '[Quansync] Yielded an unexpected promise in sync context'

function isThenable<T>(value: any): value is Promise<T> {
  return value && typeof value === 'object' && typeof value.then === 'function'
}

export function isQuansyncYield<T>(value: any | QuansyncYield<T>): value is QuansyncYield<T> {
  return typeof value === 'object' && value !== null && '__isQuansync' in value
}

function fromObject<Return, Args extends any[]>(
  options: QuansyncInputObject<Return, Args >,
): QuansyncFn<Return, Args > {
  const generator = function *(...args: Args): QuansyncGenerator<Return, any> {
    return yield {
      name: options.name,
      sync: (options.sync as any).bind(null, ...args),
      async: (options.async as any).bind(null, ...args),
      __isQuansync: true,
    }
  } as unknown as QuansyncFn<Return, Args>

  generator.sync = options.sync
  generator.async = options.async

  return generator
}

function fromPromise<T>(promise: Promise<T> | T): QuansyncFn<T, []> {
  return fromObject({
    async: () => Promise.resolve(promise),
    sync: () => {
      if (isThenable(promise))
        throw new Error(ERROR_PROMISE_IN_SYNC)
      return promise
    },
  })
}

function unwrapSync(value: any): any {
  if (isQuansyncYield(value))
    return value.sync()
  if (isThenable(value))
    throw new Error(ERROR_PROMISE_IN_SYNC)
  return value
}

function unwrapAsync(value: any): Promise<any> {
  return isQuansyncYield(value) ? value.async() : value
}

function fromGenerator<Return, Args extends any[]>(
  generator: QuansyncInputGenerator<Return, Args>,
): QuansyncFn<Return, Args> {
  function sync(...args: Args): Return {
    const iterator = generator(...args)
    let current = iterator.next()
    while (!current.done) {
      current = iterator.next(unwrapSync(current.value))
    }
    return unwrapSync(current.value)
  }

  async function async(...args: Args): Promise<Return> {
    const iterator = generator(...args)
    let current = iterator.next()
    while (!current.done) {
      current = iterator.next(await unwrapAsync(current.value))
    }
    return unwrapAsync(current.value)
  }

  return fromObject({
    name: generator.name,
    async,
    sync,
  })
}

/**
 * Creates a new Quansync function, a "superposition" between async and sync.
 */
export function quansync<Return, Args extends any[] = []>(
  options: QuansyncInput<Return, Args> | Promise<Return>,
): QuansyncFn<Return, Args> {
  if (isThenable(options))
    return fromPromise<Return>(options)
  if (typeof options === 'function')
    return fromGenerator(options)
  else
    return fromObject(options)
}

/**
 * Converts a promise to a Quansync generator.
 */
export function promiseToGenerator<T>(promise: Promise<T> | T): QuansyncGenerator<T> {
  return fromPromise(promise as Promise<T>)()
}

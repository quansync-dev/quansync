export interface QuansyncInputObject<Args extends any[], Return> {
  name?: string
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}
export type QuansyncInputGenerator<Args extends any[], Return>
  = ((...args: Args) => QuansyncGenerator<Return>)

export type QuansyncInput<Args extends any[], Return> =
  | QuansyncInputObject<Args, Return>
  | QuansyncInputGenerator<Args, Return>

export interface QuansyncYield<R> {
  name?: string
  sync: () => R
  async: () => Promise<R>
  __isQuansync: true
}

export type UnwrapQuansyncReturn<T> = T extends QuansyncYield<infer R> ? R : T

export type QuansyncGenerator<Return = any, Yield = unknown> =
  Generator<Yield, Return, UnwrapQuansyncReturn<Yield>>

/**
 * "Superposition" function that can be consumed in both sync and async contexts.
 */
export type QuansyncFn<Args extends any[] = [], Return = any> =
  ((...args: Args) => QuansyncGenerator<Return>)
  & {
    sync: (...args: Args) => Return
    async: (...args: Args) => Promise<Return>
  }

export function isQuansyncYield<T>(value: any | QuansyncYield<T>): value is QuansyncYield<T> {
  return typeof value === 'object' && value !== null && '__isQuansync' in value
}

function quansyncObject<Args extends any[], Return>(
  options: QuansyncInputObject<Args, Return>,
): QuansyncFn<Args, Return> {
  const generator = function *(...args: Args): QuansyncGenerator<Return, any> {
    return yield {
      name: options.name,
      sync: () => options.sync(...args),
      async: () => options.async(...args),
      __isQuansync: true,
    }
  } as unknown as QuansyncFn<Args, Return>

  generator.sync = options.sync
  generator.async = options.async

  return generator
}

function unwrapSync(value: any): any {
  return isQuansyncYield(value)
    ? value.sync()
    : value
}

function unwrapAsync(value: any): Promise<any> {
  return isQuansyncYield(value)
    ? value.async()
    : Promise.resolve(value)
}

function quansyncGenerator<Args extends any[], Return>(
  generator: QuansyncInputGenerator<Args, Return>,
): QuansyncFn<Args, Return> {
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
    return await unwrapAsync(current.value)
  }

  return quansyncObject({
    name: generator.name,
    async,
    sync,
  })
}

/**
 * Creates a new Quansync function, a "superposition" between async and sync.
 */
export function quansync<Args extends any[], Return>(
  options: QuansyncInput<Args, Return>,
): QuansyncFn<Args, Return> {
  if (typeof options === 'function')
    return quansyncGenerator(options)
  else
    return quansyncObject(options)
}

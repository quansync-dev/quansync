export interface QuansyncInputObject<Args extends any[], Return> {
  name?: string
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}
export type QuansyncInputGenerator<Args extends any[], Return>
  = ((...args: Args) => Generator<QuansyncYield<any>, Return, unknown>)

export interface QuansyncYield<R> {
  name?: string
  sync: () => R
  async: () => Promise<R>
  __isQuansync: true
}

export type QuansyncGenerator<Return = any, Yield = any> =
  Generator<QuansyncYield<Yield>, Return, Yield>

/**
 * "Superposition" between async and sync.
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
  const generator = function *(...args: Args): QuansyncGenerator<Return> {
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

function quansyncGenerator<Args extends any[], Return>(
  generator: QuansyncInputGenerator<Args, Return>,
): QuansyncFn<Args, Return> {
  function sync(...args: Args): Return {
    const unwrap = (value: any): any => {
      return isQuansyncYield(value)
        ? value.sync()
        : value
    }
    const iterator = generator(...args)
    let current = iterator.next()
    while (!current.done) {
      current = iterator.next(unwrap(current.value))
    }
    return unwrap(current.value)
  }

  async function async(...args: Args): Promise<Return> {
    const unwrap = (value: any): any => {
      return isQuansyncYield(value)
        ? value.async()
        : value
    }
    const iterator = generator(...args)
    let current = iterator.next()
    while (!current.done) {
      current = iterator.next(await unwrap(current.value))
    }
    return await unwrap(current.value)
  }

  return quansyncObject({
    name: generator.name,
    async,
    sync,
  })
}

export function quansync<Args extends any[], Return>(
  options: QuansyncInputObject<Args, Return>,
): QuansyncFn<Args, Return>
export function quansync<Args extends any[], Return>(
  options: QuansyncInputGenerator<Args, Return>,
): QuansyncFn<Args, Return>
export function quansync<Args extends any[], Return>(
  options: QuansyncInputObject<Args, Return> | QuansyncInputGenerator<Args, Return>,
): QuansyncFn<Args, Return> {
  if (typeof options === 'function')
    return quansyncGenerator(options)
  else
    return quansyncObject(options)
}

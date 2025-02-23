export interface AxsyncInputObject<Args extends any[], Return> {
  name?: string
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}
export type AxsyncInputGenerator<Args extends any[], Return>
  = ((...args: Args) => Generator<AxsyncYield<any>, Return, unknown>)

export interface AxsyncYield<R> {
  name?: string
  sync: () => R
  async: () => Promise<R>
  __isAxsync: true
}

export type AxsyncGenerator<Return = any, Yield = any> =
  Generator<AxsyncYield<Yield>, Return, Yield>

export type AxsyncFn<Args extends any[] = [], Return = any> =
  ((...args: Args) => AxsyncGenerator<Return>)
  & {
    sync: (...args: Args) => Return
    async: (...args: Args) => Promise<Return>
  }

export function isAxsyncYield<T>(value: any | AxsyncYield<T>): value is AxsyncYield<T> {
  return typeof value === 'object' && value !== null && '__isAxsync' in value
}

function axsyncObject<Args extends any[], Return>(
  options: AxsyncInputObject<Args, Return>,
): AxsyncFn<Args, Return> {
  const generator = function *(...args: Args): AxsyncGenerator<Return> {
    return yield {
      name: options.name,
      sync: () => options.sync(...args),
      async: () => options.async(...args),
      __isAxsync: true,
    }
  } as unknown as AxsyncFn<Args, Return>

  generator.sync = options.sync
  generator.async = options.async

  return generator
}

function axsyncGenerator<Args extends any[], Return>(
  generator: AxsyncInputGenerator<Args, Return>,
): AxsyncFn<Args, Return> {
  function sync(...args: Args): Return {
    const unwrap = (value: any): any => {
      return isAxsyncYield(value)
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
      return isAxsyncYield(value)
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

  return axsyncObject({
    name: generator.name,
    async,
    sync,
  })
}

export function axsync<Args extends any[], Return>(
  options: AxsyncInputObject<Args, Return>,
): AxsyncFn<Args, Return>
export function axsync<Args extends any[], Return>(
  options: AxsyncInputGenerator<Args, Return>,
): AxsyncFn<Args, Return>
export function axsync<Args extends any[], Return>(
  options: AxsyncInputObject<Args, Return> | AxsyncInputGenerator<Args, Return>,
): AxsyncFn<Args, Return> {
  if (typeof options === 'function')
    return axsyncGenerator(options)
  else
    return axsyncObject(options)
}

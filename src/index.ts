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

export type QuansyncGenerator<Return = any, Yield = unknown> =
  Generator<Yield, Return, Awaited<Yield>>

/**
 * "Superposition" function that can be consumed in both sync and async contexts.
 */
export type QuansyncFn<Return = any, Args extends any[] = []> =
  ((...args: Args) => QuansyncGenerator<Return> & Promise<Return>)
  & {
    sync: (...args: Args) => Return
    async: (...args: Args) => Promise<Return>
  }

const ERROR_PROMISE_IN_SYNC = '[Quansync] Yielded an unexpected promise in sync context'

function isThenable<T>(value: any): value is Promise<T> {
  return value && typeof value === 'object' && typeof value.then === 'function'
}
function isGenerator<T>(value: any): value is Generator<T> {
  return value && typeof value === 'object' && typeof value[Symbol.iterator] === 'function'
}

const GET_IS_ASYNC = Symbol.for('quansync.getIsAsync')

function fromObject<Return, Args extends any[]>(
  options: QuansyncInputObject<Return, Args>,
): QuansyncFn<Return, Args> {
  const generator = function* (...args: Args): QuansyncGenerator<Return, any> {
    const isAsync = yield GET_IS_ASYNC
    if (isAsync)
      return yield options.async(...args)
    return options.sync(...args)
  }
  const fn = (...args: Args): any => {
    const iter = generator(...args) as unknown as QuansyncGenerator<Return, Args> & Promise<Return>
    iter.then = (...thenArgs) => options.async(...args).then(...thenArgs)
    return iter
  }
  fn.sync = options.sync
  fn.async = options.async
  return fn
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

function unwrapYield(value: any, isAsync?: boolean): any {
  if (value === GET_IS_ASYNC)
    return isAsync
  if (!isAsync && isThenable(value))
    throw new Error(ERROR_PROMISE_IN_SYNC)
  return value
}

function fromGenerator<Return, Args extends any[]>(
  generator: QuansyncInputGenerator<Return, Args>,
): QuansyncFn<Return, Args> {
  function sync(...args: Args): Return {
    const iterator = generator(...args)
    let current = iterator.next()
    while (!current.done) {
      current = iterator.next(unwrapYield(current.value))
    }
    return unwrapYield(current.value)
  }

  async function async(...args: Args): Promise<Return> {
    const iterator = generator(...args)
    let current = iterator.next()
    while (!current.done) {
      current = iterator.next(await unwrapYield(current.value, true))
    }
    return current.value
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
 * This function is equivalent to `quansync` but accepts a fake argument type of async functions.
 *
 * This requires to be used with a macro transformer. Do NOT use it directly.
 *
 * @internal
 */
export function quansyncMacro<Return, Args extends any[] = []>(
  options: QuansyncInput<Return, Args> | ((...args: Args) => Promise<Return> | Return),
): QuansyncFn<Return, Args> {
  return quansync(options as any)
}

/**
 * Converts a promise to a Quansync generator.
 */
export function toGenerator<T>(promise: Promise<T> | QuansyncGenerator<T> | T): QuansyncGenerator<T> {
  if (isGenerator(promise))
    return promise
  return fromPromise(promise as Promise<T>)()
}

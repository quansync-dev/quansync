export interface QuansyncInputObject<Return, Args extends any[]> {
  name?: string
  sync: (...args: Args) => Return
  async: (...args: Args) => Promise<Return>
}

export type QuansyncGeneratorFn<Return, Args extends any[]>
  = ((...args: Args) => QuansyncGenerator<Return>)

export type QuansyncInput<Return, Args extends any[]> =
  | QuansyncInputObject<Return, Args>
  | QuansyncGeneratorFn<Return, Args>

export type QuansyncGenerator<Return = any, Yield = unknown> =
  Generator<Yield, Return, Awaited<Yield>> & { __quansync?: true }

export type QuansyncAwaitableGenerator<Return = any, Yield = unknown> =
  QuansyncGenerator<Return, Yield> & Promise<Return>

/**
 * "Superposition" function that can be consumed in both sync and async contexts.
 */
export type QuansyncFn<Return = any, Args extends any[] = []> =
  ((...args: Args) => QuansyncAwaitableGenerator<Return>)
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
function isQuansyncGenerator<T>(value: any): value is QuansyncGenerator<T> {
  return isGenerator(value) && '__quansync' in value
}

export const GET_IS_ASYNC = Symbol.for('quansync.getIsAsync')

function fromObject<Return, Args extends any[]>(
  options: QuansyncInputObject<Return, Args>,
): QuansyncFn<Return, Args> {
  const generator = function* (this: any, ...args: Args): QuansyncGenerator<Return, any> {
    const isAsync = yield GET_IS_ASYNC
    if (isAsync)
      return yield options.async.apply(this, args)
    return options.sync.apply(this, args)
  }
  function fn(this: any, ...args: Args): any {
    const iter = generator.apply(this, args) as unknown as QuansyncAwaitableGenerator<Return, Args>
    iter.then = (...thenArgs) => options.async.apply(this, args).then(...thenArgs)
    iter.__quansync = true
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
  if (isQuansyncGenerator(value))
    return isAsync ? iterateAsync(value) : iterateSync(value)
  if (!isAsync && isThenable(value))
    throw new Error(ERROR_PROMISE_IN_SYNC)
  return value
}

function iterateSync<Return>(generator: QuansyncGenerator<Return, unknown>): Return {
  let current = generator.next()
  while (!current.done) {
    current = generator.next(unwrapYield(current.value))
  }
  return unwrapYield(current.value)
}

async function iterateAsync<Return>(generator: QuansyncGenerator<Return, unknown>): Promise<Return> {
  let current = generator.next()
  while (!current.done) {
    current = generator.next(await unwrapYield(current.value, true))
  }
  return current.value
}

function fromGeneratorFn<Return, Args extends any[]>(
  generatorFn: QuansyncGeneratorFn<Return, Args>,
): QuansyncFn<Return, Args> {
  return fromObject({
    name: generatorFn.name,
    async(...args) {
      return iterateAsync(generatorFn.apply(this, args))
    },
    sync(...args) {
      return iterateSync(generatorFn.apply(this, args))
    },
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
    return fromGeneratorFn(options)
  else
    return fromObject(options)
}

/**
 * Converts a promise to a Quansync generator.
 */
export function toGenerator<T>(promise: Promise<T> | QuansyncGenerator<T> | T): QuansyncGenerator<T> {
  if (isGenerator(promise))
    return promise
  return fromPromise(promise)()
}

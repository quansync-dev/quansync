import type { QuansyncAwaitableGenerator, QuansyncFn, QuansyncGenerator, QuansyncGeneratorFn, QuansyncInput, QuansyncInputObject, QuansyncOptions } from './types'

export * from './types'

export const GET_IS_ASYNC = Symbol.for('quansync.getIsAsync')

export class QuansyncError extends Error {
  constructor(message = 'Unexpected promise in sync context') {
    super(message)
    this.name = 'QuansyncError'
  }
}

function isThenable<T>(value: any): value is Promise<T> {
  return value && typeof value === 'object' && typeof value.then === 'function'
}
function isQuansyncGenerator<T>(value: any): value is QuansyncGenerator<T> {
  return value && typeof value === 'object' && typeof value[Symbol.iterator] === 'function' && '__quansync' in value
}

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
        throw new QuansyncError()
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
    throw new QuansyncError()
  return value
}

const DEFAULT_ON_YIELD = (value: any): any => value

function iterateSync<Return>(
  generator: QuansyncGenerator<Return, unknown>,
  onYield: QuansyncOptions['onYield'] = DEFAULT_ON_YIELD,
): Return {
  let current = generator.next()
  while (!current.done) {
    try {
      current = generator.next(unwrapYield(onYield(current.value, false)))
    }
    catch (err) {
      current = generator.throw(err)
    }
  }
  return unwrapYield(current.value)
}

async function iterateAsync<Return>(
  generator: QuansyncGenerator<Return, unknown>,
  onYield: QuansyncOptions['onYield'] = DEFAULT_ON_YIELD,
): Promise<Return> {
  let current = generator.next()
  while (!current.done) {
    try {
      current = generator.next(await unwrapYield(onYield(current.value, true), true))
    }
    catch (err) {
      current = generator.throw(err)
    }
  }
  return current.value
}

function fromGeneratorFn<Return, Args extends any[]>(
  generatorFn: QuansyncGeneratorFn<Return, Args>,
  options?: QuansyncOptions,
): QuansyncFn<Return, Args> {
  return fromObject({
    name: generatorFn.name,
    async(...args) {
      return iterateAsync(generatorFn.apply(this, args), options?.onYield)
    },
    sync(...args) {
      return iterateSync(generatorFn.apply(this, args), options?.onYield)
    },
  })
}

/**
 * Creates a new Quansync function, a "superposition" between async and sync.
 */
export function quansync<Return, Args extends any[] = []>(
  input: QuansyncInputObject<Return, Args>,
): QuansyncFn<Return, Args>
export function quansync<Return, Args extends any[] = []>(
  input: QuansyncGeneratorFn<Return, Args> | Promise<Return>,
  options?: QuansyncOptions,
): QuansyncFn<Return, Args>
export function quansync<Return, Args extends any[] = []>(
  input: QuansyncInput<Return, Args> | Promise<Return>,
  options?: QuansyncOptions,
): QuansyncFn<Return, Args> {
  if (isThenable(input))
    return fromPromise<Return>(input)
  if (typeof input === 'function')
    return fromGeneratorFn(input, options)
  else
    return fromObject(input)
}

/**
 * Converts a promise to a Quansync generator.
 */
export function toGenerator<T>(promise: Promise<T> | QuansyncGenerator<T> | T): QuansyncGenerator<T> {
  if (isQuansyncGenerator(promise))
    return promise
  return fromPromise(promise)()
}

/**
 * Bind this and preset params for Quansync function.
 */
export function bindThis<T, A extends any[], B extends any[], R>(fn: QuansyncFn<R, [...A, ...B]>, thisArg: T, ...args: A): QuansyncFn<R, B> {
  const newFn = fn.bind(thisArg, ...args) as QuansyncFn<R, B>
  newFn.sync = fn.sync.bind(thisArg, ...args)
  newFn.async = fn.async.bind(thisArg, ...args)
  return newFn
}

/**
 * @returns `true` if the current context is async, `false` otherwise.
 */
export function* getIsAsync(): Generator<typeof GET_IS_ASYNC, boolean, unknown> {
  return !!(yield GET_IS_ASYNC)
}

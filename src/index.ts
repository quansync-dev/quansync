import type { QuansyncAwaitableGenerator, QuansyncFn, QuansyncGenerator, QuansyncGeneratorFn, QuansyncInput, QuansyncInputObject } from './types'

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

function iterateSync<Return>(generator: QuansyncGenerator<Return, unknown>): Return {
  let current = generator.next()
  while (!current.done) {
    try {
      current = generator.next(unwrapYield(current.value))
    }
    catch (err) {
      current = generator.throw(err)
    }
  }
  return unwrapYield(current.value)
}

async function iterateAsync<Return>(generator: QuansyncGenerator<Return, unknown>): Promise<Return> {
  let current = generator.next()
  while (!current.done) {
    try {
      current = generator.next(await unwrapYield(current.value, true))
    }
    catch (err) {
      current = generator.throw(err)
    }
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
  if (isQuansyncGenerator(promise))
    return promise
  return fromPromise(promise)()
}

/**
 * Bind this and preset params for Quansync function.
 */
export function bindThis<T, A extends any[], B extends any[], R>(fn: QuansyncFn<R, [...A, ...B]>, thisArg: T, ...args: A): QuansyncFn<R, B> {
  const newFn = fn.bind(thisArg, ...args)
  newFn.sync = fn.sync.bind(thisArg, ...args)
  newFn.async = fn.async.bind(thisArg, ...args)
  return newFn
}

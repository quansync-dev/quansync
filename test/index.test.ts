import { expect, it, vi } from 'vitest'
import { all, getIsAsync, quansync, toGenerator } from '../src'
import { quansync as quansyncMacro } from '../src/macro'

it('basic', async () => {
  const add = quansync({
    name: 'add',
    sync: (a: number, b: number) => a + b,
    async: async (a: number, b: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return a + b
    },
  })

  expect(add.sync(4, 5)).toBe(9)
  expect(await add.async(4, 5)).toBe(9)
})

it('generator', async () => {
  const add = quansync({
    name: 'add',
    sync: (a: number, b: number) => a + b,
    async: async (a: number, b: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return a + b
    },
  })

  const toString = quansync({
    name: 'toString',
    sync: (value: any) => String(value),
    async: async (value: any) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return String(value)
    },
  })

  const multiply = quansync(function* (a: number, b: number) {
    let sum = (yield 0) as number
    for (let i = 0; i < b; i++) {
      const value = yield* add(sum, a)
      sum = value
    }
    const foo = yield* toString(sum)
    return foo
  })

  expect(multiply.sync(2, 3)).toBe('6')
  expect(await multiply.async(4, 5)).toBe('20')
})

it('consume with await', async () => {
  const add = quansync({
    name: 'add',
    sync: (a: number, b: number) => a + b,
    async: async (a: number, b: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return a + b
    },
  })

  await expect(add(2, 3)).resolves.toBe(5)
  expect(add.sync(2, 6)).toBe(8)
  await expect(add.async(2, 3)).resolves.toBe(5)
})

it('yield optional promise', async () => {
  interface Transformer {
    transform: (code: string) => string | Promise<string>
  }

  const transform = quansync(function* (transformers: Transformer[], code: string) {
    let current = code
    for (const transformer of transformers) {
      current = yield* toGenerator(transformer.transform(current))
      // ...
    }
    return current
  })

  expect(transform.sync([], '')).toBe('')
  await expect(transform.async([], '')).resolves.toBe('')

  expect(
    transform.sync([
      {
        transform: (code: string) => `${code}1`,
      },
    ], 'foo'),
  ).toBe('foo1')
  expect(() =>
    transform.sync([
      {
        transform: async (code: string) => `${code}1`,
      },
    ], 'foo'),
  ).toThrowErrorMatchingInlineSnapshot(`[QuansyncError: Unexpected promise in sync context]`)

  await expect(
    transform.async([
      {
        transform: async (code: string) => `${code}1`,
      },
    ], 'foo'),
  ).resolves.toBe('foo1')
})

it('yield promise', async () => {
  const run = quansync(function* (code: string) {
    const result = yield new Promise<string>((resolve) => {
      setTimeout(() => resolve(code), 10)
    })
    return result
  })

  expect(() => run.sync('foo'))
    .toThrowErrorMatchingInlineSnapshot(`[QuansyncError: Unexpected promise in sync context]`)
  await expect(run.async('foo')).resolves.toBe('foo')
})

it('throw errors', async () => {
  const throwError = quansync({
    name: 'throwError',
    sync: () => {
      throw new Error('sync error')
    },
    async: async () => {
      throw new Error('async error')
    },
  })

  await expect(throwError()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: async error]`)
  await expect(throwError.async()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: async error]`)
  expect(() => throwError.sync()).toThrowErrorMatchingInlineSnapshot(`[Error: sync error]`)
})

it('handle errors', async () => {
  const throwError = quansync({
    name: 'throwError',
    sync: () => {
      throw new Error('sync error')
    },
    async: async () => {
      return Promise.reject(new Error('async error'))
    },
  })

  const returnError = quansync(function* (fn: () => any) {
    try {
      yield* fn()
    }
    catch (err) {
      return err
    }
  })

  const fn = quansync(function* (fn: () => any) {
    return yield* fn()
  })

  await expect(returnError(throwError)).resolves.toThrowErrorMatchingInlineSnapshot(`[Error: async error]`)
  await expect(returnError.async(throwError)).resolves.toThrowErrorMatchingInlineSnapshot(`[Error: async error]`)
  expect(returnError.sync(throwError)).toMatchInlineSnapshot(`[Error: sync error]`)

  expect(returnError.sync(() => fn(throwError))).toMatchInlineSnapshot(`[Error: sync error]`)
  await expect(returnError.async(() => fn(throwError))).resolves.toMatchInlineSnapshot(`[Error: async error]`)
})

it('yield generator', async () => {
  const toString = quansync({
    name: 'toString',
    sync: (value: any) => String(value),
    async: async (value: any) => String(value),
  })

  function* produce() {
    yield 1
    yield 2
    return 3
  }

  const multiply = quansync(function* () {
    const plainGenerator = produce()
    expect(yield plainGenerator).toBe(plainGenerator)

    const result = (yield toString('str')) as string
    expect(result).toBe('str')

    return result + (yield* toString('str'))
  })

  expect(multiply.sync()).toBe('strstr')
  await expect(multiply.async()).resolves.toBe('strstr')
})

it('generator to generator', async () => {
  const fn = quansync({
    name: 'fn',
    sync: () => 1,
    async: async () => 2,
  })
  const generator = fn()
  const result = toGenerator(generator)
  expect(result).toBe(generator)
})

it('yield toGenerator array', async () => {
  const run = quansync(function* () {
    const input = ['1', 2, 3]
    const result = yield* toGenerator(input)
    expect(result).toBe(input)
    return result
  })

  expect(run.sync()).toEqual(['1', 2, 3])
  await expect(run.async()).resolves.toEqual(['1', 2, 3])
})

it('handles tail call', async () => {
  const echo = quansync({
    sync: (v: string) => v,
    async: v => Promise.resolve(v),
  })
  const produce = quansync(() => echo('hello'))

  await expect(produce()).resolves.toBe('hello')
  await expect(produce.async()).resolves.toBe('hello')
  expect(produce.sync()).toBe('hello')
})

it('import macro version', () => {
  expect(quansyncMacro).toBe(quansync)
})

it('bind this', async () => {
  const obj = quansync({
    sync(this: any) {
      return this
    },
    async async(this: any) {
      return this
    },
  })

  const fn = quansync(function* (this: any) {
    const result = yield* (obj.call(this))
    expect(this).toBe(result)
    return result
  })

  class Cls {
    sync() {
      return fn.sync.call(this)
    }

    async() {
      return fn.async.call(this)
    }

    async await() {
      return await fn.call(this)
    }
  }

  const cls = new Cls()
  await expect(cls.await()).resolves.instanceOf(Cls)
  await expect(cls.async()).resolves.instanceOf(Cls)
  expect(cls.sync()).instanceOf(Cls)
})

it('call onYield hook', async () => {
  const onYield = vi.fn(v => v + 1)
  const run = quansync(function* () {
    expect(yield 1).toBe(2)
    expect(yield 2).toBe(3)
  }, { onYield })

  await run.async()
  expect(onYield).toBeCalledTimes(2)
  run.sync()
  expect(onYield).toBeCalledTimes(4)

  // custom error on promise
  const run2 = quansync(function* () {
    return yield Promise.resolve('foo')
  }, {
    onYield: (v, isAsync) => {
      if (!isAsync && v instanceof Promise)
        throw new TypeError('custom error')
      return v
    },
  })
  expect(() => run2.sync()).toThrowErrorMatchingInlineSnapshot(`[TypeError: custom error]`)
  await expect(run2.async()).resolves.toMatchInlineSnapshot(`"foo"`)
})

it('getIsAsync', async () => {
  const fn = quansync(function* () {
    const isAsync = (yield getIsAsync()) as boolean
    return isAsync
  })
  await expect(fn.async()).resolves.toBe(true)
  await expect(fn()).resolves.toBe(true)
  expect(fn.sync()).toBe(false)
})

it('thenable', async () => {
  const add = quansync(Promise.resolve(5))
  expect(() => add.sync()).toThrowErrorMatchingInlineSnapshot(`[QuansyncError: Unexpected promise in sync context]`)
  await expect(add.async()).resolves.toBe(5)
})

it('combine all', async () => {
  const add = quansync({
    name: 'add',
    sync: (a: number, b: number) => a + b,
    async: async (a: number, b: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return a + b
    },
  })
  const calc = quansync(function* () {
    return all([add(1, 2), add(3, 4)][Symbol.iterator]())
  })
  expect(calc.sync()).toEqual([3, 7])
  await expect(calc()).resolves.toEqual([3, 7])
})

import { expect, it } from 'vitest'
import { isQuansyncYield, quansync, toGenerator } from '../src'

it('basic', async () => {
  const add = quansync({
    name: 'add',
    sync: (a: number, b: number) => a + b,
    async: async (a: number, b: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return a + b
    },
  })

  const result1 = add(1, 2).next().value
  if (isQuansyncYield(result1)) {
    expect(result1.sync()).toBe(3)
    expect(await result1.async()).toBe(3)
  }
  else {
    throw new Error('result1 is not QuansyncYield')
  }

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

  const multiply = quansync(function *(a: number, b: number) {
    let sum = (yield 0) as number
    for (let i = 0; i < b; i++) {
      const value = yield * add(sum, a)
      sum = value
    }
    const foo = yield * toString(sum)
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

  const transform = quansync(function *(transformers: Transformer[], code: string) {
    let current = code
    for (const transformer of transformers) {
      current = yield * toGenerator(transformer.transform(current))
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
  ).toThrowErrorMatchingInlineSnapshot(`[Error: [Quansync] Yielded an unexpected promise in sync context]`)

  await expect(
    transform.async([
      {
        transform: async (code: string) => `${code}1`,
      },
    ], 'foo'),
  ).resolves.toBe('foo1')
})

it('yield promise', async () => {
  const run = quansync(function *(code: string) {
    const result = yield new Promise<string>((resolve) => {
      setTimeout(() => resolve(code), 10)
    })
    return result
  })

  expect(() => run.sync('foo'))
    .toThrowErrorMatchingInlineSnapshot(`[Error: [Quansync] Yielded an unexpected promise in sync context]`)
  await expect(run.async('foo')).resolves.toBe('foo')
})

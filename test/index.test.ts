import { expect, it } from 'vitest'
import { isQuansyncYield, quansync } from '../src'

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
    return yield * toString(sum)
  })

  expect(multiply.sync(2, 3)).toBe('6')
  expect(await multiply.async(4, 5)).toBe('20')
})

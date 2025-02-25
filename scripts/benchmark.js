// @ts-check
import gensync from 'gensync'
import { Bench, hrtimeNow } from 'tinybench'
// eslint-disable-next-line antfu/no-import-dist
import { quansync } from '../dist/index.mjs'

const bench = new Bench({
  name: 'sync benchmark',
  time: 100,
  now: hrtimeNow,
})

const fnSync = () => 10
const fnAsync = async () => 10
const quansyncFn = quansync({
  sync: fnSync,
  async: fnAsync,
})
const gensyncFn = gensync({
  sync: fnSync,
  async: fnAsync,
})

const addNativeSync = /** @param {number} n */ n => fnSync() + n
const addNativeAsync = /** @param {number} n */ async n => await fnAsync() + n

const quansyncAdd = quansync(/** @param {number} n */ function* (n) {
  return (yield * quansyncFn()) + n
})
const gensyncAdd = gensync(/** @param {number} n */ function* (n) {
  return (yield * gensyncFn()) + n
})

bench
  .add('sync: native', () => {
    addNativeSync(1)
  })
  .add('sync: quansync', () => {
    quansyncAdd.sync(1)
  })
  .add('sync: gensync', async () => {
    gensyncAdd.sync(1)
  })
  .add('async: native', async () => {
    await addNativeAsync(1)
  })
  .add('async: quansync', async () => {
    await quansyncAdd.async(1)
  })
  .add('async: gensync', async () => {
    await gensyncAdd.async(1)
  })

console.info('Running benchmark...')
await bench.run()
console.table(bench.table())

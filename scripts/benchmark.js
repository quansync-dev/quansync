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

const sync = () => 10
const async = async () => 10
const addNativeSync = /** @param {number} n */ n => sync() + n
const addNativeAsync = /** @param {number} n */ async n => await async() + n

const quansyncFn = quansync({
  sync: () => 10,
  async: async () => 10,
})
const quansyncAdd = quansync(/** @param {number} n */ function* (n) {
  return (yield * quansyncFn()) + n
})

const gensyncFn = gensync({
  sync: () => 10,
  async: async () => 10,
})
const gensyncAdd = gensync(/** @param {number} n */ function* (n) {
  return (yield * gensyncFn()) + n
})

bench
  .add('sync: native fn', () => {
    sync()
  })
  .add('sync: quansync fn', () => {
    quansyncFn.sync()
  })
  .add('sync: gensync fn ', () => {
    gensyncFn.sync()
  })

  .add('sync: native add', () => {
    addNativeSync(1)
  })
  .add('sync: quansync add', () => {
    quansyncAdd.sync(1)
  })
  .add('sync: gensync add', () => {
    gensyncAdd.sync(1)
  })

  // ASYNC
  .add('async: native fn', async () => {
    await async()
  })
  .add('async: quansync fn', async () => {
    await quansyncFn.async()
  })
  .add('async: gensync fn ', async () => {
    await gensyncFn.async()
  })

  .add('async: native add', async () => {
    await addNativeAsync(1)
  })
  .add('async: quansync add', async () => {
    await quansyncAdd.async(1)
  })
  .add('async: gensync add', async () => {
    await gensyncAdd.async(1)
  })

console.info('Running benchmark...')
await bench.run()
console.table(bench.table())

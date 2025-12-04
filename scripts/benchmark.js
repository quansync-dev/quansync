// @ts-check
import gensync from 'gensync'
import { bench, do_not_optimize, run, summary } from 'mitata'
// eslint-disable-next-line antfu/no-import-dist
import { quansync } from '../dist/index.js'

const sync = () => 10
const async = async () => 10
const addNativeSync = /** @param {number} n */ n => sync() + n
const addNativeAsync = /** @param {number} n */ async n => await async() + n

const quansyncFn = quansync({
  sync: () => 10,
  async: async () => 10,
})
const quansyncAdd = quansync(/** @param {number} n */ function* (n) {
  return (yield* quansyncFn()) + n
})

const gensyncFn = gensync({
  sync: () => 10,
  async: async () => 10,
})
const gensyncAdd = gensync(/** @param {number} n */ function* (n) {
  return (yield* gensyncFn()) + n
})

summary(() => {
  bench('sync: native fn', function* () {
    yield () => do_not_optimize(sync())
  })
  bench('sync: quansync fn', function* () {
    yield () => do_not_optimize(quansyncFn.sync())
  })
  bench('sync: gensync fn ', function* () {
    yield () => do_not_optimize(gensyncFn.sync())
  })
})

summary(() => {
  bench('sync: native add', function* () {
    yield () => do_not_optimize(addNativeSync(1))
  })
  bench('sync: native await add', function* () {
    yield async () => do_not_optimize(await addNativeSync(1))
  })
  bench('sync: quansync add', function* () {
    yield () => do_not_optimize(quansyncAdd.sync(1))
  })
  bench('sync: gensync add', function* () {
    yield () => do_not_optimize(gensyncAdd.sync(1))
  })
})

summary(() => {
  bench('async: native fn', function* () {
    yield async () => do_not_optimize(await async())
  })
  bench('async: quansync fn', function* () {
    yield async () => do_not_optimize(await quansyncFn.async())
  })
  bench('async: gensync fn ', function* () {
    yield async () => do_not_optimize(await gensyncFn.async())
  })
})

summary(() => {
  bench('async: native add', function* () {
    yield async () => do_not_optimize(await addNativeAsync(1))
  })
  bench('async: quansync add', function* () {
    yield async () => do_not_optimize(await quansyncAdd.async(1))
  })
  bench('async: gensync add', function* () {
    yield async () => do_not_optimize(await gensyncAdd.async(1))
  })
})

console.info('Running benchmark...')
await run()

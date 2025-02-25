/* eslint-disable no-unused-expressions */

import gensync from 'gensync'
import { Bench } from 'tinybench'
// eslint-disable-next-line antfu/no-import-dist
import { quansync } from '../dist/index.mjs'

const bench = new Bench({
  name: 'quansync benchmark',
  time: 100,
})

bench
  .add('native', async () => {
    const fnSync = () => 10
    const fnAsync = async () => 10

    fnSync() + 1;
    (await fnAsync()) + 1
  })
  .add('quansync', async () => {
    const fn = quansync({
      sync: () => 10,
      async: async () => 10,
    })
    fn.sync() + 1;
    (await fn.async()) + 1
  })
  .add('gensync', async () => {
    const fn = gensync({
      sync: () => 10,
      async: async () => 10,
    })
    fn.sync();
    (await fn.async()) + 1
  })

console.info('Running benchmark...')
await bench.run()
console.table(bench.table())

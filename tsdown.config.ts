import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/{index,macro}.ts',
  format: ['cjs', 'esm'],
  inlineOnly: [],
  exports: true,
  dts: {
    tsgo: true,
  },
})

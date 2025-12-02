import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/*',
  format: ['cjs', 'esm'],
  inlineOnly: [],
  exports: true,
  dts: {
    tsgo: true,
  },
})

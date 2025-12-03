import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/{index,macro}.ts',
  inlineOnly: [],
  exports: true,
  dts: {
    tsgo: true,
  },
})

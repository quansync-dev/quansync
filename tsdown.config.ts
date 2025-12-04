import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/{index,macro}.ts',
  platform: 'neutral',
  inlineOnly: [],
  exports: true,
  dts: {
    tsgo: true,
  },
})

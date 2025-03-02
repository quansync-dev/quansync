import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/macro',
    'src/types',
  ],
  declaration: 'compatible',
  rollup: {
    emitCJS: true,
  },
  clean: true,
})

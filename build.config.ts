import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/macro',
  ],
  declaration: 'node16',
  clean: true,
})

import type { QuansyncFn, QuansyncInput } from './types'
import { quansync as _quansync } from './index'

export type * from './types'

/**
 * This function is equivalent to `quansync` from main entry
 * but accepts a fake argument type of async functions.
 *
 * This requires to be used with the macro transformer `unplugin-quansync`.
 * Do NOT use it directly.
 *
 * @internal
 */
export const quansync = _quansync as
  <Return, Args extends any[] = []>(
    options: QuansyncInput<Return, Args> | ((...args: Args) => Promise<Return> | Return),
  ) => QuansyncFn<Return, Args>

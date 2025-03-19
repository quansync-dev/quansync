import type { QuansyncFn, QuansyncGeneratorFn, QuansyncInputObject, QuansyncOptions } from './types'
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
{
  <Return, Args extends any[] = []>(
    input: QuansyncInputObject<Return, Args>,
  ): QuansyncFn<Return, Args>
  <Return, Args extends any[] = []>(
    input: QuansyncGeneratorFn<Return, Args> | Promise<Return> | ((...args: Args) => Promise<Return> | Return),
    options?: QuansyncOptions,
  ): QuansyncFn<Return, Args>
}

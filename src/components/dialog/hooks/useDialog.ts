import { inject } from 'vue'

import { DIALOG_KEY, type DialogContext } from '../types'

export function useDialog<TResult = unknown>() {
  const context = inject(DIALOG_KEY)

  if (!context) {
    throw new Error('useDialog 只能在通过 Dialog.show() 打开的组件内部使用。')
  }

  return context as DialogContext<TResult>
}

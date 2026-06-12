import { reactive } from 'vue'

import type { ConfirmInstance, ConfirmOptions } from './types'

const defaultOptions = {
  closeOnEsc: true,
  destructive: false,
  maskClosable: false,
} satisfies Required<Pick<ConfirmOptions, 'closeOnEsc' | 'destructive' | 'maskClosable'>>

const stack = reactive<ConfirmInstance[]>([])

function createId() {
  return `confirm-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeOptions(options?: string | ConfirmOptions): ConfirmOptions {
  if (typeof options === 'string') {
    return {
      description: options,
    }
  }

  return options ?? {}
}

function remove(id: string, delay = 160) {
  const instance = stack.find((item) => item.id === id)
  if (!instance) return

  instance.open = false

  window.setTimeout(() => {
    const index = stack.findIndex((item) => item.id === id)
    if (index >= 0) stack.splice(index, 1)
  }, delay)
}

export const Confirm = {
  stack,

  show(options?: string | ConfirmOptions) {
    const settings = {
      ...defaultOptions,
      ...normalizeOptions(options),
    }

    return new Promise<boolean>((resolve, reject) => {
      stack.push({
        id: createId(),
        open: true,
        options: settings,
        confirmLoading: false,
        resolve,
        reject,
      })
    })
  },

  close(id: string) {
    remove(id)
  },

  closeAll() {
    stack.forEach((instance) => {
      instance.open = false
      instance.resolve(false)
    })
    stack.splice(0, stack.length)
  },
}

export function confirm(options?: string | ConfirmOptions) {
  return Confirm.show(options)
}

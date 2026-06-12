import type { DialogOptions } from './types'

declare module 'vue' {
  interface ComponentCustomOptions {
    dialogOptions?: DialogOptions
  }
}

export {}

import type { HTMLAttributes } from 'vue'

export { default as Input } from './index.vue'

export interface InputProps {
  class?: HTMLAttributes['class']
  clearable?: boolean
  defaultValue?: string | number
  disabled?: boolean
  modelValue?: string | number
  readonly?: boolean
  showPasswordToggle?: boolean
  type?: string
}

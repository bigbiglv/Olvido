import type { HTMLAttributes } from 'vue'

export { default as Textarea } from './index.vue'

export interface TextareaProps {
  class?: HTMLAttributes['class']
  clearable?: boolean
  defaultValue?: string | number
  disabled?: boolean
  maxlength?: number | string
  modelValue?: string | number
  readonly?: boolean
  showCount?: boolean
}

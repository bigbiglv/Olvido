import type { HTMLAttributes } from 'vue'

export { default as Separator } from './index.vue'

export interface SeparatorProps {
  class?: HTMLAttributes['class']
  decorative?: boolean
  orientation?: 'horizontal' | 'vertical'
}

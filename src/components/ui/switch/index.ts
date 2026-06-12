import type { SwitchRootEmits, SwitchRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export { default as Switch } from './index.vue'

export interface SwitchProps extends SwitchRootProps {
  class?: HTMLAttributes['class']
}

export type SwitchEmits = SwitchRootEmits

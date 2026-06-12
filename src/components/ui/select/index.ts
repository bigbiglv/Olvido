import type {
  SelectContentProps as RekaSelectContentProps,
  SelectItemProps as RekaSelectItemProps,
  SelectRootEmits,
  SelectRootProps,
  SelectTriggerProps as RekaSelectTriggerProps,
  SelectValueProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export { default as Select } from './index.vue'
export { default as SelectContent } from './components/Content.vue'
export { default as SelectItem } from './components/Item.vue'
export { default as SelectTrigger } from './components/Trigger.vue'
export { default as SelectValue } from './components/Value.vue'

export type SelectProps = SelectRootProps
export type SelectEmits = SelectRootEmits
export interface SelectContentProps extends RekaSelectContentProps {
  class?: HTMLAttributes['class']
}

export interface SelectItemProps extends RekaSelectItemProps {
  class?: HTMLAttributes['class']
}

export interface SelectTriggerProps extends RekaSelectTriggerProps {
  class?: HTMLAttributes['class']
  clearable?: boolean
}

export type { SelectValueProps }

import type { LabelProps as RekaLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export { default as Label } from './index.vue'

export interface LabelProps extends RekaLabelProps {
  class?: HTMLAttributes['class']
}

import type { VariantProps } from 'class-variance-authority'
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { buttonVariants } from './variants'

export { default as Button } from './index.vue'
export { buttonVariants } from './variants'

export type ButtonVariants = VariantProps<typeof buttonVariants>

export interface ButtonProps extends PrimitiveProps {
  class?: HTMLAttributes['class']
  size?: ButtonVariants['size']
  variant?: ButtonVariants['variant']
}

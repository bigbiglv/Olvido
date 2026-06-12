import type { VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'vue'

import { badgeVariants } from './variants'

export { default as Badge } from './index.vue'
export { badgeVariants } from './variants'

export type BadgeVariants = VariantProps<typeof badgeVariants>

export interface BadgeProps {
  class?: HTMLAttributes['class']
  variant?: BadgeVariants['variant']
}

import type { HTMLAttributes } from 'vue'

export { default as Card } from './index.vue'
export { default as CardContent } from './components/Content.vue'
export { default as CardDescription } from './components/Description.vue'
export { default as CardFooter } from './components/Footer.vue'
export { default as CardHeader } from './components/Header.vue'
export { default as CardTitle } from './components/Title.vue'

export interface CardProps {
  class?: HTMLAttributes['class']
}

export type CardContentProps = CardProps
export type CardDescriptionProps = CardProps
export type CardFooterProps = CardProps
export type CardHeaderProps = CardProps
export type CardTitleProps = CardProps

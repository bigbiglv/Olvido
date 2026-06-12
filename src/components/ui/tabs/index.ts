import type {
  TabsContentProps as RekaTabsContentProps,
  TabsListProps as RekaTabsListProps,
  TabsRootEmits,
  TabsRootProps,
  TabsTriggerProps as RekaTabsTriggerProps,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export { default as Tabs } from './index.vue'
export { default as TabsContent } from './components/Content.vue'
export { default as TabsList } from './components/List.vue'
export { default as TabsTrigger } from './components/Trigger.vue'

export type TabsProps = TabsRootProps
export type TabsEmits = TabsRootEmits

export interface TabsContentProps extends RekaTabsContentProps {
  class?: HTMLAttributes['class']
}

export interface TabsListProps extends RekaTabsListProps {
  class?: HTMLAttributes['class']
}

export interface TabsTriggerProps extends RekaTabsTriggerProps {
  class?: HTMLAttributes['class']
}

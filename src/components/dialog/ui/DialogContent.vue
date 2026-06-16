<script setup lang="ts">
import { X } from 'lucide-vue-next'
import {
  DialogClose as DialogClosePrimitive,
  DialogContent as DialogContentPrimitive,
  type DialogContentEmits,
  type DialogContentProps,
  DialogPortal as DialogPortalPrimitive,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed, useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'
import DialogOverlay from './DialogOverlay.vue'

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      class?: HTMLAttributes['class']
      closeLabel?: string
      showClose?: boolean
      showOverlay?: boolean
      style?: HTMLAttributes['style']
      disableCssAnimation?: boolean
    }
  >(),
  {
    class: undefined,
    closeLabel: 'Close',
    showClose: true,
    showOverlay: true,
    style: undefined,
    disableCssAnimation: false,
  },
)
const emits = defineEmits<DialogContentEmits>()
const attrs = useAttrs()
const delegatedProps = computed(() => {
  const delegated: Record<string, unknown> = { ...props }

  delete delegated.class
  delete delegated.closeLabel
  delete delegated.showClose
  delete delegated.showOverlay
  delete delegated.style
  delete delegated.disableCssAnimation

  return delegated
})
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortalPrimitive>
    <DialogOverlay v-if="props.showOverlay" />
    <DialogContentPrimitive
      v-bind="{ ...forwarded, ...attrs }"
      :style="props.style"
      :class="
        cn(
          'fixed left-1/2 top-1/2 z-[1000] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border bg-background p-6 shadow-lg sm:rounded-lg',
          !props.disableCssAnimation && 'duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          props.class,
        )
      "
    >
      <slot />
      <DialogClosePrimitive
        v-if="props.showClose"
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X class="size-4" />
        <span class="sr-only">{{ props.closeLabel }}</span>
      </DialogClosePrimitive>
    </DialogContentPrimitive>
  </DialogPortalPrimitive>
</template>

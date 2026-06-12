<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import {
  AlertDialogContent,
  type AlertDialogContentEmits,
  type AlertDialogContentProps,
  AlertDialogOverlay,
  AlertDialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<
  AlertDialogContentProps & {
    class?: HTMLAttributes['class']
    overlayClass?: HTMLAttributes['class']
    overlayStyle?: HTMLAttributes['style']
    style?: HTMLAttributes['style']
  }
>()
const emits = defineEmits<AlertDialogContentEmits>()
const delegatedProps = reactiveOmit(props, 'class', 'overlayClass', 'overlayStyle', 'style')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay
      :style="props.overlayStyle"
      :class="
        cn(
          'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          props.overlayClass,
        )
      "
    />
    <AlertDialogContent
      v-bind="{ ...$attrs, ...forwarded }"
      :style="props.style"
      :class="
        cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:max-w-lg',
          props.class,
        )
      "
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>

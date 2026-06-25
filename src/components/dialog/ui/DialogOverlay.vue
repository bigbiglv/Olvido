<script setup lang="ts">
import { DialogOverlay as DialogOverlayPrimitive, type DialogOverlayProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogOverlayPrimitive
    v-bind="props"
    :class="
      cn(
        'fixed inset-0 z-[1000] bg-black/10 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        props.class,
      )
    "
  />
</template>

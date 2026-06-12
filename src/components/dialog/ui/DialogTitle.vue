<script setup lang="ts">
import { DialogTitle as DialogTitlePrimitive, type DialogTitleProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogTitlePrimitive
    v-bind="props"
    :class="cn('text-lg font-semibold leading-none tracking-normal', props.class)"
  >
    <slot />
  </DialogTitlePrimitive>
</template>

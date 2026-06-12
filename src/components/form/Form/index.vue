<script setup lang="ts">
import { useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'
import { provideFormValidationMode, type FormValidationMode } from '../validation'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    validationMode?: FormValidationMode
  }>(),
  {
    class: undefined,
    validationMode: 'input',
  },
)

const attrs = useAttrs()

provideFormValidationMode(() => props.validationMode)
</script>

<template>
  <form v-bind="attrs" :class="cn('space-y-6', props.class)">
    <slot />
  </form>
</template>

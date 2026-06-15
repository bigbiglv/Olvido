<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { ChevronDown, X } from 'lucide-vue-next'
import { computed } from 'vue'
import {
  injectSelectRootContext,
  SelectIcon,
  SelectTrigger as RekaSelectTrigger,
  useForwardProps,
} from 'reka-ui'
import type { SelectTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<SelectTriggerProps & { class?: HTMLAttributes['class']; clearable?: boolean }>(),
  {
    class: undefined,
    clearable: false,
    disabled: false,
  },
)

const rootContext = injectSelectRootContext()
const delegatedProps = reactiveOmit(props, 'class', 'clearable')
const forwardedProps = useForwardProps(delegatedProps)

const isDisabled = computed(() => Boolean(rootContext.disabled?.value || props.disabled))
const hasValue = computed(() => {
  const value = rootContext.modelValue.value

  if (Array.isArray(value)) {
    return value.length > 0
  }

  return value !== undefined && value !== null && value !== ''
})
const canClear = computed(() => props.clearable && hasValue.value && !isDisabled.value)

function clearValue() {
  // 多选清空时保留数组类型，避免 multiple 场景下值类型漂移。
  rootContext.modelValue.value = rootContext.multiple.value ? [] : undefined
  rootContext.onOpenChange(false)
  rootContext.triggerElement.value?.focus()
}
</script>

<template>
  <div class="relative w-full">
    <RekaSelectTrigger
      v-bind="forwardedProps"
      :class="
        cn(
          'relative flex h-9 w-full items-center whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 pr-9 text-start text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate',
          'aria-invalid:!border-destructive aria-invalid:focus:!ring-destructive/20',
          clearable && 'pr-16',
          props.class,
        )
      "
    >
      <slot />
      <SelectIcon as-child>
        <ChevronDown
          class="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 shrink-0 opacity-50"
        />
      </SelectIcon>
    </RekaSelectTrigger>

    <button
      v-if="canClear"
      aria-label="清空选择"
      class="absolute right-7 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      :disabled="isDisabled"
      type="button"
      @click.stop.prevent="clearValue"
      @pointerdown.stop.prevent
    >
      <X class="size-4" />
    </button>
  </div>
</template>

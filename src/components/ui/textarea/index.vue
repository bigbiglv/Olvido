<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { X } from 'lucide-vue-next'
import { computed, useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

interface Props {
  class?: HTMLAttributes['class']
  clearable?: boolean
  defaultValue?: string | number
  disabled?: boolean
  maxlength?: number | string
  modelValue?: string | number
  readonly?: boolean
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  clearable: false,
  defaultValue: undefined,
  disabled: false,
  maxlength: undefined,
  modelValue: undefined,
  readonly: false,
  showCount: false,
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const attrs = useAttrs()
const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
})

const valueLength = computed(() => String(modelValue.value ?? '').length)
const hasValue = computed(() => valueLength.value > 0)
const canClear = computed(
  () => props.clearable && hasValue.value && !props.disabled && !props.readonly,
)
const countText = computed(() => {
  if (props.maxlength === undefined) {
    return String(valueLength.value)
  }

  return `${valueLength.value}/${props.maxlength}`
})

function clearValue() {
  modelValue.value = ''
}
</script>

<template>
  <div class="relative w-full">
    <textarea
      v-bind="attrs"
      v-model="modelValue"
      :class="
        cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:!border-destructive aria-invalid:focus-visible:!ring-destructive/20',
          clearable && 'pr-9',
          showCount && 'pb-6',
          props.class,
        )
      "
      :disabled="disabled"
      :maxlength="maxlength"
      :readonly="readonly"
    />

    <button
      v-if="canClear"
      aria-label="清空输入内容"
      class="absolute right-2 top-2 flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      :disabled="disabled"
      type="button"
      @click="clearValue"
      @mousedown.prevent
    >
      <X class="size-4" />
    </button>

    <span
      v-if="showCount"
      class="pointer-events-none absolute bottom-1.5 right-2 text-xs leading-none text-muted-foreground"
    >
      {{ countText }}
    </span>
  </div>
</template>

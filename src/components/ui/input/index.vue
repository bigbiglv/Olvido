<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { Eye, EyeOff, X } from 'lucide-vue-next'
import { computed, ref, useAttrs } from 'vue'
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
  modelValue?: string | number
  readonly?: boolean
  showPasswordToggle?: boolean
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  clearable: false,
  defaultValue: undefined,
  disabled: false,
  modelValue: undefined,
  readonly: false,
  showPasswordToggle: false,
  type: 'text',
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const attrs = useAttrs()
const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: true,
})

const isPasswordVisible = ref(false)

const hasValue = computed(() => {
  return (
    modelValue.value !== undefined &&
    modelValue.value !== null &&
    String(modelValue.value).length > 0
  )
})

const canClear = computed(
  () => props.clearable && hasValue.value && !props.disabled && !props.readonly,
)

const resolvedType = computed(() => {
  if (!props.showPasswordToggle) {
    return props.type
  }

  return isPasswordVisible.value ? 'text' : 'password'
})

const actionPaddingClass = computed(() => {
  if (props.clearable && props.showPasswordToggle) {
    return 'pr-16'
  }

  if (props.clearable || props.showPasswordToggle) {
    return 'pr-9'
  }

  return undefined
})

function clearValue() {
  modelValue.value = ''
}
</script>

<template>
  <div class="relative w-full">
    <input
      v-bind="attrs"
      v-model="modelValue"
      :class="
        cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:!border-destructive aria-invalid:focus-visible:!ring-destructive/20',
          actionPaddingClass,
          props.class,
        )
      "
      :disabled="disabled"
      :readonly="readonly"
      :type="resolvedType"
    />

    <button
      v-if="canClear"
      aria-label="清空输入内容"
      :class="
        cn(
          'absolute top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          showPasswordToggle ? 'right-8' : 'right-2',
        )
      "
      :disabled="disabled"
      type="button"
      @click="clearValue"
      @mousedown.prevent
    >
      <X class="size-4" />
    </button>

    <button
      v-if="showPasswordToggle"
      :aria-label="isPasswordVisible ? '隐藏输入内容' : '显示输入内容'"
      class="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      :disabled="disabled"
      type="button"
      @click="isPasswordVisible = !isPasswordVisible"
      @mousedown.prevent
    >
      <EyeOff v-if="isPasswordVisible" class="size-4" />
      <Eye v-else class="size-4" />
    </button>
  </div>
</template>

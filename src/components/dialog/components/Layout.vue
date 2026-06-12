<script setup lang="ts">
import { defineComponent, markRaw, onMounted, useSlots } from 'vue'

import { useDialog } from '../hooks/useDialog'
import type { DialogSlotName } from '../types'

defineOptions({ name: 'ProgrammaticDialogLayout' })

defineSlots<{
  default?: () => unknown
  title?: () => unknown
  headerExtra?: () => unknown
  footer?: () => unknown
}>()

const slots = useSlots()
const { setSlot } = useDialog()

onMounted(() => {
  ;(['title', 'headerExtra', 'footer'] as DialogSlotName[]).forEach((name) => {
    if (!slots[name]) return

    // 将模板插槽转成可渲染组件，交给外层 Dialog 统一布局。
    setSlot(
      name,
      markRaw(
        defineComponent({
          setup() {
            return () => slots[name]?.()
          },
        }),
      ),
    )
  })
})
</script>

<template>
  <slot />
</template>

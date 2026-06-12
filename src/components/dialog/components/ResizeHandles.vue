<script setup lang="ts">
import { RESIZE_HANDLES, type ResizeDirection } from '../constants'

defineProps<{
  canResize: boolean
}>()

const emit = defineEmits<{
  resizeStart: [event: MouseEvent, direction: ResizeDirection]
}>()
</script>

<template>
  <template v-if="canResize">
    <div
      v-for="handle in RESIZE_HANDLES"
      :key="handle.direction"
      :data-dialog-resize-handle="handle.direction"
      :class="['absolute z-10', handle.className]"
      @pointerdown.stop
      @mousedown.stop="(event) => emit('resizeStart', event, handle.direction)"
    ></div>
  </template>
</template>

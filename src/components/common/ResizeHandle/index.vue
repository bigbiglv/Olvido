<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    minWidth?: number
    maxWidth?: number
    direction?: 'left' | 'right'
  }>(),
  {
    minWidth: 150,
    maxWidth: 600,
    direction: 'right',
  }
)

const width = defineModel<number>({ required: true })

const isDragging = ref(false)
let startX = 0
let startWidth = 0

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true
  startX = e.clientX
  startWidth = width.value

  // 防止拖拽时选中文字或产生其它意外行为
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return

  const deltaX = e.clientX - startX
  let newWidth = startWidth
  if (props.direction === 'right') {
    newWidth += deltaX
  } else {
    newWidth -= deltaX
  }

  // 限制在最小和最大宽度之间
  newWidth = Math.max(props.minWidth, Math.min(props.maxWidth, newWidth))
  width.value = newWidth
}

function handleMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false

  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

onUnmounted(() => {
  // 销毁时清理，防止意外残留
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  if (isDragging.value) {
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
})
</script>

<template>
  <div
    class="relative w-[6px] -mx-[3px] h-full cursor-col-resize group select-none shrink-0 z-[1]"
    @mousedown="handleMouseDown"
  >
    <!-- 视觉分界细线 -->
    <div
      class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] transition-all duration-200"
      :class="[
        isDragging
          ? 'w-[3px] bg-indigo-500 dark:bg-indigo-400'
          : 'bg-slate-200 dark:bg-zinc-800 group-hover:w-[3px] group-hover:bg-indigo-500/80 dark:group-hover:bg-indigo-400/80'
      ]"
    />
  </div>
</template>

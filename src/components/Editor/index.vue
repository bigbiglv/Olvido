<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Crepe } from '@milkdown/crepe'
import { replaceAll } from '@milkdown/kit/utils'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const { modelValue = '' } = defineProps<Props>()
const emit = defineEmits<Emits>()

const editorRef = ref<HTMLDivElement | null>(null)
let crepe: Crepe | null = null
const isUpdatingFromProp = ref(false)

onMounted(async () => {
  if (!editorRef.value) return

  crepe = new Crepe({
    root: editorRef.value,
    defaultValue: modelValue,
  })

  crepe.on((listener) => {
    listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
      if (markdown !== prevMarkdown && !isUpdatingFromProp.value) {
        emit('update:modelValue', markdown)
      }
    })
  })

  try {
    await crepe.create()
  } catch (error) {
    console.error('Failed to create Milkdown Crepe instance:', error)
  }
})

watch(() => modelValue, (newValue) => {
  if (crepe && newValue !== crepe.getMarkdown()) {
    isUpdatingFromProp.value = true
    try {
      crepe.editor.action(replaceAll(newValue))
    } catch (error) {
      console.error('Failed to update Milkdown content:', error)
    } finally {
      // Defensive timeout to reset the state lock and allow next user input
      setTimeout(() => {
        isUpdatingFromProp.value = false
      }, 50)
    }
  }
})
</script>

<template>
  <div class="milkdown-editor-wrapper w-full h-full min-h-[300px]">
    <div ref="editorRef" class="editor-container h-full"></div>
  </div>
</template>

<style scoped>
.milkdown-editor-wrapper {
  width: 100%;
}
.editor-container :deep(.milkdown) {
  max-width: 100%;
}
</style>

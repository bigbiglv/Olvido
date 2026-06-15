<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Crepe } from '@milkdown/crepe'
import { replaceAll } from '@milkdown/kit/utils'
import { Code } from 'lucide-vue-next'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<Emits>()

const isSplitMode = ref(false)
const editorRef = ref<HTMLDivElement | null>(null)
const lineNumbersRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

let crepe: Crepe | null = null
const isUpdatingFromProp = ref(false)

// Calculate line count for line numbers
const lineCount = computed(() => {
  const lines = props.modelValue.split('\n').length
  return lines > 0 ? lines : 1
})

// Synchronize scroll between textarea and line numbers
function handleScroll() {
  if (lineNumbersRef.value && textareaRef.value) {
    lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

// Ensure scroll is synchronized on value changes
watch(() => props.modelValue, () => {
  setTimeout(() => {
    handleScroll()
  }, 0)
})

const isTextareaActive = ref(false)

function handleTextareaInput(e: Event) {
  isTextareaActive.value = true
  const value = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
}

function handleTextareaFocus() {
  isTextareaActive.value = true
}

function handleTextareaBlur() {
  isTextareaActive.value = false
}

onMounted(async () => {
  if (!editorRef.value) return

  crepe = new Crepe({
    root: editorRef.value,
    defaultValue: props.modelValue,
  })

  crepe.on((listener) => {
    listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
      if (isTextareaActive.value) return

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

watch(() => props.modelValue, (newValue) => {
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
  <div class="flex flex-col h-full bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700/60 shadow-sm overflow-hidden">
    <!-- Header Control Bar -->
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700/60 px-6 py-2 bg-slate-50/50 dark:bg-zinc-900/40">
      <div></div>
      
      <!-- Right Side Actions: Toggle Split Source Mode -->
      <div class="flex items-center gap-2">
        <button
          class="flex items-center justify-center p-1.5 rounded-lg border text-slate-500 dark:text-zinc-400 transition duration-200 shadow-sm cursor-pointer size-8"
          :class="isSplitMode 
            ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:text-white dark:border-indigo-500 dark:hover:bg-indigo-600' 
            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700/60 hover:bg-slate-100 dark:hover:bg-zinc-700'"
          title="源码模式"
          @click="isSplitMode = !isSplitMode"
        >
          <Code class="size-4" />
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 flex overflow-hidden min-h-[300px] bg-white dark:bg-zinc-800">
      <div class="w-full h-full flex overflow-hidden">
        <!-- Left Side: Milkdown WYSIWYG Editor (default preview mode) -->
        <div 
          class="h-full overflow-y-auto transition-all duration-300 ease-in-out min-w-0" 
          :class="isSplitMode ? 'w-1/2 p-4' : 'w-full p-6'"
        >
          <div ref="editorRef" class="editor-container h-full"></div>
        </div>

        <!-- Right Side: Raw Markdown Source Editor -->
        <div 
          class="h-full overflow-hidden bg-slate-50/20 dark:bg-zinc-900/10 transition-all duration-300 ease-in-out flex min-w-0"
          :class="isSplitMode ? 'w-1/2 opacity-100 p-4 border-l border-slate-200 dark:border-zinc-700/60' : 'w-0 opacity-0 pointer-events-none p-0 border-l-0'"
        >
          <!-- Line Numbers -->
          <div
            ref="lineNumbersRef"
            class="line-numbers text-right text-slate-300 dark:text-zinc-600 font-mono text-sm select-none pr-3 border-r border-slate-100 dark:border-zinc-800 mr-4 w-9 overflow-y-hidden"
          >
            <div v-for="n in lineCount" :key="n" class="h-6 leading-6">{{ n }}</div>
          </div>
          <!-- Textarea -->
          <textarea
            ref="textareaRef"
            :value="modelValue"
            placeholder="在此输入 Markdown 源码..."
            class="flex-1 resize-none border-0 p-0 text-sm font-mono leading-6 text-slate-800 dark:text-zinc-100 bg-transparent focus:ring-0 focus:outline-none h-full overflow-y-auto"
            @input="handleTextareaInput"
            @focus="handleTextareaFocus"
            @blur="handleTextareaBlur"
            @scroll="handleScroll"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure font sizes and scrollbars behave nicely */
textarea {
  outline: none;
  border: none;
}
textarea::placeholder {
  color: #94a3b8;
}
.dark textarea::placeholder {
  color: #52525b;
}

/* Scrollbar styling */
textarea::-webkit-scrollbar,
div::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
textarea::-webkit-scrollbar-track,
div::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb,
div::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.dark textarea::-webkit-scrollbar-thumb,
.dark div::-webkit-scrollbar-thumb {
  background: #3f3f46;
}

/* Deep Milkdown overrides to take full width */
.editor-container :deep(.milkdown) {
  max-width: 100%;
}
</style>

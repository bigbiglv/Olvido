<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

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

const activeTab = ref<'edit' | 'preview'>('edit')
const lineNumbersRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

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

// Lightweight markdown-to-HTML parser
const renderedHtml = computed(() => {
  const md = props.modelValue
  if (!md) return '<p class="text-slate-400 dark:text-zinc-500 italic">在此输入 Markdown 内容开始预览...</p>'

  // Escape HTML tags to prevent XSS
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks: ```lang ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    return `<pre class="bg-slate-50 dark:bg-zinc-800/80 p-4 rounded-xl font-mono text-sm overflow-x-auto my-4 border border-slate-100 dark:border-zinc-700/50"><code class="language-${lang}">${code}</code></pre>`
  })

  // Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-600 dark:text-indigo-400 border border-slate-200/50 dark:border-zinc-700/50">$1</code>')

  // Headers: #, ##, ###
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-800 dark:text-zinc-100 mt-5 mb-2">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-extrabold text-slate-900 dark:text-zinc-50 border-b border-slate-100 dark:border-zinc-800/80 pb-1.5 mt-6 mb-3">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 dark:text-zinc-50 mt-8 mb-4">$1</h1>')

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-zinc-50">$1</strong>')
  // Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

  // Parse lines to build lists and handle task lists
  const lines = html.split('\n')
  let inList = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Check Task Lists
    const taskMatchUnchecked = line.match(/^[-*+]\s+\[\s+\]\s+(.*)$/)
    const taskMatchChecked = line.match(/^[-*+]\s+\[x\]\s+(.*)$/)
    const bulletMatch = line.match(/^[-*+]\s+(.*)$/)
    
    if (taskMatchUnchecked) {
      const content = taskMatchUnchecked[1]
      lines[i] = `<li class="list-none flex items-start gap-2 text-slate-700 dark:text-zinc-300 py-0.5"><input type="checkbox" disabled class="size-4 mt-1 rounded border-slate-300 dark:border-zinc-600 text-indigo-600"><span>${content}</span></li>`
      if (!inList) {
        lines[i] = '<ul class="space-y-1 my-3 pl-1">\n' + lines[i]
        inList = true
      }
    } else if (taskMatchChecked) {
      const content = taskMatchChecked[1]
      lines[i] = `<li class="list-none flex items-start gap-2 text-slate-400 dark:text-zinc-500 line-through py-0.5"><input type="checkbox" disabled checked class="size-4 mt-1 rounded border-slate-300 dark:border-zinc-600 text-indigo-600"><span>${content}</span></li>`
      if (!inList) {
        lines[i] = '<ul class="space-y-1 my-3 pl-1">\n' + lines[i]
        inList = true
      }
    } else if (bulletMatch) {
      const content = bulletMatch[1]
      lines[i] = `<li class="text-slate-700 dark:text-zinc-300 py-0.5">${content}</li>`
      if (!inList) {
        lines[i] = '<ul class="list-disc pl-6 space-y-1 my-3">\n' + lines[i]
        inList = true
      }
    } else {
      if (inList) {
        lines[i] = '</ul>\n' + lines[i]
        inList = false
      }
    }
  }
  
  if (inList) {
    lines.push('</ul>')
  }

  // Handle double newlines for paragraphs
  html = lines.join('\n')
  const segments = html.split(/\n{2,}/)
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i].trim()
    if (s && !s.startsWith('<h') && !s.startsWith('<ul') && !s.startsWith('<pre') && !s.startsWith('</ul') && !s.startsWith('<li')) {
      segments[i] = `<p class="leading-7 text-slate-600 dark:text-zinc-300 my-3">${s.replace(/\n/g, '<br>')}</p>`
    }
  }

  return segments.join('\n')
})

onMounted(() => {
  handleScroll()
})
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700/60 shadow-sm overflow-hidden">
    <!-- Header Tabs -->
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700/60 px-6 py-2 bg-slate-50/50 dark:bg-zinc-900/40">
      <div class="flex gap-4">
        <button
          class="relative py-2 text-sm font-semibold transition cursor-pointer"
          :class="activeTab === 'edit' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'"
          @click="activeTab = 'edit'"
        >
          {{ $t('taskly.editTab') }}
          <span v-if="activeTab === 'edit'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
        </button>
        <button
          class="relative py-2 text-sm font-semibold transition cursor-pointer"
          :class="activeTab === 'preview' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'"
          @click="activeTab = 'preview'"
        >
          {{ $t('taskly.previewTab') }}
          <span v-if="activeTab === 'preview'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
        </button>
      </div>
      
      <div class="text-xs text-slate-400 dark:text-zinc-500 font-medium">
        {{ $t('taskly.markdownFormat') }}
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 flex overflow-hidden min-h-[300px]">
      <!-- SPLIT MODE: Edit on left, Preview on right -->
      <template v-if="activeTab === 'edit'">
        <div class="grid grid-cols-2 divide-x divide-slate-200 dark:divide-zinc-700/60 w-full h-full">
          <!-- Raw Editor Column -->
          <div class="flex p-6 h-full overflow-hidden bg-white dark:bg-zinc-800">
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
              placeholder="在此输入 Markdown 文档..."
              class="flex-1 resize-none border-0 p-0 text-sm font-mono leading-6 text-slate-800 dark:text-zinc-100 bg-transparent focus:ring-0 focus:outline-none h-full overflow-y-auto"
              @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
              @scroll="handleScroll"
            ></textarea>
          </div>

          <!-- HTML Preview Column -->
          <div class="p-6 overflow-y-auto bg-slate-50/30 dark:bg-zinc-900/10 h-full">
            <!-- eslint-disable vue/no-v-html -->
            <div class="markdown-body prose dark:prose-invert max-w-none text-slate-800 dark:text-zinc-100 font-sans" v-html="renderedHtml"></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>
      </template>

      <!-- PREVIEW MODE: Full-width Preview -->
      <template v-else>
        <div class="w-full h-full overflow-y-auto bg-white dark:bg-zinc-800 p-8 flex justify-center">
          <div class="max-w-3xl w-full">
            <!-- eslint-disable vue/no-v-html -->
            <div class="markdown-body prose dark:prose-invert max-w-none text-slate-800 dark:text-zinc-100 font-sans" v-html="renderedHtml"></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>
      </template>
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
</style>

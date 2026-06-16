<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/components/dialog/hooks/useDialog'
import Editor from '@/components/Editor/index.vue'

const dialog = useDialog<string[]>()
const markdownContent = ref('1. ')

function parseTitlesFromMarkdown(markdown: string): string[] {
  const lines = markdown.split('\n')
  const titles: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Ignore line if it only contains a list prefix (e.g., "1.", "2)", "-", "*")
    if (/^\d+[.)]$/.test(trimmed) || /^[-*+]$/.test(trimmed)) {
      continue
    }

    // Match ordered list: "1. Title", "2) Title"
    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/)
    if (orderedMatch) {
      titles.push(orderedMatch[1].trim())
      continue
    }

    // Match bulleted list: "- Title", "* Title", "+ Title"
    const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/)
    if (bulletMatch) {
      titles.push(bulletMatch[1].trim())
      continue
    }

    // Treat non-empty lines as titles if not formatted as lists
    if (!trimmed.startsWith('#') && !trimmed.startsWith('>') && !trimmed.startsWith('`')) {
      titles.push(trimmed)
    }
  }

  return titles.filter(Boolean)
}

dialog.onConfirm(() => {
  const content = markdownContent.value.trim()
  if (!content || content === '1.') return false
  const titles = parseTitlesFromMarkdown(content)
  if (titles.length === 0) return false
  return titles
})
</script>

<template>
  <div class="flex flex-col h-full -mx-6 -my-4 p-4 space-y-4 bg-slate-50/30 dark:bg-zinc-900/10">
    <div class="text-xs text-slate-400 dark:text-zinc-500 font-medium">
      请输入有序列表（以 1. 2. 格式开始），每一行列表项的内容都将作为一个独立的日常文档生成。
    </div>
    <div
      class="flex-1 overflow-hidden border border-slate-200 dark:border-zinc-700/60 rounded-xl bg-white dark:bg-zinc-800"
    >
      <Editor v-model="markdownContent" only-ordered-list />
    </div>
  </div>
</template>

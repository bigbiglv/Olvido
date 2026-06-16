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
    // 预处理行：替换常见的 HTML 实体和标签（&nbsp;, &#x20;, <br />, <br> 等），并统一 Unicode 空格后 trim
    const processedLine = line
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x20;/g, ' ')
      .replace(/<br\s*\/?>/gi, '')
      .replace(/[\s\u00A0]+/g, ' ')
      .trim()

    if (!processedLine) continue

    // 忽略仅有列表前缀的行
    if (/^\d+[.)]$/.test(processedLine) || /^[-*+]$/.test(processedLine)) {
      continue
    }

    // 匹配有序列表
    const orderedMatch = processedLine.match(/^\d+[.)]\s+(.+)$/)
    if (orderedMatch) {
      const title = orderedMatch[1].trim()
      if (title) titles.push(title)
      continue
    }

    // 匹配无序列表
    const bulletMatch = processedLine.match(/^[-*+]\s+(.+)$/)
    if (bulletMatch) {
      const title = bulletMatch[1].trim()
      if (title) titles.push(title)
      continue
    }

    // 非列表格式的非空行
    if (!processedLine.startsWith('#') && !processedLine.startsWith('>') && !processedLine.startsWith('`')) {
      titles.push(processedLine)
    }
  }

  return titles
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

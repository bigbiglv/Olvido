<script setup lang="ts">
import { ref } from 'vue'
import { useDialog, type DialogOptions } from '@/components/dialog'
import Editor from '@/components/Editor/index.vue'

defineOptions({
  dialogOptions: {
    title: '快速批量新增日常文档',
    width: 550,
    height: 420,
  } as DialogOptions,
})

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
    if (
      !processedLine.startsWith('#') &&
      !processedLine.startsWith('>') &&
      !processedLine.startsWith('`')
    ) {
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
  <div class="p-4">
    <Editor v-model="markdownContent" only-ordered-list auto-focus />
  </div>
</template>

<style scoped>
:deep(.milkdown .ProseMirror) {
  padding: 12px !important;
}
:deep(.milkdown-block-handle) {
  display: none !important;
}
</style>

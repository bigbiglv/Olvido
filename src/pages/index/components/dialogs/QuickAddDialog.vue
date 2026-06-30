<script setup lang="ts">
import { ref } from 'vue'
import { useDialog, type DialogOptions } from '@/components/dialog'
import Editor from '@/components/Editor/index.vue'

defineOptions({
  dialogOptions: {
    title: '新增日常文档',
    width: 550,
    height: 420,
  } as DialogOptions,
})

const dialog = useDialog<QuickAddDocument[]>()
const markdownContent = ref('1. ')

export interface QuickAddDocument {
  title: string
  content: string
}

function parseDocumentsFromMarkdown(markdown: string): QuickAddDocument[] {
  const lines = markdown.split('\n')
  const docs: (QuickAddDocument & { baseIndent: number })[] = []
  let currentDoc: (QuickAddDocument & { baseIndent: number }) | null = null

  for (const line of lines) {
    // Clean HTML entities sometimes produced by Milkdown
    const cleanLine = line
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x20;/g, ' ')
      .replace(/<br\s*\/?>/gi, '')
    
    const leadingSpaces = cleanLine.match(/^ */)?.[0].length || 0
    const processedLine = cleanLine.replace(/[\s\u00A0]+/g, ' ').trim()

    if (!processedLine) continue

    // Ignore empty list items (e.g. just "1." or "-")
    if (/^\d+[.)]$/.test(processedLine) || /^[-*+]$/.test(processedLine)) {
      continue
    }

    // First-level items usually have 0-1 spaces. Nested items have >= 2.
    if (leadingSpaces < 2) {
      let title = processedLine
      const orderedMatch = processedLine.match(/^\d+[.)]\s+(.+)$/)
      const bulletMatch = processedLine.match(/^[-*+]\s+(.+)$/)
      
      if (orderedMatch) {
        title = orderedMatch[1].trim()
      } else if (bulletMatch) {
        title = bulletMatch[1].trim()
      } else if (title.startsWith('#') || title.startsWith('>') || title.startsWith('`')) {
        continue // Ignore non-list formatting lines at top level
      }

      currentDoc = { title, content: '', baseIndent: -1 }
      docs.push(currentDoc)
    } else {
      // Nested content
      if (currentDoc) {
        if (currentDoc.baseIndent === -1) {
          currentDoc.baseIndent = leadingSpaces
        }
        // Preserve relative nesting by removing the base indentation
        const spacesToRemove = Math.min(leadingSpaces, currentDoc.baseIndent)
        const unindentedLine = cleanLine.slice(spacesToRemove)
        
        if (currentDoc.content) {
          currentDoc.content += '\n' + unindentedLine
        } else {
          currentDoc.content = unindentedLine
        }
      }
    }
  }

  return docs.map(d => ({ title: d.title, content: d.content }))
}

dialog.onConfirm(() => {
  const content = markdownContent.value.trim()
  if (!content || content === '1.') return false
  const docs = parseDocumentsFromMarkdown(content)
  if (docs.length === 0) return false
  return docs
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

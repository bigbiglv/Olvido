<script setup lang="ts">
import { computed } from 'vue'
import { FileText } from 'lucide-vue-next'
import { useSearchStore } from '../stores/search.store'
import type { SearchItem } from '../types/search'

const props = defineProps<{
  item: SearchItem
  isActive: boolean
}>()

const store = useSearchStore()

// 判断当前是否是全局搜索模式以决定是否显示项目名称
const showProjectName = computed(() => {
  return store.projectId === undefined
})

// 时间格式化：输出类似 "2 小时前"、"昨天"、"3 天前" 等相对时间
const relativeTime = computed(() => {
  if (!props.item.createdAt) return ''
  const date = new Date(props.item.createdAt)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const oneHour = 60 * 60 * 1000
  const oneDay = 24 * oneHour
  const oneWeek = 7 * oneDay

  if (diff < 0) {
    return '刚刚'
  }
  if (diff < oneHour) {
    const mins = Math.max(1, Math.floor(diff / (60 * 1000)))
    return `${mins} 分钟前`
  } else if (diff < oneDay) {
    const hours = Math.floor(diff / oneHour)
    return `${hours} 小时前`
  } else if (diff < oneDay * 2) {
    return '昨天'
  } else if (diff < oneWeek) {
    const days = Math.floor(diff / oneDay)
    return `${days} 天前`
  } else {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  }
})

// 文本拆分高亮逻辑：将文本按匹配项分块，避开 v-html 的 XSS 风险
interface TextPart {
  text: string
  isMatch: boolean
}

function splitHighlightText(text: string, keyword: string): TextPart[] {
  if (!keyword || !text) {
    return [{ text, isMatch: false }]
  }

  // 将关键词按空格拆分成多个子词
  const terms = keyword.trim().split(/\s+/).filter(Boolean)
  if (terms.length === 0) {
    return [{ text, isMatch: false }]
  }

  // 对子词进行正则特殊字符转义
  const escapedTerms = terms.map((term) => term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
  const pattern = `(${escapedTerms.join('|')})`
  const regex = new RegExp(pattern, 'gi')

  const parts: TextPart[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const offset = match.index
    const matchedText = match[0]

    // 防御空匹配导致的死循环
    if (matchedText.length === 0) {
      regex.lastIndex++
      continue
    }

    if (offset > lastIndex) {
      parts.push({ text: text.substring(lastIndex, offset), isMatch: false })
    }
    parts.push({ text: matchedText, isMatch: true })
    lastIndex = offset + matchedText.length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), isMatch: false })
  }

  return parts
}
</script>

<template>
  <div
    :class="[
      'flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none',
      isActive
        ? 'bg-slate-50 dark:bg-zinc-800/60 border-indigo-200 dark:border-zinc-700/80 shadow-sm ring-1 ring-indigo-500/20'
        : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 hover:border-slate-200 dark:hover:border-zinc-800',
    ]"
    :data-search-item-active="isActive ? 'true' : 'false'"
  >
    <!-- Left Icon -->
    <div
      :class="[
        'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
          : 'bg-slate-50 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500',
      ]"
    >
      <FileText class="size-4.5" />
    </div>

    <!-- Center details -->
    <div class="flex-1 min-w-0 space-y-1.5">
      <div class="flex items-center justify-between gap-4">
        <!-- Title with highlights -->
        <h4 class="text-sm font-semibold truncate text-slate-800 dark:text-zinc-200">
          <template v-for="(part, idx) in splitHighlightText(item.title, store.keyword)" :key="idx">
            <mark
              v-if="part.isMatch"
              class="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold rounded px-0.5"
            >
              {{ part.text }}
            </mark>
            <span v-else>{{ part.text }}</span>
          </template>
        </h4>

        <!-- Relative Time metadata -->
        <span class="text-xs text-slate-400 dark:text-zinc-500 whitespace-nowrap">
          {{ relativeTime }}
        </span>
      </div>

      <!-- Snippet and Project metadata -->
      <div class="flex items-center justify-between gap-4 text-xs">
        <!-- Snippet if matched in content -->
        <div class="flex-1 min-w-0 text-slate-500 dark:text-zinc-400 leading-relaxed truncate">
          <template v-if="item.matchType === 'content' && item.snippet">
            <template
              v-for="(part, idx) in splitHighlightText(item.snippet, store.keyword)"
              :key="idx"
            >
              <mark
                v-if="part.isMatch"
                class="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold rounded px-0.5"
              >
                {{ part.text }}
              </mark>
              <span v-else>{{ part.text }}</span>
            </template>
          </template>
          <template v-else>
            <span class="text-slate-400 dark:text-zinc-500 italic">匹配标题</span>
          </template>
        </div>

        <!-- Project Tag (Only shown in global search) -->
        <span
          v-if="showProjectName"
          class="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-medium max-w-[120px] truncate whitespace-nowrap"
          :title="item.projectName"
        >
          {{ item.projectName }}
        </span>
      </div>
    </div>
  </div>
</template>

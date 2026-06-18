<script setup lang="ts">
import { FilePlus, CheckSquare } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { apiCreate } from '@/apis/note'
import { mapNoteToDocument } from '@/apis/note-mapper'
import { isElectron } from '@/utils/env'

const appStore = useAppStore()

async function handleCreate() {
  const targetCategory = appStore.currentCategory === '已完成' ? '日常' : appStore.currentCategory
  const newDoc = {
    title: '新文档',
    content: '# 新文档\n\n在此开始编写内容...',
    category: targetCategory,
    project: appStore.currentProject,
    completed: false,
  }

  if (isElectron) {
    try {
      const deadline = newDoc.category === '需求' ? new Date() : null
      const created = await apiCreate({
        projectId: appStore.currentProject || 'global',
        title: newDoc.title,
        content: newDoc.content,
        deadline,
        isArchived: false,
      })
      const saved = mapNoteToDocument(created)
      // 选中创建的文档
      await appStore.selectDocument(saved.id)
      // 更新 lastSavedTime 触发 DocumentList 刷新
      appStore.lastSavedTime = new Date().toLocaleTimeString()
    } catch (err) {
      console.error('Failed to create document:', err)
    }
  } else {
    const mockId = Math.random().toString(36).substring(2, 11)
    await appStore.selectDocument(mockId)
    appStore.lastSavedTime = new Date().toLocaleTimeString()
  }
}
</script>

<template>
  <div
    class="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-900/40 p-8 select-none"
  >
    <div class="flex flex-col items-center max-w-sm text-center">
      <div
        class="size-16 rounded-2xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-6 shadow-sm border border-slate-100 dark:border-zinc-700/50"
      >
        <CheckSquare class="size-8" />
      </div>
      <h2 class="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">欢迎使用</h2>
      <p class="text-sm text-slate-400 dark:text-zinc-500 leading-relaxed mb-6">
        选择或创建一个文档开始记录。
      </p>
      <button
        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition cursor-pointer"
        @click="handleCreate"
      >
        <FilePlus class="size-4.5" />
        <span>创建您的第一个文档</span>
      </button>
    </div>
  </div>
</template>

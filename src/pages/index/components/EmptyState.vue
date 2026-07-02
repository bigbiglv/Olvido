<script setup lang="ts">
import { FilePlus } from 'lucide-vue-next'
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
    class="flex-1 flex flex-col items-center justify-center bg-background p-8 select-none"
  >
    <div class="flex flex-col items-center max-w-sm text-center">
      <div
        class="size-16 rounded-2xl bg-primary/10 dark:bg-card flex items-center justify-center mb-6 shadow-sm border border-border"
      >
        <img src="/logo.png" alt="Logo" class="size-10 object-contain" />
      </div>
      <h2 class="text-xl font-bold text-foreground mb-2">欢迎使用</h2>
      <p class="text-sm text-muted-foreground leading-relaxed mb-6">
        选择或创建一个文档开始记录。
      </p>
      <button
        class="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary text-primary-foreground font-semibold rounded-xl shadow-md shadow-primary/20 dark:shadow-none transition cursor-pointer"
        @click="handleCreate"
      >
        <FilePlus class="size-4.5" />
        <span>创建您的第一个文档</span>
      </button>
    </div>
  </div>
</template>

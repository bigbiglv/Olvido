<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { Dialog } from '@/components/dialog'
import SettingsPage from './SettingsPage.vue'
import { apiListProjects, apiCreateProject } from '@/apis/project'
import type { ProjectDto } from '../../../../electron/types/project'
import { isElectron } from '@/utils/env'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Folder,
  Plus,
  Settings,
  CheckSquare,
} from 'lucide-vue-next'

const store = useDocumentsStore()

/** 本地项目列表数据 */
const projects = ref<ProjectDto[]>([])

/** 是否显示行内新建项目输入框 */
const showAddProject = ref(false)
/** 行内新建项目的名称输入值 */
const newProjectName = ref('')
/** 是否处于创建项目的请求过程中（防重锁） */
const isAdding = ref(false)
/** 新建项目请求的超时定时器句柄 */
let addTimeout: number | undefined


// 挂载时加载项目列表
onMounted(async () => {
  await fetchProjects()
})

/**
 * 从 SQLite 数据库中获取项目列表
 */
async function fetchProjects() {
  if (isElectron) {
    try {
      const list = await apiListProjects()
      // 过滤掉数据库内置的 global 笔记本项目，避免与顶部的“笔记本”选项重复
      projects.value = list.filter((p) => p.id !== 'global')
    } catch (error) {
      console.error('Failed to fetch projects from database:', error)
    } finally {
      // 满足异步 try-catch-finally 块规范
    }
  }
}

/**
 * 切换选中的项目
 * @param projectId 项目唯一标识（null 表示全局记事本）
 */
function handleSelectProject(projectId: string | null) {
  store.selectProject(projectId)
}

/**
 * 提交并新建项目
 */
async function handleAddProject() {
  const name = newProjectName.value.trim()
  if (!name || isAdding.value) return

  isAdding.value = true

  // 5秒超时防御，自动释放锁定状态防止 UI 卡死
  addTimeout = window.setTimeout(() => {
    if (isAdding.value) {
      isAdding.value = false
      console.warn('Add project timeout, lock released')
    }
  }, 5000)

  if (isElectron) {
    try {
      const newId = crypto.randomUUID()
      const newProj = await apiCreateProject({ id: newId, name })
      projects.value.push(newProj)
      newProjectName.value = ''
      showAddProject.value = false
      store.selectProject(newProj.id)
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      isAdding.value = false
      if (addTimeout) {
        clearTimeout(addTimeout)
        addTimeout = undefined
      }
    }
  } else {
    try {
      // 网页预览模式下的 Mock 回退机制
      const newId = Math.random().toString(36).substr(2, 9)
      const newProj = { id: newId, name }
      projects.value.push(newProj)
      newProjectName.value = ''
      showAddProject.value = false
      store.selectProject(newId)
    } finally {
      isAdding.value = false
      if (addTimeout) {
        clearTimeout(addTimeout)
        addTimeout = undefined
      }
    }
  }
}

/**
 * 打开系统设置对话框
 */
function handleOpenSettings() {
  Dialog.show(SettingsPage, {}, {
    title: '系统设置',
    footer: false,
    width: 680,
    height: 520,
  })
}
</script>

<template>
  <aside
    class="w-64 border-r border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 flex flex-col h-full select-none"
  >
    <!-- Brand Logo -->
    <div
      class="h-16 flex items-center px-6 gap-2 border-b border-slate-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-transparent"
    >
      <div
        class="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200/50 dark:shadow-none"
      >
        <CheckSquare class="size-5" />
      </div>
      <span class="text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">Olvido</span>
    </div>

    <!-- Sidebar Navigation -->
    <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-7">
      <!-- 全局 Group -->
      <div class="space-y-2">
        <div
          class="px-3 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider"
        >
          全局
        </div>
        <Button
          variant="ghost"
          class="w-full justify-start gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all text-left border-0"
          :class="
            store.currentProject === null
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
          "
          @click="handleSelectProject(null)"
        >
          <BookOpen class="size-4.5" />
          <span>笔记本</span>
        </Button>
      </div>

      <!-- 项目 Group -->
      <div class="space-y-2">
        <div class="flex items-center justify-between px-3">
          <span
            class="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider"
          >
            项目
          </span>
          <Button
            variant="ghost"
            size="icon"
            class="size-6 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition bg-transparent"
            title="新建项目"
            @click="showAddProject = !showAddProject"
          >
            <Plus class="size-4.5" />
          </Button>
        </div>

        <!-- Inline Add Project Form -->
        <div v-if="showAddProject" class="px-3 py-1 space-y-2">
          <Input
            ref="newProjectInput"
            v-model="newProjectName"
            type="text"
            placeholder="项目名称"
            class="h-8 text-xs bg-white dark:bg-zinc-800 focus-visible:ring-indigo-500 border-indigo-200 dark:border-zinc-700"
            autofocus
            @keyup.enter="handleAddProject"
            @blur="handleAddProject"
          />
        </div>

        <!-- Project List -->
        <div class="space-y-1">
          <Button
            v-for="proj in projects"
            :key="proj.id"
            variant="ghost"
            class="w-full justify-start gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all text-left border-0"
            :class="
              store.currentProject === proj.id
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
            "
            @click="handleSelectProject(proj.id)"
          >
            <Folder class="size-4.5 opacity-70" />
            <span class="truncate">{{ proj.name }}</span>
          </Button>
        </div>
      </div>
    </nav>

    <!-- Bottom Settings Link -->
    <div
      class="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 bg-white/10 dark:bg-transparent"
    >
      <Button
        variant="ghost"
        class="w-full justify-start gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all text-left text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 border-0 bg-transparent"
        @click="handleOpenSettings"
      >
        <Settings class="size-4.5" />
        <span>设置</span>
      </Button>
    </div>
  </aside>
</template>

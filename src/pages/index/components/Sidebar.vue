<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import {
  BookOpen,
  Folder,
  Plus,
  Settings,
  CheckSquare,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useDocumentsStore()

// State for project addition inline
const showAddProject = ref(false)
const newProjectName = ref('')

// Handle adding project
function handleAddProject() {
  const name = newProjectName.value.trim()
  if (name) {
    store.addProject(name)
    newProjectName.value = ''
    showAddProject.value = false
    // Navigate to new project
    router.push(`/project/${name}`)
  }
}
</script>

<template>
  <aside class="w-64 border-r border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 flex flex-col h-full select-none">
    <!-- Brand Logo -->
    <div class="h-16 flex items-center px-6 gap-2 border-b border-slate-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-transparent">
      <div class="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200/50 dark:shadow-none">
        <CheckSquare class="size-5" />
      </div>
      <span class="text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">Olvido</span>
    </div>

    <!-- Sidebar Navigation -->
    <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-7">
      <!-- 全局 Group -->
      <div class="space-y-2">
        <div class="px-3 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          全局
        </div>
        <RouterLink
          to="/notebook"
          class="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
          :class="
            route.name === 'notebook' || route.name === 'notebook-detail'
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-700/50'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
          "
        >
          <BookOpen class="size-4.5" />
          <span>笔记本</span>
        </RouterLink>
      </div>

      <!-- 项目 Group -->
      <div class="space-y-2">
        <div class="flex items-center justify-between px-3">
          <span class="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            项目
          </span>
          <button
            class="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
            title="新建项目"
            @click="showAddProject = !showAddProject"
          >
            <Plus class="size-4.5" />
          </button>
        </div>

        <!-- Inline Add Project Form -->
        <div v-if="showAddProject" class="px-3 py-1 space-y-2">
          <input
            ref="newProjectInput"
            v-model="newProjectName"
            type="text"
            placeholder="项目名称"
            class="w-full text-xs px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
            autofocus
            @keyup.enter="handleAddProject"
            @blur="handleAddProject"
          />
        </div>

        <!-- Project List -->
        <div class="space-y-1">
          <RouterLink
            v-for="proj in store.projects"
            :key="proj"
            :to="`/project/${proj}`"
            class="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
            :class="
              (route.name === 'project' || route.name === 'project-detail') && route.params.projectName === proj
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-700/50'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
            "
          >
            <Folder class="size-4.5 opacity-70" />
            <span class="truncate">{{ proj }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Bottom Settings Link -->
    <div class="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 bg-white/10 dark:bg-transparent">
      <RouterLink
        to="/settings"
        class="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
        :class="
          route.name === 'settings'
            ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-700/50'
            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
        "
      >
        <Settings class="size-4.5" />
        <span>设置</span>
      </RouterLink>
    </div>
  </aside>
</template>

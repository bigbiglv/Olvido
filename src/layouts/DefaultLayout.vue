<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'
import {
  BookOpen,
  Folder,
  Plus,
  Settings,
  Search,
  CheckSquare,
  Sparkles,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useDocumentsStore()

// State for project addition inline
const showAddProject = ref(false)
const newProjectName = ref('')

// Initialize documents
store.loadDocuments()

// Watch route to sync store filters
watch(
  () => route.params,
  (params) => {
    // Sync project filter
    if (route.name === 'project' || route.name === 'project-detail') {
      store.currentProject = params.projectName as string
    } else if (route.name === 'notebook' || route.name === 'notebook-detail') {
      store.currentProject = null
    }

    // Sync selected document
    if (params.docId) {
      store.selectedDocumentId = params.docId as string
    }
  },
  { immediate: true }
)

// Handle creating new document from header
async function handleCreateNew() {
  await store.createDocument()
  if (store.selectedDocumentId) {
    if (store.currentProject) {
      router.push(`/project/${store.currentProject}/${store.selectedDocumentId}`)
    } else {
      router.push(`/notebook/${store.selectedDocumentId}`)
    }
  }
}

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
  <div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
    <!-- Left Sidebar -->
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

    <!-- Right Container -->
    <div class="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 h-full">
      <!-- Top Header -->
      <header class="h-16 border-b border-slate-200 dark:border-zinc-800 flex items-center px-8 justify-between select-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10 shrink-0">
        <!-- Search Bar Area -->
        <div class="flex items-center gap-3 flex-1 max-w-lg">
          <template v-if="route.name !== 'settings'">
            <div class="relative w-full">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-zinc-500" />
              <input
                v-model="store.searchQuery"
                type="text"
                placeholder="搜索任务标题或内容"
                class="w-full pl-9 pr-10 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-800/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 transition"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 select-none">
                Ctrl+K
              </span>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-sm font-semibold">
              <Sparkles class="size-4.5 text-violet-500" />
              <span>设置控制台</span>
            </div>
          </template>
        </div>

        <!-- Action / Slogan Area -->
        <div class="flex items-center gap-4">
          <button
            v-if="route.name !== 'settings'"
            class="flex items-center gap-1.5 px-4 py-1.8 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none transition cursor-pointer"
            @click="handleCreateNew"
          >
            <Plus class="size-4" />
            <span>新建</span>
          </button>
        </div>
      </header>

      <!-- Sub Page Content RouterView -->
      <main class="flex-1 overflow-hidden min-h-0 bg-slate-50/30 dark:bg-zinc-900/10">
        <RouterView />
      </main>
    </div>
  </div>
</template>

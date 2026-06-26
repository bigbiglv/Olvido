<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, BookOpen } from 'lucide-vue-next'
import DraggableList from '@/components/ui/draggableList/DraggableList.vue'
import ProjectItem from './ProjectItem.vue'
import { useProjectList } from '../../composables/useProjectList'

const appStore = useAppStore()
const {
  projects,
  showAddProject,
  newProjectName,
  listSelectedIds,
  handleAddProject,
  handleSelectProject,
  handleProjectSelectionChange,
  handleReorderProjects,
  handleContextMenu,
  handleGlobalClick,
  handleGlobalDblClick
} = useProjectList()

</script>

<template>
  <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-7" @click.self="listSelectedIds = []">
    <!-- 全局 Group -->
    <div class="space-y-2" @click.self="listSelectedIds = []">
      <div
        class="px-3 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider"
      >
        全局
      </div>
      <Button
        variant="ghost"
        class="w-full justify-start gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all text-left border-0"
        :class="[
          appStore.currentProject === null
            ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-zinc-700/50'
            : '',
          listSelectedIds.includes('global') && appStore.currentProject !== null
            ? 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
            : '',
          appStore.currentProject !== null && !listSelectedIds.includes('global')
            ? 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100'
            : ''
        ]"
        @click="handleGlobalClick"
        @dblclick="handleGlobalDblClick"
      >
        <BookOpen class="size-4.5" />
        <span>笔记本</span>
      </Button>
    </div>

    <!-- 项目 Group -->
    <div class="space-y-2" @click.self="listSelectedIds = []">
      <div class="flex items-center justify-between px-3" @click.self="listSelectedIds = []">
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
      <DraggableList
        class="space-y-1"
        :items="projects"
        item-key="id"
        :selected-ids="listSelectedIds"
        :opened-id="appStore.currentProject || ''"
        @selection-change="handleProjectSelectionChange"
        @open="(proj: any) => handleSelectProject(proj.id)"
        @reorder="handleReorderProjects"
        @context-menu="(proj: any, event: MouseEvent) => handleContextMenu(event, proj)"
      >
        <template #item="{ item: proj, selected, opened }">
          <ProjectItem :project="proj" :selected="selected" :opened="opened" />
        </template>
      </DraggableList>
    </div>
  </nav>
</template>

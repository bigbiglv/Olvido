<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, BookOpen, Folder } from 'lucide-vue-next'
import DraggableList from '@/components/ui/draggableList/DraggableList.vue'
import ProjectItem from './ProjectItem.vue'
import ActiveItemBackground from './ActiveItemBackground.vue'
import { useProjectList } from '../../composables/useProjectList'

const appStore = useAppStore()
const {
  projects,
  showAddProject,
  newProjectName,
  listSelectedIds,
  renamingProjectId,
  handleAddProject,
  cancelAddProject,
  handleSelectProject,
  handleProjectSelectionChange,
  handleReorderProjects,
  handleContextMenu,
  handleBackgroundContextMenu,
  handleGlobalClick,
  handleGlobalDblClick,
  submitRenameProject,
  cancelRenameProject
} = useProjectList()

const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}
</script>

<template>
  <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-7" data-context-region="project-background" @click.self="listSelectedIds = []" @contextmenu.self.prevent="handleBackgroundContextMenu">
    <!-- 全局 Group -->
    <div class="space-y-2" @click.self="listSelectedIds = []">
      <div
        class="px-3 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider"
      >
        全局
      </div>
      <Button
        variant="ghost"
        class="relative w-full h-auto justify-start gap-3 px-3 py-2.5 text-sm font-semibold transition-all text-left border-0 group overflow-hidden"
        :class="[
          appStore.currentProject === null
            ? 'text-indigo-600 dark:text-indigo-400'
            : '',
          listSelectedIds.includes('global') && appStore.currentProject !== null
            ? 'text-indigo-600 dark:text-indigo-400'
            : '',
          appStore.currentProject !== null && !listSelectedIds.includes('global')
            ? 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 rounded-xl'
            : ''
        ]"
        @click="handleGlobalClick"
        @dblclick="handleGlobalDblClick"
      >
        <!-- 设计感动态背景 -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <ActiveItemBackground v-if="appStore.currentProject === null || listSelectedIds.includes('global')" />
        </transition>

        <BookOpen class="size-4.5 relative z-10" />
        <span class="relative z-10">笔记本</span>
      </Button>
    </div>

    <!-- 项目 Group -->
    <div class="space-y-2 flex-1" @click.self="listSelectedIds = []" @contextmenu.self.prevent="handleBackgroundContextMenu">
      <div class="flex items-center justify-between px-3" @click.self="listSelectedIds = []" @contextmenu.self.prevent="handleBackgroundContextMenu">
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
      <div v-if="showAddProject" class="px-0 py-1">
        <div
          class="relative h-auto flex items-center w-full justify-start gap-3 px-3 py-2.5 text-sm font-semibold transition-all text-left overflow-hidden text-indigo-600 dark:text-indigo-400"
        >
          <!-- 设计感动态背景 -->
          <ActiveItemBackground />
          <Folder class="size-4.5 opacity-70 shrink-0 relative z-10" />
          <input
            ref="addProjectInput"
            v-model="newProjectName"
            type="text"
            placeholder="项目名称"
            class="relative z-10 w-full bg-transparent border-0 p-0 h-5 text-sm font-semibold focus:outline-none focus:ring-0 text-indigo-600 dark:text-indigo-400 placeholder:text-indigo-400/70 dark:placeholder:text-indigo-500"
            v-focus
            @keyup.enter="handleAddProject"
            @keydown.esc="cancelAddProject"
            @blur="handleAddProject"
          />
        </div>
      </div>

      <!-- Project List -->
      <DraggableList
        class="space-y-1"
        :items="projects"
        item-key="id"
        group="projects"
        :selected-ids="listSelectedIds"
        :opened-id="appStore.currentProject || ''"
        @selection-change="handleProjectSelectionChange"
        @open="(proj: any) => handleSelectProject(proj.id)"
        @reorder="handleReorderProjects"
        @context-menu="(proj: any, event: MouseEvent) => handleContextMenu(event, proj)"
        @background-context-menu="handleBackgroundContextMenu"
      >
        <template #item="{ item: proj, selected, opened }">
          <ProjectItem 
            :project="proj" 
            :selected="selected" 
            :opened="opened" 
            :is-renaming="renamingProjectId === proj.id"
            @submit-rename="(newName) => submitRenameProject(proj.id, newName)"
            @cancel-rename="cancelRenameProject"
          />
        </template>
      </DraggableList>
    </div>
  </nav>
</template>



<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import MorphIcon from '@/components/ui/morph-icon/MorphIcon.vue'
import ActiveItemBackground from './ActiveItemBackground.vue'
import type { ProjectDto } from '../../../../../electron/types/project'

const props = defineProps<{
  project: ProjectDto
  selected?: boolean
  opened?: boolean
  isRenaming?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit-rename', newName: string): void
  (e: 'cancel-rename'): void
}>()

const editName = ref('')

watch(() => props.isRenaming, (val) => {
  if (val) {
    editName.value = props.project.name
  }
})

let isCanceling = false

function handleSubmitRename() {
  if (props.isRenaming && !isCanceling) {
    emit('submit-rename', editName.value)
  }
  isCanceling = false
}

function handleCancelRename() {
  if (props.isRenaming) {
    isCanceling = true
    emit('cancel-rename')
  }
}

const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}

const iconPaths = [
  'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z', // Folder
  'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.5 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2'  // FolderOpen
]

const activeIndex = computed(() => (props.opened ? 1 : 0))
</script>

<template>
  <Button
    data-context-region="project"
    variant="ghost"
    class="relative w-full h-auto justify-start gap-3 px-3 py-2.5 text-sm font-semibold transition-all text-left border-0 group overflow-hidden"
    :class="[
      opened
        ? 'text-indigo-600 dark:text-indigo-400'
        : '',
      selected && !opened
        ? 'text-indigo-600 dark:text-indigo-400'
        : '',
      !opened && !selected
        ? 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 rounded-xl'
        : ''
    ]"
  >
    <!-- 不规则动态背景 -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <ActiveItemBackground v-if="opened || selected" />
    </transition>
    <div class="relative size-4.5 shrink-0 opacity-70 flex items-center justify-center z-10">
      <MorphIcon 
        :paths="iconPaths" 
        :active-index="activeIndex" 
        morph-type="rotational"
        :duration="0.35"
        ease="back.out(1.2)"
      />
    </div>
    <span v-if="!isRenaming" class="truncate relative z-10">{{ project.name }}</span>
    <input
      v-else
      v-model="editName"
      v-focus
      type="text"
      class="relative z-10 w-full bg-transparent border-0 p-0 h-5 text-sm font-semibold focus:outline-none focus:ring-0 text-indigo-600 dark:text-indigo-400"
      @click.stop
      @keyup.enter="handleSubmitRename"
      @keydown.esc="handleCancelRename"
      @blur="handleSubmitRename"
    />
  </Button>
</template>



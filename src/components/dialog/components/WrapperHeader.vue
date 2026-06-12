<script setup lang="ts">
import { computed } from 'vue'
import { Maximize2, Minimize2, X } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '../ui'
import type { DialogInstance } from '../types'
import { renderSlotValue } from '../utils'

const props = defineProps<{
  instance: DialogInstance
  canDrag: boolean
  canFullscreen: boolean
  hasDescription: boolean
}>()

const emit = defineEmits<{
  dragStart: [event: MouseEvent]
  toggleFullscreen: []
  cancel: []
}>()


const headerClass = computed(() => [
  'shrink-0 select-none border-b border-border px-6 py-4',
  props.canDrag ? 'cursor-move' : 'cursor-default',
])

const headerInnerClass = computed(() => [
  'flex min-w-0 justify-between gap-4',
  props.hasDescription ? 'items-start' : 'items-center',
])
</script>

<template>
  <DialogHeader :class="headerClass" @mousedown="emit('dragStart', $event)">
    <div :class="headerInnerClass">
      <div class="min-w-0">
        <DialogTitle>
          <component
            :is="{ render: () => renderSlotValue(instance.slots.title) }"
            v-if="instance.slots.title"
          />
          <template v-else>
            {{ instance.settings.title || '对话框' }}
          </template>
        </DialogTitle>
        <DialogDescription v-if="instance.settings.description" class="mt-1">
          {{ instance.settings.description }}
        </DialogDescription>
        <DialogDescription v-else class="sr-only">
          {{ instance.settings.title || '对话框' }}
        </DialogDescription>
      </div>

      <div class="flex shrink-0 items-center gap-1" @mousedown.stop>
        <component
          :is="{ render: () => renderSlotValue(instance.slots.headerExtra) }"
          v-if="instance.slots.headerExtra"
        />
        <Button
          v-if="canFullscreen"
          variant="ghost"
          size="icon"
          :aria-label="
            instance.isFullscreen ? '还原' : '最大化'
          "
          @click="emit('toggleFullscreen')"
        >
          <Minimize2 v-if="instance.isFullscreen" :size="18" />
          <Maximize2 v-else :size="18" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="关闭"
          @click="emit('cancel')"
        >
          <X :size="24" />
        </Button>
      </div>
    </div>
  </DialogHeader>
</template>

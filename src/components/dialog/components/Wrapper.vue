<script setup lang="ts">
import { computed, nextTick, onMounted, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { Dialog, DialogContent } from '../ui'
import type { DialogInstance } from '../types'
import ResizeHandles from './ResizeHandles.vue'
import WrapperBody from './WrapperBody.vue'
import WrapperFooter from './WrapperFooter.vue'
import WrapperHeader from './WrapperHeader.vue'
import { useDialogController } from '../hooks/useDialogController'
import { useDialogDrag } from '../hooks/useDialogDrag'
import { useDialogLayout } from '../hooks/useDialogLayout'
import { useDialogResize } from '../hooks/useDialogResize'

const props = defineProps<{
  instance: DialogInstance
  isTopmost: boolean
}>()

const { t } = useI18n()
const dialogInstance = props.instance
const isTopmost = toRef(props, 'isTopmost')

const {
  contentStyle,
  currentHeight,
  currentWidth,
  fixFitLayout,
  resizeMaxHeight,
  resizeMaxWidth,
  updatePosition,
} = useDialogLayout(dialogInstance)

const dragConfig = computed(() => {
  const { draggable } = dialogInstance.settings

  if (typeof draggable === 'boolean') {
    return {
      enabled: draggable,
      maximize: draggable,
    }
  }

  return {
    enabled: draggable.enabled ?? true,
    maximize: draggable.maximize ?? true,
  }
})

const canDrag = computed(() => dragConfig.value.enabled)
const canDragMaximize = computed(() => dragConfig.value.maximize)
const canFullscreen = computed(() => dialogInstance.settings.fullscreen)
const hasDescription = computed(() => !!dialogInstance.settings.description)

const {
  callOpen,
  cancel,
  dispatchResize,
  handleOpenChange,
  handlePointerDownOutside,
  preventBlockedClose,
  setFullScreen,
  submit,
  toggleFullscreen,
} = useDialogController(dialogInstance, isTopmost, () => ({
  width:
    dialogInstance.isFullscreen && typeof window !== 'undefined'
      ? window.innerWidth
      : currentWidth.value,
  height:
    dialogInstance.isFullscreen && typeof window !== 'undefined'
      ? window.innerHeight
      : currentHeight.value,
  isFullscreen: dialogInstance.isFullscreen,
}))

const { handleDragStart, isDragging, isTopSpanning } = useDialogDrag({
  dialogInstance,
  canDrag,
  canDragMaximize,
  fixFitLayout,
  setFullScreen,
  updatePosition,
})

const canResize = computed(
  () => dialogInstance.settings.resizable && !dialogInstance.isFullscreen && !isDragging.value,
)

const { handleResizeStart, isResizing, resizePreviewStyle } = useDialogResize({
  dialogInstance,
  canResize,
  resizeMaxHeight,
  resizeMaxWidth,
  fixFitLayout,
  updatePosition,
  dispatchResize,
})

const contentClass = computed(() => [
  'flex flex-col p-0',
  dialogInstance.isFullscreen ? 'rounded-none sm:rounded-none' : 'sm:rounded-lg',
  !props.isTopmost && 'pointer-events-none',
  (isDragging.value || isResizing.value) && 'select-none duration-0',
])

onMounted(async () => {
  await nextTick()
  callOpen()
})
</script>

<template>
  <Dialog :open="dialogInstance.open" @update:open="handleOpenChange">
    <DialogContent
      :show-overlay="dialogInstance.settings.mask"
      :show-close="false"
      :close-label="t('components.dialog.close')"
      :style="contentStyle"
      :class="contentClass"
      @escape-key-down="!dialogInstance.settings.closeOnEsc && preventBlockedClose($event)"
      @pointer-down-outside="handlePointerDownOutside"
      @interact-outside="handlePointerDownOutside"
    >
      <WrapperHeader
        :instance="dialogInstance"
        :can-drag="canDrag"
        :can-fullscreen="canFullscreen"
        :has-description="hasDescription"
        @drag-start="handleDragStart"
        @toggle-fullscreen="toggleFullscreen"
        @cancel="cancel()"
      />

      <WrapperBody :instance="dialogInstance" />

      <WrapperFooter :instance="dialogInstance" @cancel="cancel()" @submit="submit()" />

      <ResizeHandles :can-resize="canResize" @resize-start="handleResizeStart" />
    </DialogContent>
  </Dialog>

  <div
    v-if="isTopSpanning"
    class="fixed inset-x-3 top-3 z-80 h-[calc(100vh-1.5rem)] rounded-lg border-2 border-primary bg-primary/25 shadow-[0_0_0_9999px_rgb(255_255_255/0.08),0_0_32px_rgb(124_58_237/0.45)]"
  ></div>

  <div
    v-if="resizePreviewStyle"
    :style="resizePreviewStyle"
    class="pointer-events-none fixed z-80 rounded-lg border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgb(255_255_255/0.08),0_0_32px_rgb(124_58_237/0.35)]"
  ></div>
</template>

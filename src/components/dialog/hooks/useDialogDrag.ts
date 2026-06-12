import { onBeforeUnmount, ref, type ComputedRef } from 'vue'

import type { DialogInstance } from '../types'
import { setDocumentInteraction } from '../utils'

interface UseDialogDragOptions {
  dialogInstance: DialogInstance
  canDrag: ComputedRef<boolean>
  canDragMaximize: ComputedRef<boolean>
  fixFitLayout: (target: EventTarget | null) => void
  setFullScreen: (isFullscreen: boolean) => void
  updatePosition: (x: number, y: number) => void
}

export function useDialogDrag({
  dialogInstance,
  canDrag,
  canDragMaximize,
  fixFitLayout,
  setFullScreen,
  updatePosition,
}: UseDialogDragOptions) {
  const isDragging = ref(false)
  const isTopSpanning = ref(false)

  let dragStartX = 0
  let dragStartY = 0
  let dragStartPositionX = 0
  let dragStartPositionY = 0

  function handleDragStart(event: MouseEvent) {
    if (!canDrag.value || event.button !== 0) return

    fixFitLayout(event.currentTarget)
    isDragging.value = true
    dragStartX = event.clientX
    dragStartY = event.clientY

    if (dialogInstance.isFullscreen) {
      const ratio = event.clientX / window.innerWidth
      setFullScreen(false)
      updatePosition(
        event.clientX - dialogInstance.size.width * ratio,
        Math.max(0, event.clientY - 20),
      )
    }

    dragStartPositionX = dialogInstance.position.x
    dragStartPositionY = dialogInstance.position.y
    setDocumentInteraction(true, 'move')
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)
  }

  function handleDragMove(event: MouseEvent) {
    if (!isDragging.value) return

    isTopSpanning.value = canDragMaximize.value && event.clientY < 10
    updatePosition(
      dragStartPositionX + event.clientX - dragStartX,
      Math.max(0, dragStartPositionY + event.clientY - dragStartY),
    )
  }

  function handleDragEnd() {
    if (isDragging.value && isTopSpanning.value) {
      setFullScreen(true)
    }

    isDragging.value = false
    isTopSpanning.value = false
    setDocumentInteraction(false)
    window.removeEventListener('mousemove', handleDragMove)
    window.removeEventListener('mouseup', handleDragEnd)
  }

  onBeforeUnmount(handleDragEnd)

  return {
    handleDragStart,
    isDragging,
    isTopSpanning,
  }
}

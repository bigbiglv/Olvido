import { computed, onBeforeUnmount, ref, type ComputedRef } from 'vue'

import { type ResizeDirection } from '../constants'
import { Dialog as DialogManager } from '../manager'
import type { DialogInstance } from '../types'
import { clamp, setDocumentInteraction } from '../utils'

interface UseDialogResizeOptions {
  dialogInstance: DialogInstance
  canResize: ComputedRef<boolean>
  resizeMaxWidth: ComputedRef<number>
  resizeMaxHeight: ComputedRef<number>
  fixFitLayout: (target: EventTarget | null) => void
  updatePosition: (x: number, y: number) => void
  dispatchResize: (end?: boolean) => void
}

function getResizeCursor(direction: ResizeDirection) {
  if (direction === 'n' || direction === 's') return 'ns-resize'
  if (direction === 'e' || direction === 'w') return 'ew-resize'
  if (direction === 'ne' || direction === 'sw') return 'nesw-resize'
  return 'nwse-resize'
}

export function useDialogResize({
  dialogInstance,
  canResize,
  resizeMaxWidth,
  resizeMaxHeight,
  fixFitLayout,
  updatePosition,
  dispatchResize,
}: UseDialogResizeOptions) {
  const isResizing = ref(false)
  const previewRect = ref<{ x: number; y: number; width: number; height: number } | null>(null)

  const resizePreviewStyle = computed(() => {
    if (!previewRect.value) return undefined

    return {
      height: `${previewRect.value.height}px`,
      left: `${previewRect.value.x}px`,
      top: `${previewRect.value.y}px`,
      width: `${previewRect.value.width}px`,
    }
  })

  let resizeDirection: ResizeDirection | null = null
  let resizeStartX = 0
  let resizeStartY = 0
  let resizeStartWidth = 0
  let resizeStartHeight = 0
  let resizeStartPositionX = 0
  let resizeStartPositionY = 0

  function updateSize(width: number, height: number) {
    DialogManager.updateSize(
      dialogInstance,
      clamp(width, dialogInstance.size.minWidth, resizeMaxWidth.value),
      clamp(height, dialogInstance.size.minHeight, resizeMaxHeight.value),
    )
    dispatchResize()
  }

  function commitSize(width: number, height: number) {
    DialogManager.updateSize(
      dialogInstance,
      clamp(width, dialogInstance.size.minWidth, resizeMaxWidth.value),
      clamp(height, dialogInstance.size.minHeight, resizeMaxHeight.value),
    )
  }

  function handleResizeStart(event: MouseEvent, direction: ResizeDirection) {
    if (!canResize.value || event.button !== 0) return

    fixFitLayout(event.currentTarget)
    resizeDirection = direction
    isResizing.value = true
    resizeStartX = event.clientX
    resizeStartY = event.clientY
    resizeStartWidth = dialogInstance.size.width
    resizeStartHeight = dialogInstance.size.height
    resizeStartPositionX = dialogInstance.position.x
    resizeStartPositionY = dialogInstance.position.y

    setDocumentInteraction(true, getResizeCursor(direction))
    window.addEventListener('mousemove', handleResizeMove)
    window.addEventListener('mouseup', handleResizeEnd)
    window.addEventListener('blur', handleResizeEnd)
    event.preventDefault()
  }

  function handleResizeMove(event: MouseEvent) {
    if (!isResizing.value || !resizeDirection) return

    const deltaX = event.clientX - resizeStartX
    const deltaY = event.clientY - resizeStartY
    let width = resizeStartWidth
    let height = resizeStartHeight
    let x = resizeStartPositionX
    let y = resizeStartPositionY
    let maxWidth = resizeMaxWidth.value
    let maxHeight = resizeMaxHeight.value

    if (resizeDirection.includes('e')) {
      width = resizeStartWidth + deltaX
      maxWidth = Math.min(maxWidth, window.innerWidth - resizeStartPositionX)
    }

    if (resizeDirection.includes('s')) {
      height = resizeStartHeight + deltaY
      maxHeight = Math.min(maxHeight, window.innerHeight - resizeStartPositionY)
    }

    if (resizeDirection.includes('w')) {
      width = resizeStartWidth - deltaX
      x = resizeStartPositionX + deltaX
      maxWidth = Math.min(maxWidth, resizeStartPositionX + resizeStartWidth)
    }

    if (resizeDirection.includes('n')) {
      height = resizeStartHeight - deltaY
      y = resizeStartPositionY + deltaY
      maxHeight = Math.min(maxHeight, resizeStartPositionY + resizeStartHeight)
    }

    const nextWidth = clamp(width, dialogInstance.size.minWidth, maxWidth)
    const nextHeight = clamp(height, dialogInstance.size.minHeight, maxHeight)

    if (resizeDirection.includes('w')) {
      x = resizeStartPositionX + (resizeStartWidth - nextWidth)
    }

    if (resizeDirection.includes('n')) {
      y = resizeStartPositionY + (resizeStartHeight - nextHeight)
    }

    if (dialogInstance.settings.resizeStrategy === 'deferred') {
      previewRect.value = {
        x,
        y,
        width: nextWidth,
        height: nextHeight,
      }
      return
    }

    updateSize(nextWidth, nextHeight)
    updatePosition(x, y)
  }

  function handleResizeEnd() {
    if (!isResizing.value) return

    isResizing.value = false
    resizeDirection = null
    if (previewRect.value) {
      const { x, y, width, height } = previewRect.value

      commitSize(width, height)
      updatePosition(x, y)
      previewRect.value = null
    }

    setDocumentInteraction(false)
    window.removeEventListener('mousemove', handleResizeMove)
    window.removeEventListener('mouseup', handleResizeEnd)
    window.removeEventListener('blur', handleResizeEnd)
    dispatchResize(true)
  }

  onBeforeUnmount(handleResizeEnd)

  return {
    handleResizeStart,
    isResizing,
    resizePreviewStyle,
  }
}

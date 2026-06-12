import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { FIT_HEIGHT_RATIO, FIT_MAX_HEIGHT, FIT_MAX_WIDTH, FIT_VIEWPORT_GAP } from '../constants'
import { Dialog as DialogManager } from '../manager'
import type { DialogInstance } from '../types'
import { clamp } from '../utils'

function getInitialViewportSize() {
  if (typeof window === 'undefined') {
    return { height: 768, width: 1024 }
  }

  return {
    height: window.innerHeight,
    width: window.innerWidth,
  }
}

export function useDialogLayout(dialogInstance: DialogInstance) {
  const viewportSize = ref(getInitialViewportSize())

  const resizeMaxWidth = computed(() =>
    dialogInstance.settings.maxWidth === undefined
      ? viewportSize.value.width
      : Math.min(dialogInstance.size.maxWidth, viewportSize.value.width),
  )
  const resizeMaxHeight = computed(() =>
    dialogInstance.settings.maxHeight === undefined
      ? viewportSize.value.height
      : Math.min(dialogInstance.size.maxHeight, viewportSize.value.height),
  )
  const fitMaxWidth = computed(() =>
    Math.min(resizeMaxWidth.value, FIT_MAX_WIDTH, viewportSize.value.width - FIT_VIEWPORT_GAP),
  )
  const fitMaxHeight = computed(() =>
    Math.min(resizeMaxHeight.value, FIT_MAX_HEIGHT, viewportSize.value.height - FIT_VIEWPORT_GAP),
  )
  const fitWidth = computed(() =>
    clamp(
      viewportSize.value.width - FIT_VIEWPORT_GAP,
      dialogInstance.size.minWidth,
      fitMaxWidth.value,
    ),
  )
  const fitHeight = computed(() =>
    // fit 是视口适配尺寸，不是内容自适应；高度使用比例上限避免默认接近全屏。
    clamp(
      Math.round(viewportSize.value.height * FIT_HEIGHT_RATIO),
      dialogInstance.size.minHeight,
      fitMaxHeight.value,
    ),
  )
  const currentWidth = computed(() =>
    dialogInstance.size.fitWidth ? fitWidth.value : dialogInstance.size.width,
  )
  const currentHeight = computed(() =>
    dialogInstance.size.fitHeight ? fitHeight.value : dialogInstance.size.height,
  )

  const contentStyle = computed(() => {
    if (dialogInstance.isFullscreen) {
      return {
        height: '100vh',
        left: '0px',
        maxHeight: '100vh',
        maxWidth: 'none',
        borderRadius: '0px',
        top: '0px',
        transform: 'none',
        translate: 'none',
        width: '100vw',
      }
    }

    const isFitLayout = dialogInstance.size.fitWidth || dialogInstance.size.fitHeight
    const style = {
      left: isFitLayout ? '50%' : `${dialogInstance.position.x}px`,
      maxHeight: `${dialogInstance.size.fitHeight ? fitMaxHeight.value : resizeMaxHeight.value}px`,
      maxWidth: `${dialogInstance.size.fitWidth ? fitMaxWidth.value : resizeMaxWidth.value}px`,
      minHeight:
        dialogInstance.size.fitHeight && dialogInstance.settings.minHeight === undefined
          ? undefined
          : `${dialogInstance.size.minHeight}px`,
      minWidth: `${dialogInstance.size.minWidth}px`,
      top: isFitLayout ? '50%' : `${dialogInstance.position.y}px`,
      transform: 'none',
      translate: isFitLayout ? '-50% -50%' : 'none',
    }

    return {
      ...style,
      height: `${currentHeight.value}px`,
      width: `${currentWidth.value}px`,
    }
  })

  function updateViewportSize() {
    viewportSize.value = {
      height: window.innerHeight,
      width: window.innerWidth,
    }
  }

  function fixFitLayout(target: EventTarget | null) {
    if (!dialogInstance.size.fitWidth && !dialogInstance.size.fitHeight) return
    if (!(target instanceof HTMLElement)) return

    const content = target.closest('[role="dialog"]')
    if (!(content instanceof HTMLElement)) return

    const rect = content.getBoundingClientRect()
    DialogManager.updateSize(
      dialogInstance,
      clamp(rect.width, dialogInstance.size.minWidth, resizeMaxWidth.value),
      clamp(rect.height, dialogInstance.size.minHeight, resizeMaxHeight.value),
    )
    DialogManager.updatePosition(dialogInstance, rect.left, rect.top)
  }

  function updatePosition(x: number, y: number) {
    DialogManager.updatePosition(dialogInstance, x, y)
  }

  onMounted(() => {
    window.addEventListener('resize', updateViewportSize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportSize)
  })

  return {
    contentStyle,
    currentHeight,
    currentWidth,
    fixFitLayout,
    resizeMaxHeight,
    resizeMaxWidth,
    updatePosition,
  }
}

import { provide, type Ref } from 'vue'

import { Dialog as DialogManager } from '../manager'
import {
  DIALOG_KEY,
  type DialogContext,
  type DialogInstance,
  type DialogLifecycle,
  type DialogOptions,
  type DialogSlot,
  type DialogSlotName,
} from '../types'

interface DialogLayoutSnapshot {
  width: number
  height: number
  isFullscreen: boolean
}

export function useDialogController(
  dialogInstance: DialogInstance,
  isTopmost: Ref<boolean>,
  getLayout: () => DialogLayoutSnapshot,
) {
  const callbacks: Partial<{
    [K in keyof DialogLifecycle]: DialogLifecycle[K]
  }> = {}

  function dispatchResize(end = false) {
    const layout = getLayout()

    callbacks.onResize?.(layout)
    if (end) callbacks.onResizeEnd?.(layout)
  }

  function setFullScreen(isFullscreen: boolean) {
    DialogManager.updateFullScreen(dialogInstance, isFullscreen)
    dispatchResize(true)
  }

  function toggleFullscreen() {
    setFullScreen(!dialogInstance.isFullscreen)
  }

  async function runBeforeClose() {
    if (!callbacks.onBeforeClose) return true
    return (await callbacks.onBeforeClose()) !== false
  }

  function finishResolve(value: unknown) {
    dialogInstance.resolve(value)
    DialogManager.close(dialogInstance.id)
  }

  function finishReject(reason?: unknown) {
    dialogInstance.reject(reason)
    DialogManager.close(dialogInstance.id)
  }

  async function submit(data?: unknown) {
    if (dialogInstance.confirmLoading) return

    dialogInstance.confirmLoading = true
    try {
      const confirmed = data !== undefined ? data : await callbacks.onConfirm?.()
      if (confirmed === false) return
      if (!(await runBeforeClose())) return

      finishResolve(confirmed)
    } finally {
      dialogInstance.confirmLoading = false
    }
  }

  async function cancel(reason?: unknown) {
    if (dialogInstance.loading) return

    const canceled = await callbacks.onCancel?.()
    if (canceled === false) return
    if (!(await runBeforeClose())) return

    finishReject(reason ?? 'cancel')
  }

  function handleOpenChange(open: boolean) {
    if (open || !isTopmost.value) return
    void cancel('close')
  }

  function preventBlockedClose(event: Event) {
    event.preventDefault()
  }

  function isResizeHandleEvent(event: Event) {
    const detail = (event as Event & { detail?: { originalEvent?: Event } }).detail
    const sourceEvent = detail?.originalEvent ?? event

    return sourceEvent
      .composedPath()
      .some(
        (target) =>
          target instanceof HTMLElement && target.hasAttribute('data-dialog-resize-handle'),
      )
  }

  function handlePointerDownOutside(event: Event) {
    if (isResizeHandleEvent(event) || !dialogInstance.settings.maskClosable) {
      preventBlockedClose(event)
    }
  }

  function callOpen() {
    callbacks.onOpen?.(dialogInstance.componentProps)
  }

  const context: DialogContext = {
    onOpen(fn) {
      callbacks.onOpen = fn
    },
    onConfirm(fn) {
      callbacks.onConfirm = fn
    },
    onCancel(fn) {
      callbacks.onCancel = fn
    },
    onBeforeClose(fn) {
      callbacks.onBeforeClose = fn
    },
    onResize(fn) {
      callbacks.onResize = fn
    },
    onResizeEnd(fn) {
      callbacks.onResizeEnd = fn
    },
    submit,
    cancel,
    setLoading(loading) {
      dialogInstance.loading = loading
    },
    setConfirmLoading(loading) {
      dialogInstance.confirmLoading = loading
    },
    setProps(settings: Partial<DialogOptions>) {
      Object.assign(dialogInstance.settings, settings)
      if (settings.slots) Object.assign(dialogInstance.slots, settings.slots)
    },
    setSlot(name: DialogSlotName, slot: DialogSlot) {
      if (dialogInstance.settings.slots?.[name]) return
      dialogInstance.slots[name] = slot
    },
    setFullScreen,
  }

  provide(DIALOG_KEY, context)

  return {
    callOpen,
    cancel,
    dispatchResize,
    handleOpenChange,
    handlePointerDownOutside,
    preventBlockedClose,
    setFullScreen,
    submit,
    toggleFullscreen,
  }
}

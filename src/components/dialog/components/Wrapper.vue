<script setup lang="ts">
import { computed, nextTick, onMounted, toRef, watch, ref, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

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

const hasGsapAnimation = computed(() => dialogInstance.settings.animate !== false)
const isAnimatingIn = ref(hasGsapAnimation.value)
const isAnimatingFullscreen = ref(false)

const contentClass = computed(() => [
  'flex flex-col p-0',
  dialogInstance.isFullscreen ? 'rounded-none sm:rounded-none' : 'sm:rounded-lg',
  !props.isTopmost && 'pointer-events-none',
  (isDragging.value || isResizing.value) && 'select-none duration-0',
  hasGsapAnimation.value && isAnimatingIn.value && 'opacity-0',
])

const adaptedContentStyle = computed(() => {
  const base = contentStyle.value
  if (hasGsapAnimation.value && (isAnimatingIn.value || isAnimatingFullscreen.value || !dialogInstance.open)) {
    // 动画期间，不强制使用 Vue 的 transform: 'none'，允许 GSAP 控制缩放和位移
    const { transform, ...style } = base as any
    return style
  }
  return base
})

function playOpenAnimation() {
  if (!hasGsapAnimation.value) return

  const el = document.getElementById(dialogInstance.id)
  if (!el) return

  gsap.killTweensOf(el)

  const trigger = dialogInstance.triggerRect
  // 让动画更快：触发器变形时 0.25s，无触发器渐显时 0.2s
  const duration = typeof dialogInstance.settings.animate === 'object'
    ? dialogInstance.settings.animate.duration ?? (trigger ? 0.25 : 0.2)
    : (trigger ? 0.25 : 0.2)
  const ease = typeof dialogInstance.settings.animate === 'object'
    ? dialogInstance.settings.animate.ease ?? 'power3.out'
    : 'power3.out'

  if (trigger) {
    el.style.animation = 'none'
    el.style.transition = 'none'
    el.style.overflow = 'hidden'

    const targetRect = el.getBoundingClientRect()

    // 计算触发源中心点与弹窗最终中心点的偏移量与缩放比率
    const triggerCenterX = trigger.left + trigger.width / 2
    const triggerCenterY = trigger.top + trigger.height / 2
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2

    const startX = triggerCenterX - targetCenterX
    const startY = triggerCenterY - targetCenterY
    const startScaleX = trigger.width / targetRect.width
    const startScaleY = trigger.height / targetRect.height

    // 使用 transform 实现极致流畅的硬件加速缩放变形动画
    gsap.set(el, {
      x: startX,
      y: startY,
      scaleX: startScaleX,
      scaleY: startScaleY,
      opacity: 0,
      borderRadius: '24px',
      transformOrigin: 'center center',
    })

    gsap.to(el, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      borderRadius: dialogInstance.isFullscreen ? '0px' : '8px',
      duration,
      ease,
      onComplete: () => {
        gsap.set(el, { clearProps: 'transform,x,y,scaleX,scaleY,borderRadius' })
        isAnimatingIn.value = false
      },
    })
  } else {
    // 默认渐显缩放动画
    gsap.fromTo(el, {
      scale: 0.95,
      opacity: 0,
    }, {
      scale: 1,
      opacity: 1,
      duration,
      ease,
      onComplete: () => {
        gsap.set(el, { clearProps: 'transform,scale' })
        isAnimatingIn.value = false
      },
    })
  }
}

function playCloseAnimation() {
  if (!hasGsapAnimation.value) return

  const el = document.getElementById(dialogInstance.id)
  if (!el) return

  gsap.killTweensOf(el)

  const trigger = dialogInstance.triggerRect
  // 关闭速度更快，提升交互爽快感：触发器变形时 0.2s，无触发器渐隐时 0.15s
  const duration = typeof dialogInstance.settings.animate === 'object'
    ? dialogInstance.settings.animate.duration ?? (trigger ? 0.2 : 0.15)
    : (trigger ? 0.2 : 0.15)
  const ease = typeof dialogInstance.settings.animate === 'object'
    ? dialogInstance.settings.animate.ease ?? 'power3.in'
    : 'power3.in'

  el.style.animation = 'none'
  el.style.transition = 'none'
  el.style.overflow = 'hidden'

  if (trigger) {
    const currentRect = el.getBoundingClientRect()
    const currentCenterX = currentRect.left + currentRect.width / 2
    const currentCenterY = currentRect.top + currentRect.height / 2

    const triggerCenterX = trigger.left + trigger.width / 2
    const triggerCenterY = trigger.top + trigger.height / 2

    const endX = triggerCenterX - currentCenterX
    const endY = triggerCenterY - currentCenterY
    const endScaleX = trigger.width / currentRect.width
    const endScaleY = trigger.height / currentRect.height

    gsap.to(el, {
      x: endX,
      y: endY,
      scaleX: endScaleX,
      scaleY: endScaleY,
      opacity: 0,
      borderRadius: '24px',
      duration,
      ease,
    })
  } else {
    gsap.to(el, {
      scale: 0.95,
      opacity: 0,
      duration,
      ease,
    })
  }
}

// 挂载时触发入场动画
onMounted(async () => {
  await nextTick()
  callOpen()
  setTimeout(playOpenAnimation, 0)
})

// 监听 open 变化触发退场动画
watch(() => dialogInstance.open, (isOpen) => {
  if (!isOpen) {
    playCloseAnimation()
  }
})

// 监听最大化与最小化（还原）状态变化，执行 FLIP 动画过渡
watch(() => dialogInstance.isFullscreen, async (isFullscreen) => {
  if (!hasGsapAnimation.value) return

  const el = document.getElementById(dialogInstance.id)
  if (!el) return

  // 1. FIRST: 记录变化前的尺寸和位置
  const firstRect = el.getBoundingClientRect()

  // 标记正在执行最大化动画，从而临时接管 transform 样式绑定
  isAnimatingFullscreen.value = true
  
  // 等待 Vue 将新的 DOM 布局刷新完毕
  await nextTick()

  // 2. LAST: 记录变化后的尺寸和位置
  const lastRect = el.getBoundingClientRect()

  // 3. INVERT & PLAY: 计算差异并播放 FLIP 动画
  const deltaX = firstRect.left - lastRect.left
  const deltaY = firstRect.top - lastRect.top
  const deltaScaleX = firstRect.width / lastRect.width
  const deltaScaleY = firstRect.height / lastRect.height

  // 清除当前的任何动画，防止冲突
  gsap.killTweensOf(el)

  // 设定为 Invert 起始变换（以 top left 为基准，位置计算最直观精确）
  gsap.set(el, {
    x: deltaX,
    y: deltaY,
    scaleX: deltaScaleX,
    scaleY: deltaScaleY,
    borderRadius: isFullscreen ? '8px' : '0px',
    transformOrigin: 'top left',
  })

  // 播放回到 Last 原始位置状态的动画
  gsap.to(el, {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    borderRadius: isFullscreen ? '0px' : '8px',
    duration: 0.25,
    ease: 'power3.out',
    onComplete: () => {
      // 动画完毕后彻底清除 GSAP 产生的影响，使 Vue 重新接管正常自适应和拉伸行为
      gsap.set(el, { clearProps: 'transform,x,y,scaleX,scaleY,borderRadius,transformOrigin' })
      isAnimatingFullscreen.value = false
    },
  })
})

// 组件卸载前清除 GSAP 动画
onBeforeUnmount(() => {
  const el = document.getElementById(dialogInstance.id)
  if (el) {
    gsap.killTweensOf(el)
  }
})
</script>

<template>
  <Dialog :open="dialogInstance.open" @update:open="handleOpenChange">
    <DialogContent
      :id="dialogInstance.id"
      :disable-css-animation="hasGsapAnimation"
      force-mount
      :show-overlay="dialogInstance.settings.mask"
      :show-close="false"
      close-label="关闭"
      :style="adaptedContentStyle"
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
    class="fixed inset-x-3 top-3 z-[1000] h-[calc(100vh-1.5rem)] rounded-lg border-2 border-primary bg-primary/25 shadow-[0_0_0_9999px_rgb(255_255_255/0.08),0_0_32px_rgb(124_58_237/0.45)]"
  ></div>

  <div
    v-if="resizePreviewStyle"
    :style="resizePreviewStyle"
    class="pointer-events-none fixed z-[1000] rounded-lg border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgb(255_255_255/0.08),0_0_32px_rgb(124_58_237/0.35)]"
  ></div>
</template>

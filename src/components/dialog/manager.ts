import {
  defineAsyncComponent,
  markRaw,
  reactive,
  type AsyncComponentLoader,
  type Component,
} from 'vue'

import { FIT_HEIGHT_RATIO, FIT_MAX_HEIGHT, FIT_MAX_WIDTH, FIT_VIEWPORT_GAP } from './constants'
import type { DialogInstance, DialogOptions, DialogShowConfig } from './types'
import { clamp } from './utils'

type ComponentWithDialogOptions = Component & {
  dialogOptions?: DialogOptions
}

let lastClickRect: { left: number; top: number; width: number; height: number } | null = null
let clearTimer: ReturnType<typeof setTimeout> | null = null

if (typeof window !== 'undefined') {
  window.addEventListener(
    'click',
    (e) => {
      const target = e.target
      if (target && typeof (target as any).closest === 'function') {
        const triggerEl = (target as any).closest('button, a, [role="button"]') || target
        if (triggerEl && typeof (triggerEl as any).getBoundingClientRect === 'function') {
          const rect = (triggerEl as any).getBoundingClientRect()
          lastClickRect = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
          if (clearTimer) clearTimeout(clearTimer)
          clearTimer = setTimeout(() => {
            lastClickRect = null
          }, 100)
        }
      }
    },
    { capture: true, passive: true },
  )
}

function resolveTriggerRect(
  trigger: DialogOptions['trigger'],
): { left: number; top: number; width: number; height: number } | null {
  if (!trigger) return null
  if (typeof trigger === 'string') {
    if (typeof document === 'undefined') return null
    const el = document.querySelector(trigger)
    return el && typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null
  }
  if (typeof MouseEvent !== 'undefined' && trigger instanceof MouseEvent) {
    return { left: trigger.clientX, top: trigger.clientY, width: 0, height: 0 }
  }
  if (typeof trigger === 'object') {
    if (typeof (trigger as any).getBoundingClientRect === 'function') {
      const rect = (trigger as any).getBoundingClientRect()
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }
    }
    if ('left' in trigger && 'top' in trigger) {
      return {
        left: (trigger as any).left,
        top: (trigger as any).top,
        width: (trigger as any).width ?? 0,
        height: (trigger as any).height ?? 0,
      }
    }
  }
  return null
}

const defaultOptions = {
  mask: true,
  maskClosable: true,
  closeOnEsc: true,
  footer: true,
  fullscreen: true,
  defaultMaximized: false,
  draggable: true,
  resizable: true,
  resizeStrategy: 'realtime',
} satisfies Required<
  Pick<
    DialogOptions,
    | 'mask'
    | 'maskClosable'
    | 'closeOnEsc'
    | 'footer'
    | 'fullscreen'
    | 'defaultMaximized'
    | 'draggable'
    | 'resizable'
    | 'resizeStrategy'
  >
>

const stack = reactive<DialogInstance[]>([])

function createId() {
  return `dialog-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isShowConfig(value: unknown): value is DialogShowConfig {
  return !!value && typeof value === 'object' && 'component' in value
}

function resolveComponent(component: AsyncComponentLoader | Component) {
  if (typeof component === 'function') {
    return markRaw(defineAsyncComponent(component as AsyncComponentLoader))
  }

  return markRaw(component)
}

function getComponentOptions(component: AsyncComponentLoader | Component) {
  if (typeof component === 'function') return {}
  return (component as ComponentWithDialogOptions).dialogOptions ?? {}
}

function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function toPixels(value: number | string | undefined, axis: 'width' | 'height', fallback: number) {
  if (typeof value === 'number') return value
  if (!value) return fallback

  const viewport = getViewportSize()
  const rawValue = value.trim()
  const numericValue = Number.parseFloat(rawValue)

  if (Number.isNaN(numericValue)) return fallback
  if (rawValue.endsWith('px')) return numericValue
  if (rawValue.endsWith('vw')) return (viewport.width * numericValue) / 100
  if (rawValue.endsWith('vh')) return (viewport.height * numericValue) / 100
  if (rawValue.endsWith('%')) {
    return ((axis === 'width' ? viewport.width : viewport.height) * numericValue) / 100
  }

  return numericValue
}

function isFitSize(value: DialogOptions['width'] | DialogOptions['height']) {
  return value === 'fit'
}

function getFitWidth(
  viewport: ReturnType<typeof getViewportSize>,
  minWidth: number,
  maxWidth: number,
) {
  return clamp(
    viewport.width - FIT_VIEWPORT_GAP,
    minWidth,
    Math.min(maxWidth, FIT_MAX_WIDTH, viewport.width - FIT_VIEWPORT_GAP),
  )
}

function getFitHeight(
  viewport: ReturnType<typeof getViewportSize>,
  minHeight: number,
  maxHeight: number,
) {
  // fit 是视口适配尺寸，不是内容自适应；高度使用比例上限避免默认接近全屏。
  return clamp(
    Math.round(viewport.height * FIT_HEIGHT_RATIO),
    minHeight,
    Math.min(maxHeight, FIT_MAX_HEIGHT, viewport.height - FIT_VIEWPORT_GAP),
  )
}

function resolveDraggable(settings: DialogOptions) {
  if (typeof settings.draggable === 'boolean') {
    return {
      enabled: settings.draggable,
      maximize: settings.draggable,
    }
  }

  return {
    enabled: settings.draggable?.enabled ?? true,
    maximize: settings.draggable?.maximize ?? true,
  }
}

function createLayout(settings: DialogOptions) {
  const viewport = getViewportSize()
  const fitWidth = isFitSize(settings.width)
  const fitHeight = isFitSize(settings.height)
  const minWidth = toPixels(settings.minWidth, 'width', 320)
  const minHeight = toPixels(settings.minHeight, 'height', 320)
  const maxWidth = toPixels(settings.maxWidth, 'width', viewport.width)
  const maxHeight = toPixels(settings.maxHeight, 'height', viewport.height)
  const fallbackWidth = clamp(560, minWidth, maxWidth)
  const fallbackHeight = clamp(420, minHeight, maxHeight)
  const width = fitWidth
    ? getFitWidth(viewport, minWidth, maxWidth)
    : clamp(toPixels(settings.width, 'width', fallbackWidth), minWidth, maxWidth)
  const height = fitHeight
    ? getFitHeight(viewport, minHeight, maxHeight)
    : clamp(toPixels(settings.height, 'height', fallbackHeight), minHeight, maxHeight)

  return {
    position: {
      x: fitWidth ? viewport.width / 2 : Math.max(16, (viewport.width - width) / 2),
      y: fitHeight ? viewport.height / 2 : Math.max(16, (viewport.height - height) / 2),
    },
    size: {
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      fitWidth,
      fitHeight,
    },
  }
}

function remove(id: string, delay?: number) {
  const instance = stack.find((item) => item.id === id)
  if (!instance || !instance.open) return

  instance.open = false

  let finalDelay = delay
  if (finalDelay === undefined) {
    const animate = instance.settings.animate
    const isGsap = animate !== false
    if (isGsap) {
      const customDuration =
        typeof animate === 'object' && typeof animate.duration === 'number'
          ? animate.duration
          : null
      if (customDuration !== null) {
        finalDelay = customDuration * 1000 + 50
      } else {
        finalDelay = instance.triggerRect ? 250 : 200
      }
    } else {
      finalDelay = 160 // 默认 CSS 动画延时
    }
  }

  window.setTimeout(() => {
    const index = stack.findIndex((item) => item.id === id)
    if (index >= 0) stack.splice(index, 1)
  }, finalDelay)
}

export const Dialog = {
  stack,

  show<TResult = unknown, TProps extends Record<string, unknown> = Record<string, unknown>>(
    componentOrConfig: AsyncComponentLoader | Component | DialogShowConfig<TProps>,
    props?: TProps,
    options?: DialogOptions,
  ) {
    const config = isShowConfig(componentOrConfig)
      ? componentOrConfig
      : { component: componentOrConfig, props, options }
    const componentOptions = getComponentOptions(config.component)
    const settings = {
      ...defaultOptions,
      ...componentOptions,
      ...config.options,
    }
    const layout = createLayout(settings)
    const draggable = resolveDraggable(settings)
    const triggerRect =
      resolveTriggerRect(settings.trigger) || (lastClickRect ? { ...lastClickRect } : null)
    lastClickRect = null // 消费后重置

    return new Promise<TResult>((resolve, reject) => {
      stack.push({
        id: createId(),
        component: resolveComponent(config.component),
        componentProps: (config.props ?? {}) as Record<string, unknown>,
        settings,
        slots: { ...settings.slots },
        position: layout.position,
        size: layout.size,
        isFullscreen: settings.defaultMaximized,
        dragMaximize: draggable.maximize,
        open: true,
        loading: false,
        confirmLoading: false,
        resolve: resolve as (value: unknown) => void,
        reject,
        triggerRect: triggerRect ?? undefined,
      })
    })
  },

  close(id: string) {
    remove(id)
  },

  updatePosition(instance: DialogInstance, x: number, y: number) {
    instance.position = { x, y }
  },

  updateSize(instance: DialogInstance, width: number, height: number) {
    instance.size.width = width
    instance.size.height = height
    instance.size.fitWidth = false
    instance.size.fitHeight = false
  },

  updateFullScreen(instance: DialogInstance, isFullscreen: boolean) {
    instance.isFullscreen = isFullscreen
  },

  closeAll() {
    stack.forEach((instance) => {
      instance.open = false
      instance.reject('close-all')
    })
    stack.splice(0, stack.length)
  },
}

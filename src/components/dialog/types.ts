/// <reference types="gsap" />
import type { AsyncComponentLoader, Component, InjectionKey, VNode } from 'vue'

export const DIALOG_KEY: InjectionKey<DialogContext> = Symbol('DIALOG_KEY')

export type DialogSlotName = 'title' | 'headerExtra' | 'footer'
export type DialogSlot = string | number | VNode | (() => unknown) | Component
export type DialogButtonProps = Record<string, unknown>

/**
 * 弹窗缩放更新策略
 *
 * `realtime` 实时更新
 * `deferred` 松手后更新
 */
export type DialogResizeStrategy = 'realtime' | 'deferred'

export type DialogTrigger =
  | string
  | Element
  | MouseEvent
  | { left: number; top: number; width?: number; height?: number }
  | DOMRect

export interface DialogOptions {
  /** 弹窗标题 */
  title?: string

  /** 弹窗描述 */
  description?: string

  /** 弹窗宽度 */
  width?: number | string | 'fit'

  /** 弹窗高度 */
  height?: number | string | 'fit'

  /** 最小宽度 */
  minWidth?: number | string

  /** 最小高度 */
  minHeight?: number | string

  /** 最大宽度 */
  maxWidth?: number | string

  /** 最大高度 */
  maxHeight?: number | string

  /**
   * 显示全屏按钮
   * @default true
   */
  fullscreen?: boolean

  /**
   * 打开时默认全屏
   * @default false
   */
  defaultMaximized?: boolean

  /**
   * 拖拽标题栏移动
   * @default true
   */
  draggable?: boolean | { enabled?: boolean; maximize?: boolean }

  /**
   * 允许边缘缩放
   * @default true
   */
  resizable?: boolean

  /**
   * 缩放更新策略
   * @default 'realtime'
   */
  resizeStrategy?: DialogResizeStrategy

  /**
   * 显示遮罩层
   * @default true
   */
  mask?: boolean

  /**
   * 点击遮罩关闭
   * @default true
   */
  maskClosable?: boolean

  /**
   * 按 Esc 关闭
   * @default true
   */
  closeOnEsc?: boolean

  /**
   * 显示底部操作区
   * @default true
   */
  footer?: boolean

  /** 确认按钮文案 */
  okText?: string

  /** 取消按钮文案 */
  cancelText?: string

  /** 确认按钮属性 */
  okButtonProps?: DialogButtonProps

  /** 取消按钮属性 */
  cancelButtonProps?: DialogButtonProps

  /** 自定义插槽 */
  slots?: Partial<Record<DialogSlotName, DialogSlot>>

  /** 触发源，用于动画过渡起点 */
  trigger?: DialogTrigger

  /** 启用/禁用动画或自定义动画配置 */
  animate?: boolean | gsap.TweenVars
}

export interface DialogShowConfig<TProps = Record<string, unknown>> {
  component: AsyncComponentLoader | Component
  props?: TProps
  options?: DialogOptions
}

type DefaultDialogSettings = Required<
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

export interface DialogInstance {
  id: string
  component: Component
  componentProps: Record<string, unknown>
  settings: DefaultDialogSettings &
    Omit<
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
  slots: Partial<Record<DialogSlotName, DialogSlot>>
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
    minWidth: number
    minHeight: number
    maxWidth: number
    maxHeight: number
    fitWidth: boolean
    fitHeight: boolean
  }
  isFullscreen: boolean
  dragMaximize: boolean
  open: boolean
  loading: boolean
  confirmLoading: boolean
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
  /** 触发源的屏幕绝对坐标矩形缓存 */
  triggerRect?: { left: number; top: number; width: number; height: number }
}

export interface DialogLifecycle<TResult = unknown> {
  onOpen: (props: Record<string, unknown>) => void
  onConfirm: () => boolean | void | TResult | Promise<boolean | void | TResult>
  onCancel: () => boolean | void | Promise<boolean | void>
  onBeforeClose: () => boolean | void | Promise<boolean | void>
  onResize: (layout: { width: number; height: number; isFullscreen: boolean }) => void
  onResizeEnd: (layout: { width: number; height: number; isFullscreen: boolean }) => void
}

export type DialogLifecycleMethods<TResult = unknown> = {
  [K in keyof DialogLifecycle<TResult>]: (fn: DialogLifecycle<TResult>[K]) => void
}

export interface DialogContext<TResult = unknown> extends DialogLifecycleMethods<TResult> {
  submit: (data?: TResult) => void
  cancel: (reason?: unknown) => void
  setLoading: (loading: boolean) => void
  setConfirmLoading: (loading: boolean) => void
  setProps: (settings: Partial<DialogOptions>) => void
  setSlot: (name: DialogSlotName, slot: DialogSlot) => void
  setFullScreen: (isFullscreen: boolean) => void
}

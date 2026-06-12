export type ConfirmButtonProps = Record<string, unknown>

export interface ConfirmOptions {
  /** 标题，不传时使用国际化默认文案。 */
  title?: string

  /** 描述，不传时使用国际化默认文案。 */
  description?: string

  /** 确认按钮文案 */
  okText?: string

  /** 取消按钮文案 */
  cancelText?: string

  /** 确认按钮属性 */
  okButtonProps?: ConfirmButtonProps

  /** 取消按钮属性 */
  cancelButtonProps?: ConfirmButtonProps

  /**
   * 确认按钮是否使用危险操作样式。
   * @default false
   */
  destructive?: boolean

  /**
   * 点击遮罩关闭
   * @default false
   */
  maskClosable?: boolean

  /**
   * 按 Esc 关闭
   * @default true
   */
  closeOnEsc?: boolean

  /** 确认前回调，返回 false 时阻止关闭。 */
  onConfirm?: () => boolean | void | Promise<boolean | void>

  /** 取消前回调，返回 false 时阻止关闭。 */
  onCancel?: () => boolean | void | Promise<boolean | void>
}

export interface ConfirmInstance {
  id: string
  open: boolean
  options: Required<Pick<ConfirmOptions, 'closeOnEsc' | 'destructive' | 'maskClosable'>> &
    Omit<ConfirmOptions, 'closeOnEsc' | 'destructive' | 'maskClosable'>
  confirmLoading: boolean
  resolve: (value: boolean) => void
  reject: (reason?: unknown) => void
}

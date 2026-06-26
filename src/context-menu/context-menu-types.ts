import type { Component } from 'vue'

/**
 * 菜单项行为接口定义
 */
export interface MenuAction {
  /**
   * 菜单项唯一标识符
   */
  id: string

  /**
   * 菜单项显示文本
   */
  label: string

  /**
   * 是否禁用，支持布尔值或动态计算函数
   */
  disabled?: boolean | (() => boolean)

  /**
   * 是否可见，支持布尔值或动态计算函数
   */
  visible?: boolean | (() => boolean)

  /**
   * 点击菜单项的回调函数，叶子节点点击后会自动关闭菜单
   */
  onClick?: () => void | Promise<void>

  /**
   * 子菜单项列表，用于实现多级嵌套菜单
   */
  children?: ContextMenuItem[]

  /**
   * 自定义面板组件，鼠标悬停时用于展示的自定义 Vue 组件
   */
  panelComponent?: Component

  /**
   * 自定义面板组件的传入属性 (props)
   */
  panelProps?: Record<string, any>
}

/**
 * 菜单分隔线定义
 */
export interface MenuSeparator {
  /**
   * 标识当前项为分隔线
   */
  type: 'separator'
}

/**
 * 右键菜单项联合类型
 */
export type ContextMenuItem = MenuAction | MenuSeparator

/**
 * 右键菜单上下文信息
 */
export interface ContextMenuContext<T = any> {
  /**
   * 触发右键菜单的原生鼠标事件对象
   */
  event: MouseEvent

  /**
   * 目标区域的标识类型
   */
  targetRegionType: string

  /**
   * 触发菜单时携带的业务数据
   */
  data?: T

  /**
   * 匹配到右键区域的 DOM 节点元素
   */
  regionElement: HTMLElement
}

/**
 * 右键菜单触发区域注册定义
 */
export interface ContextMenuRegion {
  /**
   * 区域类型，用于匹配 data-context-region 属性
   */
  type: string

  /**
   * 区域优先级，值越大越优先展示，默认为 0
   */
  priority?: number

  /**
   * 获取当前区域对应的菜单项列表
   * @param context 菜单上下文信息
   */
  getMenus: (context: ContextMenuContext) => ContextMenuItem[]
}


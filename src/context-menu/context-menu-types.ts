export interface MenuAction {
  id: string
  label: string
  disabled?: boolean
  visible?: boolean
  onClick: () => void | Promise<void>
}

export interface MenuSeparator {
  type: 'separator'
}

export type ContextMenuItem = MenuAction | MenuSeparator

export interface ContextMenuContext<T = any> {
  event: MouseEvent
  targetRegionType: string
  data?: T
  regionElement: HTMLElement
}

export interface ContextMenuRegion {
  type: string
  priority?: number
  getMenus: (context: ContextMenuContext) => ContextMenuItem[]
}

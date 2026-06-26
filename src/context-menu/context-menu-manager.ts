import { markRaw } from 'vue'
import { useContextMenuStore } from './context-menu-store'
import type { ContextMenuRegion, ContextMenuItem, ContextMenuContext } from './context-menu-types'

class ContextMenuManager {
  private regions = new Map<string, ContextMenuRegion>()
  private initializedGlobalListener = false

  register(region: ContextMenuRegion): void {
    this.regions.set(region.type, region)
  }

  unregister(type: string): void {
    this.regions.delete(type)
  }

  show(event: MouseEvent, data?: any): void {
    // 1. 自动处理默认行为和阻止冒泡
    event.preventDefault()
    event.stopPropagation()

    // 确保全局点击监听已初始化
    this.initGlobalListener()

    // 2. 向上遍历 DOM 收集 Region 链
    let current = event.target as HTMLElement | null
    const matchedElements: { type: string; el: HTMLElement }[] = []

    while (current) {
      const regionType = current.getAttribute('data-context-region')
      if (regionType) {
        matchedElements.push({ type: regionType, el: current })
      }
      current = current.parentElement
    }

    if (matchedElements.length === 0) {
      this.hide()
      return
    }

    // 最内层的 regionType
    const targetRegionType = matchedElements[0].type

    // 3. 收集并处理各个 Region 的菜单
    const regionsWithMenus: { priority: number; items: ContextMenuItem[] }[] = []

    for (const matched of matchedElements) {
      const region = this.regions.get(matched.type)
      if (!region) continue

      const context: ContextMenuContext = {
        event,
        targetRegionType,
        data,
        regionElement: matched.el,
      }

      const menus = region.getMenus(context)
      if (menus.length > 0) {
        regionsWithMenus.push({
          priority: region.priority ?? 0,
          items: menus,
        })
      }
    }

    if (regionsWithMenus.length === 0) {
      this.hide()
      return
    }

    // 4. 按优先级降序排序
    regionsWithMenus.sort((a, b) => b.priority - a.priority)

    // 5. 合并菜单并自动插入分隔线 separator
    const finalMenus: ContextMenuItem[] = []
    regionsWithMenus.forEach((group) => {
      if (group.items.length === 0) return

      if (finalMenus.length > 0) {
        finalMenus.push({ type: 'separator' })
      }
      finalMenus.push(...group.items)
    })

    if (finalMenus.length === 0) {
      this.hide()
      return
    }

    // 6. 递归处理所有菜单项 (计算 visible/disabled，清理 separators，封装 onClick)
    const wrappedMenus = this.processMenuItems(finalMenus)

    if (wrappedMenus.length === 0) {
      this.hide()
      return
    }

    // 7. 更新 Store 状态
    const store = useContextMenuStore()
    store.show(event.clientX, event.clientY, wrappedMenus)
  }

  hide(): void {
    const store = useContextMenuStore()
    store.hide()
  }

  private processMenuItems(items: ContextMenuItem[]): ContextMenuItem[] {
    // 1. 过滤掉不可见项
    const visibleItems = items.filter((item) => {
      if ('type' in item && item.type === 'separator') return true
      const action = item as any
      const isVisible = typeof action.visible === 'function'
        ? action.visible()
        : action.visible !== false
      return isVisible
    })

    // 2. 清理多余的分隔线
    const cleanedItems = this.cleanSeparators(visibleItems)

    // 3. 包装属性和 onClick
    return cleanedItems.map((item) => {
      if ('type' in item && item.type === 'separator') {
        return item
      }

      const action = item as any
      const disabled = typeof action.disabled === 'function'
        ? action.disabled()
        : !!action.disabled

      const wrappedAction = {
        ...action,
        disabled,
        panelComponent: action.panelComponent ? markRaw(action.panelComponent) : undefined,
      }

      if (action.children) {
        wrappedAction.children = this.processMenuItems(action.children)
      }

      if (action.onClick) {
        wrappedAction.onClick = async () => {
          // 如果没有子菜单，点击父项自动关闭整个上下文菜单
          if (!action.children) {
            this.hide()
          }
          try {
            await action.onClick?.()
          } catch (error) {
            console.error('Error executing context menu action:', error)
          }
        }
      }

      return wrappedAction
    })
  }

  private initGlobalListener() {
    if (this.initializedGlobalListener) return
    this.initializedGlobalListener = true

    // 监听全局 mousedown，如果点击非菜单内部，则关闭菜单
    document.addEventListener(
      'mousedown',
      (event) => {
        const store = useContextMenuStore()
        if (!store.visible) return

        // 寻找右键菜单 DOM 容器
        const menuEl = document.getElementById('global-context-menu-container')
        if (menuEl && menuEl.contains(event.target as Node)) {
          return
        }

        this.hide()
      },
      true,
    )
  }

  private cleanSeparators(items: ContextMenuItem[]): ContextMenuItem[] {
    const result: ContextMenuItem[] = []
    for (const item of items) {
      const isSep = 'type' in item && item.type === 'separator'
      if (isSep) {
        // 避免开头是 separator，或连续的 separator
        const lastItem = result[result.length - 1]
        const isLastSep = lastItem && 'type' in lastItem && lastItem.type === 'separator'
        if (result.length > 0 && !isLastSep) {
          result.push(item)
        }
      } else {
        result.push(item)
      }
    }
    // 移除末尾的 separator
    const lastItem = result[result.length - 1]
    const isLastSep = lastItem && 'type' in lastItem && lastItem.type === 'separator'
    if (result.length > 0 && isLastSep) {
      result.pop()
    }
    return result
  }
}

export const contextMenuManager = new ContextMenuManager()

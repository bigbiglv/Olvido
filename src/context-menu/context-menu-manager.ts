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

      // 执行 getMenus 获取菜单项，过滤掉不可见的项
      const menus = region.getMenus(context).filter((item) => {
        if ('type' in item && item.type === 'separator') return true
        if ('visible' in item && item.visible === false) return false
        return true
      })

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
      // 过滤掉连续的多余分隔线
      const cleanGroupItems = this.cleanSeparators(group.items)
      if (cleanGroupItems.length === 0) return

      if (finalMenus.length > 0) {
        finalMenus.push({ type: 'separator' })
      }
      finalMenus.push(...cleanGroupItems)
    })

    if (finalMenus.length === 0) {
      this.hide()
      return
    }

    // 6. 异常安全包装 onClick 并附加 hide 行为
    const wrappedMenus = finalMenus.map((item) => {
      if ('type' in item && item.type === 'separator') {
        return item
      }
      const action = item as any
      return {
        ...action,
        onClick: async () => {
          this.hide() // 立即隐藏菜单
          try {
            await action.onClick?.()
          } catch (error) {
            console.error('Error executing context menu action:', error)
          }
        },
      }
    })

    // 7. 更新 Store 状态
    const store = useContextMenuStore()
    store.show(event.clientX, event.clientY, wrappedMenus)
  }

  hide(): void {
    const store = useContextMenuStore()
    store.hide()
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

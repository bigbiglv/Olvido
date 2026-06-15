import { defineStore } from 'pinia'
import type { ContextMenuItem } from './context-menu-types'

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  menus: ContextMenuItem[]
}

export const useContextMenuStore = defineStore('contextMenu', {
  state: (): ContextMenuState => ({
    visible: false,
    x: 0,
    y: 0,
    menus: [],
  }),
  actions: {
    show(x: number, y: number, menus: ContextMenuItem[]) {
      this.visible = true
      this.x = x
      this.y = y
      this.menus = menus
    },
    hide() {
      this.visible = false
      this.menus = []
    },
  },
})

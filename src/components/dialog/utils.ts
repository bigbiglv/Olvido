import { h, isVNode } from 'vue'

import type { DialogSlot } from './types'

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function renderSlotValue(slot?: DialogSlot) {
  if (slot === undefined || slot === null) return null
  if (typeof slot === 'string' || typeof slot === 'number') return slot
  if (isVNode(slot)) return slot
  if (typeof slot === 'function') {
    return slot.length === 0 ? (slot as () => unknown)() : h(slot)
  }

  return h(slot)
}

export function setDocumentInteraction(active: boolean, cursor = '') {
  document.body.style.userSelect = active ? 'none' : ''
  document.body.style.cursor = active ? cursor : ''
}

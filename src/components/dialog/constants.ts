export const FIT_MAX_WIDTH = 960
export const FIT_MAX_HEIGHT = 680
export const FIT_HEIGHT_RATIO = 0.75
export const FIT_VIEWPORT_GAP = 32

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export const RESIZE_HANDLES: Array<{ direction: ResizeDirection; className: string }> = [
  { direction: 'n', className: '-top-2 left-4 right-4 h-4 cursor-ns-resize' },
  { direction: 's', className: '-bottom-2 left-4 right-4 h-4 cursor-ns-resize' },
  { direction: 'e', className: '-right-2 bottom-4 top-4 w-4 cursor-ew-resize' },
  { direction: 'w', className: '-left-2 bottom-4 top-4 w-4 cursor-ew-resize' },
  { direction: 'ne', className: '-right-2 -top-2 size-5 cursor-nesw-resize' },
  { direction: 'nw', className: '-left-2 -top-2 size-5 cursor-nwse-resize' },
  { direction: 'se', className: '-bottom-2 -right-2 size-5 cursor-nwse-resize' },
  { direction: 'sw', className: '-bottom-2 -left-2 size-5 cursor-nesw-resize' },
]

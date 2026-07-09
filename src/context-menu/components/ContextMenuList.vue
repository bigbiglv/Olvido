<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { contextMenuManager } from '../context-menu-manager'
import type { ContextMenuItem } from '../context-menu-types'

interface Props {
  items: ContextMenuItem[]
}

interface Emits {
  (e: 'action-click', item: any): void
}

const { items } = defineProps<Props>()
const emit = defineEmits<Emits>()

// 跟踪当前悬浮展开的项 ID
const hoveredItemId = ref<string | null>(null)

// 各子菜单的防溢出对齐方向与偏移位置
const submenuAlignLeft = ref<Record<string, boolean>>({})
const submenuAlignTopAdjust = ref<Record<string, number>>({})

// 子菜单 DOM 元素的引用映射
const submenuRefs = ref<Record<string, HTMLElement | null>>({})

function setSubmenuRef(id: string, el: any) {
  if (el) {
    submenuRefs.value[id] = el as HTMLElement
  } else {
    delete submenuRefs.value[id]
  }
}

// 延迟关闭定时器
let closeTimer: any = null

async function handleMouseEnter(item: any) {
  if ('type' in item && item.type === 'separator') return
  if (item.disabled) return

  // 1. 清除任何挂起的关闭动作
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }

  // 2. 切换当前悬浮项
  hoveredItemId.value = item.id

  if (item.children || item.panelComponent) {
    // 初始化布局计算参数
    submenuAlignLeft.value[item.id] = false
    submenuAlignTopAdjust.value[item.id] = 0

    await nextTick()
    const subEl = submenuRefs.value[item.id]
    if (!subEl) return

    const rect = subEl.getBoundingClientRect()

    // 1. 横向防溢出：若超出视口右边界，则向左展示
    if (rect.right > window.innerWidth) {
      submenuAlignLeft.value[item.id] = true
    }

    // 2. 纵向防溢出：若超出视口下边界，计算负偏移向上移动
    if (rect.bottom > window.innerHeight) {
      submenuAlignTopAdjust.value[item.id] = window.innerHeight - rect.bottom - 8
    }
  }
}

function handleMouseLeave(item: any) {
  if ('type' in item && item.type === 'separator') return

  // 3. 延迟 150ms 隐藏，提供缓冲区防止鼠标滑过间隙时子菜单关闭
  closeTimer = setTimeout(() => {
    if (hoveredItemId.value === item.id) {
      hoveredItemId.value = null
    }
  }, 150)
}

function handleSubmenuMouseEnter() {
  // 4. 鼠标成功进入子菜单后，取消延迟关闭定时器
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function handleActionClick(item: any) {
  emit('action-click', item)
}

function handleClose() {
  contextMenuManager.hide()
}

import { gsap } from 'gsap'

function getSubmenuStyle(id: string) {
  const alignLeft = submenuAlignLeft.value[id]
  const topAdjust = submenuAlignTopAdjust.value[id] || 0

  return {
    top: `${topAdjust}px`,
    ...(alignLeft
      ? { right: '100%', marginRight: '2px', left: 'auto' }
      : { left: '100%', marginLeft: '2px', right: 'auto' }),
  }
}

function onSubmenuEnter(el: Element, done: () => void) {
  const isLeft = (el as HTMLElement).style.right === '100%'
  const startX = isLeft ? 8 : -8

  gsap.set(el, { transformOrigin: isLeft ? 'right top' : 'left top' })
  gsap.fromTo(
    el,
    { opacity: 0, x: startX, scale: 0.96 },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.1)',
      onComplete: () => {
        gsap.set(el, { clearProps: 'transform,x,scale' })
        done()
      },
    },
  )

  // Submenu items stagger
  const items = el.querySelectorAll('button, .h-px')
  if (items.length > 0) {
    gsap.fromTo(
      items,
      { opacity: 0, x: isLeft ? 5 : -5 },
      {
        opacity: 1,
        x: 0,
        duration: 0.25,
        stagger: 0.02,
        ease: 'power3.out',
        delay: 0.05,
        clearProps: 'transform,x,opacity',
      },
    )
  }
}

function onSubmenuLeave(el: Element, done: () => void) {
  const isLeft = (el as HTMLElement).style.right === '100%'
  const endX = isLeft ? 4 : -4
  gsap.to(el, {
    opacity: 0,
    x: endX,
    scale: 0.98,
    duration: 0.15,
    ease: 'power3.inOut',
    onComplete: done,
  })
}
</script>

<template>
  <div class="flex flex-col gap-0.5 w-full">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="relative"
      @mouseenter="handleMouseEnter(item)"
      @mouseleave="handleMouseLeave(item)"
    >
      <!-- 分隔线 -->
      <div v-if="'type' in item && item.type === 'separator'" class="h-px bg-border/50 my-1 mx-1" />

      <!-- 菜单动作按钮 -->
      <button
        v-else
        :disabled="(item as any).disabled"
        class="w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none text-left cursor-pointer transition-colors duration-150 font-medium group"
        :class="{ 'bg-accent text-accent-foreground': hoveredItemId === (item as any).id }"
        @click="handleActionClick(item)"
      >
        <div class="flex items-center gap-2">
          <component
            :is="(item as any).icon"
            v-if="(item as any).icon"
            class="size-4 opacity-70 menu-icon"
          />
          <span>{{ (item as any).label }}</span>
        </div>
        <ChevronRight
          v-if="(item as any).children || (item as any).panelComponent"
          class="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity"
        />
      </button>

      <!-- 二级菜单/自定义悬浮面板 -->
      <Transition @enter="onSubmenuEnter" @leave="onSubmenuLeave" :css="false">
        <div
          v-if="
            hoveredItemId === (item as any).id &&
            ((item as any).children || (item as any).panelComponent)
          "
          :ref="(el) => setSubmenuRef((item as any).id, el)"
          class="absolute z-[10000] min-w-[180px] bg-popover/90 backdrop-blur-md text-popover-foreground rounded-lg border border-border/80 shadow-lg p-1.5 outline-none select-none"
          :style="getSubmenuStyle((item as any).id)"
          @mouseenter="handleSubmenuMouseEnter"
        >
          <!-- 递归嵌套菜单列表 -->
          <ContextMenuList
            v-if="(item as any).children"
            :items="(item as any).children"
            @action-click="handleActionClick"
          />

          <!-- 自定义悬浮面板组件 -->
          <component
            v-else-if="(item as any).panelComponent"
            :is="(item as any).panelComponent"
            v-bind="(item as any).panelProps"
            :close-menu="handleClose"
            @close="handleClose"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.group:hover .menu-icon :deep(path),
.group:hover .menu-icon :deep(circle),
.group:hover .menu-icon :deep(line),
.group:hover .menu-icon :deep(polyline),
.group:hover .menu-icon :deep(polygon),
.group:hover .menu-icon :deep(rect) {
  stroke-dasharray: 100;
  animation: smooth-draw 0.5s linear forwards;
}

@keyframes smooth-draw {
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    stroke-dashoffset: 76;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}
</style>

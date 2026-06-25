<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useContextMenuStore } from './context-menu-store'
import ContextMenuList from './components/ContextMenuList.vue'

const store = useContextMenuStore()
const menuRef = ref<HTMLElement | null>(null)

const computedX = ref(0)
const computedY = ref(0)

watch(
  () => store.visible,
  async (visible) => {
    if (visible) {
      // 1. 第一帧先直接定位到鼠标位置，防止初次渲染的闪烁或从左上角/旧位置飞入
      computedX.value = store.x
      computedY.value = store.y

      await nextTick()
      if (!menuRef.value) return

      const menuWidth = menuRef.value.offsetWidth
      const menuHeight = menuRef.value.offsetHeight
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      let targetX = store.x
      let targetY = store.y

      // 视口越界校正
      if (targetX + menuWidth > windowWidth) {
        targetX = Math.max(8, targetX - menuWidth)
      } else {
        targetX = Math.max(8, targetX)
      }
      if (targetY + menuHeight > windowHeight) {
        targetY = Math.max(8, targetY - menuHeight)
      } else {
        targetY = Math.max(8, targetY)
      }

      computedX.value = targetX
      computedY.value = targetY
    }
  },
)

function handleActionClick(item: any) {
  if (item.onClick) {
    item.onClick()
  }
}

async function onEnter(el: Element, done: () => void) {
  // 确保位置计算已经完成
  await nextTick()
  await nextTick()

  const originX = computedX.value < store.x ? 'right' : 'left'
  const originY = computedY.value < store.y ? 'bottom' : 'top'

  gsap.set(el, { transformOrigin: `${originX} ${originY}` })

  const yOffset = originY === 'top' ? -4 : 4
  const xOffset = originX === 'left' ? -4 : 4

  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.92, y: yOffset, x: xOffset },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      duration: 0.35,
      ease: 'back.out(1.2)',
      onComplete: () => {
        gsap.set(el, { clearProps: 'transform,scale,x,y' })
        done()
      },
    }
  )

  // 菜单项级联错开进场动画 (Stagger)
  const items = el.querySelectorAll('button, .h-px')
  if (items.length > 0) {
    gsap.fromTo(
      items,
      { opacity: 0, x: originX === 'left' ? -8 : 8 },
      {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.02,
        ease: 'power3.out',
        delay: 0.05,
        clearProps: 'transform,x,opacity'
      }
    )
  }
}

function onLeave(el: Element, done: () => void) {
  const originX = computedX.value < store.x ? 'right' : 'left'
  const originY = computedY.value < store.y ? 'bottom' : 'top'

  const yOffset = originY === 'top' ? -4 : 4
  const xOffset = originX === 'left' ? -4 : 4

  gsap.to(el, {
    opacity: 0,
    scale: 0.95,
    y: yOffset,
    x: xOffset,
    duration: 0.15,
    ease: 'power3.inOut',
    onComplete: done,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      @enter="onEnter"
      @leave="onLeave"
      :css="false"
    >
      <div
        v-if="store.visible"
        id="global-context-menu-container"
        ref="menuRef"
        class="fixed z-[9999] min-w-[180px] bg-popover/90 backdrop-blur-md text-popover-foreground rounded-lg border border-border/80 shadow-lg p-1.5 outline-none select-none origin-top-left"
        :style="{
          left: computedX + 'px',
          top: computedY + 'px',
        }"
      >
        <ContextMenuList :items="store.menus" @action-click="handleActionClick" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
#global-context-menu-container button {
  outline: none;
}
</style>


<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
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
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="store.visible"
        id="global-context-menu-container"
        ref="menuRef"
        class="fixed z-[9999] min-w-[180px] bg-popover/90 backdrop-blur-md text-popover-foreground rounded-lg border border-border/80 shadow-lg p-1.5 outline-none select-none transition-[opacity,transform] duration-100 ease-out origin-top-left"
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


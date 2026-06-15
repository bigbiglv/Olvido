<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useContextMenuStore } from './context-menu-store'

const store = useContextMenuStore()
const menuRef = ref<HTMLElement | null>(null)

const computedX = ref(0)
const computedY = ref(0)

watch(
  () => store.visible,
  async (visible) => {
    if (visible) {
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
  }
)
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
        class="fixed z-[9999] min-w-[180px] bg-popover/90 backdrop-blur-md text-popover-foreground rounded-lg border border-border/80 shadow-lg p-1.5 outline-none select-none transition-all"
        :style="{
          left: computedX + 'px',
          top: computedY + 'px'
        }"
      >
        <div v-for="(item, index) in store.menus" :key="index">
          <div
            v-if="'type' in item && item.type === 'separator'"
            class="h-px bg-border/50 my-1 mx-1"
          />
          <button
            v-else
            :disabled="(item as any).disabled"
            class="w-full flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none text-left cursor-pointer transition-colors duration-150 font-medium"
            @click="(item as any).onClick"
          >
            {{ (item as any).label }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 可以在这里加入进一步的微交互效果 */
#global-context-menu-container button {
  outline: none;
}
</style>

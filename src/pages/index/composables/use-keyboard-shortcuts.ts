import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useSearchStore } from '@/features/search/stores/search.store'
import SearchDialog from '@/features/search/components/SearchDialog.vue'
import { Dialog } from '@/components/dialog'

/**
 * 注册全局键盘快捷键（如 Ctrl+F 打开搜索面板）
 */
export function useKeyboardShortcuts() {
  const appStore = useAppStore()
  const searchStore = useSearchStore()

  function handleGlobalKeydown(e: KeyboardEvent) {
    const isF = e.key === 'f' || e.key === 'F'
    if (e.ctrlKey && isF) {
      e.preventDefault()

      if (searchStore.isOpen) {
        if (e.shiftKey) {
          searchStore.projectId = undefined
        } else {
          searchStore.projectId = appStore.currentProject || 'global'
        }

        const inputEl = document.querySelector(
          'input[placeholder="输入关键词搜索..."]',
        ) as HTMLInputElement
        if (inputEl) {
          inputEl.focus()
          inputEl.select()
        }
        return
      }

      if (e.shiftKey) {
        searchStore.openGlobalSearch()
      } else {
        searchStore.openProjectSearch(appStore.currentProject)
      }
      Dialog.show(SearchDialog)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleGlobalKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeydown)
  })
}

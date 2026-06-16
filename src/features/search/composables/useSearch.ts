import { ref, computed, watch, onUnmounted } from 'vue'
import { useSearchStore } from '../stores/search.store'
import { useDocumentsStore } from '@/stores/documents'
import type { SearchResult, SearchItem } from '../types/search'
import { Dialog } from '@/components/dialog'
import NotePreviewDialog from '../components/NotePreviewDialog.vue'

export function useSearch() {
  const store = useSearchStore()
  const documentsStore = useDocumentsStore()

  const results = ref<SearchResult>({ titleMatches: [], contentMatches: [] })
  const loading = ref(false)

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  // 扁平化搜索结果，便于键盘导航（titleMatches 排在前面，contentMatches 排在后面）
  const flatResults = computed(() => {
    return [...results.value.titleMatches, ...results.value.contentMatches]
  })

  // 执行搜索
  const performSearch = async () => {
    const keyword = store.keyword.trim()
    if (keyword.length < 1) {
      results.value = { titleMatches: [], contentMatches: [] }
      store.selectedIndex = 0
      return
    }

    loading.value = true
    try {
      const res = await window.api.search.list({
        keyword,
        projectId: store.projectId,
      })
      results.value = res
      store.selectedIndex = 0
    } catch (error) {
      console.error('Failed to perform search:', error)
    } finally {
      loading.value = false
    }
  }

  // 监听关键词和项目过滤的变化，带 300ms 防抖
  watch(
    () => [store.keyword, store.projectId],
    () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      searchTimeout = setTimeout(() => {
        performSearch()
      }, 300)
    },
  )

  onUnmounted(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  })

  // 键盘向上导航
  const moveUp = () => {
    const len = flatResults.value.length
    if (len === 0) return
    store.selectedIndex = (store.selectedIndex - 1 + len) % len
  }

  // 键盘向下导航
  const moveDown = () => {
    const len = flatResults.value.length
    if (len === 0) return
    store.selectedIndex = (store.selectedIndex + 1) % len
  }

  // 选择并打开笔记
  const selectItem = async (item: SearchItem) => {
    try {
      const result = await Dialog.show<string>(NotePreviewDialog, { item })

      if (result === 'edit') {
        // 获取该笔记最新的完整详情（以此确认其真正的 deadline 和分类）
        const note = await window.api.note.get(item.id)
        if (note) {
          // 关闭搜索面板
          store.closeSearch()

          // 切换项目与分类，并且选中该笔记（使用 switchProjectAndCategory 避免选中状态被清理）
          documentsStore.switchProjectAndCategory(
            note.projectId === 'global' ? null : note.projectId,
            note.deadline ? '需求' : '日常',
            note.id,
          )
        }
      }
    } catch (err) {
      if (err === 'cancel' || err === 'close' || err === 'close-all') {
        return
      }
      console.error('Failed to select and open note:', err)
    }
  }

  // 按 Enter 键打开当前选中的搜索项
  const handleEnter = () => {
    const index = store.selectedIndex
    const item = flatResults.value[index]
    if (item) {
      selectItem(item)
    }
  }

  return {
    results,
    loading,
    flatResults,
    moveUp,
    moveDown,
    selectItem,
    handleEnter,
  }
}

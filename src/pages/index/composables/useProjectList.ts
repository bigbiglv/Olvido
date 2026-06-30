import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  apiList,
  apiCreate,
  apiUpdate,
  apiDelete,
  apiDeletes,
  apiReorder,
} from '@/apis/project'
import { confirm } from '@/components/confirm'
import type { ProjectDto } from '../../../../electron/types/project'
import type { ReorderEvent } from '@/components/ui/draggableList/types'
import { isElectron } from '@/utils/env'
import { contextMenuManager } from '@/context-menu/context-menu-manager'
import { Edit, Trash2, FolderPlus, RefreshCw } from 'lucide-vue-next'

export function useProjectList() {
  const appStore = useAppStore()

  /** 本地项目列表数据 */
  const projects = ref<ProjectDto[]>([])

  /** 是否显示行内新建项目输入框 */
  const showAddProject = ref(false)
  const newProjectName = ref('')
  const listSelectedIds = ref<string[]>([])
  
  /** 正在重命名的项目 ID */
  const renamingProjectId = ref<string | null>(null)

  /** 是否处于创建项目的请求过程中（防重锁） */
  const isAdding = ref(false)
  /** 新建项目请求的超时定时器句柄 */
  let addTimeout: number | undefined

  // 挂载时加载项目列表并注册右键菜单
  onMounted(async () => {
    await fetchProjects()

    contextMenuManager.register({
      type: 'project',
      getMenus: (context) => {
        const proj = context.data as ProjectDto
        const isMultiSelected = listSelectedIds.value.includes(proj.id) && listSelectedIds.value.length > 1
        
        const menus = []
        
        if (!isMultiSelected) {
          menus.push({
            id: 'rename',
            label: '重命名',
            icon: Edit,
            onClick: () => {
              handleRenameProject(proj)
            },
          })
        }
        
        menus.push({
          id: 'delete',
          label: '删除',
          icon: Trash2,
          onClick: () => {
            handleDeleteProject(proj)
          },
        })
        
        return menus
      },
    })

    contextMenuManager.register({
      type: 'project-background',
      priority: 100,
      getMenus: () => {
        return [
          {
            id: 'add-project',
            label: '新建',
            icon: FolderPlus,
            onClick: () => {
              showAddProject.value = true
            },
          },
          {
            id: 'refresh',
            label: '刷新',
            icon: RefreshCw,
            onClick: () => {
              fetchProjects()
            },
          },
        ]
      },
    })
    
    window.addEventListener('keydown', handleGlobalKeydown)
  })

  // 卸载时注销右键菜单和事件监听
  onUnmounted(() => {
    contextMenuManager.unregister('project')
    contextMenuManager.unregister('project-background')
    window.removeEventListener('keydown', handleGlobalKeydown)
  })

  function handleGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'F2') {
      // 如果当前焦点在输入框或可编辑区域，则忽略快捷键
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      if (listSelectedIds.value.length === 1) {
        const selectedId = listSelectedIds.value[0]
        if (selectedId !== 'global') {
          const proj = projects.value.find((p) => p.id === selectedId)
          if (proj) {
            e.preventDefault()
            handleRenameProject(proj)
          }
        }
      }
    }
  }

  /**
   * 处理项目右键菜单展示
   */
  function handleContextMenu(event: MouseEvent, proj: ProjectDto) {
    contextMenuManager.show(event, proj)
  }

  /**
   * 处理项目列表背景右键菜单展示
   */
  function handleBackgroundContextMenu(event: MouseEvent) {
    contextMenuManager.show(event, { type: 'project-background' })
  }

  /**
   * 从 SQLite 数据库中获取项目列表
   */
  async function fetchProjects() {
    if (isElectron) {
      try {
        const list = await apiList()
        // 过滤掉数据库内置的 global 笔记本项目，避免与顶部的“笔记本”选项重复
        projects.value = list.filter((p) => p.id !== 'global')
      } catch (error) {
        console.error('Failed to fetch projects from database:', error)
      } finally {
        // 满足异步 try-catch-finally 块规范
      }
    }
  }

  /**
   * 切换选中的项目
   * @param projectId 项目唯一标识（null 表示全局记事本）
   */
  function handleSelectProject(projectId: string | null) {
    appStore.currentProject = projectId
    listSelectedIds.value = projectId ? [projectId] : ['global']
  }

  function handleProjectSelectionChange(ids: string[]) {
    listSelectedIds.value = ids
  }

  function handleGlobalClick(event: MouseEvent) {
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      listSelectedIds.value = ['global']
    } else {
      listSelectedIds.value = ['global']
      handleSelectProject(null)
    }
  }

  function handleGlobalDblClick() {
    handleSelectProject(null)
  }

  /**
   * 拖拽排序完成处理
   */
  async function handleReorderProjects(event: ReorderEvent<ProjectDto>) {
    const { items: newItems, movedIds } = event
    const firstMovedIndex = newItems.findIndex((item) => movedIds.includes(item.id))
    if (firstMovedIndex === -1) return

    const prevItem = firstMovedIndex > 0 ? newItems[firstMovedIndex - 1] : null
    const lastMovedIndex = firstMovedIndex + movedIds.length - 1
    const nextItem = lastMovedIndex < newItems.length - 1 ? newItems[lastMovedIndex + 1] : null

    // 立即更新本地状态
    projects.value = newItems

    if (isElectron) {
      try {
        await apiReorder({
          movedIds,
          prevId: prevItem ? prevItem.id : null,
          nextId: nextItem ? nextItem.id : null,
        })
        await fetchProjects()
      } catch (error) {
        console.error('Failed to reorder projects:', error)
      }
    }
  }

  /**
   * 提交并新建项目
   */
  async function handleAddProject() {
    const name = newProjectName.value.trim()
    if (!name) {
      showAddProject.value = false
      newProjectName.value = ''
      return
    }

    if (isAdding.value) return

    isAdding.value = true

    // 5秒超时防御，自动释放锁定状态防止 UI 卡死
    addTimeout = window.setTimeout(() => {
      if (isAdding.value) {
        isAdding.value = false
        console.warn('Add project timeout, lock released')
      }
    }, 5000)

    if (isElectron) {
      try {
        const newId = crypto.randomUUID()
        const newProj = await apiCreate({ id: newId, name })
        projects.value.unshift(newProj)
        newProjectName.value = ''
        showAddProject.value = false
        handleSelectProject(newProj.id)
      } catch (error) {
        console.error('Failed to create project:', error)
      } finally {
        isAdding.value = false
        if (addTimeout) {
          clearTimeout(addTimeout)
          addTimeout = undefined
        }
      }
    } else {
      try {
        // 网页预览模式下的 Mock 回退机制
        const newId = Math.random().toString(36).substr(2, 9)
        const newProj = { id: newId, name }
        projects.value.unshift(newProj)
        newProjectName.value = ''
        showAddProject.value = false
        handleSelectProject(newId)
      } catch {
        isAdding.value = false
        if (addTimeout) {
          clearTimeout(addTimeout)
          addTimeout = undefined
        }
      }
    }
  }

  /**
   * 取消新建项目
   */
  function cancelAddProject() {
    newProjectName.value = ''
    showAddProject.value = false
  }

  /**
   * 重命名项目操作 (仅触发状态)
   */
  function handleRenameProject(proj: ProjectDto) {
    renamingProjectId.value = proj.id
  }

  /**
   * 提交项目重命名
   */
  async function submitRenameProject(id: string, newName: string) {
    renamingProjectId.value = null
    const proj = projects.value.find(p => p.id === id)
    if (!proj) return
    
    newName = newName.trim()
    if (newName && newName !== proj.name) {
      try {
        if (isElectron) {
          await apiUpdate({ id, name: newName })
        }
        proj.name = newName
      } catch (error) {
        console.error('Failed to rename project:', error)
      }
    }
  }

  /**
   * 取消重命名
   */
  function cancelRenameProject() {
    renamingProjectId.value = null
  }

  /**
   * 删除项目操作
   */
  async function handleDeleteProject(proj: ProjectDto) {
    const isMultiDelete = listSelectedIds.value.includes(proj.id) && listSelectedIds.value.length > 1
    const idsToDelete = isMultiDelete ? [...listSelectedIds.value] : [proj.id]
    
    // 如果是多选删除，且其中包含 global，我们需要过滤掉 global
    const validIdsToDelete = idsToDelete.filter(id => id !== 'global')

    if (validIdsToDelete.length === 0) return

    const title = isMultiDelete ? '批量删除项目' : '删除项目'
    const description = isMultiDelete
      ? `将删除选定的 ${validIdsToDelete.length} 个项目及其笔记，不可恢复。`
      : `将删除 "${proj.name}" 及其笔记，不可恢复。`

    const isConfirmed = await confirm({
      title,
      description,
      destructive: true,
      okText: '删除',
      cancelText: '取消',
    })

    if (isConfirmed) {
      try {
        if (isElectron) {
          if (isMultiDelete) {
            await apiDeletes(validIdsToDelete)
          } else {
            await apiDelete(proj.id)
          }
        }
        // 从本地列表移除
        projects.value = projects.value.filter((p: ProjectDto) => !validIdsToDelete.includes(p.id))
        
        // 如果当前打开的项目在被删除的列表中，重置为全局记事本
        if (appStore.currentProject && validIdsToDelete.includes(appStore.currentProject)) {
          handleSelectProject(null)
        }
        
        // 从多选中移除这些已删除的项
        listSelectedIds.value = listSelectedIds.value.filter((id) => !validIdsToDelete.includes(id))
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  return {
    projects,
    showAddProject,
    newProjectName,
    listSelectedIds,
    renamingProjectId,
    handleAddProject,
    cancelAddProject,
    handleSelectProject,
    handleProjectSelectionChange,
    handleReorderProjects,
    handleContextMenu,
    handleBackgroundContextMenu,
    handleGlobalClick,
    handleGlobalDblClick,
    submitRenameProject,
    cancelRenameProject
  }
}

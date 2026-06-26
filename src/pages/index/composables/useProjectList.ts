import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  apiList,
  apiCreate,
  apiUpdate,
  apiDelete,
  apiReorder,
} from '@/apis/project'
import { Dialog } from '@/components/dialog'
import { confirm } from '@/components/confirm'
import RenameProjectDialog from '../components/dialogs/RenameProjectDialog.vue'
import type { ProjectDto } from '../../../../electron/types/project'
import type { ReorderEvent } from '@/components/ui/draggableList/types'
import { isElectron } from '@/utils/env'
import { contextMenuManager } from '@/context-menu/context-menu-manager'

export function useProjectList() {
  const appStore = useAppStore()

  /** 本地项目列表数据 */
  const projects = ref<ProjectDto[]>([])

  /** 是否显示行内新建项目输入框 */
  const showAddProject = ref(false)
  const newProjectName = ref('')
  const listSelectedIds = ref<string[]>([])

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
        return [
          {
            id: 'rename',
            label: '重命名',
            onClick: () => {
              handleRenameProject(proj)
            },
          },
          {
            id: 'delete',
            label: '删除',
            onClick: () => {
              handleDeleteProject(proj)
            },
          },
        ]
      },
    })
  })

  // 卸载时注销右键菜单
  onUnmounted(() => {
    contextMenuManager.unregister('project')
  })

  /**
   * 处理项目右键菜单展示
   */
  function handleContextMenu(event: MouseEvent, proj: ProjectDto) {
    contextMenuManager.show(event, proj)
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
    if (!name || isAdding.value) return

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
        projects.value.push(newProj)
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
        projects.value.push(newProj)
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
   * 重命名项目操作
   */
  async function handleRenameProject(proj: ProjectDto) {
    try {
      const newName = await Dialog.show<string>(RenameProjectDialog, { initialName: proj.name })
      if (newName) {
        if (isElectron) {
          await apiUpdate({ id: proj.id, name: newName })
        }
        proj.name = newName
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to rename project:', error)
      }
    }
  }

  /**
   * 删除项目操作
   */
  async function handleDeleteProject(proj: ProjectDto) {
    const isConfirmed = await confirm({
      title: '删除项目',
      description: `确定要删除项目 "${proj.name}" 吗？此操作无法撤销，该项目下的所有笔记也将被一并删除。`,
      destructive: true,
      okText: '确定删除',
      cancelText: '取消',
    })

    if (isConfirmed) {
      try {
        if (isElectron) {
          await apiDelete(proj.id)
        }
        // 从本地列表移除
        projects.value = projects.value.filter((p: ProjectDto) => p.id !== proj.id)
        // 如果被删除的是当前选中的项目，重置为全局记事本
        if (appStore.currentProject === proj.id) {
          handleSelectProject(null)
        }
        // 从多选中移除
        listSelectedIds.value = listSelectedIds.value.filter((id) => id !== proj.id)
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
    handleAddProject,
    handleSelectProject,
    handleProjectSelectionChange,
    handleReorderProjects,
    handleContextMenu,
    handleGlobalClick,
    handleGlobalDblClick
  }
}

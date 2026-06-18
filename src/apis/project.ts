import type { CreateProjectDto, UpdateProjectDto } from '../../electron/types/project'

export function apiList() {
  return window.api.project.list()
}

export function apiDetail(id: string) {
  return window.api.project.get(id)
}

export function apiCreate(data: CreateProjectDto) {
  return window.api.project.create(data)
}

export function apiUpdate(data: UpdateProjectDto) {
  return window.api.project.update(data)
}

export function apiDelete(id: string) {
  return window.api.project.delete(id)
}

export function apiDeletes(ids: string[]) {
  return window.api.project.batchDelete(ids)
}

export function apiReorder(data: {
  movedIds: string[]
  prevId: string | null
  nextId: string | null
}) {
  return window.api.project.reorder(data)
}

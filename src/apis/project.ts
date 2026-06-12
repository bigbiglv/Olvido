import type { CreateProjectDto, UpdateProjectDto } from '../../electron/types/project'

export function apiListProjects() {
  return window.api.project.list()
}

export function apiGetProject(id: string) {
  return window.api.project.get(id)
}

export function apiCreateProject(data: CreateProjectDto) {
  return window.api.project.create(data)
}

export function apiUpdateProject(data: UpdateProjectDto) {
  return window.api.project.update(data)
}

export function apiDeleteProject(id: string) {
  return window.api.project.delete(id)
}

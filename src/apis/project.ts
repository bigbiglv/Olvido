import type { CreateProjectDto, UpdateProjectDto } from '../../electron/types/project'

export const projectApi = {
  list() {
    return window.api.project.list()
  },

  get(id: string) {
    return window.api.project.get(id)
  },

  create(data: CreateProjectDto) {
    return window.api.project.create(data)
  },

  update(data: UpdateProjectDto) {
    return window.api.project.update(data)
  },

  delete(id: string) {
    return window.api.project.delete(id)
  },
}

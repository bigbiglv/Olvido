import type { CreateNoteDto, UpdateNoteDto } from '../../electron/types/note'

export const noteApi = {
  list(projectId: string) {
    return window.api.note.list(projectId)
  },

  get(id: string) {
    return window.api.note.get(id)
  },

  create(data: CreateNoteDto) {
    return window.api.note.create(data)
  },

  update(data: UpdateNoteDto) {
    return window.api.note.update(data)
  },

  delete(id: string) {
    return window.api.note.delete(id)
  },
}

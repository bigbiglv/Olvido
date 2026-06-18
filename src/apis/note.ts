import type { CreateNoteDto, NoteType, UpdateNoteDto } from '../../electron/types/note'

export function apiList(projectId: string, type?: NoteType) {
  return window.api.note.list(projectId, type)
}

export function apiDetail(id: string) {
  return window.api.note.get(id)
}

export function apiCreate(data: CreateNoteDto) {
  return window.api.note.create(data)
}

export function apiUpdate(data: UpdateNoteDto) {
  return window.api.note.update(data)
}

export function apiDelete(id: string) {
  return window.api.note.delete(id)
}

export function apiBatchDelete(ids: string[]) {
  return window.api.note.batchDelete(ids)
}

export function apiReorder(data: {
  movedIds: string[]
  prevId: string | null
  nextId: string | null
  projectId: string
  type: 'daily' | 'requirement'
}) {
  return window.api.note.reorder(data)
}

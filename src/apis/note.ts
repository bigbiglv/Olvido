import type { CreateNoteDto, UpdateNoteDto } from '../../electron/types/note'

export function apiListNotes(projectId: string, type?: 'daily' | 'requirement' | 'archived') {
  return window.api.note.list(projectId, type)
}

export function apiGetNote(id: string) {
  return window.api.note.get(id)
}

export function apiCreateNote(data: CreateNoteDto) {
  return window.api.note.create(data)
}

export function apiUpdateNote(data: UpdateNoteDto) {
  return window.api.note.update(data)
}

export function apiDeleteNote(id: string) {
  return window.api.note.delete(id)
}

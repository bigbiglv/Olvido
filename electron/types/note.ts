export interface NoteDto {
  id: string
  projectId: string
  title: string
  content: string
  deadline: Date | null
  isArchived: boolean
  sort: number
  createdAt: Date
  updatedAt: Date
}

export interface SaveNoteDto {
  id?: string
  projectId: string
  title: string
  content: string
  deadline?: Date | null
  isArchived?: boolean
  sort?: number
}

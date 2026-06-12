export interface SaveDocumentDto {
  id?: string
  title: string
  content: string
  category?: string
  project?: string | null
  completed?: boolean
}

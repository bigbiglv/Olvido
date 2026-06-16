export type SearchMatchType = 'title' | 'content'

export interface SearchRequest {
  keyword: string
  projectId?: string // undefined = 全部项目, 'global' = 全局笔记本, UUID = 指定项目
  limit?: number // 默认 50，最大 200
}

export interface SearchResult {
  titleMatches: SearchItem[]
  contentMatches: SearchItem[]
}

export interface SearchItem {
  id: string // 笔记唯一ID，内容为 noteId
  projectId: string
  projectName: string
  title: string
  matchType: SearchMatchType
  snippet?: string
  createdAt: string
  isArchived?: boolean
}

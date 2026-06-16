import { prisma } from '../prisma/client'
import type { SearchRequest, SearchResult, SearchItem } from '../types/search'

interface SearchItemRaw {
  noteId: string
  projectId: string
  projectName: string
  title: string
  content: string
  createdAt: Date | string
  isArchived: boolean | number
  rank: number
}

export class SearchService {
  async query(request: SearchRequest): Promise<SearchResult> {
    const { keyword, projectId, limit = 50 } = request

    if (!keyword || keyword.trim().length === 0) {
      return { titleMatches: [], contentMatches: [] }
    }

    const terms = keyword.trim().split(/\s+/).filter(Boolean)
    if (terms.length === 0) {
      return { titleMatches: [], contentMatches: [] }
    }

    // 对于单字（Unigram）空格分词，我们将搜索词的每个字拆分成以空格分隔的独立 Token，并包裹在双引号中做 Phrase MATCH 查询。
    // 例如："南疆" -> "南 疆" -> MATCH '"南 疆"'。
    const ftsQuery = terms
      .map((term) => {
        const cleanTerm = term.replace(/["*]/g, '')
        const segmented = [...cleanTerm].join(' ')
        return `"${segmented}"`
      })
      .join(' ')

    // Limit bound checks (default 50, max 200)
    const queryLimit = Math.min(200, Math.max(1, limit))

    try {
      // 1. Title matches query (ordered by rank/BM25 relevance score asc, then createdAt DESC)
      let titleSql = `
        SELECT n.id as noteId, n.projectId, p.name as projectName, n.title, n.content, n.createdAt, n.isArchived, f.rank
        FROM Note n
        JOIN Project p ON n.projectId = p.id
        JOIN notes_fts f ON n.id = f.id
        WHERE f.title MATCH ?
      `
      const titleParams: unknown[] = [ftsQuery]
      if (projectId) {
        titleSql += ` AND f.projectId = ? `
        titleParams.push(projectId)
      }
      titleSql += ` ORDER BY f.rank ASC, n.createdAt DESC LIMIT ? `
      titleParams.push(queryLimit)

      const titleRaw = await prisma.$queryRawUnsafe<SearchItemRaw[]>(titleSql, ...titleParams)

      // 2. Content matches query
      let contentSql = `
        SELECT n.id as noteId, n.projectId, p.name as projectName, n.title, n.content, n.createdAt, n.isArchived, f.rank
        FROM Note n
        JOIN Project p ON n.projectId = p.id
        JOIN notes_fts f ON n.id = f.id
        WHERE f.content MATCH ?
      `
      const contentParams: unknown[] = [ftsQuery]
      if (projectId) {
        contentSql += ` AND f.projectId = ? `
        contentParams.push(projectId)
      }
      contentSql += ` ORDER BY f.rank ASC, n.createdAt DESC LIMIT ? `
      contentParams.push(queryLimit)

      const contentRaw = await prisma.$queryRawUnsafe<SearchItemRaw[]>(contentSql, ...contentParams)

      // Helper function to format items
      const formatItem = (item: SearchItemRaw, isContentMatch: boolean): SearchItem => {
        const createdAtStr =
          item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt)

        const searchItem: SearchItem = {
          id: item.noteId,
          projectId: item.projectId,
          projectName: item.projectName,
          title: item.title,
          matchType: isContentMatch ? 'content' : 'title',
          createdAt: createdAtStr,
          isArchived: item.isArchived === 1 || item.isArchived === true,
        }

        if (isContentMatch) {
          searchItem.snippet = generateSnippet(item.content, keyword)
        }

        return searchItem
      }

      const titleMatches = titleRaw.map((item) => formatItem(item, false))

      // Deduplicate content matches (if already matched in title, don't repeat in content matches)
      const titleNoteIds = new Set(titleMatches.map((m) => m.id))
      const contentMatches = contentRaw
        .filter((item) => !titleNoteIds.has(item.noteId))
        .map((item) => formatItem(item, true))

      return {
        titleMatches,
        contentMatches,
      }
    } catch (error) {
      console.error('Failed to execute search:list query:', error)
      throw error
    }
  }
}

function generateSnippet(content: string, keyword: string, length = 100): string {
  // Strip basic markdown syntax to get cleaner plain text
  const plainText = content
    .replace(/[#*`_~]/g, '') // remove headings, bold, italic, code, strikethrough chars
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // replace links with link text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // remove images
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim()

  if (plainText.length <= length) {
    return plainText
  }

  // Split keyword into terms and find the first term's index
  const terms = keyword.trim().split(/\s+/).filter(Boolean)
  let index = -1
  if (terms.length > 0) {
    index = plainText.toLowerCase().indexOf(terms[0].toLowerCase())
  }

  if (index === -1) {
    return plainText.substring(0, length) + '...'
  }

  const start = Math.max(0, index - Math.floor(length / 2))
  const end = Math.min(plainText.length, start + length)

  let snippet = plainText.substring(start, end)

  if (start > 0) {
    snippet = '...' + snippet
  }
  if (end < plainText.length) {
    snippet = snippet + '...'
  }

  return snippet
}

export const searchService = new SearchService()

/** 笔记基本数据结构 */
export interface NoteDto {
  /** 笔记唯一标识，由数据库自动生成 cuid */
  id: string
  /** 关联的项目唯一标识 */
  projectId: string
  /** 笔记标题 */
  title: string
  /** 笔记内容，以 Markdown 格式保存 */
  content: string
  /** 截止日期，null 表示无截止日期 */
  deadline: Date | null
  /** 是否已被归档 */
  isArchived: boolean
  /** 排序权重，数值越小越靠前 */
  sortOrder: number
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

/** 创建笔记数据传输对象 */
export interface CreateNoteDto {
  /** 关联的项目唯一标识 */
  projectId: string
  /** 笔记标题 */
  title: string
  /** 笔记内容 */
  content: string
  /** 截止日期 */
  deadline?: Date | null
  /** 是否归档，默认值为 false */
  isArchived?: boolean
  /** 排序权重，默认值为 0 */
  sortOrder?: number
}

/** 更新笔记数据传输对象 */
export interface UpdateNoteDto {
  /** 待更新笔记的唯一标识 */
  id: string
  /** 关联的项目唯一标识 */
  projectId?: string
  /** 笔记标题 */
  title?: string
  /** 笔记内容 */
  content?: string
  /** 截止日期 */
  deadline?: Date | null
  /** 是否已归档 */
  isArchived?: boolean
  /** 排序权重 */
  sortOrder?: number
}

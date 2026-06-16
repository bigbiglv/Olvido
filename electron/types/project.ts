/** 项目基本数据结构 */
export interface ProjectDto {
  /** 项目唯一标识，通常由客户端生成 UUID/cuid */
  id: string
  /** 项目名称 */
  name: string
  /** 排序权重，数值越小越靠前 */
  sortOrder?: number
}

/** 创建项目数据传输对象 */
export interface CreateProjectDto {
  /** 项目唯一标识，必须由客户端生成并提供 */
  id: string
  /** 项目名称 */
  name: string
  /** 排序权重，数值越小越靠前 */
  sortOrder?: number
}

/** 更新项目数据传输对象 */
export interface UpdateProjectDto {
  /** 待更新项目的唯一标识 */
  id: string
  /** 更新后的项目名称 */
  name?: string
  /** 更新后的排序权重 */
  sortOrder?: number
}

/** 项目 IPC 频道常量 */
export const PROJECT_CHANNELS = {
  /** 获取项目列表 */
  LIST: 'project:list',
  /** 获取单个项目 */
  GET: 'project:get',
  /** 创建项目 */
  CREATE: 'project:create',
  /** 更新项目 */
  UPDATE: 'project:update',
  /** 删除项目 */
  DELETE: 'project:delete',
} as const

/** 笔记 IPC 频道常量 */
export const NOTE_CHANNELS = {
  /** 获取笔记列表 */
  LIST: 'note:list',
  /** 获取单个笔记 */
  GET: 'note:get',
  /** 创建笔记 */
  CREATE: 'note:create',
  /** 更新笔记 */
  UPDATE: 'note:update',
  /** 删除笔记 */
  DELETE: 'note:delete',
} as const

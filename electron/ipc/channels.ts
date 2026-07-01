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
  /** 批量删除笔记 */
  BATCH_DELETE: 'project:batch-delete',
  /** 重新排序项目 */
  REORDER: 'project:reorder',
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
  /** 批量删除笔记 */
  BATCH_DELETE: 'note:batch-delete',
  /** 重新排序笔记 */
  REORDER: 'note:reorder',
} as const

/** 更新器 IPC 频道常量 */
export const UPDATER_CHANNELS = {
  CHECK: 'updater:check',
  DOWNLOAD: 'updater:download',
  INSTALL: 'updater:install',
  ON_UPDATE_AVAILABLE: 'updater:update-available',
  ON_UPDATE_NOT_AVAILABLE: 'updater:update-not-available',
  ON_DOWNLOAD_PROGRESS: 'updater:download-progress',
  ON_UPDATE_DOWNLOADED: 'updater:update-downloaded',
  ON_ERROR: 'updater:error',
} as const

/** Config IPC 频道常量 */
export const CONFIG_CHANNELS = {
  GET: 'config:get',
  UPDATE: 'config:update',
  RESET: 'config:reset',
} as const

/** System IPC 频道常量 */
export const SYSTEM_CHANNELS = {
  GET_USER_DATA_DIR: 'system:get-user-data-dir',
  OPEN_USER_DATA_DIR: 'system:open-user-data-dir',
} as const

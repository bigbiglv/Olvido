/**
 * 是否为 Electron 运行环境
 */
export const isElectron = typeof window !== 'undefined' && window.api !== undefined

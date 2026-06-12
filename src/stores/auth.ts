import { defineStore } from 'pinia'

import {
  fetchCurrentUser,
  login as requestLogin,
  logout as requestLogout,
  type AuthLoginParams,
} from '@/services/auth'

export interface AuthUser {
  id: string | number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
  roles?: string[]
  permissions?: string[]
}

export interface AuthTokenPayload {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresAt?: number
}

export interface AuthSessionPayload extends AuthTokenPayload {
  user?: AuthUser | null
}

interface AuthState {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresAt: number | null
  user: AuthUser | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: '',
    refreshToken: '',
    tokenType: 'Bearer',
    expiresAt: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) =>
      Boolean(state.accessToken && (!state.expiresAt || Date.now() < state.expiresAt)),
    authorizationHeader: (state) => {
      if (!state.accessToken) {
        return ''
      }

      return `${state.tokenType} ${state.accessToken}`.trim()
    },
  },
  actions: {
    isTokenExpired() {
      return Boolean(this.expiresAt && Date.now() >= this.expiresAt)
    },
    hasValidToken() {
      return Boolean(this.accessToken && !this.isTokenExpired())
    },
    setToken(payload: AuthTokenPayload) {
      this.accessToken = payload.accessToken
      this.refreshToken = payload.refreshToken ?? ''
      this.tokenType = payload.tokenType ?? 'Bearer'
      this.expiresAt = payload.expiresAt ?? null
    },
    setUser(user: AuthUser | null) {
      this.user = user
    },
    setSession(payload: AuthSessionPayload) {
      this.setToken(payload)

      if (payload.user !== undefined) {
        this.user = payload.user
      }
    },
    updateUser(user: Partial<AuthUser>) {
      if (!this.user) {
        return
      }

      this.user = {
        ...this.user,
        ...user,
      }
    },
    hasRole(role: string) {
      return Boolean(this.user?.roles?.includes(role))
    },
    hasPermission(permission: string) {
      return Boolean(this.user?.permissions?.includes(permission))
    },
    async login(payload: AuthLoginParams) {
      const session = await requestLogin(payload)

      this.setSession(session)

      return session
    },
    async fetchUser() {
      const user = await fetchCurrentUser()

      this.setUser(user)

      return user
    },
    async logout() {
      try {
        if (this.accessToken) {
          await requestLogout()
        }
      } finally {
        this.clearSession()
      }
    },
    clearSession() {
      this.accessToken = ''
      this.refreshToken = ''
      this.tokenType = 'Bearer'
      this.expiresAt = null
      this.user = null
    },
  },
  persist: {
    key: 'frameai-auth',
    // 只持久化恢复登录态必需的数据，运行时派生状态交给 getter 处理。
    pick: ['accessToken', 'refreshToken', 'tokenType', 'expiresAt', 'user'],
  },
})

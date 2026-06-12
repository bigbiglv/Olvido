import axios from 'axios'

import { useAuthStore } from '@/stores/auth'

// 各环境通过 .env.* 独立配置接口地址，空值回退到当前域名根路径。
const apiBaseURL = (import.meta.env.VITE_API_BASE_URL ?? '').trim() || '/'

export const http = axios.create({
  baseURL: apiBaseURL,
  timeout: 20_000,
})

export function setupHttpInterceptors() {
  http.interceptors.request.use((config) => {
    const authStore = useAuthStore()
    const authorization = authStore.authorizationHeader

    if (authorization && authStore.hasValidToken()) {
      config.headers.Authorization = authorization
    }

    return config
  })
}

http.interceptors.response.use(
  (response) => {
    const responseData = response.data as { code?: number } | undefined

    if (responseData?.code === 401) {
      useAuthStore().clearSession()
    }

    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore().clearSession()
    }

    return Promise.reject(error)
  },
)

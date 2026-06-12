import type { AxiosResponse } from 'axios'

import { http } from './http'

import type { AuthSessionPayload, AuthUser } from '@/stores/auth'

export interface AuthLoginParams {
  account: string
  password: string
  rememberMe?: boolean
}

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>) {
  const { data } = response

  if (data.code !== 0) {
    throw new Error(data.message || '请求失败')
  }

  return data.data
}

export async function login(params: AuthLoginParams) {
  const response = await http.post<ApiResponse<AuthSessionPayload>>('/auth/login', params)

  return unwrapResponse(response)
}

export async function fetchCurrentUser() {
  const response = await http.get<ApiResponse<AuthUser>>('/auth/me')

  return unwrapResponse(response)
}

export async function logout() {
  const response = await http.post<ApiResponse<null>>('/auth/logout')

  unwrapResponse(response)
}

import Mock from 'mockjs'

import type { AuthSessionPayload, AuthUser } from '@/stores/auth'

interface MockRequestOptions {
  body: unknown
}

interface AuthLoginBody {
  account?: string
  password?: string
  rememberMe?: boolean
}

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const tokenUserMap = new Map<string, AuthUser>()

const defaultPermissions = ['project:read', 'project:create', 'video:generate', 'asset:upload']

function success<T>(data: T, message = 'ok'): ApiResponse<T> {
  return {
    code: 0,
    data,
    message,
  }
}

function fail(code: number, message: string): ApiResponse<null> {
  return {
    code,
    data: null,
    message,
  }
}

function parseBody<T extends object>(body: unknown): T {
  if (typeof body !== 'string') {
    return {} as T
  }

  try {
    return JSON.parse(body) as T
  } catch {
    return {} as T
  }
}

function createUser(account: string): AuthUser {
  const normalizedAccount = account.trim()
  const username = normalizedAccount || 'creator'

  return {
    id: Mock.Random.guid(),
    username,
    nickname: username === 'admin' ? 'FrameAI 管理员' : `${username} 创作者`,
    email: username.includes('@') ? username : `${username}@frameai.local`,
    avatar: Mock.Random.dataImage('96x96', username.slice(0, 1).toUpperCase()),
    roles: username === 'admin' ? ['admin'] : ['creator'],
    permissions: defaultPermissions,
  }
}

function createSession(user: AuthUser, rememberMe = true): AuthSessionPayload {
  const accessToken = `mock-access-${user.id}-${Mock.Random.guid()}`
  const refreshToken = `mock-refresh-${user.id}-${Mock.Random.guid()}`
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000

  tokenUserMap.set(accessToken, user)

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresAt: Date.now() + maxAge,
    user,
  }
}

function readPersistedUser(): AuthUser | null {
  const rawSession = window.localStorage.getItem('frameai-auth')

  if (!rawSession) {
    return null
  }

  try {
    const session = JSON.parse(rawSession) as Partial<AuthSessionPayload>

    return session.user ?? null
  } catch {
    return null
  }
}

export function setupAuthMock() {
  Mock.setup({
    timeout: '300-700',
  })

  // 目前只模拟登录态闭环所需接口，后续接真实后端时保持响应结构一致即可替换。
  Mock.mock(/(?:\/api)?\/auth\/login$/, 'post', (options: MockRequestOptions) => {
    const body = parseBody<AuthLoginBody>(options.body)
    const account = body.account?.trim()

    if (!account || !body.password) {
      return fail(400, '请输入账号和密码')
    }

    const user = createUser(account)

    return success(createSession(user, body.rememberMe), '登录成功')
  })

  Mock.mock(/(?:\/api)?\/auth\/me$/, 'get', () => {
    const user = readPersistedUser()

    if (!user) {
      return fail(401, '登录状态已失效')
    }

    return success(user)
  })

  Mock.mock(/(?:\/api)?\/auth\/logout$/, 'post', () => success(null, '退出成功'))
}

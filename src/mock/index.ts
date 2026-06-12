import { setupAuthMock } from './modules/auth'

let isMockReady = false

export function setupMock() {
  if (isMockReady) {
    return
  }

  setupAuthMock()
  isMockReady = true
}

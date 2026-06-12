import type { App } from 'vue'

import { createPinia } from 'pinia'
import { router } from '@/router'
import { useAppStore } from '@/stores/app'

export function setupApp(app: App) {
  const pinia = createPinia()
  app.use(pinia)

  const appStore = useAppStore()

  appStore.setupThemeSync()
  app.use(router)
}

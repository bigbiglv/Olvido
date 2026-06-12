import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from '@/router'
import { useAppStore } from '@/stores/app'
import './styles/globals.css'

async function bootstrap() {
  const app = createApp(App)

  const pinia = createPinia()
  app.use(pinia)

  const appStore = useAppStore()
  appStore.setupThemeSync()

  app.use(router)

  app.mount('#app')
}

void bootstrap()

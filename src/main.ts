import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { useAppStore } from '@/stores/app'
import { useConfigStore } from '@/stores/config'
import './styles/globals.css'

async function bootstrap() {
  const app = createApp(App)

  const pinia = createPinia()
  app.use(pinia)

  const configStore = useConfigStore()
  await configStore.loadConfig()

  const appStore = useAppStore()
  appStore.setupThemeSync()

  app.mount('#app')
}

void bootstrap()

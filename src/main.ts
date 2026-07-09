import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { useAppStore } from '@/stores/app'
import { useConfigStore } from '@/stores/config'
import './styles/globals.css'

import { Dialog } from '@/components/dialog'
import ErrorDialog from '@/components/dialogs/ErrorDialog.vue'

function showErrorDialog(error: unknown) {
  Dialog.show(ErrorDialog, { error })
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  showErrorDialog(event.reason)
})

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
  showErrorDialog(event.error || event.message)
})

async function bootstrap() {
  const app = createApp(App)

  app.config.errorHandler = (err, _instance, info) => {
    console.error('Vue error:', err, info)
    showErrorDialog(err)
  }

  const pinia = createPinia()
  app.use(pinia)

  const configStore = useConfigStore()
  await configStore.loadConfig()

  const appStore = useAppStore()
  appStore.setupThemeSync()

  app.mount('#app')
}

void bootstrap()

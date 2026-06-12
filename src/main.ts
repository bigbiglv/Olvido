import { createApp } from 'vue'

import App from './App.vue'
import { setupApp } from './app/setup'
import './styles/globals.css'

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { setupMock } = await import('./mock')

    setupMock()
  }

  const app = createApp(App)

  setupApp(app)

  app.mount('#app')
}

void bootstrap()

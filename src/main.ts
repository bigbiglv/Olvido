import { createApp } from 'vue'

import App from './App.vue'
import { setupApp } from './app/setup'
import './styles/globals.css'

async function bootstrap() {
  const app = createApp(App)

  setupApp(app)

  app.mount('#app')
}

void bootstrap()

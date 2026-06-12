import { createRouter, createWebHistory } from 'vue-router'

import { Confirm } from '@/components/confirm'
import { Dialog } from '@/components/dialog'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import { useAuthStore } from '@/stores/auth'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: {
        requiresAuth: false,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  Dialog.closeAll()
  Confirm.closeAll()

  const authStore = useAuthStore()

  if (to.name === 'login') {
    if (authStore.hasValidToken()) {
      return { name: 'home' }
    }

    return true
  }

  if (to.meta.requiresAuth === false) {
    return true
  }

  if (!authStore.hasValidToken()) {
    authStore.clearSession()

    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (!authStore.user) {
    try {
      await authStore.fetchUser()
    } catch {
      authStore.clearSession()

      return {
        name: 'login',
        query: {
          redirect: to.fullPath,
        },
      }
    }
  }

  return true
})

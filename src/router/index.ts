import { createRouter, createWebHistory } from 'vue-router'

import { Confirm } from '@/components/confirm'
import { Dialog } from '@/components/dialog'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import HomePage from '@/pages/HomePage.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          redirect: '/notebook',
        },
        {
          path: 'notebook',
          name: 'notebook',
          component: HomePage,
        },
        {
          path: 'notebook/:docId',
          name: 'notebook-detail',
          component: HomePage,
        },
        {
          path: 'project/:projectName',
          name: 'project',
          component: HomePage,
        },
        {
          path: 'project/:projectName/:docId',
          name: 'project-detail',
          component: HomePage,
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/SettingsPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async () => {
  Dialog.closeAll()
  Confirm.closeAll()

  return true
})


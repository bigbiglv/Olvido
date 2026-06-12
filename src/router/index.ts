import { createRouter, createWebHistory } from 'vue-router'

import { Confirm } from '@/components/confirm'
import { Dialog } from '@/components/dialog'
import HomePage from '@/pages/index/index.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/notebook',
    },
    {
      path: '/notebook',
      name: 'notebook',
      component: HomePage,
    },
    {
      path: '/notebook/:docId',
      name: 'notebook-detail',
      component: HomePage,
    },
    {
      path: '/project/:projectName',
      name: 'project',
      component: HomePage,
    },
    {
      path: '/project/:projectName/:docId',
      name: 'project-detail',
      component: HomePage,
    },
    {
      path: '/settings',
      name: 'settings',
      component: HomePage,
    },
  ],
})

router.beforeEach(async () => {
  Dialog.closeAll()
  Confirm.closeAll()

  return true
})

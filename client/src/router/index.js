import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard', // 👈 redireciona corretamente para /dashboard
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
  ],
})

export default router

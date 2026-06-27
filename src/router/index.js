import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const LoginView     = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const CameraView    = () => import('@/views/CameraView.vue')
const ManageView    = () => import('@/views/ManageView.vue')

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login',     name: 'login',     component: LoginView,     meta: { requiresGuest: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/camera/:id',name: 'camera',    component: CameraView,    meta: { requiresAuth: true } },
  { path: '/manage',    name: 'manage',    component: ManageView,    meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.requiresGuest && auth.isLoggedIn)  return { name: 'dashboard' }
  if (to.meta.requiresAdmin && !auth.isAdmin)    return { name: 'dashboard' }
})

export default router

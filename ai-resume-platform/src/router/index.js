import { createRouter, createWebHistory } from 'vue-router'
import IntroHome from '../views/IntroHome.vue'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'IntroHome',
    component: IntroHome,
    meta: { title: '云游江西' }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { title: '江西文旅' }
  },
  {
    path: '/detail',
    name: 'ScenicDetail',
    component: () => import('../views/ScenicDetail.vue'),
    meta: { title: '景点详情' }
  },
  {
    path: '/dialogue',
    name: 'Dialogue',
    component: () => import('../views/Dialogue.vue'),
    meta: { title: '情景对话' }
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '江西文旅'

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    const user = localStorage.getItem('user')
    if (!user) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  next()
})

export default router
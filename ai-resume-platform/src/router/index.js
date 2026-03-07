import { createRouter, createWebHistory } from "vue-router"

import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import ResumeAnalysis from "../views/ResumeAnalysis.vue"
import ResumeImprove from "../views/ResumeImprove.vue"
import JobMatch from "../views/JobMatch.vue"
import PersonalCenter from "../views/PersonalCenter.vue"
import MyResumes from "../views/MyResumes.vue"

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    component: Login,
    meta: { hideNav: true, requiresAuth: false }
  },
  {
    path: "/register",
    component: Register,
    meta: { hideNav: true, requiresAuth: false }
  },
  {
    path: "/analysis",
    component: ResumeAnalysis,
    meta: { requiresAuth: true, title: "AI简历分析" }
  },
  {
    path: "/improve",
    component: ResumeImprove,
    meta: { requiresAuth: true, title: "AI简历优化" }
  },
  {
    path: "/jobs",
    component: JobMatch,
    meta: { requiresAuth: true, title: "岗位匹配" }
  },
  {
    path: "/personal",
    component: PersonalCenter,
    meta: { requiresAuth: true, title: "个人中心" }
  },
  {
    path: "/resumes",
    component: MyResumes,
    meta: { requiresAuth: true, title: "我的简历" }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 检查用户是否已登录（同时检查 localStorage 和 sessionStorage）
const isLoggedIn = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token")
}

// 路由守卫 - 处理登录状态和页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - AI Resume Platform` : "AI Resume Platform"
  
  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth
  const loggedIn = isLoggedIn()
  
  // 调试信息（开发时可以查看控制台）
  console.log("路由守卫检查:", {
    to: to.path,
    requiresAuth,
    loggedIn,
    localStorage: localStorage.getItem("token"),
    sessionStorage: sessionStorage.getItem("token")
  })
  
  if (requiresAuth && !loggedIn) {
    // 需要登录但未登录，跳转到登录页
    ElMessage.warning("请先登录")
    next("/login")
  } else if ((to.path === "/login" || to.path === "/register") && loggedIn) {
    // 已登录用户访问登录/注册页，跳转到分析页
    next("/analysis")
  } else {
    next()
  }
})

export default router
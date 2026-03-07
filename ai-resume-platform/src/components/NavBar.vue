<template>
  <nav class="nav">
    <div class="nav-container">
      <div class="logo" @click="goToHome">
        <span class="logo-icon">🚀</span>
        <span class="logo-text">AI Resume Platform</span>
      </div>
      
      <div class="menu">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path" 
          class="menu-item" 
          active-class="active"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ item.name }}</span>
        </router-link>
      </div>

      <div class="user-menu">
        <el-dropdown v-if="isLoggedIn" @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32" :src="userAvatar">
              {{ userInitials }}
            </el-avatar>
            <span class="username">{{ userName }}</span>
            <el-icon class="arrow-down"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="personal">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="resumes">
                <el-icon><Files /></el-icon>
                我的简历
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                账号设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div v-else class="auth-buttons">
          <el-button text @click="goToLogin">登录</el-button>
          <el-button type="primary" @click="goToRegister">注册</el-button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { 
  ArrowDown, 
  User, 
  Files, 
  Setting, 
  SwitchButton 
} from "@element-plus/icons-vue"

const router = useRouter()
const route = useRoute()

// 菜单项配置
const menuItems = ref([
  { path: "/analysis", name: "AI简历分析", icon: "📊" },
  { path: "/improve", name: "AI简历优化", icon: "✨" },
  { path: "/jobs", name: "岗位匹配", icon: "🎯" }
])

// 检查登录状态（同时检查 localStorage 和 sessionStorage）
const isLoggedIn = computed(() => {
  return localStorage.getItem("token") || sessionStorage.getItem("token")
})

// 获取用户名
const userName = computed(() => {
  return localStorage.getItem("username") || sessionStorage.getItem("username") || "访客用户"
})

// 获取用户头像
const userAvatar = computed(() => {
  return localStorage.getItem("avatar") || sessionStorage.getItem("avatar") || "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
})

// 用户首字母（用于头像占位）
const userInitials = computed(() => {
  const name = userName.value
  return name.charAt(0).toUpperCase()
})

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case "personal":
      router.push("/personal")
      break
    case "resumes":
      router.push("/resumes")
      break
    case "settings":
      ElMessage.info("设置功能开发中")
      break
    case "logout":
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    "确定要退出登录吗？",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      roundButton: true,
      center: true
    }
  ).then(() => {
    // 清除所有登录信息
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("avatar")
    sessionStorage.clear()
    
    ElMessage.success({
      message: "已退出登录",
      duration: 1500
    })
    
    // 如果当前页面是需要登录的页面，跳转到登录页
    if (route.meta.requiresAuth) {
      router.push("/login")
    } else {
      // 否则刷新当前页面
      router.go(0)
    }
  }).catch(() => {
    ElMessage.info("已取消退出")
  })
}

// 跳转到首页
const goToHome = () => {
  if (isLoggedIn.value) {
    router.push("/analysis")
  } else {
    router.push("/login")
  }
}

// 跳转到登录
const goToLogin = () => {
  router.push("/login")
}

// 跳转到注册
const goToRegister = () => {
  router.push("/register")
}

// 组件挂载时检查登录状态
onMounted(() => {
  // 可以在这里添加一些初始化逻辑
  console.log("NavBar mounted, 登录状态:", isLoggedIn.value)
})
</script>

<style scoped>
.nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo:active {
  transform: scale(0.95);
}

.logo-icon {
  font-size: 28px;
  animation: float 3s ease-in-out infinite;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0); 
  }
  50% { 
    transform: translateY(-5px); 
  }
}

.menu {
  display: flex;
  gap: 30px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  border-radius: 40px;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item .icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.menu-item:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.menu-item:hover .icon {
  transform: scale(1.1);
}

.menu-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.menu-item.active .icon {
  transform: scale(1.1);
}

.menu-item.active::before {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 40px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-info:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
}

.user-info:hover .arrow-down {
  transform: rotate(180deg);
}

.user-info:active {
  transform: scale(0.95);
}

.username {
  font-weight: 500;
  color: #4a5568;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-down {
  font-size: 14px;
  color: #718096;
  transition: transform 0.3s ease;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.auth-buttons .el-button {
  border-radius: 30px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.auth-buttons .el-button--text {
  color: #4a5568;
  font-weight: 500;
}

.auth-buttons .el-button--text:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.auth-buttons .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
}

.auth-buttons .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.auth-buttons .el-button--primary:active {
  transform: translateY(0);
}

/* 下拉菜单自定义样式 */
:deep(.el-dropdown-menu) {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
}

:deep(.el-dropdown-menu__item) {
  padding: 10px 20px;
  font-size: 14px;
  color: #4a5568;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
  color: #718096;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

:deep(.el-dropdown-menu__item:hover .el-icon) {
  color: #667eea;
}

:deep(.el-dropdown-menu__item--divided) {
  border-top-color: #e2e8f0;
  margin-top: 8px;
  padding-top: 8px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 30px;
  }
  
  .menu {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 20px;
  }
  
  .logo-text {
    display: none;
  }
  
  .menu {
    gap: 10px;
  }
  
  .menu-item {
    padding: 8px 12px;
  }
  
  .menu-item .text {
    display: none;
  }
  
  .menu-item .icon {
    font-size: 20px;
  }
  
  .username {
    display: none;
  }
  
  .user-info {
    padding: 5px;
  }
  
  .auth-buttons {
    gap: 5px;
  }
  
  .auth-buttons .el-button {
    padding: 8px 15px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 15px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
  
  .menu-item {
    padding: 8px;
  }
  
  .menu-item .icon {
    font-size: 18px;
  }
  
  .auth-buttons .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .nav {
    background: rgba(26, 32, 44, 0.95);
    border-bottom-color: rgba(102, 126, 234, 0.2);
  }
  
  .menu-item {
    color: #e2e8f0;
  }
  
  .menu-item:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.15);
  }
  
  .username {
    color: #e2e8f0;
  }
  
  .auth-buttons .el-button--text {
    color: #e2e8f0;
  }
  
  .auth-buttons .el-button--text:hover {
    color: #667eea;
  }
  
  :deep(.el-dropdown-menu) {
    background: #1a202c;
    border: 1px solid #2d3748;
  }
  
  :deep(.el-dropdown-menu__item) {
    color: #e2e8f0;
  }
  
  :deep(.el-dropdown-menu__item .el-icon) {
    color: #a0aec0;
  }
  
  :deep(.el-dropdown-menu__item:hover) {
    background: rgba(102, 126, 234, 0.2);
  }
  
  :deep(.el-dropdown-menu__item--divided) {
    border-top-color: #2d3748;
  }
}

/* 动画效果 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav {
  animation: slideDown 0.5s ease;
}

/* 加载状态 */
.nav.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* 打印样式 */
@media print {
  .nav {
    display: none;
  }
}
</style>
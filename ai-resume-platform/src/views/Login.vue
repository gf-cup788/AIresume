<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-left">
        <div class="brand">
          <span class="brand-icon">🚀</span>
          <span class="brand-text">AI Resume</span>
        </div>
        <h1 class="welcome-text">欢迎回来</h1>
        <p class="sub-text">登录您的账号，继续您的求职之旅</p>
        
        <div class="features">
          <div class="feature-item" v-for="feature in features" :key="feature.text">
            <span class="feature-icon">{{ feature.icon }}</span>
            <span class="feature-text">{{ feature.text }}</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <el-card class="login-card" :body-style="{ padding: '40px' }">
          <h2 class="login-title">账号登录</h2>
          
          <el-form @submit.prevent="login">
            <el-form-item>
              <el-input
                v-model="username"
                placeholder="用户名"
                :prefix-icon="User"
                size="large"
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item>
              <el-input
                v-model="password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                size="large"
                class="custom-input"
                show-password
              />
            </el-form-item>
            
            <div class="form-options">
              <el-checkbox v-model="remember">记住密码</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>
            
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              @click="login"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form>
          
          <div class="register-link">
            还没有账号？
            <router-link to="/register" class="register-text">立即注册</router-link>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { User, Lock } from "@element-plus/icons-vue"

const router = useRouter()
const username = ref("")
const password = ref("")
const remember = ref(false)
const loading = ref(false)

const features = ref([
  { icon: "📊", text: "AI智能简历分析" },
  { icon: "✨", text: "专业简历优化" },
  { icon: "🎯", text: "精准岗位匹配" },
  { icon: "📈", text: "实时行业趋势" }
])

const login = () => {
  if (!username.value || !password.value) {
    ElMessage.warning("请输入账号和密码")
    return
  }

  loading.value = true

  // 模拟登录成功，设置token和用户信息
  setTimeout(() => {
    // 生成一个模拟的token
    const mockToken = "mock_token_" + Date.now()
    
    // 根据"记住密码"选项选择存储方式
    if (remember.value) {
      localStorage.setItem("token", mockToken)
      localStorage.setItem("username", username.value)
      localStorage.setItem("avatar", "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png")
    } else {
      sessionStorage.setItem("token", mockToken)
      sessionStorage.setItem("username", username.value)
      sessionStorage.setItem("avatar", "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png")
    }

    ElMessage.success("登录成功！")
    loading.value = false
    
    // 跳转到分析页
    router.push("/analysis")
  }, 1500)
}
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
}

.login-wrapper {
  display: flex;
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.6s ease;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  color: white;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 60px;
}

.brand-icon {
  font-size: 32px;
}

.brand-text {
  font-size: 24px;
  font-weight: 700;
}

.welcome-text {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 10px;
}

.sub-text {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 50px;
}

.features {
  margin-top: auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 24px;
}

.feature-text {
  font-size: 16px;
  font-weight: 500;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border: none;
  box-shadow: none;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 30px;
  text-align: center;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #718096;
}

.register-text {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.register-text:hover {
  text-decoration: underline;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
  }
  
  .login-left {
    padding: 40px 30px;
  }
  
  .welcome-text {
    font-size: 32px;
  }
}
</style>
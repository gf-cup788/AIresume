<template>
  <div class="register-container">
    <div class="register-wrapper">
      <div class="register-left">
        <div class="brand">
          <span class="brand-icon">✨</span>
          <span class="brand-text">Join Us</span>
        </div>
        <h1 class="welcome-text">开启AI求职之旅</h1>
        <p class="sub-text">注册即享智能简历分析、优化和岗位匹配服务</p>
        
        <div class="benefits">
          <div class="benefit-item" v-for="benefit in benefits" :key="benefit">
            <el-icon><Check /></el-icon>
            <span>{{ benefit }}</span>
          </div>
        </div>
      </div>
      
      <div class="register-right">
        <el-card class="register-card" :body-style="{ padding: '40px' }">
          <h2 class="register-title">创建账号</h2>
          
          <el-form
            :model="form"
            :rules="rules"
            ref="formRef"
            @submit.prevent
          >
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="用户名"
                :prefix-icon="User"
                size="large"
                class="custom-input"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                size="large"
                class="custom-input"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="确认密码"
                :prefix-icon="Lock"
                size="large"
                class="custom-input"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="agree">
              <el-checkbox v-model="form.agree">
                我已阅读并同意
                <el-link type="primary" :underline="false">《用户协议》</el-link>
                和
                <el-link type="primary" :underline="false">《隐私政策》</el-link>
              </el-checkbox>
            </el-form-item>
            
            <el-button
              type="primary"
              size="large"
              class="register-btn"
              @click="handleRegister"
              :loading="loading"
            >
              注册
            </el-button>
          </el-form>
          
          <div class="login-link">
            已有账号？
            <router-link to="/login" class="login-text">立即登录</router-link>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { User, Lock, Check } from "@element-plus/icons-vue"

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  agree: false
})

const benefits = ref([
  "AI智能简历分析",
  "专业简历优化建议",
  "精准岗位匹配推荐",
  "实时行业趋势洞察",
  "个性化学习路线规划"
])

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const validateAgree = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请阅读并同意用户协议"))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: "密码必须包含字母和数字", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" }
  ],
  agree: [
    { validator: validateAgree, trigger: "change" }
  ]
}

const handleRegister = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        loading.value = false
        ElMessage.success("注册成功！欢迎加入")
        router.push("/login")
      }, 1500)
    }
  })
}
</script>

<style scoped>
.register-container {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
}

.register-wrapper {
  display: flex;
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.6s ease;
}

.register-left {
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
  margin-bottom: 40px;
}

.brand-icon {
  font-size: 32px;
}

.brand-text {
  font-size: 24px;
  font-weight: 700;
}

.welcome-text {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
}

.sub-text {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.benefits {
  margin-top: auto;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.benefit-item :deep(.el-icon) {
  font-size: 20px;
  color: #4ade80;
}

.register-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.register-card {
  width: 100%;
  max-width: 450px;
  border: none;
  box-shadow: none;
}

.register-title {
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

.register-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #718096;
}

.login-text {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.login-text:hover {
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
  .register-wrapper {
    flex-direction: column;
  }
  
  .register-left {
    padding: 40px 30px;
  }
  
  .welcome-text {
    font-size: 28px;
  }
}
</style>
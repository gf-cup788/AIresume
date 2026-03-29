<template>
  <div class="book-wrapper">
    <div class="book">
      <!-- 图层3：注册页（最底层） - 紧凑布局，无滚动条 -->
      <div
        ref="registerLayer"
        class="layer"
        id="layerRegister"
        :style="{ zIndex: registerZIndex, transform: registerTransform }"
      >
        <div class="front">
          <div class="page-content">
            <div class="page-title">注 册</div>
            <div class="compact-form" ref="compactFormReg">
              <div class="input-group">
                <label>👤 用户名</label>
                <input
                  type="text"
                  id="regName"
                  v-model="regName"
                  placeholder="张三"
                  autocomplete="off"
                  @click.stop
                />
              </div>
              <div class="input-group">
                <label>📧 电子邮箱</label>
                <input
                  type="email"
                  id="regEmail"
                  v-model="regEmail"
                  placeholder="student@univ.edu"
                  autocomplete="off"
                  @click.stop
                />
              </div>
              <div class="input-group">
                <label>🔒 设置密码</label>
                <input
                  type="password"
                  id="regPassword"
                  v-model="regPassword"
                  placeholder="至少6位"
                  autocomplete="new-password"
                  @click.stop
                />
              </div>
              <button class="btn" id="registerBtn" @click.stop="handleRegister">注册并激活</button>
              <div class="switch-hint" id="backToLoginBtn" @click.stop="handleBackToLogin">
                <span>← 翻回上一页</span> 已有账号
              </div>
              <div class="footer-note">即刻拥有景点通行证</div>
            </div>
            <div class="page-corner">第 2 页</div>
          </div>
        </div>
      </div>

      <!-- 图层2：登录页（中间层，有背面） -->
      <div
        ref="loginLayer"
        class="layer"
        id="layerLogin"
        :style="{ zIndex: loginZIndex, transform: loginTransform }"
      >
        <div class="front">
          <div class="page-content">
            <div class="page-title">登 录</div>
            <div class="compact-form">
              <div class="input-group">
                <label>📧 用户名 / 邮箱</label>
                <input
                  type="text"
                  id="loginUsername"
                  v-model="loginUsername"
                  placeholder="user"
                  autocomplete="off"
                  @click.stop
                />
              </div>
              <div class="input-group">
                <label>🔒 密码</label>
                <input
                  type="password"
                  id="loginPassword"
                  v-model="loginPassword"
                  placeholder="······"
                  autocomplete="current-password"
                  @click.stop
                />
              </div>
              <button class="btn" id="loginBtn" @click.stop="handleLogin">开始游玩</button>
              <div class="switch-hint" id="nextToRegisterBtn" @click.stop="handleNextToRegister">
                还没有通行证？ <span>翻开下一页 →</span>
              </div>
              <div class="footer-note">江西印象  · 山川秀丽</div>
            </div>
            <div class="page-corner">第 1 页</div>
          </div>
        </div>
        <div class="back" ref="loginBack" @click.stop>
          <div class="back-content">
            <h3>📍 景点游览指南</h3>
          <p>
            1. 文明旅游，爱护环境<br />
            2. 尊重当地文化与风俗<br />
            3. 注意安全，合理规划路线<br />
            4. 保护自然景观与历史遗迹<br />
            5. 放慢脚步，感受旅途之美
          </p>
          <div class="small-text">江西文旅 · 游览手册</div>
          </div>
        </div>
      </div>

      <!-- 图层1：封面（最上层，有背面） -->
      <div
        ref="coverLayer"
        class="layer layer-cover"
        id="layerCover"
        :style="{ zIndex: coverZIndex, transform: coverTransform }"
        @click.stop="handleCoverClick"
      >
        <div class="front">
          <div class="cover-content">
            <div class="emblem">🌄</div>
            <h1>景 点 通 行 证</h1>
            <div class="stamp">✦ 景点游历 ✦</div>
            <div class="hint">▼ 点击翻开 ▼</div>
          </div>
        </div>
        <div class="back" ref="coverBack" @click.stop>
          <div class="back-content">
           <h3>🌄 江西风物</h3>
            <p>
            山川秀丽，文脉悠长<br />
            古韵今风，尽在其间
            </p>
            <div class="small-text">江西文旅 · 扉页</div>
          </div>
        </div>
      </div>

      <transition name="toast-fade">
        <div
          v-if="toastVisible"
          class="toast"
          :style="{ background: toastIsError ? '#c24a2c' : '#2f6b47' }"
        >
          {{ toastMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const coverLayer = ref(null)
const loginLayer = ref(null)
const registerLayer = ref(null)
const loginBack = ref(null)
const coverBack = ref(null)
const compactFormReg = ref(null)

const isAnimating = ref(false)
const currentPage = ref('cover') // cover, login, register

const coverTransform = ref('rotateY(0deg)')
const loginTransform = ref('rotateY(0deg)')
const registerTransform = ref('rotateY(0deg)')

const coverZIndex = ref('30')
const loginZIndex = ref('20')
const registerZIndex = ref('10')

const loginUsername = ref('')
const loginPassword = ref('')
const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')

const toastVisible = ref(false)
const toastMessage = ref('')
const toastIsError = ref(false)
let toastTimer = null

function flipPageOpen(layerType, callback) {
  if (isAnimating.value) return false
  isAnimating.value = true

  if (layerType === 'cover') coverTransform.value = 'rotateY(-180deg)'
  if (layerType === 'login') loginTransform.value = 'rotateY(-180deg)'
  if (layerType === 'register') registerTransform.value = 'rotateY(-180deg)'

  setTimeout(() => {
    isAnimating.value = false
    if (callback) callback()
  }, 800)
  return true
}

function flipPageClose(layerType, callback) {
  if (isAnimating.value) return false
  isAnimating.value = true

  if (layerType === 'cover') coverTransform.value = 'rotateY(0deg)'
  if (layerType === 'login') loginTransform.value = 'rotateY(0deg)'
  if (layerType === 'register') registerTransform.value = 'rotateY(0deg)'

  setTimeout(() => {
    isAnimating.value = false
    if (callback) callback()
  }, 800)
  return true
}

// 翻开封面：从封面到登录页
function openCover() {
  if (currentPage.value === 'cover') {
    flipPageOpen('cover', () => {
      coverZIndex.value = '5'
      loginZIndex.value = '25'
      registerZIndex.value = '10'
      currentPage.value = 'login'
    })
  }
}

// 翻开登录页（进入注册页）
function openLoginToRegister() {
  if (currentPage.value === 'login') {
    flipPageOpen('login', () => {
      loginZIndex.value = '6'
      registerZIndex.value = '25'
      coverZIndex.value = '5'
      currentPage.value = 'register'
    })
  }
}

// 从注册页翻回登录页（合上登录页，回到登录页正面）
function backToLoginFromRegister() {
  if (currentPage.value === 'register') {
    registerZIndex.value = '10'
    loginZIndex.value = '25'
    coverZIndex.value = '5'
    flipPageClose('login', () => {
      currentPage.value = 'login'
    })
  }
}

function handleCoverClick() {
  if (
    (currentPage.value === 'cover' && coverTransform.value === 'rotateY(0deg)') ||
    coverTransform.value === ''
  ) {
    openCover()
  }
}

function handleNextToRegister() {
  if (currentPage.value === 'login') {
    openLoginToRegister()
  } else if (currentPage.value === 'cover') {
    if (!isAnimating.value) {
      openCover()
      setTimeout(() => {
        if (currentPage.value === 'login') {
          openLoginToRegister()
        }
      }, 850)
    }
  }
}

function handleBackToLogin() {
  if (currentPage.value === 'register') {
    backToLoginFromRegister()
  }
}

// 轻提示
function showMessage(msg, isError = false) {
  toastMessage.value = msg
  toastIsError.value = isError
  toastVisible.value = true

  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

// 登录逻辑
function handleLogin() {
  const username = loginUsername.value.trim()
  const password = loginPassword.value.trim()

  if (!username || !password) {
    showMessage('请填写用户名/邮箱和密码', true)
    return
  }

  // 模拟登录成功：保存登录态
  const userInfo = {
    username,
    loginTime: Date.now()
  }
  localStorage.setItem('user', JSON.stringify(userInfo))

  showMessage('登录成功！欢迎使用景点通行证 ✨')

  // 可选：清空密码框
  loginPassword.value = ''

  // 优先回跳守卫拦截前页面，否则进入首页
  setTimeout(() => {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  }, 800)
}

// 注册逻辑 + 自动跳转登录页 且预填邮箱
function handleRegister() {
  const name = regName.value.trim()
  const email = regEmail.value.trim()
  const password = regPassword.value.trim()

  if (!name || !email || !password) {
    showMessage('请填写完整信息', true)
    return
  }
  if (password.length < 6) {
    showMessage('密码至少需要6位', true)
    return
  }
  if (!email.includes('@') || !email.includes('.')) {
    showMessage('请输入有效的邮箱地址（包含@）', true)
    return
  }

  showMessage(`注册成功！欢迎 ${name}，请登录 ✨`)

  setTimeout(() => {
    if (currentPage.value === 'register') {
      backToLoginFromRegister()
    }
    if (email) {
      loginUsername.value = email
    }
    regName.value = ''
    regEmail.value = ''
    regPassword.value = ''
  }, 1000)
}

// 额外优化：确保在窄屏或任何情况下注册页面内容完全不溢出，不会出现滚动条
function adjustNoScrollOnRegister() {
  const regFront = registerLayer.value?.querySelector('.front')
  if (regFront) {
    const contentHeight = regFront.scrollHeight
    const clientHeight = regFront.clientHeight
    if (contentHeight > clientHeight + 2) {
      const compactDiv = registerLayer.value?.querySelector('.compact-form')
      if (compactDiv) compactDiv.style.paddingBottom = '0px'
    }
  }
}

function applyInitialDomStyleTweaks() {
  const regFrontDiv = registerLayer.value?.querySelector('.front')
  if (regFrontDiv) {
    regFrontDiv.style.overflowY = 'hidden'
    const pageContentReg = regFrontDiv.querySelector('.page-content')
    if (pageContentReg) {
      pageContentReg.style.height = '100%'
      pageContentReg.style.display = 'flex'
      pageContentReg.style.flexDirection = 'column'
      pageContentReg.style.justifyContent = 'space-between'
    }
    const compactFormRegEl = regFrontDiv.querySelector('.compact-form')
    if (compactFormRegEl) {
      compactFormRegEl.style.flex = '1'
      compactFormRegEl.style.display = 'flex'
      compactFormRegEl.style.flexDirection = 'column'
      compactFormRegEl.style.justifyContent = 'center'
    }
  }

  const loginFrontDiv = loginLayer.value?.querySelector('.front')
  if (loginFrontDiv) {
    const pageContentLogin = loginFrontDiv.querySelector('.page-content')
    if (pageContentLogin) {
      pageContentLogin.style.height = '100%'
      pageContentLogin.style.display = 'flex'
      pageContentLogin.style.flexDirection = 'column'
      pageContentLogin.style.justifyContent = 'space-between'
    }
    const compactLogin = loginFrontDiv.querySelector('.compact-form')
    if (compactLogin) {
      compactLogin.style.flex = '1'
    }
  }
}

onMounted(() => {
  if (coverTransform.value === '') coverTransform.value = 'rotateY(0deg)'
  if (loginTransform.value === '') loginTransform.value = 'rotateY(0deg)'
  if (registerTransform.value === '') registerTransform.value = 'rotateY(0deg)'

  applyInitialDomStyleTweaks()

  window.addEventListener('resize', adjustNoScrollOnRegister)
  setTimeout(adjustNoScrollOnRegister, 100)

  nextTick(() => {
    adjustNoScrollOnRegister()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustNoScrollOnRegister)
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.book-wrapper {
  background: linear-gradient(145deg, #6b5a4a 0%, #4a3a2a 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  padding: 20px;
}

.book {
  position: relative;
  width: 380px;
  height: 540px;
  perspective: 2000px;
}

.layer {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: left center;
  transition: transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1);
  border-radius: 8px 12px 12px 8px;
  transform-style: preserve-3d;
}

.front,
.back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px 12px 12px 8px;
  overflow-y: auto;
}

.front {
  background: #fffef7;
  transform: rotateY(0deg);
}

.back {
  background: #f5ede0;
  transform: rotateY(180deg);
}

.layer-cover .front {
  background: linear-gradient(135deg, #c49a6c, #8b5a3a);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 2px solid #e9c891;
  box-shadow: -5px 5px 20px rgba(0, 0, 0, 0.3);
}

.cover-content {
  text-align: center;
  color: #ffefb9;
}

.cover-content .emblem {
  font-size: 4rem;
  margin-bottom: 20px;
}

.cover-content h1 {
  font-size: 1.8rem;
  text-shadow: 2px 2px 0 #5a2e1a;
  margin-bottom: 20px;
}

.cover-content .stamp {
  background: rgba(255, 235, 190, 0.3);
  padding: 5px 15px;
  border-radius: 30px;
  display: inline-block;
  margin-bottom: 20px;
}

.cover-content .hint {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 12px;
  border-radius: 30px;
  white-space: nowrap;
}

.page-content {
  padding: 20px 22px 18px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.page-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: #734c2c;
  border-left: 5px solid #c28a4e;
  padding-left: 15px;
  margin-bottom: 20px;
}

.compact-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.input-group {
  margin-bottom: 14px;
}

.input-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #5e3e28;
  margin-bottom: 4px;
}

.input-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ecd9b4;
  border-radius: 30px;
  background: #fffef7;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;
}

.input-group input:focus {
  border-color: #b57c3c;
  box-shadow: 0 0 0 3px rgba(181, 124, 60, 0.1);
}

.btn {
  background: #9b6a42;
  border: none;
  color: white;
  font-weight: bold;
  padding: 10px;
  width: 100%;
  border-radius: 40px;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.btn:hover {
  background: #7e5436;
}

.switch-hint {
  text-align: center;
  margin-top: 12px;
  font-size: 0.8rem;
  color: #a5754a;
  cursor: pointer;
  border-top: 1px dashed #eedbba;
  padding-top: 12px;
}

.switch-hint span {
  font-weight: bold;
  color: #c1652c;
  text-decoration: underline;
}

.footer-note {
  margin-top: 12px;
  font-size: 0.65rem;
  text-align: center;
  color: #bba16d;
}

.page-corner {
  position: absolute;
  bottom: 12px;
  right: 20px;
  font-size: 0.65rem;
  color: #c2a074;
}

.back-content {
  padding: 30px 25px;
  text-align: center;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.back-content h3 {
  font-size: 1.3rem;
  font-weight: bold;
  color: #9b6e42;
  margin-bottom: 20px;
}

.back-content p {
  font-size: 0.9rem;
  color: #7e5a3a;
  line-height: 1.7;
}

.back-content .small-text {
  margin-top: 28px;
  font-size: 0.7rem;
  color: #c2a074;
}

.front::-webkit-scrollbar,
.back::-webkit-scrollbar {
  width: 4px;
}

.front::-webkit-scrollbar-track,
.back::-webkit-scrollbar-track {
  background: #f1e7d6;
}

.front::-webkit-scrollbar-thumb,
.back::-webkit-scrollbar-thumb {
  background: #c2a074;
  border-radius: 5px;
}

#layerRegister .front {
  overflow-y: hidden;
}

#layerLogin .front,
#layerCover .back {
  overflow-y: auto;
}

@media (max-width: 450px) {
  .book {
    width: 320px;
    height: 500px;
  }

  .page-content {
    padding: 16px 18px 14px;
  }

  .page-title {
    font-size: 1.4rem;
    margin-bottom: 16px;
  }

  .input-group {
    margin-bottom: 12px;
  }

  .input-group input {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .btn {
    padding: 8px;
    font-size: 0.9rem;
  }

  .switch-hint {
    margin-top: 10px;
    padding-top: 10px;
  }

  .footer-note {
    margin-top: 10px;
  }
}

.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  padding: 10px 24px;
  border-radius: 40px;
  font-size: 0.85rem;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  font-weight: 500;
  pointer-events: none;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}
</style>
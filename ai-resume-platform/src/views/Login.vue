<template>
  <div class="book-wrapper">
    <div class="book">
      <!-- 图层3：注册页（最底层） -->
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
                  v-model="regName"
                  placeholder="请输入用户名"
                  autocomplete="off"
                  @click.stop
                />
              </div>

              <div class="input-group">
                <label>🏷️ 昵称</label>
                <input
                  type="text"
                  v-model="regNickname"
                  placeholder="请输入昵称（可选）"
                  autocomplete="off"
                  @click.stop
                />
              </div>

              <div class="input-group">
                <label>🔒 设置密码</label>
                <input
                  type="password"
                  v-model="regPassword"
                  placeholder="至少6位"
                  autocomplete="new-password"
                  @click.stop
                />
              </div>

              <div class="input-group">
                <label>🔐 确认密码</label>
                <input
                  type="password"
                  v-model="regConfirmPassword"
                  placeholder="请再次输入密码"
                  autocomplete="new-password"
                  @click.stop
                />
              </div>

              <button
                class="btn"
                @click.stop="handleRegister"
                :disabled="registerLoading"
              >
                {{ registerLoading ? '提交中...' : '注册并激活' }}
              </button>

              <div class="switch-hint" @click.stop="handleBackToLogin">
                <span>← 翻回上一页</span> 已有账号
              </div>
              <div class="footer-note">即刻拥有景点通行证</div>
            </div>
            <div class="page-corner">第 2 页</div>
          </div>
        </div>
      </div>

      <!-- 图层2：登录页 -->
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
                <label>📧 用户名</label>
                <input
                  type="text"
                  v-model="loginUsername"
                  placeholder="请输入用户名"
                  autocomplete="off"
                  @keyup.enter="handleLogin"
                  @click.stop
                />
              </div>
              <div class="input-group">
                <label>🔒 密码</label>
                <input
                  type="password"
                  v-model="loginPassword"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  @keyup.enter="handleLogin"
                  @click.stop
                />
              </div>

              <button
                class="btn"
                @click.stop="handleLogin"
                :disabled="loginLoading"
              >
                {{ loginLoading ? '登录中...' : '开始游玩' }}
              </button>

              <div class="switch-hint" @click.stop="handleNextToRegister">
                还没有通行证？ <span>翻开下一页 →</span>
              </div>
              <div class="footer-note">江西印象 · 山川秀丽</div>
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

      <!-- 图层1：封面 -->
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
import { loginApi, registerApi } from '@/api/auth'
import { saveLoginInfo } from '@/utils/request'

const router = useRouter()
const route = useRoute()

const coverLayer = ref(null)
const loginLayer = ref(null)
const registerLayer = ref(null)
const loginBack = ref(null)
const coverBack = ref(null)

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
const regNickname = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')

const loginLoading = ref(false)
const registerLoading = ref(false)

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
    callback && callback()
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
    callback && callback()
  }, 800)

  return true
}

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

function showMessage(msg, isError = false) {
  toastMessage.value = msg
  toastIsError.value = isError
  toastVisible.value = true

  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2200)
}

async function handleLogin() {
  const username = loginUsername.value.trim()
  const password = loginPassword.value.trim()

  if (!username || !password) {
    showMessage('请填写用户名和密码', true)
    return
  }

  if (loginLoading.value) return

  loginLoading.value = true

  try {
    const res = await loginApi({
      username,
      password
    })

    const token = res?.data || ''

    saveLoginInfo({
      token,
      user: {
        username,
        loginTime: Date.now()
      }
    })

    showMessage(res?.message || '登录成功')

    loginPassword.value = ''

    setTimeout(() => {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }, 800)
  } catch (error) {
    showMessage(error.message || '登录失败', true)
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  const username = regName.value.trim()
  const nickname = regNickname.value.trim()
  const password = regPassword.value.trim()
  const confirmPassword = regConfirmPassword.value.trim()

  if (!username || !password || !confirmPassword) {
    showMessage('请填写完整注册信息', true)
    return
  }

  if (username.length < 3 || username.length > 20) {
    showMessage('用户名长度需为 3 到 20 位', true)
    return
  }

  if (password.length < 6 || password.length > 20) {
    showMessage('密码长度需为 6 到 20 位', true)
    return
  }

  if (password !== confirmPassword) {
    showMessage('两次输入的密码不一致', true)
    return
  }

  if (registerLoading.value) return

  registerLoading.value = true

  try {
    const payload = {
      username,
      password,
      confirmPassword
    }

    if (nickname) {
      payload.nickname = nickname
    }

    const res = await registerApi(payload)

    showMessage(res?.message || '注册成功')

    regName.value = ''
    regNickname.value = ''
    regPassword.value = ''
    regConfirmPassword.value = ''

    setTimeout(() => {
      handleBackToLogin()
    }, 700)
  } catch (error) {
    showMessage(error.message || '注册失败', true)
  } finally {
    registerLoading.value = false
  }
}

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
  background: url("@/assets/imgs/wangxiangu.jpg");
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
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
  background: linear-gradient(135deg, #ffd99d, #ba8866);
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
  padding: 6px 16px;
  border-radius: 30px;
  margin-bottom: 18px;
  display: inline-block;
}

.cover-content .hint {
  margin-top: 18px;
  font-size: 0.95rem;
  opacity: 0.95;
}

.page-content,
.back-content {
  width: 100%;
  height: 100%;
  padding: 34px 28px;
}

.page-title {
  text-align: center;
  font-size: 1.7rem;
  color: #7a4c2f;
  letter-spacing: 10px;
  margin: 10px 0 24px;
  font-weight: 700;
}

.compact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #7b5a46;
  font-size: 14px;
  font-weight: 600;
}

.input-group input {
  width: 100%;
  height: 44px;
  border: 1px solid #d7c4a9;
  border-radius: 10px;
  outline: none;
  padding: 0 14px;
  font-size: 14px;
  background: rgba(255, 251, 242, 0.9);
  color: #4e3728;
  transition: all 0.2s ease;
}

.input-group input:focus {
  border-color: #b9855e;
  box-shadow: 0 0 0 3px rgba(185, 133, 94, 0.15);
}

.btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #b8774d, #9c5c37);
  color: #fff7e6;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.25s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(156, 92, 55, 0.28);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.switch-hint {
  margin-top: 6px;
  text-align: center;
  color: #8b694f;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.switch-hint span {
  color: #9b5d38;
  font-weight: 700;
}

.footer-note {
  text-align: center;
  color: #a38872;
  font-size: 13px;
  margin-top: 6px;
}

.page-corner {
  position: absolute;
  right: 18px;
  bottom: 14px;
  color: #c4ad92;
  font-size: 12px;
}

.back-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #6a4935;
  line-height: 1.9;
}

.back-content h3 {
  text-align: center;
  margin-bottom: 18px;
  font-size: 1.25rem;
}

.back-content p {
  font-size: 15px;
  text-align: center;
}

.small-text {
  margin-top: 22px;
  text-align: center;
  color: #9e826f;
  font-size: 13px;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: -70px;
  transform: translateX(-50%);
  color: #fff;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.16);
  z-index: 99;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

@media (max-width: 480px) {
  .book {
    width: 92vw;
    height: 132vw;
    max-height: 560px;
  }

  .page-title {
    font-size: 1.45rem;
    letter-spacing: 8px;
  }
}
</style>
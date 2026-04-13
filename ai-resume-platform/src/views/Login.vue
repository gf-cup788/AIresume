<template>
  <div class="login-page">
    <div class="click-hint">
      {{
        currentPage === 'cover'
          ? '点击封面翻开'
          : '可拖动右下角或点击按钮翻页'
      }}
    </div>

    <div class="book-stage">
      <div ref="bookSection" class="book-section">
        <div ref="bookWrapper" class="book-clipper">
          <div ref="bookRef" class="book">
            <!-- 1. 封面 -->
            <div class="page page-cover" data-density="hard">
              <div
                class="page-content cover-page"
                :style="{ backgroundImage: 'url(' + coverBg + ')', backgroundSize: 'cover', backgroundPosition: 'center' }"
                @pointerdown.capture.stop.prevent
                @mousedown.capture.stop.prevent
                @touchstart.capture.stop.prevent
                @click.capture.stop.prevent="handleCoverClick"
              >
              </div>
            </div>

            <!-- 2. 说明页 -->
            <div class="page page-hard">
              <div class="page-content intro-page">
                <div class="intro-wrap">
                  <div class="intro-tag">PREFACE</div>
                  <h2>景点游览指南</h2>
                  <p>
                    1. 文明旅游，爱护环境<br />
                    2. 尊重当地文化与风俗<br />
                    3. 注意安全，合理规划路线<br />
                    4. 保护自然景观与历史遗迹<br />
                    5. 放慢脚步，感受旅途之美
                  </p>
                  <div class="small-text">江西文旅 · 游览手册</div>
                </div>
                <span class="page-num left">01</span>
              </div>
            </div>

            <!-- 3. 登录页 -->
            <div class="page">
              <div class="page-content form-page">
                <div class="page-title">登 录</div>

                <div class="compact-form">
                  <div class="input-group">
                    <label>用户名</label>
                    <input
                      v-model="loginUsername"
                      type="text"
                      placeholder="请输入用户名"
                      autocomplete="off"
                      @keyup.enter="handleLogin"
                      @click.stop
                      @mousedown.stop
                      @pointerdown.stop
                      @touchstart.stop
                    />
                  </div>

                  <div class="input-group">
                    <label>密码</label>
                    <input
                      v-model="loginPassword"
                      type="password"
                      placeholder="请输入密码"
                      autocomplete="current-password"
                      @keyup.enter="handleLogin"
                      @click.stop
                      @mousedown.stop
                      @pointerdown.stop
                      @touchstart.stop
                    />
                  </div>

                  <button
                    class="btn"
                    :disabled="loginLoading"
                    @click.stop="handleLogin"
                    @mousedown.stop
                    @pointerdown.stop
                    @touchstart.stop
                  >
                    {{ loginLoading ? '登录中...' : '开始游玩' }}
                  </button>

                  <div
                    class="switch-hint"
                    @click.stop="goToRegister"
                    @mousedown.stop
                    @pointerdown.stop
                    @touchstart.stop
                  >
                    还没有通行证？ <span>翻开下一页 →</span>
                  </div>

                  <div class="footer-note">江西印象 · 山川秀丽</div>
                </div>

                <span class="page-num right">02</span>
              </div>
            </div>

            <!-- 4. 说明页 -->
            <div class="page page-hard">
              <div class="page-content intro-page intro-page-mid">
                <div class="intro-wrap">
                  <div class="intro-tag">NOTICE</div>
                  <h2>登录后可体验</h2>
                  <p>
                    1. 浏览江西各地景点内容<br />
                    2. 参与互动故事与小游戏<br />
                    3. 收藏喜欢的旅游路线<br />
                    4. 查看景区特色文化与美食<br />
                    5. 开启沉浸式游玩体验
                  </p>
                  <div class="small-text">山水有相逢 · 风景有故事</div>
                </div>
                <span class="page-num left">03</span>
              </div>
            </div>

            <!-- 5. 注册页 -->
            <div class="page">
              <div class="page-content form-page">
                <div class="page-title">注 册</div>

                <div class="compact-form compact-form-reg">
                  <div class="input-group">
                    <label>用户名</label>
                    <input
                      v-model="regName"
                      type="text"
                      placeholder="请输入用户名"
                      autocomplete="off"
                      @click.stop
                      @mousedown.stop
                      @pointerdown.stop
                      @touchstart.stop
                    />
                  </div>

                  <div class="input-group">
                    <label>设置密码</label>
                    <input
                      v-model="regPassword"
                      type="password"
                      placeholder="至少6位"
                      autocomplete="new-password"
                      @click.stop
                      @mousedown.stop
                      @pointerdown.stop
                      @touchstart.stop
                    />
                  </div>

                  <div class="input-group">
                    <label>确认密码</label>
                    <input
                      v-model="regConfirmPassword"
                      type="password"
                      placeholder="请再次输入密码"
                      autocomplete="new-password"
                      @click.stop
                      @mousedown.stop
                      @pointerdown.stop
                      @touchstart.stop
                    />
                  </div>

                  <button
                    class="btn"
                    :disabled="registerLoading"
                    @click.stop="handleRegister"
                    @mousedown.stop
                    @pointerdown.stop
                    @touchstart.stop
                  >
                    {{ registerLoading ? '提交中...' : '注册并激活' }}
                  </button>

                  <div
                    class="switch-hint"
                    @click.stop="goBackToLogin"
                    @mousedown.stop
                    @pointerdown.stop
                    @touchstart.stop
                  >
                    <span>← 翻回上一页</span> 已有账号
                  </div>

                  <div class="footer-note">即刻拥有景点通行证</div>
                </div>

                <span class="page-num right">04</span>
              </div>
            </div>

            <!-- 6. 说明页 -->
            <div class="page page-hard">
              <div class="page-content intro-page intro-page-last">
                <div class="intro-wrap">
                  <div class="intro-tag">TRAVEL NOTE</div>
                  <h2>出发前的约定</h2>
                  <p>
                    1. 用心看风景，也尊重风景<br />
                    2. 与当地人和文化温柔相处<br />
                    3. 让旅途不止是打卡，更是感受<br />
                    4. 收藏一处山水，也记住一段故事<br />
                    5. 愿你在江西遇见惊喜
                  </p>
                  <div class="small-text">带着期待出发 · 带着回忆归来</div>
                </div>
                <span class="page-num left">05</span>
              </div>
            </div>

            <!-- 7. 封底 -->
            <div class="page page-end" data-density="hard">
              <div class="page-content end-page">
                <div class="end-inner">
                  <div class="end-badge">Jiangxi Travel</div>
                  <h2>山川秀丽 · 文脉悠长</h2>
                  <p>愿你从登录开始，走入江西的风景与故事。</p>
                </div>
              </div>
            </div>
          </div>
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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PageFlip } from 'page-flip'
import { loginApi, registerApi } from '@/api/auth'
import { saveLoginInfo } from '@/utils/request'
import coverBg from '../assets/imgs/tongguanwendie.jpg'
import bookBg1 from '../assets/imgs/login_bg1.png'
import bookBg2 from '../assets/imgs/login_bg2.png'
import bookBg3 from '../assets/imgs/login_bg3.png'

const router = useRouter()
const route = useRoute()

const bookRef = ref(null)
const bookSection = ref(null)

const currentPage = ref('cover')

const loginUsername = ref('')
const loginPassword = ref('')

const regName = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')

const loginLoading = ref(false)
const registerLoading = ref(false)

const toastVisible = ref(false)
const toastMessage = ref('')
const toastIsError = ref(false)

let toastTimer = null
let pageFlip = null
let resizeTimer = null
let flipLock = false
let flipLockTimer = null
let isOpeningCover = false

const pageWidth = 420
const pageHeight = 620

function showMessage(msg, isError = false) {
  toastMessage.value = msg
  toastIsError.value = isError
  toastVisible.value = true

  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2200)
}

function mapPageState(index) {
  const total = pageFlip?.getPageCount?.() || 0

  if (index === 0) {
    currentPage.value = 'cover'
    return
  }

  if (index >= total - 1) {
    currentPage.value = 'end'
    return
  }

  if (index === 2) {
    currentPage.value = 'login'
    return
  }

  if (index === 4) {
    currentPage.value = 'register'
    return
  }

  if (index === 1 || index === 3 || index === 5) {
    currentPage.value = 'intro'
    return
  }

  currentPage.value = 'middle'
}

function setHalfBookCoverState() {
  if (!bookSection.value) return
  bookSection.value.style.transform = `translateX(-${pageWidth / 2}px)`
}

function setFullBookCenterState() {
  if (!bookSection.value) return
  bookSection.value.style.transform = 'translateX(0px)'
}

function setHalfBookBackState() {
  if (!bookSection.value) return
  bookSection.value.style.transform = `translateX(${pageWidth / 2}px)`
}

function updateBookState(index) {
  const totalPages = pageFlip?.getPageCount?.() || 0
  if (!bookSection.value) return

  if (isOpeningCover) {
    setFullBookCenterState()
    mapPageState(index)
    return
  }

  if (index === 0) {
    setHalfBookCoverState()
  } else if (index >= totalPages - 1) {
    setHalfBookBackState()
  } else {
    setFullBookCenterState()
  }

  mapPageState(index)
}

function lockFlip() {
  flipLock = true
  if (flipLockTimer) clearTimeout(flipLockTimer)
  flipLockTimer = setTimeout(() => {
    flipLock = false
  }, 1200)
}

function unlockFlip() {
  flipLock = false
  if (flipLockTimer) {
    clearTimeout(flipLockTimer)
    flipLockTimer = null
  }
}

function safeFlipNext(corner = 'top') {
  if (!pageFlip || flipLock) return
  lockFlip()
  pageFlip.flipNext(corner)
}

function safeFlipPrev(corner = 'top') {
  if (!pageFlip || flipLock) return
  lockFlip()
  pageFlip.flipPrev(corner)
}

function initPageFlip() {
  if (!bookRef.value) return

  if (pageFlip) {
    pageFlip.destroy()
    pageFlip = null
  }

  pageFlip = new PageFlip(bookRef.value, {
    width: pageWidth,
    height: pageHeight,
    size: 'fixed',
    minWidth: pageWidth,
    maxWidth: pageWidth,
    minHeight: pageHeight,
    maxHeight: pageHeight,
    maxShadowOpacity: 0.45,
    showCover: true,
    usePortrait: false,
    flippingTime: 900,
    startPage: 0,
    mobileScrollSupport: false,
    swipeDistance: 30,
    clickEventForward: false,
    autoSize: false
  })

  const pages = bookRef.value.querySelectorAll('.page')
  pageFlip.loadFromHTML(pages)

  pageFlip.on('flip', (e) => {
    updateBookState(e.data)
  })

  pageFlip.on('changeState', (e) => {
    const state = e.data

    if (state === 'flipping' && currentPage.value === 'cover') {
      setFullBookCenterState()
    }

    if (state === 'read') {
      isOpeningCover = false
      unlockFlip()
      const index = pageFlip?.getCurrentPageIndex?.() ?? 0
      updateBookState(index)
    }
  })

  pageFlip.on('init', () => {
    updateBookState(0)
  })

  setTimeout(() => {
    updateBookState(0)
  }, 50)
}

function handleCoverClick(event) {
  event?.preventDefault?.()
  event?.stopPropagation?.()

  if (!pageFlip || flipLock) return
  if (currentPage.value !== 'cover') return

  isOpeningCover = true
  setFullBookCenterState()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      safeFlipNext('top')
    })
  })
}

function goToRegister() {
  if (!pageFlip || flipLock) return

  const index = pageFlip.getCurrentPageIndex?.() ?? 0

  if (currentPage.value === 'login' || index === 1 || index === 2 || index === 3) {
    safeFlipNext('top')
  }
}

function goBackToLogin() {
  if (!pageFlip) return
  const index = pageFlip.getCurrentPageIndex?.() ?? 0

  if (index === 4 || index === 3) {
    safeFlipPrev('top')
  }
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
    const res = await loginApi({ username, password })
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

    const res = await registerApi(payload)

    showMessage(res?.message || '注册成功')

    regName.value = ''
    regPassword.value = ''
    regConfirmPassword.value = ''

    setTimeout(() => {
      const index = pageFlip?.getCurrentPageIndex?.() ?? 0
      if (index === 4) {
        safeFlipPrev('top')
      }
    }, 700)
  } catch (error) {
    showMessage(error.message || '注册失败', true)
  } finally {
    registerLoading.value = false
  }
}

function handleResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (!pageFlip) return
    const index = pageFlip.getCurrentPageIndex?.() ?? 0
    updateBookState(index)
  }, 100)
}

function lockBodyScroll() {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  document.body.style.margin = '0'
  document.body.style.width = '100%'
  document.body.style.height = '100%'
}

function unlockBodyScroll() {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  document.body.style.margin = ''
  document.body.style.width = ''
  document.body.style.height = ''
}

onMounted(async () => {
  lockBodyScroll()
  await nextTick()
  initPageFlip()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  unlockBodyScroll()
  window.removeEventListener('resize', handleResize)

  if (toastTimer) clearTimeout(toastTimer)
  if (resizeTimer) clearTimeout(resizeTimer)
  if (flipLockTimer) clearTimeout(flipLockTimer)

  if (pageFlip) {
    pageFlip.destroy()
    pageFlip = null
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

:global(html),
:global(body),
:global(#app) {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.login-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(rgba(16, 12, 8, 0.28), rgba(16, 12, 8, 0.28)),
    url("@/assets/imgs/login_bg.png") center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
}

.book-stage {
  position: relative;
  width: min(1300px, 100vw);
  height: min(820px, 100vh);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  pointer-events: auto;
}

.book-section {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.45s cubic-bezier(0.4, 0.2, 0.2, 1);
  will-change: transform;
  width: 840px;
  height: 620px;
  overflow: visible;
}

.book-clipper {
  position: relative;
  width: 840px;
  height: 620px;
  border-radius: 16px;
  overflow: visible;
  /*box-shadow: 0 28px 70px rgba(0, 0, 0, 0.38);*/
}

.book {
  width: 420px;
  height: 620px;
  overflow: visible;
}

.page {
  background: #fffef7;
  overflow: visible;
}

.page:nth-child(odd) {
  border-left: 1px solid rgba(135, 103, 79, 0.14);
}

.page:nth-child(even) {
  border-right: 1px solid rgba(135, 103, 79, 0.14);
}

.page-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.page-cover {
  background: transparent;
}

.cover-page {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

.page-hard {
  background:
    linear-gradient(180deg, #f7efe3 0%, #f1e6d4 100%);
}

.intro-page {
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, rgba(195, 152, 106, 0.1), transparent 36%),
    linear-gradient(180deg, #f7f0e4 0%, #f3e7d6 100%);
}

.intro-page-mid {
  background:
    radial-gradient(circle at top left, rgba(179, 140, 98, 0.12), transparent 36%),
    linear-gradient(180deg, #f8f1e6 0%, #f2e6d4 100%);
}

.intro-page-last {
  background:
    radial-gradient(circle at top left, rgba(198, 158, 119, 0.12), transparent 36%),
    linear-gradient(180deg, #f8f0e2 0%, #f2e4d1 100%);
}

.intro-wrap {
  width: 100%;
  padding: 62px 38px;
  text-align: center;
  color: #6a4935;
}

.intro-tag {
  color: #9b7c66;
  font-size: 18px;
  letter-spacing: 5px;
  margin-bottom: 22px;
  text-transform: uppercase;
}

.intro-wrap h2 {
  font-size: 34px;
  margin: 0 0 30px;
  color: #7a4c2f;
}

.intro-wrap p {
  line-height: 2;
  font-size: 18px;
}

.small-text {
  margin-top: 28px;
  color: #9e826f;
  font-size: 16px;
}

.form-page {
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    radial-gradient(circle at right top, rgba(206, 169, 130, 0.08), transparent 28%),
    linear-gradient(180deg, #fffef7 0%, #f8f3e8 100%);
}

.page-title {
  text-align: center;
  font-size: 34px;
  color: #7a4c2f;
  letter-spacing: 14px;
  margin: 12px 0 24px;
  font-weight: 700;
}

.compact-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}

.compact-form-reg {
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group label {
  color: #7b5a46;
  font-size: 16px;
  font-weight: 600;
}

.input-group input {
  width: 100%;
  height: 50px;
  border: 1px solid #d7c4a9;
  border-radius: 12px;
  outline: none;
  padding: 0 16px;
  font-size: 16px;
  background: rgba(230, 237, 248, 0.9);
  color: #4e3728;
  transition: all 0.2s ease;
}

.input-group input:focus {
  border-color: #b9855e;
  box-shadow: 0 0 0 3px rgba(185, 133, 94, 0.15);
  background: rgba(236, 242, 251, 0.96);
}

.btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #b8774d, #9c5c37);
  color: #fff7e6;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
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
  margin-top: 8px;
  text-align: center;
  color: #8b694f;
  font-size: 16px;
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
  font-size: 15px;
  margin-top: 8px;
}

.page-end {
  background:
    linear-gradient(135deg, #493528, #6b4a35 46%, #7d553d 100%);
}

.end-page {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f7e7c8;
  text-align: center;
  padding: 36px;
}

.end-inner {
  max-width: 300px;
}

.end-badge {
  display: inline-block;
  margin-bottom: 18px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 240, 214, 0.12);
  border: 1px solid rgba(255, 240, 214, 0.18);
  font-size: 14px;
  letter-spacing: 1px;
}

.end-inner h2 {
  margin: 0 0 18px;
  font-size: 32px;
  line-height: 1.5;
}

.end-inner p {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 240, 214, 0.88);
}

.page-num {
  position: absolute;
  bottom: 18px;
  color: #bfa58b;
  font-size: 13px;
  letter-spacing: 1px;
}

.page-num.left {
  left: 18px;
}

.page-num.right {
  right: 18px;
}

.click-hint {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(28, 28, 28, 0.7);
  font-size: 14px;
  letter-spacing: 2px;
  pointer-events: none;
  z-index: 8;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 82px;
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

@media (max-width: 1200px) {
  .book-stage {
    transform: scale(0.9);
  }
}

@media (max-width: 980px) {
  .book-stage {
    transform: scale(0.78);
  }
}

@media (max-width: 820px) {
  .book-stage {
    transform: scale(0.66);
  }
}
</style>
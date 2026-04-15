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
                :style="{
                  backgroundImage: 'url(' + coverBg + ')',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }"
                @pointerdown.capture.stop.prevent
                @mousedown.capture.stop.prevent
                @touchstart.capture.stop.prevent
                @click.capture.stop.prevent="handleCoverClick"
              ></div>
            </div>

            <!-- 2. 说明页（与第3页共用背景A-左半边） -->
            <div class="page page-hard">
              <div
                class="page-content intro-page spread-page spread-left"
                :style="getSpreadStyle(bookBg1, 'left')"
              >
                <div class="intro-wrap intro-vertical">
                  <div class="intro-col intro-side-note">江西文旅・游览手册</div>
                  <div class="intro-col intro-body">
                    文明旅游，爱护环境。尊重当地风俗，珍视一方人文。行路观景，当以安全为先。山川古迹，皆值得温柔相待。愿你放慢脚步，于旅途中看见江西之美。
                  </div>
                  <div class="intro-col intro-title">景点游览指南</div>
                  <div class="intro-col intro-tag">序</div>
                </div>
                <span class="page-num left">01</span>
              </div>
            </div>

            <!-- 3. 登录页（与第2页共用背景A-右半边） -->
            <div class="page">
              <div
                class="page-content form-page spread-page spread-right"
                :style="getSpreadStyle(bookBg1, 'right')"
              >
                <div class="page-title-wrap">
                  <div class="page-title-seal">印</div>
                  <div class="page-title">登录</div>
                </div>

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

            <!-- 4. 说明页（与第5页共用背景B-左半边） -->
            <div class="page page-hard">
              <div
                class="page-content intro-page intro-page-mid spread-page spread-left"
                :style="getSpreadStyle(bookBg2, 'left')"
              >
                <div class="intro-wrap intro-vertical">
                  <div class="intro-col intro-side-note">山水有相逢・风景有故事</div>
                  <div class="intro-col intro-body">
                    登录之后，你可游览江西各地景点，阅读风物故事，参与趣味互动，收藏心仪路线，也可在山水之间开启一段沉浸式的游览体验。
                  </div>
                  <div class="intro-col intro-title">登录后可体验</div>
                  <div class="intro-col intro-tag">启</div>
                </div>
                <span class="page-num left">03</span>
              </div>
            </div>

            <!-- 5. 注册页（与第4页共用背景B-右半边） -->
            <div class="page">
              <div
                class="page-content form-page spread-page spread-right"
                :style="getSpreadStyle(bookBg2, 'right')"
              >
                <div class="page-title-wrap">
                  <div class="page-title-seal">印</div>
                  <div class="page-title">注册</div>
                </div>

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

            <!-- 6. 说明页（与第7页共用背景C-左半边） -->
            <div class="page page-hard">
              <div
                class="page-content intro-page intro-page-last spread-page spread-left"
                :style="getSpreadStyle(bookBg3, 'left')"
              >
                <div class="intro-wrap intro-vertical">
                  <div class="intro-col intro-side-note">带着期待出发・带着回忆归来</div>
                  <div class="intro-col intro-body">
                    愿你以从容之心看风景，以温柔之意待人文。让旅途不止于到此一游，也让每一次驻足，都成为与江西相遇的印记。
                  </div>
                  <div class="intro-col intro-title">出发前的约定</div>
                  <div class="intro-col intro-tag">记</div>
                </div>
                <span class="page-num left">05</span>
              </div>
            </div>

            <!-- 7. 封底（与第6页共用背景C-右半边） -->
            <div class="page page-end" data-density="hard">
              <div
                class="page-content end-page spread-page spread-right"
                :style="getSpreadStyle(bookBg3, 'right')"
              >
                <div class="end-inner end-vertical">
                  <div class="end-col end-desc">愿你从登录开始，走入江西的风景与故事。</div>
                  <div class="end-col end-title">山川秀丽・文脉悠长</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AncientMessage ref="ancientMessageRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PageFlip } from 'page-flip'
import { loginApi, registerApi } from '@/api/auth'
import { saveLoginInfo } from '@/utils/request'
import AncientMessage from '@/components/AncientMessage.vue'
import { ancientMessageRef } from '@/components/useAncientMessage'
import coverBg from '../assets/imgs/tongguanwendie.jpg'
import bookBg1 from '../assets/imgs/login_bg1.png'
import bookBg2 from '../assets/imgs/login_bg2.png'
import bookBg3 from '../assets/imgs/login_bg3.png'

const router = useRouter()
const route = useRoute()

const bookRef = ref(null)
const bookSection = ref(null)
const ancientMessageLocalRef = ref(null)

const currentPage = ref('cover')

const loginUsername = ref('')
const loginPassword = ref('')

const regName = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')

const loginLoading = ref(false)
const registerLoading = ref(false)

let pageFlip = null
let resizeTimer = null
let flipLock = false
let flipLockTimer = null
let isOpeningCover = false

const pageWidth = 420
const pageHeight = 620

function getSpreadStyle(bg, side) {
  return {
    backgroundImage: `url(${bg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${pageWidth * 2}px ${pageHeight}px`,
    backgroundPosition: side === 'left' ? 'left center' : 'right center'
  }
}

function showMessage(msg, isError = false) {
  const instance = ancientMessageLocalRef.value || ancientMessageRef.value
  if (!instance) return

  if (isError) {
    instance.error(msg)
  } else {
    instance.success(msg)
  }
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
    showMessage(error?.message || '登录失败', true)
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
    showMessage(error?.message || '注册失败', true)
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

  ancientMessageRef.value = ancientMessageLocalRef.value
  initPageFlip()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  unlockBodyScroll()
  window.removeEventListener('resize', handleResize)

  if (resizeTimer) clearTimeout(resizeTimer)
  if (flipLockTimer) clearTimeout(flipLockTimer)

  if (pageFlip) {
    pageFlip.destroy()
    pageFlip = null
  }

  if (ancientMessageRef.value === ancientMessageLocalRef.value) {
    ancientMessageRef.value = null
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
    linear-gradient(rgba(16, 12, 8, 0.18), rgba(16, 12, 8, 0.18)),
    url("@/assets/imgs/login_bg.png") center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "STKaiti", "KaiTi", "FangSong", "Segoe UI", "Microsoft YaHei", sans-serif;
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
}

.book {
  width: 420px;
  height: 620px;
  overflow: visible;
}

.page {
  background: transparent;
  overflow: visible;
}

.page:nth-child(odd) {
  border-left: 1px solid rgba(120, 96, 76, 0.08);
}

.page:nth-child(even) {
  border-right: 1px solid rgba(120, 96, 76, 0.08);
}

.page-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.spread-page {
  background-repeat: no-repeat;
  background-size: 840px 620px;
}

.spread-left {
  background-position: left center;
}

.spread-right {
  background-position: right center;
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
  background: transparent;
}

.intro-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-page-mid {
}

.intro-page-last {
}

.intro-wrap {
  position: absolute;
  top: 54px;
  right: 44px;
  bottom: 48px;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 22px;
  color: #5f4633;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  margin: 0;
}

.intro-vertical {
  writing-mode: vertical-rl;
}

.intro-col {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.intro-tag {
  color: #86654b;
  font-size: 22px;
  letter-spacing: 2px;
  line-height: 1.2;
  padding-top: 10px;
}

.intro-title {
  font-size: 34px;
  color: #6e452d;
  letter-spacing: 4px;
  font-weight: 700;
  line-height: 1.15;
}

.intro-body {
  font-size: 18px;
  color: #5d4634;
  line-height: 1.95;
  letter-spacing: 2px;
  max-height: 470px;
}

.intro-side-note {
  font-size: 15px;
  color: #967a66;
  letter-spacing: 2px;
  line-height: 1.6;
  padding-top: 18px;
}

.form-page {
  position: relative;
  padding: 88px 46px 42px 46px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-title-wrap {
  position: absolute;
  top: 42px;
  right: 26px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  z-index: 2;
}

.page-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 34px;
  line-height: 1.05;
  letter-spacing: 6px;
  margin: 0;
  color: #5c3824;
  font-weight: 700;
  font-family: "STKaiti", "KaiTi", "FangSong", serif;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.2),
    0 2px 6px rgba(92, 56, 36, 0.08);
}

.page-title-seal {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(137, 54, 38, 0.75);
  color: rgba(137, 54, 38, 0.88);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  writing-mode: horizontal-tb;
  font-family: "STKaiti", "KaiTi", serif;
  transform: translateY(6px);
  background: rgba(255, 250, 245, 0.12);
}

.compact-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  padding: 10px 8px 0 8px;
  box-shadow: none;
}

.compact-form-reg {
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group label {
  font-size: 16px;
  color: #6a4b34;
  letter-spacing: 2px;
  font-family: "STKaiti", "KaiTi", serif;
}

.input-group input {
  width: 100%;
  height: 46px;
  border: none;
  outline: none;
  background: rgba(255, 250, 244, 0.14);
  border-bottom: 1.5px solid rgba(113, 79, 54, 0.5);
  padding: 0 4px;
  color: #4e3728;
  font-size: 16px;
  font-family: "STKaiti", "KaiTi", serif;
  transition: all 0.25s ease;
}

.input-group input::placeholder {
  color: rgba(102, 78, 57, 0.45);
}

.input-group input:focus {
  border-bottom-color: #8f5f3c;
  background: rgba(255, 250, 244, 0.2);
}

.btn {
  width: 100%;
  height: 46px;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: 999px;
  background: linear-gradient(135deg, #7a4f34, #5d3a26);
  color: #f8eedf;
  font-size: 16px;
  letter-spacing: 2px;
  font-family: "STKaiti", "KaiTi", serif;
  transition: all 0.25s ease;
  box-shadow: 0 6px 18px rgba(80, 52, 34, 0.16);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(80, 52, 34, 0.2);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.72;
  transform: none;
}

.switch-hint {
  text-align: center;
  color: #7b5e46;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  user-select: none;
  transition: all 0.25s ease;
}

.switch-hint span {
  color: #8f5f3c;
}

.switch-hint:hover {
  color: #5f432f;
}

.footer-note {
  text-align: center;
  color: rgba(98, 74, 55, 0.68);
  font-size: 13px;
  letter-spacing: 3px;
  margin-top: 2px;
}

.end-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 36px;
}

.end-inner {
  max-width: 320px;
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.end-vertical {
  position: absolute;
  top: 72px;
  left: 72px;
  bottom: 58px;
  display: flex;
  flex-direction: row-reverse;
  gap: 22px;
  writing-mode: vertical-rl;
  color: #d8c0a2;
}

.end-col {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.end-title {
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: 4px;
  font-weight: 700;
  color: rgba(234, 183, 107, 0.98);
  text-shadow: 0 1px 4px rgba(36, 22, 14, 0.18);
}

.end-desc {
  font-size: 17px;
  line-height: 1.9;
  letter-spacing: 2px;
  color: rgba(234, 183, 107, 0.98);
  max-height: 420px;
  text-shadow: 0 1px 3px rgba(36, 22, 14, 0.14);
}

.page-num {
  position: absolute;
  bottom: 18px;
  color: rgba(130, 103, 81, 0.72);
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
  color: rgba(40, 33, 26, 0.68);
  font-size: 14px;
  letter-spacing: 2px;
  pointer-events: none;
  z-index: 8;
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
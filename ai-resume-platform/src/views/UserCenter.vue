<template>
  <div class="profile-page">
    <div class="paper-board">
      <div class="paper-top-edge"></div>
      <div class="paper-bottom-edge"></div>

      <div class="intro-title">INTRODUCTION</div>

      <!-- 左上：个人信息 -->
      <section class="note note-user">
        <div class="note-pin"></div>
        <div class="section-label"># WHO I AM</div>
        <div class="note-icon">☕</div>

        <div class="user-basic">
          <p><strong>用户名：</strong>{{ user.name || '未命名用户' }}</p>
          <p><strong>账号：</strong>{{ user.account || user.name || '游客' }}</p>
          <p><strong>注册状态：</strong>{{ isLoggedIn ? '已登录' : '未登录' }}</p>
          <p><strong>个性签名：</strong>{{ user.signature || '热爱记录每一次旅途与相遇' }}</p>
        </div>
      </section>

      <!-- 左下：浏览记录 -->
      <section class="note note-history">
        <div class="note-pin"></div>
        <div class="section-label"># HISTORY</div>
        <div class="note-icon">⌛</div>

        <div class="scroll-area history-scroll">
          <ul v-if="browseHistory.length" class="bullet-list">
            <li v-for="(item, index) in browseHistory.slice(0, 8)" :key="`${item.name}-${index}`">
              <span class="item-title">{{ item.name || item.title || '未知景点' }}</span>
              <span class="item-sub">{{ item.date || '最近浏览' }}</span>
            </li>
          </ul>
          <div v-else class="empty-text">暂时还没有浏览记录</div>
        </div>
      </section>

      <!-- 中间人物 -->
      <section class="center-figure">
        <div class="main-title">About me</div>
        <div class="name-cn">{{ user.name || '旅行者' }}</div>

        <img :src="peopleImg" alt="人物插画" class="people-image" />

        <span class="float-word word-1">INTERESTING</span>
        <span class="float-word word-2">RECORD</span>
        <span class="float-word word-3">INFORMATION</span>

        <span class="arrow arrow-1">↷</span>
        <span class="arrow arrow-2">↶</span>
        <span class="arrow arrow-3">↷</span>

        <div class="life-block">
          <div class="section-label"># My Life</div>
          <p>
            这里记录着我的个人信息、浏览足迹和景点打卡。
            每一次停留，都会成为旅途中独一无二的回忆。
          </p>
        </div>
      </section>

      <!-- 右上：打卡记录 -->
      <section class="note note-checkin">
        <div class="note-pin"></div>
        <div class="small-card-title">CHECK<br />IN</div>
        <div class="small-card-sub">-- 我的打卡记录</div>

        <div class="scroll-area checkin-scroll">
          <ul v-if="checkins.length" class="checkin-list">
            <li v-for="(item, index) in checkins.slice(0, 10)" :key="item.id || index">
              <span>{{ item.name || '未知景点' }}</span>
              <em>{{ item.date || '已打卡' }}</em>
            </li>
          </ul>
          <div v-else class="empty-text">还没有打卡记录</div>
        </div>
      </section>

      <!-- 右下：按钮区 -->
      <section class="note note-action">
        <!-- <div class="section-label">Wonderful</div> -->
        <div class="action-sub">#RECORD</div>

        <div class="stat-lines">
          <p>浏览记录：<strong>{{ browseHistory.length }}</strong> 条</p>
          <p>打卡记录：<strong>{{ checkins.length }}</strong> 条</p>
          <p>评论记录：<strong>{{ myComments.length }}</strong> 条</p>
        </div>

        <div class="action-buttons">
          <button class="action-btn home-btn" @click="goHome">返回首页</button>
          <button class="action-btn logout-btn" @click="logout">退出登录</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const peopleImg = new URL('@/assets/imgs/people.png', import.meta.url).href
const defaultAvatar = new URL('@/assets/imgs/red-soldier.png', import.meta.url).href

const user = reactive({
  name: '',
  account: '',
  avatar: '',
  signature: ''
})

const checkins = ref([])
const myComments = ref([])
const browseHistory = ref([])

const isLoggedIn = computed(() => !!localStorage.getItem('user'))

const scenicMap = {
  1: { name: '庐山', id: 1 },
  2: { name: '井冈山', id: 2 },
  3: { name: '婺源', id: 3 },
  4: { name: '滕王阁', id: 4 },
  5: { name: '三清山', id: 5 },
  6: { name: '龙虎山', id: 6 }
}

const normalizeDate = (value) => {
  if (value) return value
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const loadUserComments = () => {
  const allComments = []

  Object.values(scenicMap).forEach(scene => {
    const comments = JSON.parse(localStorage.getItem(`comments_${scene.id}`) || '[]')
    const userComments = comments.filter(c => c.user === user.name)

    userComments.forEach(c => {
      allComments.push({
        ...c,
        sceneName: scene.name,
        sceneId: scene.id,
        date: normalizeDate(c.date)
      })
    })
  })

  allComments.sort((a, b) => (b.id || 0) - (a.id || 0))
  myComments.value = allComments
}

const loadBrowseHistory = () => {
  const rawHistory =
    JSON.parse(localStorage.getItem('browseHistory') || '[]') ||
    JSON.parse(localStorage.getItem('history') || '[]') ||
    []

  browseHistory.value = rawHistory
    .map((item, index) => ({
      id: item.id || index + 1,
      name: item.name || item.title || '未命名内容',
      date: normalizeDate(item.date || item.time)
    }))
    .reverse()
}

const loadCheckins = () => {
  const rawCheckins = JSON.parse(localStorage.getItem('checkins') || '[]')

  checkins.value = rawCheckins
    .map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      name: item.name || item.title || '未知景点',
      date: normalizeDate(item.date)
    }))
    .sort((a, b) => (b.id || 0) - (a.id || 0))
}

const initUser = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    router.replace('/login')
    return
  }

  const userData = JSON.parse(userStr)
  user.name = userData.name || '旅行者'
  user.account = userData.account || userData.username || userData.name || '游客'
  user.avatar = userData.avatar || defaultAvatar
  user.signature = userData.signature || '热爱记录每一次旅途与相遇'
}

const initPageData = () => {
  initUser()
  loadCheckins()
  loadUserComments()
  loadBrowseHistory()
}

const goHome = () => {
  router.push('/')
}

const logout = () => {
  if (confirm('确定退出登录吗？')) {
    localStorage.removeItem('user')
    router.push('/login')
  }
}

onBeforeMount(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    router.replace('/login')
  }
})

onMounted(() => {
  initPageData()
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(214, 199, 178, 0.45), transparent 22%),
    radial-gradient(circle at bottom left, rgba(220, 208, 189, 0.35), transparent 24%),
    linear-gradient(180deg, #f8f6f1 0%, #efebe3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
}

.paper-board {
  position: relative;
  width: 100%;
  height: calc(100vh - 36px);
  max-width: 1500px;
  background: #f7f5f1;
  border: 12px solid #111;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  padding: 28px 34px;
  box-sizing: border-box;
}

.paper-board::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 22%, rgba(0, 0, 0, 0.04), transparent 18%),
    radial-gradient(circle at 86% 78%, rgba(0, 0, 0, 0.035), transparent 20%);
  pointer-events: none;
}

.paper-top-edge,
.paper-bottom-edge {
  position: absolute;
  left: 0;
  width: 100%;
  height: 30px;
  z-index: 1;
  opacity: 0.7;
}

.paper-top-edge {
  top: 0;
  background-image:
    radial-gradient(circle at 10px 24px, transparent 10px, #f7f5f1 11px),
    radial-gradient(circle at 55px 20px, transparent 14px, #f7f5f1 15px),
    radial-gradient(circle at 112px 24px, transparent 10px, #f7f5f1 11px),
    radial-gradient(circle at 165px 20px, transparent 16px, #f7f5f1 17px),
    linear-gradient(#f7f5f1, #f7f5f1);
}

.paper-bottom-edge {
  bottom: 0;
  transform: rotate(180deg);
  background-image:
    radial-gradient(circle at 10px 24px, transparent 10px, #f7f5f1 11px),
    radial-gradient(circle at 55px 20px, transparent 14px, #f7f5f1 15px),
    radial-gradient(circle at 112px 24px, transparent 10px, #f7f5f1 11px),
    radial-gradient(circle at 165px 20px, transparent 16px, #f7f5f1 17px),
    linear-gradient(#f7f5f1, #f7f5f1);
}

.intro-title {
  position: absolute;
  top: 36px;
  right: 44px;
  font-size: 24px;
  letter-spacing: 8px;
  color: transparent;
  -webkit-text-stroke: 1px #b7b7b7;
  font-weight: 300;
  z-index: 2;
}

.note {
  position: absolute;
  background: rgba(246, 241, 232, 0.92);
  padding: 20px;
  box-sizing: border-box;
  color: #1e1e1e;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 2;
}

.note::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.18)),
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 24px,
      rgba(0, 0, 0, 0.02) 25px
    );
  pointer-events: none;
}

.note-pin {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid #b7b1a6;
  border-radius: 2px;
  top: 16px;
  right: 14px;
  opacity: 0.72;
}

.note-user {
  left: 102px;
  top: 98px;
  width: 330px;
  height: 260px;
}

.note-history {
  left: 52px;
  bottom: 96px;
  width: 365px;
  height: 280px;
}

.note-checkin {
  right: 18px;
  top: 88px;
  width: 330px;
  height: 320px;
  background: rgba(239, 231, 216, 0.95);
}

.note-action {
  right: 118px;
  bottom: 48px;
  width: 350px;
  height: 300px;
  background: rgba(246, 241, 232, 0.96);
}

.section-label {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 14px;
  letter-spacing: 1px;
}

.note-icon {
  position: absolute;
  top: 46px;
  right: 22px;
  font-size: 28px;
  opacity: 0.75;
}

.user-basic p,
.stat-lines p,
.life-block p {
  margin: 10px 0;
  line-height: 1.8;
  font-size: 15px;
}

.small-card-title {
  font-size: 42px;
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.small-card-sub {
  font-size: 28px;
  font-family: 'STKaiti', 'KaiTi', serif;
  margin-bottom: 16px;
}

.scroll-area {
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.history-scroll {
  height: calc(100% - 52px);
}

.checkin-scroll {
  height: calc(100% - 150px);
}

.bullet-list,
.checkin-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.bullet-list li,
.checkin-list li {
  position: relative;
  padding-left: 18px;
  margin-bottom: 14px;
  line-height: 1.6;
  font-size: 15px;
}

.bullet-list li::before,
.checkin-list li::before {
  content: '■';
  position: absolute;
  left: 0;
  top: 0;
  font-size: 10px;
}

.item-title {
  display: block;
  font-weight: 600;
}

.item-sub,
.checkin-list em {
  display: block;
  font-style: normal;
  font-size: 13px;
  color: #666;
}

.empty-text {
  font-size: 14px;
  color: #6b6b6b;
  line-height: 1.7;
}

.center-figure {
  position: absolute;
  left: 50%;
  top: 54%;
  width: 420px;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
}

.main-title {
  font-size: 66px;
  line-height: 1;
  font-family: 'Brush Script MT', 'Segoe Script', 'KaiTi', cursive;
  color: #111;
  margin-bottom: 8px;
  transform: rotate(-3deg);
}

.name-cn {
  font-size: 44px;
  color: #222;
  margin-bottom: 8px;
  font-family: 'STKaiti', 'KaiTi', serif;
  letter-spacing: 2px;
}

.people-image {
  width: 250px;
  max-width: 70%;
  object-fit: contain;
  filter: grayscale(100%) contrast(1.08);
  user-select: none;
}

.float-word {
  position: absolute;
  color: #222;
  font-size: 18px;
  letter-spacing: 1px;
}

.word-1 {
  right: -20px;
  top: 185px;
  transform: rotate(12deg);
}

.word-2 {
  right: 0;
  top: 420px;
  transform: rotate(18deg);
}

.word-3 {
  left: -20px;
  top: 315px;
  transform: rotate(-8deg);
}

.arrow {
  position: absolute;
  color: #111;
  font-size: 38px;
  opacity: 0.8;
}

.arrow-1 {
  right: 88px;
  top: 120px;
}

.arrow-2 {
  left: 45px;
  top: 185px;
}

.arrow-3 {
  right: 70px;
  bottom: 418px;
}

.life-block {
  width: 300px;
  margin: 8px auto 0;
  text-align: left;
  font-size: 15px;
  line-height: 1.8;
  color: #2e2e2e;
}

.action-sub {
  margin-bottom: 16px;
  color: #666;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
}

.action-btn {
  width: 100%;
  height: 46px;
  border: 1px solid #222;
  background: #fffdf8;
  color: #111;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.home-btn {
  background: #111;
  color: #fff;
}

.logout-btn {
  background: #f1ece3;
}

@media (max-width: 1280px) {
  .profile-page {
    height: auto;
    overflow: auto;
    padding: 14px;
  }

  .paper-board {
    height: auto;
    min-height: calc(100vh - 28px);
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 52px 20px 26px;
  }

  .note,
  .center-figure {
    position: relative;
    left: auto;
    right: auto;
    top: auto;
    bottom: auto;
    width: 100%;
    height: auto;
    transform: none;
    margin: 0;
  }

  .scroll-area,
  .history-scroll,
  .checkin-scroll {
    height: auto;
    max-height: 220px;
  }

  .center-figure {
    order: 2;
  }
}

@media (max-width: 768px) {
  .paper-board {
    border-width: 8px;
  }

  .main-title {
    font-size: 52px;
  }

  .name-cn {
    font-size: 32px;
  }

  .people-image {
    width: 210px;
  }

  .float-word,
  .arrow {
    display: none;
  }

  .small-card-title {
    font-size: 48px;
  }

  .small-card-sub {
    font-size: 22px;
  }

  .life-block {
    width: 100%;
  }
}
</style>
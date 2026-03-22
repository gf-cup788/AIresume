<template>
  <div class="user-page">
    <div class="bg-layer"></div>
    <div class="ink ink-1"></div>
    <div class="ink ink-2"></div>
    <div class="bamboo bamboo-1"></div>
    <div class="bamboo bamboo-2"></div>

    <div class="page-wrap">
      <header class="top-line">
        <button class="nav-btn" @click="goHome">
          <span>←</span>
          <span>返回首页</span>
        </button>
        <button class="nav-btn danger" @click="logout">退出登录</button>
      </header>

      <main class="scroll-layout">
        <!-- 左侧：人物卷轴 -->
        <aside class="profile-column">
          <div class="profile-scroll">
            <div class="profile-head">
              <div class="avatar-shell">
                <img :src="user.avatar || defaultAvatar" class="avatar" @error="handleAvatarError" />
                <span class="seal">游</span>
              </div>

              <div class="name-block">
                <div class="minor-text">Jiangxi Travel Notes</div>
                <h1 class="user-name">{{ user.name || '青衫客' }}</h1>
                <p class="sub-line">山水有迹，笔墨留痕</p>
              </div>
            </div>

            <div class="intro-block">
              <p>
                此处记录你的江西游历足迹。每一次景点打卡、每一段评论感受，都会被收进这一页山水长卷之中。
              </p>
            </div>

            <div class="data-lines">
              <div class="data-line">
                <span class="line-label">累计打卡</span>
                <span class="line-value emphasis">{{ checkins.length }} 处</span>
              </div>
              <div class="data-line">
                <span class="line-label">留下评论</span>
                <span class="line-value">{{ myComments.length }} 条</span>
              </div>
              <div class="data-line">
                <span class="line-label">最近状态</span>
                <span class="line-value">{{ latestSceneText }}</span>
              </div>
            </div>

            <div class="quick-actions">
              <button class="ink-btn primary" @click="goHome">继续游历</button>
              <button class="ink-btn" @click="goHome">查看景点</button>
            </div>

            <div class="mini-section">
              <div class="section-caption">最近打卡</div>
              <div v-if="recentCheckins.length" class="vertical-list compact">
                <div v-for="item in recentCheckins" :key="item.id" class="vertical-item">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-date">{{ item.date }}</span>
                </div>
              </div>
              <div v-else class="empty-inline">暂未留下打卡记录</div>
            </div>
          </div>
        </aside>

        <!-- 右侧：正文排版，不走卡片风 -->
        <section class="content-column">
          <section class="content-block">
            <div class="block-head">
              <div>
                <div class="block-en">CHECK-IN ARCHIVE</div>
                <h2>游历留痕</h2>
              </div>
              <div class="block-meta">共 {{ checkins.length }} 处</div>
            </div>

            <div v-if="checkins.length === 0" class="empty-area">
              <div class="empty-title">未曾踏足山水间</div>
              <p>你还没有打卡记录，先去首页看看江西景点吧。</p>
              <button class="ink-btn primary" @click="goHome">去游历</button>
            </div>

            <div v-else class="record-list scenic-list">
              <div v-for="(item, index) in checkins" :key="item.id" class="record-row">
                <div class="record-index">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="record-main">
                  <div class="record-title-row">
                    <h3>{{ item.name }}</h3>
                    <span class="record-tag">已打卡</span>
                  </div>
                  <div class="record-sub">记录日期：{{ item.date }}</div>
                </div>
                <div class="record-seal">印</div>
              </div>
            </div>
          </section>

          <section class="content-block comments-block">
            <div class="block-head">
              <div>
                <div class="block-en">COMMENT MANUSCRIPT</div>
                <h2>笔墨留香</h2>
              </div>
              <div class="block-meta">共 {{ myComments.length }} 条</div>
            </div>

            <div v-if="myComments.length === 0" class="empty-area slim">
              <div class="empty-title">尚未留下只言片语</div>
              <p>去景点详情页写下你的感受吧。</p>
              <button class="ink-btn" @click="goHome">去游览</button>
            </div>

            <div v-else class="record-list comment-list">
              <article
                v-for="item in myComments"
                :key="item.id"
                class="comment-entry"
                @click="goToScene(item.sceneId)"
              >
                <div class="comment-topline">
                  <span class="scene-name">{{ item.sceneName }}</span>
                  <span class="comment-date">{{ item.date }}</span>
                </div>
                <p class="comment-content">{{ item.content }}</p>
                <div class="comment-bottomline">
                  <span class="comment-tag">#{{ item.tag }}</span>
                  <span class="comment-link">查看景点 →</span>
                </div>
              </article>
            </div>
          </section>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const defaultAvatar = new URL('@/assets/imgs/red-soldier.png', import.meta.url).href

const user = reactive({
  avatar: '',
  name: ''
})
const checkins = ref([])
const myComments = ref([])

const recentCheckins = computed(() => checkins.value.slice(0, 4))
const latestSceneText = computed(() => {
  if (checkins.value.length > 0) return `最近到过 ${checkins.value[0].name}`
  if (myComments.value.length > 0) return `最近评论了 ${myComments.value[0].sceneName}`
  return '尚在启程途中'
})

const loadUserComments = () => {
  const allComments = []
  const scenicMap = {
    1: { name: '庐山', id: 1 },
    2: { name: '井冈山', id: 2 },
    3: { name: '婺源', id: 3 }
  }

  Object.values(scenicMap).forEach(scene => {
    const comments = JSON.parse(localStorage.getItem(`comments_${scene.id}`) || '[]')
    const userComments = comments.filter(c => c.user === user.name)
    userComments.forEach(c => {
      allComments.push({
        ...c,
        sceneName: scene.name,
        sceneId: scene.id
      })
    })
  })

  allComments.sort((a, b) => b.id - a.id)
  myComments.value = allComments
}

const goHome = () => {
  router.push('/')
}

const goToScene = (sceneId) => {
  if (sceneId) {
    router.push({
      path: '/detail',
      query: { id: sceneId }
    })
  }
}

const logout = () => {
  if (confirm('确定退出登录吗？')) {
    localStorage.removeItem('user')
    router.push('/')
  }
}

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const initData = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    router.replace('/login')
    return
  }

  const userData = JSON.parse(userStr)
  user.avatar = userData.avatar || defaultAvatar
  user.name = userData.name

  const rawCheckins = JSON.parse(localStorage.getItem('checkins') || '[]')
  checkins.value = rawCheckins
    .map(item => ({
      ...item,
      date: item.date || new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    }))
    .sort((a, b) => b.id - a.id)

  loadUserComments()
}

onBeforeMount(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    router.replace('/login')
  }
})

onMounted(() => {
  initData()
})
</script>

<style scoped>
.user-page {
  position: relative;
  min-height: 100vh;
  background: #f4ecdf;
  color: #4f3b26;
  overflow-x: hidden;
}

.bg-layer {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 18% 20%, rgba(174, 142, 95, 0.1) 0%, transparent 28%),
    radial-gradient(circle at 84% 72%, rgba(135, 108, 70, 0.08) 0%, transparent 30%),
    linear-gradient(180deg, rgba(255, 251, 244, 0.45) 0%, rgba(244, 236, 223, 0.96) 100%);
  z-index: 0;
}

.ink {
  position: fixed;
  border-radius: 50%;
  filter: blur(30px);
  pointer-events: none;
  z-index: 0;
}

.ink-1 {
  width: 240px;
  height: 240px;
  left: -50px;
  top: 120px;
  background: rgba(112, 88, 59, 0.08);
}

.ink-2 {
  width: 300px;
  height: 300px;
  right: -70px;
  bottom: 60px;
  background: rgba(180, 144, 91, 0.08);
}

.bamboo {
  position: fixed;
  width: 78px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"><path fill="rgba(95,120,80,0.14)" d="M50,10 L55,40 L52,45 L48,45 L45,40 L50,10 Z M48,45 L52,45 L55,80 L52,85 L48,85 L45,80 L48,45 Z M48,85 L52,85 L55,120 L52,125 L48,125 L45,120 L48,85 Z M48,125 L52,125 L55,160 L52,165 L48,165 L45,160 L48,125 Z"/></svg>') repeat-y;
  background-size: 100% auto;
  pointer-events: none;
  z-index: 0;
}

.bamboo-1 {
  left: 16px;
  top: 120px;
  height: 380px;
  opacity: 0.34;
  transform: rotate(-5deg);
}

.bamboo-2 {
  right: 16px;
  bottom: 80px;
  height: 330px;
  opacity: 0.34;
  transform: rotate(6deg) scaleX(-1);
}

.page-wrap {
  position: relative;
  z-index: 1;
  width: min(1200px, calc(100% - 44px));
  margin: 0 auto;
  padding: 22px 0 52px;
}

.top-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.nav-btn,
.ink-btn {
  transition: all 0.25s ease;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(176, 143, 97, 0.42);
  background: rgba(249, 242, 230, 0.7);
  color: #86653c;
  cursor: pointer;
}

.nav-btn.danger {
  color: #8e3a31;
  border-color: rgba(154, 57, 46, 0.24);
  background: rgba(154, 57, 46, 0.06);
}

.nav-btn:hover,
.ink-btn:hover,
.comment-entry:hover {
  transform: translateY(-2px);
}

.scroll-layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 34px;
  align-items: start;
}

.profile-column {
  position: sticky;
  top: 18px;
}

.profile-scroll {
  position: relative;
  padding: 28px 24px 26px;
  background: linear-gradient(180deg, rgba(255, 251, 244, 0.78) 0%, rgba(245, 235, 219, 0.94) 100%);
  border-left: 2px solid rgba(176, 143, 97, 0.34);
  border-right: 2px solid rgba(176, 143, 97, 0.18);
  box-shadow: 0 18px 38px rgba(117, 92, 58, 0.08);
}

.profile-scroll::before,
.profile-scroll::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  height: 14px;
  background: linear-gradient(180deg, rgba(201, 170, 122, 0.34), rgba(173, 138, 89, 0.18));
  border-radius: 999px;
}

.profile-scroll::before {
  top: -7px;
}

.profile-scroll::after {
  bottom: -7px;
}

.profile-head {
  text-align: center;
}

.avatar-shell {
  position: relative;
  width: 132px;
  height: 132px;
  margin: 0 auto 18px;
}

.avatar-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px dashed rgba(176, 143, 97, 0.4);
}

.avatar {
  position: absolute;
  inset: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #d4b87a;
  background: #fff;
}

.seal {
  position: absolute;
  right: 8px;
  bottom: 10px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #b44b40, #8d352b);
  color: #fff7ef;
  font-family: "STKaiti", "KaiTi", serif;
  box-shadow: 0 8px 16px rgba(141, 53, 43, 0.2);
}

.minor-text,
.block-en,
.item-date,
.record-sub,
.comment-date,
.sub-line,
.line-label,
.block-meta {
  color: #9b7a50;
}

.minor-text,
.block-en {
  font-size: 12px;
  letter-spacing: 1.2px;
}

.user-name,
.block-head h2,
.record-title-row h3 {
  font-family: "STKaiti", "KaiTi", serif;
}

.user-name {
  margin: 8px 0 4px;
  font-size: 38px;
  letter-spacing: 3px;
  color: #5d4324;
}

.sub-line {
  margin: 0;
  font-size: 13px;
  letter-spacing: 2px;
}

.intro-block {
  margin: 24px 0 22px;
  padding: 18px 0;
  border-top: 1px solid rgba(176, 143, 97, 0.2);
  border-bottom: 1px solid rgba(176, 143, 97, 0.2);
  line-height: 1.95;
  color: #6e5535;
  font-size: 15px;
}

.data-lines {
  display: grid;
  gap: 14px;
}

.data-line {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: baseline;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(176, 143, 97, 0.22);
}

.line-value {
  color: #5c4224;
  text-align: right;
}

.line-value.emphasis {
  font-size: 22px;
  color: #8f392e;
  font-weight: 700;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 24px 0 22px;
}

.ink-btn {
  padding: 11px 18px;
  border-radius: 999px;
  border: 1px solid rgba(176, 143, 97, 0.26);
  background: rgba(255, 248, 235, 0.92);
  color: #7c5d34;
  cursor: pointer;
}

.ink-btn.primary {
  background: linear-gradient(135deg, #b28a55, #8b6a3f);
  color: #fffaf2;
  border: none;
}

.mini-section {
  margin-top: 6px;
}

.section-caption {
  margin-bottom: 12px;
  font-size: 14px;
  color: #8a6a40;
  letter-spacing: 1px;
}

.vertical-list.compact {
  display: grid;
  gap: 10px;
}

.vertical-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(176, 143, 97, 0.18);
}

.item-name {
  color: #5b4124;
}

.empty-inline {
  color: #8b7554;
  font-size: 14px;
}

.content-column {
  display: grid;
  gap: 34px;
}

.content-block {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(176, 143, 97, 0.2);
}

.block-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.block-head h2 {
  margin: 6px 0 0;
  font-size: 34px;
  color: #5d4325;
  letter-spacing: 2px;
}

.empty-area {
  padding: 24px 0 12px;
  color: #775d39;
  line-height: 1.9;
}

.empty-area.slim {
  padding-top: 18px;
}

.empty-title {
  font-size: 22px;
  color: #654828;
  margin-bottom: 6px;
  font-family: "STKaiti", "KaiTi", serif;
}

.record-list {
  display: grid;
}

/* .scenic-list {
  gap: 12px;
} */

.record-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 48px;
  gap: 16px;
  align-items: center;
  padding: 12px 6px;
  border-top: 1px dashed rgba(176, 143, 97, 0.18);
}

.record-index {
  font-size: 24px;
  color: #b08f61;
  font-family: Georgia, serif;
}

.record-title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.record-title-row h3 {
  margin: 0;
  font-size: 26px;
  color: #5a4023;
}

.record-tag {
  font-size: 12px;
  color: #8f6a3c;
  background: rgba(176, 143, 97, 0.12);
  border-radius: 999px;
  padding: 5px 10px;
}

.record-seal {
  justify-self: end;
  color: #9c3f34;
  border: 1px solid rgba(156, 63, 52, 0.36);
  padding: 4px 8px;
  border-radius: 4px;
  transform: rotate(-8deg);
}

.comment-list {
  gap: 0;
}

.comment-entry {
  padding: 18px 2px 18px 0;
  border-top: 1px dashed rgba(176, 143, 97, 0.18);
  cursor: pointer;
}

.comment-topline,
.comment-bottomline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.scene-name {
  font-size: 18px;
  color: #9b6934;
  font-weight: 600;
}

.comment-content {
  margin: 12px 0;
  line-height: 1.95;
  color: #4f3b26;
  font-size: 15px;
}

.comment-tag {
  color: #ba8b45;
}

.comment-link {
  color: #7a5a33;
}

@media (max-width: 980px) {
  .page-wrap {
    width: min(100% - 24px, 1200px);
  }

  .scroll-layout {
    grid-template-columns: 1fr;
    gap: 26px;
  }

  .profile-column {
    position: static;
  }
}

@media (max-width: 640px) {
  .page-wrap {
    padding-top: 16px;
  }

  .profile-scroll {
    padding: 22px 18px;
  }

  .user-name {
    font-size: 30px;
  }

  .block-head h2,
  .record-title-row h3 {
    font-size: 24px;
  }

  .record-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .record-seal {
    display: none;
  }
}
</style>
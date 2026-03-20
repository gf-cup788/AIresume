<template>
  <div class="user">
    <!-- 水墨背景 -->
    <div class="ink-bg"></div>
    
    <!-- 竹叶装饰 -->
    <div class="bamboo bamboo-1"></div>
    <div class="bamboo bamboo-2"></div>
    
    <div class="container">
      <!-- 返回首页按钮 -->
      <button class="back-home" @click="goHome">
        <span class="back-icon">←</span>
        <span>归去来兮</span>
      </button>
      
      <!-- 卷轴式头部 -->
      <div class="scroll-header">
        <div class="scroll-top">
          <span class="scroll-ring"></span>
          <span class="scroll-ring"></span>
        </div>
        
        <div class="profile-section">
          <div class="avatar-frame">
            <img :src="user.avatar || defaultAvatar" class="avatar" @error="handleAvatarError" />
            <div class="avatar-glow"></div>
          </div>
          
          <div class="user-info">
            <div class="name-wrapper">
              <span class="name-prefix">· 君 ·</span>
              <h2 class="user-name">{{ user.name || "青衫客" }}</h2>
              <span class="name-suffix">· 子 ·</span>
            </div>
            <p class="user-title">游历四方 · 寻梦江南</p>
            <div class="user-badge">
              <span class="badge-icon">🏮</span>
              <span>{{ checkins.length }} 处留痕</span>
            </div>
          </div>
        </div>
        
        <div class="scroll-bottom"></div>
      </div>
      
      <!-- 打卡记录 - 诗签风格 -->
      <div class="section">
        <div class="section-title">
          <span class="title-icon">✧</span>
          <h3>游历留痕</h3>
          <span class="title-icon">✧</span>
        </div>
        <div class="title-divider"></div>
        
        <div v-if="checkins.length === 0" class="empty-poem">
          <div class="poem-card">
            <p class="poem-line">未曾踏足山水间</p>
            <p class="poem-line">且待君行觅风光</p>
            <p class="poem-desc">点击地图上的景点，开启你的旅程</p>
            <button class="poem-btn" @click="goHome">去游历 →</button>
          </div>
        </div>
        
        <div class="poem-grid" v-else>
          <div v-for="(item, index) in checkins" :key="item.id" class="poem-card-item" :style="{ animationDelay: index * 0.05 + 's' }">
            <div class="card-inner">
              <div class="card-icon">📍</div>
              <div class="card-name">{{ item.name }}</div>
              <div class="card-date" v-if="item.date">{{ item.date }}</div>
              <div class="card-seal">
                <span class="seal-mark">印</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 评论记录 - 笺纸风格 -->
      <div class="section">
        <div class="section-title">
          <span class="title-icon">✧</span>
          <h3>笔墨留香</h3>
          <span class="title-icon">✧</span>
        </div>
        <div class="title-divider"></div>
        
        <div v-if="myComments.length === 0" class="empty-poem">
          <div class="poem-card">
            <p class="poem-line">尚未留下只言片语</p>
            <p class="poem-line">待君归来题诗壁</p>
            <p class="poem-desc">在景点详情页留下你的感悟</p>
            <button class="poem-btn" @click="goHome">去游览 →</button>
          </div>
        </div>
        
        <div class="comment-list" v-else>
          <div v-for="item in myComments" :key="item.id" class="comment-scroll">
            <div class="comment-paper" @click="goToScene(item.sceneId)">
              <div class="paper-fold"></div>
              <div class="comment-header">
                <span class="comment-scene">🏯 {{ item.sceneName }}</span>
                <span class="comment-tag">#{{ item.tag }}</span>
              </div>
              <p class="comment-content">{{ item.content }}</p>
              <div class="comment-footer">
                <span class="comment-date">{{ item.date }}</span>
                <span class="comment-quote">—— 录于斯景</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 - 印章风格 -->
      <div class="actions">
        <button class="seal-btn explore-btn" @click="goHome">
          <span class="btn-text">继续游历</span>
          <span class="btn-seal">✿</span>
        </button>
        <button class="seal-btn logout-btn" @click="logout">
          <span class="btn-text">辞别归去</span>
          <span class="btn-seal">❁</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const defaultAvatar = new URL('@/assets/imgs/red-soldier.png', import.meta.url).href

// 响应式数据
const user = reactive({
  avatar: '',
  name: ''
})
const checkins = ref([])
const myComments = ref([])

// 加载用户的所有评论
const loadUserComments = () => {
  const allComments = []
  const scenicMap = {
    1: { name: "庐山", id: 1 },
    2: { name: "井冈山", id: 2 },
    3: { name: "婺源", id: 3 }
  }
  
  Object.values(scenicMap).forEach(scene => {
    const comments = JSON.parse(localStorage.getItem(`comments_${scene.id}`) || "[]")
    const userComments = comments.filter(c => c.user === user.name)
    userComments.forEach(c => {
      allComments.push({
        ...c,
        sceneName: scene.name,
        sceneId: scene.id
      })
    })
  })
  
  // 按时间倒序
  allComments.sort((a, b) => b.id - a.id)
  myComments.value = allComments
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 跳转到景点详情
const goToScene = (sceneId) => {
  if (sceneId) {
    router.push({
      path: '/detail',
      query: { id: sceneId }
    })
  }
}

// 退出登录
const logout = () => {
  if (confirm("君欲辞别？")) {
    localStorage.removeItem("user")
    router.push('/')
  }
}

// 头像加载失败处理
const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

// 初始化数据
const initData = () => {
  const userStr = localStorage.getItem("user")
  
  if (!userStr) {
    router.replace('/login')
    return
  }
  
  const userData = JSON.parse(userStr)
  user.avatar = userData.avatar || defaultAvatar
  user.name = userData.name
  
  // 获取打卡数据，添加日期显示
  const rawCheckins = JSON.parse(localStorage.getItem("checkins") || "[]")
  checkins.value = rawCheckins.map(item => ({
    ...item,
    date: item.date || new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }))
  
  // 加载评论
  loadUserComments()
}

onBeforeMount(() => {
  // 在组件挂载前检查登录状态
  const userStr = localStorage.getItem("user")
  if (!userStr) {
    router.replace('/login')
  }
})

onMounted(() => {
  initData()
})
</script>

<style scoped>
.user {
  position: relative;
  min-height: 100vh;
  background: #f5ede0;
  overflow-x: hidden;
}

/* 水墨背景 */
.ink-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(200, 180, 140, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(160, 130, 90, 0.06) 0%, transparent 50%),
    repeating-linear-gradient(45deg, rgba(180, 150, 110, 0.02) 0px, rgba(180, 150, 110, 0.02) 2px, transparent 2px, transparent 8px);
  z-index: 0;
}

/* 竹叶装饰 */
.bamboo {
  position: fixed;
  width: 80px;
  height: 200px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"><path fill="rgba(100,120,80,0.15)" d="M50,10 L55,40 L52,45 L48,45 L45,40 L50,10 Z M48,45 L52,45 L55,80 L52,85 L48,85 L45,80 L48,45 Z M48,85 L52,85 L55,120 L52,125 L48,125 L45,120 L48,85 Z M48,125 L52,125 L55,160 L52,165 L48,165 L45,160 L48,125 Z"/></svg>') repeat-y;
  background-size: 100% auto;
  pointer-events: none;
  z-index: 0;
}

.bamboo-1 {
  left: 20px;
  top: 100px;
  height: 400px;
  opacity: 0.4;
  transform: rotate(-5deg);
}

.bamboo-2 {
  right: 20px;
  bottom: 100px;
  height: 350px;
  opacity: 0.4;
  transform: rotate(5deg) scaleX(-1);
}

.container {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px 24px 60px;
}

/* 返回首页按钮 */
.back-home {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(200, 180, 140, 0.2);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(200, 170, 110, 0.5);
  border-radius: 40px;
  padding: 8px 18px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #8b6b42;
  cursor: pointer;
  transition: all 0.3s;
  font-family: "STKaiti", serif;
}

.back-home:hover {
  background: rgba(200, 180, 140, 0.4);
  transform: translateX(-4px);
}

.back-icon {
  font-size: 16px;
}

/* 卷轴头部 */
.scroll-header {
  background: #fffef7;
  border-radius: 24px 24px 8px 8px;
  margin-bottom: 32px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.8);
  border: 1px solid #e8e0d0;
  position: relative;
  overflow: hidden;
}

.scroll-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(135deg, #f5eddd 0%, #fff8ea 100%);
  border-bottom: 1px solid #e0d4bc;
}

.scroll-top {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 12px 0 8px;
  position: relative;
}

.scroll-ring {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #c9aa5f;
  box-shadow: 0 0 0 2px #f5e6c8, 0 0 0 4px #b88d4a;
}

.profile-section {
  padding: 32px 24px 28px;
  text-align: center;
  position: relative;
}

.avatar-frame {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #d4b87a;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
  z-index: 2;
}

.avatar-glow {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(210,180,110,0.3) 0%, transparent 70%);
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

.name-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.name-prefix, .name-suffix {
  font-size: 14px;
  color: #b89a6a;
  font-style: italic;
  letter-spacing: 2px;
}

.user-name {
  font-size: 28px;
  font-weight: 400;
  color: #4a3b2a;
  margin: 0;
  letter-spacing: 4px;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
}

.user-title {
  font-size: 12px;
  color: #9b8a6b;
  letter-spacing: 2px;
  margin: 8px 0;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #f9efdf, #f5e8d4);
  border-radius: 40px;
  font-size: 13px;
  color: #b87c4a;
  border: 1px solid #e8dcc8;
}

.badge-icon {
  font-size: 14px;
}

.scroll-bottom {
  height: 12px;
  background: linear-gradient(180deg, #e8dcc8, #d4c4a8);
  border-top: 1px solid #c8b894;
}

/* 章节标题 */
.section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.title-icon {
  color: #c9aa5f;
  font-size: 18px;
  letter-spacing: 4px;
}

.section-title h3 {
  font-size: 20px;
  font-weight: 400;
  color: #5d4a2e;
  margin: 0;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  letter-spacing: 4px;
}

.title-divider {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4b87a, #c9aa5f, #d4b87a, transparent);
  margin: 0 auto 24px;
}

/* 空状态诗签 */
.empty-poem {
  text-align: center;
  padding: 20px;
}

.poem-card {
  background: rgba(255, 250, 240, 0.9);
  border-radius: 16px;
  padding: 28px 20px;
  border: 1px solid #e8dcc0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.poem-line {
  font-size: 16px;
  color: #7d6848;
  line-height: 2;
  letter-spacing: 1px;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
}

.poem-desc {
  font-size: 12px;
  color: #b8a072;
  margin: 16px 0 12px;
}

.poem-btn {
  background: linear-gradient(135deg, #ecdba8, #e0cf9c);
  border: none;
  padding: 8px 24px;
  border-radius: 40px;
  font-size: 13px;
  color: #5d4a2e;
  cursor: pointer;
  font-family: "STKaiti", serif;
  transition: all 0.2s;
}

.poem-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* 诗签网格 */
.poem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.poem-card-item {
  animation: fadeInUp 0.4s ease both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-inner {
  background: linear-gradient(135deg, #fffef5, #fff9ef);
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  border: 1px solid #ecdba8;
  position: relative;
  transition: all 0.3s;
  cursor: default;
}

.card-inner:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(100, 70, 30, 0.12);
}

.card-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.card-name {
  font-size: 16px;
  font-weight: 500;
  color: #5d4a2e;
  margin-bottom: 6px;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
}

.card-date {
  font-size: 10px;
  color: #b89a6a;
}

.card-seal {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.seal-mark {
  font-size: 12px;
  color: #c9aa5f;
  font-family: "STKaiti", serif;
  border: 1px solid #d4b87a;
  padding: 2px 4px;
  border-radius: 2px;
  background: rgba(200, 170, 100, 0.1);
  transform: rotate(-10deg);
  display: inline-block;
}

/* 评论笺纸 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-scroll {
  animation: slideIn 0.4s ease both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.comment-paper {
  background: #fffef5;
  border-radius: 4px 16px 16px 4px;
  padding: 20px;
  position: relative;
  border-left: 6px solid #d4b87a;
  box-shadow: 2px 4px 12px rgba(0,0,0,0.06);
  transition: all 0.2s;
  cursor: pointer;
}

.comment-paper:hover {
  box-shadow: 4px 6px 16px rgba(0,0,0,0.1);
  transform: translateX(4px);
}

.paper-fold {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 0;
  border-color: transparent #ecdba8 transparent transparent;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.comment-scene {
  font-size: 14px;
  color: #b87c4a;
  font-weight: 500;
}

.comment-tag {
  font-size: 11px;
  color: #c9aa5f;
  background: rgba(200, 170, 100, 0.15);
  padding: 4px 10px;
  border-radius: 20px;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #4a3b2a;
  margin-bottom: 12px;
  font-style: italic;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #b89a6a;
  border-top: 1px dashed #ecdba8;
  padding-top: 10px;
}

.comment-quote {
  font-family: "STKaiti", serif;
}

/* 操作按钮 */
.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px dashed #d4c0a0;
  flex-wrap: wrap;
}

.seal-btn {
  background: transparent;
  border: none;
  padding: 10px 28px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 40px;
}

.explore-btn {
  background: linear-gradient(135deg, #e8ddcb, #ddd0bb);
  border: 1px solid #c9aa5f;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.logout-btn {
  background: linear-gradient(135deg, #f5ede0, #ebe0ce);
  border: 1px solid #d4b87a;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.btn-text {
  font-size: 15px;
  color: #8b6b42;
  letter-spacing: 3px;
  font-family: "STKaiti", serif;
}

.btn-seal {
  font-size: 14px;
  color: #c9aa5f;
}

.seal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(100, 70, 30, 0.15);
}

.seal-btn:active {
  transform: translateY(0);
}

/* 响应式 */
@media (max-width: 500px) {
  .container {
    padding: 16px 16px 40px;
  }
  
  .avatar {
    width: 80px;
    height: 80px;
  }
  
  .user-name {
    font-size: 22px;
  }
  
  .poem-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  
  .card-inner {
    padding: 12px 8px;
  }
  
  .card-name {
    font-size: 14px;
  }
  
  .actions {
    gap: 12px;
  }
  
  .seal-btn {
    padding: 8px 20px;
  }
  
  .btn-text {
    font-size: 13px;
    letter-spacing: 2px;
  }
}
</style>
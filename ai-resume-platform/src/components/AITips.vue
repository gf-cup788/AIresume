<!-- AITips.vue - 修改后的完整代码 -->
<template>
  <!-- 提示弹窗容器（动态添加到 body） -->
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  // 是否禁用提示（例如对话框打开时）
  disabled: {
    type: Boolean,
    default: false
  },
  // 每日最大提示次数
  maxTipsPerDay: {
    type: Number,
    default: 5
  },
  // 静止阈值（毫秒）
  inactiveThreshold: {
    type: Number,
    default: 120000  // 2分钟
  },
  // 随机推荐间隔（毫秒）
  randomInterval: {
    type: Number,
    default: 420000  // 7分钟
  },
  // 是否启用所有提示类型
  enabled: {
    type: Object,
    default: () => ({
      firstVisit: true,
      profile: true,
      longTimeNoSee: true,
      timeGreeting: true,
      festival: true,
      inactive: true,
      scrollDepth: true,
      backToHome: true,
      random: true
    })
  },
  // 页面初始延迟（用于视频播放期间禁用提示）
  initialDelay: {
    type: Number,
    default: 6000  // 6秒，视频约5秒多，给一点缓冲
  }
})

const emit = defineEmits(['tipShown', 'tipClicked'])

// ========== 提示语库 ==========
const tipMessages = {
  profile: [
    '🌸 客官，可以去「吾之小传」完善一下资料，让小映更了解您吧～',
    '🖼️ 上传个头像，小映就能记住您的模样啦！',
    '✍️ 完善个人资料后，小映会给您更贴心的推荐哦～'
  ],
  inactive: [
    '🍃 客官可是在沉思？若有疑问，随时可以呼唤小映哦～',
    '🌙 发什么呆呢？要不要听听江西的山水故事？',
    '📚 小映这里有许多江西秘境，客官想了解一下吗？',
    '🎋 静坐良久，不如让小映为您推荐一处好去处？'
  ],
  random: [
    '🏔️ 客官知道吗？庐山有"不到三叠泉，不算庐山客"的说法呢！',
    '🍵 景德镇的瓷器，每一件都有自己的故事，想听听吗？',
    '🌸 婺源的油菜花海，每年春天都美得像画一样～',
    '🏯 滕王阁上，王勃写下了"落霞与孤鹜齐飞"，客官去过吗？',
    '🎋 井冈山的翠竹，可是有着红色的记忆呢...',
    '🌊 鄱阳湖的候鸟，冬天的时候特别壮观！',
    '🍜 南昌的拌粉瓦罐汤，客官尝过了吗？',
    '🏮 客家围屋，凝聚了客家人的智慧，小映很推荐去看看！',
    '🏔️ 三清山的云海，被称作"天下第一仙山"呢！',
    '🌊 庐山西海的水上公路，开车像在水面上行驶～'
  ],
  night: [
    '🌙 夜深了，客官还在游历江西呢～ 注意休息哦！',
    '✨ 夜晚的滕王阁灯火辉煌，别有一番风味呢～',
    '⭐ 客官好雅兴，小映陪您夜游江西～'
  ],
  morning: [
    '🌅 早安！江西的晨雾很美，客官今天想去哪里？',
    '🍃 清晨的空气最是清新，适合去庐山走走～',
    '☀️ 新的一天，小映陪您开启江西之旅！'
  ],
  firstVisit: [
    '🎉 欢迎来到江西！小映是您的专属导游，有任何问题随时问我～',
    '🏮 客官第一次来呢～ 让小映带您领略江西的山水人文吧！',
    '🌸 江西有"物华天宝，人杰地灵"的美誉，小映慢慢讲给您听～'
  ],
  backToHome: [
    '🏠 欢迎回来！想继续之前的行程吗？',
    '🌸 客官回来啦～ 小映想念您呢！',
    '📖 继续我们的江西之旅吧～'
  ],
  longTimeNoSee: [
    '🌸 好久不见！客官这段时间去哪里游玩了？',
    '🏔️ 别来无恙～ 小映又收集了好多江西的故事，要听听吗？',
    '🍵 客官终于来了，小映等您好久了呢～'
  ],
  recommend: [
    '🏔️ 最近庐山正是赏枫的好时节，客官有兴趣吗？',
    '🌸 婺源篁岭的晒秋很美，小映强烈推荐！',
    '🏯 喜欢历史的客官，可以去景德镇古窑看看～'
  ],
  festival: {
    '01-01': '🎊 元旦快乐！新的一年，小映陪您走遍江西！',
    '02-10': '🧧 新春大吉！来江西祈福迎新吧～',
    '04-05': '🌿 清明时节，婺源的油菜花开得正好～',
    '05-01': '🎉 劳动节快乐！小映为您准备了特别路线～',
    '06-22': '🐉 端午安康！来南昌看龙舟赛吧！',
    '08-15': '🌕 中秋快乐！在滕王阁赏月最是惬意～',
    '10-01': '🇨🇳 国庆快乐！江西各大景区欢迎您～'
  }
}

// ========== 状态 ==========
const activeTimers = ref([])
const lastUserActivity = ref(Date.now())
const hasShownInactiveTip = ref(false)
const hasShownProfileTip = ref(false)
const hasShownWelcomeTip = ref(false)
const tipShownCount = ref(0)
const lastTipDate = ref('')
const scrollTipShown = ref(false)

// 提示队列管理
const tipQueue = ref([])
let isShowingTip = false
let initialDelayPassed = false

// ========== 工具函数 ==========
const getTimeOfDay = () => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 9) return 'morning'
  if (hour >= 20 || hour < 6) return 'night'
  return 'day'
}

const isFirstVisitToday = () => {
  const today = new Date().toDateString()
  const lastVisit = localStorage.getItem('xiaoying_last_visit')
  if (lastVisit !== today) {
    localStorage.setItem('xiaoying_last_visit', today)
    return true
  }
  return false
}

const isLongTimeNoSee = () => {
  const lastLogin = localStorage.getItem('last_login_time')
  if (!lastLogin) return false
  const daysDiff = (Date.now() - parseInt(lastLogin)) / (1000 * 60 * 60 * 24)
  return daysDiff > 3
}

const canShowTip = () => {
  if (props.disabled) return false
  if (!initialDelayPassed)
  {
    console.log('[延迟测试] initialDelay未通过，当前时间:', Date.now(), '需等待', props.initialDelay, 'ms');
    return false
  } 
  
  const today = new Date().toDateString()
  if (lastTipDate.value !== today) {
    tipShownCount.value = 0
    lastTipDate.value = today
  }
  return tipShownCount.value < props.maxTipsPerDay
}

const getRandomMessage = (category) => {
  const messages = tipMessages[category]
  if (!messages || messages.length === 0) return null
  return messages[Math.floor(Math.random() * messages.length)]
}

// ========== 提示队列处理 ==========
const processTipQueue = () => {
  if (isShowingTip) return
  if (tipQueue.value.length === 0) return
  
  const nextTip = tipQueue.value.shift()
  if (nextTip && canShowTip()) {
    isShowingTip = true
    showTipInternal(nextTip.message, nextTip.duration, nextTip.type, nextTip.onClose)
  }
}

const enqueueTip = (message, duration = 8000, type = 'general', onClose = null) => {
  if (!message) return false
  
  tipQueue.value.push({ message, duration, type, onClose })
  processTipQueue()
  return true
}

// ========== 显示提示（内部实现） ==========
const showTipInternal = (message, duration = 8000, type = 'general', onClose = null) => {
  if (!canShowTip()) {
    isShowingTip = false
    processTipQueue()
    return false
  }
  
  tipShownCount.value++
  emit('tipShown', { message, type, count: tipShownCount.value })
  
  // 创建提示元素
  const tip = document.createElement('div')
  tip.className = 'xiaoying-tip'
  tip.setAttribute('data-type', type)
  tip.innerHTML = `
    <div class="tip-content">${message}</div>
    <div class="tip-close">×</div>
  `
  
  // 定位到小映旁边
  const xiaoyingEl = document.querySelector('.xiaoying-character')
  if (xiaoyingEl) {
    const rect = xiaoyingEl.getBoundingClientRect()
    tip.style.position = 'fixed'
    tip.style.bottom = `${window.innerHeight - rect.top - 150}px`
    tip.style.right = `${window.innerWidth - rect.left - 30}px`
  } else {
    tip.style.position = 'fixed'
    tip.style.bottom = '200px'
    tip.style.right = '20px'
  }
  
  document.body.appendChild(tip)
  
  // 关闭按钮
  const closeBtn = tip.querySelector('.tip-close')
  const cleanup = () => {
    if (tip.parentNode) tip.remove()
    isShowingTip = false
    if (onClose) onClose()
    processTipQueue()
  }
  
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    cleanup()
  })
  
  // 点击提示
  tip.addEventListener('click', (e) => {
    if (e.target !== closeBtn) {
      emit('tipClicked', { message, type })
      cleanup()
    }
  })
  
  // 自动消失
  setTimeout(() => {
    if (tip.parentNode) cleanup()
  }, duration)
  
  // 动画
  setTimeout(() => tip.classList.add('show'), 10)
  return true
}

// 外部调用接口
const showTip = (message, duration = 8000, type = 'general') => {
  return enqueueTip(message, duration, type)
}

// ========== 各种提示检查 ==========
const checkProfileTip = () => {
  if (!props.enabled.profile || hasShownProfileTip.value) return
  
  const user = localStorage.getItem('user')
  if (!user) {
    enqueueTip(getRandomMessage('profile'), 8000, 'profile')
    hasShownProfileTip.value = true
    return
  }
  
  try {
    const userData = JSON.parse(user)
    const hasAvatar = userData.avatar && userData.avatar !== ''
    const hasName = userData.name && userData.name !== '' && userData.name !== '未命名'
    
    if (!hasAvatar || !hasName) {
      enqueueTip(getRandomMessage('profile'), 8000, 'profile')
      hasShownProfileTip.value = true
    }
  } catch (e) {}
}

const checkFirstVisitTip = () => {
  if (!props.enabled.firstVisit) return
  if (isFirstVisitToday()) {
    setTimeout(() => {
      enqueueTip(getRandomMessage('firstVisit'), 10000, 'firstVisit')
    }, 2000)
  }
}

const checkLongTimeNoSeeTip = () => {
  if (!props.enabled.longTimeNoSee) return
  if (isLongTimeNoSee()) {
    setTimeout(() => {
      enqueueTip(getRandomMessage('longTimeNoSee'), 8000, 'longTimeNoSee')
      localStorage.setItem('last_login_time', Date.now().toString())
    }, 3000)
  }
}

const checkTimeGreetingTip = () => {
  if (!props.enabled.timeGreeting) return
  const timeOfDay = getTimeOfDay()
  if (timeOfDay !== 'day' && !hasShownWelcomeTip.value) {
    setTimeout(() => {
      const greeting = getRandomMessage(timeOfDay)
      if (greeting) enqueueTip(greeting, 6000, 'timeGreeting')
      hasShownWelcomeTip.value = true
    }, 4000)
  }
}

const checkFestivalTip = () => {
  if (!props.enabled.festival) return
  const today = new Date()
  const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const festivalMsg = tipMessages.festival[monthDay]
  if (festivalMsg && !localStorage.getItem(`festival_${monthDay}_shown`)) {
    setTimeout(() => {
      enqueueTip(festivalMsg, 10000, 'festival')
      localStorage.setItem(`festival_${monthDay}_shown`, 'true')
    }, 5000)
  }
}

const checkInactivityTip = () => {
  if (!props.enabled.inactive) return
  if (hasShownInactiveTip.value) return
  
  const inactiveTime = Date.now() - lastUserActivity.value
  if (inactiveTime > props.inactiveThreshold) {
    enqueueTip(getRandomMessage('inactive'), 8000, 'inactive')
    hasShownInactiveTip.value = true
  }
}

const checkScrollDepthTip = () => {
  if (!props.enabled.scrollDepth) return
  if (scrollTipShown.value) return
  
  const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight
  if (scrollPercent > 0.8) {
    enqueueTip('📜 客官看得真仔细！小映还可以给您讲更多江西的故事哦～', 6000, 'scrollDepth')
    scrollTipShown.value = true
  }
}

const checkBackToHomeTip = () => {
  if (!props.enabled.backToHome) return
  if (document.referrer && document.referrer.includes(window.location.host)) {
    setTimeout(() => {
      enqueueTip(getRandomMessage('backToHome'), 5000, 'backToHome')
    }, 1500)
  }
}

const randomRecommendation = () => {
  if (!props.enabled.random) return
  if (Math.random() > 0.35) return
  enqueueTip(getRandomMessage('random'), 8000, 'random')
}

// ========== 用户活动监听 ==========
const onUserActivity = () => {
  lastUserActivity.value = Date.now()
  hasShownInactiveTip.value = false
}

const setupActivityTracking = () => {
  const activityEvents = ['mousemove', 'click', 'keydown', 'touchstart']
  activityEvents.forEach(event => {
    window.addEventListener(event, onUserActivity)
  })
  window.addEventListener('scroll', () => {
    onUserActivity()
    checkScrollDepthTip()
  })
  window.activityEvents = activityEvents
}

const removeActivityTracking = () => {
  if (window.activityEvents) {
    window.activityEvents.forEach(event => {
      window.removeEventListener(event, onUserActivity)
    })
  }
  window.removeEventListener('scroll', checkScrollDepthTip)
}

// ========== 启动/停止 ==========
const start = () => {
  const timers = [
    setTimeout(() => checkFirstVisitTip(), 1000),
    setTimeout(() => checkLongTimeNoSeeTip(), 2000),
    setTimeout(() => checkTimeGreetingTip(), 3000),
    setTimeout(() => checkFestivalTip(), 4000),
    setTimeout(() => checkProfileTip(), 5000),
    setTimeout(() => checkBackToHomeTip(), 800),
    setInterval(() => checkInactivityTip(), 60000),
    setInterval(() => randomRecommendation(), props.randomInterval),
  ]
  activeTimers.value.push(...timers)
  setupActivityTracking()
}

const stop = () => {
  activeTimers.value.forEach(timer => {
    if (timer) {
      if (typeof timer === 'number') clearTimeout(timer)
      if (timer._id) clearInterval(timer)
    }
  })
  activeTimers.value = []
  removeActivityTracking()
}

// ========== 重置状态（用于登录/登出） ==========
const reset = () => {
  hasShownProfileTip.value = false
  hasShownWelcomeTip.value = false
  scrollTipShown.value = false
  lastUserActivity.value = Date.now()
  tipQueue.value = []
  isShowingTip = false
}

// 暴露方法给父组件
defineExpose({
  start,
  stop,
  reset,
  showTip
})

// ========== 生命周期 ==========
onMounted(() => {
  // 延迟启动，等待视频播放结束
  setTimeout(() => {
    initialDelayPassed = true
    start()
  }, props.initialDelay)
  
  // 记录登录时间
  if (!localStorage.getItem('last_login_time')) {
    localStorage.setItem('last_login_time', Date.now().toString())
  }
})

onBeforeUnmount(() => {
  stop()
})

// 监听 disabled 变化
watch(() => props.disabled, (newVal) => {
  if (newVal) {
    stop()
  } else {
    if (initialDelayPassed) {
      start()
    }
  }
})
</script>

<style>
/* 样式保持不变 */
.xiaoying-tip {
  position: fixed;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(255, 250, 245, 0.96);
  backdrop-filter: blur(4px);
  border: 1px solid #e8c8b8;
  border-radius: 8px;
  padding: 12px 16px;
  max-width: 260px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  z-index: 10001;
  opacity: 0;
  transform: translateX(20px) scale(0.96);
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}

/* 浮动动画 */
@keyframes tipFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.xiaoying-tip.show {
  opacity: 1;
  transform: translateX(0) scale(1);
  animation: tipFloat 2.5s ease-in-out infinite;
}

/* 小箭头指向小映 */
.xiaoying-tip::before {
  content: '';
  position: absolute;
  right: -7px;
  bottom: 14px;
  width: 0;
  height: 0;
  border-left: 7px solid #e8c8b8;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.xiaoying-tip::after {
  content: '';
  position: absolute;
  right: -5px;
  bottom: 15px;
  width: 0;
  height: 0;
  border-left: 6px solid rgba(255, 250, 245, 0.96);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.tip-content {
  flex: 1;
  font-size: 13px;
  color: #8b5a4a;
  line-height: 1.5;
  letter-spacing: 0.3px;
}

.tip-close {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #d4a58e;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 4px;
}

.tip-close:hover {
  background: rgba(232, 128, 90, 0.15);
  color: #e8907a;
}

.xiaoying-tip:hover {
  transform: translateX(2px);
  background: rgba(255, 250, 245, 1);
  border-color: #d4a58e;
}
</style>
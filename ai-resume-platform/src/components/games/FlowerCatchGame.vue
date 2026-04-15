<template>
  <div class="flower-game">
    <div class="flower-topbar">
      <div class="flower-stat">
        <span class="label">景点</span>
        <span class="value">{{ scenicName }}</span>
      </div>
      <div class="flower-stat">
        <span class="label">得分</span>
        <span class="value">{{ score }}</span>
      </div>
      <div class="flower-stat">
        <span class="label">目标</span>
        <span class="value">{{ targetScore }}</span>
      </div>
      <div class="flower-stat">
        <span class="label">漏掉</span>
        <span class="value">{{ missed }}</span>
      </div>
    </div>

    <div
      ref="gameAreaRef"
      class="game-area"
      :style="gameAreaStyle"
      tabindex="0"
      @mousemove="handleMouseMove"
      @touchmove.prevent="handleTouchMove"
    >
      <div class="game-bg-mask"></div>

      <div v-if="loadingBg" class="bg-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在加载游戏资源...</div>
      </div>

      <transition-group name="flower-drop" tag="div">
        <div
          v-for="flower in flowers"
          :key="flower.id"
          class="flower-item"
          :style="{
            left: flower.x + 'px',
            top: flower.y + 'px',
            transform: `rotate(${flower.rotate}deg) scale(${flower.scale})`
          }"
        >
          <img
            v-if="dropImageUrl"
            :src="dropImageUrl"
            alt="掉落物"
            class="flower-img"
            draggable="false"
          />
          <span v-else class="flower-fallback">🌸</span>
        </div>
      </transition-group>

      <div class="basket" :style="{ left: basketX + 'px' }">
        <div class="basket-inner">花篮</div>
      </div>

      <div v-if="!started && !gameOver" class="game-mask">
        <div class="game-mask-card">
          <div class="mask-title">{{ scenicName }} · 接物小游戏</div>
          <div class="mask-desc">
            移动下方花篮，接住从空中掉落的景点物品。达到目标分数即可通关。
          </div>
          <div class="mask-tip">
            电脑端可用鼠标移动，手机端可直接手指滑动。
          </div>
          <button class="action-btn primary" @click="startGame">开始游戏</button>
        </div>
      </div>

      <div v-if="gameOver && !success" class="game-mask">
        <div class="game-mask-card">
          <div class="mask-title">再试一次</div>
          <div class="mask-desc">
            这次获得 {{ score }} 分，距离目标还差 {{ Math.max(targetScore - score, 0) }} 分。
          </div>
          <div class="mask-tip">
            漏掉太多了，重新试试看吧。
          </div>
          <button class="action-btn primary" @click="restartGame">重新开始</button>
        </div>
      </div>

      <transition name="fade-up">
        <div v-if="success" class="success-card">
          <div class="success-icon">🎉</div>
          <div class="success-title">挑战成功</div>
          <div class="success-desc">
            你成功接住了足够多的景点物品，完成了 {{ scenicName }} 小游戏。
          </div>
          <button class="action-btn primary" @click="emitSuccess">完成并继续</button>
        </div>
      </transition>
    </div>

    <div class="flower-actions">
      <button class="action-btn" @click="restartGame">重新开始</button>
      <button class="action-btn" @click="togglePause">
        {{ paused ? '继续游戏' : '暂停游戏' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { request } from '@/utils/request'
import defaultFlowerBg from '@/assets/imgs/duihuapg.png'

const props = defineProps({
  scenicId: {
    type: Number,
    default: null
  },
  scenicName: {
    type: String,
    default: '婺源'
  },
  targetScore: {
    type: Number,
    default: 12
  },
  maxMissed: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['success'])

const gameAreaRef = ref(null)

const gameWidth = ref(640)
const gameHeight = ref(520)

const basketWidth = 108
const basketHeight = 60
const flowerSize = 44

const basketX = ref(260)

const flowers = ref([])
const score = ref(0)
const missed = ref(0)

const started = ref(false)
const paused = ref(false)
const gameOver = ref(false)
const success = ref(false)

const bgImageUrl = ref('')
const dropImageUrl = ref('')
const loadingBg = ref(false)

let animationTimer = null
let spawnTimer = null
let flowerId = 1

const random = (min, max) => Math.random() * (max - min) + min

const gameAreaStyle = computed(() => {
  const bg = bgImageUrl.value || defaultFlowerBg
  return {
    backgroundImage: `url(${bg})`
  }
})

const clampBasket = (x) => {
  const maxX = Math.max(gameWidth.value - basketWidth, 0)
  if (x < 0) return 0
  if (x > maxX) return maxX
  return x
}

const updateGameSize = async () => {
  await nextTick()
  if (!gameAreaRef.value) return
  const rect = gameAreaRef.value.getBoundingClientRect()
  gameWidth.value = rect.width
  gameHeight.value = rect.height
  basketX.value = clampBasket(basketX.value)
}

const preloadImage = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve('')
      return
    }
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => resolve('')
    img.src = url
  })
}

const fetchGameAssets = async () => {
  if (!props.scenicId) {
    bgImageUrl.value = ''
    dropImageUrl.value = ''
    return
  }

  loadingBg.value = true
  try {
    const res = await request(`/api/games/start?scenicId=${props.scenicId}`, {
      method: 'GET'
    })

    if (res?.code === 200 && res?.data) {
      const remoteBg = res.data.bgImageUrl || ''
      const remoteDropImage = res.data.flowerImageUrl || ''

      const [loadedBg, loadedDropImage] = await Promise.all([
        preloadImage(remoteBg),
        preloadImage(remoteDropImage)
      ])

      bgImageUrl.value = loadedBg
      dropImageUrl.value = loadedDropImage

      console.log('接物游戏资源加载成功:', {
        bgImageUrl: loadedBg,
        flowerImageUrl: loadedDropImage
      })
    } else {
      bgImageUrl.value = ''
      dropImageUrl.value = ''
      console.error('获取接物游戏资源失败:', res?.message)
    }
  } catch (error) {
    bgImageUrl.value = ''
    dropImageUrl.value = ''
    console.error('获取接物游戏资源失败:', error)
  } finally {
    loadingBg.value = false
  }
}

const createFlower = () => {
  const x = random(8, Math.max(gameWidth.value - flowerSize - 8, 8))
  return {
    id: flowerId++,
    x,
    y: -flowerSize,
    speed: random(2.4, 4.8),
    rotate: random(-25, 25),
    drift: random(-0.7, 0.7),
    scale: random(0.92, 1.16)
  }
}

const clearTimers = () => {
  if (animationTimer) {
    cancelAnimationFrame(animationTimer)
    animationTimer = null
  }
  if (spawnTimer) {
    clearInterval(spawnTimer)
    spawnTimer = null
  }
}

const resetState = () => {
  flowers.value = []
  score.value = 0
  missed.value = 0
  paused.value = false
  gameOver.value = false
  success.value = false
  started.value = false
  basketX.value = clampBasket((gameWidth.value - basketWidth) / 2)
}

const startLoop = () => {
  clearTimers()

  spawnTimer = setInterval(() => {
    if (!started.value || paused.value || gameOver.value || success.value) return
    flowers.value.push(createFlower())
  }, 620)

  const tick = () => {
    if (!started.value || paused.value || gameOver.value || success.value) {
      animationTimer = requestAnimationFrame(tick)
      return
    }

    const basketTop = gameHeight.value - basketHeight - 18
    const basketLeft = basketX.value
    const basketRight = basketX.value + basketWidth

    const nextFlowers = []

    for (const flower of flowers.value) {
      const nextY = flower.y + flower.speed
      const nextX = flower.x + flower.drift

      const flowerCenterX = nextX + flowerSize / 2
      const flowerBottomY = nextY + flowerSize

      const caught =
        flowerBottomY >= basketTop &&
        flowerBottomY <= basketTop + basketHeight + 10 &&
        flowerCenterX >= basketLeft + 8 &&
        flowerCenterX <= basketRight - 8

      if (caught) {
        score.value += 1

        if (score.value >= props.targetScore) {
          success.value = true
          paused.value = true
          clearTimers()
          break
        }
        continue
      }

      if (nextY > gameHeight.value) {
        missed.value += 1
        if (missed.value >= props.maxMissed) {
          gameOver.value = true
          paused.value = true
          clearTimers()
          break
        }
        continue
      }

      nextFlowers.push({
        ...flower,
        x: nextX,
        y: nextY
      })
    }

    if (!success.value && !gameOver.value) {
      flowers.value = nextFlowers
      animationTimer = requestAnimationFrame(tick)
    }
  }

  animationTimer = requestAnimationFrame(tick)
}

const startGame = async () => {
  await updateGameSize()
  resetState()
  started.value = true
  startLoop()
  gameAreaRef.value?.focus?.()
}

const restartGame = async () => {
  clearTimers()
  await updateGameSize()
  flowers.value = []
  score.value = 0
  missed.value = 0
  paused.value = false
  gameOver.value = false
  success.value = false
  started.value = true
  basketX.value = clampBasket((gameWidth.value - basketWidth) / 2)
  startLoop()
  gameAreaRef.value?.focus?.()
}

const togglePause = () => {
  if (!started.value || gameOver.value || success.value) return
  paused.value = !paused.value
}

const handleMouseMove = (e) => {
  if (!started.value || success.value || gameOver.value) return
  const rect = gameAreaRef.value?.getBoundingClientRect()
  if (!rect) return
  const x = e.clientX - rect.left - basketWidth / 2
  basketX.value = clampBasket(x)
}

const handleTouchMove = (e) => {
  if (!started.value || success.value || gameOver.value) return
  const rect = gameAreaRef.value?.getBoundingClientRect()
  if (!rect) return
  const touch = e.touches?.[0]
  if (!touch) return
  const x = touch.clientX - rect.left - basketWidth / 2
  basketX.value = clampBasket(x)
}

const handleKeydown = (e) => {
  if (!started.value || success.value || gameOver.value) return

  if (e.key === 'ArrowLeft') {
    basketX.value = clampBasket(basketX.value - 28)
  } else if (e.key === 'ArrowRight') {
    basketX.value = clampBasket(basketX.value + 28)
  } else if (e.key === ' ') {
    e.preventDefault()
    togglePause()
  }
}

const emitSuccess = () => {
  emit('success')
}

watch(
  () => props.scenicId,
  async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      clearTimers()
      resetState()
      await fetchGameAssets()
      await updateGameSize()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await updateGameSize()
  await fetchGameAssets()
  window.addEventListener('resize', updateGameSize)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  clearTimers()
  window.removeEventListener('resize', updateGameSize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.flower-game {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flower-topbar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.flower-stat {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(106, 151, 71, 0.14);
  border-radius: 16px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(120, 148, 97, 0.08);
}

.flower-stat .label {
  display: block;
  font-size: 12px;
  color: #75856e;
  margin-bottom: 4px;
}

.flower-stat .value {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #5a6f49;
}

.game-area {
  position: relative;
  width: 100%;
  height: 540px;
  overflow: hidden;
  border-radius: 24px;
  border: none;
  background-color: #eef5ea;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  box-shadow: 0 16px 36px rgba(104, 132, 84, 0.12);
}

.game-bg-mask {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(246, 241, 228, 0.18)),
    radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 55%);
  pointer-events: none;
}

.bg-loading {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(108, 146, 78, 0.16);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 18px rgba(91, 120, 72, 0.08);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(136, 181, 106, 0.2);
  border-top-color: #88b56a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 12px;
  color: #5a6f49;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.flower-item {
  position: absolute;
  width: 44px;
  height: 44px;
  user-select: none;
  pointer-events: none;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flower-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.16));
}

.flower-fallback {
  font-size: 30px;
  line-height: 1;
  text-shadow: 0 6px 10px rgba(140, 90, 120, 0.16);
}

.basket {
  position: absolute;
  bottom: 18px;
  width: 108px;
  height: 60px;
  border-radius: 18px 18px 24px 24px;
  background: linear-gradient(180deg, #ba8657, #9f6b3f);
  box-shadow:
    inset 0 3px 0 rgba(255, 255, 255, 0.2),
    0 8px 18px rgba(112, 78, 42, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.basket::before {
  content: '';
  position: absolute;
  top: -18px;
  left: 18px;
  right: 18px;
  height: 22px;
  border: 4px solid #a87749;
  border-bottom: none;
  border-radius: 18px 18px 0 0;
}

.basket-inner {
  color: #fff7ef;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
}

.game-mask {
  position: absolute;
  inset: 0;
  background: rgba(247, 244, 234, 0.56);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 4;
  border-radius: 24px;
}

.game-mask-card {
  width: min(440px, 100%);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(116, 150, 92, 0.16);
  box-shadow: 0 18px 42px rgba(111, 136, 89, 0.16);
  padding: 28px 24px;
  text-align: center;
}

.mask-title {
  font-size: 22px;
  font-weight: 800;
  color: #587145;
}

.mask-desc {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.8;
  color: #6f7f61;
}

.mask-tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.7;
  color: #8b9880;
}

.flower-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  border: none;
  border-radius: 999px;
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: #5f6d4e;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(118, 147, 90, 0.16);
  box-shadow: 0 8px 20px rgba(122, 149, 100, 0.1);
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.primary {
  background: linear-gradient(135deg, #88b56a, #729956);
  color: #fff;
  border: none;
}

.success-card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(420px, calc(100% - 36px));
  border-radius: 22px;
  padding: 24px 20px;
  background: linear-gradient(135deg, rgba(255, 251, 236, 0.97), rgba(240, 249, 232, 0.97));
  border: 1px solid rgba(122, 166, 86, 0.18);
  box-shadow: 0 12px 26px rgba(116, 147, 92, 0.12);
  text-align: center;
  z-index: 5;
}

.success-icon {
  font-size: 30px;
  margin-bottom: 8px;
}

.success-title {
  font-size: 20px;
  font-weight: 800;
  color: #5a7446;
}

.success-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #758469;
  line-height: 1.7;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.28s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 12px));
}

@media (max-width: 900px) {
  .flower-topbar {
    grid-template-columns: repeat(2, 1fr);
  }

  .game-area {
    height: 500px;
  }
}

@media (max-width: 640px) {
  .flower-topbar {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .game-area {
    height: 440px;
    border-radius: 18px;
  }

  .basket {
    width: 92px;
    height: 54px;
  }

  .flower-item {
    width: 38px;
    height: 38px;
  }

  .game-mask-card {
    padding: 22px 18px;
  }

  .mask-title {
    font-size: 20px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
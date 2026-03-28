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
      tabindex="0"
      @mousemove="handleMouseMove"
      @touchmove.prevent="handleTouchMove"
    >
      <div class="sky-decor sky-1"></div>
      <div class="sky-decor sky-2"></div>
      <div class="sky-decor sky-3"></div>

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
          🌸
        </div>
      </transition-group>

      <div
        class="basket"
        :style="{ left: basketX + 'px' }"
      >
        <div class="basket-inner">花篮</div>
      </div>

      <div v-if="!started && !gameOver" class="game-mask">
        <div class="game-mask-card">
          <div class="mask-title">婺源 · 接花小游戏</div>
          <div class="mask-desc">
            移动下方花篮，接住掉落的花朵。达到目标分数即可通关。
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
            漏掉太多花朵了，重新试试看吧。
          </div>
          <button class="action-btn primary" @click="restartGame">重新开始</button>
        </div>
      </div>

      <transition name="fade-up">
        <div v-if="success" class="success-card">
          <div class="success-icon">🎉</div>
          <div class="success-title">挑战成功</div>
          <div class="success-desc">
            你成功接住了足够多的花朵，完成了 {{ scenicName }} 小游戏。
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
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
const gameHeight = ref(420)

const basketWidth = 96
const basketHeight = 56
const flowerSize = 28

const basketX = ref(260)

const flowers = ref([])
const score = ref(0)
const missed = ref(0)

const started = ref(false)
const paused = ref(false)
const gameOver = ref(false)
const success = ref(false)

let animationTimer = null
let spawnTimer = null
let flowerId = 1

const random = (min, max) => Math.random() * (max - min) + min

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

const createFlower = () => {
  const x = random(8, Math.max(gameWidth.value - flowerSize - 8, 8))
  return {
    id: flowerId++,
    x,
    y: -30,
    speed: random(2.2, 4.4),
    rotate: random(-25, 25),
    drift: random(-0.6, 0.6),
    scale: random(0.95, 1.2)
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
  }, 650)

  const tick = () => {
    if (!started.value || paused.value || gameOver.value || success.value) {
      animationTimer = requestAnimationFrame(tick)
      return
    }

    const basketTop = gameHeight.value - basketHeight - 14
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
        flowerCenterX >= basketLeft + 6 &&
        flowerCenterX <= basketRight - 6

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

onMounted(async () => {
  await updateGameSize()
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
  gap: 14px;
}

.flower-topbar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.flower-stat {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(106, 151, 71, 0.14);
  border-radius: 14px;
  padding: 10px 8px;
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
  height: 420px;
  overflow: hidden;
  border-radius: 22px;
  border: 2px solid rgba(108, 146, 78, 0.18);
  background:
    linear-gradient(180deg, #eef8ff 0%, #f3fbff 28%, #f8f7eb 72%, #f2eedf 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.55),
    0 16px 36px rgba(104, 132, 84, 0.12);
}

.sky-decor {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  filter: blur(0.2px);
}

.sky-1 {
  width: 92px;
  height: 28px;
  top: 34px;
  left: 40px;
}

.sky-2 {
  width: 120px;
  height: 34px;
  top: 74px;
  right: 66px;
}

.sky-3 {
  width: 80px;
  height: 24px;
  top: 126px;
  left: 180px;
}

.flower-item {
  position: absolute;
  width: 28px;
  height: 28px;
  font-size: 24px;
  line-height: 28px;
  text-align: center;
  user-select: none;
  pointer-events: none;
  text-shadow: 0 6px 10px rgba(140, 90, 120, 0.16);
}

.basket {
  position: absolute;
  bottom: 14px;
  width: 96px;
  height: 56px;
  border-radius: 18px 18px 24px 24px;
  background: linear-gradient(180deg, #ba8657, #9f6b3f);
  box-shadow:
    inset 0 3px 0 rgba(255, 255, 255, 0.2),
    0 8px 18px rgba(112, 78, 42, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: rgba(247, 244, 234, 0.62);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-mask-card {
  width: min(420px, 100%);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(116, 150, 92, 0.16);
  box-shadow: 0 18px 42px rgba(111, 136, 89, 0.16);
  padding: 26px 24px;
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
  padding: 10px 18px;
  font-size: 13px;
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
  width: min(360px, calc(100% - 32px));
  border-radius: 20px;
  padding: 24px 22px;
  background: linear-gradient(135deg, rgba(255, 251, 236, 0.97), rgba(240, 249, 232, 0.97));
  border: 1px solid rgba(122, 166, 86, 0.18);
  box-shadow: 0 18px 40px rgba(116, 147, 92, 0.16);
  text-align: center;
}

.success-icon {
  font-size: 28px;
  margin-bottom: 6px;
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
  line-height: 1.8;
}

.flower-drop-enter-active,
.flower-drop-leave-active {
  transition: opacity 0.2s ease;
}

.flower-drop-enter-from,
.flower-drop-leave-to {
  opacity: 0;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.28s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 10px));
}

@media (max-width: 900px) {
  .flower-topbar {
    grid-template-columns: repeat(2, 1fr);
  }

  .game-area {
    height: 380px;
  }
}

@media (max-width: 600px) {
  .game-area {
    height: 340px;
    border-radius: 18px;
  }

  .game-mask-card {
    padding: 22px 18px;
    border-radius: 18px;
  }

  .mask-title {
    font-size: 20px;
  }

  .basket {
    width: 88px;
    height: 52px;
  }
}
</style>
<template>
  <div class="memory-game">
    <div class="game-header">
      <div class="game-stat">
        <span class="label">步数</span>
        <span class="value">{{ steps }}</span>
      </div>
      <div class="game-stat">
        <span class="label">已消除</span>
        <span class="value">{{ matchedCount }}/{{ totalPairs }}</span>
      </div>
      <div class="game-stat">
        <span class="label">状态</span>
        <span class="value">{{ finished ? '已完成' : '进行中' }}</span>
      </div>
    </div>

    <!-- 游戏描述区域（新增） -->
    <!-- <div v-if="gameDescription" class="game-description">
      <div class="description-icon">📖</div>
      <div class="description-text">{{ gameDescription }}</div>
    </div> -->

    <div class="game-actions">
      <button class="game-btn primary" @click="restartGame">重新开始</button>
      <button class="game-btn" @click="shuffleGame">重新洗牌</button>
    </div>

    <!-- 主游戏区域 -->
    <div class="game-board">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载游戏中...</div>
      </div>

      <div v-else class="memory-grid">
        <div
          v-for="card in cards"
          :key="card.id"
          class="memory-card-wrap"
          :class="{ matched: card.matched, disabled: lockBoard || card.matched }"
          @click="flipCard(card)"
        >
          <div
            class="memory-card"
            :class="{ flipped: card.flipped || card.matched }"
          >
            <div class="card-face card-back">
              <div class="card-back-inner">?</div>
            </div>

            <div class="card-face card-front">
              <div class="card-front-inner">
                <img
                  v-if="card.imageUrl"
                  :src="card.imageUrl"
                  class="card-image"
                  alt="card"
                  @error="handleImageError(card)"
                />
                <span v-else>{{ card.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏内成功提示 -->
    <transition name="fade-up">
      <div v-if="finished && !isLoading" class="success-card">
        <div class="success-icon">🎉</div>
        <div class="success-title">恭喜完成</div>
        <div class="success-desc">
          你成功找出了全部配对，共用了 {{ steps }} 步。
        </div>
      </div>
    </transition>

    <!-- 通关弹窗 -->
    <transition name="success-pop">
      <div
        v-if="showSuccessModal"
        class="page-congrats-mask"
        @click.self="closeSuccessModal"
      >
        <div class="page-congrats-card">
          <div class="page-congrats-icon">🏆</div>
          <div class="page-congrats-title">恭喜通关</div>
          <div class="page-congrats-desc">
            你已成功完成记忆配对挑战，共用了 <span>{{ successSteps }}</span> 步。
          </div>

          <div class="page-congrats-actions">
            <button class="congrats-btn primary" @click="closeSuccessModal">我知道了</button>
            <button class="congrats-btn" @click="playAgain">再玩一次</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { request } from '@/utils/request'

const props = defineProps({
  pairCount: {
    type: Number,
    default: 8
  },
  symbols: {
    type: Array,
    default: () => ['🌸', '🏔️', '🍵', '🎋', '🦋', '🌈', '🍃', '🌻', '🏞️', '⭐', '🍑', '🎐']
  },
  scenicId: {
    type: Number,
    default: null
  },
  scenicName: {
    type: String,
    default: ''
  }
})

const cards = ref([])
const firstCard = ref(null)
const secondCard = ref(null)
const lockBoard = ref(false)
const steps = ref(0)
const matchedCount = ref(0)
const finished = ref(false)
const showSuccessModal = ref(false)
const successSteps = ref(0)
const hasShownModal = ref(false)

const imageUrls = ref([])
const orderArray = ref([])
const isLoading = ref(false)
const hasLoaded = ref(false)
const gameDescription = ref('') // 新增：存储游戏描述

const totalPairs = computed(() => {
  if (imageUrls.value.length > 0 && orderArray.value.length > 0) {
    const pairIdSet = new Set()
    for (let i = 0; i < orderArray.value.length; i++) {
      const imgIndex = orderArray.value[i] - 1
      if (imgIndex >= 0 && imgIndex < imageUrls.value.length) {
        pairIdSet.add(imgIndex)
      }
    }
    return pairIdSet.size
  }
  return props.pairCount
})

const fetchGameData = async () => {
  if (!props.scenicId) {
    console.log('未提供scenicId，使用默认符号')
    return false
  }

  if (hasLoaded.value) {
    return true
  }

  isLoading.value = true

  try {
    console.log('开始请求游戏接口，scenicId:', props.scenicId)

    const res = await request(`/api/games/start?scenicId=${props.scenicId}`, {
      method: 'GET'
    })

    console.log('游戏接口返回:', res)

    if (res?.code === 200 && res?.data) {
      const data = res.data

      // 新增：获取描述信息
      if (data.description) {
        gameDescription.value = data.description
      } else {
        gameDescription.value = ''
      }

      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        imageUrls.value = data.images
      } else {
        return false
      }

      if (data.order && Array.isArray(data.order) && data.order.length > 0) {
        orderArray.value = data.order
      } else {
        return false
      }

      hasLoaded.value = true
      return true
    } else {
      console.error('获取游戏数据失败:', res?.message)
      return false
    }
  } catch (error) {
    console.error('请求游戏接口失败:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

const createCardsFromApi = () => {
  if (imageUrls.value.length === 0 || orderArray.value.length === 0) {
    return null
  }

  const cardList = []
  let cardIdCounter = 0

  for (let i = 0; i < orderArray.value.length; i++) {
    const imgIndex = orderArray.value[i] - 1

    if (imgIndex < 0 || imgIndex >= imageUrls.value.length) {
      console.warn(`无效的图片索引: ${imgIndex}, 跳过`)
      continue
    }

    const imageUrl = imageUrls.value[imgIndex]

    if (imageUrl) {
      cardList.push({
        id: `card-${cardIdCounter++}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        pairId: imgIndex,
        content: '',
        imageUrl: imageUrl,
        flipped: false,
        matched: false
      })
    }
  }

  if (cardList.length === 0) {
    return null
  }

  return cardList
}

const handleImageError = (card) => {
  console.warn('图片加载失败:', card.imageUrl)
  card.imageUrl = null
  card.content = '?'
}

const createCards = () => {
  const apiCards = createCardsFromApi()

  if (apiCards && apiCards.length > 0) {
    cards.value = shuffleArray(apiCards)
    return
  }

  const source = props.symbols.slice(0, props.pairCount)
  const doubled = source.flatMap((item, index) => [
    {
      id: `${index}-a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pairId: index,
      content: item,
      imageUrl: null,
      flipped: false,
      matched: false
    },
    {
      id: `${index}-b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pairId: index,
      content: item,
      imageUrl: null,
      flipped: false,
      matched: false
    }
  ])
  cards.value = shuffleArray(doubled)
}

const shuffleArray = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const resetSelection = () => {
  firstCard.value = null
  secondCard.value = null
  lockBoard.value = false
}

const checkFinished = () => {
  const currentMatchedCount = cards.value.filter(card => card.matched).length / 2
  matchedCount.value = currentMatchedCount

  if (currentMatchedCount === totalPairs.value && totalPairs.value > 0 && !finished.value) {
    finished.value = true
    successSteps.value = steps.value

    if (!hasShownModal.value) {
      hasShownModal.value = true
      setTimeout(() => {
        showSuccessModal.value = true
      }, 300)
    }
  }
}

const flipCard = (card) => {
  if (lockBoard.value) return
  if (card.flipped || card.matched) return
  if (firstCard.value && firstCard.value.id === card.id) return
  if (finished.value) return

  card.flipped = true

  if (!firstCard.value) {
    firstCard.value = card
    return
  }

  secondCard.value = card
  steps.value += 1
  lockBoard.value = true

  if (firstCard.value.pairId === secondCard.value.pairId) {
    firstCard.value.matched = true
    secondCard.value.matched = true

    setTimeout(() => {
      resetSelection()
      checkFinished()
    }, 260)
  } else {
    setTimeout(() => {
      firstCard.value.flipped = false
      secondCard.value.flipped = false
      resetSelection()
    }, 850)
  }
}

const restartGame = () => {
  steps.value = 0
  matchedCount.value = 0
  finished.value = false
  showSuccessModal.value = false
  hasShownModal.value = false
  resetSelection()
  createCards()
}

const shuffleGame = () => {
  restartGame()
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const playAgain = () => {
  showSuccessModal.value = false
  restartGame()
}

const initGame = async () => {
  hasLoaded.value = false
  imageUrls.value = []
  orderArray.value = []
  gameDescription.value = '' // 重置描述

  await fetchGameData()
  createCards()
}

watch(() => props.scenicId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    initGame()
  }
}, { immediate: true })

onMounted(() => {
  if (props.scenicId && !hasLoaded.value) {
    initGame()
  } else if (!props.scenicId) {
    createCards()
  }
})
</script>

<style scoped>
.memory-game {
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 8px 24px;
  border-radius: 28px;
  background: linear-gradient(145deg, rgba(255, 252, 245, 0.98), rgba(245, 250, 240, 0.98));
  border: 1px solid rgba(124, 155, 95, 0.14);
  box-shadow:
    0 22px 54px rgba(36, 52, 41, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  position: relative;
}

.game-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.game-stat {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(106, 151, 71, 0.14);
  border-radius: 18px;
  padding: 6px 12px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(120, 148, 97, 0.08);
}

.game-stat .label {
  display: block;
  font-size: 13px;
  color: #7b8a74;
  margin-bottom: 4px;
}

.game-stat .value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #5a6f49;
}

/* 游戏描述样式（新增） */
.game-description {
  /* background: linear-gradient(135deg, rgba(136, 181, 106, 0.12), rgba(114, 153, 86, 0.08)); */
  border-radius: 20px;
  padding: 2px 18px;
  /* margin-bottom: 18px; */
  display: flex;
  align-items: center;
  gap: 12px;
  /* border: 1px solid rgba(136, 181, 106, 0.2); */
  /* backdrop-filter: blur(4px); */
}

.description-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.description-text {
  font-size: 14px;
  color: #5a6f49;
  line-height: 1.6;
  flex: 1;
}

.game-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 2px;
  flex-wrap: wrap;
}

.game-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: #5f6d4e;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(118, 147, 90, 0.16);
  box-shadow: 0 8px 20px rgba(122, 149, 100, 0.1);
  transition: all 0.2s ease;
}

.game-btn:hover {
  transform: translateY(-1px);
}

.game-btn.primary {
  background: linear-gradient(135deg, #88b56a, #729956);
  color: #fff;
  border: none;
}

.game-board {
  min-height: 420px;
  border-radius: 26px;
  padding: 2px 2px;
  /* background:
    radial-gradient(circle at top, rgba(245, 249, 240, 0.95), rgba(239, 244, 236, 0.94)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(241, 246, 236, 0.8)); */
  /* border: 1px solid rgba(121, 151, 97, 0.12); */
  /* box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 10px 30px rgba(102, 126, 83, 0.08); */
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  gap: 16px;
}

.loading-spinner {
  width: 52px;
  height: 52px;
  border: 3px solid rgba(136, 181, 106, 0.2);
  border-top-color: #88b56a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #5a6f49;
  font-size: 15px;
}

.memory-grid {
  width: min(100%, 760px);
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 14px;
  justify-content: center;
  align-content: center;
}

.memory-card-wrap {
  perspective: 1000px;
  cursor: pointer;
}

.memory-card-wrap.disabled {
  cursor: default;
}

.memory-card-wrap.matched {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.92);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.memory-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  transform-style: preserve-3d;
  transition: transform 0.55s ease;
}

.memory-card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 28px rgba(108, 136, 88, 0.1);
}

.card-back {
  background: linear-gradient(135deg, #f6efe1, #eef6e7);
  border: 1px solid rgba(121, 151, 97, 0.16);
}

.card-back-inner {
  width: 72%;
  height: 72%;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  font-weight: 800;
  color: rgba(103, 122, 89, 0.58);
  background: rgba(255, 255, 255, 0.55);
  border: 1px dashed rgba(116, 148, 89, 0.18);
}

.card-front {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #fffdf6, #f1f8eb);
  border: 1px solid rgba(121, 151, 97, 0.18);
  overflow: hidden;
}

.card-front-inner {
  font-size: 52px;
  line-height: 1;
  user-select: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
}

.success-card {
  margin-top: 20px;
  border-radius: 18px;
  padding: 18px 16px;
  background: linear-gradient(135deg, rgba(255, 251, 236, 0.97), rgba(240, 249, 232, 0.97));
  border: 1px solid rgba(122, 166, 86, 0.18);
  box-shadow: 0 12px 26px rgba(116, 147, 92, 0.12);
  text-align: center;
}

.success-icon {
  font-size: 26px;
  margin-bottom: 6px;
}

.success-title {
  font-size: 18px;
  font-weight: 800;
  color: #5a7446;
}

.success-desc {
  margin-top: 6px;
  font-size: 14px;
  color: #758469;
  line-height: 1.7;
}

.page-congrats-mask {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 28, 24, 0.42);
  backdrop-filter: blur(4px);
  padding: 24px;
  box-sizing: border-box;
}

.page-congrats-card {
  width: min(420px, calc(100vw - 32px));
  border-radius: 26px;
  padding: 34px 26px 24px;
  background: linear-gradient(180deg, #fffdf8 0%, #f6f1e6 100%);
  box-shadow:
    0 24px 60px rgba(37, 31, 23, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  text-align: center;
  border: 1px solid rgba(146, 120, 84, 0.16);
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.page-congrats-icon {
  font-size: 46px;
  margin-bottom: 10px;
}

.page-congrats-title {
  font-size: 28px;
  font-weight: 800;
  color: #5d472f;
  line-height: 1.2;
}

.page-congrats-desc {
  margin-top: 10px;
  font-size: 15px;
  color: #7a6a58;
  line-height: 1.8;
}

.page-congrats-desc span {
  font-weight: 700;
  color: #5e7048;
  font-size: 18px;
}

.page-congrats-actions {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.congrats-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 22px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: #ffffff;
  color: #69543b;
  box-shadow: 0 8px 20px rgba(128, 118, 94, 0.08);
  transition: all 0.2s ease;
}

.congrats-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(128, 118, 94, 0.12);
}

.congrats-btn.primary {
  background: #86b35f;
  color: #fff;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.28s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.success-pop-enter-active,
.success-pop-leave-active {
  transition: all 0.28s ease;
}

.success-pop-enter-from,
.success-pop-leave-to {
  opacity: 0;
}

.success-pop-enter-from .page-congrats-card,
.success-pop-leave-to .page-congrats-card {
  transform: translateY(16px) scale(0.96);
  opacity: 0;
}

.success-pop-enter-to .page-congrats-card,
.success-pop-leave-from .page-congrats-card {
  transform: translateY(0) scale(1);
  opacity: 1;
  transition: all 0.28s ease;
}

@media (max-width: 900px) {
  .memory-game {
    width: 100%;
    padding: 18px;
  }

  .game-board {
    min-height: 440px;
    padding: 22px 16px;
  }

  .memory-grid {
    width: min(100%, 680px);
    grid-template-columns: repeat(4, minmax(96px, 1fr));
    gap: 16px;
  }

  .card-back-inner {
    font-size: 34px;
  }

  .card-front-inner {
    font-size: 42px;
  }
}

@media (max-width: 640px) {
  .memory-game {
    padding: 14px;
    border-radius: 20px;
  }

  .game-header {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .game-stat {
    padding: 14px 10px;
  }

  .game-description {
    padding: 10px 14px;
  }
  
  .description-icon {
    font-size: 20px;
  }
  
  .description-text {
    font-size: 13px;
  }

  .game-actions {
    gap: 10px;
    margin-bottom: 16px;
  }

  .game-btn {
    width: 100%;
  }

  .game-board {
    min-height: 360px;
    padding: 16px 12px;
    border-radius: 18px;
  }

  .memory-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .card-front-inner {
    font-size: 34px;
  }

  .card-back-inner {
    font-size: 28px;
    border-radius: 16px;
  }

  .page-congrats-title {
    font-size: 24px;
  }

  .page-congrats-icon {
    font-size: 40px;
  }
}
</style>
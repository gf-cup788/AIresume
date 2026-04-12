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

    <div class="game-actions">
      <button class="game-btn primary" @click="restartGame">重新开始</button>
      <button class="game-btn" @click="shuffleGame">重新洗牌</button>
    </div>

    <div class="memory-grid">
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
            <div class="card-front-inner">{{ card.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏内成功提示 -->
    <transition name="fade-up">
      <div v-if="finished" class="success-card">
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
        class="success-modal-mask"
        @click.self="closeSuccessModal"
      >
        <div class="success-modal-card">
          <div class="success-modal-icon">🏆</div>
          <div class="success-modal-title">恭喜通关</div>
          <div class="success-modal-desc">
            你已成功完成记忆配对挑战，共用了 <span>{{ successSteps }}</span> 步。
          </div>
          
          <div class="success-modal-actions">
            <button class="modal-btn primary" @click="closeSuccessModal">我知道了</button>
            <button class="modal-btn" @click="playAgain">再玩一次</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  pairCount: {
    type: Number,
    default: 8
  },
  symbols: {
    type: Array,
    default: () => ['🌸', '🏔️', '🍵', '🎋', '🦋', '🌈', '🍃', '🌻', '🏞️', '⭐', '🍑', '🎐']
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

const totalPairs = computed(() => props.pairCount)

const shuffleArray = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const createCards = () => {
  const source = props.symbols.slice(0, props.pairCount)
  const doubled = source.flatMap((item, index) => [
    {
      id: `${index}-a-${Math.random().toString(36).slice(2, 8)}`,
      pairId: index,
      content: item,
      flipped: false,
      matched: false
    },
    {
      id: `${index}-b-${Math.random().toString(36).slice(2, 8)}`,
      pairId: index,
      content: item,
      flipped: false,
      matched: false
    }
  ])
  cards.value = shuffleArray(doubled)
}

const resetSelection = () => {
  firstCard.value = null
  secondCard.value = null
  lockBoard.value = false
}

const checkFinished = () => {
  if (matchedCount.value === totalPairs.value) {
    finished.value = true
    successSteps.value = steps.value
    
    // 只在第一次完成时显示弹窗
    if (!hasShownModal.value) {
      hasShownModal.value = true
      // 延迟一点显示弹窗，让最后的配对动画完成
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
    matchedCount.value += 1

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

onMounted(() => {
  createCards()
})
</script>

<style scoped>
.memory-game {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 16px;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255, 252, 245, 0.98), rgba(245, 250, 240, 0.98));
  border: 1px solid rgba(124, 155, 95, 0.14);
  box-shadow:
    0 20px 48px rgba(36, 52, 41, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  position: relative;
}

.game-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}

.game-stat {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(106, 151, 71, 0.14);
  border-radius: 14px;
  padding: 12px 10px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(120, 148, 97, 0.08);
}

.game-stat .label {
  display: block;
  font-size: 12px;
  color: #75856e;
  margin-bottom: 4px;
}

.game-stat .value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #5a6f49;
}

.game-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.game-btn {
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

.game-btn:hover {
  transform: translateY(-1px);
}

.game-btn.primary {
  background: linear-gradient(135deg, #88b56a, #729956);
  color: #fff;
  border: none;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(4, 92px);
  justify-content: center;
  gap: 12px;
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
  border-radius: 20px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(108, 136, 88, 0.1);
}

.card-back {
  background: linear-gradient(135deg, #f6efe1, #eef6e7);
  border: 1px solid rgba(121, 151, 97, 0.16);
}

.card-back-inner {
  width: 68%;
  height: 68%;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
  color: rgba(103, 122, 89, 0.6);
  background: rgba(255, 255, 255, 0.52);
  border: 1px dashed rgba(116, 148, 89, 0.18);
}

.card-front {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #fffdf6, #f1f8eb);
  border: 1px solid rgba(121, 151, 97, 0.18);
}

.card-front-inner {
  font-size: 42px;
  line-height: 1;
  user-select: none;
}

.success-card {
  margin-top: 18px;
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

/* 通关弹窗样式 */
.success-modal-mask {
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

.success-modal-card {
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

.success-modal-icon {
  font-size: 46px;
  margin-bottom: 10px;
}

.success-modal-title {
  font-size: 28px;
  font-weight: 800;
  color: #5d472f;
  line-height: 1.2;
}

.success-modal-desc {
  margin-top: 10px;
  font-size: 15px;
  color: #7a6a58;
  line-height: 1.8;
}

.success-modal-desc span {
  font-weight: 700;
  color: #5e7048;
  font-size: 18px;
}

.success-modal-actions {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.modal-btn {
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

.modal-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(128, 118, 94, 0.12);
}

.modal-btn.primary {
  background: #86b35f;
  color: #fff;
}

/* 过渡动画 */
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

.success-pop-enter-from .success-modal-card,
.success-pop-leave-to .success-modal-card {
  transform: translateY(16px) scale(0.96);
  opacity: 0;
}

.success-pop-enter-to .success-modal-card,
.success-pop-leave-from .success-modal-card {
  transform: translateY(0) scale(1);
  opacity: 1;
  transition: all 0.28s ease;
}

@media (max-width: 900px) {
  .memory-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .memory-game {
    padding: 12px;
    border-radius: 18px;
  }

  .game-header {
    grid-template-columns: 1fr;
  }

  .memory-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .card-front-inner {
    font-size: 34px;
  }

  .card-back-inner {
    font-size: 28px;
  }

  .success-modal-title {
    font-size: 24px;
  }
  
  .success-modal-icon {
    font-size: 40px;
  }
}
</style>
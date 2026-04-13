<template>
  <div class="match-line-game">
    <div class="game-top">
      <!-- <div class="game-title-wrap">
        <div class="game-kicker">诗句连线</div>
        <div class="game-title">{{ title }}</div>
      </div> -->

      <!-- <div class="game-meta">
        <div class="meta-item">
          <span class="meta-label">已完成</span>
          <span class="meta-value">{{ matchedCount }}/{{ currentPairs.length }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">状态</span>
          <span class="meta-value">{{ finished ? '已完成' : '进行中' }}</span>
        </div>
      </div> -->
    </div>

    <div class="game-actions">
      <button class="game-btn primary" @click="restartGame">重新开始</button>
      <button class="game-btn" @click="shuffleGame">重新打乱</button>
    </div>

    <div class="game-board" ref="boardRef">
      <div class="ink-wash ink-left"></div>
      <div class="ink-wash ink-right"></div>

      <svg class="line-layer" :width="boardSize.width" :height="boardSize.height">
        <line
          v-for="item in drawnLines"
          :key="item.key"
          :x1="item.x1"
          :y1="item.y1"
          :x2="item.x2"
          :y2="item.y2"
          class="match-line"
        />
      </svg>

      <div class="column left-column">
        <div class="column-title">上句</div>
        <div
          v-for="item in leftList"
          :key="item.id"
          :ref="setLeftRef(item.id)"
          class="option-card left-card"
          :class="{
            active: selectedLeftId === item.id,
            matched: isLeftMatched(item.id)
          }"
          @click="selectLeft(item)"
        >
          <span class="paper-pin"></span>
          <span class="text">{{ item.text }}</span>
        </div>
      </div>

      <div class="column right-column">
        <div class="column-title">下句</div>
        <div
          v-for="item in rightList"
          :key="item.id"
          :ref="setRightRef(item.id)"
          class="option-card right-card"
          :class="{
            active: selectedRightId === item.id,
            matched: isRightMatched(item.id),
            wrong: wrongRightId === item.id
          }"
          @click="selectRight(item)"
        >
          <span class="text">{{ item.text }}</span>
          <span class="paper-pin"></span>
        </div>
      </div>
    </div>

    <div class="tips-bar">
      <span v-if="message" class="tip-text">{{ message }}</span>
      <span v-else class="tip-text">先点左侧上句，再点右侧对应的下句，完成诗句连线。</span>
    </div>

    <transition name="fade-up">
      <div v-if="finished" class="success-card">
        <div class="success-icon">✦</div>
        <div class="success-title">连线完成</div>
        <div class="success-desc">
          你已完成全部诗句配对，共完成 {{ currentPairs.length }} 组。
        </div>
        <button class="game-btn primary success-btn" @click="restartGame">再玩一次</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '滕王阁 · 诗句连线'
  },
  pairs: {
    type: Array,
    default: () => [
      { left: '落霞与孤鹜齐飞', right: '秋水共长天一色' },
      { left: '渔舟唱晚', right: '响穷彭蠡之滨' },
      { left: '雁阵惊寒', right: '声断衡阳之浦' },
      { left: '关山难越', right: '谁悲失路之人' },
      { left: '萍水相逢', right: '尽是他乡之客' },
      { left: '老当益壮', right: '宁移白首之心' }
    ]
  }
})

const boardRef = ref(null)
const boardSize = ref({ width: 0, height: 0 })

const leftRefs = ref({})
const rightRefs = ref({})

const selectedLeftId = ref(null)
const selectedRightId = ref(null)
const wrongRightId = ref(null)
const message = ref('')

const currentPairs = ref([])
const rightList = ref([])
const matchedPairs = ref([])

const leftList = computed(() => {
  return currentPairs.value.map(item => ({
    id: item.id,
    text: item.left
  }))
})

const matchedCount = computed(() => matchedPairs.value.length)
const finished = computed(() => matchedPairs.value.length === currentPairs.value.length && currentPairs.value.length > 0)

const drawnLines = computed(() => {
  if (!boardRef.value) return []

  const boardRect = boardRef.value.getBoundingClientRect()

  return matchedPairs.value
    .map(pair => {
      const leftEl = leftRefs.value[pair.leftId]
      const rightEl = rightRefs.value[pair.rightId]
      if (!leftEl || !rightEl) return null

      const leftRect = leftEl.getBoundingClientRect()
      const rightRect = rightEl.getBoundingClientRect()

      return {
        key: `${pair.leftId}-${pair.rightId}`,
        x1: leftRect.right - boardRect.left - 16,
        y1: leftRect.top - boardRect.top + leftRect.height / 2,
        x2: rightRect.left - boardRect.left + 16,
        y2: rightRect.top - boardRect.top + rightRect.height / 2
      }
    })
    .filter(Boolean)
})

const buildGameData = () => {
  const base = props.pairs.map((item, index) => ({
    id: index + 1,
    left: item.left,
    right: item.right
  }))

  currentPairs.value = base
  rightList.value = shuffleArray(
    base.map(item => ({
      id: item.id,
      text: item.right
    }))
  )

  matchedPairs.value = []
  selectedLeftId.value = null
  selectedRightId.value = null
  wrongRightId.value = null
  message.value = ''
}

const shuffleArray = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const isLeftMatched = (id) => {
  return matchedPairs.value.some(item => item.leftId === id)
}

const isRightMatched = (id) => {
  return matchedPairs.value.some(item => item.rightId === id)
}

const setLeftRef = (id) => (el) => {
  if (el) leftRefs.value[id] = el
}

const setRightRef = (id) => (el) => {
  if (el) rightRefs.value[id] = el
}

const selectLeft = (item) => {
  if (isLeftMatched(item.id)) return
  selectedLeftId.value = item.id
  message.value = ''
}

const selectRight = (item) => {
  if (isRightMatched(item.id)) return
  if (!selectedLeftId.value) {
    message.value = '请先选择左侧的上句。'
    flashMessageClear()
    return
  }

  selectedRightId.value = item.id
  const leftId = selectedLeftId.value
  const rightId = item.id

  if (leftId === rightId) {
    matchedPairs.value.push({
      leftId,
      rightId
    })
    selectedLeftId.value = null
    selectedRightId.value = null
    wrongRightId.value = null
    message.value = '配对正确。'
    flashMessageClear()
    nextTick(() => updateBoardSize())
  } else {
    wrongRightId.value = item.id
    message.value = '这一组不对应，请再试一次。'
    setTimeout(() => {
      selectedRightId.value = null
      wrongRightId.value = null
      selectedLeftId.value = null
      message.value = ''
    }, 700)
  }
}

let msgTimer = null
const flashMessageClear = () => {
  if (msgTimer) clearTimeout(msgTimer)
  msgTimer = setTimeout(() => {
    message.value = ''
  }, 1200)
}

const restartGame = async () => {
  buildGameData()
  await nextTick()
  updateBoardSize()
}

const shuffleGame = async () => {
  rightList.value = shuffleArray([...rightList.value])
  matchedPairs.value = []
  selectedLeftId.value = null
  selectedRightId.value = null
  wrongRightId.value = null
  message.value = '已重新打乱，请重新连线。'
  await nextTick()
  updateBoardSize()
  flashMessageClear()
}

const updateBoardSize = () => {
  if (!boardRef.value) return
  const rect = boardRef.value.getBoundingClientRect()
  boardSize.value = {
    width: rect.width,
    height: rect.height
  }
}

const handleResize = () => {
  updateBoardSize()
}

onMounted(async () => {
  buildGameData()
  await nextTick()
  updateBoardSize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (msgTimer) clearTimeout(msgTimer)
})
</script>

<style scoped>
.match-line-game {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 8px 4px 0;
  box-sizing: border-box;
}

.game-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.game-title-wrap {
  min-width: 0;
}

.game-kicker {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(152, 126, 88, 0.08);
  border: 1px solid rgba(130, 107, 75, 0.14);
  color: #7f6240;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}

.game-title {
  margin-top: 12px;
  color: #4f3a26;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 1px;
}

.game-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.meta-item {
  min-width: 118px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 251, 243, 0.72);
  border: 1px solid rgba(128, 107, 79, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  text-align: center;
}

.meta-label {
  display: block;
  font-size: 12px;
  color: #8a775f;
  margin-bottom: 4px;
}

.meta-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #5d472f;
}

.game-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.game-btn {
  border: none;
  border-radius: 999px;
  padding: 11px 22px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: #6b5339;
  background: rgba(255, 252, 246, 0.9);
  border: 1px solid rgba(129, 107, 78, 0.14);
  box-shadow:
    0 6px 16px rgba(80, 60, 38, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  transition: all 0.2s ease;
}

.game-btn:hover {
  transform: translateY(-1px);
}

.game-btn.primary {
  color: #fffdf8;
  background: linear-gradient(180deg, #9c7449, #7e5936);
  border: 1px solid rgba(110, 79, 48, 0.2);
  box-shadow:
    0 8px 18px rgba(104, 73, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.game-board {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 132px;
  min-height: 560px;
  padding: 34px 40px 28px;
  border-radius: 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 18%, rgba(93, 85, 73, 0.06), transparent 18%),
    radial-gradient(circle at 85% 82%, rgba(126, 114, 97, 0.06), transparent 18%),
    repeating-linear-gradient(
      0deg,
      rgba(116, 97, 72, 0.015) 0px,
      rgba(116, 97, 72, 0.015) 1px,
      transparent 1px,
      transparent 14px
    ),
    linear-gradient(180deg, rgba(251, 246, 236, 0.98), rgba(241, 231, 214, 0.98));
  border: 1px solid rgba(122, 101, 74, 0.16);
  box-shadow:
    0 18px 42px rgba(51, 40, 27, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  box-sizing: border-box;
}

.game-board::before {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: 22px;
  border: 1px solid rgba(132, 110, 82, 0.1);
  pointer-events: none;
}

.ink-wash {
  position: absolute;
  border-radius: 50%;
  filter: blur(28px);
  opacity: 0.18;
  pointer-events: none;
}

.ink-left {
  width: 180px;
  height: 180px;
  left: -20px;
  top: 80px;
  background: rgba(92, 102, 95, 0.18);
}

.ink-right {
  width: 200px;
  height: 200px;
  right: -30px;
  bottom: 40px;
  background: rgba(123, 110, 98, 0.16);
}

.line-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.match-line {
  stroke: #7e5936;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-dasharray: 0;
  filter: drop-shadow(0 2px 4px rgba(86, 60, 37, 0.12));
}

.column {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.column-title {
  margin-bottom: 4px;
  text-align: center;
  color: #6a5236;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 2px;
}

.option-card {
  min-height: 70px;
  padding: 16px 18px;
  border-radius: 18px 8px 18px 8px;
  background:
    linear-gradient(180deg, rgba(255, 252, 245, 0.96), rgba(248, 240, 225, 0.96));
  border: 1px solid rgba(125, 104, 76, 0.14);
  box-shadow:
    0 8px 20px rgba(78, 60, 38, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  cursor: pointer;
  transition: all 0.22s ease;
  position: relative;
  box-sizing: border-box;
}

.option-card::before {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 14px 6px 14px 6px;
  border: 1px dashed rgba(136, 114, 84, 0.12);
  pointer-events: none;
}

.option-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 12px 24px rgba(78, 60, 38, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.option-card.active {
  background:
    linear-gradient(180deg, rgba(250, 242, 228, 0.98), rgba(243, 232, 211, 0.98));
  border-color: rgba(133, 101, 63, 0.28);
  box-shadow:
    0 0 0 3px rgba(153, 116, 73, 0.12),
    0 12px 24px rgba(78, 60, 38, 0.08);
}

.option-card.matched {
  background:
    linear-gradient(180deg, rgba(243, 240, 229, 0.98), rgba(234, 232, 223, 0.98));
  border-color: rgba(103, 92, 77, 0.2);
}

.option-card.wrong {
  background:
    linear-gradient(180deg, rgba(255, 245, 243, 0.98), rgba(253, 236, 232, 0.98));
  border-color: rgba(180, 96, 79, 0.22);
  box-shadow:
    0 0 0 3px rgba(180, 96, 79, 0.1),
    0 10px 20px rgba(91, 49, 41, 0.06);
}

.option-card .text {
  flex: 1;
  color: #55412d;
  font-size: 17px;
  line-height: 1.8;
  text-align: left;
  position: relative;
  z-index: 1;
}

.right-card .text {
  text-align: right;
}

.paper-pin {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  background: radial-gradient(circle at 35% 35%, #f7ead7, #9b754b 72%);
  box-shadow: 0 0 0 4px rgba(155, 117, 75, 0.1);
  position: relative;
  z-index: 1;
}

.tips-bar {
  margin-top: 16px;
  padding: 13px 16px;
  border-radius: 16px;
  background: rgba(255, 250, 242, 0.7);
  border: 1px solid rgba(128, 107, 79, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.tip-text {
  color: #7a6753;
  font-size: 14px;
  line-height: 1.75;
}

.success-card {
  margin-top: 18px;
  border-radius: 20px;
  padding: 22px 16px;
  text-align: center;
  background:
    linear-gradient(180deg, rgba(253, 248, 239, 0.97), rgba(245, 237, 222, 0.97));
  border: 1px solid rgba(129, 107, 78, 0.14);
  box-shadow:
    0 12px 26px rgba(77, 57, 35, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.success-icon {
  font-size: 28px;
  color: #8b6641;
  margin-bottom: 8px;
}

.success-title {
  font-size: 20px;
  font-weight: 800;
  color: #5d472f;
}

.success-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #7a6854;
  line-height: 1.8;
}

.success-btn {
  margin-top: 14px;
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

@media (max-width: 900px) {
  .game-top {
    flex-direction: column;
    align-items: stretch;
  }

  .game-meta {
    justify-content: flex-start;
  }

  .game-board {
    gap: 50px;
    min-height: 520px;
    padding: 24px 20px;
  }

  .option-card .text {
    font-size: 15px;
  }
}

@media (max-width: 640px) {
  .match-line-game {
    padding: 4px 0 0;
  }

  .game-title {
    font-size: 22px;
  }

  .game-meta {
    flex-direction: column;
  }

  .meta-item {
    width: 100%;
  }

  .game-actions {
    gap: 10px;
  }

  .game-btn {
    width: 100%;
  }

  .game-board {
    grid-template-columns: 1fr;
    gap: 22px;
    min-height: auto;
    padding: 18px 12px;
    border-radius: 20px;
  }

  .line-layer {
    display: none;
  }

  .column-title {
    font-size: 16px;
  }

  .option-card {
    min-height: 62px;
    padding: 14px 14px;
  }

  .option-card .text {
    font-size: 14px;
    line-height: 1.7;
  }
}
</style>
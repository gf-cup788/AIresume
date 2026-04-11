<template>
  <div class="puzzle-game">
    <div class="game-main">
      <!-- 左侧主拼图区 -->
      <div class="board-section">
        <div class="puzzle-stats">
          <div class="puzzle-stat">
            <span class="puzzle-stat-label">已放入</span>
            <span class="puzzle-stat-value">{{ placedCount }}</span>
          </div>
          <div class="puzzle-stat">
            <span class="puzzle-stat-label">总块数</span>
            <span class="puzzle-stat-value">{{ totalPieces }}</span>
          </div>
          <div class="puzzle-stat">
            <span class="puzzle-stat-label">状态</span>
            <span class="puzzle-stat-value">{{ solved ? '已完成' : '进行中' }}</span>
          </div>
        </div>

        <div
          class="drop-board"
          :style="{
            '--board-size': boardSize + 'px',
            '--tile-size': tileSize + 'px',
            '--board-count': boardCount
          }"
        >
          <div
            v-for="slot in slots"
            :key="slot.id"
            class="drop-slot"
            :class="{
              filled: isSlotFilled(slot.id),
              active: hoverSlot === slot.id
            }"
            @dragover.prevent="onSlotDragOver(slot.id)"
            @dragleave="onSlotDragLeave"
            @drop.prevent="onSlotDrop(slot.id)"
          >
            <template v-if="placedMap[slot.id]">
              <div
                class="placed-piece"
                :style="getPieceStyle(placedMap[slot.id], 'board')"
                draggable="true"
                @dragstart="onPieceDragStart(placedMap[slot.id], 'board', slot.id)"
              ></div>
            </template>

            <template v-else>
              <div class="slot-guide">{{ slot.id }}</div>
            </template>
          </div>
        </div>

        <div class="puzzle-actions">
          <button class="panel-btn primary" @click="resetPuzzle">重新开始</button>
          <button class="panel-btn" @click="shufflePool">打乱拼块</button>
        </div>
      </div>

      <!-- 右侧辅助区 -->
      <div class="side-section">
        <div class="preview-card">
          <div class="card-title">完整预览</div>
          <div class="preview-image" :style="previewStyle"></div>
        </div>

        <div class="pieces-card">
          <div class="card-title">待放入拼块 已放入的拼图也可以拖回这里重新调整。</div>

          <div class="pieces-pool" @dragover.prevent @drop.prevent="onPoolDrop">
            <div
              v-for="piece in availablePieces"
              :key="piece.id"
              class="pool-piece"
              :style="getPieceStyle(piece, 'pool')"
              draggable="true"
              @dragstart="onPieceDragStart(piece, 'pool', null)"
            ></div>
          </div>
        </div>

        <!-- 拼图完成提示挪到右边 -->
        <transition name="fade-up">
          <div v-if="solved" class="mini-success-card">
            <div class="mini-success-icon">🎉</div>
            <div class="mini-success-title">拼图完成</div>
            <div class="mini-success-desc">你已经完成 {{ scenicName }} 的拼图。</div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 通关页面提示：不会关闭拼图弹窗 -->
    <transition name="success-pop">
      <div
        v-if="showPageCongrats"
        class="page-congrats-mask"
        @click.self="closeCongrats"
      >
        <div class="page-congrats-card">
          <div class="page-congrats-icon">🏆</div>
          <div class="page-congrats-title">恭喜通关</div>
          <div class="page-congrats-desc">
            你已成功完成 <span>{{ scenicName }}</span> 的拼图挑战
          </div>

          <div class="page-congrats-actions">
            <button class="congrats-btn primary" @click="closeCongrats">我知道了</button>
            <button class="congrats-btn" @click="playAgain">再玩一次</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  scenicName: {
    type: String,
    default: '三宝村'
  },
  imageUrl: {
    type: String,
    required: true
  },
  boardCount: {
    type: Number,
    default: 3
  },
  boardSize: {
    type: Number,
    default: 468
  }
})

const emit = defineEmits(['success'])

const totalPieces = computed(() => props.boardCount * props.boardCount)
const tileSize = computed(() => props.boardSize / props.boardCount)
const poolPieceSize = computed(() => 86)

const slots = ref([])
const availablePieces = ref([])
const placedMap = reactive({})
const hoverSlot = ref(null)
const draggingPiece = ref(null)
const dragFrom = ref('pool')
const dragFromSlot = ref(null)
const solved = ref(false)
const showPageCongrats = ref(false)
const hasShownCongrats = ref(false)

const previewStyle = computed(() => ({
  backgroundImage: `url(${props.imageUrl})`,
  backgroundSize: '100% 100%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

const placedCount = computed(() => Object.keys(placedMap).length)

const createPieces = () => {
  const arr = []
  for (let i = 1; i <= totalPieces.value; i++) {
    arr.push({ id: i })
  }
  return arr
}

const createSlots = () => {
  const arr = []
  for (let i = 1; i <= totalPieces.value; i++) {
    arr.push({ id: i })
  }
  return arr
}

const shuffleArray = (arr) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const clearPlacedMap = () => {
  Object.keys(placedMap).forEach((key) => {
    delete placedMap[key]
  })
}

const resetPuzzle = () => {
  slots.value = createSlots()
  availablePieces.value = shuffleArray(createPieces())
  clearPlacedMap()
  draggingPiece.value = null
  dragFrom.value = 'pool'
  dragFromSlot.value = null
  hoverSlot.value = null
  solved.value = false
  showPageCongrats.value = false
  hasShownCongrats.value = false
}

const playAgain = () => {
  resetPuzzle()
}

const closeCongrats = () => {
  showPageCongrats.value = false
}

const shufflePool = () => {
  availablePieces.value = shuffleArray(availablePieces.value)
}

const isSlotFilled = (slotId) => !!placedMap[slotId]

const onPieceDragStart = (piece, from, slotId = null) => {
  draggingPiece.value = piece
  dragFrom.value = from
  dragFromSlot.value = slotId
}

const onSlotDragOver = (slotId) => {
  hoverSlot.value = slotId
}

const onSlotDragLeave = () => {
  hoverSlot.value = null
}

const removeFromPool = (pieceId) => {
  availablePieces.value = availablePieces.value.filter((item) => item.id !== pieceId)
}

const putBackToPool = (piece) => {
  if (!availablePieces.value.some((item) => item.id === piece.id)) {
    availablePieces.value.push(piece)
  }
}

const onSlotDrop = (slotId) => {
  hoverSlot.value = null
  const piece = draggingPiece.value
  if (!piece) return

  if (piece.id !== slotId) {
    draggingPiece.value = null
    dragFrom.value = 'pool'
    dragFromSlot.value = null
    return
  }

  if (placedMap[slotId]) {
    draggingPiece.value = null
    dragFrom.value = 'pool'
    dragFromSlot.value = null
    return
  }

  if (dragFrom.value === 'pool') {
    removeFromPool(piece.id)
    placedMap[slotId] = piece
  } else if (dragFrom.value === 'board') {
    const fromSlot = dragFromSlot.value
    if (fromSlot && placedMap[fromSlot]) {
      delete placedMap[fromSlot]
    }
    placedMap[slotId] = piece
  }

  checkSolved()

  draggingPiece.value = null
  dragFrom.value = 'pool'
  dragFromSlot.value = null
}

const onPoolDrop = () => {
  const piece = draggingPiece.value
  if (!piece) return

  if (dragFrom.value === 'board' && dragFromSlot.value) {
    delete placedMap[dragFromSlot.value]
    putBackToPool(piece)
  }

  draggingPiece.value = null
  dragFrom.value = 'pool'
  dragFromSlot.value = null
  checkSolved()
}

const checkSolved = () => {
  const currentSolved = placedCount.value === totalPieces.value
  solved.value = currentSolved

  if (currentSolved && !hasShownCongrats.value) {
    hasShownCongrats.value = true
    showPageCongrats.value = true
  }

  if (!currentSolved) {
    hasShownCongrats.value = false
  }
}

const getPieceStyle = (piece, mode = 'board') => {
  const correctIndex = piece.id - 1
  const row = Math.floor(correctIndex / props.boardCount)
  const col = correctIndex % props.boardCount

  if (mode === 'pool') {
    const scale = poolPieceSize.value / tileSize.value
    return {
      width: `${poolPieceSize.value}px`,
      height: `${poolPieceSize.value}px`,
      backgroundImage: `url(${props.imageUrl})`,
      backgroundSize: `${props.boardSize * scale}px ${props.boardSize * scale}px`,
      backgroundPosition: `-${col * poolPieceSize.value}px -${row * poolPieceSize.value}px`,
      backgroundRepeat: 'no-repeat'
    }
  }

  return {
    width: `${tileSize.value}px`,
    height: `${tileSize.value}px`,
    backgroundImage: `url(${props.imageUrl})`,
    backgroundSize: `${props.boardSize}px ${props.boardSize}px`,
    backgroundPosition: `-${col * tileSize.value}px -${row * tileSize.value}px`,
    backgroundRepeat: 'no-repeat'
  }
}

onMounted(() => {
  resetPuzzle()
})
</script>

<style scoped>
.puzzle-game {
  width: 100%;
  color: #5e4630;
  position: relative;
}

.game-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 480px;
  gap: 24px;
  align-items: start;
}

.board-section {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.side-section {
  width: 490px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 2px;
  align-items: flex-start;
}

.puzzle-stats {
  width: 100%;
  max-width: 468px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.puzzle-stat {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 18px;
  padding: 16px 10px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(120, 100, 70, 0.06);
}

.puzzle-stat-label {
  display: block;
  font-size: 14px;
  color: #8c8c74;
  margin-bottom: 8px;
}

.puzzle-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #6c7d53;
}

.drop-board {
  width: var(--board-size);
  height: var(--board-size);
  display: grid;
  grid-template-columns: repeat(var(--board-count), var(--tile-size));
  grid-template-rows: repeat(var(--board-count), var(--tile-size));
  border-radius: 24px;
  overflow: hidden;
  border: 2px solid rgba(175, 189, 159, 0.55);
  background: rgba(248, 246, 238, 0.8);
  box-shadow: 0 14px 34px rgba(136, 121, 91, 0.08);
  margin-left: 60px;
}

.drop-slot {
  width: var(--tile-size);
  height: var(--tile-size);
  position: relative;
  border-right: 1px solid rgba(175, 189, 159, 0.45);
  border-bottom: 1px solid rgba(175, 189, 159, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.12);
  transition: all 0.2s ease;
}

.drop-slot.active {
  background: rgba(143, 181, 112, 0.16);
}

.drop-slot.filled {
  background: transparent;
}

.slot-guide {
  font-size: 18px;
  font-weight: 700;
  color: rgba(140, 150, 128, 0.55);
  user-select: none;
  pointer-events: none;
}

.placed-piece,
.pool-piece {
  cursor: grab;
  box-shadow: 0 6px 16px rgba(118, 103, 76, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.placed-piece:hover,
.pool-piece:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(118, 103, 76, 0.16);
}

.puzzle-actions {
  margin-top: 18px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.panel-btn {
  border: none;
  border-radius: 999px;
  padding: 13px 26px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  color: #6a744f;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(128, 118, 94, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.panel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(128, 118, 94, 0.12);
}

.panel-btn.primary {
  background: #86b35f;
  color: #fff;
}

.preview-card,
.pieces-card,
.mini-success-card {
  width: 100%;
  border-radius: 22px;
}

.preview-card {
  width: 260px;
  height: 283.5px;
  padding: 14px 14px 12px;
}

.pieces-card {
  padding: 14px 14px 12px;
  width: 490px;
  background-color: #ffffff;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #5f6f43;
  margin-bottom: 10px;
}

.preview-image {
  width: 100%;
  max-width: 270px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  border-radius: 18px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.pieces-pool {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  justify-items: center;
  align-items: start;
}

.mini-success-card {
  width: 490px;
  margin-top: 0;
  border-radius: 18px;
  padding: 16px 18px;
  background: linear-gradient(135deg, rgba(255, 250, 239, 0.96), rgba(241, 249, 232, 0.96));
  box-shadow: 0 10px 24px rgba(129, 120, 95, 0.08);
  border: 1px solid rgba(166, 180, 140, 0.32);
  text-align: center;
}

.mini-success-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.mini-success-title {
  font-size: 18px;
  font-weight: 700;
  color: #5e7048;
}

.mini-success-desc {
  margin-top: 6px;
  font-size: 14px;
  color: #7b7a66;
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

@media (max-width: 1100px) {
  .game-main {
    grid-template-columns: 1fr;
  }

  .side-section {
    width: 100%;
    max-width: 490px;
  }

  .pieces-card,
  .mini-success-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .puzzle-stats {
    max-width: 100%;
  }

  .drop-board {
    width: min(100%, var(--board-size));
    height: min(100vw - 48px, var(--board-size));
    margin-left: 0;
  }

  .pieces-pool {
    gap: 8px;
  }

  .preview-image {
    max-width: 220px;
  }

  .preview-card {
    width: 100%;
    height: auto;
  }

  .page-congrats-title {
    font-size: 24px;
  }
}
</style>
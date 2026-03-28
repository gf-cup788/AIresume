<template>
  <div class="puzzle-grid-layout">
    <div class="puzzle-left">
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
          '--tile-size': tileSize + 'px'
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
              :style="getPieceStyle(placedMap[slot.id])"
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

      <transition name="fade-up">
        <div v-if="solved" class="mini-success-card">
          <div class="mini-success-icon">🎊</div>
          <div class="mini-success-title">拼图完成</div>
          <div class="mini-success-desc">
            你已经完成 {{ scenicName }} 的拼图。
          </div>
        </div>
      </transition>
    </div>

    <div class="puzzle-right">
      <div class="preview-card">
        <div class="preview-title">完整预览</div>
        <div class="preview-image" :style="previewStyle"></div>
        <div class="preview-tip">可对照右侧预览完成拼图</div>
      </div>

      <div class="pieces-card">
        <div class="preview-title">待放入拼块</div>

        <div class="pieces-pool" @dragover.prevent @drop.prevent="onPoolDrop">
          <div
            v-for="piece in availablePieces"
            :key="piece.id"
            class="pool-piece"
            :style="getPieceStyle(piece)"
            draggable="true"
            @dragstart="onPieceDragStart(piece, 'pool', null)"
          ></div>
        </div>

        <div class="pool-tip">
          已放入的拼图也可以拖回这里重新调整。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const props = defineProps({
  scenicName: {
    type: String,
    default: '景点'
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
    default: 330
  }
})

const emit = defineEmits(['success'])

const totalPieces = computed(() => props.boardCount * props.boardCount)
const tileSize = computed(() => props.boardSize / props.boardCount)

const slots = ref([])
const availablePieces = ref([])
const placedMap = reactive({})
const hoverSlot = ref(null)
const draggingPiece = ref(null)
const dragFrom = ref('pool')
const dragFromSlot = ref(null)
const solved = ref(false)

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
  availablePieces.value = availablePieces.value.filter(item => item.id !== pieceId)
}

const putBackToPool = (piece) => {
  if (!availablePieces.value.some(item => item.id === piece.id)) {
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
  solved.value = placedCount.value === totalPieces.value
}

const getPieceStyle = (piece) => {
  const correctIndex = piece.id - 1
  const bgX = (correctIndex % props.boardCount) * tileSize.value
  const bgY = Math.floor(correctIndex / props.boardCount) * tileSize.value

  return {
    width: `${tileSize.value}px`,
    height: `${tileSize.value}px`,
    backgroundImage: `url(${props.imageUrl})`,
    backgroundSize: `${props.boardSize}px ${props.boardSize}px`,
    backgroundPosition: `-${bgX}px -${bgY}px`,
    backgroundRepeat: 'no-repeat'
  }
}

onMounted(() => {
  resetPuzzle()
})
</script>

<style scoped>
.puzzle-grid-layout {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 18px;
  align-items: start;
}

.puzzle-left {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.puzzle-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.puzzle-stats {
  width: 100%;
  max-width: 330px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.puzzle-stat {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(106, 151, 71, 0.14);
  border-radius: 14px;
  padding: 10px 8px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(120, 148, 97, 0.08);
}

.puzzle-stat-label {
  display: block;
  font-size: 12px;
  color: #75856e;
  margin-bottom: 4px;
}

.puzzle-stat-value {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #5a6f49;
}

.drop-board {
  width: var(--board-size);
  height: var(--board-size);
  display: grid;
  grid-template-columns: repeat(3, var(--tile-size));
  grid-template-rows: repeat(3, var(--tile-size));
  gap: 0;
  border-radius: 18px;
  overflow: hidden;
  border: 2px solid rgba(108, 146, 78, 0.18);
  background:
    linear-gradient(135deg, rgba(248, 243, 227, 0.96), rgba(240, 247, 233, 0.96));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.55),
    0 16px 36px rgba(104, 132, 84, 0.12);
}

.drop-slot {
  width: var(--tile-size);
  height: var(--tile-size);
  position: relative;
  border-right: 1px solid rgba(120, 144, 104, 0.16);
  border-bottom: 1px solid rgba(120, 144, 104, 0.16);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.drop-slot:nth-child(3n) {
  border-right: none;
}

.drop-slot:nth-last-child(-n + 3) {
  border-bottom: none;
}

.drop-slot.active {
  background: rgba(140, 181, 111, 0.15);
  box-shadow: inset 0 0 0 2px rgba(119, 165, 83, 0.18);
}

.drop-slot.filled {
  background: transparent;
}

.slot-guide {
  font-size: 18px;
  font-weight: 700;
  color: rgba(102, 122, 88, 0.35);
  user-select: none;
  pointer-events: none;
}

.placed-piece,
.pool-piece {
  border-radius: 0;
  cursor: grab;
  box-shadow: 0 6px 16px rgba(104, 128, 87, 0.14);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.placed-piece:hover,
.pool-piece:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(98, 126, 80, 0.18);
}

.placed-piece {
  width: 100%;
  height: 100%;
}

.puzzle-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.panel-btn {
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

.panel-btn:hover {
  transform: translateY(-1px);
}

.panel-btn.primary {
  background: linear-gradient(135deg, #88b56a, #729956);
  color: #fff;
  border: none;
}

.preview-card,
.pieces-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(106, 151, 71, 0.14);
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 10px 24px rgba(115, 143, 95, 0.1);
}

.preview-title {
  font-size: 14px;
  font-weight: 700;
  color: #5d714d;
  margin-bottom: 10px;
}

.preview-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(118, 145, 98, 0.16);
  background-color: #f6f4ea;
}

.preview-tip,
.pool-tip {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: #7b8870;
}

.pieces-pool {
  max-height: 318px;
  overflow-y: auto;
  padding-right: 2px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  scrollbar-width: none;
}

.pieces-pool::-webkit-scrollbar {
  display: none;
}

.pool-piece {
  justify-self: center;
}

.mini-success-card {
  margin-top: 14px;
  width: 100%;
  max-width: 330px;
  border-radius: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(255, 251, 236, 0.95), rgba(240, 249, 232, 0.95));
  border: 1px solid rgba(122, 166, 86, 0.18);
  box-shadow: 0 12px 26px rgba(116, 147, 92, 0.12);
  text-align: center;
}

.mini-success-icon {
  font-size: 22px;
  margin-bottom: 4px;
}

.mini-success-title {
  font-size: 16px;
  font-weight: 800;
  color: #5a7446;
}

.mini-success-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #758469;
  line-height: 1.6;
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
  .puzzle-grid-layout {
    grid-template-columns: 1fr;
  }

  .puzzle-right {
    width: 100%;
    max-width: 330px;
    margin: 0 auto;
  }
}
</style>
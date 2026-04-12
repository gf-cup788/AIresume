<template>
  <div class="spot-game">
    <div class="spot-topbar">
      <div class="spot-stat">
        <span class="label">景点</span>
        <span class="value">{{ scenicName }}</span>
      </div>
      <div class="spot-stat">
        <span class="label">已找到</span>
        <span class="value">{{ foundCount }}/{{ totalDiffs }}</span>
      </div>
      <div class="spot-stat">
        <span class="label">剩余</span>
        <span class="value">{{ totalDiffs - foundCount }}</span>
      </div>
      <div class="spot-stat">
        <span class="label">状态</span>
        <span class="value">{{ finished ? '已完成' : '进行中' }}</span>
      </div>
    </div>

    <div class="spot-actions">
      <button class="spot-btn primary" @click="restartGame">重新开始</button>
      <button class="spot-btn" @click="showHint = !showHint">
        {{ showHint ? '隐藏提示' : '显示提示' }}
      </button>
    </div>

    <div class="game-tip" v-if="!finished">
      找出左右两幅图中的 {{ totalDiffs }} 处不同，点击任意一边都可以。
    </div>

    <div class="spot-boards">
      <div class="board-card">
        <div class="board-title">左图</div>
        <div
          ref="leftBoardRef"
          class="spot-board"
          :style="leftBoardStyle"
          @click="handleBoardClick($event, 'left')"
        >
          <template v-for="diff in diffs" :key="`left-marker-${diff.id}`">
            <div
              v-if="foundIds.includes(diff.id)"
              class="found-marker"
              :style="markerStyle(diff, 'left')"
            >
              ✓
            </div>
          </template>

          <template v-if="showHint">
            <div
              v-for="diff in diffs"
              :key="`left-hint-${diff.id}`"
              class="hint-dot"
              :style="hintStyle(diff, 'left')"
            ></div>
          </template>
        </div>
      </div>

      <div class="board-card">
        <div class="board-title">右图</div>
        <div
          ref="rightBoardRef"
          class="spot-board"
          :style="rightBoardStyle"
          @click="handleBoardClick($event, 'right')"
        >
          <template v-for="diff in diffs" :key="`right-marker-${diff.id}`">
            <div
              v-if="foundIds.includes(diff.id)"
              class="found-marker"
              :style="markerStyle(diff, 'right')"
            >
              ✓
            </div>
          </template>

          <template v-if="showHint">
            <div
              v-for="diff in diffs"
              :key="`right-hint-${diff.id}`"
              class="hint-dot"
              :style="hintStyle(diff, 'right')"
            ></div>
          </template>
        </div>
      </div>
    </div>

    <div class="message-wrap">
      <transition name="fade-up">
        <div v-if="clickMessage" class="message-card" :class="{ error: clickType === 'error' }">
          {{ clickMessage }}
        </div>
      </transition>
    </div>

    <transition name="fade-up">
      <div v-if="finished" class="success-card">
        <div class="success-icon">🎉</div>
        <div class="success-title">全部找到了</div>
        <div class="success-desc">
          你已经成功找出了 {{ scenicName }} 场景中的全部不同点。
        </div>
      </div>
    </transition>

    <!-- 加载中提示 -->
    <div v-if="loading" class="loading-mask">
      <div class="loading-card">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载图片中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { request } from '@/utils/request'

const props = defineProps({
  scenicName: {
    type: String,
    default: '婺源'
  },
  scenicId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['success'])

const leftBoardRef = ref(null)
const rightBoardRef = ref(null)

// 游戏数据
const gameData = ref(null)
const loading = ref(true)
const leftImageUrl = ref('')
const rightImageUrl = ref('')
const imageWidth = ref(800)
const imageHeight = ref(800)

// 差异点列表
const diffs = ref([])

// 解析 diffPoints 字符串
const parseDiffPoints = (diffPointsStr) => {
  if (!diffPointsStr) return []
  try {
    // 尝试解析 JSON 字符串
    const points = JSON.parse(diffPointsStr)
    if (Array.isArray(points)) {
      return points.map((point, index) => ({
        id: index + 1,
        leftX: point.left?.x || 0,
        leftY: point.left?.y || 0,
        rightX: point.right?.x || 0,
        rightY: point.right?.y || 0,
        r: point.r || 30,
        label: `差异点${index + 1}`
      }))
    }
    return []
  } catch (error) {
    console.error('解析 diffPoints 失败:', error)
    return []
  }
}

// 获取找不同游戏数据
const fetchGameData = async () => {
  try {
    loading.value = true
    const res = await request(`/api/games/start?scenicId=${props.scenicId}`, {
      method: 'GET'
    })
    
    if (res?.code === 200 && res?.data) {
      gameData.value = res.data
      leftImageUrl.value = res.data.leftImageUrl || ''
      rightImageUrl.value = res.data.rightImageUrl || ''
      imageWidth.value = res.data.imageWidth || 800
      imageHeight.value = res.data.imageHeight || 800
      
      // 解析 diffPoints 获取差异点坐标
      const parsedDiffs = parseDiffPoints(res.data.diffPoints)
      if (parsedDiffs.length > 0) {
        diffs.value = parsedDiffs
      } else {
        // 如果没有 diffPoints，使用默认坐标（保底）
        diffs.value = [
          { id: 1, leftX: 705, leftY: 682, rightX: 709, rightY: 698, r: 30, label: '差异点1' },
          { id: 2, leftX: 105, leftY: 352, rightX: 109, rightY: 374, r: 30, label: '差异点2' },
          { id: 3, leftX: 401, leftY: 547, rightX: 411, rightY: 560, r: 30, label: '差异点3' }
        ]
      }
      
      console.log('找不同游戏数据获取成功:', gameData.value)
      console.log('解析后的差异点:', diffs.value)
    } else {
      console.error('获取找不同游戏数据失败')
    }
  } catch (error) {
    console.error('获取找不同游戏数据失败：', error)
  } finally {
    loading.value = false
  }
}

// 左右图背景样式
const leftBoardStyle = computed(() => ({
  backgroundImage: leftImageUrl.value ? `url(${leftImageUrl.value})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

const rightBoardStyle = computed(() => ({
  backgroundImage: rightImageUrl.value ? `url(${rightImageUrl.value})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

const foundIds = ref([])
const clickMessage = ref('')
const clickType = ref('ok')
const showHint = ref(false)

let messageTimer = null

const totalDiffs = computed(() => diffs.value.length)
const foundCount = computed(() => foundIds.value.length)
const finished = computed(() => foundCount.value === totalDiffs.value && totalDiffs.value > 0)

const clearMessage = () => {
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
}

const setMessage = (text, type = 'ok') => {
  clearMessage()
  clickMessage.value = text
  clickType.value = type
  messageTimer = setTimeout(() => {
    clickMessage.value = ''
  }, 1200)
}

// 获取标记样式（根据左/右图返回不同的坐标）
const markerStyle = (diff, side) => {
  if (side === 'left') {
    return {
      left: `${(diff.leftX / imageWidth.value) * 100}%`,
      top: `${(diff.leftY / imageHeight.value) * 100}%`
    }
  } else {
    return {
      left: `${(diff.rightX / imageWidth.value) * 100}%`,
      top: `${(diff.rightY / imageHeight.value) * 100}%`
    }
  }
}

const hintStyle = (diff, side) => {
  if (side === 'left') {
    return {
      left: `${(diff.leftX / imageWidth.value) * 100}%`,
      top: `${(diff.leftY / imageHeight.value) * 100}%`
    }
  } else {
    return {
      left: `${(diff.rightX / imageWidth.value) * 100}%`,
      top: `${(diff.rightY / imageHeight.value) * 100}%`
    }
  }
}

const getClickPercent = (event, boardEl) => {
  const rect = boardEl.getBoundingClientRect()
  const boardWidth = rect.width
  const boardHeight = rect.height
  const x = ((event.clientX - rect.left) / boardWidth) * 100
  const y = ((event.clientY - rect.top) / boardHeight) * 100
  return { x, y }
}

const findHitDiff = (x, y, side) => {
  return diffs.value.find((diff) => {
    if (foundIds.value.includes(diff.id)) return false
    
    // 根据左右图选择对应的坐标
    const targetX = side === 'left' ? diff.leftX : diff.rightX
    const targetY = side === 'left' ? diff.leftY : diff.rightY
    
    // 将百分比坐标转换为相对于图片原始尺寸的坐标
    const clickX = (x / 100) * imageWidth.value
    const clickY = (y / 100) * imageHeight.value
    
    const dx = clickX - targetX
    const dy = clickY - targetY
    return Math.sqrt(dx * dx + dy * dy) <= diff.r
  })
}

const handleBoardClick = (event, side) => {
  if (finished.value) return

  const boardEl = side === 'left' ? leftBoardRef.value : rightBoardRef.value
  if (!boardEl) return

  const { x, y } = getClickPercent(event, boardEl)
  const hit = findHitDiff(x, y, side)

  if (hit) {
    if (!foundIds.value.includes(hit.id)) {
      foundIds.value = [...foundIds.value, hit.id]
      setMessage(`找到了：${hit.label}`)

      if (foundIds.value.length === diffs.value.length) {
        setMessage('全部找到了，太棒了！')
      }
    }
  } else {
    setMessage('这里没有不同哦，再仔细看看', 'error')
  }
}

const restartGame = () => {
  clearMessage()
  foundIds.value = []
  clickMessage.value = ''
}

onMounted(async () => {
  await fetchGameData()
})
</script>

<style scoped>
.message-wrap {
  min-height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spot-game {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}

.spot-topbar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.spot-stat {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(106, 151, 71, 0.14);
  border-radius: 14px;
  padding: 10px 8px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(120, 148, 97, 0.08);
}

.spot-stat .label {
  display: block;
  font-size: 12px;
  color: #75856e;
  margin-bottom: 4px;
}

.spot-stat .value {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #5a6f49;
}

.spot-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.spot-btn {
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

.spot-btn:hover {
  transform: translateY(-1px);
}

.spot-btn.primary {
  background: linear-gradient(135deg, #88b56a, #729956);
  color: #fff;
  border: none;
}

.game-tip {
  text-align: center;
  font-size: 13px;
  color: #7c8970;
  line-height: 1.7;
}

.spot-boards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 420px));
  justify-content: center;
  gap: 16px;
}

.board-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(106, 151, 71, 0.14);
  border-radius: 20px;
  padding: 12px;
  box-shadow: 0 10px 24px rgba(115, 143, 95, 0.1);
}

.board-title {
  font-size: 15px;
  font-weight: 700;
  color: #5d714d;
  margin-bottom: 10px;
  text-align: center;
}

.spot-board {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(118, 145, 98, 0.16);
  cursor: crosshair;
  background-color: #f0f0f0;
}

.found-marker,
.hint-dot {
  position: absolute;
  transform: translate(-50%, -50%);
}

.found-marker {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(120, 181, 89, 0.92);
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(96, 145, 71, 0.22);
  pointer-events: none;
  z-index: 10;
}

.hint-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 180, 88, 0.3);
  border: 2px dashed rgba(255, 140, 46, 0.65);
  pointer-events: none;
  z-index: 10;
}

.message-card {
  align-self: center;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(120, 181, 89, 0.12);
  color: #5e7748;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid rgba(120, 181, 89, 0.18);
}

.message-card.error {
  background: rgba(255, 190, 160, 0.16);
  color: #9b5f47;
  border-color: rgba(215, 126, 89, 0.2);
}

.success-card {
  margin-top: 4px;
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

.loading-mask {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border-radius: 22px;
}

.loading-card {
  padding: 24px 32px;
  background: linear-gradient(135deg, #fffdf8, #f6f1e6);
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 12px;
  border: 3px solid rgba(134, 179, 95, 0.2);
  border-top-color: #88b56a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #5e7048;
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
  .spot-topbar {
    grid-template-columns: repeat(2, 1fr);
  }

  .spot-boards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .board-card {
    padding: 10px;
    border-radius: 16px;
  }

  .board-title {
    font-size: 14px;
  }

  .found-marker {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
}
</style>
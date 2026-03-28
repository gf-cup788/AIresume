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
          @click="handleBoardClick($event, 'left')"
        >
          <div class="scene-bg"></div>
          <div class="sun"></div>
          <div class="cloud cloud-1"></div>
          <div class="cloud cloud-2"></div>
          <div class="mountain mountain-back"></div>
          <div class="mountain mountain-front"></div>
          <div class="field"></div>
          <div class="house"></div>
          <div class="roof"></div>
          <div class="door"></div>
          <div class="window"></div>
          <div class="tree tree-left">
            <div class="trunk"></div>
            <div class="leaf"></div>
          </div>
          <div class="tree tree-right">
            <div class="trunk"></div>
            <div class="leaf"></div>
          </div>
          <div class="flower-group flower-group-left">
            <span>🌼</span><span>🌸</span><span>🌼</span>
          </div>
          <div class="flower-group flower-group-right">
            <span>🌷</span><span>🌼</span>
          </div>
          <div class="bird">🕊️</div>

          <template v-for="diff in diffs" :key="`left-marker-${diff.id}`">
            <div
              v-if="foundIds.includes(diff.id)"
              class="found-marker"
              :style="markerStyle(diff)"
            >
              ✓
            </div>
          </template>

          <template v-if="showHint">
            <div
              v-for="diff in diffs"
              :key="`left-hint-${diff.id}`"
              class="hint-dot"
              :style="hintStyle(diff)"
            ></div>
          </template>
        </div>
      </div>

      <div class="board-card">
        <div class="board-title">右图</div>
        <div
          ref="rightBoardRef"
          class="spot-board"
          @click="handleBoardClick($event, 'right')"
        >
          <div class="scene-bg"></div>
          <div class="sun diff-sun"></div>
          <div class="cloud cloud-1 diff-cloud-1"></div>
          <div class="cloud cloud-2"></div>
          <div class="mountain mountain-back"></div>
          <div class="mountain mountain-front diff-mountain-front"></div>
          <div class="field"></div>
          <div class="house"></div>
          <div class="roof diff-roof"></div>
          <div class="door"></div>
          <div class="window diff-window"></div>
          <div class="tree tree-left">
            <div class="trunk"></div>
            <div class="leaf diff-leaf-left"></div>
          </div>
          <div class="tree tree-right">
            <div class="trunk"></div>
            <div class="leaf"></div>
          </div>
          <div class="flower-group flower-group-left diff-flower-left">
            <span>🌼</span><span>🌸</span>
          </div>
          <div class="flower-group flower-group-right">
            <span>🌷</span><span>🌼</span>
          </div>
          <div class="bird diff-bird">🦋</div>

          <template v-for="diff in diffs" :key="`right-marker-${diff.id}`">
            <div
              v-if="foundIds.includes(diff.id)"
              class="found-marker"
              :style="markerStyle(diff)"
            >
              ✓
            </div>
          </template>

          <template v-if="showHint">
            <div
              v-for="diff in diffs"
              :key="`right-hint-${diff.id}`"
              class="hint-dot"
              :style="hintStyle(diff)"
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  scenicName: {
    type: String,
    default: '婺源'
  }
})

const emit = defineEmits(['success'])

const leftBoardRef = ref(null)
const rightBoardRef = ref(null)

const diffs = ref([
  { id: 1, x: 14, y: 14, r: 9, label: '太阳位置不同' },
  { id: 2, x: 71, y: 20, r: 9, label: '云朵形状不同' },
  { id: 3, x: 55, y: 39, r: 10, label: '山体轮廓不同' },
  { id: 4, x: 47, y: 52, r: 10, label: '屋顶颜色不同' },
  { id: 5, x: 50, y: 61, r: 8, label: '窗户不同' },
  { id: 6, x: 21, y: 60, r: 10, label: '左侧树叶不同' },
  { id: 7, x: 24, y: 80, r: 9, label: '花朵数量不同' },
  { id: 8, x: 77, y: 31, r: 8, label: '飞鸟变成蝴蝶' }
])

const foundIds = ref([])
const clickMessage = ref('')
const clickType = ref('ok')
const showHint = ref(false)

let messageTimer = null

const totalDiffs = computed(() => diffs.value.length)
const foundCount = computed(() => foundIds.value.length)
const finished = computed(() => foundCount.value === totalDiffs.value)

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

const markerStyle = (diff) => ({
  left: `${diff.x}%`,
  top: `${diff.y}%`
})

const hintStyle = (diff) => ({
  left: `${diff.x}%`,
  top: `${diff.y}%`
})

const getClickPercent = (event, boardEl) => {
  const rect = boardEl.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  return { x, y }
}

const findHitDiff = (x, y) => {
  return diffs.value.find((diff) => {
    if (foundIds.value.includes(diff.id)) return false
    const dx = x - diff.x
    const dy = y - diff.y
    return Math.sqrt(dx * dx + dy * dy) <= diff.r
  })
}

const handleBoardClick = (event, side) => {
  if (finished.value) return

  const boardEl = side === 'left' ? leftBoardRef.value : rightBoardRef.value
  if (!boardEl) return

  const { x, y } = getClickPercent(event, boardEl)
  const hit = findHitDiff(x, y)

  if (hit) {
    foundIds.value = [...foundIds.value, hit.id]
    setMessage(`找到了：${hit.label}`)

    if (foundIds.value.length === diffs.value.length) {
      setMessage('全部找到了，太棒了！')
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
  background: linear-gradient(180deg, #eef8ff 0%, #f7fbff 30%, #f9f7ee 75%, #f2ecd9 100%);
  cursor: crosshair;
}

.scene-bg {
  position: absolute;
  inset: 0;
}

.sun {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff5b7, #ffd45f 70%);
  top: 12%;
  left: 14%;
  box-shadow: 0 0 24px rgba(255, 211, 91, 0.45);
}

.diff-sun {
  top: 10%;
  left: 10%;
}

.cloud {
  position: absolute;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
}

.cloud-1 {
  width: 90px;
  top: 18%;
  left: 62%;
}

.cloud-1::before {
  width: 26px;
  height: 26px;
  top: -10px;
  left: 12px;
}

.cloud-1::after {
  width: 32px;
  height: 32px;
  top: -14px;
  left: 36px;
}

.diff-cloud-1 {
  width: 72px;
}

.cloud-2 {
  width: 72px;
  top: 12%;
  left: 48%;
}

.cloud-2::before {
  width: 24px;
  height: 24px;
  top: -8px;
  left: 10px;
}

.cloud-2::after {
  width: 28px;
  height: 28px;
  top: -12px;
  left: 30px;
}

.mountain {
  position: absolute;
  bottom: 34%;
  background: #8fb08d;
  clip-path: polygon(0% 100%, 28% 48%, 45% 66%, 60% 38%, 100% 100%);
}

.mountain-back {
  left: 0;
  width: 70%;
  height: 32%;
  background: #aac5a1;
}

.mountain-front {
  right: 0;
  width: 72%;
  height: 38%;
  background: #88a97d;
}

.diff-mountain-front {
  clip-path: polygon(0% 100%, 24% 42%, 43% 66%, 67% 31%, 100% 100%);
}

.field {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 34%;
  background: linear-gradient(180deg, #9cc774, #7db258);
}

.house {
  position: absolute;
  width: 88px;
  height: 72px;
  background: #fffdf6;
  left: 41%;
  bottom: 20%;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(80, 80, 80, 0.08);
}

.roof {
  position: absolute;
  width: 104px;
  height: 32px;
  background: #5f5a53;
  left: calc(41% - 8px);
  bottom: calc(20% + 60px);
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
}

.diff-roof {
  background: #7b5a4f;
}

.door {
  position: absolute;
  width: 18px;
  height: 34px;
  background: #9b6e4a;
  left: calc(41% + 35px);
  bottom: 20%;
  border-radius: 3px 3px 0 0;
}

.window {
  position: absolute;
  width: 16px;
  height: 16px;
  background: #9dd7ef;
  left: calc(41% + 12px);
  bottom: calc(20% + 28px);
  border: 2px solid #edf5f8;
}

.diff-window {
  width: 12px;
  height: 20px;
}

.tree {
  position: absolute;
  width: 64px;
  height: 110px;
  bottom: 18%;
}

.tree-left {
  left: 16%;
}

.tree-right {
  right: 14%;
}

.trunk {
  position: absolute;
  width: 12px;
  height: 42px;
  background: #8f623d;
  bottom: 0;
  left: 26px;
  border-radius: 4px;
}

.leaf {
  position: absolute;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #8cd46d, #5f9f43 72%);
  left: 5px;
  top: 10px;
}

.diff-leaf-left {
  background: radial-gradient(circle at 35% 35%, #f0cc67, #d59b38 72%);
}

.flower-group {
  position: absolute;
  display: flex;
  gap: 2px;
  font-size: 20px;
}

.flower-group-left {
  left: 18%;
  bottom: 12%;
}

.diff-flower-left span:last-child {
  display: none;
}

.flower-group-right {
  right: 22%;
  bottom: 10%;
}

.bird {
  position: absolute;
  right: 16%;
  top: 30%;
  font-size: 24px;
}

.diff-bird {
  right: 14%;
  top: 28%;
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
}

.hint-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 180, 88, 0.3);
  border: 2px dashed rgba(255, 140, 46, 0.65);
  pointer-events: none;
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
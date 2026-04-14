<template>
  <div class="ying-shan-hong-container">
    <!-- 小映形象：直接从侧面冒出来，无树枝背景 -->
    <div
      class="xiaoying-character"
      :class="{
        'hover-shake': isHovering && !isHidden,
        'hidden': isHidden,
        'slide-in': !isHidden && !hasSlidIn
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <img :src="xiaoyingImg" class="xiaoying-image" alt="小映" />
    </div>
  </div>

  <!-- 对话框传送至 body -->
  <Teleport to="body">
    <transition name="dialog-fade" @after-leave="afterDialogClose">
      <div 
        v-if="showDialog" 
        class="dialog-container"
        :style="dialogStyle"
        ref="dialogContainer"
      >
        <!-- 可拖拽标题栏 -->
        <div class="dialog-header" @mousedown="startDrag" @touchstart="startDrag">
          <span class="dialog-title">🌸 小映</span>
          <button class="close-btn" @click.stop="closeDialog">×</button>
        </div>
        
        <!-- 可拖拽调整大小的边角/边缘 -->
        <div class="resize-handle resize-nw" @mousedown.stop="startResize($event, 'nw')" @touchstart.stop="startResize($event, 'nw')"></div>
        <div class="resize-handle resize-ne" @mousedown.stop="startResize($event, 'ne')" @touchstart.stop="startResize($event, 'ne')"></div>
        <div class="resize-handle resize-sw" @mousedown.stop="startResize($event, 'sw')" @touchstart.stop="startResize($event, 'sw')"></div>
        <div class="resize-handle resize-se" @mousedown.stop="startResize($event, 'se')" @touchstart.stop="startResize($event, 'se')"></div>
        <div class="resize-edge resize-top" @mousedown.stop="startResize($event, 'n')" @touchstart.stop="startResize($event, 'n')"></div>
        <div class="resize-edge resize-bottom" @mousedown.stop="startResize($event, 's')" @touchstart.stop="startResize($event, 's')"></div>
        <div class="resize-edge resize-left" @mousedown.stop="startResize($event, 'w')" @touchstart.stop="startResize($event, 'w')"></div>
        <div class="resize-edge resize-right" @mousedown.stop="startResize($event, 'e')" @touchstart.stop="startResize($event, 'e')"></div>
        
        <div class="dialog-body">
          <div class="chat-messages" ref="messagesContainer">
            <div
              v-for="(msg, idx) in messages"
              :key="idx"
              class="message-item"
              :class="msg.role"
            >
              <div class="message-avatar">
                {{ msg.role === 'user' ? '👤' : '🌸' }}
              </div>
              <div class="message-content" v-html="marked.parse(msg.content)"></div>
            </div>
            <div v-if="isLoading" class="message-item assistant">
              <div class="message-avatar">🌸</div>
              <div class="message-content typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <div class="chat-input-area">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="问小映一个关于江西旅游的问题..."
              @keyup.enter="sendMessage"
              :disabled="isLoading"
            />
            <button @click="sendMessage" :disabled="isLoading || !inputMessage.trim()">
              发送
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>

  <XiaoyingTips
    :disabled="tipsDisabled"
    :max-tips-per-day="5"
    :inactive-threshold="120000"
    :random-interval="420000"
    :initial-delay="6000"
    @tip-shown="handleTipShown"
    @tip-clicked="handleTipClick"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick,computed } from 'vue'
import xiaoyingImg from '../assets/imgs/xiaoying.png'
import { aiChat } from '../api/index'
import { marked } from 'marked'
import XiaoyingTips from './AITips.vue'

// ========== 图片资源 ==========
const xiaoyingImage = xiaoyingImg

// ========== 状态变量 ==========
const isHovering = ref(false)
const isHidden = ref(false)
const hasSlidIn = ref(false)
const showDialog = ref(false)
const inputMessage = ref('')
const messages = ref([])
const isLoading = ref(false)
const sessionId = ref(null)

// 对话框位置和大小
const dialogLeft = ref(null)
const dialogTop = ref(null)
const dialogWidth = ref(650)
const dialogHeight = ref(650)
const isCustomPosition = ref(false)

// 拖拽相关
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartLeft = ref(0)
const dragStartTop = ref(0)

// 调整大小相关
const isResizing = ref(false)
const resizeDirection = ref(null)
const resizeStartX = ref(0)
const resizeStartY = ref(0)
const resizeStartWidth = ref(0)
const resizeStartHeight = ref(0)
const resizeStartLeft = ref(0)
const resizeStartTop = ref(0)

// DOM 引用
const dialogContainer = ref(null)
const messagesContainer = ref(null)

// ========== 计算属性 ==========
const dialogStyle = computed(() => {
  return {
    left: isCustomPosition.value ? (dialogLeft.value + 'px') : '50%',
    top: isCustomPosition.value ? (dialogTop.value + 'px') : '50%',
    transform: isCustomPosition.value ? 'none' : 'translate(-50%, -50%)',
    width: dialogWidth.value + 'px',
    height: dialogHeight.value + 'px'
  }
})

// ========== 工具函数 ==========
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// ========== 拖拽相关 ==========
const startDrag = (e) => {
  e.preventDefault()
  isDragging.value = true
  const rect = dialogContainer.value.getBoundingClientRect()
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartLeft.value = rect.left
  dragStartTop.value = rect.top
  
  if (!isCustomPosition.value) {
    dialogLeft.value = rect.left
    dialogTop.value = rect.top
    isCustomPosition.value = true
  }
}

const onDragMove = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  const dx = e.clientX - dragStartX.value
  const dy = e.clientY - dragStartY.value
  dialogLeft.value = dragStartLeft.value + dx
  dialogTop.value = dragStartTop.value + dy
  dialogLeft.value = Math.max(-dialogWidth.value + 50, Math.min(window.innerWidth - 50, dialogLeft.value))
  dialogTop.value = Math.max(0, Math.min(window.innerHeight - 50, dialogTop.value))
}

const stopDrag = () => {
  isDragging.value = false
}

// ========== 缩放相关 ==========
const startResize = (e, direction) => {
  e.preventDefault()
  isResizing.value = true
  resizeDirection.value = direction
  const rect = dialogContainer.value.getBoundingClientRect()
  resizeStartX.value = e.clientX
  resizeStartY.value = e.clientY
  resizeStartWidth.value = rect.width
  resizeStartHeight.value = rect.height
  resizeStartLeft.value = rect.left
  resizeStartTop.value = rect.top
  
  if (!isCustomPosition.value) {
    dialogLeft.value = rect.left
    dialogTop.value = rect.top
    isCustomPosition.value = true
  }
}

const onResizeMove = (e) => {
  if (!isResizing.value) return
  e.preventDefault()
  const dx = e.clientX - resizeStartX.value
  const dy = e.clientY - resizeStartY.value
  
  let newWidth = resizeStartWidth.value
  let newHeight = resizeStartHeight.value
  let newLeft = resizeStartLeft.value
  let newTop = resizeStartTop.value
  
  switch (resizeDirection.value) {
    case 'e': newWidth = Math.max(300, resizeStartWidth.value + dx); break
    case 'w': 
      newWidth = Math.max(300, resizeStartWidth.value - dx)
      newLeft = resizeStartLeft.value + (resizeStartWidth.value - newWidth)
      break
    case 's': newHeight = Math.max(400, resizeStartHeight.value + dy); break
    case 'n': 
      newHeight = Math.max(400, resizeStartHeight.value - dy)
      newTop = resizeStartTop.value + (resizeStartHeight.value - newHeight)
      break
    case 'se': 
      newWidth = Math.max(300, resizeStartWidth.value + dx)
      newHeight = Math.max(400, resizeStartHeight.value + dy)
      break
    case 'sw': 
      newWidth = Math.max(300, resizeStartWidth.value - dx)
      newHeight = Math.max(400, resizeStartHeight.value + dy)
      newLeft = resizeStartLeft.value + (resizeStartWidth.value - newWidth)
      break
    case 'ne': 
      newWidth = Math.max(300, resizeStartWidth.value + dx)
      newHeight = Math.max(400, resizeStartHeight.value - dy)
      newTop = resizeStartTop.value + (resizeStartHeight.value - newHeight)
      break
    case 'nw': 
      newWidth = Math.max(300, resizeStartWidth.value - dx)
      newHeight = Math.max(400, resizeStartHeight.value - dy)
      newLeft = resizeStartLeft.value + (resizeStartWidth.value - newWidth)
      newTop = resizeStartTop.value + (resizeStartHeight.value - newHeight)
      break
  }
  
  dialogWidth.value = newWidth
  dialogHeight.value = newHeight
  dialogLeft.value = newLeft
  dialogTop.value = newTop
}

const stopResize = () => {
  isResizing.value = false
  resizeDirection.value = null
}

// ========== 小映交互 ==========
const handleMouseEnter = () => {
  if (!isHidden.value) {
    isHovering.value = true
  }
}

const handleMouseLeave = () => {
  isHovering.value = false
}

const handleClick = () => {
  if (!isHidden.value) {
    isHidden.value = true
    showDialog.value = true
  }
}

const resetXiaoying = () => {
  isHidden.value = false
  isHovering.value = false
  hasSlidIn.value = false
  nextTick(() => {
    setTimeout(() => {
      hasSlidIn.value = true
    }, 500)
  })
}

const closeDialog = () => {
  showDialog.value = false
  setTimeout(() => {
    resetXiaoying()
    isCustomPosition.value = false
    dialogWidth.value = 800
    dialogHeight.value = 800
  }, 300)
}

const afterDialogClose = () => {
  // 可选：对话框完全关闭后的回调
}

// ========== 聊天功能 ==========
const sendMessage = async () => {
  const message = inputMessage.value.trim()
  if (!message) return

  messages.value.push({
    role: 'user',
    content: message
  })
  inputMessage.value = ''
  
  scrollToBottom()

  isLoading.value = true

  try {
    const requestData = { message }
    if (sessionId.value) {
      requestData.sessionId = sessionId.value
    }
    
    const result = await aiChat(requestData)
    
    if (result.code === 200 && result.data) {
      messages.value.push({
        role: 'assistant',
        content: result.data.answer
      })
      
      if (result.data.sessionId) {
        sessionId.value = result.data.sessionId
      }
    } else {
      throw new Error(result.message || '请求失败')
    }
    
    scrollToBottom()
  } catch (error) {
    console.error('AI对话错误:', error)
    messages.value.push({
      role: 'assistant',
      content: '哎呀，小映有点累了😵，请稍后再试试吧～'
    })
  } finally {
    isLoading.value = false
  }
}

// 控制提示组件是否启用（对话框打开时禁用）
const tipsDisabled = computed(() => showDialog.value)

// 处理提示点击（打开对话框）
const handleTipClick = (tipInfo) => {
  if (!showDialog.value) {
    handleClick()  // 打开对话框
  }
}

// 处理提示显示
const handleTipShown = (tipInfo) => {
  console.log('小映提示:', tipInfo.message)
}

// ========== 生命周期 ==========
onMounted(() => {
  // 初始欢迎语
  messages.value.push({
    role: 'assistant',
    content: '你好呀～我是小映！江西的红土孕育了我，关于江西旅游的任何问题都可以问我哟！'
  })
  
  // 监听全局鼠标事件
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', stopResize)
  
  // 延迟触发滑入动画
  setTimeout(() => {
    hasSlidIn.value = true
  }, 500)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
/* 样式保持不变，直接复制原来的样式即可 */
.ying-shan-hong-container {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 999;
  pointer-events: none;
}

/* 小映形象容器 - 从右侧滑入的动画 */
.xiaoying-character {
  position: fixed;
  right: -30px;
  bottom: 30px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  z-index: 1000;
  transform: rotate(22deg);
  transform-origin: top center;
}

/* 滑入动画：从右侧外面滑进来 */
.slide-in {
  animation: slideFromRight 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
}

@keyframes slideFromRight {
  0% {
    transform: translateX(100%) rotate(22deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) rotate(22deg);
    opacity: 1;
  }
}

.xiaoying-image {
  width: 125px;
  height: auto;
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
}

/* 悬停晃动动画 */
.hover-shake {
  animation: shake 0.5s ease-in-out 1.5;
}

@keyframes shake {
  0%, 100% {
    transform: rotate(22deg);
  }
  25% {
    transform: rotate(17deg);
  }
  75% {
    transform: rotate(27deg);
  }
}

/* 隐藏状态：透明且不可见，但保留占位以便动画 */
.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

/* 对话框样式 - 粉色调 */
.dialog-container {
  position: fixed;
  background: linear-gradient(135deg, #fff5f0 0%, #ffe8e0 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid #e8907a;
  z-index: 10000;
}

.dialog-header {
  background: linear-gradient(135deg, #e87a5e, #d45a3e);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #f0a090;
  cursor: move;
  user-select: none;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  font-family: "STKaiti", "KaiTi", serif;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: white;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dialog-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chat-messages::-webkit-scrollbar {
  display: none;
}

.message-item {
  display: flex;
  gap: 10px;
  animation: messageSlideIn 0.2s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: #e8907a;
}

.message-item.assistant .message-avatar {
  background: #ffd6c0;
}

.message-content {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-item.user .message-content {
  background: #e8907a;
  color: white;
}

.message-item.assistant .message-content {
  background: #fef3e8;
  color: #4a2a1e;
}

/* 打字动画 */
.typing {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
}

.typing span {
  width: 6px;
  height: 6px;
  background: #e8907a;
  border-radius: 50%;
  display: inline-block;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid #f0d0c0;
  display: flex;
  gap: 10px;
  background: white;
}

.chat-input-area input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #f0c0b0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.chat-input-area input:focus {
  border-color: #e8907a;
  box-shadow: 0 0 0 2px rgba(232, 128, 90, 0.1);
}

.chat-input-area button {
  padding: 8px 20px;
  background: linear-gradient(135deg, #e8907a, #d45a3e);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.chat-input-area button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(232, 128, 90, 0.3);
}

.chat-input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 可拖拽调整大小的边角 */
.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #e8907a;
  border-radius: 2px;
  z-index: 10;
}
.resize-nw { top: -5px; left: -5px; cursor: nw-resize; }
.resize-ne { top: -5px; right: -5px; cursor: ne-resize; }
.resize-sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.resize-se { bottom: -5px; right: -5px; cursor: se-resize; }

.resize-edge {
  position: absolute;
  z-index: 10;
}
.resize-top { top: -3px; left: 10px; right: 10px; height: 6px; cursor: n-resize; }
.resize-bottom { bottom: -3px; left: 10px; right: 10px; height: 6px; cursor: s-resize; }
.resize-left { left: -3px; top: 10px; bottom: 10px; width: 6px; cursor: w-resize; }
.resize-right { right: -3px; top: 10px; bottom: 10px; width: 6px; cursor: e-resize; }

/* 对话框淡入淡出 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.25s ease;
}
.dialog-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.85);
}
.dialog-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* 移动端适配 */
@media (max-width: 600px) {
  .xiaoying-image {
    width: 70px;
  }
  .dialog-container {
    width: 90% !important;
    height: 70% !important;
  }
  .xiaoying-character {
    bottom: 15px;
  }
}

@media (max-width: 768px) {
  .ai-container {
    /* 调整布局、字体大小等 */
    font-size: 14px;
    padding: 10px;
  }

  .ai-image {
    width: 85px;
    height: auto;
  }
}

/* 针对大屏幕的调整 */
@media (min-width: 1200px) {
  .ai-container {
    font-size: 18px;
    padding: 20px;
  }

  .xiaoying-image {
    width: 100px;
    height: auto;
  }
}
</style>
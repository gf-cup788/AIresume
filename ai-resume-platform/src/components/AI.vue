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
          <span class="dialog-title">🌸 小映 </span>
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
</template>

<script>
import xiaoyingImg from '../assets/imgs/xiaoying.png' // 图片
import xiaoying1Img from '../assets/imgs/xiaoying1.png'
import { aiChat } from '../api/index'
import { marked } from 'marked'

export default {
  name: 'AI',
  data() {
    return {
      marked,
      xiaoyingImg,
      isHovering: false,
      isHidden: false,       // 小映是否隐藏（点击弹出对话框时隐藏）
      hasSlidIn: false,      // 是否已经执行过滑入动画（避免重复）
      showDialog: false,
      inputMessage: '',
      messages: [],
      isLoading: false,
      sessionId: null,
      // 对话框位置和大小
      dialogLeft: null,
      dialogTop: null,
      dialogWidth: 800,
      dialogHeight: 800,
      isCustomPosition: false,
      // 拖拽
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      dragStartLeft: 0,
      dragStartTop: 0,
      // 调整大小
      isResizing: false,
      resizeDirection: null,
      resizeStartX: 0,
      resizeStartY: 0,
      resizeStartWidth: 0,
      resizeStartHeight: 0,
      resizeStartLeft: 0,
      resizeStartTop: 0
    }
  },
  computed: {
    dialogStyle() {
      return {
        left: this.isCustomPosition ? (this.dialogLeft + 'px') : '50%',
        top: this.isCustomPosition ? (this.dialogTop + 'px') : '50%',
        transform: this.isCustomPosition ? 'none' : 'translate(-50%, -50%)',
        width: this.dialogWidth + 'px',
        height: this.dialogHeight + 'px'
      }
    }
  },
  mounted() {
    this.messages.push({
      role: 'assistant',
      content: '你好呀～我是小映！江西的红土孕育了我，关于江西旅游的任何问题都可以问我哟！'
    })
    // 监听全局鼠标事件
    window.addEventListener('mousemove', this.onDragMove)
    window.addEventListener('mouseup', this.stopDrag)
    window.addEventListener('mousemove', this.onResizeMove)
    window.addEventListener('mouseup', this.stopResize)
    
    // 组件挂载后，延迟一小段时间确保动画触发，同时标记已滑入
    setTimeout(() => {
      this.hasSlidIn = true
    }, 500)
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.onDragMove)
    window.removeEventListener('mouseup', this.stopDrag)
    window.removeEventListener('mousemove', this.onResizeMove)
    window.removeEventListener('mouseup', this.stopResize)
  },
  methods: {
    // 拖拽相关
    startDrag(e) {
      e.preventDefault()
      this.isDragging = true
      const rect = this.$refs.dialogContainer.getBoundingClientRect()
      this.dragStartX = e.clientX
      this.dragStartY = e.clientY
      this.dragStartLeft = rect.left
      this.dragStartTop = rect.top
      
      if (!this.isCustomPosition) {
        this.dialogLeft = rect.left
        this.dialogTop = rect.top
        this.isCustomPosition = true
      }
    },
    onDragMove(e) {
      if (!this.isDragging) return
      e.preventDefault()
      const dx = e.clientX - this.dragStartX
      const dy = e.clientY - this.dragStartY
      this.dialogLeft = this.dragStartLeft + dx
      this.dialogTop = this.dragStartTop + dy
      this.dialogLeft = Math.max(-this.dialogWidth + 50, Math.min(window.innerWidth - 50, this.dialogLeft))
      this.dialogTop = Math.max(0, Math.min(window.innerHeight - 50, this.dialogTop))
    },
    stopDrag() {
      this.isDragging = false
    },
    
    // 缩放相关
    startResize(e, direction) {
      e.preventDefault()
      this.isResizing = true
      this.resizeDirection = direction
      const rect = this.$refs.dialogContainer.getBoundingClientRect()
      this.resizeStartX = e.clientX
      this.resizeStartY = e.clientY
      this.resizeStartWidth = rect.width
      this.resizeStartHeight = rect.height
      this.resizeStartLeft = rect.left
      this.resizeStartTop = rect.top
      
      if (!this.isCustomPosition) {
        this.dialogLeft = rect.left
        this.dialogTop = rect.top
        this.isCustomPosition = true
      }
    },
    onResizeMove(e) {
      if (!this.isResizing) return
      e.preventDefault()
      const dx = e.clientX - this.resizeStartX
      const dy = e.clientY - this.resizeStartY
      
      let newWidth = this.resizeStartWidth
      let newHeight = this.resizeStartHeight
      let newLeft = this.resizeStartLeft
      let newTop = this.resizeStartTop
      
      switch (this.resizeDirection) {
        case 'e': newWidth = Math.max(300, this.resizeStartWidth + dx); break
        case 'w': 
          newWidth = Math.max(300, this.resizeStartWidth - dx)
          newLeft = this.resizeStartLeft + (this.resizeStartWidth - newWidth)
          break
        case 's': newHeight = Math.max(400, this.resizeStartHeight + dy); break
        case 'n': 
          newHeight = Math.max(400, this.resizeStartHeight - dy)
          newTop = this.resizeStartTop + (this.resizeStartHeight - newHeight)
          break
        case 'se': 
          newWidth = Math.max(300, this.resizeStartWidth + dx)
          newHeight = Math.max(400, this.resizeStartHeight + dy)
          break
        case 'sw': 
          newWidth = Math.max(300, this.resizeStartWidth - dx)
          newHeight = Math.max(400, this.resizeStartHeight + dy)
          newLeft = this.resizeStartLeft + (this.resizeStartWidth - newWidth)
          break
        case 'ne': 
          newWidth = Math.max(300, this.resizeStartWidth + dx)
          newHeight = Math.max(400, this.resizeStartHeight - dy)
          newTop = this.resizeStartTop + (this.resizeStartHeight - newHeight)
          break
        case 'nw': 
          newWidth = Math.max(300, this.resizeStartWidth - dx)
          newHeight = Math.max(400, this.resizeStartHeight - dy)
          newLeft = this.resizeStartLeft + (this.resizeStartWidth - newWidth)
          newTop = this.resizeStartTop + (this.resizeStartHeight - newHeight)
          break
      }
      
      this.dialogWidth = newWidth
      this.dialogHeight = newHeight
      this.dialogLeft = newLeft
      this.dialogTop = newTop
    },
    stopResize() {
      this.isResizing = false
      this.resizeDirection = null
    },
    
    handleMouseEnter() {
      if (!this.isHidden) {
        this.isHovering = true
      }
    },
    handleMouseLeave() {
      this.isHovering = false
    },
    handleClick() {
      if (!this.isHidden) {
        // 点击后：隐藏小映，弹出对话框
        this.isHidden = true
        this.showDialog = true
      }
    },
    closeDialog() {
      this.showDialog = false
      // 关闭对话框后，重置隐藏状态，小映会再次滑入
      setTimeout(() => {
        this.resetXiaoying()
        // 重置位置和大小
        this.isCustomPosition = false
        this.dialogWidth = 800
        this.dialogHeight = 800
      }, 300)
    },
    resetXiaoying() {
      this.isHidden = false
      this.isHovering = false
      this.hasSlidIn = false  // 重置滑入标记，以便重新触发滑入动画
      // 下一帧重新标记滑入完成
      this.$nextTick(() => {
        setTimeout(() => {
          this.hasSlidIn = true
        }, 500)
      })
    },
    async sendMessage() {
      const message = this.inputMessage.trim()
      if (!message) return
    
      this.messages.push({
        role: 'user',
        content: message
      })
      this.inputMessage = ''
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    
      this.isLoading = true
    
      try {
        const requestData = { message }
        if (this.sessionId) {
          requestData.sessionId = this.sessionId
        }
        
        const result = await aiChat(requestData)
        
        if (result.code === 200 && result.data) {
          this.messages.push({
            role: 'assistant',
            content: result.data.answer
          })
          
          if (result.data.sessionId) {
            this.sessionId = result.data.sessionId
          }
        } else {
          throw new Error(result.message || '请求失败')
        }
        
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('AI对话错误:', error)
        this.messages.push({
          role: 'assistant',
          content: '哎呀，小映有点累了😵，请稍后再试试吧～'
        })
      } finally {
        this.isLoading = false
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    afterDialogClose() {
      // 可选：对话框完全关闭后的回调
    }
  }
}
</script>

<style scoped>
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
  right: -40px;
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
    transform: rotate(17deg);   /* 向左摆 */
  }
  75% {
    transform: rotate(27deg);   /* 向右摆 */
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
   scrollbar-width: none;       /* Firefox */
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
</style>
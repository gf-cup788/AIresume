<template>
  <transition-group name="ancient-msg" tag="div" class="ancient-message-container">
    <div
      v-for="item in messages"
      :key="item.id"
      class="ancient-message-item"
      :class="item.type"
    >
      <div class="ink-decoration left"></div>
      <div class="ink-decoration right"></div>

      <div class="message-icon">
        <span v-if="item.type === 'success'">✓</span>
        <span v-else-if="item.type === 'error'">✕</span>
        <span v-else-if="item.type === 'warning'">!</span>
        <span v-else>·</span>
      </div>

      <div class="message-content">
        <div class="message-title">{{ getTitle(item.type) }}</div>
        <div class="message-text">{{ item.text }}</div>
      </div>

      <div class="message-close" @click="removeMessage(item.id)">×</div>
    </div>
  </transition-group>
</template>

<script setup>
import { ref } from 'vue'

const messages = ref([])
let seed = 0

const getTitle = (type) => {
  switch (type) {
    case 'success':
      return '提示'
    case 'error':
      return '注意'
    case 'warning':
      return '提醒'
    default:
      return '消息'
  }
}

const removeMessage = (id) => {
  messages.value = messages.value.filter(item => item.id !== id)
}

const showMessage = (text, type = 'info', duration = 2500) => {
  const id = ++seed

  messages.value.push({
    id,
    text,
    type,
    duration
  })

  setTimeout(() => {
    removeMessage(id)
  }, duration)
}

defineExpose({
  showMessage,
  success(text, duration = 2500) {
    showMessage(text, 'success', duration)
  },
  error(text, duration = 2500) {
    showMessage(text, 'error', duration)
  },
  warning(text, duration = 2500) {
    showMessage(text, 'warning', duration)
  },
  info(text, duration = 2500) {
    showMessage(text, 'info', duration)
  }
})
</script>

<style scoped>
.ancient-message-container {
  position: fixed;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 14px;
  pointer-events: none;
}

.ancient-message-item {
  position: relative;
  min-width: 320px;
  max-width: 480px;
  padding: 16px 48px 16px 18px;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  pointer-events: auto;
  background: linear-gradient(
    135deg,
    rgba(248, 243, 230, 0.96) 0%,
    rgba(242, 235, 218, 0.94) 50%,
    rgba(236, 228, 208, 0.96) 100%
  );
  border: 1px solid rgba(109, 79, 52, 0.22);
  box-shadow:
    0 8px 24px rgba(61, 42, 24, 0.16),
    inset 0 0 18px rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
}

.ancient-message-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 20%, rgba(0, 0, 0, 0.05), transparent 18%),
    radial-gradient(circle at 86% 72%, rgba(0, 0, 0, 0.04), transparent 20%),
    linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(0,0,0,0.02));
  pointer-events: none;
}

.ancient-message-item::after {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px dashed rgba(104, 77, 49, 0.15);
  border-radius: 10px;
  pointer-events: none;
}

.ink-decoration {
  position: absolute;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.18;
  pointer-events: none;
}

.ink-decoration.left {
  left: -12px;
  top: -10px;
  background: rgba(82, 58, 35, 0.6);
}

.ink-decoration.right {
  right: -10px;
  bottom: -14px;
  background: rgba(120, 94, 66, 0.45);
}

.message-icon {
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fffdf8;
  box-shadow: inset 0 0 8px rgba(255,255,255,0.18);
  z-index: 1;
}

.message-content {
  position: relative;
  flex: 1;
  z-index: 1;
}

.message-title {
  font-size: 15px;
  font-weight: 700;
  color: #5b3f27;
  line-height: 1;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.message-text {
  font-size: 14px;
  color: #6b4d31;
  line-height: 1.6;
  word-break: break-all;
}

.message-close {
  position: absolute;
  right: 14px;
  top: 10px;
  font-size: 20px;
  color: rgba(107, 77, 49, 0.65);
  cursor: pointer;
  z-index: 2;
  transition: all 0.25s ease;
  user-select: none;
}

.message-close:hover {
  color: #7a5030;
  transform: scale(1.08);
}

.ancient-message-item.success .message-icon {
  background: linear-gradient(135deg, #7d9b5a, #5f7d40);
}

.ancient-message-item.error .message-icon {
  background: linear-gradient(135deg, #b06a57, #8c4a3a);
}

.ancient-message-item.warning .message-icon {
  background: linear-gradient(135deg, #c79a50, #9d7434);
}

.ancient-message-item.info .message-icon {
  background: linear-gradient(135deg, #7a8e9f, #5f7281);
}

.ancient-msg-enter-active,
.ancient-msg-leave-active {
  transition: all 0.35s ease;
}

.ancient-msg-enter-from {
  opacity: 0;
  transform: translateY(-22px) scale(0.92);
}

.ancient-msg-leave-to {
  opacity: 0;
  transform: translateY(-18px) scale(0.94);
}

@media (max-width: 768px) {
  .ancient-message-container {
    top: 18px;
    width: calc(100% - 24px);
  }

  .ancient-message-item {
    min-width: auto;
    width: 100%;
    max-width: none;
    padding: 14px 42px 14px 14px;
  }

  .message-title {
    font-size: 14px;
  }

  .message-text {
    font-size: 13px;
  }
}
</style>
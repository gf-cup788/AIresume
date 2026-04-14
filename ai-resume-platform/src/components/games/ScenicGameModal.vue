<template>
  <transition name="fade-soft">
    <div
      v-if="modelValue"
      class="story-overlay"
      @click.self="close"
    >
      <div class="story-modal puzzle-modal">
        <button class="story-close-btn" @click="close">×</button>

        <div class="story-card-head">
          <div class="story-kicker">玩一玩</div>
          <div class="story-title">{{ title }}</div>
          <div v-if="subtitle" class="story-subtitle">{{ subtitle }}</div>
        </div>

        <div class="game-body">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '小游戏'
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.story-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08), transparent 28%),
    radial-gradient(circle at 80% 78%, rgba(255, 255, 255, 0.06), transparent 24%),
    rgba(20, 26, 22, 0.44);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;

  /* 隐藏外层滚动条，但保留滚动 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.story-overlay::-webkit-scrollbar {
  display: none;
}

.story-modal {
  position: relative;
  width: min(1240px, calc(100vw - 40px));
  max-height: min(94vh, 1040px);
  overflow: hidden;
  border-radius: 30px;
  background:
    radial-gradient(circle at 12% 10%, rgba(71, 79, 70, 0.08), transparent 18%),
    radial-gradient(circle at 88% 84%, rgba(86, 69, 56, 0.08), transparent 20%),
    linear-gradient(180deg, rgba(252, 248, 238, 0.985), rgba(241, 232, 214, 0.985));
  border: 1px solid rgba(108, 92, 70, 0.18);
  box-shadow:
    0 34px 80px rgba(17, 25, 20, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    inset 0 0 0 1px rgba(148, 126, 94, 0.06);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.story-modal::before {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: 24px;
  border: 1px solid rgba(120, 101, 73, 0.14);
  pointer-events: none;
}

.story-modal::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent),
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 11px,
      rgba(117, 99, 72, 0.018) 12px,
      transparent 13px
    );
  pointer-events: none;
  opacity: 0.9;
}

.puzzle-modal {
  padding: 26px 24px 22px;
}

.story-close-btn {
  position: absolute;
  right: 18px;
  top: 18px;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(109, 89, 63, 0.18);
  border-radius: 50%;
  background: rgba(255, 251, 243, 0.92);
  color: #6d5438;
  font-size: 24px;
  line-height: 38px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(81, 62, 40, 0.12);
  transition: all 0.22s ease;
  z-index: 3;
}

.story-close-btn:hover {
  transform: scale(1.06);
  background: rgba(255, 255, 255, 0.98);
}

.story-card-head {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  padding: 6px 52px 4px 6px;
}

.story-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #7a5b3a;
  background: rgba(163, 128, 86, 0.1);
  border: 1px solid rgba(126, 98, 66, 0.14);
  white-space: nowrap;
}

.story-title {
  margin-top: 10px;
  font-size: 26px;
  line-height: 1.25;
  font-weight: 800;
  color: #4f3a26;
  letter-spacing: 0.5px;
}

.story-subtitle {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: #7a6a58;
  max-width: 760px;
}

.game-body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 6px 8px;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;

  /* 隐藏内部滚动条，但保留滚动 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.game-body::-webkit-scrollbar {
  display: none;
}

.fade-soft-enter-active,
.fade-soft-leave-active {
  transition: all 0.28s ease;
}

.fade-soft-enter-from,
.fade-soft-leave-to {
  opacity: 0;
}

.fade-soft-enter-from .story-modal,
.fade-soft-leave-to .story-modal {
  transform: translateY(18px) scale(0.98);
  opacity: 0;
}

.fade-soft-enter-to .story-modal,
.fade-soft-leave-from .story-modal {
  transform: translateY(0) scale(1);
  opacity: 1;
  transition: all 0.28s ease;
}

@media (max-width: 900px) {
  .story-overlay {
    padding: 16px;
  }

  .story-modal {
    width: min(100vw - 24px, 980px);
    max-height: 90vh;
    border-radius: 24px;
  }

  .puzzle-modal {
    padding: 18px 16px 16px;
  }

  .story-card-head {
    padding: 8px 42px 12px 4px;
  }

  .story-title {
    font-size: 24px;
  }

  .story-subtitle {
    font-size: 13px;
    line-height: 1.7;
  }

  .game-body {
    padding: 8px 8px 12px;
  }
}

@media (max-width: 600px) {
  .story-overlay {
    align-items: flex-start;
    padding: 10px;
  }

  .story-modal {
    width: calc(100vw - 12px);
    max-height: 92vh;
    border-radius: 20px;
    margin: auto 0;
  }

  .puzzle-modal {
    padding: 14px 12px 12px;
  }

  .story-close-btn {
    right: 10px;
    top: 10px;
    width: 34px;
    height: 34px;
    line-height: 32px;
    font-size: 22px;
  }

  .story-card-head {
    padding: 6px 36px 10px 2px;
  }

  .story-title {
    margin-top: 10px;
    font-size: 20px;
  }

  .story-subtitle {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.65;
  }

  .game-body {
    padding: 6px 4px 10px;
  }
}
</style>
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
const props = defineProps({
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
  background: rgba(31, 44, 34, 0.38);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.story-modal {
  position: relative;
  width: min(980px, calc(100vw - 48px));
  max-height: min(86vh, 920px);
  overflow: hidden;
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 252, 245, 0.98), rgba(247, 241, 207, 0.98));
  border: 1px solid rgba(124, 155, 95, 0.16);
  box-shadow:
    0 28px 70px rgba(36, 52, 41, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
}

.puzzle-modal {
  padding: 22px 22px 20px;
}

.story-close-btn {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.84);
  color: #66785a;
  font-size: 24px;
  line-height: 38px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(94, 116, 80, 0.12);
  transition: all 0.22s ease;
  z-index: 2;
}

.story-close-btn:hover {
  transform: scale(1.06);
  background: #ffffff;
}

.story-card-head {
  padding: 8px 52px 14px 6px;
}

.story-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #6e8758;
  background: rgba(145, 183, 112, 0.14);
  border: 1px solid rgba(126, 162, 96, 0.16);
}

.story-title {
  margin-top: 12px;
  font-size: 28px;
  line-height: 1.25;
  font-weight: 800;
  color: #596f45;
  letter-spacing: 0.5px;
}

.story-subtitle {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.8;
  color: #7f8d74;
  max-width: 760px;
}

.game-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 6px 10px;
  scrollbar-width: none;
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
}

@media (max-width: 600px) {
  .story-overlay {
    padding: 10px;
  }

  .story-modal {
    width: calc(100vw - 12px);
    max-height: 92vh;
    border-radius: 20px;
  }

  .puzzle-modal {
    padding: 14px 12px 12px;
  }

  .story-close-btn {
    right: 10px;
    top: 10px;
    width: 34px;
    height: 34px;
    line-height: 34px;
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
    padding: 2px 2px 8px;
  }
}
</style>
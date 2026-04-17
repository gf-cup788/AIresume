<template>
  <div id="app">
    <transition name="fade" appear>
      <div key="ai">
        <AI />
      </div>
    </transition>

    <!-- 全局静音控制按钮 - 始终显示在所有页面 -->
    <div
      class="global-mute-btn"
      :class="{ muted: isGlobalMuted }"
      @click="toggleGlobalMute"
    >
      <span class="mute-icon">{{ isGlobalMuted ? '🔇' : '🔊' }}</span>
      <span class="mute-text">{{ isGlobalMuted ? '静音' : '放音' }}</span>
    </div>

    <!-- 古风落款头像 -->
    <div
      v-if="!hideFloatingAvatar"
      class="floating-avatar"
      @click="toggleMenu"
    >
      <!-- 落款主体：闲章 + 头像 + 竖排字 -->
      <div class="signature-seal-wrapper">
        <!-- 朱红闲章 -->
        <div class="seal-stamp">
          <img :src="avatarUrl" class="seal-avatar" />
        </div>

        <!-- 竖排落款容器（含上下印章） -->
        <div class="signature-container">
          <!-- 上方：江湖印章 -->
          <img :src="JiangHuImg" class="seal-mark top-seal" />

          <!-- 竖排文字 -->
          <div class="signature-vertical-text">{{ usernameText }}</div>

          <!-- 下方：游客印章 -->
          <img :src="YouKeImg" class="seal-mark bottom-seal" />
        </div>
      </div>

      <!-- 下拉菜单 -->
      <transition name="menu-fade">
        <div v-if="showMenu" class="menu-scroll" @click.stop>
          <div class="menu-header">
            <span class="header-dot">●</span>
            <span class="header-text">君 子</span>
            <span class="header-dot">●</span>
          </div>

          <div class="menu-body">
            <div class="menu-item" @click.stop="goUserCenter">
              <span class="item-icon">📜</span>
              <span>游历簿</span>
            </div>

            <div v-if="!isLogin" class="menu-item" @click.stop="goLogin">
              <span class="item-icon">🏮</span>
              <span>登楼</span>
            </div>

            <div v-else class="menu-item logout-item" @click.stop="logout">
              <span class="item-icon">🍃</span>
              <span>辞别</span>
            </div>
          </div>

          <div class="menu-footer"></div>
        </div>
      </transition>
    </div>

    <router-view />

    <!-- 古风消息提示组件 -->
    <AncientMessage ref="ancientMessageRef" />
  </div>
</template>

<script>
import AI from './components/AI.vue'
import AncientMessage from '@/components/AncientMessage.vue'
import { ancientMessageRef } from '@/components/useAncientMessage'

import avatarImg from "./assets/Characters/image1.png";
import JiangHuImg from "./assets/Seal/JiangHu.png";
import YouKeImg from "./assets/Seal/YouKe.png";
import { GetUserProfile } from '@/api/auth.js';

// 全局静音状态管理
export const globalMuteState = {
  isMuted: false,
  audioElements: new Set(),
  
  setMuted(muted) {
    this.isMuted = muted;
    this.audioElements.forEach(audio => {
      audio.muted = muted;
    });
  },
  
  registerAudio(audio) {
    this.audioElements.add(audio);
    audio.muted = this.isMuted;
  },
  
  unregisterAudio(audio) {
    this.audioElements.delete(audio);
  }
};

// 全局 Audio 原型拦截，自动注册所有音频元素
const originalPlay = HTMLAudioElement.prototype.play;
HTMLAudioElement.prototype.play = function() {
  globalMuteState.registerAudio(this);
  return originalPlay.call(this);
};

const originalPause = HTMLAudioElement.prototype.pause;
HTMLAudioElement.prototype.pause = function() {
  return originalPause.call(this);
};

export default {
  name: 'App',
  components: {
    AI,
    AncientMessage
  },
  data() {
    return {
      isLogin: false,
      avatarUrl: avatarImg,
      showMenu: false,
      JiangHuImg,
      YouKeImg,
      userProfile: null,
      isGlobalMuted: false
    };
  },
  computed: {
    hideFloatingAvatar() {
      return this.$route.path === "/dialogue";
    },
    usernameText() {
      if (this.isLogin && this.userProfile) {
        return this.userProfile.username || "访客";
      }

      if (this.isLogin) {
        const user = localStorage.getItem("user");
        if (user) {
          try {
            const userData = JSON.parse(user);
            return userData.username || "访客";
          } catch (e) {
            return "访客";
          }
        }
      }

      return "访客";
    }
  },
  async created() {
    ancientMessageRef.value = this.$refs.ancientMessageRef || null;
    await this.checkLogin();
    window.addEventListener("click", this.handleClickOutside);
    
    // 从 localStorage 恢复静音状态
    const savedMuteState = localStorage.getItem("globalMuteState");
    if (savedMuteState !== null) {
      this.isGlobalMuted = savedMuteState === "true";
      globalMuteState.setMuted(this.isGlobalMuted);
    }
  },
  mounted() {
    ancientMessageRef.value = this.$refs.ancientMessageRef || null;
  },
  beforeUnmount() {
    window.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggleGlobalMute() {
      this.isGlobalMuted = !this.isGlobalMuted;
      globalMuteState.setMuted(this.isGlobalMuted);
      
      // 保存静音状态到 localStorage
      localStorage.setItem("globalMuteState", this.isGlobalMuted);
      
      // 显示提示
      if (this.isGlobalMuted) {
        this.showInfo("已开启全局静音");
      } else {
        this.showSuccess("已关闭全局静音");
      }
    },
    
    showSuccess(message) {
      if (this.$refs.ancientMessageRef) {
        this.$refs.ancientMessageRef.success(message);
      }
    },
    showError(message) {
      if (this.$refs.ancientMessageRef) {
        this.$refs.ancientMessageRef.error(message);
      }
    },
    showWarning(message) {
      if (this.$refs.ancientMessageRef) {
        this.$refs.ancientMessageRef.warning(message);
      }
    },
    showInfo(message) {
      if (this.$refs.ancientMessageRef) {
        this.$refs.ancientMessageRef.info(message);
      }
    },

    async checkLogin() {
      const user = localStorage.getItem("user");
      if (user) {
        this.isLogin = true;
        await this.fetchUserProfile();
      } else {
        this.isLogin = false;
        this.avatarUrl = avatarImg;
        this.userProfile = null;
      }
    },

    async fetchUserProfile() {
      try {
        const res = await GetUserProfile();
        if (res.code === 200 && res.data) {
          this.userProfile = res.data;

          if (res.data.avatar) {
            this.avatarUrl = res.data.avatar;
          } else {
            const user = localStorage.getItem("user");
            if (user) {
              try {
                const userData = JSON.parse(user);
                this.avatarUrl = userData.avatar || avatarImg;
              } catch (e) {
                this.avatarUrl = avatarImg;
              }
            } else {
              this.avatarUrl = avatarImg;
            }
          }
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);

        const user = localStorage.getItem("user");
        if (user) {
          try {
            const userData = JSON.parse(user);
            this.avatarUrl = userData.avatar || avatarImg;
          } catch (e) {
            this.avatarUrl = avatarImg;
          }
        } else {
          this.avatarUrl = avatarImg;
        }
      }
    },

    toggleMenu(e) {
      e.stopPropagation();
      this.showMenu = !this.showMenu;
    },

    handleClickOutside() {
      this.showMenu = false;
    },

    goUserCenter() {
      this.showMenu = false;
      this.$router.push(this.isLogin ? "/user" : "/login");
    },

    goLogin() {
      this.showMenu = false;
      this.$router.push("/login");
    },

    async logout() {
      this.showMenu = false;
      localStorage.removeItem("user");
      this.isLogin = false;
      this.avatarUrl = avatarImg;
      this.userProfile = null;

      this.showSuccess("已成功退出登录");

      if (this.$route.path !== "/") {
        this.$router.push("/");
      }
    }
  },
  watch: {
    $route() {
      this.checkLogin();
      this.showMenu = false;
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  font-family: "STKaiti", "KaiTi", serif;
}

.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
}

/* 全局静音按钮 - 始终显示 */
.global-mute-btn {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1001;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: rgba(30, 24, 18, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200, 170, 100, 0.5);
  border-radius: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.global-mute-btn:hover {
  background: rgba(40, 32, 24, 0.9);
  border-color: rgba(200, 170, 100, 0.8);
  transform: scale(1.05);
}

.global-mute-btn.muted {
  border-color: rgba(150, 120, 80, 0.6);
  opacity: 0.8;
}

.mute-icon {
  font-size: 22px;
  line-height: 1;
}

.mute-text {
  font-size: 11px;
  color: #ecdba8;
  font-family: "STKaiti", "KaiTi", serif;
  letter-spacing: 1px;
}

.global-mute-btn.muted .mute-text {
  color: #a89a7a;
}

/* 右上角漂浮 */
.floating-avatar {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  cursor: pointer;
}

/* 落款整体容器 */
.signature-seal-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* 朱红闲章 */
.seal-stamp {
  width: 50px;
  height: 50px;
  position: relative;
  background: #a83b2a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(2deg);
}

.seal-stamp::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #a83b2a 0deg 23deg,
    transparent 23deg 25deg,
    #a83b2a 25deg 45deg,
    transparent 45deg 70deg,
    #a83b2a 70deg 93deg,
    transparent 93deg 98deg,
    #a83b2a 98deg 105deg,
    transparent 105deg 106deg,
    #a83b2a 106deg 156deg,
    transparent 156deg 159deg,
    #a83b2a 159deg 200deg,
    transparent 200deg 267deg,
    #a83b2a 267deg 274deg,
    transparent 274deg 283deg,
    #a83b2a 283deg 289deg,
    transparent 289deg 340deg,
    #a83b2a 340deg 345deg,
    transparent 345deg 359deg,
    #a83b2a 359deg 360deg
  );
  mask: radial-gradient(circle at center, transparent 65%, black 70%);
  -webkit-mask: radial-gradient(circle at center, transparent 65%, black 70%);
  transform: rotate(-8deg);
  filter: blur(2px);
  pointer-events: none;
}

/* 印章内圆形头像 */
.seal-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}

/* 落款容器（包含上下印章 + 竖排文字） */
.signature-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

/* 印章图案样式 */
.seal-mark {
  width: 24px;
  height: 24px;
  object-fit: contain;
  opacity: 0.8;
  filter: sepia(1) saturate(10) hue-rotate(340deg) brightness(0.8) contrast(1.5);
}

.top-seal {
  transform: rotate(-5deg);
}

.bottom-seal {
  transform: rotate(5deg);
}

.signature-seal-wrapper:hover .seal-mark {
  opacity: 1;
}

/* 竖排毛笔小字落款 */
.signature-vertical-text {
  writing-mode: vertical-rl;
  font-size: 16px;
  color: #a83b2a;
  font-family: "华文楷书", "STKaiti", "KaiTi", "楷体", serif;
  letter-spacing: 2px;
  line-height: 1.5;
  transform: rotate(-1deg);
}

/* 菜单样式 */
.menu-scroll {
  position: absolute;
  top: 90px;
  right: 0;
  width: 160px;
  background: rgba(30, 24, 18, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(200, 170, 100, 0.5);
  border-radius: 12px;
  overflow: hidden;
  animation: menuSlideDown 0.25s ease;
}

@keyframes menuSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-header {
  background: linear-gradient(135deg, #5d4a2e, #4a3824);
  padding: 10px 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid #c9aa5f;
}

.header-dot {
  font-size: 8px;
  color: #ecdba8;
}

.header-text {
  font-size: 12px;
  color: #ecdba8;
  font-family: "STKaiti", serif;
  letter-spacing: 2px;
}

.menu-body {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 2px solid transparent;
  color: #ecdba8;
  font-size: 13px;
  font-family: "STKaiti", serif;
  letter-spacing: 1px;
}

.menu-item:hover {
  background: rgba(200, 170, 100, 0.15);
  border-left-color: #c9aa5f;
  padding-left: 20px;
}

.item-icon {
  font-size: 14px;
  width: 24px;
  text-align: center;
}

.logout-item:hover {
  background: rgba(180, 100, 80, 0.2);
  border-left-color: #c96a4a;
}

.logout-item:hover span:last-child {
  color: #e8b89a;
}

.menu-footer {
  height: 3px;
  background: linear-gradient(90deg, #c9aa5f, #ecdba8, #c9aa5f);
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.2s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 移动端适配 */
@media (max-width: 600px) {
  .global-mute-btn {
    top: 15px;
    left: 15px;
    padding: 6px 8px;
  }
  
  .mute-icon {
    font-size: 18px;
  }
  
  .mute-text {
    font-size: 9px;
  }

  .floating-avatar {
    top: 15px;
    right: 15px;
  }

  .seal-stamp {
    width: 48px;
    height: 48px;
  }

  .seal-avatar {
    width: 38px;
    height: 38px;
  }

  .signature-vertical-text {
    font-size: 12px;
  }

  .menu-scroll {
    top: 80px;
    width: 140px;
  }
}
</style>
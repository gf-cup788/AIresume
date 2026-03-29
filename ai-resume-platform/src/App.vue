<template>
  <div id="app">
    <!-- 圆形头像漂浮 - 右上角（对话页隐藏） -->
    <div
      v-if="!hideFloatingAvatar"
      class="floating-avatar"
      @click="toggleMenu"
    >
      <div class="avatar-ring">
        <img :src="avatarUrl" class="avatar" />
        <div class="avatar-ripple"></div>
      </div>

      <!-- 古风下拉菜单 -->
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

            <div
              v-if="!isLogin"
              class="menu-item"
              @click.stop="goLogin"
            >
              <span class="item-icon">🏮</span>
              <span>登楼</span>
            </div>

            <div
              v-else
              class="menu-item logout-item"
              @click.stop="logout"
            >
              <span class="item-icon">🍃</span>
              <span>辞别</span>
            </div>
          </div>
          <div class="menu-footer"></div>
        </div>
      </transition>
    </div>

    <!-- 页面内容 -->
    <router-view />
  </div>
</template>

<script>
import avatarImg from "./assets/imgs/red-soldier.png";

export default {
  data() {
    return {
      isLogin: false,
      avatarUrl: avatarImg,
      showMenu: false
    };
  },

  computed: {
    // 在对话页隐藏头像，避免遮挡内容
    hideFloatingAvatar() {
      return this.$route.path === "/dialogue";
    }
  },

  created() {
    this.checkLogin();
    window.addEventListener("click", this.handleClickOutside);
  },

  beforeDestroy() {
    window.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    checkLogin() {
      const user = localStorage.getItem("user");
      if (user) {
        this.isLogin = true;
        try {
          const userData = JSON.parse(user);
          this.avatarUrl = userData.avatar || avatarImg;
        } catch (e) {
          this.avatarUrl = avatarImg;
        }
      } else {
        this.isLogin = false;
        this.avatarUrl = avatarImg;
      }
    },

    toggleMenu(event) {
      event.stopPropagation();
      this.showMenu = !this.showMenu;
    },

    handleClickOutside() {
      if (this.showMenu) {
        this.showMenu = false;
      }
    },

    goUserCenter() {
      this.showMenu = false;
      if (this.isLogin) {
        this.$router.push("/user");
      } else {
        this.$router.push("/login");
      }
    },

    goLogin() {
      this.showMenu = false;
      this.$router.push("/login");
    },

    logout() {
      this.showMenu = false;
      localStorage.removeItem("user");
      this.isLogin = false;
      this.avatarUrl = avatarImg;
      alert("已退出登录");
      this.$router.push("/");
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
  position: relative;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
}

/* ========== 圆形漂浮头像 - 右上角 ========== */
.floating-avatar {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 1000;
  cursor: pointer;
}

/* 头像圆环 */
.avatar-ring {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(200, 170, 100, 0.4), rgba(160, 130, 80, 0.25));
  padding: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.avatar-ring:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #2a2418;
  border: 2px solid rgba(200, 170, 100, 0.6);
  transition: all 0.3s;
}

.avatar-ring:hover .avatar {
  border-color: #c9aa5f;
}

/* 涟漪动画 */
.avatar-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  animation: ripple 2s ease-out infinite;
}

@keyframes ripple {
  0% {
    width: 100%;
    height: 100%;
    opacity: 0.5;
    box-shadow: 0 0 0 0 rgba(200, 170, 100, 0.6);
  }
  50% {
    width: 130%;
    height: 130%;
    opacity: 0.3;
    box-shadow: 0 0 0 6px rgba(200, 170, 100, 0.3);
  }
  100% {
    width: 160%;
    height: 160%;
    opacity: 0;
    box-shadow: 0 0 0 12px rgba(200, 170, 100, 0);
  }
}

/* ========== 古风下拉菜单 ========== */
.menu-scroll {
  position: absolute;
  top: 62px;
  right: 0;
  width: 160px;
  background: rgba(30, 24, 18, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(200, 170, 100, 0.5);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
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

.menu-item span:last-child {
  font-size: 13px;
  color: #ecdba8;
  font-family: "STKaiti", serif;
  letter-spacing: 1px;
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

@media (max-width: 600px) {
  .floating-avatar {
    top: 15px;
    right: 15px;
  }

  .avatar-ring {
    width: 44px;
    height: 44px;
  }

  .menu-scroll {
    width: 140px;
    top: 52px;
  }

  .menu-item {
    padding: 8px 14px;
  }

  .menu-item span:last-child {
    font-size: 12px;
  }

  .item-icon {
    font-size: 12px;
    width: 20px;
  }
}
</style>
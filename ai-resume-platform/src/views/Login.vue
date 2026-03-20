<template>
  <div class="login">
    <!-- 水墨背景 -->
    <div class="ink-bg"></div>
    
    <!-- 红日背景 -->
    <div class="sun-bg"></div>
    
    <!-- 山峦层叠 -->
    <div class="mountains">
      <div class="mountain-layer layer1"></div>
      <div class="mountain-layer layer2"></div>
      <div class="mountain-layer layer3"></div>
    </div>
    
    <!-- 松树剪影 -->
    <div class="pine-tree"></div>
    
    <!-- 红色飘带 -->
    <div class="ribbon"></div>
    
    <!-- 飞鸟 -->
    <div class="birds">
      <span v-for="i in 5" :key="i" class="bird" :style="{ animationDelay: i * 0.5 + 's', top: (20 + i * 8) + '%', left: (10 + i * 15) + '%' }">✧</span>
    </div>
    
    <!-- 梅花点缀 -->
    <div class="plum-blossoms">
      <span v-for="i in 8" :key="i" class="plum" :style="{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDelay: i * 0.3 + 's' }">❀</span>
    </div>
    
    <!-- 登录卷轴 -->
    <div class="scroll-container">
      <div class="scroll-wrapper">
        <!-- 卷轴顶端装饰 -->
        <div class="scroll-top">
          <div class="scroll-roller left"></div>
          <div class="scroll-roller right"></div>
        </div>
        
        <!-- 卷轴内容 -->
        <div class="scroll-content">
          <div class="content-inner">
            <div class="logo-section">
              <div class="red-star">★</div>
              <h1 class="title">江右文脉</h1>
              <div class="subtitle">· 赣鄱风韵 ·</div>
            </div>
            
            <div class="welcome-text">
              <p class="poem-line">巍巍井冈存浩气</p>
              <p class="poem-line">滔滔赣水蕴文心</p>
              <p class="poem-desc">登临入阁 · 共赴山水之约</p>
            </div>
            
            <div class="form-section">
              <div class="input-group">
                <span class="input-icon">👤</span>
                <input 
                  v-model="username" 
                  type="text"
                  placeholder="雅号 / 姓名"
                  @keyup.enter="login"
                  class="input-field"
                />
              </div>
              
              <div class="input-group">
                <span class="input-icon">🔒</span>
                <input 
                  v-model="password" 
                  type="password" 
                  placeholder="密钥"
                  @keyup.enter="login"
                  class="input-field"
                />
              </div>
              
              <button class="login-btn" @click="login">
                <span class="btn-text">入阁登临</span>
                <span class="btn-icon">→</span>
              </button>
            </div>
            
            <div class="guest-tip">
              <span class="tip-icon">🏮</span>
              <span>任意雅号皆可入阁</span>
              <span class="tip-icon">🏮</span>
            </div>
            
            <div class="cultural-note">
              <span class="note-mark">✧</span>
              江西风景独好 · 红色精神永存
              <span class="note-mark">✧</span>
            </div>
          </div>
        </div>
        
        <!-- 卷轴底端装饰 -->
        <div class="scroll-bottom">
          <div class="scroll-roller left"></div>
          <div class="scroll-roller right"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import defaultAvatar from "../assets/imgs/red-soldier.png";

const router = useRouter();
const route = useRoute();

const username = ref("");
const password = ref("");

const login = () => {
  if (!username.value.trim()) {
    alert("请输入雅号");
    return;
  }
  
  const user = {
    name: username.value.trim(),
    avatar: defaultAvatar,
    loginTime: new Date().toISOString(),
    motto: "寻梦赣鄱"
  };
  
  localStorage.setItem("user", JSON.stringify(user));
  
  // 重定向
  const redirect = route.query.redirect;
  if (redirect) {
    router.push(redirect);
  } else {
    router.push("/");
  }
};
</script>

<style scoped>
.login {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #2a1a0f;
}

/* 水墨背景 */
.ink-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 30% 40%, rgba(100, 70, 40, 0.3) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(80, 50, 30, 0.4) 0%, transparent 70%),
    repeating-linear-gradient(45deg, rgba(60, 40, 20, 0.05) 0px, rgba(60, 40, 20, 0.05) 2px, transparent 2px, transparent 8px);
  z-index: 0;
}

/* 红日背景 */
.sun-bg {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(200, 80, 50, 0.3) 0%, rgba(180, 60, 40, 0.15) 50%, transparent 80%);
  border-radius: 50%;
  filter: blur(40px);
  z-index: 0;
  animation: sunGlow 4s ease-in-out infinite;
}

@keyframes sunGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* 山峦层叠 */
.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  z-index: 0;
  pointer-events: none;
}

.mountain-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(50, 35, 25, 0.4);
}

.layer1 {
  height: 100%;
  background: linear-gradient(0deg, rgba(60, 40, 25, 0.5) 0%, transparent 100%);
  clip-path: polygon(0% 100%, 8% 65%, 15% 80%, 22% 55%, 30% 70%, 38% 45%, 45% 65%, 53% 40%, 60% 55%, 68% 35%, 75% 50%, 82% 30%, 90% 45%, 95% 25%, 100% 40%, 100% 100%);
}

.layer2 {
  height: 80%;
  background: rgba(70, 50, 30, 0.4);
  clip-path: polygon(0% 100%, 12% 55%, 20% 70%, 28% 48%, 35% 60%, 42% 40%, 50% 55%, 58% 38%, 65% 50%, 72% 32%, 80% 45%, 88% 28%, 100% 42%, 100% 100%);
  opacity: 0.7;
}

.layer3 {
  height: 60%;
  background: rgba(90, 60, 40, 0.3);
  clip-path: polygon(0% 100%, 18% 45%, 25% 60%, 32% 40%, 40% 52%, 48% 35%, 55% 48%, 62% 30%, 70% 42%, 78% 25%, 85% 38%, 92% 22%, 100% 35%, 100% 100%);
  opacity: 0.5;
}

/* 松树剪影 */
.pine-tree {
  position: absolute;
  bottom: 5%;
  left: 5%;
  width: 80px;
  height: 120px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><polygon points="50,10 35,45 45,45 40,70 50,70 45,45 55,45 50,10" fill="rgba(80,100,60,0.4)"/><polygon points="50,35 40,60 48,60 45,80 55,80 52,60 60,60 50,35" fill="rgba(70,90,55,0.5)"/><rect x="48" y="80" width="4" height="50" fill="rgba(60,45,30,0.6)"/></svg>') no-repeat;
  background-size: contain;
  z-index: 0;
  pointer-events: none;
  filter: blur(2px);
  opacity: 0.6;
}

/* 红色飘带 */
.ribbon {
  position: absolute;
  top: 15%;
  left: -10%;
  width: 120%;
  height: 60px;
  background: linear-gradient(90deg, transparent, rgba(180, 60, 45, 0.4), rgba(200, 80, 55, 0.6), rgba(180, 60, 45, 0.4), transparent);
  transform: rotate(-8deg);
  filter: blur(6px);
  z-index: 0;
  pointer-events: none;
}

/* 飞鸟 */
.birds {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.bird {
  position: absolute;
  font-size: 16px;
  color: rgba(200, 170, 120, 0.5);
  animation: fly 12s linear infinite;
  transform: translateX(-100%);
}

@keyframes fly {
  0% {
    transform: translateX(-100%) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 0.5;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    transform: translateX(100vw) translateY(20px);
    opacity: 0;
  }
}

/* 梅花点缀 */
.plum-blossoms {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.plum {
  position: absolute;
  font-size: 12px;
  color: rgba(200, 120, 100, 0.4);
  animation: floatPlum 8s ease-in-out infinite;
}

@keyframes floatPlum {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-20px) rotate(15deg);
    opacity: 0.6;
  }
}

/* 登录卷轴容器 */
.scroll-container {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.scroll-wrapper {
  max-width: 420px;
  width: 100%;
  animation: slideUpScroll 0.6s ease-out;
}

@keyframes slideUpScroll {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卷轴样式 */
.scroll-top, .scroll-bottom {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
}

.scroll-roller {
  width: 50px;
  height: 12px;
  background: linear-gradient(135deg, #c97e4a, #9a5a2a);
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,200,150,0.5);
}

.scroll-top {
  margin-bottom: -2px;
}

.scroll-bottom {
  margin-top: -2px;
}

/* 卷轴内容 */
.scroll-content {
  background: linear-gradient(135deg, #fffef0 0%, #fff5e5 100%);
  border-radius: 8px;
  padding: 40px 32px;
  position: relative;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,240,0.8);
  border-left: 4px solid #c54c2c;
  border-right: 4px solid #c54c2c;
}

/* 宣纸纹理 */
.scroll-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(45deg, rgba(200, 170, 120, 0.05) 0px, rgba(200, 170, 120, 0.05) 2px, transparent 2px, transparent 8px);
  pointer-events: none;
  border-radius: 4px;
}

.content-inner {
  position: relative;
  z-index: 1;
}

/* Logo 区域 */
.logo-section {
  text-align: center;
  margin-bottom: 24px;
}

.red-star {
  font-size: 42px;
  color: #c54c2c;
  margin-bottom: 8px;
  animation: starPulse 2s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(200, 80, 50, 0.5);
}

@keyframes starPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.title {
  font-size: 32px;
  font-weight: 400;
  color: #5a3a2a;
  margin: 0;
  letter-spacing: 8px;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
}

.subtitle {
  font-size: 12px;
  color: #b87c4a;
  letter-spacing: 3px;
  margin-top: 6px;
}

/* 欢迎诗句 */
.welcome-text {
  text-align: center;
  margin: 28px 0 32px;
  padding: 16px 0;
  border-top: 1px dashed #e8d4b0;
  border-bottom: 1px dashed #e8d4b0;
}

.poem-line {
  font-size: 15px;
  color: #7d5a3a;
  line-height: 1.8;
  font-family: "STKaiti", serif;
  letter-spacing: 1px;
  margin: 4px 0;
}

.poem-desc {
  font-size: 12px;
  color: #c97e4a;
  margin-top: 12px;
  letter-spacing: 1px;
}

/* 表单区域 */
.form-section {
  margin-top: 32px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  background: rgba(245, 235, 215, 0.6);
  border-radius: 40px;
  border: 1px solid #e8d4b0;
  transition: all 0.2s;
}

.input-group:focus-within {
  border-color: #c97e4a;
  box-shadow: 0 0 0 2px rgba(200, 120, 70, 0.2);
  background: rgba(255, 250, 235, 0.9);
}

.input-icon {
  padding: 0 16px;
  font-size: 18px;
  color: #b87c4a;
}

.input-field {
  flex: 1;
  padding: 14px 16px 14px 0;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #4a3a2a;
  outline: none;
  font-family: "STKaiti", serif;
}

.input-field::placeholder {
  color: #c0a87a;
  font-size: 13px;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 14px;
  margin-top: 12px;
  background: linear-gradient(135deg, #c54c2c, #9a3a20);
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: normal;
  color: #fff8e8;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: "STKaiti", serif;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(150, 50, 20, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(150, 50, 20, 0.4);
  background: linear-gradient(135deg, #d45c38, #aa4a28);
}

.login-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 14px;
  transition: transform 0.2s;
}

.login-btn:hover .btn-icon {
  transform: translateX(4px);
}

/* 游客提示 */
.guest-tip {
  text-align: center;
  margin-top: 24px;
  padding: 12px;
  background: rgba(230, 210, 170, 0.3);
  border-radius: 40px;
  font-size: 12px;
  color: #b87c4a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tip-icon {
  font-size: 12px;
}

/* 文化注脚 */
.cultural-note {
  text-align: center;
  margin-top: 20px;
  font-size: 10px;
  color: #c0a87a;
  letter-spacing: 1px;
}

.note-mark {
  margin: 0 6px;
  font-size: 8px;
}

/* 响应式 */
@media (max-width: 500px) {
  .scroll-content {
    padding: 30px 24px;
  }
  
  .title {
    font-size: 26px;
    letter-spacing: 4px;
  }
  
  .poem-line {
    font-size: 13px;
  }
  
  .input-field {
    padding: 12px 12px 12px 0;
    font-size: 14px;
  }
  
  .scroll-roller {
    width: 35px;
    height: 10px;
  }
  
  .pine-tree {
    display: none;
  }
}
</style>
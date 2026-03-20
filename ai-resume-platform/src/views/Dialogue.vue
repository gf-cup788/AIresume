<template>
  <div class="dialogue">
    <!-- 水墨背景 -->
    <div class="ink-bg" :style="{ backgroundImage: 'url(' + currentBgImage + ')' }"></div>

    <!-- 卷轴装饰 -->
    <div class="scroll-left"></div>
    <div class="scroll-right"></div>

    <!-- 窗棂效果 -->
    <div class="window-frame">
      <div class="window-grid"></div>
    </div>

    <!-- 顶部操作区 -->
    <div class="top-actions">
      <button class="skip-btn" @click.stop="skipToStory">
        <span class="skip-icon">⏭</span>
        跳过对话
      </button>
    </div>

    <!-- NPC 区域 -->
    <div class="npc-container">
      <div class="painting-frame">
        <div class="painting-mount">
          <img :src="npcImage" class="npc-portrait" />
          <div class="painting-seal"></div>
        </div>
        <div class="npc-name">
          <span class="name-left">「</span>
          {{ npcName }}
          <span class="name-right">」</span>
        </div>
        <div class="npc-poem" v-if="npcPoem">{{ npcPoem }}</div>
      </div>
    </div>

    <!-- 对话框 -->
    <div class="dialog-wrapper">
      <div class="dialog-decoration top-left"></div>
      <div class="dialog-decoration top-right"></div>
      <div class="dialog-box" @click="next">
        <div class="dialog-inner">
          <div class="dialog-quote">「</div>
          <div class="dialog-text">{{ currentText }}</div>
          <div class="dialog-quote right">」</div>
        </div>
        <div class="next-hint" v-if="!isLastLine">
          <span class="hint-icon">✧</span> 轻触续读 <span class="hint-icon">✧</span>
        </div>
        <div class="next-hint story-hint" v-else>
          <span class="hint-icon">📖</span> 入卷听故事 <span class="hint-icon">📖</span>
        </div>
      </div>
      <div class="dialog-decoration bottom-left"></div>
      <div class="dialog-decoration bottom-right"></div>
    </div>

    <!-- 游客提示 -->
    <div v-if="isDemo && showDemoTip" class="invitation-mask">
      <div class="invitation-scroll">
        <div class="scroll-header">
          <span class="scroll-ornament">✧</span>
          <span class="scroll-title">邀君入卷</span>
          <span class="scroll-ornament">✧</span>
        </div>
        <div class="scroll-content">
          <p class="invitation-text">客官且慢</p>
          <p class="invitation-desc">
            登录后方可解锁完整剧情<br />
            并留下您的游历印记
          </p>
          <div class="invitation-actions">
            <button class="btn-login" @click="goLogin">
              <span class="btn-icon">🏮</span>
              登 录
            </button>
            <button class="btn-continue" @click="closeTip">
              <span class="btn-icon">🍃</span>
              且行且赏
            </button>
          </div>
        </div>
        <div class="scroll-footer"></div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="sound-wave"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import defaultAvatar from "@/assets/imgs/red-soldier.png";
import lushanBg from "@/assets/imgs/lushan.jpg";
import jinggangshanBg from "@/assets/imgs/jinggangshan.jpg";
import wuyuanBg from "@/assets/imgs/wuyuan.jpg";

const route = useRoute();
const router = useRouter();

// 是否游客模式
const isDemo = route.query.demo === "true";
const scenicId = Number(route.query.id) || 1;
const showDemoTip = ref(true);

// NPC 配置
const npcConfig = {
  1: {
    name: "云游货郎",
    image: defaultAvatar,
    poem: "庐山烟雨浙江潮，未到空闻意已遥"
  },
  2: {
    name: "山间老翁",
    image: defaultAvatar,
    poem: "黄洋界上炮声隆，报道敌军宵遁"
  },
  3: {
    name: "桃源村叟",
    image: defaultAvatar,
    poem: "黄萼裳裳绿叶稠，千村欣卜榨新油"
  }
};

// 背景图
const bgImages = {
  1: lushanBg,
  2: jinggangshanBg,
  3: wuyuanBg
};

const currentBgImage = bgImages[scenicId] || lushanBg;

const npcName = npcConfig[scenicId]?.name || "云游货郎";
const npcImage = npcConfig[scenicId]?.image || defaultAvatar;
const npcPoem = npcConfig[scenicId]?.poem || "";

// 对话内容
const dialogues = {
  1: [
    "客官远道而来，可曾听闻「匡庐奇秀甲天下」之说？",
    "此山云雾缭绕，飞瀑如练。太白居士曾叹『飞流直下三千尺，疑是银河落九天』。",
    "不知客官可愿听在下讲讲这庐山的千古传说？"
  ],
  2: [
    "少侠请留步！老夫看您气宇不凡，定是有缘之人。",
    "此山名曰井冈，曾是星火燎原之地。每一寸土地，都藏着英雄往事。",
    "可愿听老朽为您道来这段峥嵘岁月？"
  ],
  3: [
    "客官来得正是时候！再过半月，这漫山遍野的油菜花便开了。",
    "白墙黛瓦间，黄花如海。徽州人家，诗书传世，好一幅江南水墨。",
    "客官可想听听这婺源的故事？"
  ]
};

const dialogue = dialogues[scenicId] || dialogues[1];
const index = ref(0);
const currentText = ref(dialogue[0]);

const isLastLine = computed(() => index.value === dialogue.length - 1);

// 下一句
const next = () => {
  if (isDemo && index.value === 1 && showDemoTip.value) {
    return;
  }

  if (index.value < dialogue.length - 1) {
    index.value++;
    currentText.value = dialogue[index.value];
  } else {
    goStoryPage();
  }
};

// 统一跳转到故事页
const goStoryPage = () => {
  router.push({
    path: "/story",
    query: {
      id: scenicId,
      demo: isDemo
    }
  });
};

// 新增：跳过按钮直接进入故事页
const skipToStory = () => {
  goStoryPage();
};

const closeTip = () => {
  showDemoTip.value = false;
  if (index.value < dialogue.length - 1) {
    index.value++;
    currentText.value = dialogue[index.value];
  }
};

const goLogin = () => {
  router.push({
    path: "/login",
    query: { redirect: `/dialogue?id=${scenicId}` }
  });
};

onMounted(() => {
  const user = localStorage.getItem("user");
  if (user && isDemo) {
    router.replace({
      path: "/dialogue",
      query: { id: scenicId }
    });
  }
});
</script>

<style scoped>
.dialogue {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 水墨背景 */
.ink-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.ink-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(30, 24, 18, 0.4) 0%,
    rgba(44, 36, 24, 0.35) 100%
  );
  pointer-events: none;
}

.ink-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 40%,
    rgba(0, 0, 0, 0.2) 0%,
    transparent 60%
  );
  pointer-events: none;
}

/* 卷轴左右装饰 */
.scroll-left,
.scroll-right {
  position: absolute;
  top: 0;
  width: 80px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.scroll-left {
  left: 0;
  background: linear-gradient(
    90deg,
    rgba(100, 75, 45, 0.3) 0%,
    rgba(100, 75, 45, 0.15) 30%,
    transparent 100%
  );
}

.scroll-right {
  right: 0;
  background: linear-gradient(
    270deg,
    rgba(100, 75, 45, 0.3) 0%,
    rgba(100, 75, 45, 0.15) 30%,
    transparent 100%
  );
}

/* 窗棂效果 */
.window-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.window-grid {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 1px solid rgba(200, 170, 120, 0.4);
  box-shadow:
    inset 0 0 30px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(200, 170, 120, 0.3);
}

/* 顶部跳过按钮 */
.top-actions {
  position: absolute;
  top: 26px;
  right: 26px;
  z-index: 5;
}

.skip-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid rgba(201, 170, 95, 0.8);
  border-radius: 999px;
  background: rgba(30, 24, 18, 0.78);
  backdrop-filter: blur(8px);
  color: #ecdba8;
  font-size: 14px;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.skip-btn:hover {
  transform: translateY(-2px);
  background: rgba(40, 30, 20, 0.9);
  border-color: #e0c48c;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.32);
}

.skip-icon {
  font-size: 14px;
}

/* NPC 区域 */
.npc-container {
  position: absolute;
  right: 8%;
  bottom: 25%;
  z-index: 2;
  animation: floatSlow 4s ease-in-out infinite;
}

.painting-frame {
  position: relative;
  background: rgba(245, 237, 224, 0.92);
  backdrop-filter: blur(4px);
  padding: 12px 12px 20px 12px;
  border-radius: 4px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transform: rotate(2deg);
}

.painting-mount {
  position: relative;
  background: #fff9ef;
  padding: 8px;
  border: 1px solid #d4b87a;
}

.npc-portrait {
  width: 160px;
  height: auto;
  display: block;
  filter: sepia(0.2) contrast(1.05);
  transition: all 0.3s;
}

.painting-seal {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 100, 80, 0.6), rgba(160, 70, 50, 0.4));
  opacity: 0.6;
}

.npc-name {
  text-align: center;
  margin-top: 12px;
  font-size: 16px;
  color: #b87c4a;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  letter-spacing: 4px;
}

.name-left,
.name-right {
  color: #c9aa5f;
  font-size: 14px;
}

.npc-poem {
  text-align: center;
  font-size: 11px;
  color: #9b8a6b;
  margin-top: 8px;
  font-style: italic;
  letter-spacing: 1px;
}

/* 对话框区域 */
.dialog-wrapper {
  position: absolute;
  bottom: 8%;
  left: 5%;
  right: 5%;
  z-index: 3;
}

.dialog-decoration {
  position: absolute;
  width: 30px;
  height: 30px;
  opacity: 0.5;
  pointer-events: none;
}

.top-left {
  top: -10px;
  left: -10px;
  border-top: 2px solid #c9aa5f;
  border-left: 2px solid #c9aa5f;
  width: 40px;
  height: 40px;
}

.top-right {
  top: -10px;
  right: -10px;
  border-top: 2px solid #c9aa5f;
  border-right: 2px solid #c9aa5f;
  width: 40px;
  height: 40px;
}

.bottom-left {
  bottom: -10px;
  left: -10px;
  border-bottom: 2px solid #c9aa5f;
  border-left: 2px solid #c9aa5f;
  width: 40px;
  height: 40px;
}

.bottom-right {
  bottom: -10px;
  right: -10px;
  border-bottom: 2px solid #c9aa5f;
  border-right: 2px solid #c9aa5f;
  width: 40px;
  height: 40px;
}

.dialog-box {
  background: rgba(30, 24, 18, 0.88);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 24px 28px;
  cursor: pointer;
  border: 1px solid rgba(200, 170, 100, 0.5);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.dialog-box:hover {
  background: rgba(35, 28, 20, 0.94);
  border-color: rgba(200, 170, 100, 0.8);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.dialog-inner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.dialog-quote {
  font-size: 32px;
  color: #c9aa5f;
  font-family: "STKaiti", serif;
  line-height: 1;
  opacity: 0.6;
}

.dialog-quote.right {
  align-self: flex-end;
}

.dialog-text {
  flex: 1;
  font-size: 18px;
  line-height: 1.7;
  color: #f0e6d8;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.next-hint {
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: #c9aa5f;
  letter-spacing: 2px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.dialog-box:hover .next-hint {
  opacity: 1;
}

.hint-icon {
  margin: 0 8px;
  font-size: 10px;
}

.story-hint {
  color: #e8c468;
}

/* 游客提示 */
.invitation-mask {
  position: fixed;
  inset: 0;
  background: rgba(20, 16, 12, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.4s ease;
}

.invitation-scroll {
  width: 320px;
  background: #fef7e8;
  border-radius: 8px 8px 16px 16px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 240, 0.8);
  overflow: hidden;
  animation: slideUp 0.4s ease;
}

.scroll-header {
  background: linear-gradient(135deg, #ecdba8, #e0cf9c);
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #c9aa5f;
}

.scroll-title {
  font-size: 20px;
  color: #5d3a1a;
  font-family: "STKaiti", serif;
  letter-spacing: 6px;
  margin: 0 12px;
}

.scroll-ornament {
  color: #b87c4a;
  font-size: 14px;
}

.scroll-content {
  padding: 28px 24px;
  text-align: center;
}

.invitation-text {
  font-size: 20px;
  color: #6b4a2a;
  font-family: "STKaiti", serif;
  margin-bottom: 16px;
  letter-spacing: 2px;
}

.invitation-desc {
  font-size: 14px;
  color: #9b7a5a;
  line-height: 1.8;
  margin-bottom: 28px;
}

.invitation-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-login,
.btn-continue {
  padding: 10px 24px;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: "STKaiti", serif;
  letter-spacing: 2px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  background: linear-gradient(135deg, #d4b87a, #c9aa5f);
  color: #2c2418;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  background: linear-gradient(135deg, #e0c48c, #d4b87a);
}

.btn-continue {
  background: transparent;
  border: 1px solid #c9aa5f;
  color: #b87c4a;
}

.btn-continue:hover {
  background: rgba(200, 170, 100, 0.1);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 14px;
}

.scroll-footer {
  height: 8px;
  background: linear-gradient(180deg, #ecdba8, #d4bc84);
}

/* 背景装饰 */
.sound-wave {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 60px;
  height: 30px;
  pointer-events: none;
  z-index: 2;
  opacity: 0.3;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 3px,
    rgba(140, 100, 60, 0.3) 3px,
    rgba(140, 100, 60, 0.3) 5px
  );
  border-radius: 4px;
}

/* 动画 */
@keyframes floatSlow {
  0%, 100% {
    transform: translateY(0) rotate(2deg);
  }
  50% {
    transform: translateY(-8px) rotate(1deg);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 600px) {
  .top-actions {
    top: 14px;
    left: 14px;
  }

  .skip-btn {
    padding: 8px 14px;
    font-size: 12px;
    letter-spacing: 1px;
  }

  .npc-container {
    right: 5%;
    bottom: 28%;
  }

  .npc-portrait {
    width: 120px;
  }

  .dialog-text {
    font-size: 15px;
  }

  .dialog-box {
    padding: 18px 20px;
  }

  .dialog-quote {
    font-size: 24px;
  }

  .invitation-scroll {
    width: 280px;
  }

  .invitation-text {
    font-size: 18px;
  }

  .window-grid {
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
  }
}
</style>
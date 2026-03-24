<template>
  <div
    class="dialogue-page"
    @mousemove="handleMouseMove"
    @mouseleave="resetParallax"
  >
    <!-- 背景层 -->
    <div
      class="scene-bg main"
      :style="{
        backgroundImage: 'url(' + currentBgImage + ')',
        transform: `scale(1.08) translate(${bgOffsetX}px, ${bgOffsetY}px)`
      }"
    ></div>
    <div class="scene-bg blur"></div>
    <div class="scene-vignette"></div>
    <div class="mist mist-1"></div>
    <div class="mist mist-2"></div>
    <div class="grain"></div>

    <!-- 顶部信息 -->
    <div class="top-bar">
      <div class="scene-chip">{{ scenicTitle }}</div>
      <div class="progress-wrap">
        <div class="progress-text">剧情进度 {{ index + 1 }} / {{ dialogue.length }}</div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
      <button class="skip-btn" @click.stop="skipToStory">跳过剧情</button>
    </div>

    <!-- 中景角色 -->
    <div class="character-stage">
      <div
        class="character traveler-card"
        :class="{
          active: currentRole === 'traveler',
          dim: currentRole !== 'traveler'
        }"
        :style="{ transform: `translate(${travelerOffsetX}px, ${travelerOffsetY}px)` }"
      >
        <div class="character-halo traveler"></div>
        <!-- <div class="character-ring"></div> -->
        <img :src="travelerImage" class="character-img traveler-img" alt="旅人" />
        <!-- <div class="character-tag left">
          <span class="tag-role">旅人</span>
          <span class="tag-name">{{ travelerName }}</span>
        </div> -->
      </div>

      <div
        class="character npc-card"
        :class="{
          active: currentRole === 'npc',
          dim: currentRole !== 'npc'
        }"
        :style="{ transform: `translate(${npcOffsetX}px, ${npcOffsetY}px)` }"
      >
        <div class="character-halo npc"></div>
        <!-- <div class="character-ring"></div> -->
        <img :src="npcImage" class="character-img npc-img" :alt="npcName" />
        <!-- <div class="character-tag right">
          <span class="tag-role">向导</span>
          <span class="tag-name">{{ npcName }}</span>
        </div> -->
      </div>
    </div>

    <!-- 底部剧情板 -->
    <div class="dialogue-shell">
      <div class="dialogue-card" @click="next">
        <div class="dialogue-card-inner">
          <div class="dialogue-head">
            <div class="speaker-badge" :class="currentRole">
              <span class="speaker-dot"></span>
              <span>{{ currentSpeakerName }}</span>
            </div>

            <div class="head-right">
              <div class="mood-line">
                {{ currentRole === 'traveler' ? '旅人提问中' : '人物讲述中' }}
              </div>
              <button class="instant-btn" @click.stop="toggleAutoOrComplete">
                {{ isTyping ? '显示全文' : autoPlay ? '停止自动' : '自动播放' }}
              </button>
            </div>
          </div>

          <div class="dialogue-main">
            <div class="quote-mark">“</div>
            <div class="dialogue-text">
              {{ displayedText }}<span v-if="isTyping" class="typing-caret"></span>
            </div>
          </div>

          <div class="dialogue-foot">
            <div class="poem-box">
              <div class="poem-label">风物引句</div>
              <div class="poem-text">
                {{ currentRole === 'npc' && npcPoem ? npcPoem : footHint }}
              </div>
            </div>

            <div class="continue-area">
              <div class="continue-tip">
                {{ isTyping ? '点击可快速显示' : isLastLine ? '点击进入故事页' : '点击继续剧情' }}
              </div>
              <div class="continue-icon" :class="{ end: isLastLine && !isTyping }">
                <span v-if="isTyping">···</span>
                <span v-else-if="isLastLine">➜</span>
                <span v-else>»</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tap-hint">轻触对话框继续</div>
    </div>

    <!-- DEMO 提示 -->
    <transition name="fade-soft">
      <div v-if="isDemo && showDemoTip" class="invitation-mask">
        <div class="invitation-panel">
          <div class="invitation-kicker">试玩模式</div>
          <div class="invitation-title">后续剧情待解锁</div>
          <div class="invitation-desc">
            登录后可查看完整对话内容，<br />
            并保存你的景点打卡记录。
          </div>
          <div class="invitation-actions">
            <button class="panel-btn primary" @click="goLogin">前往登录</button>
            <button class="panel-btn" @click="closeTip">继续试看</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import defaultAvatar from "@/assets/imgs/red-soldier1.png";
import defaultAvatarA from "@/assets/imgs/red-soldier.png";
import lushanBg from "@/assets/imgs/lushan.jpg";
import jinggangshanBg from "@/assets/imgs/jinggangshan.jpg";
import wuyuanBg from "@/assets/imgs/wuyuan.jpg";

const route = useRoute();
const router = useRouter();

const isDemo = route.query.demo === "true";
const scenicId = Number(route.query.id) || 1;
const showDemoTip = ref(true);

const travelerNames = {
  1: "扶光",
  2: "行川",
  3: "阿禾"
};

const npcConfig = {
  1: {
    name: "云游货郎",
    image: defaultAvatar,
    poem: "庐山烟雨浙江潮，未到空闻意已遥",
    title: "庐山·云雾初开"
  },
  2: {
    name: "山间老翁",
    image: defaultAvatar,
    poem: "黄洋界上炮声隆，报道敌军宵遁",
    title: "井冈山·松涛回声"
  },
  3: {
    name: "桃源村叟",
    image: defaultAvatar,
    poem: "黄萼裳裳绿叶稠，千村欣卜榨新油",
    title: "婺源·春野入画"
  }
};

const bgImages = {
  1: lushanBg,
  2: jinggangshanBg,
  3: wuyuanBg
};

const currentBgImage = bgImages[scenicId] || lushanBg;
const travelerName = travelerNames[scenicId] || "扶光";
const npcName = npcConfig[scenicId]?.name || "云游货郎";
const npcImage = npcConfig[scenicId]?.image || defaultAvatar;
const travelerImage = defaultAvatarA;
const npcPoem = npcConfig[scenicId]?.poem || "";
const scenicTitle = npcConfig[scenicId]?.title || "江西风物";

const dialogues = {
  1: [
    { role: "traveler", speaker: travelerName, text: "这山间云气这样重，我总觉得它像藏着很多故事。" },
    { role: "npc", speaker: npcName, text: "客官好眼力。此处正是庐山，自古便有匡庐奇秀甲天下之誉。" },
    { role: "traveler", speaker: travelerName, text: "我好像听过李白写过这里，是不是和瀑布有关？" },
    { role: "npc", speaker: npcName, text: "正是。太白曾见飞瀑悬空，一时诗兴大发，写下飞流直下三千尺的名句。" },
    { role: "traveler", speaker: travelerName, text: "原来如此。那庐山除了风景，还有别的值得听一听吗？" },
    { role: "npc", speaker: npcName, text: "自然有。若你愿意，接下来我便带你慢慢看这山水背后的旧闻与人文。" }
  ],
  2: [
    { role: "traveler", speaker: travelerName, text: "这里的山路很深，和我想象中的景点不太一样。" },
    { role: "npc", speaker: npcName, text: "井冈山本就不只是风景。群峰之间，也藏着一段不能忘却的历史。" },
    { role: "traveler", speaker: travelerName, text: "所以大家才总说，它是中国革命的重要地方？" },
    { role: "npc", speaker: npcName, text: "不错。这里被誉为中国革命的摇篮，许多故事都从这片山岭间开始。" },
    { role: "traveler", speaker: travelerName, text: "我想听听，这里的山为什么会和信念联系在一起。" },
    { role: "npc", speaker: npcName, text: "那便继续往下看吧，我慢慢讲给你听。" }
  ],
  3: [
    { role: "traveler", speaker: travelerName, text: "这里看起来像画里一样，真的是现实中的村子吗？" },
    { role: "npc", speaker: npcName, text: "自然是。这里是婺源，白墙黛瓦、山水田园，最擅长把四季都过成画卷。" },
    { role: "traveler", speaker: travelerName, text: "那春天是不是最热闹的时候？" },
    { role: "npc", speaker: npcName, text: "正是。油菜花一开，村落、梯田与晨雾相映，远远看去便像金色云海。" },
    { role: "traveler", speaker: travelerName, text: "难怪那么多人想来这里。除了景色，还有什么特别之处？" },
    { role: "npc", speaker: npcName, text: "旧村、民俗、烟火气，都是婺源最耐人寻味的地方。走吧，我带你细看。" }
  ]
};

const dialogue = dialogues[scenicId] || dialogues[1];
const index = ref(0);

const currentItem = computed(() => dialogue[index.value]);
const currentText = computed(() => currentItem.value.text);
const currentRole = computed(() => currentItem.value.role);
const currentSpeakerName = computed(() => currentItem.value.speaker);
const isLastLine = computed(() => index.value === dialogue.length - 1);
const progressPercent = computed(() => ((index.value + 1) / dialogue.length) * 100);
const footHint = computed(() => {
  if (isTyping.value) return "文字正在铺展";
  return isLastLine.value ? "这一段旅程将通往故事正文" : "下一句故事正在等你";
});

const displayedText = ref("");
const isTyping = ref(false);
const autoPlay = ref(false);
let typingTimer = null;
let autoTimer = null;

const bgOffsetX = ref(0);
const bgOffsetY = ref(0);
const travelerOffsetX = ref(0);
const travelerOffsetY = ref(0);
const npcOffsetX = ref(0);
const npcOffsetY = ref(0);

const startTyping = () => {
  clearTyping();
  displayedText.value = "";
  isTyping.value = true;
  const text = currentText.value;
  let i = 0;

  typingTimer = setInterval(() => {
    displayedText.value = text.slice(0, i + 1);
    i += 1;
    if (i >= text.length) {
      clearTyping();
      isTyping.value = false;
      if (autoPlay.value) {
        queueAutoNext();
      }
    }
  }, 36);
};

const clearTyping = () => {
  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }
};

const clearAuto = () => {
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
};

const queueAutoNext = () => {
  clearAuto();
  autoTimer = setTimeout(() => {
    if (!isTyping.value) {
      next();
    }
  }, 1200);
};

const completeTyping = () => {
  clearTyping();
  displayedText.value = currentText.value;
  isTyping.value = false;
  if (autoPlay.value) {
    queueAutoNext();
  }
};

const next = () => {
  if (isTyping.value) {
    completeTyping();
    return;
  }

  if (isDemo && index.value === 2 && showDemoTip.value) return;

  if (index.value < dialogue.length - 1) {
    index.value++;
  } else {
    goStoryPage();
  }
};

const toggleAutoOrComplete = () => {
  if (isTyping.value) {
    completeTyping();
    return;
  }

  autoPlay.value = !autoPlay.value;
  if (autoPlay.value) {
    queueAutoNext();
  } else {
    clearAuto();
  }
};

const goStoryPage = () => {
  clearTyping();
  clearAuto();
  router.push({
    path: "/story",
    query: {
      id: scenicId,
      demo: isDemo
    }
  });
};

const skipToStory = () => {
  goStoryPage();
};

const closeTip = () => {
  showDemoTip.value = false;
  if (index.value < dialogue.length - 1) {
    index.value++;
  }
};

const goLogin = () => {
  clearTyping();
  clearAuto();
  router.push({
    path: "/login",
    query: { redirect: `/dialogue?id=${scenicId}` }
  });
};

const handleMouseMove = (e) => {
  const { innerWidth, innerHeight } = window;
  const x = (e.clientX / innerWidth - 0.5);
  const y = (e.clientY / innerHeight - 0.5);

  bgOffsetX.value = x * -10;
  bgOffsetY.value = y * -10;

  travelerOffsetX.value = x * -12;
  travelerOffsetY.value = y * -8;

  npcOffsetX.value = x * 12;
  npcOffsetY.value = y * -8;
};

const resetParallax = () => {
  bgOffsetX.value = 0;
  bgOffsetY.value = 0;
  travelerOffsetX.value = 0;
  travelerOffsetY.value = 0;
  npcOffsetX.value = 0;
  npcOffsetY.value = 0;
};

watch(currentText, () => {
  startTyping();
}, { immediate: true });

onMounted(() => {
  const user = localStorage.getItem("user");
  if (user && isDemo) {
    router.replace({
      path: "/dialogue",
      query: { id: scenicId }
    });
  }
});

onBeforeUnmount(() => {
  clearTyping();
  clearAuto();
});
</script>

<style scoped>
.dialogue-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #15110d;
  user-select: none;
}

.scene-bg {
  position: absolute;
  inset: -3%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.2s linear;
}

.scene-bg.blur {
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 238, 205, 0.14), transparent 24%),
    radial-gradient(circle at 80% 18%, rgba(255, 229, 180, 0.12), transparent 22%),
    linear-gradient(180deg, rgba(255, 245, 220, 0.08) 0%, rgba(12, 10, 8, 0.3) 100%);
  filter: blur(18px);
  opacity: 0.65;
}

.scene-vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(0,0,0,0) 34%, rgba(0,0,0,0.18) 68%, rgba(0,0,0,0.55) 100%),
    linear-gradient(180deg, rgba(9, 7, 5, 0.1) 0%, rgba(9, 7, 5, 0.22) 100%);
}

.mist,
.grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.mist {
  opacity: 0.38;
  filter: blur(24px);
}

.mist-1 {
  background:
    radial-gradient(circle at 18% 35%, rgba(255,255,255,0.22), transparent 24%),
    radial-gradient(circle at 65% 42%, rgba(255,248,230,0.16), transparent 22%);
  animation: driftA 14s ease-in-out infinite alternate;
}

.mist-2 {
  background:
    radial-gradient(circle at 80% 62%, rgba(255,255,255,0.16), transparent 20%),
    radial-gradient(circle at 36% 72%, rgba(255,245,215,0.12), transparent 18%);
  animation: driftB 18s ease-in-out infinite alternate;
}

.grain {
  background-image:
    radial-gradient(rgba(255,255,255,0.06) 0.6px, transparent 0.6px);
  background-size: 10px 10px;
  opacity: 0.06;
}

@keyframes driftA {
  0% { transform: translate3d(-2%, 0, 0) scale(1); }
  100% { transform: translate3d(3%, -2%, 0) scale(1.06); }
}

@keyframes driftB {
  0% { transform: translate3d(1%, 2%, 0) scale(1); }
  100% { transform: translate3d(-3%, -1%, 0) scale(1.08); }
}

.top-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 8;
  display: grid;
  grid-template-columns: auto minmax(240px, 420px) auto;
  align-items: center;
  gap: 16px;
}

.scene-chip,
.skip-btn,
.instant-btn,
.panel-btn {
  backdrop-filter: blur(10px);
}

.scene-chip {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 223, 172, 0.22);
  background: rgba(37, 24, 14, 0.42);
  color: #f9e8c5;
  font-size: 14px;
  letter-spacing: 1px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
}

.progress-wrap {
  justify-self: center;
  width: 100%;
  max-width: 420px;
}

.progress-text {
  color: rgba(255, 238, 206, 0.88);
  font-size: 13px;
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: 1px;
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 244, 223, 0.16);
  border: 1px solid rgba(255, 223, 172, 0.14);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffcf7d 0%, #f0a84d 100%);
  box-shadow: 0 0 20px rgba(255, 191, 94, 0.45);
  transition: width 0.32s ease;
}

.skip-btn,
.instant-btn,
.panel-btn {
  border: 1px solid rgba(255, 223, 172, 0.2);
  background: rgba(34, 23, 15, 0.42);
  color: #f8e1b5;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.skip-btn {
  justify-self: end;
  padding: 10px 18px;
  font-size: 14px;
}

.instant-btn {
  padding: 8px 14px;
  font-size: 12px;
}

.skip-btn:hover,
.instant-btn:hover,
.panel-btn:hover {
  transform: translateY(-2px);
  background: rgba(48, 31, 20, 0.58);
}

.character-stage {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.character {
  position: absolute;
  bottom: 19%;
  width: min(41vw, 730px);
  transition: all 0.28s ease;
}

.traveler-card {
  left: 0;
}

.npc-card {
  right: 0;
}

.character-halo {
  position: absolute;
  inset: auto 8% 12% 8%;
  height: 34px;
  border-radius: 50%;
  filter: blur(12px);
}

.character-halo.traveler {
  background: rgba(186, 146, 88, 0.28);
}

.character-halo.npc {
  background: rgba(216, 138, 71, 0.24);
}

.character-ring {
  position: absolute;
  left: 11%;
  right: 11%;
  bottom: 18%;
  height: 66%;
  border-radius: 32px;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0));
  border: 1px solid rgba(255, 226, 176, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
}

.character-img {
  position: relative;
  width: 100%;
  display: block;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.28));
}

.character.active {
  opacity: 1;
  transform: translateY(-6px) scale(1.03);
}

.character.dim {
  opacity: 0.42;
  transform: scale(0.97);
}

.character.dim .character-img {
  filter: brightness(0.5) saturate(0.7);
}

.character-tag {
  position: absolute;
  bottom: 16%;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  min-width: 110px;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(25, 17, 12, 0.48);
  border: 1px solid rgba(255, 224, 177, 0.14);
  box-shadow: 0 12px 24px rgba(0,0,0,0.16);
}

.character-tag.left {
  left: 0;
}

.character-tag.right {
  right: 0;
  text-align: right;
}

.tag-role {
  font-size: 12px;
  color: rgba(255, 224, 177, 0.72);
  letter-spacing: 1px;
}

.tag-name {
  font-size: 22px;
  color: #fff1d0;
  font-family: "STKaiti", "KaiTi", serif;
  letter-spacing: 1px;
}

.dialogue-shell {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: min(1240px, calc(100% - 28px));
  z-index: 9;
}

.dialogue-card {
  position: relative;
  cursor: pointer;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(28, 20, 14, 0.78) 0%, rgba(18, 13, 9, 0.82) 100%);
  border: 1px solid rgba(255, 226, 176, 0.16);
  box-shadow:
    0 24px 60px rgba(0,0,0,0.35),
    inset 0 0 0 1px rgba(255,255,255,0.03);
  overflow: hidden;
}

.dialogue-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.06), transparent 28%),
    radial-gradient(circle at 90% 10%, rgba(255, 201, 122, 0.12), transparent 20%);
  pointer-events: none;
}

.dialogue-card-inner {
  position: relative;
  z-index: 1;
  padding: 24px 28px 22px;
}

.dialogue-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.speaker-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 14px;
  color: #fff2d2;
  font-weight: 600;
  border: 1px solid rgba(255, 223, 172, 0.12);
  font-family: "STKaiti", "KaiTi", serif;
}

.speaker-badge.traveler {
  background: rgba(180, 111, 64, 0.24);
}

.speaker-badge.npc {
  background: rgba(129, 92, 52, 0.28);
}

.speaker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffd086, #f0aa50);
  box-shadow: 0 0 12px rgba(255, 200, 100, 0.4);
}

.head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mood-line {
  color: rgba(255, 230, 189, 0.68);
  font-size: 13px;
}

.dialogue-main {
  position: relative;
  margin-top: 18px;
  padding-left: 32px;
  min-height: 120px;
}

.quote-mark {
  position: absolute;
  left: 0;
  top: -6px;
  font-size: 60px;
  line-height: 1;
  color: rgba(255, 208, 134, 0.22);
  font-family: Georgia, serif;
}

.dialogue-text {
  color: #fff4dc;
  font-size: clamp(20px, 2vw, 32px);
  line-height: 1.9;
  letter-spacing: 1px;
  font-family: "STKaiti", "KaiTi", serif;
  text-shadow: 0 2px 10px rgba(0,0,0,0.18);
}

.typing-caret {
  display: inline-block;
  width: 10px;
  height: 1.15em;
  vertical-align: -0.15em;
  margin-left: 4px;
  border-radius: 3px;
  background: rgba(255, 213, 149, 0.82);
  animation: blinkCaret 0.8s steps(1) infinite;
}

@keyframes blinkCaret {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.dialogue-foot {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: end;
}

.poem-box {
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 238, 205, 0.06);
  border: 1px solid rgba(255, 226, 176, 0.08);
}

.poem-label {
  color: rgba(255, 213, 149, 0.64);
  font-size: 12px;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.poem-text {
  color: rgba(255, 239, 211, 0.84);
  font-size: 13px;
  letter-spacing: 1px;
}

.continue-area {
  display: flex;
  align-items: center;
  gap: 14px;
}

.continue-tip,
.tap-hint {
  color: rgba(255, 232, 192, 0.6);
  font-size: 12px;
  letter-spacing: 1px;
}

.continue-icon {
  min-width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 208, 134, 0.12);
  color: #ffd086;
  font-size: 26px;
  animation: pulseArrow 1.2s ease-in-out infinite;
  box-shadow: inset 0 0 0 1px rgba(255, 223, 172, 0.1);
}

.continue-icon.end {
  background: rgba(255, 185, 98, 0.18);
}

.tap-hint {
  margin-top: 10px;
  text-align: center;
}

@keyframes pulseArrow {
  0%, 100% { transform: translateX(0); opacity: 0.74; }
  50% { transform: translateX(5px); opacity: 1; }
}

.invitation-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(9, 7, 5, 0.56);
  backdrop-filter: blur(8px);
}

.invitation-panel {
  width: min(420px, calc(100% - 32px));
  padding: 28px 24px 24px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(42, 28, 18, 0.92) 0%, rgba(24, 16, 11, 0.95) 100%);
  border: 1px solid rgba(255, 223, 172, 0.16);
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
  text-align: center;
}

.invitation-kicker {
  color: rgba(255, 213, 149, 0.72);
  font-size: 13px;
  letter-spacing: 2px;
}

.invitation-title {
  margin-top: 10px;
  font-size: 30px;
  color: #fff0cc;
  font-family: "STKaiti", "KaiTi", serif;
}

.invitation-desc {
  margin-top: 14px;
  color: rgba(255, 235, 202, 0.78);
  line-height: 1.9;
  font-size: 15px;
}

.invitation-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 22px;
  flex-wrap: wrap;
}

.panel-btn {
  padding: 10px 18px;
  color: #ffe5b7;
}

.panel-btn.primary {
  border: none;
  background: linear-gradient(135deg, #d39b53, #a56b37);
  color: #fff9ef;
}

.fade-soft-enter-active,
.fade-soft-leave-active {
  transition: all 0.25s ease;
}

.fade-soft-enter-from,
.fade-soft-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 1024px) {
  .top-bar {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .scene-chip,
  .skip-btn {
    justify-self: center;
  }

  .character {
    width: min(34vw, 320px);
    bottom: 24%;
  }

  .dialogue-text {
    font-size: 22px;
  }
}

@media (max-width: 760px) {
  .top-bar {
    top: 12px;
    left: 12px;
    right: 12px;
    gap: 10px;
  }

  .character {
    width: 180px;
    bottom: 28%;
  }

  .traveler-card {
    left: -16px;
  }

  .npc-card {
    right: -16px;
  }

  .character-tag {
    min-width: auto;
    padding: 8px 12px;
    border-radius: 14px;
  }

  .tag-name {
    font-size: 16px;
  }

  .dialogue-shell {
    width: calc(100% - 12px);
    bottom: 8px;
  }

  .dialogue-card-inner {
    padding: 16px 14px 14px;
  }

  .dialogue-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .head-right {
    width: 100%;
    justify-content: space-between;
  }

  .dialogue-main {
    padding-left: 18px;
    min-height: 92px;
  }

  .quote-mark {
    font-size: 42px;
    top: -2px;
  }

  .dialogue-text {
    font-size: 17px;
    line-height: 1.85;
  }

  .dialogue-foot {
    grid-template-columns: 1fr;
  }

  .continue-area {
    justify-content: space-between;
  }
}
</style>

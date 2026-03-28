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
        <img :src="travelerImage" class="character-img traveler-img" alt="旅人" />
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
        <img :src="npcImage" class="character-img npc-img" :alt="npcName" />
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
                {{
                  isTyping
                    ? '点击可快速显示'
                    : isLastLine
                    ? '点击查看故事总结'
                    : '点击继续剧情'
                }}
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

    <!-- 右下角玩一玩 -->
    <button class="play-float-btn" @click.stop="openGameModal">
      <span class="play-icon">🧩</span>
      <span>玩一玩</span>
    </button>

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

    <!-- 小游戏弹层 -->
    <ScenicGameModal
      v-model="showGameModal"
      :title="currentGame.title"
      :subtitle="currentGame.subtitle"
      @close="closeGameModal"
    >
      <PuzzleGame
        v-if="currentGame.type === 'puzzle'"
        :scenic-name="scenicName"
        :image-url="currentGame.imageUrl"
        :board-count="3"
        :board-size="330"
        @success="handleGameSuccess"
      />

      <FlowerCatchGame
        v-else-if="currentGame.type === 'flower'"
        :scenic-name="scenicName"
        :target-score="12"
        :max-missed="6"
        @success="handleGameSuccess"
      />
        <MemoryMatchGame
    v-else-if="currentGame.type === 'memory'"
    :pair-count="8"
    @success="handleGameSuccess"
  />

  <SpotDifferenceGame
    v-else-if="currentGame.type === 'spot'"
    scenic-name="滕王阁"
    @success="handleGameSuccess"
  />
    </ScenicGameModal>

    <!-- 故事总结弹层 -->
    <transition name="fade-soft">
      <div v-if="showSummaryModal" class="story-overlay" @click.self="closeSummaryModal">
        <div class="story-modal summary-modal">
          <button class="story-close-btn" @click="closeSummaryModal">×</button>

          <div class="summary-frame">
            <div class="summary-decor top-left"></div>
            <div class="summary-decor top-right"></div>
            <div class="summary-decor bottom-left"></div>
            <div class="summary-decor bottom-right"></div>

            <div class="story-card-head summary-head">
              <div class="story-kicker">故事总结</div>
              <div class="story-title">{{ scenicName }} · 风物小记</div>
            </div>

            <div class="summary-scroll">
              <p v-for="(line, idx) in summaryLines" :key="idx" class="summary-line">
                {{ line }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 完成弹层 -->
    <transition name="fade-soft">
      <div v-if="showFinishModal" class="story-overlay" @click.self="showFinishModal = false">
        <div class="story-modal finish-modal">
          <button class="story-close-btn" @click="showFinishModal = false">×</button>

          <div class="finish-icon">{{ finishSaved ? "🏮" : "✨" }}</div>
          <div class="finish-title">
            {{ finishSaved ? "打卡完成" : "对话完成" }}
          </div>
          <div class="finish-desc">
            {{
              finishSaved
                ? `你已完成 ${scenicName} 的故事体验，打卡记录已保存。`
                : `你已完成 ${scenicName} 的故事体验，登录后可保存打卡记录。`
            }}
          </div>

          <div class="finish-actions">
            <button class="panel-btn primary" @click="goHome">回首页</button>
            <button class="panel-btn" @click="goUserCenter">去个人中心</button>
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

import ScenicGameModal from "@/components/games/ScenicGameModal.vue";
import PuzzleGame from "@/components/games/PuzzleGame.vue";
import FlowerCatchGame from "@/components/games/FlowerCatchGame.vue";
import MemoryMatchGame from "@/components/games/MemoryMatchGame.vue";
import SpotDifferenceGame from "@/components/games/SpotDifferenceGame.vue";
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

const summaryMap = {
  1: [
    "庐山不只是山高云深，更是诗意与人文交汇之地。",
    "旅人在这段对话里，从瀑布与云海出发，逐渐看见庐山背后的历史记忆与文人情怀。",
    "飞流、烟雨、古意，共同构成了庐山最独特的风物印象。"
  ],
  2: [
    "井冈山不仅有层峦叠嶂的山景，更承载着厚重的红色记忆。",
    "在这一段讲述里，旅人听见了山林之间关于信念、奋斗与历史回响的故事。",
    "它让人记住的不只是风景，更是一种精神的延续。"
  ],
  3: [
    "婺源的动人之处，在于山水、古村与田园烟火彼此映照。",
    "旅人在对话里看到的，不只是花海与白墙黛瓦，还有乡村生活的温度与传统文化的延续。",
    "四季流转之间，婺源始终像一幅安静展开的画卷。"
  ]
};

const scenicNameMap = {
  1: "庐山",
  2: "井冈山",
  3: "婺源"
};

const currentBgImage = bgImages[scenicId] || lushanBg;
const travelerName = travelerNames[scenicId] || "扶光";
const npcName = npcConfig[scenicId]?.name || "云游货郎";
const npcImage = npcConfig[scenicId]?.image || defaultAvatar;
const travelerImage = defaultAvatarA;
const npcPoem = npcConfig[scenicId]?.poem || "";
const scenicTitle = npcConfig[scenicId]?.title || "江西风物";
const scenicName = scenicNameMap[scenicId] || "庐山";
const summaryLines = computed(() => summaryMap[scenicId] || summaryMap[1]);

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
const currentText = computed(() => currentItem.value?.text || "");
const currentRole = computed(() => currentItem.value?.role || "npc");
const currentSpeakerName = computed(() => currentItem.value?.speaker || npcName);
const isLastLine = computed(() => index.value === dialogue.length - 1);
const progressPercent = computed(() => ((index.value + 1) / dialogue.length) * 100);

const displayedText = ref("");
const isTyping = ref(false);
const autoPlay = ref(false);

const footHint = computed(() => {
  if (isTyping.value) return "文字正在铺展";
  return isLastLine.value ? "这一段旅程将迎来总结" : "下一句故事正在等你";
});

let typingTimer = null;
let autoTimer = null;

const bgOffsetX = ref(0);
const bgOffsetY = ref(0);
const travelerOffsetX = ref(0);
const travelerOffsetY = ref(0);
const npcOffsetX = ref(0);
const npcOffsetY = ref(0);

const showGameModal = ref(false);
const showSummaryModal = ref(false);
const showFinishModal = ref(false);
const finishSaved = ref(false);

const gameConfig = {
  1: {
    type: "puzzle",
    title: "庐山 · 拼图小游戏",
    subtitle: "将右侧拼图块拖到左边对应位置，放对后会自动吸附。",
    imageUrl: lushanBg
  },
  2: {
    type: "memory",
    title: "井冈山 · 翻牌消消乐",
    subtitle: "翻开两张相同的卡片即可消除，全部消除就算成功。"
  },
  3: {
    type: "flower",
    title: "婺源 · 接花小游戏",
    subtitle: "移动下方花篮，接住掉落的花朵，达到目标分数即可通关。"
  },
  4: {
    type: "spot",
    title: "滕王阁 · 找不同",
    subtitle: "找出左右两幅图中的所有不同点。"
  }
};


const currentGame = computed(() => gameConfig[scenicId] || gameConfig[1]);

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

const scheduleAutoNext = () => {
  clearAuto();
  if (!autoPlay.value || showSummaryModal.value || showFinishModal.value) return;

  autoTimer = setTimeout(() => {
    if (!isTyping.value) {
      next();
    }
  }, 1400);
};

const startTyping = () => {
  clearTyping();
  clearAuto();

  const text = currentText.value || "";
  displayedText.value = "";

  if (!text) {
    isTyping.value = false;
    return;
  }

  isTyping.value = true;
  let i = 0;

  typingTimer = setInterval(() => {
    displayedText.value = text.slice(0, i + 1);
    i++;

    if (i >= text.length) {
      clearTyping();
      isTyping.value = false;
      if (autoPlay.value) {
        scheduleAutoNext();
      }
    }
  }, 35);
};

const completeTyping = () => {
  clearTyping();
  displayedText.value = currentText.value || "";
  isTyping.value = false;
  if (autoPlay.value) {
    scheduleAutoNext();
  }
};

const showSummary = () => {
  clearTyping();
  clearAuto();
  autoPlay.value = false;
  showSummaryModal.value = true;
};

const next = () => {
  if (showSummaryModal.value || showFinishModal.value) return;

  if (isTyping.value) {
    completeTyping();
    return;
  }

  if (isLastLine.value) {
    showSummary();
    return;
  }

  index.value += 1;
};

const toggleAutoOrComplete = () => {
  if (isTyping.value) {
    completeTyping();
    return;
  }

  autoPlay.value = !autoPlay.value;

  if (autoPlay.value) {
    scheduleAutoNext();
  } else {
    clearAuto();
  }
};

const skipToStory = () => {
  clearTyping();
  clearAuto();
  autoPlay.value = false;
  displayedText.value = currentText.value || "";
  isTyping.value = false;
  showSummaryModal.value = true;
};

const closeSummaryModal = () => {
  showSummaryModal.value = false;
  showFinishModal.value = true;

  const user = localStorage.getItem("user");
  finishSaved.value = !!user;
};

const openGameModal = () => {
  showGameModal.value = true;
};

const closeGameModal = () => {
  showGameModal.value = false;
};

const handleGameSuccess = () => {
  showGameModal.value = false;
};

const goLogin = () => {
  router.push("/login");
};

const closeTip = () => {
  showDemoTip.value = false;
};

const goHome = () => {
  router.push("/");
};

const goUserCenter = () => {
  const user = localStorage.getItem("user");
  if (user) {
    router.push("/user");
  } else {
    router.push("/login");
  }
};

const handleMouseMove = (e) => {
  const { innerWidth, innerHeight } = window;
  const x = e.clientX / innerWidth - 0.5;
  const y = e.clientY / innerHeight - 0.5;

  bgOffsetX.value = x * -18;
  bgOffsetY.value = y * -18;

  travelerOffsetX.value = x * 12;
  travelerOffsetY.value = y * 10;

  npcOffsetX.value = x * -12;
  npcOffsetY.value = y * -10;
};

const resetParallax = () => {
  bgOffsetX.value = 0;
  bgOffsetY.value = 0;
  travelerOffsetX.value = 0;
  travelerOffsetY.value = 0;
  npcOffsetX.value = 0;
  npcOffsetY.value = 0;
};

watch(
  currentText,
  () => {
    startTyping();
  },
  { immediate: true }
);

watch(showSummaryModal, (val) => {
  if (val) {
    clearTyping();
    clearAuto();
    autoPlay.value = false;
  }
});

watch(showFinishModal, (val) => {
  if (val) {
    clearTyping();
    clearAuto();
    autoPlay.value = false;
  }
});

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
    radial-gradient(circle at center, rgba(0, 0, 0, 0) 34%, rgba(0, 0, 0, 0.18) 68%, rgba(0, 0, 0, 0.55) 100%),
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
    radial-gradient(circle at 18% 35%, rgba(255, 255, 255, 0.22), transparent 24%),
    radial-gradient(circle at 65% 42%, rgba(255, 248, 230, 0.16), transparent 22%);
  animation: driftA 14s ease-in-out infinite alternate;
}

.mist-2 {
  background:
    radial-gradient(circle at 80% 62%, rgba(255, 255, 255, 0.16), transparent 20%),
    radial-gradient(circle at 36% 72%, rgba(255, 245, 215, 0.12), transparent 18%);
  animation: driftB 18s ease-in-out infinite alternate;
}

.grain {
  background-image: radial-gradient(rgba(255, 255, 255, 0.06) 0.6px, transparent 0.6px);
  background-size: 10px 10px;
  opacity: 0.06;
}

@keyframes driftA {
  0% {
    transform: translate3d(-2%, 0, 0) scale(1);
  }
  100% {
    transform: translate3d(3%, -2%, 0) scale(1.06);
  }
}

@keyframes driftB {
  0% {
    transform: translate3d(1%, 2%, 0) scale(1);
  }
  100% {
    transform: translate3d(-3%, -1%, 0) scale(1.08);
  }
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
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.progress-wrap {
  display: grid;
  gap: 8px;
}

.progress-text {
  font-size: 13px;
  color: rgba(255, 240, 214, 0.86);
  text-align: center;
  letter-spacing: 1px;
}

.progress-track {
  width: 100%;
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 0 0 1px rgba(255, 234, 208, 0.1);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f5dfb8 0%, #d8a354 100%);
  box-shadow: 0 0 14px rgba(248, 203, 130, 0.46);
}

.skip-btn,
.instant-btn,
.play-float-btn,
.story-close-btn,
.close-btn {
  cursor: pointer;
  transition: all 0.25s ease;
}

.skip-btn {
  justify-self: end;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(255, 230, 186, 0.2);
  border-radius: 999px;
  background: rgba(34, 22, 13, 0.4);
  color: #f7e3bf;
  font-size: 14px;
}

.skip-btn:hover,
.instant-btn:hover,
.play-float-btn:hover,
.story-close-btn:hover {
  transform: translateY(-2px);
}

.character-stage {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.character {
  position: absolute;
  bottom: 212px;
  width: min(32vw, 360px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: opacity 0.26s ease, transform 0.2s ease;
}

.traveler-card {
  left: 3vw;
}

.npc-card {
  right: 3vw;
}

.character.active {
  opacity: 1;
}

.character.dim {
  opacity: 0.42;
}

.character-halo {
  position: absolute;
  width: 78%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  filter: blur(26px);
  top: 22%;
}

.character-halo.traveler {
  background: radial-gradient(circle, rgba(255, 218, 160, 0.34), rgba(255, 218, 160, 0));
}

.character-halo.npc {
  background: radial-gradient(circle, rgba(255, 214, 144, 0.34), rgba(255, 214, 144, 0));
}

.character-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 22px 22px rgba(0, 0, 0, 0.38));
}

.dialogue-shell {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 24px;
  z-index: 10;
  display: grid;
  justify-items: center;
  gap: 12px;
}

.dialogue-card {
  width: min(1080px, calc(100% - 40px));
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(32, 22, 16, 0.76) 0%, rgba(20, 14, 10, 0.78) 100%);
  border: 1px solid rgba(255, 231, 194, 0.14);
  box-shadow:
    0 30px 50px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
  cursor: pointer;
}

.dialogue-card-inner {
  position: relative;
  padding: 22px 24px 20px;
  display: grid;
  gap: 18px;
}

.dialogue-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.speaker-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 15px;
  letter-spacing: 1px;
  color: #fff4dc;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.speaker-badge.traveler {
  background: linear-gradient(135deg, rgba(162, 106, 63, 0.9), rgba(115, 70, 42, 0.86));
}

.speaker-badge.npc {
  background: linear-gradient(135deg, rgba(111, 84, 44, 0.94), rgba(72, 54, 28, 0.9));
}

.speaker-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fff3d6;
  box-shadow: 0 0 10px rgba(255, 246, 210, 0.6);
}

.head-right {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.mood-line {
  color: rgba(255, 236, 205, 0.68);
  font-size: 13px;
  white-space: nowrap;
}

.instant-btn {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 229, 190, 0.16);
  background: rgba(255, 248, 235, 0.08);
  color: #ffecce;
  font-size: 13px;
}

.dialogue-main {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
}

.quote-mark {
  font-size: 56px;
  line-height: 1;
  color: rgba(255, 228, 187, 0.22);
  transform: translateY(-8px);
  font-family: Georgia, serif;
}

.dialogue-text {
  min-height: 92px;
  font-size: clamp(18px, 2vw, 22px);
  line-height: 1.95;
  color: #fff4e4;
  letter-spacing: 0.6px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.typing-caret {
  display: inline-block;
  width: 10px;
  margin-left: 2px;
  border-bottom: 2px solid rgba(255, 240, 215, 0.8);
  animation: blink 0.9s steps(1) infinite;
  vertical-align: 3px;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.dialogue-foot {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 18px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 236, 204, 0.08);
}

.poem-box {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 8px;
}

.poem-label {
  font-size: 12px;
  letter-spacing: 1.2px;
  color: rgba(255, 221, 173, 0.64);
}

.poem-text {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 241, 220, 0.86);
}

.continue-area {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f7e7c7;
  white-space: nowrap;
}

.continue-tip {
  font-size: 13px;
  color: rgba(255, 234, 203, 0.7);
}

.continue-icon {
  min-width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 246, 227, 0.08);
  border: 1px solid rgba(255, 225, 177, 0.14);
  font-size: 18px;
}

.continue-icon.end {
  background: linear-gradient(135deg, rgba(202, 138, 61, 0.26), rgba(146, 95, 40, 0.28));
}

.tap-hint {
  font-size: 13px;
  letter-spacing: 2px;
  color: rgba(255, 235, 204, 0.46);
}

.play-float-btn {
  position: absolute;
  right: 26px;
  bottom: 248px;
  z-index: 11;
  height: 54px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 226, 183, 0.22);
  background: rgba(32, 21, 13, 0.78);
  color: #ffedcd;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.24);
  font-size: 15px;
}

.play-icon {
  font-size: 18px;
}

.invitation-mask,
.story-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(8, 7, 6, 0.5);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.invitation-panel {
  width: min(420px, 100%);
  border-radius: 28px;
  padding: 28px 24px;
  text-align: center;
  background: linear-gradient(180deg, rgba(39, 28, 18, 0.94), rgba(22, 16, 12, 0.96));
  border: 1px solid rgba(255, 232, 191, 0.14);
  box-shadow: 0 24px 54px rgba(0, 0, 0, 0.34);
}

.invitation-kicker {
  color: #e4ba7c;
  font-size: 13px;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.invitation-title {
  font-size: 28px;
  color: #fff2d8;
  margin-bottom: 12px;
}

.invitation-desc {
  color: rgba(255, 238, 212, 0.76);
  font-size: 15px;
  line-height: 1.9;
  margin-bottom: 18px;
}

.invitation-actions,
.finish-actions,
.puzzle-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-btn.primary {
  border: none;
  background: linear-gradient(135deg, #cb8750, #a65431);
  color: #fff8ef;
}

.panel-btn {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(230, 152, 34, 0.25);
  background: rgba(255, 248, 235, 0.08);
  color: #ac7d33;
  font-size: 14px;
}

.story-modal {
  position: relative;
  width: min(980px, calc(100vw - 40px));
  max-height: min(88vh, 900px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 30px;
  background: rgba(255, 250, 241, 0.96);
  border: 1px solid rgba(193, 161, 115, 0.28);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.26);
  color: #5f4324;

   /* 隐藏滚动条但保留滚动 */
  scrollbar-width: none;       /* Firefox */
  -ms-overflow-style: none;    /* IE / Edge 旧版 */
}
.story-modal::-webkit-scrollbar {
  display: none; /* Chrome / Safari / Edge */
}
.story-close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  z-index: 5;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(123, 84, 45, 0.1);
  color: #7c5b34;
  font-size: 24px;
  line-height: 1;
}

.story-card-head {
  padding: 32px 34px 18px;
  text-align: center;
}

.story-kicker {
  color: #9a7442;
  font-size: 13px;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.story-title {
  font-size: 34px;
  line-height: 1.2;
  color: #5f4324;
  font-family: "STKaiti", "KaiTi", serif;
  margin-bottom: 10px;
}

.story-subtitle {
  font-size: 15px;
  line-height: 1.8;
  color: #7b6244;
}

.puzzle-modal {
  padding-bottom: 28px;
}

.puzzle-grid-layout {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 24px;
  padding: 0 28px 28px;
  align-items: start;
}

.puzzle-left,
.puzzle-right {
  display: grid;
  gap: 12px;
  align-content: start;
}

.puzzle-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.puzzle-stat {
  border-radius: 18px;
  background: rgba(255, 248, 235, 0.86);
  border: 1px solid rgba(193, 161, 115, 0.18);
  padding: 14px 12px;
  text-align: center;
}

.puzzle-stat-label {
  display: block;
  font-size: 12px;
  color: #9a7442;
  margin-bottom: 8px;
}

.puzzle-stat-value {
  display: block;
  font-size: 20px;
  color: #6a4a29;
  font-weight: 700;
}

.drop-board {
  width: var(--board-size);
  height: var(--board-size);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, var(--tile-size));
  grid-template-rows: repeat(3, var(--tile-size));
  border-radius: 22px;
  overflow: hidden;
  background: rgba(229, 214, 191, 0.55);
  border: 3px solid rgba(182, 150, 107, 0.42);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.drop-slot {
  position: relative;
  width: var(--tile-size);
  height: var(--tile-size);
  border: 1px dashed rgba(174, 140, 96, 0.28);
  background: rgba(255, 251, 244, 0.48);
  display: grid;
  place-items: center;
}

.drop-slot.active {
  background: rgba(231, 198, 151, 0.24);
}

.drop-slot.filled {
  border-style: solid;
}

.slot-guide {
  color: rgba(128, 95, 56, 0.34);
  font-size: 20px;
  font-weight: 700;
}

.preview-card,
.pieces-card,
.mini-success-card {
  border-radius: 22px;
  background: rgba(255, 248, 235, 0.9);
  border: 1px solid rgba(193, 161, 115, 0.18);
  padding: 18px;
}

.preview-title {
  font-size: 16px;
  color: #7b5b34;
  margin-bottom: 14px;
  font-weight: 700;
}

.preview-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  border: 1px solid rgba(193, 161, 115, 0.18);
  overflow: hidden;
}

.preview-tip,
.pool-tip,
.mini-success-desc {
  font-size: 13px;
  line-height: 1.8;
  color: #8a6b46;
  margin-top: 10px;
}

.pieces-pool {
  min-height: 276px;
  display: grid;
  grid-template-columns: repeat(3, 96px);
  gap: 12px;
  justify-content: center;
}

.pool-piece,
.placed-piece {
  width: 96px;
  height: 96px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 16px rgba(118, 88, 52, 0.14);
  cursor: grab;
}

.placed-piece {
  width: 100%;
  height: 100%;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.mini-success-card {
  text-align: center;
}

.mini-success-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.mini-success-title {
  font-size: 20px;
  color: #684628;
  margin-bottom: 8px;
  font-weight: 700;
}

.summary-modal {
  width: min(980px, calc(100vw - 40px));
  background: rgba(252, 249, 243, 0.98);
}

.summary-frame {
  position: relative;
  padding: 30px 34px 36px;
  min-height: 520px;
  background:
    linear-gradient(180deg, rgba(255, 252, 247, 0.95) 0%, rgba(247, 241, 231, 0.96) 100%);
}

.summary-head {
  padding: 10px 0 18px;
}

.summary-scroll {
  position: relative;
  margin: 0 auto;
  width: min(860px, 100%);
  min-height: 360px;
  padding: 34px 36px;
  border: 3px solid rgba(140, 104, 65, 0.32);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.76), rgba(250, 245, 237, 0.88));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.6),
    0 14px 30px rgba(120, 90, 56, 0.08);
}

.summary-line {
  margin: 0 0 18px;
  font-size: 33px;
  line-height: 2;
  color: #53412e;
  font-family: "STKaiti", "KaiTi", serif;
  letter-spacing: 1px;
}

.summary-line:last-child {
  margin-bottom: 0;
}

.summary-decor {
  position: absolute;
  width: 72px;
  height: 72px;
  opacity: 0.4;
  pointer-events: none;
}

.summary-decor.top-left {
  top: 24px;
  left: 20px;
  border-top: 4px solid rgba(157, 114, 72, 0.45);
  border-left: 4px solid rgba(157, 114, 72, 0.45);
}

.summary-decor.top-right {
  top: 24px;
  right: 20px;
  border-top: 4px solid rgba(157, 114, 72, 0.45);
  border-right: 4px solid rgba(157, 114, 72, 0.45);
}

.summary-decor.bottom-left {
  bottom: 24px;
  left: 20px;
  border-bottom: 4px solid rgba(157, 114, 72, 0.45);
  border-left: 4px solid rgba(157, 114, 72, 0.45);
}

.summary-decor.bottom-right {
  bottom: 24px;
  right: 20px;
  border-bottom: 4px solid rgba(157, 114, 72, 0.45);
  border-right: 4px solid rgba(157, 114, 72, 0.45);
}

.finish-modal {
  width: min(460px, calc(100vw - 40px));
  padding: 34px 24px 28px;
  text-align: center;
}

.finish-icon {
  font-size: 44px;
  margin-bottom: 14px;
}

.finish-title {
  font-size: 30px;
  color: #614425;
  margin-bottom: 12px;
  font-family: "STKaiti", "KaiTi", serif;
}

.finish-desc {
  font-size: 15px;
  line-height: 1.9;
  color: #7b6244;
  margin-bottom: 22px;
}

.fade-soft-enter-active,
.fade-soft-leave-active,
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.28s ease;
}

.fade-soft-enter-from,
.fade-soft-leave-to {
  opacity: 0;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

@media (max-width: 1100px) {
  .character {
    width: min(30vw, 300px);
  }

  .dialogue-card {
    width: calc(100% - 28px);
  }

  .puzzle-grid-layout {
    grid-template-columns: 1fr;
  }

  .summary-line {
    font-size: 26px;
  }
}

@media (max-width: 768px) {
  .top-bar {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .scene-chip,
  .skip-btn {
    justify-self: auto;
  }

  .character {
    bottom: 260px;
    width: min(42vw, 220px);
  }

  .traveler-card {
    left: -2vw;
  }

  .npc-card {
    right: -2vw;
  }

  .dialogue-head,
  .dialogue-foot {
    flex-direction: column;
    align-items: flex-start;
  }

  .continue-area {
    width: 100%;
    justify-content: space-between;
  }

  .play-float-btn {
    right: 14px;
    bottom: 232px;
  }

  .story-card-head {
    padding: 28px 18px 14px;
  }

  .puzzle-grid-layout {
    padding: 0 16px 18px;
  }

  .drop-board {
    width: 300px;
    height: 300px;
    --board-size: 300px !important;
    --tile-size: 100px !important;
  }

  .pieces-pool {
    grid-template-columns: repeat(3, 84px);
  }

  .pool-piece {
    width: 84px;
    height: 84px;
  }

  .summary-frame {
    padding: 22px 16px 24px;
    min-height: auto;
  }

  .summary-scroll {
    padding: 20px 18px;
  }

  .summary-line {
    font-size: 22px;
    line-height: 1.9;
  }
}
</style>
<template>
  <div class="dialogue-page">
    <!-- 固定背景 -->
    <div
      class="page-fixed-bg"
      :style="{ backgroundImage: `url(${dialoguePageBg})` }"
    ></div>
    <div class="page-mask"></div>

    <!-- 顶部 -->
    <div class="top-bar">
      <div class="scene-chip">{{ scenicTitle }}</div>

      <div class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <button class="skip-btn" @click.stop="skipToStory">跳过剧情</button>
    </div>

    <!-- 主舞台 -->
    <div class="stage-wrap">
      <!-- 角色 -->
      <div class="character-stage">
        <div
          class="character traveler-card"
          :class="{ active: currentRole === 'traveler', dim: currentRole !== 'traveler' }"
        >
          <img :src="travelerImage" class="character-img traveler-img" alt="旅人" />
        </div>

        <div
          class="character npc-card"
          :class="{ active: currentRole === 'npc', dim: currentRole !== 'npc' }"
        >
          <img :src="npcImage" class="character-img npc-img" :alt="npcName" />
        </div>
      </div>

      <!-- 卷轴对话区 -->
      <div class="dialogue-shell">
        <div class="dialogue-card" @click="next">
          <img class="dialogue-scroll-bg" :src="juanzhouBg" alt="卷轴背景" />

          <!-- 卷轴内部内容安全区 -->
          <div class="scroll-content">
            <div class="scroll-head">
              <div class="speaker-badge">
                <span class="speaker-dot"></span>
                <span>{{ currentSpeakerName }}</span>
              </div>

              <div class="head-right">
                <div class="mood-line">
                  {{ currentRole === 'traveler' ? '游客提问中' : '素人疑问中' }}
                </div>
                <button class="instant-btn" @click.stop="toggleAutoOrComplete">
                  {{ isTyping ? '显示全文' : autoPlay ? '停止自动' : '自动播放' }}
                </button>
              </div>
            </div>

            <div class="dialogue-main">
              <div class="dialogue-text">
                {{ displayedText }}
                <span v-if="isTyping" class="typing-caret"></span>
              </div>
            </div>

            <div class="scroll-foot">
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
                      ? '点击快速显示'
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

        <div class="tap-hint">轻触卷轴继续</div>
      </div>
    </div>

    <!-- 右侧玩一玩 -->
    <button class="play-float-btn" @click.stop="openGameModal">
      <span class="play-icon">✦</span>
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

    <!-- 小游戏 -->
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

    <!-- 故事总结 -->
    <transition name="fade-soft">
      <div v-if="showSummaryModal" class="story-overlay" @click.self="closeSummaryModal">
        <div class="story-modal summary-modal">
          <button class="story-close-btn" @click="closeSummaryModal">×</button>

          <div class="summary-frame">
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
import { request } from "@/utils/request";

import defaultAvatar from "@/assets/imgs/NPC.png";
import defaultAvatarA from "@/assets/imgs/youke.png";
import lushanBg from "@/assets/imgs/lushan.jpg";
import dialoguePageBg from "@/assets/imgs/duihuapg.png";
import juanzhouBg from "@/assets/imgs/juanzhou.png";

import ScenicGameModal from "@/components/games/ScenicGameModal.vue";
import PuzzleGame from "@/components/games/PuzzleGame.vue";
import FlowerCatchGame from "@/components/games/FlowerCatchGame.vue";
import MemoryMatchGame from "@/components/games/MemoryMatchGame.vue";
import SpotDifferenceGame from "@/components/games/SpotDifferenceGame.vue";

const route = useRoute();
const router = useRouter();

const isDemo = route.query.demo === "true";
const scenicId = Number(route.query.apiId || route.query.id) || 1;
const showDemoTip = ref(true);

const scenicDetail = ref({
  name: "",
  summary: "",
  dialogues: []
});

const travelerNames = {
  1: "扶光",
  2: "行川",
  3: "阿禾"
};

const npcConfig = {
  1: {
    name: "导游",
    image: defaultAvatar,
    poem: "庐山烟雨浙江潮，未到空闻意已迟",
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

const npcName = npcConfig[scenicId]?.name || "导游";
const npcImage = npcConfig[scenicId]?.image || defaultAvatar;
const travelerImage = defaultAvatarA;
const npcPoem = npcConfig[scenicId]?.poem || "";
const scenicTitle = npcConfig[scenicId]?.title || "江西风物";

const scenicName = computed(() => scenicDetail.value.name || scenicNameMap[scenicId] || "庐山");

const summaryLines = computed(() => {
  const apiSummary = (scenicDetail.value.summary || "").trim();
  if (apiSummary) {
    return apiSummary
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return summaryMap[scenicId] || summaryMap[1];
});

const dialogues = {
  1: [
    { role: "traveler", speaker: "游客", text: "难怪感觉像在看一段历史。" },
    { role: "npc", speaker: npcName, text: "这里是通天岩，最出名的是唐宋时期的石窟和石刻。" },
    { role: "traveler", speaker: "游客", text: "原来这里不仅有风景，还有这么厚重的人文故事。" },
    { role: "npc", speaker: npcName, text: "正是如此，山水与历史在这里交织，走近了才更能看出韵味。" },
    { role: "traveler", speaker: "游客", text: "那我倒真想继续听下去。" },
    { role: "npc", speaker: npcName, text: "那便慢慢走、慢慢看，我再讲给你听。" }
  ],
  2: [
    { role: "traveler", speaker: "游客", text: "这里的山路很深，和我想象中的景点不太一样。" },
    { role: "npc", speaker: npcName, text: "井冈山本就不只是风景。群峰之间，也藏着一段不能忘却的历史。" },
    { role: "traveler", speaker: "游客", text: "所以大家才总说，它是中国革命的重要地方？" },
    { role: "npc", speaker: npcName, text: "不错。这里被誉为中国革命的摇篮，许多故事都从这片山岭间开始。" },
    { role: "traveler", speaker: "游客", text: "我想听听，这里的山为什么会和信念联系在一起。" },
    { role: "npc", speaker: npcName, text: "那便继续往下看吧，我慢慢讲给你听。" }
  ],
  3: [
    { role: "traveler", speaker: "游客", text: "这里看起来像画里一样，真的是现实中的村子吗？" },
    { role: "npc", speaker: npcName, text: "自然是。这里是婺源，白墙黛瓦、山水田园，最擅长把四季都过成画卷。" },
    { role: "traveler", speaker: "游客", text: "那春天是不是最热闹的时候？" },
    { role: "npc", speaker: npcName, text: "正是。油菜花一开，村落、梯田与晨雾相映，远远看去便像金色云海。" },
    { role: "traveler", speaker: "游客", text: "难怪那么多人想来这里。除了景色，还有什么特别之处？" },
    { role: "npc", speaker: npcName, text: "旧村、民俗、烟火气，都是婺源最耐人寻味的地方。走吧，我带你细看。" }
  ]
};

const normalizeDialogues = (list) => {
  if (!Array.isArray(list) || list.length === 0) return [];
  return list.map((item) => {
    const speaker = item?.speaker || "";
    const content = item?.content || "";
    return {
      role: /游客|旅人/.test(speaker) ? "traveler" : "npc",
      speaker: speaker || npcName,
      text: content
    };
  });
};

const fallbackDialogue = dialogues[scenicId] || dialogues[1];

const dialogue = computed(() => {
  const apiDialogue = normalizeDialogues(scenicDetail.value.dialogues);
  return apiDialogue.length > 0 ? apiDialogue : fallbackDialogue;
});

const index = ref(0);
const currentItem = computed(() => dialogue.value[index.value] || dialogue.value[0] || null);
const currentText = computed(() => currentItem.value?.text || "");
const currentRole = computed(() => currentItem.value?.role || "npc");
const currentSpeakerName = computed(() => currentItem.value?.speaker || npcName);
const isLastLine = computed(() => index.value >= dialogue.value.length - 1);

const progressPercent = computed(() => {
  const total = dialogue.value.length || 1;
  return ((index.value + 1) / total) * 100;
});

const displayedText = ref("");
const isTyping = ref(false);
const autoPlay = ref(false);

const footHint = computed(() => {
  if (isTyping.value) return "文字正在铺展";
  return isLastLine.value ? "这一段旅程将迎来总结" : "下一句故事正在等你";
});

let typingTimer = null;
let autoTimer = null;

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
    if (!isTyping.value) next();
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
      if (autoPlay.value) scheduleAutoNext();
    }
  }, 35);
};

const completeTyping = () => {
  clearTyping();
  displayedText.value = currentText.value || "";
  isTyping.value = false;
  if (autoPlay.value) scheduleAutoNext();
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
  router.push({ path: "/", query: { target: "home" } });
};

const goUserCenter = () => {
  const user = localStorage.getItem("user");
  if (user) {
    router.push("/user");
  } else {
    router.push("/login");
  }
};

const fetchDialogueDetail = async () => {
  try {
    const res = await request(`/api/scenics/${scenicId}`, {
      method: "GET"
    });

    if (res?.code === 200 && res?.data) {
      scenicDetail.value = {
        name: res.data.name || "",
        summary: res.data.summary || "",
        dialogues: Array.isArray(res.data.dialogues) ? res.data.dialogues : []
      };
      index.value = 0;
    }
  } catch (error) {
    console.error("获取景点对话失败：", error);
  }
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

onMounted(async () => {
  const user = localStorage.getItem("user");

  if (user && isDemo) {
    router.replace({
      path: "/dialogue",
      query: { id: scenicId }
    });
    return;
  }

  await fetchDialogueDetail();
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
  background: #f3efe5;
  user-select: none;
}

.page-fixed-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.page-mask {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(255, 252, 245, 0.04);
  pointer-events: none;
}

.top-bar {
  position: absolute;
  top: 24px;
  left: 22px;
  right: 22px;
  z-index: 20;
  display: grid;
  grid-template-columns: auto minmax(240px, 460px) auto;
  align-items: center;
  gap: 18px;
}

.scene-chip {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  min-height: 50px;
  padding: 0 28px 0 20px;
  border-radius: 2px;
  background: linear-gradient(135deg, #bc864f, #a46d3a);
  color: #fff6eb;
  font-size: 16px;
  letter-spacing: 2px;
  position: relative;
  box-shadow: 0 8px 18px rgba(98, 67, 36, 0.12);
}

.scene-chip::after {
  content: "";
  position: absolute;
  top: 0;
  right: -18px;
  width: 0;
  height: 0;
  border-top: 25px solid transparent;
  border-bottom: 25px solid transparent;
  border-left: 18px solid #a46d3a;
}

.progress-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-track {
  width: 100%;
  max-width: 420px;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(214, 181, 130, 0.28);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #e0c58f 0%, #ba8450 100%);
}

.skip-btn,
.instant-btn,
.play-float-btn,
.story-close-btn,
.panel-btn {
  cursor: pointer;
  transition: all 0.25s ease;
}

.skip-btn:hover,
.instant-btn:hover,
.play-float-btn:hover,
.story-close-btn:hover,
.panel-btn:hover {
  transform: translateY(-2px);
}

.skip-btn {
  justify-self: end;
  min-height: 52px;
  padding: 0 24px;
  border: 1px solid rgba(184, 154, 118, 0.38);
  border-radius: 999px;
  background: linear-gradient(180deg, #f8efe2, #efe2cf);
  color: #8a6543;
  font-size: 15px;
  box-shadow: 0 6px 14px rgba(123, 87, 47, 0.08);
}

.stage-wrap {
  position: relative;
  z-index: 5;
  min-height: 100vh;
  padding-top: 88px;
}

.character-stage {
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
}

.character {
  position: absolute;
  width: min(25vw, 350px);
  transition: opacity 0.25s ease;
}

.traveler-card {
  left: 3vw;
  top: 4.5vh;
}

.npc-card {
  right: 3vw;
  top: 4.5vh;
}

.character.active {
  opacity: 1;
}

.character.dim {
  opacity: 0.42;
}

.character-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.08));
}

.dialogue-shell {
  position: absolute;
  left: 50%;
  bottom: -2vh;
  transform: translateX(-50%);
  z-index: 12;
  width: min(1340px, calc(100vw - 70px));
  display: grid;
  justify-items: center;
  gap: 12px;
}

.dialogue-card {
  position: relative;
  width: 100%;
  /* aspect-ratio: 1738 / 520; */
   height: 340px;
  cursor: pointer;
}

.dialogue-scroll-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.scroll-content {
  position: absolute;
  left: 11.2%;
  right: 11.2%;
  top: 16%;
  bottom: 15.5%;
  z-index: 3;
  display: flex;
  flex-direction: column;
}

.scroll-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.speaker-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 22px 0 16px;
  border-radius: 2px;
  background: linear-gradient(135deg, #bf894e, #a66f3c);
  color: #fff7ed;
  font-size: 15px;
  letter-spacing: 1px;
  box-shadow: 0 6px 14px rgba(123, 87, 47, 0.1);
  flex-shrink: 0;
}

.speaker-badge::after {
  content: "";
  position: absolute;
  top: 0;
  right: -16px;
  width: 0;
  height: 0;
  border-top: 22px solid transparent;
  border-bottom: 22px solid transparent;
  border-left: 16px solid #a66f3c;
}

.speaker-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff8ee;
}

.head-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mood-line {
  color: #9a7449;
  font-size: 14px;
  white-space: nowrap;
}

.instant-btn {
  min-height: 44px;
  padding: 0 20px;
  border-radius: 999px;
  border: 1px solid rgba(184, 154, 118, 0.34);
  background: linear-gradient(180deg, #faf1e5, #f0e3cf);
  color: #8a6543;
  font-size: 14px;
}

.dialogue-main {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 18px 6px 14px;
}

.dialogue-text {
  width: 100%;
  font-family: "STKaiti", "KaiTi", "FangSong", serif;
  font-size: clamp(24px, 2vw, 38px);
  line-height: 1.9;
  color: #2f2416;
  letter-spacing: 1px;
  text-align: left;
  word-break: break-word;
}

.typing-caret {
  display: inline-block;
  width: 10px;
  margin-left: 4px;
  border-bottom: 2px solid rgba(78, 55, 31, 0.76);
  vertical-align: 4px;
  animation: blink 0.9s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.scroll-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.poem-box {
  display: grid;
  gap: 8px;
  max-width: 48%;
}

.poem-label {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: 26px;
  padding: 0 10px;
  background: rgba(255, 251, 244, 0.72);
  border: 1px solid rgba(210, 185, 148, 0.5);
  color: #a17447;
  font-size: 12px;
  letter-spacing: 2px;
}

.poem-text {
  font-size: 15px;
  line-height: 1.8;
  color: #8c6942;
}

.continue-area {
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap;
  flex-shrink: 0;
}

.continue-tip {
  font-size: 14px;
  color: #9a7449;
}

.continue-icon {
  min-width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #d39a59, #b7783e);
  color: #fff9f2;
  font-size: 30px;
  box-shadow: 0 8px 18px rgba(138, 92, 40, 0.14);
}

.continue-icon.end {
  background: linear-gradient(180deg, #c7874b, #a86432);
}

.tap-hint {
  font-size: 12px;
  letter-spacing: 3px;
  color: rgba(126, 92, 56, 0.78);
  text-shadow: 0 1px 4px rgba(255, 255, 255, 0.4);
}

.play-float-btn {
  position: fixed;
  right: 0;
  top: 58%;
  transform: translateY(-50%);
  z-index: 18;
  height: 58px;
  padding: 0 18px;
  border: none;
  border-radius: 18px 0 0 18px;
  background: linear-gradient(180deg, rgba(69, 50, 31, 0.92), rgba(47, 34, 22, 0.94));
  color: #fff1dc;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 12px 24px rgba(40, 27, 17, 0.18);
  font-size: 15px;
}

.play-icon {
  font-size: 16px;
}

.invitation-mask,
.story-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(31, 22, 14, 0.42);
  display: grid;
  place-items: center;
  padding: 20px;
}

.invitation-panel,
.story-modal {
  background: url(@/assets/imgs/jieshao.png);
  /* border: 1px solid rgba(188, 156, 114, 0.28); */
  /* box-shadow: 0 20px 48px rgba(66, 49, 29, 0.18); */
  color: #624626;
   /* background-size: cover; */
   background-size: 100% 100%;
   padding: 10px;
}

.invitation-panel {
  width: min(420px, 100%);
  border-radius: 24px;
  padding: 28px 24px;
  text-align: center;
}

.invitation-kicker {
  color: #b07a43;
  font-size: 13px;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.invitation-title {
  font-size: 28px;
  color: #6a4927;
  margin-bottom: 12px;
  font-family: "STKaiti", "KaiTi", serif;
}

.invitation-desc {
  color: #7d6448;
  font-size: 15px;
  line-height: 1.9;
  margin-bottom: 18px;
}

.invitation-actions,
.finish-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-btn {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(207, 174, 130, 0.38);
  background: linear-gradient(180deg, #fbf2e6, #f0e3cf);
  color: #8a6543;
  font-size: 14px;
}

.panel-btn.primary {
  border: none;
  background: linear-gradient(135deg, #c98b4d, #a85f35);
  color: #fff8ef;
}

.story-modal {
  position: relative;
  width: min(920px, calc(100vw - 40px));
  max-height: 88vh;
  overflow: hidden;
  border-radius: 28px;
  

}

.story-close-btn {
  position: absolute;
  top: 40px;
  right: 30px;
  z-index: 5;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(123, 84, 45, 0.3);
  color: #7c5b34;
  font-size: 24px;
  line-height: 1;
}

.summary-frame {
  padding: 34px 28px 30px;
  max-height: 88vh;
  overflow-y: auto;
}

.summary-frame::-webkit-scrollbar {
  display: none;
}

.story-card-head {
  text-align: center;
  margin-bottom: 20px;
}

.story-kicker {
  color: #a27a49;
  font-size: 13px;
  letter-spacing: 3px;
  margin-bottom: 10px;
}

.story-title {
  font-size: 36px;
  color: #6a4927;
  font-family: "STKaiti", "KaiTi", serif;
}

.summary-scroll {
  display: grid;
  gap: 16px;
  padding: 8px 6px 10px;
}

.summary-line {
  margin: 0;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 28px;
  line-height: 1.95;
  color: #5a4024;
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
.fade-soft-leave-active {
  transition: all 0.28s ease;
}

.fade-soft-enter-from,
.fade-soft-leave-to {
  opacity: 0;
}

@media (max-width: 1280px) {
  .dialogue-shell {
    width: calc(100vw - 40px);
  }

  .character {
    width: min(23vw, 280px);
  }

  .dialogue-text {
    font-size: clamp(22px, 1.9vw, 34px);
  }
}

@media (max-width: 960px) {
  .top-bar {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 12px;
  }

  .scene-chip,
  .skip-btn {
    justify-self: center;
  }

  .character {
    width: 180px;
  }

  .traveler-card {
    left: 2vw;
    top: 14vh;
  }

  .npc-card {
    right: 2vw;
    top: 15vh;
  }

  .dialogue-shell {
    bottom: 6vh;
    width: calc(100vw - 18px);
  }

  .dialogue-card {
    aspect-ratio: 1738 / 680;
  }

  .scroll-content {
    left: 9.5%;
    right: 9.5%;
    top: 14%;
    bottom: 14%;
  }

  .scroll-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .head-right {
    width: 100%;
    justify-content: space-between;
  }

  .dialogue-main {
    padding: 12px 2px;
  }

  .dialogue-text {
    font-size: 20px;
    line-height: 1.8;
  }

  .scroll-foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .poem-box {
    max-width: 100%;
  }

  .continue-area {
    width: 100%;
    justify-content: space-between;
  }

  .continue-icon {
    min-width: 54px;
    height: 54px;
    font-size: 24px;
  }

  .play-float-btn {
    height: 48px;
    font-size: 13px;
    padding: 0 12px;
  }
}

@media (max-width: 640px) {
  .character {
    width: 130px;
    opacity: 0.75;
  }

  .dialogue-card {
    aspect-ratio: 1738 / 760;
  }

  .scroll-content {
    left: 8.8%;
    right: 8.8%;
    top: 13%;
    bottom: 13%;
  }

  .speaker-badge {
    min-height: 36px;
    font-size: 12px;
    padding: 0 16px 0 12px;
  }

  .speaker-badge::after {
    right: -12px;
    border-top: 18px solid transparent;
    border-bottom: 18px solid transparent;
    border-left: 12px solid #a66f3c;
  }

  .instant-btn {
    min-height: 36px;
    padding: 0 14px;
    font-size: 12px;
  }

  .mood-line,
  .continue-tip,
  .poem-text {
    font-size: 12px;
  }

  .dialogue-text {
    font-size: 18px;
  }
}
</style>
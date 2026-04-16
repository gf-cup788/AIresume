<template>
  <div class="dialogue-page">
    <!-- 固定背景 -->
    <div class="page-bg-base"></div>
    <div
      class="page-fixed-bg"
      :class="{ loaded: bgLoaded }"
      :style="{ backgroundImage: `url(${currentBg})` }"
    ></div>

    <audio ref="voiceAudioRef" preload="auto" class="voice-audio"></audio>

    <!-- 顶部 -->
    <div class="top-bar">
      <button class="scene-back-btn" @click="goBackToScenicDetail">
        <span class="back-icon">‹</span>
        <span class="back-text">返回景点</span>
      </button>
      
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
      <span class="play-btn-ripple"></span>
      <span class="play-btn-ripple ripple-delay"></span>
      <span class="play-btn-inner">
        <span class="play-icon">✦</span>
        <span class="play-text">玩一玩</span>
      </span>
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
        :scenic-id="scenicId"
        :board-count="3"
        :board-size="330"
        @success="handleGameSuccess"
      />

      <FlowerCatchGame
        v-else-if="currentGame.type === 'flower'"
        :scenic-id="scenicId"
        :scenic-name="scenicName"
        :target-score="12"
        :max-missed="6"
        @success="handleGameSuccess"
      />

      <MemoryMatchGame
        v-else-if="currentGame.type === 'memory'"
        :scenic-name="scenicName"
        :scenic-id="scenicId"
        :pair-count="8"
        @success="handleGameSuccess"
      />

      <SpotDifferenceGame
        v-else-if="currentGame.type === 'spot'"
        :scenic-name="scenicName"
        :scenic-id="scenicId"
        @success="handleGameSuccess"
      />

      <MatchLineGame
        v-else-if="currentGame.type === 'link'"
        :scenic-name="scenicName"
        :scenic-id="scenicId"
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

          <div class="finish-icon">{{ finishSaved === "already" ? "🏮" : (finishSaved ? "🏮" : "✨") }}</div>
          <div class="finish-title">
            {{ finishSaved === "already" ? "已打卡" : (finishSaved ? "打卡完成" : "对话完成") }}
          </div>
          <div class="finish-desc">
            <template v-if="finishSaved === 'already'">
              你已经打卡过 {{ scenicName }} 了，打卡记录已保存~
            </template>
            <template v-else-if="finishSaved">
              你已完成 {{ scenicName }} 的故事体验，打卡记录已保存。
            </template>
            <template v-else>
              你已完成 {{ scenicName }} 的故事体验，登录后可保存打卡记录。
            </template>
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
import npcNanChang from "@/assets/Characters/NPC-NanChang.png";
import npcGanZhou from "@/assets/Characters/NPC-GanZhou.png";
import npcShangRao from "@/assets/Characters/NPC-ShangRao.png";
import npcJiAn from "@/assets/Characters/NPC-JiAn.png";
import npcJiuJiang from "@/assets/Characters/NPC-JiuJiang.png";
import npcJingDeZhen from "@/assets/Characters/NPC-JingDeZhen.png";
import defaultAvatarA from "@/assets/imgs/youke.png";
import lushanBg from "@/assets/imgs/lushan.jpg";
import defaultDialoguePageBg from "@/assets/imgs/duihuapg.png";
import juanzhouBg from "@/assets/imgs/juanzhou.png";

import ScenicGameModal from "@/components/games/ScenicGameModal.vue";
import PuzzleGame from "@/components/games/PuzzleGame.vue";
import FlowerCatchGame from "@/components/games/FlowerCatchGame.vue";
import MemoryMatchGame from "@/components/games/MemoryMatchGame.vue";
import SpotDifferenceGame from "@/components/games/SpotDifferenceGame.vue";
import MatchLineGame from "@/components/games/MatchLineGame.vue";

const route = useRoute();
const router = useRouter();

const isDemo = route.query.demo === "true";
const scenicId = Number(route.query.apiId || route.query.id) || 1;
const showDemoTip = ref(true);
const voiceAudioRef = ref(null);

const voiceList = ref([]);
const loadingVoice = ref(false);

const normalizeText = (text = "") => {
  return String(text)
    .replace(/\s+/g, "")
    .trim();
};

const normalizeVoiceDetails = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map((item, idx) => ({
    id: Number(item?.id) || idx + 1,
    speaker: item?.speaker || "",
    content: item?.content || "",
    audioUrl: item?.audioUrl || "",
    audioPath: item?.audioPath || "",
    success: item?.success === true,
    error: item?.error || ""
  }));
};

const stopVoice = () => {
  const audio = voiceAudioRef.value;
  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
  } catch (error) {
    console.warn("停止语音失败:", error);
  }
};

const getVoiceUrlByItem = (item, idx) => {
  if (!item) return "";

  const byId = voiceList.value.find((voice) => voice.id === idx + 1 && voice.success && voice.audioUrl);
  if (byId?.audioUrl) return byId.audioUrl;

  const currentSpeaker = (item.speaker || "").trim();
  const currentTextValue = normalizeText(item.text || item.content || "");

  const byContent = voiceList.value.find((voice) => {
    return voice.success && voice.audioUrl &&
      (voice.speaker || "").trim() === currentSpeaker &&
      normalizeText(voice.content) === currentTextValue;
  });

  return byContent?.audioUrl || "";
};

const currentVoiceUrl = computed(() => {
  return getVoiceUrlByItem(currentItem.value, index.value);
});

const playCurrentVoice = async () => {
  const audio = voiceAudioRef.value;
  const voiceUrl = currentVoiceUrl.value;

  if (!audio) return;

  stopVoice();

  if (!voiceUrl || showSummaryModal.value || showFinishModal.value) return;

  try {
    audio.src = voiceUrl;
    await audio.play();
  } catch (error) {
    console.warn("播放语音失败:", error);
  }
};

const fetchVoiceList = async () => {
  try {
    loadingVoice.value = true;
    const res = await request(`/api/scenic/voice/generate?scenicId=${scenicId}`, {
      method: "POST"
    });

    if (res?.code === 200) {
      voiceList.value = normalizeVoiceDetails(res.details);
      console.log("景区对话语音获取成功:", voiceList.value);
      playCurrentVoice();
    } else {
      voiceList.value = [];
      console.error("景区对话语音获取失败:", res?.message);
    }
  } catch (error) {
    voiceList.value = [];
    console.error("景区对话语音获取失败：", error);
  } finally {
    loadingVoice.value = false;
  }
};

const scenicDetail = ref({
  name: "",
  summary: "",
  dialogues: [],
  dialogueBgUrl: "",
  regionId: null
});

const bgLoaded = ref(false);
const currentBg = ref(defaultDialoguePageBg);

const goBackToScenicDetail = () => {
  const query = {
    id: scenicId,
    apiId: scenicId
  };

  if (currentRegionId.value) {
    query.regionId = currentRegionId.value;
  }

  router.push({
    path: "/detail",
    query
  });
};


/** 新增：用户信息，用 profileImage 控制游客图片 */
const userProfile = ref({
  profileImage: ""
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

const currentRegionId = computed(() => {
  const queryRegionId = Number(route.query.regionId);
  if (queryRegionId) return queryRegionId;
  return Number(scenicDetail.value.regionId) || null;
});

const npcImage = computed(() => {
  switch (currentRegionId.value) {
    case 1:
      return npcNanChang;
    case 2:
      return npcGanZhou;
    case 3:
      return npcShangRao;
    case 4:
      return npcJiAn;
    case 5:
      return npcJiuJiang;
    case 6:
      return npcJingDeZhen;
    default:
      return npcConfig[scenicId]?.image || defaultAvatar;
  }
});

/** 新增：游客图优先取 profileImage，没有则取默认图 */
const travelerImage = computed(() => {
  return userProfile.value.profileImage || defaultAvatarA;
});

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

const preloadBackground = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(defaultDialoguePageBg);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(defaultDialoguePageBg);
    img.src = url;
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
const hasCheckedIn = ref(false);

// ==================== 打卡接口 ====================
const submitCheckin = async () => {
  if (hasCheckedIn.value) return;

  const token = localStorage.getItem("token");
  if (!token) {
    console.log("用户未登录，跳过打卡");
    return;
  }

  try {
    const requestBody = {
      scenicId: scenicId,
      scenicName: scenicName.value
    };

    console.log("打卡请求参数:", requestBody);

    const res = await request("/api/checkin", {
      method: "POST",
      body: requestBody
    });

    if (res?.code === 200) {
      console.log("打卡成功:", scenicName.value);
      hasCheckedIn.value = true;
      finishSaved.value = true;
    } else {
      if (res?.message && (res.message.includes("今天已经打卡过") || res.message.includes("已打卡"))) {
        console.log("今天已经打卡过该景点:", scenicName.value);
        hasCheckedIn.value = true;
        finishSaved.value = "already";
      } else {
        console.error("打卡失败:", res?.message);
        finishSaved.value = false;
      }
    }
  } catch (error) {
    console.error("打卡请求失败:", error);
    if (error.message && (error.message.includes("今天已经打卡过") || error.message.includes("已打卡"))) {
      console.log("今天已经打卡过该景点（catch）:", scenicName.value);
      hasCheckedIn.value = true;
      finishSaved.value = "already";
    } else {
      finishSaved.value = false;
    }
  }
};
// ==================== 打卡接口结束 ====================

// ==================== 用户头像接口 ====================
const fetchUserProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    userProfile.value.profileImage = "";
    return;
  }

  try {
    const res = await request("/api/user/profile", {
      method: "GET"
    });

    if (res?.code === 200 && res?.data) {
      userProfile.value = {
        profileImage: res.data.profileImage || ""
      };
      console.log("用户资料获取成功:", userProfile.value);
    } else {
      userProfile.value.profileImage = "";
      console.error("获取用户资料失败:", res?.message);
    }
  } catch (error) {
    userProfile.value.profileImage = "";
    console.error("获取用户资料失败：", error);
  }
};
// ==================== 用户头像接口结束 ====================

// ==================== 游戏接口相关 ====================
const gameData = ref(null);
const loadingGame = ref(false);

const gameTypeMap = {
  puzzle: "puzzle",
  flower: "flower",
  match: "memory",
  spot_diff: "spot",
  link: "link"
};

const fetchGameData = async () => {
  try {
    loadingGame.value = true;
    const res = await request(`/api/games/start?scenicId=${scenicId}`, {
      method: "GET"
    });

    if (res?.code === 200 && res?.data) {
      gameData.value = res.data;
      console.log("游戏类型获取成功:", gameData.value);
    } else {
      console.error("获取游戏类型失败");
      gameData.value = null;
    }
  } catch (error) {
    console.error("获取游戏类型失败：", error);
    gameData.value = null;
  } finally {
    loadingGame.value = false;
  }
};

const currentGameType = computed(() => {
  if (!gameData.value?.gameType) return null;
  return gameTypeMap[gameData.value.gameType] || null;
});

const currentGame = computed(() => {
  const gameType = currentGameType.value;
  const apiTitle = gameData.value?.title || `${scenicName.value} · 小游戏`;
  const apiDesc = gameData.value?.description || "完成游戏可获得打卡奖励";

  if (!gameType) {
    return {
      type: "puzzle",
      title: apiTitle,
      subtitle: apiDesc,
      imageUrl: lushanBg
    };
  }

  if (gameType === "puzzle") {
    return {
      type: "puzzle",
      title: gameData.value?.title || `${scenicName.value} · 拼图小游戏`,
      subtitle: gameData.value?.description || "将右侧拼图块拖到左边对应位置，放对后会自动吸附。",
      imageUrl: lushanBg
    };
  }

  if (gameType === "flower") {
    return {
      type: "flower",
      title: gameData.value?.title || `${scenicName.value} · 接花小游戏`,
      subtitle: gameData.value?.description || "移动下方花篮，接住掉落的花朵，达到目标分数即可通关。",
      imageUrl: ""
    };
  }

  if (gameType === "memory") {
    return {
      type: "memory",
      title: gameData.value?.title || `${scenicName.value} · 翻牌消消乐`,
      subtitle: gameData.value?.description || "翻开两张相同的卡片即可消除，全部消除就算成功。",
      imageUrl: ""
    };
  }

  if (gameType === "spot") {
    return {
      type: "spot",
      title: gameData.value?.title || `${scenicName.value} · 找不同`,
      subtitle: gameData.value?.description || "找出左右两幅图中的所有不同点。",
      imageUrl: ""
    };
  }

  if (gameType === "link") {
    return {
      type: "link",
      title: gameData.value?.title || `${scenicName.value} · 连线游戏`,
      subtitle: gameData.value?.description || "将左侧内容与右侧正确内容连起来。",
      imageUrl: ""
    };
  }

  return {
    type: "puzzle",
    title: apiTitle,
    subtitle: apiDesc,
    imageUrl: lushanBg
  };
});
// ==================== 游戏接口相关结束 ====================

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

  playCurrentVoice();

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
  stopVoice();
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
  stopVoice();
  autoPlay.value = false;
  displayedText.value = currentText.value || "";
  isTyping.value = false;
  showSummaryModal.value = true;
};

const closeSummaryModal = async () => {
  showSummaryModal.value = false;

  await submitCheckin();

  showFinishModal.value = true;
  const user = localStorage.getItem("user");
  if (!user) {
    finishSaved.value = false;
  }
};

const openGameModal = async () => {
  if (!gameData.value) {
    await fetchGameData();
  }
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
    bgLoaded.value = false;

    const res = await request(`/api/scenics/${scenicId}`, {
      method: "GET"
    });

    if (res?.code === 200 && res?.data) {
      scenicDetail.value = {
        name: res.data.name || "",
        summary: res.data.summary || "",
        dialogues: Array.isArray(res.data.dialogues) ? res.data.dialogues : [],
        dialogueBgUrl: res.data.dialogueBgUrl || "",
        regionId: res.data.regionId ?? null
      };

      const loadedBg = await preloadBackground(res.data.dialogueBgUrl);
      currentBg.value = loadedBg;
      index.value = 0;

      requestAnimationFrame(() => {
        bgLoaded.value = true;
      });
    } else {
      currentBg.value = defaultDialoguePageBg;
      requestAnimationFrame(() => {
        bgLoaded.value = true;
      });
    }
  } catch (error) {
    console.error("获取景点对话失败：", error);
    currentBg.value = defaultDialoguePageBg;
    requestAnimationFrame(() => {
      bgLoaded.value = true;
    });
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
    stopVoice();
    autoPlay.value = false;
  }
});

watch(showFinishModal, (val) => {
  if (val) {
    clearTyping();
    clearAuto();
    stopVoice();
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

  await fetchUserProfile();
  await fetchDialogueDetail();
  await fetchVoiceList();
  await fetchGameData();
});

onBeforeUnmount(() => {
  clearTyping();
  clearAuto();
  stopVoice();
});
</script>

<style scoped>
.voice-audio {
  display: none;
}

.dialogue-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #f3efe5;
  user-select: none;
}

.page-bg-base {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #f3efe5 url("@/assets/imgs/duihuapg.png") center center / 100% 100% no-repeat;
}

.page-fixed-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  filter: saturate(0.92) brightness(0.93);
  opacity: 0;
  transition: opacity 0.45s ease;
  will-change: opacity;
}

.page-fixed-bg.loaded {
  opacity: 1;
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

.scene-back-btn {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 54px;
  padding: 0 30px 0 22px;
  border: none;
  outline: none;
  background: linear-gradient(135deg, rgba(183, 126, 67, 0.96), rgba(160, 105, 50, 0.96));
  color: #fff8ef;
  font-size: 16px;
  letter-spacing: 2px;
  font-family: "STKaiti", "KaiTi", "FangSong", serif;
  position: relative;
  cursor: pointer;
  box-shadow:
    0 8px 18px rgba(93, 58, 28, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
  overflow: visible;
}

.scene-back-btn::before {
  content: "";
  position: absolute;
  inset: 2px 2px 2px 2px;
  border: 1px solid rgba(255, 244, 228, 0.28);
  pointer-events: none;
}

.scene-back-btn::after {
  content: "";
  position: absolute;
  top: 0;
  right: -24px;
  width: 0;
  height: 0;
  border-top: 27px solid transparent;
  border-bottom: 27px solid transparent;
  border-left: 24px solid rgba(160, 105, 50, 0.96);
  filter: drop-shadow(0 6px 10px rgba(93, 58, 28, 0.12));
}

.scene-back-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 24px rgba(93, 58, 28, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  filter: brightness(1.04);
}

.scene-back-btn:active {
  transform: translateY(0);
}

.back-icon {
  font-size: 24px;
  line-height: 1;
  font-weight: 400;
  opacity: 0.95;
  transform: translateY(-1px);
}

.back-text {
  position: relative;
  z-index: 1;
  white-space: nowrap;
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
  width: min(20vw, 300px);
  transition: opacity 0.25s ease;
}

.traveler-card {
  left: 3vw;
  top: 7.5vh;
}

.npc-card {
  right: 3vw;
  top: 7.5vh;
}

.character.active {
  opacity: 1;
}

.character.dim {
  opacity: 0;
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
  right: 16px;
  top: 58%;
  transform: translateY(-50%);
  z-index: 18;
  width: 84px;
  height: 84px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff1d9 0%, #d8ab6a 30%, #f7bc88 68%, #c58350 100%);
  color: #fff6eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 14px 30px rgba(64, 40, 22, 0.24),
    inset 0 2px 10px rgba(255, 255, 255, 0.32),
    inset 0 -8px 14px rgba(94, 52, 22, 0.22);
  overflow: visible;
  isolation: isolate;
  animation: playBtnFloat 3.2s ease-in-out infinite;
}

.play-float-btn::before {
  content: "";
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  border: 1px solid rgba(255, 244, 225, 0.52);
  pointer-events: none;
  z-index: 1;
}

.play-float-btn::after {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 221, 171, 0.18) 0%, rgba(255, 221, 171, 0.04) 48%, rgba(255, 221, 171, 0) 72%);
  z-index: 0;
  animation: playBtnGlow 2.8s ease-in-out infinite;
  pointer-events: none;
}

.play-btn-inner {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(255, 251, 242, 0.2), rgba(255, 238, 213, 0.08));
  backdrop-filter: blur(1px);
}

.play-btn-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 236, 202, 0.55);
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  animation: playBtnRipple 2.8s ease-out infinite;
}

.play-btn-ripple.ripple-delay {
  animation-delay: 1.4s;
}

.play-icon {
  font-size: 24px;
  line-height: 1;
  color: #fff9f0;
  text-shadow: 0 2px 8px rgba(124, 71, 33, 0.32);
  animation: playStarTwinkle 2.2s ease-in-out infinite;
}

.play-text {
  font-size: 16px;
  line-height: 1;
  letter-spacing: 2px;
  font-weight: 700;
  color: #fff7ee;
  text-shadow: 0 1px 4px rgba(83, 47, 20, 0.28);
}

@keyframes playBtnFloat {
  0%,
  100% {
    transform: translateY(-50%) translateX(0);
  }
  50% {
    transform: translateY(calc(-50% - 6px)) translateX(-2px);
  }
}

@keyframes playBtnGlow {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes playBtnRipple {
  0% {
    opacity: 0.65;
    transform: scale(0.92);
  }
  70% {
    opacity: 0.14;
  }
  100% {
    opacity: 0;
    transform: scale(1.36);
  }
}

@keyframes playStarTwinkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  30% {
    transform: scale(1.08) rotate(-8deg);
  }
  60% {
    transform: scale(0.94) rotate(8deg);
  }
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
  background-size: 100% 100%;
  padding: 10px;
  color: #624626;
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
    height: auto;
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
    right: 18px;
    width: 82px;
    height: 82px;
  }

  .play-btn-inner {
    width: 66px;
    height: 66px;
  }

  .play-icon {
    font-size: 20px;
  }

  .play-text {
    font-size: 13px;
    letter-spacing: 1px;
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

  .play-float-btn {
    right: 12px;
    width: 72px;
    height: 72px;
  }

  .play-btn-inner {
    width: 58px;
    height: 58px;
    gap: 2px;
  }

  .play-icon {
    font-size: 16px;
  }

  .play-text {
    font-size: 12px;
    letter-spacing: 0;
  }
}
</style>
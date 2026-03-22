<template>
  <div class="dialogue-page">
    <div class="scene-bg" :style="{ backgroundImage: 'url(' + currentBgImage + ')' }"></div>
    <div class="scene-mask"></div>
    <div class="paper-edge left"></div>
    <div class="paper-edge right"></div>

    <div class="top-actions">
      <button class="skip-btn" @click.stop="skipToStory">跳过</button>
    </div>

    <div class="character-stage">
      <div class="traveler-figure" :class="{ active: currentRole === 'traveler', dim: currentRole !== 'traveler' }">
        <div class="traveler-shadow"></div>
        <img :src="travelerImage" class="traveler-img" alt="旅人" />
      </div>

      <div class="npc-figure" :class="{ active: currentRole === 'npc', dim: currentRole !== 'npc' }">
        <div class="npc-glow"></div>
        <img :src="npcImage" class="npc-img" :alt="currentSpeakerName" />
      </div>
    </div>

    <div class="dialogue-board" @click="next">
      <div class="name-plate" :class="currentRole">{{ currentSpeakerName }}</div>

      <div class="dialogue-inner">
        <div class="speaker-tip">
          <span class="tip-dot"></span>
          <span>{{ currentRole === 'traveler' ? '你正在发问' : '对方正在回应' }}</span>
        </div>
        <div class="dialogue-text">{{ currentText }}</div>
      </div>

      <div class="dialogue-footer">
        <div class="poem-line" v-if="currentRole === 'npc' && npcPoem">{{ npcPoem }}</div>
        <div class="poem-line" v-else>轻触继续对话</div>
        <div class="continue-mark">
          <span v-if="!isLastLine">»</span>
          <span v-else>➜</span>
        </div>
      </div>
    </div>

    <transition name="fade-soft">
      <div v-if="isDemo && showDemoTip" class="invitation-mask">
        <div class="invitation-panel">
          <div class="invitation-title">客官且慢</div>
          <div class="invitation-desc">
            登录后可解锁完整剧情，
            <br />
            并留下你的游历印记。
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
import { ref, computed, onMounted } from "vue";
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

const next = () => {
  if (isDemo && index.value === 2 && showDemoTip.value) return;

  if (index.value < dialogue.length - 1) {
    index.value++;
  } else {
    goStoryPage();
  }
};

const goStoryPage = () => {
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
.dialogue-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #ede2ce;
}

.scene-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: scale(1.03);
}

.scene-mask {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 248, 236, 0.12) 0%, rgba(36, 25, 12, 0.1) 100%),
    radial-gradient(circle at 50% 30%, rgba(255, 250, 239, 0.12) 0%, transparent 42%),
    linear-gradient(0deg, rgba(38, 26, 12, 0.18) 0%, rgba(38, 26, 12, 0) 35%);
}

.paper-edge {
  position: absolute;
  top: 0;
  width: 54px;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.paper-edge.left {
  left: 0;
  background: linear-gradient(90deg, rgba(150, 119, 76, 0.18), transparent);
}

.paper-edge.right {
  right: 0;
  background: linear-gradient(270deg, rgba(150, 119, 76, 0.18), transparent);
}

.top-actions {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 6;
}

.skip-btn {
  border: 1px solid rgba(121, 77, 39, 0.35);
  background: rgba(255, 248, 235, 0.72);
  color: #7b4f2e;
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 14px;
  font-family: "STKaiti", "KaiTi", serif;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.character-stage {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.traveler-figure,
.npc-figure {
  transition: all 0.28s ease;
}

.traveler-figure {
  position: absolute;
  left: 7%;
  bottom: 15%;
  width: min(29vw, 420px);
  opacity: 0.95;
}

.traveler-shadow {
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: 10px;
  height: 26px;
  border-radius: 50%;
  background: rgba(41, 29, 14, 0.2);
  filter: blur(10px);
}

.traveler-img {
  width: 100%;
  display: block;
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.18));
}

.npc-figure {
  position: absolute;
  right: 5%;
  bottom: 18%;
  width: min(29vw, 420px);
}

.npc-glow {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 18px;
  height: 34px;
  border-radius: 50%;
  background: rgba(56, 36, 17, 0.22);
  filter: blur(12px);
}

.npc-img {
  position: relative;
  width: 100%;
  display: block;
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.18));
}

.traveler-figure.active,
.npc-figure.active {
  opacity: 1;
  transform: scale(1.04);
}

.traveler-figure.dim,
.npc-figure.dim {
  opacity: 0.45;
  transform: scale(0.98);
}

.traveler-figure.dim .traveler-img,
.npc-figure.dim .npc-img {
  filter: brightness(0.62) saturate(0.72);
}

.dialogue-board {
  position: absolute;
  left: 50%;
  bottom: 4%;
  transform: translateX(-50%);
  width: min(1220px, calc(100% - 90px));
  min-height: 188px;
  z-index: 5;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(247, 239, 223, 0.97) 0%, rgba(241, 232, 214, 0.98) 100%);
  border: 3px solid #7f5735;
  border-radius: 28px;
  box-shadow: 0 20px 40px rgba(57, 35, 16, 0.18);
  padding: 34px 42px 24px;
}

.dialogue-board::before {
  content: "";
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(127, 87, 53, 0.18);
  border-radius: 18px;
  pointer-events: none;
}

.name-plate {
  position: absolute;
  top: -20px;
  min-width: 170px;
  text-align: center;
  padding: 10px 28px;
  border-radius: 18px;
  color: #fff6e8;
  font-size: 28px;
  line-height: 1;
  font-family: "STKaiti", "KaiTi", serif;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(109, 58, 31, 0.25);
  transition: all 0.25s ease;
}

.name-plate.traveler {
  left: 18%;
  transform: translateX(-50%);
  background: #9b5a36;
}

.name-plate.npc {
  left: 80%;
  transform: translateX(-50%);
  background: #a85f38;
}

.dialogue-inner {
  position: relative;
  z-index: 1;
}

.speaker-tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #9a774e;
  font-size: 13px;
}

.tip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c28a4e;
}

.dialogue-text {
  min-height: 90px;
  padding-top: 4px;
  font-size: clamp(24px, 2vw, 34px);
  line-height: 1.85;
  color: #3d2816;
  font-family: "STKaiti", "KaiTi", serif;
  letter-spacing: 1px;
}

.dialogue-footer {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  margin-top: 10px;
}

.poem-line {
  color: #9c7a52;
  font-size: 13px;
  letter-spacing: 1px;
}

.continue-mark {
  color: #d88a3b;
  font-size: 36px;
  line-height: 1;
  animation: pulseArrow 1.2s ease-in-out infinite;
}

@keyframes pulseArrow {
  0%, 100% { transform: translateX(0); opacity: 0.75; }
  50% { transform: translateX(6px); opacity: 1; }
}

.invitation-mask {
  position: fixed;
  inset: 0;
  background: rgba(28, 18, 9, 0.52);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.invitation-panel {
  width: min(360px, calc(100% - 32px));
  background: linear-gradient(180deg, #fbf2df 0%, #f4e7cb 100%);
  border: 2px solid #8c603c;
  border-radius: 22px;
  padding: 28px 24px 22px;
  text-align: center;
  box-shadow: 0 18px 36px rgba(40, 24, 11, 0.22);
}

.invitation-title {
  font-size: 28px;
  color: #6d4524;
  font-family: "STKaiti", "KaiTi", serif;
}

.invitation-desc {
  margin-top: 14px;
  color: #856441;
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
  border-radius: 999px;
  padding: 10px 20px;
  border: 1px solid rgba(140, 96, 60, 0.28);
  background: rgba(255, 248, 234, 0.92);
  color: #7c5634;
  cursor: pointer;
  font-family: "STKaiti", "KaiTi", serif;
}

.panel-btn.primary {
  border: none;
  background: linear-gradient(135deg, #b48a55, #8b643c);
  color: #fff8ef;
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

@media (max-width: 900px) {
  .traveler-figure {
   width: min(38vw, 270px);
    left: 5%;
    bottom: 18%;
  }

  .npc-figure {
    width: min(38vw, 270px);
    right: 5%;
    bottom: 18%;
  }

  .dialogue-board {
    width: calc(100% - 28px);
    padding: 28px 22px 20px;
    bottom: 10px;
    min-height: 156px;
  }

  .name-plate {
    min-width: 126px;
    font-size: 22px;
    padding: 8px 20px;
  }

  .name-plate.traveler {
    left: 22%;
  }

  .name-plate.npc {
    left: 80%;
  }

  .dialogue-text {
    font-size: 20px;
    min-height: 72px;
  }
}

@media (max-width: 600px) {
  .top-actions {
    top: 14px;
    right: 14px;
  }

  .skip-btn {
    font-size: 12px;
    padding: 7px 14px;
  }

  .traveler-figure {
    left: 2%;
    bottom: 24%;
    width: 178px;
  }

  .npc-figure {
    right: 0;
    bottom: 22%;
    width: 178px;
  }

  .dialogue-board {
    width: calc(100% - 16px);
    border-radius: 20px;
    border-width: 2px;
    padding: 22px 14px 16px;
    bottom: 8px;
    min-height: 144px;
  }

  .name-plate {
    top: -16px;
    font-size: 18px;
    min-width: 96px;
    padding: 7px 14px;
    border-radius: 14px;
  }

  .name-plate.traveler {
    left: 20%;
  }

  .name-plate.npc {
    left: 80%;
  }

  .dialogue-text {
    font-size: 17px;
    line-height: 1.8;
  }

  .speaker-tip,
  .poem-line {
    display: none;
  }

  .continue-mark {
    font-size: 30px;
  }
}
</style>

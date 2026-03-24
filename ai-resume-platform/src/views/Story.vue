<template>
  <div class="story-page">
    <div class="ink-bg"></div>
    <div class="ink-wash ink-1"></div>
    <div class="ink-wash ink-2"></div>
    <div class="bamboo bamboo-1"></div>
    <div class="bamboo bamboo-2"></div>

    <div class="floating-entry-group">
      <button class="entry-btn ghost" @click="goHome">
        <span class="entry-icon">⌂</span>
        <span>返回首页</span>
      </button>
    </div>

    <div class="story-shell">
      <!-- 顶部主视觉 -->
      <section class="hero-card">
        <div class="hero-pattern"></div>

        <div class="hero-left">
          <div class="hero-badge">江西故事 · 豫章风物</div>
          <h1 class="hero-title">{{ scenic.name }}</h1>
          <div class="hero-divider"></div>
          <p class="hero-desc">
            山水入卷，故事入心。循着江西的古韵脉络，读一段风物传说，玩一局景点拼图，答一题趣味问答，留下一次属于你的游历印记。
          </p>

          <div class="hero-actions">
            <button class="primary-btn" @click="scrollToStory">开始阅读</button>
            <button class="secondary-btn" @click="scrollToPuzzle">去玩拼图</button>
            <button class="secondary-btn" @click="openQuizPanel">
              {{ checkedIn ? "再答一题" : "去挑战问答" }}
            </button>
          </div>
        </div>

        <div class="hero-right">
          <div class="seal-orb">
            <div class="seal-outer"></div>
            <div class="seal-core">{{ scenic.name.slice(0, 2) }}</div>
          </div>

          <div class="hero-meta">
            <div class="meta-item">
              <span class="meta-label">主题</span>
              <span class="meta-value">景点故事</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">互动</span>
              <span class="meta-value">阅读 + 拼图 + 答题</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">状态</span>
              <span class="meta-value">{{ checkedIn ? "已打卡" : "待解锁" }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 主体内容 -->
      <section ref="storySection" class="main-grid">
        <article class="story-card paper-card">
          <div class="section-topline">
            <span class="section-dot"></span>
            <span>故事正文</span>
          </div>

          <div class="story-content">
            <p
              v-for="(p, idx) in story"
              :key="idx"
              class="story-paragraph"
            >
              {{ p }}
            </p>
          </div>

          <div class="story-bottom-bar">
            <button class="text-btn" @click="goBack">返回上一页</button>
            <button class="text-btn" @click="scrollToPuzzle">去玩拼图</button>
            <button class="text-btn highlight" @click="openQuizPanel">
              {{ checkedIn ? "继续答题" : "阅读完毕，去答题" }}
            </button>
          </div>
        </article>

        <aside class="side-panel">
          <div class="status-card paper-card">
            <div class="section-topline">
              <span class="section-dot"></span>
              <span>互动面板</span>
            </div>

            <div class="status-block">
              <div class="status-title">当前景点</div>
              <div class="status-name">{{ scenic.name }}</div>
            </div>

            <div class="status-block compact">
              <div class="mini-stat">
                <span class="mini-label">打卡状态</span>
                <span class="mini-value success-text">{{ checkedIn ? "已完成" : "未完成" }}</span>
              </div>
              <div class="mini-stat">
                <span class="mini-label">拼图进度</span>
                <span class="mini-value">{{ placedCount }}/{{ totalPieces }}</span>
              </div>
              <div class="mini-stat">
                <span class="mini-label">日期</span>
                <span class="mini-value">{{ currentDate }}</span>
              </div>
            </div>

            <div class="cta-group">
              <button class="panel-btn primary" @click="scrollToPuzzle">
                {{ solved ? "再玩一次拼图" : "开始拼图" }}
              </button>
              <button class="panel-btn" @click="openQuizPanel">
                {{ checkedIn ? "重新挑战" : "开始答题" }}
              </button>
              <button v-if="checkedIn" class="panel-btn" @click="goUserCenter">
                查看我的打卡
              </button>
              <button v-else class="panel-btn" @click="goHome">
                返回首页继续浏览
              </button>
            </div>
          </div>

          <transition name="fade-up">
            <div v-if="solved" class="success-card paper-card">
              <div class="success-icon">🧩</div>
              <div class="success-title">拼图完成</div>
              <div class="success-subtitle">你已完成 {{ scenic.name }} 的景点拼图</div>
              <div class="success-date">完成时间：{{ currentDate }}</div>
            </div>
          </transition>

          <transition name="fade-up">
            <div v-if="checkedIn" class="success-card paper-card">
              <div class="success-icon">🏮</div>
              <div class="success-title">打卡成功</div>
              <div class="success-subtitle">你已完成 {{ scenic.name }} 的知识挑战</div>
              <div class="success-date">记录时间：{{ currentDate }}</div>
            </div>
          </transition>
        </aside>
      </section>

      <!-- 拖拽拼图区域 -->
      <section ref="puzzleSection" class="puzzle-wrap paper-card">
        <div class="section-topline">
          <span class="section-dot"></span>
          <span>景点拼图</span>
        </div>

        <div class="puzzle-grid-layout">
          <!-- 左边：拼图框 -->
          <div class="puzzle-left">
            <div class="puzzle-intro">
              <h3>{{ scenic.name }} · 拖拽拼图</h3>
              <p>
                将右侧散落的拼图块拖进左侧拼图框中，放到正确位置即可完成整幅景点画卷。
              </p>
            </div>

            <div class="puzzle-stats">
              <div class="puzzle-stat">
                <span class="puzzle-stat-label">已放入</span>
                <span class="puzzle-stat-value">{{ placedCount }}</span>
              </div>
              <div class="puzzle-stat">
                <span class="puzzle-stat-label">总块数</span>
                <span class="puzzle-stat-value">{{ totalPieces }}</span>
              </div>
              <div class="puzzle-stat">
                <span class="puzzle-stat-label">状态</span>
                <span class="puzzle-stat-value">{{ solved ? "已完成" : "进行中" }}</span>
              </div>
            </div>

            <div
              class="drop-board"
              :style="{
                '--board-size': boardSize + 'px',
                '--tile-size': tileSize + 'px'
              }"
            >
              <div
                v-for="slot in slots"
                :key="slot.id"
                class="drop-slot"
                :class="{
                  filled: isSlotFilled(slot.id),
                  active: hoverSlot === slot.id
                }"
                @dragover.prevent="onSlotDragOver(slot.id)"
                @dragleave="onSlotDragLeave"
                @drop.prevent="onSlotDrop(slot.id)"
              >
                <template v-if="placedMap[slot.id]">
                 <!-- 左侧已放入拼块 -->
              <div
                class="placed-piece"
                :style="getPieceStyle(placedMap[slot.id])"
                draggable="true"
                @dragstart="onPieceDragStart(placedMap[slot.id], 'board', slot.id)"
              ></div>
                </template>

                <template v-else>
                  <div class="slot-guide">{{ slot.id }}</div>
                </template>
              </div>
            </div>

            <div class="puzzle-actions">
              <button class="panel-btn primary" @click="resetPuzzle">重新开始</button>
              <button class="panel-btn" @click="shufflePool">打乱右侧拼块</button>
              <button class="panel-btn" @click="openQuizPanel">去答题</button>
            </div>

            <transition name="fade-up">
              <div v-if="solved" class="puzzle-result">
                <div class="puzzle-result-icon">🎊</div>
                <div class="puzzle-result-title">拼图已还原</div>
                <div class="puzzle-result-desc">
                  你成功拼出了 {{ scenic.name }} 的完整画卷，现在可以继续挑战景点问答。
                </div>
              </div>
            </transition>
          </div>

          <!-- 右边：散落拼块 + 预览 -->
          <div class="puzzle-right">
            <div class="preview-card">
              <div class="preview-title">完整预览</div>
              <div class="preview-image" :style="previewStyle"></div>
              <div class="preview-tip">可对照右侧预览完成拼图</div>
            </div>

            <div class="pieces-card">
              <div class="preview-title">待放入拼块</div>

              <div
                class="pieces-pool"
                @dragover.prevent
                @drop.prevent="onPoolDrop"
              >
                <!-- 右侧拼块 -->
              <div
                v-for="piece in availablePieces"
                :key="piece.id"
                class="pool-piece"
                :style="getPieceStyle(piece)"
                draggable="true"
                @dragstart="onPieceDragStart(piece, 'pool', null)"
              ></div>
              </div>

              <div class="pool-tip">
                把拼图块拖到左边对应格子中；若想取出，拖回这里即可。
              </div>
            </div>

            <div class="tips-card">
              <div class="preview-title">玩法说明</div>
              <ul class="tips-list">
                <li>右侧拼图块可直接拖到左侧拼图框中。</li>
                <li>只有拖到正确位置时，拼图块才会吸附进去。</li>
                <li>已放入的拼块也可以拖回右侧重新调整。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 问答弹层 -->
    <transition name="fade-soft">
      <div v-if="showQuizPanel" class="quiz-overlay" @click.self="closeQuizPanel">
        <div class="quiz-modal">
          <button class="close-btn" @click="closeQuizPanel">×</button>

          <div class="quiz-head">
            <div class="quiz-kicker">趣味问答</div>
            <h2>{{ scenic.name }} · 小测验</h2>
            <p>答对题目后即可完成景点打卡</p>
          </div>

          <div v-if="!answered" class="quiz-body">
            <div class="question-box">
              {{ question }}
            </div>

            <div class="option-list">
              <button
                v-for="(opt, idx) in options"
                :key="idx"
                class="option-item"
                :class="{
                  correct: isCorrect && selectedIndex === idx,
                  wrong: showWrong && selectedIndex === idx
                }"
                @click="selectAnswer(idx)"
              >
                <span class="option-index">{{ String.fromCharCode(65 + idx) }}</span>
                <span class="option-label">{{ opt }}</span>
              </button>
            </div>
          </div>

          <div v-else class="quiz-result-wrap">
            <div v-if="isCorrect" class="result-card success">
              <div class="result-emoji">🎉</div>
              <div class="result-title">回答正确</div>
              <div class="result-desc">你已经掌握了这个景点的核心知识点。</div>

              <button
                v-if="!checkedIn"
                class="panel-btn primary large"
                @click="checkIn"
              >
                立即打卡
              </button>

              <button
                v-else
                class="panel-btn large"
                @click="closeQuizPanel"
              >
                关闭窗口
              </button>
            </div>

            <div v-else class="result-card fail">
              <div class="result-emoji">🌿</div>
              <div class="result-title">这次答错了</div>
              <div class="result-desc">可以回到正文再看看，也可以立即重新挑战。</div>
              <button class="panel-btn primary large" @click="retry">再试一次</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import customPuzzleImg from "@/assets/imgs/bg.webp";
const router = useRouter();
const route = useRoute();

const scenic = reactive({ name: "" });
const story = ref([]);
const question = ref("");
const options = ref([]);
const answer = ref(0);
const answered = ref(false);
const isCorrect = ref(false);
const checkedIn = ref(false);
const selectedIndex = ref(-1);
const showWrong = ref(false);
const isDemo = ref(route.query.demo === "true");
const showQuizPanel = ref(false);
const storySection = ref(null);
const puzzleSection = ref(null);

const boardSize = 360;
const boardCount = 3;
const totalPieces = 9;
const tileSize = boardSize / boardCount;

const slots = ref([]);
const availablePieces = ref([]);
const placedMap = reactive({});
const hoverSlot = ref(null);
const draggingPiece = ref(null);
const dragFrom = ref("pool");
const dragFromSlot = ref(null);
const solved = ref(false);

const scenicThemes = {
  庐山: {
    background:
      "linear-gradient(180deg, rgba(206,229,240,0.95) 0%, rgba(147,180,196,0.95) 36%, rgba(119,148,118,0.95) 68%, rgba(86,105,74,0.98) 100%)",
    overlay:
      "radial-gradient(circle at 30% 18%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 20%), linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 22%), linear-gradient(150deg, rgba(255,255,255,0) 62%, rgba(255,255,255,0.45) 62%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0) 71%), linear-gradient(90deg, rgba(255,255,255,0) 48%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.22) 53%, rgba(255,255,255,0) 56%)"
  },
  井冈山: {
    background:
      "linear-gradient(180deg, rgba(224,232,214,0.98) 0%, rgba(162,183,131,0.95) 32%, rgba(92,122,74,0.98) 72%, rgba(59,82,49,1) 100%)",
    overlay:
      "radial-gradient(circle at 70% 20%, rgba(255,238,190,0.85) 0%, rgba(255,238,190,0) 18%), linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 20%), linear-gradient(145deg, rgba(255,255,255,0) 56%, rgba(214,70,58,0.58) 56%, rgba(214,70,58,0.18) 68%, rgba(255,255,255,0) 69%)"
  },
  婺源: {
    background:
      "linear-gradient(180deg, rgba(214,236,246,0.98) 0%, rgba(198,223,202,0.95) 25%, rgba(235,213,104,0.98) 55%, rgba(151,128,67,1) 100%)",
    overlay:
      "radial-gradient(circle at 26% 18%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0) 18%), linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 19%), linear-gradient(90deg, rgba(66,66,66,0) 37%, rgba(66,66,66,0.85) 37%, rgba(66,66,66,0.85) 40%, rgba(255,255,255,0) 40%), linear-gradient(0deg, rgba(255,255,255,0) 53%, rgba(255,255,255,0.95) 53%, rgba(255,255,255,0.95) 70%, rgba(255,255,255,0) 70%)"
  }
};

const storyData = {
  1: {
    name: "庐山",
    story: [
      "匡庐奇秀，甲于天下。庐山襟江带湖，云雾缭绕，自古便是文人墨客流连驻足之地。山中峰峦层叠，四时景色各异，既有雄浑之势，也有清逸之美。",
      "相传李白游历庐山时，见香炉峰烟云升腾，瀑布从高处奔流直下，气势如银河倒挂，一时诗兴大发，写下流传千古的名篇。",
      "庐山不仅有壮阔自然景观，也承载着深厚的人文记忆。古往今来，众多名人曾在此讲学、隐居、题咏，使它成为自然与文化相互交织的经典名山。",
      "今天，当人们再次走近庐山，看到的不只是山水风景，更是一段段被诗词、历史与故事共同书写的江西记忆。"
    ],
    question: "李白描写庐山瀑布的名句是下面哪一句？",
    options: ["床前明月光", "飞流直下三千尺", "会当凌绝顶", "举杯邀明月"],
    answer: 1
  },
  2: {
    name: "井冈山",
    story: [
      "井冈山地处湘赣边界，群山起伏、地势险要，自古就是重要的山区通道。这里山高林密，既有壮美风光，也有厚重的历史意义。",
      "在中国革命历史中，井冈山有着非常特殊的位置。它见证了艰苦卓绝的探索过程，也留下了许多令人铭记的红色故事，因此被誉为中国革命的摇篮。",
      "井冈山精神所强调的坚定信念、艰苦奋斗与依靠群众，至今仍有重要的教育意义。许多人来到这里，不只是欣赏风景，也是在追寻历史的足迹。",
      "如今的井冈山，已经成为自然景观、红色文化与研学旅游相结合的重要目的地，吸引着越来越多的人前来了解它的故事。"
    ],
    question: "井冈山常被称为什么？",
    options: ["革命摇篮", "诗词之乡", "江南名楼", "千年瓷都"],
    answer: 0
  },
  3: {
    name: "婺源",
    story: [
      "婺源素有“中国最美乡村”之誉，这里山水秀润，村落古朴，白墙黛瓦与青山田野相映成趣，形成极具辨识度的乡村风貌。",
      "每到春季，大片油菜花次第盛开，金黄的花海铺展在山间田野，与徽派建筑共同构成一幅极具层次感的田园画卷。",
      "除了自然景色，婺源还保留了较多传统村落和民俗文化，让游客在观赏美景的同时，也能感受到地方生活的温度与历史传承。",
      "也正因为如此，婺源在江西旅游版图中一直拥有非常高的人气，是许多人向往的春日旅行地。"
    ],
    question: "婺源春季最具代表性的景观通常是什么？",
    options: ["雪山云海", "油菜花海", "大漠落日", "冰川湖泊"],
    answer: 1
  }
};

const currentDate = computed(() => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
});

const currentTheme = computed(() => scenicThemes[scenic.name] || scenicThemes["庐山"]);

const previewStyle = computed(() => ({
  backgroundImage: `url(${customPuzzleImg})`,
  backgroundSize: `${boardSize}px ${boardSize}px`,
  backgroundPosition: "0 0",
  backgroundRepeat: "no-repeat"
}));

const placedCount = computed(() => Object.keys(placedMap).length);

const createPieces = () => {
  const arr = [];
  for (let i = 1; i <= totalPieces; i++) {
    arr.push({ id: i });
  }
  return arr;
};

const createSlots = () => {
  const arr = [];
  for (let i = 1; i <= totalPieces; i++) {
    arr.push({ id: i });
  }
  return arr;
};

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const clearPlacedMap = () => {
  Object.keys(placedMap).forEach((key) => {
    delete placedMap[key];
  });
};

const resetPuzzle = () => {
  slots.value = createSlots();
  availablePieces.value = shuffleArray(createPieces());
  clearPlacedMap();
  draggingPiece.value = null;
  dragFrom.value = "pool";
  dragFromSlot.value = null;
  hoverSlot.value = null;
  solved.value = false;
};

const shufflePool = () => {
  availablePieces.value = shuffleArray(availablePieces.value);
};

const isSlotFilled = (slotId) => !!placedMap[slotId];

const onPieceDragStart = (piece, from, slotId = null) => {
  draggingPiece.value = piece;
  dragFrom.value = from;
  dragFromSlot.value = slotId;
};

const onSlotDragOver = (slotId) => {
  hoverSlot.value = slotId;
};

const onSlotDragLeave = () => {
  hoverSlot.value = null;
};

const removeFromPool = (pieceId) => {
  availablePieces.value = availablePieces.value.filter((item) => item.id !== pieceId);
};

const putBackToPool = (piece) => {
  if (!availablePieces.value.some((item) => item.id === piece.id)) {
    availablePieces.value.push(piece);
  }
};

const onSlotDrop = (slotId) => {
  hoverSlot.value = null;
  const piece = draggingPiece.value;
  if (!piece) return;

  // 只允许放到正确位置
  if (piece.id !== slotId) {
    draggingPiece.value = null;
    dragFrom.value = "pool";
    dragFromSlot.value = null;
    return;
  }

  // 目标位已经有了就不处理
  if (placedMap[slotId]) {
    draggingPiece.value = null;
    dragFrom.value = "pool";
    dragFromSlot.value = null;
    return;
  }

  if (dragFrom.value === "pool") {
    removeFromPool(piece.id);
    placedMap[slotId] = piece;
  } else if (dragFrom.value === "board") {
    const fromSlot = dragFromSlot.value;
    if (fromSlot && placedMap[fromSlot]) {
      delete placedMap[fromSlot];
    }
    placedMap[slotId] = piece;
  }

  checkSolved();

  draggingPiece.value = null;
  dragFrom.value = "pool";
  dragFromSlot.value = null;
};

const onPoolDrop = () => {
  const piece = draggingPiece.value;
  if (!piece) return;

  if (dragFrom.value === "board" && dragFromSlot.value) {
    delete placedMap[dragFromSlot.value];
    putBackToPool(piece);
  }

  draggingPiece.value = null;
  dragFrom.value = "pool";
  dragFromSlot.value = null;
  checkSolved();
};

const checkSolved = () => {
  solved.value = placedCount.value === totalPieces;
};

const getPieceStyle = (piece) => {
  const correctIndex = piece.id - 1;
  const bgX = (correctIndex % boardCount) * tileSize;
  const bgY = Math.floor(correctIndex / boardCount) * tileSize;

  return {
    backgroundImage: `url(${customPuzzleImg})`,
    backgroundSize: `${boardSize}px ${boardSize}px`,
    backgroundPosition: `-${bgX}px -${bgY}px`,
    backgroundRepeat: "no-repeat"
  };
};

const openQuizPanel = () => {
  showQuizPanel.value = true;
};

const closeQuizPanel = () => {
  showQuizPanel.value = false;
};

const scrollToStory = () => {
  storySection.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToPuzzle = () => {
  puzzleSection.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const selectAnswer = (idx) => {
  selectedIndex.value = idx;
  answered.value = true;
  isCorrect.value = idx === answer.value;

  if (!isCorrect.value) {
    showWrong.value = true;
    setTimeout(() => {
      showWrong.value = false;
    }, 1000);
  }
};

const retry = () => {
  answered.value = false;
  isCorrect.value = false;
  selectedIndex.value = -1;
  showWrong.value = false;
};

const checkIn = () => {
  if (isDemo.value) {
    alert("请先登录后再打卡哦～");
    router.push({
      path: "/login",
      query: { redirect: `/story?id=${route.query.id}` }
    });
    return;
  }

  const user = localStorage.getItem("user");
  if (!user) {
    alert("请先登录");
    router.push({
      path: "/login",
      query: { redirect: `/story?id=${route.query.id}` }
    });
    return;
  }

  const checkins = JSON.parse(localStorage.getItem("checkins") || "[]");
  const exists = checkins.some((item) => item.name === scenic.name);

  if (exists) {
    alert("你已经打卡过这个景点啦！");
    checkedIn.value = true;
    showQuizPanel.value = false;
    return;
  }

  checkins.push({
    id: Date.now(),
    name: scenic.name,
    scenicId: route.query.id,
    date: currentDate.value
  });

  localStorage.setItem("checkins", JSON.stringify(checkins));
  checkedIn.value = true;
  showQuizPanel.value = false;
};

const goBack = () => {
  router.back();
};

const goUserCenter = () => {
  router.push("/user");
};

const goHome = () => {
  router.push("/");
};

onMounted(async () => {
  const id = Number(route.query.id);
  const data = storyData[id] || storyData[1];

  scenic.name = data.name;
  story.value = data.story;
  question.value = data.question;
  options.value = data.options;
  answer.value = data.answer;

  const checkins = JSON.parse(localStorage.getItem("checkins") || "[]");
  checkedIn.value = checkins.some((item) => item.name === scenic.name);

  await nextTick();
  resetPuzzle();
});
</script>

<style scoped>
.story-page {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: #f5ede0;
  color: #4f3a22;
}

.ink-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 20% 25%, rgba(173, 142, 96, 0.12) 0%, transparent 34%),
    radial-gradient(circle at 80% 70%, rgba(130, 107, 70, 0.08) 0%, transparent 32%),
    linear-gradient(180deg, rgba(255, 251, 244, 0.38) 0%, rgba(245, 237, 224, 0.85) 100%);
  z-index: 0;
  pointer-events: none;
}

.ink-wash {
  position: fixed;
  border-radius: 50%;
  filter: blur(24px);
  pointer-events: none;
  z-index: 0;
}

.ink-1 {
  width: 240px;
  height: 240px;
  left: -40px;
  top: 120px;
  background: rgba(120, 94, 62, 0.08);
}

.ink-2 {
  width: 300px;
  height: 300px;
  right: -80px;
  bottom: 120px;
  background: rgba(172, 139, 92, 0.08);
}

.bamboo {
  position: fixed;
  width: 80px;
  height: 220px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"><path fill="rgba(100,120,80,0.15)" d="M50,10 L55,40 L52,45 L48,45 L45,40 L50,10 Z M48,45 L52,45 L55,80 L52,85 L48,85 L45,80 L48,45 Z M48,85 L52,85 L55,120 L52,125 L48,125 L45,120 L48,85 Z M48,125 L52,125 L55,160 L52,165 L48,165 L45,160 L48,125 Z"/></svg>') repeat-y;
  background-size: 100% auto;
  pointer-events: none;
  z-index: 0;
}

.bamboo-1 {
  left: 16px;
  top: 110px;
  height: 380px;
  opacity: 0.34;
  transform: rotate(-5deg);
}

.bamboo-2 {
  right: 18px;
  bottom: 90px;
  height: 340px;
  opacity: 0.34;
  transform: rotate(6deg) scaleX(-1);
}

.story-shell {
  position: relative;
  z-index: 2;
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 88px 0 52px;
}

.floating-entry-group {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 30;
}

.entry-btn {
  border: 1px solid rgba(176, 143, 97, 0.5);
  border-radius: 999px;
  padding: 10px 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #8b6b42;
  background: rgba(248, 241, 228, 0.72);
  backdrop-filter: blur(4px);
  box-shadow: 0 8px 24px rgba(113, 87, 53, 0.08);
  transition: all 0.28s ease;
  font-family: "STKaiti", "KaiTi", serif;
}

.entry-btn:hover {
  transform: translateY(-2px);
  background: rgba(240, 228, 203, 0.92);
}

.entry-icon {
  font-size: 15px;
}

.hero-card,
.paper-card,
.quiz-modal {
  position: relative;
  background: rgba(255, 250, 241, 0.8);
  border: 1px solid rgba(193, 161, 115, 0.3);
  box-shadow: 0 16px 40px rgba(117, 92, 58, 0.08);
}

.hero-card {
  overflow: hidden;
  border-radius: 30px;
  padding: 40px;
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 28px;
  margin-bottom: 28px;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 86% 24%, rgba(201, 175, 137, 0.15) 0%, transparent 18%),
    linear-gradient(135deg, rgba(176, 147, 106, 0.05) 0%, transparent 42%);
  pointer-events: none;
}

.hero-left,
.hero-right {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(171, 138, 88, 0.12);
  color: #8f6a3d;
  font-size: 13px;
  margin-bottom: 16px;
  border: 1px solid rgba(176, 143, 97, 0.18);
}

.hero-title {
  margin: 0;
  font-size: clamp(36px, 5vw, 58px);
  line-height: 1.08;
  letter-spacing: 2px;
  color: #5f4324;
  font-family: "STKaiti", "KaiTi", serif;
}

.hero-divider {
  width: 92px;
  height: 3px;
  margin: 18px 0 16px;
  border-radius: 999px;
  background: linear-gradient(90deg, #b08f61, rgba(176, 143, 97, 0.1));
}

.hero-desc {
  margin: 0;
  max-width: 620px;
  font-size: 16px;
  line-height: 2;
  color: #6d5434;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.primary-btn,
.secondary-btn,
.panel-btn,
.text-btn,
.close-btn,
.option-item {
  transition: all 0.25s ease;
}

.primary-btn,
.panel-btn.primary {
  border: none;
  border-radius: 16px;
  padding: 14px 22px;
  background: linear-gradient(135deg, #b38b56, #8b6a40);
  color: #fffaf2;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(139, 106, 64, 0.18);
}

.secondary-btn,
.panel-btn,
.text-btn {
  border-radius: 16px;
  padding: 14px 22px;
  cursor: pointer;
  font-size: 15px;
  color: #7c5d36;
  border: 1px solid rgba(176, 143, 97, 0.28);
  background: rgba(255, 247, 235, 0.86);
}

.primary-btn:hover,
.secondary-btn:hover,
.panel-btn:hover,
.text-btn:hover,
.option-item:hover,
.close-btn:hover {
  transform: translateY(-2px);
}

.hero-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 22px;
}

.seal-orb {
  position: relative;
  width: 176px;
  height: 176px;
  display: grid;
  place-items: center;
}

.seal-outer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(158, 52, 40, 0.34);
  box-shadow: inset 0 0 0 10px rgba(158, 52, 40, 0.06);
}

.seal-outer::before,
.seal-outer::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 12px;
  border: 1px dashed rgba(158, 52, 40, 0.22);
}

.seal-outer::after {
  inset: 28px;
  border-style: solid;
  border-color: rgba(176, 143, 97, 0.3);
}

.seal-core {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 30% 30%, #b64f44 0%, #8f392e 78%);
  color: #fff8ef;
  font-size: 30px;
  letter-spacing: 4px;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(143, 57, 46, 0.22);
  font-family: "STKaiti", "KaiTi", serif;
}

.hero-meta {
  width: 100%;
  max-width: 290px;
  display: grid;
  gap: 12px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(248, 240, 225, 0.82);
  border: 1px solid rgba(176, 143, 97, 0.16);
}

.meta-label,
.status-title,
.mini-label,
.quiz-head p,
.quiz-kicker,
.section-topline,
.puzzle-stat-label,
.preview-tip,
.pool-tip {
  color: #9a7a4f;
}

.meta-value {
  color: #5f4324;
  font-weight: 600;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.82fr);
  gap: 24px;
  align-items: start;
}

.paper-card {
  border-radius: 28px;
  padding: 28px;
}

.story-card {
  background:
    linear-gradient(180deg, rgba(255, 252, 246, 0.95) 0%, rgba(249, 241, 227, 0.92) 100%);
}

.section-topline {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  margin-bottom: 18px;
}

.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b08f61, #8f392e);
}

.story-content {
  display: grid;
  gap: 18px;
}

.story-paragraph {
  margin: 0;
  font-size: 16px;
  line-height: 2.15;
  color: #5f4a31;
  text-indent: 2em;
}

.story-bottom-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.text-btn.highlight {
  background: rgba(176, 143, 97, 0.12);
  border-color: rgba(176, 143, 97, 0.34);
  color: #8b6332;
}

.side-panel {
  display: grid;
  gap: 20px;
  position: sticky;
  top: 88px;
}

.status-card,
.success-card,
.puzzle-wrap {
  background: rgba(255, 249, 238, 0.86);
}

.status-block {
  padding: 18px 18px 20px;
  border-radius: 22px;
  background: rgba(250, 242, 228, 0.92);
  border: 1px solid rgba(176, 143, 97, 0.14);
  margin-bottom: 16px;
}

.status-block.compact {
  display: grid;
  gap: 12px;
}

.status-name {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #5f4324;
  font-family: "STKaiti", "KaiTi", serif;
}

.mini-stat {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.mini-value {
  color: #5f4324;
  font-weight: 600;
}

.success-text {
  color: #8a2f25;
}

.cta-group {
  display: grid;
  gap: 12px;
}

.success-card {
  text-align: center;
}

.success-icon {
  font-size: 42px;
}

.success-title {
  margin-top: 10px;
  font-size: 24px;
  color: #704c22;
  font-weight: 700;
}

.success-subtitle,
.success-date,
.result-desc {
  margin-top: 8px;
  color: #7a613f;
  line-height: 1.8;
}

.puzzle-wrap {
  margin-top: 28px;
}

.puzzle-grid-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.86fr);
  gap: 24px;
  align-items: start;
}

.puzzle-intro h3,
.preview-title {
  margin: 0 0 10px;
  color: #624624;
  font-family: "STKaiti", "KaiTi", serif;
}

.puzzle-intro p {
  margin: 0;
  line-height: 1.9;
  color: #6d5434;
}

.puzzle-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.puzzle-stat {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(248, 240, 225, 0.82);
  border: 1px solid rgba(176, 143, 97, 0.16);
  display: grid;
  gap: 6px;
}

.puzzle-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #5f4324;
}

.drop-board {
  width: var(--board-size);
  height: var(--board-size);
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* gap: 8px; */
  padding: 10px;
  border-radius: 8px;
  background: rgba(232, 219, 195, 0.9);
  border: 1px solid rgba(176, 143, 97, 0.22);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4);
}

.drop-slot {
  position: relative;
  border-radius: 8px;
  background: rgba(255, 247, 235, 0.55);
  border: 1px dashed rgba(176, 143, 97, 0.35);
  overflow: hidden;
  aspect-ratio: 1 / 1;
  transition: all 0.2s ease;
}

.drop-slot.active {
  transform: scale(1.02);
  border-color: rgba(139, 106, 64, 0.7);
  background: rgba(255, 247, 235, 0.8);
}

.drop-slot.filled {
  border-style: solid;
  background: rgba(255, 247, 235, 0.96);
}

.slot-guide {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 20px;
  color: rgba(139, 107, 66, 0.35);
  font-weight: 700;
}

.placed-piece,
.pool-piece {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  box-shadow: 0 8px 18px rgba(117, 92, 58, 0.12);
  border: 1px solid rgba(255,255,255,0.5);
}

.placed-piece:active,
.pool-piece:active {
  cursor: grabbing;
}

.tile-label {
  position: absolute;
  left: 10px;
  top: 10px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 250, 241, 0.85);
  color: #7d5d38;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(117, 92, 58, 0.12);
}

.puzzle-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.puzzle-result {
  margin-top: 20px;
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(248, 240, 225, 0.82);
  border: 1px solid rgba(176, 143, 97, 0.18);
  text-align: center;
}

.puzzle-result-icon {
  font-size: 38px;
}

.puzzle-result-title {
  margin-top: 8px;
  font-size: 24px;
  color: #624624;
  font-weight: 700;
}

.puzzle-result-desc {
  margin-top: 8px;
  color: #7a613f;
  line-height: 1.8;
}

.preview-card,
.tips-card,
.pieces-card {
  padding: 18px;
  border-radius: 18px;
  background: rgba(250, 242, 228, 0.92);
  border: 1px solid rgba(176, 143, 97, 0.14);
}
.preview-card{
  padding-left: 38px;
}
.preview-image {
  width: 360px;
  height: 360px;
  max-width: 100%;
  margin-top: 12px;
  border-radius: 10px;
  border: 1px solid rgba(176, 143, 97, 0.18);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.42);
  background-repeat: no-repeat;
  background-color: #f3e7d2;
}

.preview-tip {
  margin-top: 10px;
  font-size: 13px;
}

.pieces-card {
  margin-top: 18px;
}

.pieces-pool {
  margin-top: 12px;
  min-height: 240px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 248, 236, 0.75);
  border: 1px dashed rgba(176, 143, 97, 0.28);
}

.pool-tip {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.8;
}

.tips-card {
  margin-top: 18px;
}

.tips-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: #6d5434;
  line-height: 1.9;
}

.quiz-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(54, 40, 21, 0.28);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.quiz-modal {
  width: min(760px, 100%);
  border-radius: 30px;
  padding: 32px;
  background: rgba(255, 250, 241, 0.96);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(176, 143, 97, 0.22);
  border-radius: 50%;
  background: rgba(249, 242, 229, 0.92);
  color: #7f5f37;
  font-size: 24px;
  cursor: pointer;
}

.quiz-head h2 {
  margin: 10px 0 8px;
  font-size: 32px;
  color: #624624;
  font-family: "STKaiti", "KaiTi", serif;
}

.question-box {
  margin-top: 24px;
  padding: 22px 24px;
  border-radius: 22px;
  background: rgba(248, 240, 225, 0.88);
  border: 1px solid rgba(176, 143, 97, 0.16);
  font-size: 20px;
  line-height: 1.9;
  color: #5f4324;
}

.option-list {
  display: grid;
  gap: 14px;
  margin-top: 22px;
}

.option-item {
  width: 100%;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(176, 143, 97, 0.16);
  background: rgba(255, 248, 236, 0.94);
  color: #5f4324;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}

.option-item:hover {
  border-color: rgba(176, 143, 97, 0.42);
  background: rgba(251, 243, 228, 1);
}

.option-index {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: rgba(176, 143, 97, 0.18);
  color: #7e5f38;
  flex-shrink: 0;
  font-weight: 700;
}

.option-item.correct {
  background: rgba(184, 95, 80, 0.1);
  border-color: rgba(143, 57, 46, 0.34);
}

.option-item.wrong {
  background: rgba(140, 96, 52, 0.1);
  border-color: rgba(176, 143, 97, 0.36);
}

.quiz-result-wrap {
  margin-top: 22px;
}

.result-card {
  text-align: center;
  padding: 20px 0 8px;
}

.result-emoji {
  font-size: 54px;
}

.result-title {
  margin-top: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #624624;
}

.panel-btn.large {
  margin-top: 22px;
  padding-left: 28px;
  padding-right: 28px;
}

.fade-soft-enter-active,
.fade-soft-leave-active,
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.28s ease;
}

.fade-soft-enter-from,
.fade-soft-leave-to,
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 960px) {
  .story-shell {
    width: min(100% - 24px, 1180px);
    padding-top: 90px;
  }

  .hero-card,
  .main-grid,
  .puzzle-grid-layout {
    grid-template-columns: 1fr;
  }

  .hero-card {
    padding: 28px;
  }

  .side-panel {
    position: static;
  }

  .drop-board {
    width: min(100%, 360px);
  }
}

@media (max-width: 640px) {
  .floating-entry-group {
    top: 14px;
    left: 12px;
  }

  .entry-btn {
    padding: 9px 14px;
    font-size: 13px;
  }

  .story-shell {
    padding-top: 78px;
    padding-bottom: 28px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-desc,
  .story-paragraph,
  .question-box,
  .puzzle-intro p,
  .tips-list {
    font-size: 15px;
  }

  .paper-card,
  .quiz-modal {
    padding: 20px;
    border-radius: 22px;
  }

  .status-name,
  .quiz-head h2,
  .puzzle-result-title {
    font-size: 24px;
  }

  .hero-actions,
  .story-bottom-bar,
  .puzzle-actions {
    flex-direction: column;
  }

  .puzzle-stats {
    grid-template-columns: 1fr;
  }

  .pieces-pool {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
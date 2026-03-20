<template>
  <div class="story-page" :class="{ 'quiz-open-mode': showQuizPanel }">
    <!-- 水墨背景 -->
    <div class="ink-bg"></div>

    <!-- 宣纸纹理 -->
    <div class="paper-texture"></div>

    <!-- 书卷装饰 -->
    <div class="scroll-decoration left"></div>
    <div class="scroll-decoration right"></div>

    <!-- 打开答题时的柔和遮罩 -->
    <transition name="fade-soft">
      <div
        v-if="showQuizPanel"
        class="page-mask"
        @click="closeQuizPanel"
      ></div>
    </transition>

    <div class="story-layout" :class="{ expanded: showQuizPanel }">
      <!-- 左侧内容 -->
      <div class="content">
        <!-- 古风返回按钮 -->
        <button class="back-btn" @click="goBack">
          <span class="back-icon">⌂</span>
          <span>归园</span>
        </button>

        <!-- 书卷标题区 -->
        <div class="title-scroll">
          <div class="scroll-top">
            <span class="scroll-rod"></span>
            <span class="scroll-rod"></span>
          </div>
          <div class="title-content">
            <h1 class="scenic-name">{{ scenic.name }}</h1>
            <div class="title-seal"></div>
            <p class="subtitle">· 山川故事 ·</p>
          </div>
          <div class="scroll-bottom"></div>
        </div>

        <!-- 故事卷轴 -->
        <div class="story-scroll">
          <div class="story-inner">
            <div class="story-header">
              <span class="story-mark">✦ 记 ✦</span>
            </div>
            <div class="story-text">
              <p v-for="(p, idx) in story" :key="idx" class="story-paragraph">
                {{ p }}
              </p>
            </div>
            <div class="story-footer">
              <span class="story-seal">● 录于斯卷</span>
            </div>
          </div>
        </div>

        <!-- 打开答题按钮 -->
        <div class="open-quiz-wrap">
          <button class="open-quiz-btn" @click="openQuizPanel">
            <span class="open-quiz-icon">{{ checkedIn ? "📘" : "🖋️" }}</span>
            <span>{{ checkedIn ? "再 试 一 题" : "开 卷 答 题" }}</span>
          </button>
        </div>

        <!-- 打卡成功 - 题名金榜 -->
        <transition name="fade-up">
          <div v-if="checkedIn && !showQuizPanel" class="success-pavilion">
            <div class="success-scroll">
              <div class="scroll-header">
                <span class="header-left">✧</span>
                <span class="header-title">题 名 金 榜</span>
                <span class="header-right">✧</span>
              </div>
              <div class="success-body">
                <div class="success-icon">🏆</div>
                <div class="success-name">{{ scenic.name }}</div>
                <div class="success-poem">「 江山留胜迹，我辈复登临 」</div>
                <div class="success-date">{{ currentDate }}</div>
                <div class="success-seal">
                  <span class="seal-mark">遊</span>
                  <span class="seal-mark">歷</span>
                </div>
                <div class="btn-group">
                  <button class="btn-view" @click="goUserCenter">
                    <span>📜</span> 观游历簿
                  </button>
                  <button class="btn-continue" @click="goHome">
                    <span>🏮</span> 续游山水
                  </button>
                </div>
              </div>
              <div class="scroll-footer"></div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 右侧答题卡 -->
      <transition name="quiz-card">
        <div v-if="showQuizPanel" class="quiz-side-panel">
          <button class="close-quiz-btn" @click="closeQuizPanel">×</button>

          <div class="quiz-pavilion">
            <div class="pavilion-roof">
              <span class="roof-ornament">◈</span>
              <span class="roof-title">问 贤 台</span>
              <span class="roof-ornament">◈</span>
            </div>

            <div class="quiz-body" v-if="!answered">
              <div class="question-card">
                <div class="question-mark">❝</div>
                <p class="question-text">{{ question }}</p>
                <div class="question-mark right">❞</div>
              </div>

              <div class="options-grid">
                <button
                  v-for="(opt, idx) in options"
                  :key="idx"
                  class="option-bamboo"
                  :class="{
                    correct: isCorrect && selectedIndex === idx,
                    wrong: showWrong && selectedIndex === idx
                  }"
                  @click="selectAnswer(idx)"
                >
                  <span class="option-letter">{{ String.fromCharCode(65 + idx) }}</span>
                  <span class="option-text">{{ opt }}</span>
                </button>
              </div>
            </div>

            <div v-else class="quiz-result">
              <div v-if="isCorrect" class="result-success">
                <div class="result-ornament">✧</div>
                <div class="result-icon">🏮</div>
                <div class="result-title">妙哉！</div>
                <div class="result-desc">君之见识，令人钦佩</div>
                <div class="result-seal">✓ 得 印</div>
              </div>

              <div v-else class="result-fail">
                <div class="result-icon">🍃</div>
                <div class="result-title">再思之</div>
                <div class="result-desc">且回卷中寻觅答案</div>
                <button class="retry-btn" @click="retry">
                  <span>重 试</span>
                </button>
              </div>
            </div>

            <!-- 落印按钮 -->
            <button
              v-if="isCorrect && !checkedIn"
              class="stamp-btn"
              @click="checkIn"
            >
              <span class="stamp-icon">🖌️</span>
              <span class="stamp-text">落印留痕</span>
              <span class="stamp-seal"></span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

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

const currentDate = computed(() => {
  const lunar = [
    "正月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "冬月", "腊月"
  ];
  const date = new Date();
  return `${lunar[date.getMonth()]}${date.getDate()}日`;
});

const storyData = {
  1: {
    name: "庐山",
    story: [
      "匡庐奇秀，甲于天下。此山襟江带湖，云雾缭绕，自古为文人墨客所钟。",
      "唐开元年间，太白居士李青莲游至此地，见香炉峰瀑布如银河倾泻，",
      "遂题下『日照香炉生紫烟，遥看瀑布挂前川』之句。",
      "飞流直下三千尺，疑是银河落九天，千古传诵，至今不绝。"
    ],
    question: "太白居士题庐山瀑布之名句为何？",
    options: ["床前明月光", "飞流直下三千尺", "举头望明月", "大江东去浪淘尽"],
    answer: 1
  },
  2: {
    name: "井冈山",
    story: [
      "井冈巍巍，赣水苍茫。此地为湘赣之交，峰峦叠嶂，地势险要。",
      "丁卯年秋，毛公率秋收义军至此，辟根据地于罗霄山脉，",
      "星星之火，遂成燎原之势。后人谓之为『中国革命的摇篮』，",
      "红色精神，代代相传，光照千秋。"
    ],
    question: "世人如何称颂井冈山？",
    options: ["革命摇篮", "文化圣地", "旅游胜地", "英雄之城"],
    answer: 0
  },
  3: {
    name: "婺源",
    story: [
      "婺源者，古徽州之属邑也。此地山川秀美，文风鼎盛，",
      "白墙黛瓦，马头高耸，乃徽派建筑之精粹。",
      "每岁春深，油菜花开，漫山遍野，金黄如海，",
      "与粉墙黛瓦相映成趣，故有『中国最美乡村』之誉。"
    ],
    question: "婺源春日最负盛名之景为何？",
    options: ["雪山", "沙漠", "油菜花", "草原"],
    answer: 2
  }
};

const openQuizPanel = () => {
  showQuizPanel.value = true;
};

const closeQuizPanel = () => {
  showQuizPanel.value = false;
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
    alert("请先登录后再落印留痕～");
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

  let checkins = JSON.parse(localStorage.getItem("checkins") || "[]");

  const exists = checkins.some(item => item.name === scenic.name);
  if (exists) {
    alert("君已留印于此！");
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

onMounted(() => {
  const id = Number(route.query.id);
  const data = storyData[id] || storyData[1];

  scenic.name = data.name;
  story.value = data.story;
  question.value = data.question;
  options.value = data.options;
  answer.value = data.answer;

  const checkins = JSON.parse(localStorage.getItem("checkins") || "[]");
  const hasChecked = checkins.some(item => item.name === scenic.name);
  if (hasChecked) {
    checkedIn.value = true;
  }
});
</script>

<style scoped>
.story-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: #efe5d4;
  overflow-x: hidden;
}

/* 水墨背景 */
.ink-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(140, 110, 70, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(100, 75, 45, 0.08) 0%, transparent 50%);
  background-color: #e8ddcd;
  z-index: 0;
}

/* 宣纸纹理 */
.paper-texture {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="none" stroke="rgba(100,70,40,0.08)" stroke-width="0.5" d="M20 30 L180 30 M20 50 L180 50 M20 70 L180 70 M20 90 L180 90 M20 110 L180 110 M20 130 L180 130 M20 150 L180 150 M20 170 L180 170 M40 10 L40 190 M60 10 L60 190 M80 10 L80 190 M100 10 L100 190 M120 10 L120 190 M140 10 L140 190 M160 10 L160 190"/></svg>');
  background-repeat: repeat;
  background-size: 40px 40px;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

/* 书卷装饰 */
.scroll-decoration {
  position: fixed;
  top: 0;
  width: 40px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.scroll-decoration.left {
  left: 0;
  background: linear-gradient(90deg, rgba(140, 100, 60, 0.15), transparent);
}

.scroll-decoration.right {
  right: 0;
  background: linear-gradient(270deg, rgba(140, 100, 60, 0.15), transparent);
}

/* 页面整体布局：始终视觉居中 */
.story-layout {
  position: relative;
  z-index: 3;
  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 28px 60px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 0;
  transition: all 0.45s ease;
}

/* 打开答题后，左边卷轴略缩，右侧答题卡出现 */
.story-layout.expanded {
  gap: 32px;
  justify-content: center;
}

/* 左侧主内容 */
.content {
  width: 100%;
  max-width: 820px;
  transition: all 0.45s ease;
  position: relative;
  z-index: 3;
}

.story-layout.expanded .content {
  max-width: 760px;
  transform: translateX(-8px);
}

/* 柔和遮罩 */
.page-mask {
  position: fixed;
  inset: 0;
  background: rgba(40, 28, 18, 0.14);
  backdrop-filter: blur(2px);
  z-index: 2;
}

/* 返回按钮 */
.back-btn {
  background: rgba(140, 100, 60, 0.12);
  border: 1px solid rgba(140, 100, 60, 0.35);
  padding: 7px 18px;
  border-radius: 30px;
  color: #7a6230;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "STKaiti", "KaiTi", serif;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(140, 100, 60, 0.22);
  transform: translateX(-2px);
}

/* 书卷标题 */
.title-scroll {
  background: #fffef5;
  border-radius: 14px 14px 8px 8px;
  margin-bottom: 32px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
  border: 1px solid #e6d7b7;
  overflow: hidden;
}

.scroll-top {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 10px 0 6px;
}

.scroll-rod {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #c9aa5f;
  box-shadow: 0 0 0 2px #f5e6c8;
}

.title-content {
  text-align: center;
  padding: 10px 20px 20px;
  position: relative;
}

.scenic-name {
  font-size: 38px;
  font-weight: 400;
  color: #6b4a25;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  letter-spacing: 8px;
  margin: 0 0 12px;
}

.title-seal {
  width: 38px;
  height: 38px;
  margin: 0 auto 12px;
  background: radial-gradient(circle, rgba(200, 100, 70, 0.35), rgba(160, 70, 50, 0.16));
  border-radius: 50%;
  opacity: 0.9;
}

.subtitle {
  font-size: 12px;
  color: #b89a6a;
  letter-spacing: 3px;
}

.scroll-bottom {
  height: 10px;
  background: linear-gradient(180deg, #e6d4ad, #d4bf94);
  border-top: 1px solid #ccb78a;
}

/* 故事卷轴 */
.story-scroll {
  background: rgba(255, 251, 243, 0.95);
  border-radius: 10px;
  margin-bottom: 24px;
  border: 1px solid #ecdba8;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.story-inner {
  padding: 24px 28px;
}

.story-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #d4bc84;
}

.story-mark {
  font-size: 14px;
  color: #b87c4a;
  letter-spacing: 4px;
}

.story-text {
  font-family: "STKaiti", "KaiTi", serif;
}

.story-paragraph {
  line-height: 1.95;
  margin-bottom: 20px;
  font-size: 17px;
  color: #4a3a28;
  text-indent: 2em;
  letter-spacing: 0.5px;
}

.story-paragraph:last-child {
  margin-bottom: 0;
}

.story-footer {
  text-align: right;
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px dashed #d4bc84;
}

.story-seal {
  font-size: 11px;
  color: #b89a6a;
  letter-spacing: 1px;
}

/* 答题按钮区域 */
.open-quiz-wrap {
  display: flex;
  justify-content: center;
  margin: 18px 0 10px;
}

.open-quiz-btn {
  background: linear-gradient(135deg, #d4b15c, #c59a42);
  border: none;
  border-radius: 999px;
  padding: 14px 32px;
  color: #2f2417;
  font-size: 16px;
  font-family: "STKaiti", "KaiTi", serif;
  letter-spacing: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 26px rgba(166, 129, 57, 0.22);
  transition: all 0.28s ease;
}

.open-quiz-btn:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 14px 32px rgba(166, 129, 57, 0.28);
  background: linear-gradient(135deg, #dfbe70, #cea54d);
}

.open-quiz-icon {
  font-size: 18px;
}

/* 右侧答题卡：像一张悬浮卷轴 */
.quiz-side-panel {
  width: 420px;
  flex: 0 0 420px;
  position: sticky;
  top: 70px;
  z-index: 4;
  animation: floatInRight 0.35s ease;
}

/* 关闭按钮 */
.close-quiz-btn {
  position: absolute;
  top: -14px;
  right: -14px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #5f4730, #493623);
  color: #f3dfae;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  transition: all 0.25s ease;
  z-index: 6;
}

.close-quiz-btn:hover {
  transform: rotate(90deg) scale(1.05);
  background: linear-gradient(135deg, #745539, #5a412c);
}

/* 答题卡主体 */
.quiz-pavilion {
  width: 100%;
  background: linear-gradient(180deg, rgba(76, 60, 46, 0.96), rgba(92, 74, 58, 0.96));
  border: 1px solid rgba(212, 184, 122, 0.45);
  border-radius: 26px;
  overflow: hidden;
  box-shadow:
    0 24px 50px rgba(70, 46, 20, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
}

/* 顶部 */
.pavilion-roof {
  background: linear-gradient(90deg, #6b4a25, #4f341b, #6b4a25);
  padding: 16px 18px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  border-bottom: 1px solid rgba(212, 184, 122, 0.18);
}

.roof-title {
  font-size: 18px;
  color: #ecdba8;
  font-family: "STKaiti", serif;
  letter-spacing: 6px;
}

.roof-ornament {
  color: #d6b05d;
  font-size: 13px;
}

/* 答题主体 */
.quiz-body,
.quiz-result {
  padding: 28px 26px 26px;
}

/* 题目卡 */
.question-card {
  background: rgba(255, 248, 235, 0.06);
  border: 1px solid rgba(212, 184, 122, 0.2);
  border-radius: 18px;
  padding: 24px 20px;
  margin-bottom: 22px;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.question-mark {
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 24px;
  color: rgba(212, 184, 122, 0.45);
}

.question-mark.right {
  top: auto;
  bottom: 8px;
  left: auto;
  right: 12px;
}

.question-text {
  margin: 0;
  text-align: center;
  color: #f2e2c0;
  font-size: 18px;
  line-height: 1.75;
  font-family: "STKaiti", serif;
}

/* 选项 */
.options-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-bamboo {
  width: 100%;
  background: rgba(255, 248, 235, 0.05);
  border: 1px solid rgba(212, 184, 122, 0.24);
  border-radius: 16px;
  padding: 14px 16px;
  color: #f0e0bc;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.22s ease;
  font-family: "STKaiti", serif;
  text-align: left;
}

.option-bamboo:hover {
  background: rgba(212, 184, 122, 0.1);
  border-color: rgba(212, 184, 122, 0.55);
  transform: translateY(-1px);
}

.option-letter {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(212, 184, 122, 0.14);
  color: #d8b86e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.option-bamboo.correct {
  background: rgba(94, 160, 105, 0.24);
  border-color: rgba(121, 190, 132, 0.75);
}

.option-bamboo.wrong {
  background: rgba(190, 88, 73, 0.2);
  border-color: rgba(217, 108, 92, 0.7);
}

/* 结果区 */
.result-success,
.result-fail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 10px 0 4px;
}

.result-ornament {
  color: #d6b05d;
  font-size: 18px;
}

.result-icon {
  font-size: 44px;
}

.result-title {
  font-size: 30px;
  color: #ecdba8;
  font-family: "STKaiti", serif;
  letter-spacing: 4px;
}

.result-desc {
  font-size: 14px;
  color: #ccb184;
}

.result-seal {
  margin-top: 4px;
  border: 1px solid rgba(212, 184, 122, 0.7);
  color: #e2c77f;
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 13px;
  background: rgba(212, 184, 122, 0.08);
}

.retry-btn {
  margin-top: 12px;
  background: transparent;
  border: 1px solid rgba(212, 184, 122, 0.7);
  color: #e2c77f;
  border-radius: 999px;
  padding: 8px 24px;
  cursor: pointer;
  font-family: "STKaiti", serif;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(212, 184, 122, 0.12);
}

/* 落印按钮 */
.stamp-btn {
  width: calc(100% - 52px);
  margin: 0 26px 26px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #d8b767, #c39743);
  border: none;
  border-radius: 999px;
  color: #2c2216;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: "STKaiti", serif;
  box-shadow: 0 12px 26px rgba(166, 129, 57, 0.24);
  transition: all 0.25s ease;
}

.stamp-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(166, 129, 57, 0.3);
}

.stamp-icon {
  font-size: 18px;
}

.stamp-text {
  letter-spacing: 3px;
}

.stamp-seal {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(200, 80, 60, 0.45);
}

/* 题名金榜 */
.success-pavilion {
  margin-top: 22px;
}

.success-scroll {
  background: linear-gradient(135deg, rgba(84, 60, 31, 0.95), rgba(62, 47, 33, 0.96));
  border-radius: 24px;
  border: 1px solid rgba(201, 170, 95, 0.5);
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.scroll-header {
  background: linear-gradient(135deg, #6a4a24, #4e341a);
  padding: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.header-left,
.header-right {
  color: #d2af5a;
  font-size: 14px;
}

.header-title {
  font-size: 18px;
  color: #ecdba8;
  font-family: "STKaiti", serif;
  letter-spacing: 6px;
}

.success-body {
  text-align: center;
  padding: 32px 24px;
}

.success-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.success-name {
  font-size: 28px;
  color: #ecdba8;
  font-family: "STKaiti", serif;
  letter-spacing: 4px;
  margin-bottom: 16px;
}

.success-poem {
  font-size: 13px;
  color: #c7ab78;
  font-style: italic;
  margin-bottom: 16px;
  padding: 8px 16px;
  border-top: 1px dashed rgba(200, 170, 100, 0.3);
  border-bottom: 1px dashed rgba(200, 170, 100, 0.3);
  display: inline-block;
}

.success-date {
  font-size: 12px;
  color: #b19a71;
  margin-bottom: 20px;
}

.success-seal {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 28px;
}

.seal-mark {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 100, 70, 0.6), rgba(160, 70, 50, 0.3));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #f1d8c9;
  font-family: "STKaiti", serif;
  transform: rotate(-8deg);
}

.btn-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-view,
.btn-continue {
  padding: 10px 24px;
  border-radius: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "STKaiti", serif;
}

.btn-view {
  background: #d0ac55;
  border: none;
  color: #2a2418;
}

.btn-view:hover {
  background: #e0bc74;
  transform: translateY(-2px);
}

.btn-continue {
  background: transparent;
  border: 1px solid #c9aa5f;
  color: #d6bb7b;
}

.btn-continue:hover {
  background: rgba(200, 170, 100, 0.15);
  transform: translateY(-2px);
}

.scroll-footer {
  height: 12px;
  background: linear-gradient(180deg, #5d4a2e, #3a2a1c);
}

/* 动画 */
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
}

.quiz-card-enter-active,
.quiz-card-leave-active {
  transition: all 0.32s ease;
}

.quiz-card-enter-from,
.quiz-card-leave-to {
  opacity: 0;
  transform: translateX(24px) translateY(6px);
}

@keyframes floatInRight {
  from {
    opacity: 0;
    transform: translateX(20px) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

/* 响应式 */
@media (max-width: 1100px) {
  .story-layout {
    max-width: 900px;
  }

  .quiz-side-panel {
    width: 380px;
    flex-basis: 380px;
  }

  .story-layout.expanded .content {
    max-width: 620px;
  }
}

@media (max-width: 900px) {
  .story-layout,
  .story-layout.expanded {
    display: block;
    padding: 18px 16px 42px;
  }

  .content,
  .story-layout.expanded .content {
    max-width: 100%;
    width: 100%;
    transform: none;
  }

  .quiz-side-panel {
    position: fixed;
    left: 12px;
    right: 12px;
    top: auto;
    bottom: 14px;
    width: auto;
    flex: none;
    z-index: 10;
  }

  .close-quiz-btn {
    top: -10px;
    right: 2px;
  }

  .page-mask {
    background: rgba(24, 18, 12, 0.24);
    backdrop-filter: blur(3px);
  }
}

@media (max-width: 600px) {
  .scenic-name {
    font-size: 28px;
    letter-spacing: 4px;
  }

  .story-inner {
    padding: 18px 20px;
  }

  .story-paragraph {
    font-size: 14px;
  }

  .open-quiz-btn {
    width: 100%;
    justify-content: center;
    font-size: 15px;
    letter-spacing: 2px;
  }

  .quiz-body,
  .quiz-result {
    padding: 22px 18px 18px;
  }

  .question-text {
    font-size: 16px;
  }

  .option-bamboo {
    font-size: 14px;
    padding: 13px 14px;
  }

  .stamp-btn {
    width: calc(100% - 36px);
    margin: 0 18px 18px;
  }

  .success-name {
    font-size: 22px;
  }
}
</style>
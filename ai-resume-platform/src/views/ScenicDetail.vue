<template>
  <div class="detail-page">
    <div
      class="page-bg"
      :style="{ backgroundImage: `url(${currentScenic.img})` }"
    ></div>
    <div class="bg-mask"></div>

    <!-- 左侧半圆 -->
    <div class="left-wheel-wrap">
      <div class="wheel-shadow"></div>

      <svg
        class="semi-wheel"
        viewBox="0 0 760 760"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="sectorShadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="8"
              flood-opacity="0.18"
            />
          </filter>

          <pattern
            v-for="item in scenicList"
            :key="`pattern-${item.id}`"
            :id="`img-pattern-${item.id}`"
            patternUnits="userSpaceOnUse"
            width="760"
            height="760"
          >
            <image
              :href="item.img"
              x="0"
              y="0"
              width="760"
              height="760"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          <!-- 只保留大圆右半边 -->
          <clipPath id="rightHalfClip">
            <rect x="380" y="0" width="380" height="760" />
          </clipPath>
        </defs>

        <g clip-path="url(#rightHalfClip)">
          <!-- 外圈底 -->
          <circle
            cx="380"
            cy="380"
            r="286"
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.14)"
            stroke-width="2"
          />

          <!-- 扇形 -->
          <g
            v-for="(item, index) in sectors"
            :key="item.id"
            class="sector-group"
            :class="{ active: activeId === item.id }"
            :style="getSectorStyle(index, item.id)"
            @click="selectScenic(item.id)"
          >
            <path
              :d="item.path"
              :fill="`url(#img-pattern-${item.id})`"
              class="sector-img"
              filter="url(#sectorShadow)"
            />

            <path
              :d="item.path"
              class="sector-overlay"
              :class="{ active: activeId === item.id }"
            />

            <path
              :d="item.path"
              class="sector-border"
              :class="{ active: activeId === item.id }"
            />

            <g
              :transform="`translate(${item.textX}, ${item.textY}) rotate(${item.textRotate})`"
              class="sector-text-wrap"
            >
              <rect
                x="-50"
                y="-17"
                width="100"
                height="34"
                rx="17"
                ry="17"
                class="sector-label-bg"
                :class="{ active: activeId === item.id }"
              />
              <text
                text-anchor="middle"
                dominant-baseline="middle"
                class="sector-text"
                :class="{ active: activeId === item.id }"
              >
                {{ item.name }}
              </text>
            </g>
          </g>

          <!-- 中心圆 -->
          <circle
            cx="380"
            cy="380"
            r="142"
            fill="rgba(248, 244, 236, 0.9)"
            stroke="rgba(170,150,120,0.32)"
            stroke-width="2.2"
          />
          <circle
            cx="380"
            cy="380"
            r="104"
            fill="rgba(255,255,255,0.68)"
            stroke="rgba(180,160,130,0.2)"
            stroke-width="1.6"
          />

          <!-- 中心文字 -->
          <g class="wheel-center-text">
            <text x="425" y="348" text-anchor="middle" class="center-main">
              <tspan x="425" dy="0">景</tspan>
              <tspan x="425" dy="64">点</tspan>
            </text>
          </g>
        </g>
      </svg>
    </div>

    <!-- 右侧内容 -->
    <div class="right-panel">
      <button class="back-btn" @click="goBack">返回</button>

      <div class="title-box">
        <h1>{{ currentScenic.name }}</h1>
        <p>{{ currentScenic.poem }}</p>
      </div>

      <div class="tab-box">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'intro' }"
          @click="activeTab = 'intro'"
        >
          介绍
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'comment' }"
          @click="activeTab = 'comment'"
        >
          评论
        </button>
      </div>

      <div class="content-box">
        <template v-if="activeTab === 'intro'">
          <div class="intro-panel">
            <div class="intro-image">
              <img :src="currentScenic.img" :alt="currentScenic.name" />
            </div>

            <div class="intro-text">
              <h3>景点简介</h3>
              <p>{{ currentScenic.desc }}</p>

              <h3>亮点推荐</h3>
              <ul>
                <li v-for="point in currentScenic.highlights" :key="point">
                  {{ point }}
                </li>
              </ul>

              <div class="action-row">
                <button class="action-btn" @click="startDialogue">
                  {{ isLogin ? "进入对话" : "游客体验" }}
                </button>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="comment-panel">
            <div class="comment-top">
              <span>共 {{ comments.length }} 条评论</span>
            </div>

            <div v-if="!isLogin" class="login-tip">
              <p>登录后可以发表你的游玩感受</p>
              <button @click="goLogin">去登录</button>
            </div>

            <div v-else class="comment-form">
              <div class="tag-row">
                <span
                  v-for="tag in tagList"
                  :key="tag"
                  class="tag-item"
                  :class="{ active: selectedTag === tag }"
                  @click="selectTag(tag)"
                >
                  {{ tag }}
                </span>
              </div>

              <textarea
                v-model="content"
                placeholder="写下你对这个景点的感受..."
                rows="4"
              ></textarea>

              <button class="submit-btn" @click="submitComment">
                发布评论
              </button>
            </div>

            <div class="comment-list">
              <div class="comment-item" v-for="item in comments" :key="item.id">
                <div class="comment-head">
                  <div class="comment-user">
                    <span class="avatar">{{ item.user.slice(0, 1) }}</span>
                    <span class="name">{{ item.user }}</span>
                  </div>
                  <span class="comment-tag">{{ item.tag }}</span>
                </div>

                <div class="comment-body">
                  {{ item.content }}
                </div>

                <div class="comment-foot">
                  {{ item.date || "刚刚" }}
                </div>
              </div>

              <div v-if="comments.length === 0" class="empty-box">
                暂无评论，快来抢沙发吧
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import lushan from "@/assets/imgs/lushan.jpg";
import jinggangshan from "@/assets/imgs/jinggangshan.jpg";
import wuyuan from "@/assets/imgs/wuyuan.jpg";
import twangge from "@/assets/imgs/tenwangge.jpg";
import sanqinsan from "@/assets/imgs/sanqingsan.jpg";

const router = useRouter();
const route = useRoute();

const isLogin = ref(false);
const activeTab = ref("intro");
const activeId = ref(1);

const content = ref("");
const selectedTag = ref("");

const tagList = ref([
  "风景很美",
  "适合拍照",
  "文化浓厚",
  "值得推荐",
  "还想再来"
]);

const scenicList = [
  {
    id: 1,
    name: "庐山",
    img: lushan,
    poem: "飞流直下三千尺，疑是银河落九天",
    desc:
      "庐山以雄、奇、险、秀闻名，山中云雾变化丰富，瀑布、峡谷、别墅群与人文历史交织，是江西非常有代表性的名山景区。",
    highlights: ["瀑布与云海景观", "避暑胜地", "山水与人文结合"]
  },
  {
    id: 2,
    name: "井冈山",
    img: jinggangshan,
    poem: "红色摇篮映青山，革命精神代代传",
    desc:
      "井冈山不仅自然风景秀美，更具有深厚的红色文化底蕴。这里山高林密，景观层次丰富，也是了解革命历史的重要目的地。",
    highlights: ["红色文化浓厚", "山地景观丰富", "研学体验感强"]
  },
  {
    id: 3,
    name: "婺源",
    img: wuyuan,
    poem: "粉墙黛瓦映花海，小桥流水入春烟",
    desc:
      "婺源被誉为中国最美乡村，春季油菜花海、徽派建筑、古村落和田园景观相互映衬，非常适合慢游、摄影和体验乡村文化。",
    highlights: ["油菜花海", "徽派古村", "非常适合摄影"]
  },
  {
    id: 4,
    name: "滕王阁",
    img: twangge,
    poem: "落霞与孤鹜齐飞，秋水共长天一色",
    desc:
      "滕王阁是南昌地标性建筑，也是江西文化名片之一。登阁远望可看赣江两岸风光，历史典故与文学气息都很浓。",
    highlights: ["江景开阔", "文化底蕴深厚", "南昌城市地标"]
  },
  {
    id: 5,
    name: "三清山",
    img: sanqinsan,
    poem: "峰林叠翠入云端，奇石松涛画中看",
    desc:
      "三清山以花岗岩峰林地貌著称，山体线条奇特，云海与栈道景观非常有辨识度，是江西极具特色的自然景区。",
    highlights: ["奇峰怪石", "高山栈道", "云海观赏体验好"]
  },
  {
    id: 6,
    name: "绳经塔",
    img: jinggangshan,
    poem: "峰林叠翠入云端，奇石松涛画中看",
    desc:
      "三清山以花岗岩峰林地貌著称，山体线条奇特，云海与栈道景观非常有辨识度，是江西极具特色的自然景区。",
    highlights: ["奇峰怪石", "高山栈道", "云海观赏体验好"]
  }
];

const commentsMap = ref({});
const comments = computed(() => commentsMap.value[activeId.value] || []);

const currentScenic = computed(() => {
  return scenicList.find((item) => item.id === activeId.value) || scenicList[0];
});

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function createSectorPath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const p1 = polarToCartesian(cx, cy, outerR, startAngle);
  const p2 = polarToCartesian(cx, cy, outerR, endAngle);
  const p3 = polarToCartesian(cx, cy, innerR, endAngle);
  const p4 = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
    "Z"
  ].join(" ");
}

const sectors = computed(() => {
  const cx = 380;
  const cy = 380;

  // 稍微缩小一点，让整体更秀气
  const innerR = 156;
  const outerR = 286;

  // 关键：始终铺满整个半圆（0° 到 180°）
  // 0° = 顶部，90° = 右侧，180° = 底部
  const startAngle = 13;
  const endAngle = 166;

  const count = scenicList.length;
  const totalSweep = endAngle - startAngle;

  // 总缝隙固定，数量变多时单个扇形自然变小
  const gap = 2.4;
  const totalGap = gap * (count - 1);
  const usableSweep = totalSweep - totalGap;
  const sectorSweep = usableSweep / count;

  return scenicList.map((item, index) => {
    const start = startAngle + index * (sectorSweep + gap);
    const end = start + sectorSweep;
    const mid = (start + end) / 2;

    const textPoint = polarToCartesian(cx, cy, 220, mid);

    return {
      ...item,
      path: createSectorPath(cx, cy, innerR, outerR, start, end),
      textX: textPoint.x,
      textY: textPoint.y,
      textRotate: mid - 90
    };
  });
});

function getSectorStyle(index, id) {
  const isActive = activeId.value === id;
  return {
    transformOrigin: "380px 380px",
    transform: isActive ? "scale(1.04)" : "scale(1)",
    zIndex: isActive ? 20 : index + 1
  };
}

function selectScenic(id) {
  activeId.value = id;
  activeTab.value = "intro";
  content.value = "";
  selectedTag.value = "";
}

function selectTag(tag) {
  selectedTag.value = tag;
}

function saveComments() {
  localStorage.setItem("jx_scenic_comments", JSON.stringify(commentsMap.value));
}

function loadComments() {
  const stored = localStorage.getItem("jx_scenic_comments");
  if (stored) {
    commentsMap.value = JSON.parse(stored);
    return;
  }

  commentsMap.value = {
    1: [
      {
        id: 101,
        user: "山风",
        content: "庐山的云雾真的很有感觉，拍照特别出片。",
        tag: "风景很美",
        date: "今天"
      }
    ],
    2: [
      {
        id: 201,
        user: "旅人",
        content: "井冈山很适合边看风景边了解历史，体验感很好。",
        tag: "文化浓厚",
        date: "昨天"
      }
    ],
    3: [
      {
        id: 301,
        user: "小禾",
        content: "婺源真的很适合春天去，花海和古村特别搭。",
        tag: "值得推荐",
        date: "前天"
      }
    ],
    4: [],
    5: []
  };
}

function submitComment() {
  if (!content.value.trim()) {
    alert("请输入评论内容");
    return;
  }

  if (!selectedTag.value) {
    alert("请选择一个标签");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!commentsMap.value[activeId.value]) {
    commentsMap.value[activeId.value] = [];
  }

  commentsMap.value[activeId.value].unshift({
    id: Date.now(),
    user: user?.name || "游客",
    content: content.value.trim(),
    tag: selectedTag.value,
    date: "刚刚"
  });

  saveComments();
  content.value = "";
  selectedTag.value = "";
}

function startDialogue() {
  router.push({
    path: "/dialogue",
    query: {
      id: activeId.value,
      demo: isLogin.value ? "false" : "true"
    }
  });
}

function goLogin() {
  router.push({
    path: "/login",
    query: {
      redirect: `/detail?id=${activeId.value}`
    }
  });
}

function goBack() {
  router.back();
}

onMounted(() => {
  loadComments();

  const queryId = Number(route.query.id);
  if (queryId && scenicList.some((item) => item.id === queryId)) {
    activeId.value = queryId;
  }

  isLogin.value = !!localStorage.getItem("user");
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.detail-page {
  --wheel-size: clamp(940px, 62vw, 1040px);
  --wheel-left: calc(var(--wheel-size) * -0.59);
  --left-panel-width: clamp(370px, 35vw, 660px);
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #ece6db;
  display: flex;
}

.page-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.08);
  transition: all 0.5s ease;
}

.bg-mask {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(239, 234, 226, 0.84) 0%,
      rgba(239, 234, 226, 0.72) 32%,
      rgba(244, 240, 233, 0.9) 60%,
      rgba(244, 240, 233, 0.96) 100%
    );
  backdrop-filter: blur(2px);
}

.left-wheel-wrap {
  position: relative;
  z-index: 2;
  width: var(--left-panel-width);
  min-width: 420px;
  height: 100vh;
  overflow: hidden;
}

.wheel-shadow {
  position: absolute;
  top: 50%;
  left: calc(var(--wheel-left) + 44px);
  transform: translateY(-50%);
  width: calc(var(--wheel-size) * 0.9);
  height: calc(var(--wheel-size) * 0.9);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0.12) 0%,
    rgba(0, 0, 0, 0.07) 35%,
    rgba(0, 0, 0, 0) 72%
  );
  filter: blur(20px);
}

.semi-wheel {
  position: absolute;
  top: 50%;
  left: var(--wheel-left);
  width: var(--wheel-size);
  height: var(--wheel-size);
  transform: translateY(-50%);
}

.sector-group {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.sector-img {
  transition: all 0.3s ease;
}

.sector-overlay {
  fill: rgba(255, 248, 235, 0.12);
  transition: all 0.3s ease;
}

.sector-overlay.active {
  fill: rgba(255, 248, 235, 0.03);
}

.sector-border {
  fill: none;
  stroke: rgba(255, 255, 255, 0.95);
  stroke-width: 4;
  stroke-linejoin: round;
  transition: all 0.3s ease;
}

.sector-border.active {
  stroke: #ffffff;
  stroke-width: 5;
}

.sector-label-bg {
  fill: rgba(245, 236, 218, 0.96);
  stroke: rgba(177, 148, 105, 0.28);
  stroke-width: 1.1;
  transition: all 0.3s ease;
}

.sector-label-bg.active {
  fill: rgba(255, 248, 235, 0.99);
}

.sector-text {
  font-size: 18px;
  fill: #5b4332;
  font-weight: 700;
  letter-spacing: 1px;
}

.sector-text.active {
  fill: #2f2117;
}

.wheel-center-text .center-main {
  font-size: 40px;
  font-weight: 700;
  fill: #60493a;
  letter-spacing: 4px;
}

.right-panel {
  position: relative;
  z-index: 3;
  flex: 1 1 auto;
  min-width: 0;
  width: calc(100% - var(--left-panel-width));
  height: 100vh;
  padding: 34px 28px 34px 0;
  display: flex;
  flex-direction: column;
}

.back-btn {
  align-self: flex-start;
  border: none;
  background: rgba(255, 255, 255, 0.82);
  color: #7a5840;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 999px;
  cursor: pointer;
  margin-bottom: 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.title-box {
  width: 360px;
  max-width: 100%;
  margin: 0 auto 16px;
  text-align: center;
  background: rgba(255, 250, 245, 0.82);
  border: 4px solid #d8b18a;
  border-radius: 16px;
  padding: 20px 24px 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.title-box h1 {
  margin: 0;
  font-size: 42px;
  line-height: 1.15;
  color: #6f2d1d;
  letter-spacing: 2px;
}

.title-box p {
  margin: 10px 0 0;
  font-size: 14px;
  color: #8f6b56;
}

.tab-box {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.tab-btn {
  width: 142px;
  height: 56px;
  border: 4px solid #d8b18a;
  background: rgba(255, 250, 245, 0.84);
  color: #8c331c;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-btn:first-child {
  border-radius: 12px 0 0 12px;
}

.tab-btn:last-child {
  border-left: none;
  border-radius: 0 12px 12px 0;
}

.tab-btn.active {
  background: #fff8f0;
  box-shadow: inset 0 -4px 0 rgba(216, 177, 138, 0.45);
}

.content-box {
  flex: 1;
  min-height: 0;
  background: rgba(255, 250, 245, 0.84);
  border: 4px solid #d8b18a;
  border-radius: 16px;
  padding: 24px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
}

.intro-panel {
  height: 100%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 22px;
  padding-right: 6px;
}

.intro-image {
  border-radius: 14px;
  overflow: hidden;
  height: 340px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

.intro-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.intro-text h3 {
  margin: 0 0 10px;
  color: #7d3421;
  font-size: 20px;
}

.intro-text p {
  margin: 0 0 18px;
  line-height: 1.9;
  color: #5c4a3d;
  font-size: 15px;
}

.intro-text ul {
  margin: 0;
  padding-left: 18px;
  color: #5c4a3d;
  line-height: 2;
}

.action-row {
  margin-top: 26px;
}

.action-btn {
  border: none;
  background: linear-gradient(135deg, #c77755, #9f4a30);
  color: #fff;
  padding: 12px 26px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 15px;
  box-shadow: 0 8px 20px rgba(159, 74, 48, 0.26);
}

.comment-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.comment-top {
  color: #8a5f4a;
  font-size: 14px;
  margin-bottom: 14px;
}

.login-tip {
  padding: 18px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 18px;
  border: 1px dashed #dfbea0;
}

.login-tip p {
  margin: 0 0 10px;
  color: #6c5647;
}

.login-tip button {
  border: none;
  background: #a95e43;
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
}

.comment-form {
  background: rgba(255, 255, 255, 0.76);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 18px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.tag-item {
  padding: 6px 14px;
  border-radius: 999px;
  background: #f4e6db;
  color: #8f5b44;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.tag-item.active {
  background: #a85b3f;
  color: #fff;
}

.comment-form textarea {
  width: 100%;
  resize: none;
  border: 1px solid #e7cdb8;
  outline: none;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  color: #4a3a30;
  background: #fffdfa;
  margin-bottom: 12px;
}

.submit-btn {
  border: none;
  background: linear-gradient(135deg, #c77755, #9f4a30);
  color: #fff;
  padding: 10px 22px;
  border-radius: 999px;
  cursor: pointer;
}

.comment-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.comment-item {
  background: rgba(255, 255, 255, 0.76);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(222, 198, 177, 0.7);
}

.comment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #d8b18a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.name {
  color: #5b4639;
  font-weight: 600;
}

.comment-tag {
  font-size: 12px;
  color: #9f5b41;
  background: #f5e7dc;
  border-radius: 999px;
  padding: 5px 12px;
}

.comment-body {
  color: #5b4b40;
  line-height: 1.8;
  font-size: 14px;
}

.comment-foot {
  margin-top: 10px;
  color: #9f8a7c;
  font-size: 12px;
}

.empty-box {
  padding: 24px;
  text-align: center;
  color: #8c7566;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
}

.intro-panel::-webkit-scrollbar,
.comment-list::-webkit-scrollbar {
  width: 6px;
}

.intro-panel::-webkit-scrollbar-thumb,
.comment-list::-webkit-scrollbar-thumb {
  background: rgba(180, 136, 103, 0.45);
  border-radius: 999px;
}

@media (max-width: 1180px) {
  .detail-page {
    --wheel-size: 800px;
    --wheel-left: calc(var(--wheel-size) * -0.60);
    --left-panel-width: 390px;
  }

  .left-wheel-wrap {
    min-width: 390px;
  }

  .right-panel {
    padding: 20px 20px 24px 8px;
  }

  .title-box {
    width: 320px;
  }

  .intro-panel {
    grid-template-columns: 220px 1fr;
  }

  .intro-image {
    height: 300px;
  }
}

@media (max-width: 900px) {
  .detail-page {
    display: block;
    overflow-y: auto;
    min-height: 100vh;
  }

  .left-wheel-wrap {
    width: 100%;
    min-width: 0;
    height: 350px;
  }

  .semi-wheel {
    top: 18px;
    left: -295px;
    width: 700px;
    height: 700px;
    transform: none;
  }

  .wheel-shadow {
    top: 34px;
    left: -240px;
    width: 620px;
    height: 620px;
    transform: none;
  }

  .right-panel {
    width: 100%;
    height: auto;
    min-width: 0;
    padding: 8px 16px 24px;
  }

  .title-box {
    width: 100%;
  }

  .title-box h1 {
    font-size: 34px;
  }

  .tab-btn {
    width: 50%;
    font-size: 16px;
  }

  .content-box {
    min-height: 520px;
    padding: 16px;
  }

  .intro-panel {
    grid-template-columns: 1fr;
  }

  .intro-image {
    height: 220px;
  }
}
</style>
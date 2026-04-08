<template>
  <div class="detail-page">
    <transition name="detail-loading-fade">
      <div
        v-if="pageEntering"
        class="page-loading-overlay"
      >
        <div class="mist-backdrop"></div>

        <div class="mist-layer mist-layer-back">
          <img class="mist-half left back" :src="yun1" alt="云雾" />
          <img class="mist-half right back" :src="yun1" alt="云雾" />
        </div>

        <div class="mist-layer mist-layer-front">
          <img class="mist-half left front" :src="yun2" alt="云雾" />
          <img class="mist-half right front" :src="yun2" alt="云雾" />
        </div>
<!-- 
        <div class="mist-center-panel">
          <div class="mist-title">{{ pageLoadingTitle }}</div>
          <div class="mist-text">{{ pageLoadingText }}</div>
          <div class="mist-progress-bar">
            <div class="mist-progress-fill" :style="{ width: `${loadingProgress}%` }"></div>
          </div>
        </div>
        -->
      </div>
    </transition>

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
            v-for="item in wheelScenicList"
            :key="`pattern-${item.id}`"
            :id="`img-pattern-${item.id}`"
            patternUnits="userSpaceOnUse"
            width="760"
            height="760"
          >
            <image
              :href="item.coverImage || item.img"
              x="0"
              y="0"
              width="760"
              height="760"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>

          <clipPath id="rightHalfClip">
            <rect x="380" y="0" width="380" height="760" />
          </clipPath>
        </defs>

        <g clip-path="url(#rightHalfClip)">
          <circle
            cx="380"
            cy="380"
            r="286"
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.14)"
            stroke-width="2"
          />

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
            <div
              class="intro-image"
              @mouseenter="stopGalleryAutoPlay"
              @mouseleave="startGalleryAutoPlay"
            >
              <button class="intro-nav-arrow left" @click="prevGalleryImage">
                ‹
              </button>

              <div class="intro-carousel-track">
                <div
                  v-for="(img, index) in currentGallery"
                  :key="`${currentScenic.id}-${index}`"
                  class="intro-card"
                  :class="getIntroCardClass(index)"
                  @click="updateGallery(index)"
                >
                  <img :src="img" :alt="`${currentScenic.name}-${index + 1}`" />
                </div>
              </div>

              <button class="intro-nav-arrow right" @click="nextGalleryImage">
                ›
              </button>

              <div class="intro-dots">
                <div
                  v-for="(_, index) in currentGallery"
                  :key="`dot-${currentScenic.id}-${index}`"
                  class="intro-dot"
                  :class="{ active: index === currentIntroIndex }"
                  @click="updateGallery(index)"
                ></div>
              </div>
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

            <!-- 美食流水线轮播 -->
            <div class="food-belt-section">
              <div class="food-belt-header">
                <h3>当地美食</h3>
              </div>

              <div class="food-belt-window">
                <div class="food-belt-track">
                  <div
                    v-for="(food, index) in foodBeltItems"
                    :key="`${food.name}-${index}`"
                    class="food-belt-card"
                  >
                    <div class="food-belt-image">
                      <img :src="food.image" :alt="food.name" />
                    </div>
                    <div class="food-belt-info">
                      <h4>{{ food.name }}</h4>
                      <span>{{ food.tag }}</span>
                      <p>{{ food.desc }}</p>
                    </div>
                  </div>
                </div>
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
                    <span class="avatar">{{ getCommentDisplayName(item).slice(0, 1) }}</span>
                    <span class="name">{{ getCommentDisplayName(item) }}</span>
                  </div>
                  <span class="comment-tag">{{ item.tag || item.category || "默认标签" }}</span>
                </div>

                <div class="comment-body">
                  {{ item.content }}
                </div>

                <div class="comment-foot">
                  <span class="comment-date">{{ item.date || item.createTime || "刚刚" }}</span>

                  <div class="comment-actions">
                    <button
                      class="comment-action like"
                      :class="{ active: item.liked }"
                      @click="toggleLike(item)"
                    >
                      {{ item.liked ? "已赞" : "点赞" }}
                      <span v-if="typeof item.likeCount === 'number'">({{ item.likeCount }})</span>
                    </button>

                    <button
                      v-if="canDeleteComment(item)"
                      class="comment-action delete"
                      @click="deleteComment(item)"
                    >
                      删除
                    </button>
                  </div>
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
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { request } from "@/utils/request";

import lushan from "@/assets/imgs/lushan.jpg";
import jinggangshan from "@/assets/imgs/jinggangshan.jpg";
import wuyuan from "@/assets/imgs/wuyuan.jpg";
import twangge from "@/assets/imgs/tenwangge.jpg";
import sanqingshan from "@/assets/imgs/sanqingsan.jpg";
import yun1 from "@/assets/imgs/yun2.png";
import yun2 from "@/assets/imgs/yun2.png";

const router = useRouter();
const route = useRoute();

const isLogin = ref(false);
const activeTab = ref("intro");
const activeId = ref(1);
const pageEntering = ref(true);
const pageLoadingTitle = ref("正在展开景点画卷");
const pageLoadingText = ref("图片和景点数据正在准备中...");
// const loadingProgress = ref(0);

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
    gallery: [lushan, wuyuan, sanqingshan, twangge, jinggangshan],
    poem: "飞流直下三千尺，疑是银河落九天",
    desc:
      "庐山以雄、奇、险、秀闻名，山中云雾变化丰富，瀑布、峡谷、别墅群与人文历史交织，是江西非常有代表性的名山景区。",
    highlights: ["瀑布与云海景观", "避暑胜地", "山水与人文结合"],
    foods: [
      {
        name: "庐山石鸡",
        tag: "山间名菜",
        desc: "庐山很有代表性的风味菜之一，口感鲜嫩，游客来这里常会专门尝一尝。",
        image: lushan
      },
      {
        name: "云雾茶",
        tag: "特产茶饮",
        desc: "庐山的经典特产，茶香清雅，适合作为伴手礼，也适合游玩后慢慢品茶。",
        image: wuyuan
      },
      {
        name: "三石宴",
        tag: "地方特色",
        desc: "围绕石鸡、石鱼、石耳等做出的特色宴席，很能体现庐山地方饮食风味。",
        image: sanqingshan
      },
      {
        name: "笋干烧肉",
        tag: "家常风味",
        desc: "山地风味浓厚，咸香下饭，属于比较受欢迎的本地菜式。",
        image: jinggangshan
      }
    ]
  },
  {
    id: 2,
    name: "井冈山",
    img: jinggangshan,
    gallery: [jinggangshan, lushan, twangge, wuyuan, sanqingshan],
    poem: "红色摇篮映青山，革命精神代代传",
    desc:
      "井冈山不仅自然风景秀美，更具有深厚的红色文化底蕴。这里山高林密，景观层次丰富，也是了解革命历史的重要目的地。",
    highlights: ["红色文化浓厚", "山地景观丰富", "研学体验感强"],
    foods: [
      {
        name: "红米饭",
        tag: "红色记忆",
        desc: "很有井冈山辨识度的一道主食，游客体验感和文化感都很强。",
        image: jinggangshan
      },
      {
        name: "南瓜汤",
        tag: "朴实清甜",
        desc: "当地较常见的家常风味，口感温和，很有山间饮食的质朴气息。",
        image: lushan
      },
      {
        name: "烟笋烧肉",
        tag: "咸香下饭",
        desc: "烟笋带有独特风味，和烧肉搭配层次丰富，是本地比较经典的菜式。",
        image: wuyuan
      },
      {
        name: "艾米果",
        tag: "传统小吃",
        desc: "外形朴实、口感软糯，带着明显的地方特色，适合边逛边吃。",
        image: twangge
      }
    ]
  },
  {
    id: 3,
    name: "婺源",
    img: wuyuan,
    gallery: [wuyuan, lushan, sanqingshan, twangge, jinggangshan],
    poem: "粉墙黛瓦映花海，小桥流水入春烟",
    desc:
      "婺源被誉为中国最美乡村，春季油菜花海、徽派建筑、古村落和田园景观相互映衬，非常适合慢游、摄影和体验乡村文化。",
    highlights: ["油菜花海", "徽派古村", "非常适合摄影"],
    foods: [
      {
        name: "汽糕",
        tag: "传统早点",
        desc: "婺源代表性小吃之一，口感松软，米香较明显，很多游客都会尝试。",
        image: wuyuan
      },
      {
        name: "糊豆腐",
        tag: "家常风味",
        desc: "地方特色明显，口感细腻，很适合想体验婺源本地家常菜的游客。",
        image: lushan
      },
      {
        name: "荷包红鲤鱼",
        tag: "地方名菜",
        desc: "兼具观赏性和地域特色，是婺源较有代表性的美食之一。",
        image: sanqingshan
      },
      {
        name: "清明果",
        tag: "乡村小吃",
        desc: "口感软糯，外观清新，很符合婺源乡村慢生活的气质。",
        image: jinggangshan
      }
    ]
  },
  {
    id: 4,
    name: "滕王阁",
    img: twangge,
    gallery: [twangge, lushan, jinggangshan, sanqingshan, wuyuan],
    poem: "落霞与孤鹜齐飞，秋水共长天一色",
    desc:
      "滕王阁是南昌地标性建筑，也是江西文化名片之一。登阁远望可看赣江两岸风光，历史典故与文学气息都很浓。",
    highlights: ["江景开阔", "文化底蕴深厚", "南昌城市地标"],
    foods: [
      {
        name: "南昌拌粉",
        tag: "经典小吃",
        desc: "到南昌很有代表性的一道美食，口感筋道，很多游客会搭配瓦罐汤一起吃。",
        image: twangge
      },
      {
        name: "瓦罐汤",
        tag: "鲜香醇厚",
        desc: "南昌的招牌汤品之一，汤味浓郁，很适合当作旅行中的暖胃搭配。",
        image: lushan
      },
      {
        name: "白糖糕",
        tag: "街头甜点",
        desc: "口感软糯带甜香，属于很有烟火气的一类南昌传统小吃。",
        image: wuyuan
      },
      {
        name: "藜蒿炒腊肉",
        tag: "赣味代表",
        desc: "江西辨识度很高的一道菜，清香与腊味结合，很多人来都会点。",
        image: jinggangshan
      }
    ]
  },
  {
    id: 5,
    name: "三清山",
    img: sanqingshan,
    gallery: [sanqingshan, lushan, wuyuan, jinggangshan, twangge],
    poem: "峰林叠翠入云端，奇石松涛画中看",
    desc:
      "三清山以花岗岩峰林地貌著称，山体线条奇特，云海与栈道景观非常有辨识度，是江西极具特色的自然景区。",
    highlights: ["奇峰怪石", "高山栈道", "云海观赏体验好"],
    foods: [
      {
        name: "农家土鸡",
        tag: "山野风味",
        desc: "三清山周边常见农家菜，味道朴实，适合徒步游玩后补充体力。",
        image: sanqingshan
      },
      {
        name: "葛粉羹",
        tag: "地方特产",
        desc: "口感细滑，是当地较有特色的风味食品，也常被游客购买体验。",
        image: wuyuan
      },
      {
        name: "野菜煎蛋",
        tag: "清新爽口",
        desc: "简单但很有山间风味，属于当地常见的家常搭配。",
        image: lushan
      },
      {
        name: "笋干炖菜",
        tag: "山居家常",
        desc: "山里食材的代表之一，风味朴素自然，很贴合三清山气质。",
        image: jinggangshan
      }
    ]
  },
  {
    id: 6,
    name: "绳金塔",
    img: twangge,
    gallery: [twangge, jinggangshan, lushan, sanqingshan, wuyuan],
    poem: "古塔临风映城影，烟火南昌入画来",
    desc:
      "绳金塔是南昌具有代表性的历史建筑之一，融合了古城记忆与城市生活气息，夜景与节庆氛围都很有特色。",
    highlights: ["历史地标", "夜景氛围感强", "城市文化气息浓"],
    foods: [
      {
        name: "炒螺蛳",
        tag: "夜市风味",
        desc: "绳金塔一带很有代表性的夜市小吃类型，适合边逛边吃。",
        image: twangge
      },
      {
        name: "南昌水煮",
        tag: "鲜辣过瘾",
        desc: "夜市感很强，口味偏香辣，适合喜欢重口味的游客。",
        image: jinggangshan
      },
      {
        name: "糍粑",
        tag: "传统小吃",
        desc: "口感软糯，带有传统风味，也很适合作为游玩中的小点心。",
        image: wuyuan
      },
      {
        name: "炸串拼盘",
        tag: "烟火夜宵",
        desc: "适合和朋友一边逛塔景一边吃，氛围感很足。",
        image: lushan
      }
    ]
  }
];

const wheelScenicList = ref(
  scenicList.map((item) => ({
    id: item.id,
    apiId: item.id,
    name: item.name,
    coverImage: item.img,
    img: item.img
  }))
);

const scenicDetailMap = ref({});

async function fetchScenicDetail(apiId, localId = apiId) {
  if (!apiId) return;

  try {
    const res = await request(`/api/scenics/${apiId}`, {
      method: "GET"
    });

    const detail = res?.data;
    if (!detail) return;

    const fallback = scenicList.find((item) => item.id === localId) || scenicList[0];

    scenicDetailMap.value[localId] = {
      ...fallback,
      apiId: detail.id,
      regionId: detail.regionId,
      regionName: detail.regionName,
      name: detail.name || fallback?.name || "",
      desc: detail.intro || fallback?.desc || "",
      intro: detail.intro || fallback?.desc || "",
      highlights: Array.isArray(detail.highlights) && detail.highlights.length
        ? detail.highlights
        : (fallback?.highlights || []),
      summary: detail.summary || "",
      dialogues: Array.isArray(detail.dialogues) ? detail.dialogues : [],
      gallery: Array.isArray(detail.images) && detail.images.length
        ? detail.images
        : (fallback?.gallery || [fallback?.img].filter(Boolean)),
      images: Array.isArray(detail.images) ? detail.images : [],
      img:
        (Array.isArray(detail.images) && detail.images[0]) ||
        fallback?.img ||
        "",
      foods: fallback?.foods || [],
      poem: fallback?.poem || ""
    };
  } catch (error) {
    console.error("获取景点详情失败：", error);
  }
}

async function fetchRegionScenics() {
  const regionId = Number(route.query.regionId);
  if (!regionId) return;

  try {
    const res = await request(`/api/scenics?regionId=${regionId}`, {
      method: "GET"
    });

    const list = Array.isArray(res?.data) ? res.data : [];
    if (!list.length) return;

    wheelScenicList.value = list.map((item, index) => ({
      id: scenicList[index]?.id ?? item.id ?? index + 1,
      apiId: item.id,
      name: item.name,
      coverImage: item.coverImage || scenicList[index]?.img || "",
      img: item.coverImage || scenicList[index]?.img || ""
    }));

    if (!wheelScenicList.value.some((item) => item.id === activeId.value)) {
      activeId.value = wheelScenicList.value[0]?.id || activeId.value;
    }

    await Promise.all(
      wheelScenicList.value.map((item) => fetchScenicDetail(item.apiId, item.id))
    );
  } catch (error) {
    console.error("获取景点列表失败：", error);
  }
}

const regionFoods = ref([]);

async function fetchRegionFoods() {
  const regionId = Number(route.query.regionId);
  if (!regionId) return;

  try {
    const res = await request(`/api/foods?regionId=${regionId}`, {
      method: "GET"
    });

    const list = Array.isArray(res?.data) ? res.data : [];
    regionFoods.value = list.map((item) => ({
      id: item.id,
      name: item.name || "",
      tag: item.regionName || "地方美食",
      desc: item.name || "",
      image: item.imageUrl || ""
    }));
  } catch (error) {
    console.error("获取美食列表失败：", error);
    regionFoods.value = [];
  }
}

const commentsMap = ref({});
const comments = computed(() => commentsMap.value[activeId.value] || []);

const currentScenic = computed(() => {
  return (
    scenicDetailMap.value[activeId.value] ||
    scenicList.find((item) => item.id === activeId.value) ||
    scenicList[0]
  );
});

const foodBeltItems = computed(() => {
  const foods = regionFoods.value.length ? regionFoods.value : (currentScenic.value.foods || []);
  return [...foods, ...foods, ...foods];
});

/* 介绍页轮播图 */
const currentIntroIndex = ref(0);
const galleryAnimating = ref(false);
const galleryAutoPlayTimer = ref(null);
const galleryDelay = 3000;

const currentGallery = computed(() => {
  return currentScenic.value.gallery?.length
    ? currentScenic.value.gallery
    : [currentScenic.value.img];
});

function updateGallery(newIndex) {
  if (galleryAnimating.value || currentGallery.value.length === 0) return;

  galleryAnimating.value = true;
  const total = currentGallery.value.length;
  currentIntroIndex.value = (newIndex + total) % total;

  setTimeout(() => {
    galleryAnimating.value = false;
  }, 700);
}

function nextGalleryImage() {
  updateGallery(currentIntroIndex.value + 1);
}

function prevGalleryImage() {
  updateGallery(currentIntroIndex.value - 1);
}

function startGalleryAutoPlay() {
  stopGalleryAutoPlay();
  if (currentGallery.value.length <= 1) return;

  galleryAutoPlayTimer.value = setInterval(() => {
    nextGalleryImage();
  }, galleryDelay);
}

function stopGalleryAutoPlay() {
  if (galleryAutoPlayTimer.value) {
    clearInterval(galleryAutoPlayTimer.value);
    galleryAutoPlayTimer.value = null;
  }
}

function getIntroCardClass(index) {
  const total = currentGallery.value.length;
  const current = currentIntroIndex.value;

  if (index === current) return "center";
  if (index === (current - 1 + total) % total) return "left-1";
  if (index === (current - 2 + total) % total) return "left-2";
  if (index === (current + 1) % total) return "right-1";
  if (index === (current + 2) % total) return "right-2";
  return "hidden";
}

watch(
  () => activeId.value,
  () => {
    currentIntroIndex.value = 0;
    startGalleryAutoPlay();
  }
);

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
  const innerR = 156;
  const outerR = 286;

  const startAngle = 13;
  const endAngle = 166;

  const count = wheelScenicList.value.length;
  const totalSweep = endAngle - startAngle;
  const gap = 2.4;
  const totalGap = gap * (count - 1);
  const usableSweep = totalSweep - totalGap;
  const sectorSweep = usableSweep / count;

  return wheelScenicList.value.map((item, index) => {
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

  const target = wheelScenicList.value.find((item) => item.id === id);
  if (target && !scenicDetailMap.value[id]) {
    fetchScenicDetail(target.apiId, target.id);
  }
  if (target) {
    fetchComments(target.apiId || id, id);
  }
}

function selectTag(tag) {
  selectedTag.value = tag;
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
}

function getCurrentUserName() {
  const user = getCurrentUser();
  return user?.name || user?.username || "游客";
}

function getCommentDisplayName(item = {}) {
  return item.nickname || item.user || item.username || "游客";
}

function normalizeCommentItem(item = {}) {
  const currentUser = getCurrentUser();
  const displayName =
    item.nickname ||
    item.user ||
    item.username ||
    item.name ||
    "游客";

  const currentUserId = currentUser?.id ?? currentUser?.userId;
  const itemUserId = item?.userId ?? item?.uid;

  return {
    ...item,
    id: item.id,
    userId: itemUserId,
    username: item.username || item.user || displayName,
    nickname: item.nickname || displayName,
    user: displayName,
    avatar: item.avatar || "",
    scenicId: item.scenicId ?? item.scenicID ?? currentScenic.value?.apiId ?? activeId.value,
    tag: item.tag || item.category || "默认标签",
    category: item.category || item.tag || "默认标签",
    date: item.date || item.createTime || "刚刚",
    createTime: item.createTime || item.date || "刚刚",
    likeCount: typeof item.likeCount === "number" ? item.likeCount : 0,
    liked: !!item.liked,
    isMine:
      typeof item.isMine === "boolean"
        ? item.isMine
        : (currentUserId != null && itemUserId != null
            ? String(currentUserId) === String(itemUserId)
            : displayName === getCurrentUserName())
  };
}

function canDeleteComment(item) {
  if (!isLogin.value || !item) return false;

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id ?? currentUser?.userId;
  const itemUserId = item?.userId ?? item?.uid;

  if (currentUserId != null && itemUserId != null) {
    return String(currentUserId) === String(itemUserId);
  }

  return getCommentDisplayName(item) === getCurrentUserName();
}

async function fetchComments(scenicId = currentScenic.value.apiId || activeId.value, localId = activeId.value) {
  if (!scenicId) return;

  try {
    const res = await request(`/api/comments?scenicId=${scenicId}`, {
      method: "GET"
    });

    const list = Array.isArray(res?.data) ? res.data : [];
    commentsMap.value[localId] = list.map((item) => normalizeCommentItem(item));
    saveComments();
  } catch (error) {
    console.error("获取评论失败：", error);
  }
}

async function toggleLike(item) {
  if (!item?.id) {
    alert("评论不存在");
    return;
  }

  const oldLiked = !!item.liked;
  const oldCount = typeof item.likeCount === "number" ? item.likeCount : 0;

  item.liked = !oldLiked;
  item.likeCount = oldLiked ? Math.max(0, oldCount - 1) : oldCount + 1;

  try {
    await request(`/api/comments/${item.id}/like`, {
      method: "POST"
    });
    saveComments();
  } catch (error) {
    item.liked = oldLiked;
    item.likeCount = oldCount;
    alert(error?.message || "点赞失败");
  }
}

async function deleteComment(item) {
  if (!item?.id) {
    alert("评论不存在");
    return;
  }

  if (!canDeleteComment(item)) {
    alert("只能删除自己发表的评论");
    return;
  }

  const list = commentsMap.value[activeId.value] || [];
  const idx = list.findIndex((comment) => String(comment.id) === String(item.id));
  if (idx === -1) {
    alert("评论不存在");
    return;
  }

  const backup = { ...list[idx] };
  list.splice(idx, 1);

  try {
    await request(`/api/comments/${item.id}`, {
      method: "DELETE"
    });
    saveComments();
  } catch (error) {
    list.splice(idx, 0, backup);
    alert(error?.message || "删除评论失败");
  }
}

function saveComments() {
  localStorage.setItem("jx_scenic_comments", JSON.stringify(commentsMap.value));
}

function loadComments() {
  const stored = localStorage.getItem("jx_scenic_comments");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const normalized = {};
      Object.keys(parsed || {}).forEach((key) => {
        normalized[key] = Array.isArray(parsed[key])
          ? parsed[key].map((item) => normalizeCommentItem(item))
          : [];
      });
      commentsMap.value = normalized;
      return;
    } catch {
      localStorage.removeItem("jx_scenic_comments");
    }
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
    5: [],
    6: []
  };

  Object.keys(commentsMap.value).forEach((key) => {
    commentsMap.value[key] = (commentsMap.value[key] || []).map((item) =>
      normalizeCommentItem(item)
    );
  });
}

async function submitComment() {
  if (!content.value.trim()) {
    alert("请输入评论内容");
    return;
  }

  if (!selectedTag.value) {
    alert("请选择一个标签");
    return;
  }

  const userName = getCurrentUserName();
  const scenicId = currentScenic.value.apiId || activeId.value;
  const commentPayload = {
    scenicId,
    category: selectedTag.value,
    content: content.value.trim()
  };

  try {
    await request(`/api/comments`, {
      method: "POST",
      body: commentPayload
    });

    await fetchComments(scenicId, activeId.value);
    content.value = "";
    selectedTag.value = "";
  } catch (error) {
    alert(error?.message || "发布评论失败");
  }
}

function startDialogue() {
  router.push({
    path: "/dialogue",
    query: {
      id: activeId.value,
      apiId: currentScenic.value.apiId || activeId.value,
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
  router.push({ path: '/', query: { target: 'home' } })
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function preloadImages(urls = []) {
  const validUrls = [...new Set((urls || []).filter(Boolean))];
  if (!validUrls.length) return Promise.resolve();

  return Promise.allSettled(
    validUrls.map((url) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(url);
      img.src = url;
    }))
  );
}

function getInitialActiveId() {
  const queryId = Number(route.query.id);
  if (queryId) {
    const targetByApiId = wheelScenicList.value.find((item) => item.apiId === queryId);
    if (targetByApiId) return targetByApiId.id;
    if (scenicList.some((item) => item.id === queryId)) return queryId;
  }
  return wheelScenicList.value[0]?.id || activeId.value || 1;
}

function collectEntranceImages() {
  const scenicImages = Object.values(scenicDetailMap.value || {}).flatMap((item) => [
    item?.img,
    ...(Array.isArray(item?.gallery) ? item.gallery : [])
  ]);

  const wheelImages = wheelScenicList.value.flatMap((item) => [item.coverImage, item.img]);
  const foodImages = (regionFoods.value || []).map((item) => item.image);

  return [...new Set([...scenicImages, ...wheelImages, ...foodImages].filter(Boolean))];
}

async function preparePageEntrance() {
  const transitionInfo = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('jx_detail_transition') || '{}');
    } catch {
      return {};
    }
  })();

  if (transitionInfo?.regionName) {
    pageLoadingTitle.value = `正在进入${transitionInfo.regionName}`;
  }

  pageEntering.value = true;
  pageLoadingText.value = '景点数据正在加载中，请稍候...';

  const minAnimationTime = wait(2600);

  loadComments();

  const scenicTask = fetchRegionScenics();

  const foodTask = scenicTask
    .then(async () => {
      pageLoadingText.value = '正在装点当地风物与美食...';
      await fetchRegionFoods();
    })
    .catch((error) => {
      console.error('加载当地美食失败：', error);
    });

  const detailTask = scenicTask
    .then(async () => {
      activeId.value = getInitialActiveId();

      const currentWheelItem = wheelScenicList.value.find((item) => item.id === activeId.value);
      if (currentWheelItem && !scenicDetailMap.value[activeId.value]) {
        await fetchScenicDetail(currentWheelItem.apiId, currentWheelItem.id);
      }

      pageLoadingText.value = '图片与评论正在同步加载...';
      return currentWheelItem;
    })
    .catch((error) => {
      console.error('加载景点详情失败：', error);
      return null;
    });

  const extraTask = detailTask
    .then((currentWheelItem) =>
      Promise.allSettled([
        currentWheelItem
          ? fetchComments(currentWheelItem.apiId || activeId.value, activeId.value)
          : Promise.resolve(),
        preloadImages(collectEntranceImages())
      ])
    )
    .catch((error) => {
      console.error('加载评论或预加载图片失败：', error);
    });

  scenicTask.catch((error) => {
    console.error('加载景点列表失败：', error);
  });

  Promise.allSettled([scenicTask, foodTask, detailTask, extraTask]).then(() => {
    startGalleryAutoPlay();
  });

  try {
    await minAnimationTime;
  } finally {
    pageEntering.value = false;
    sessionStorage.removeItem('jx_detail_transition');
  }
}

onMounted(() => {
  isLogin.value = !!localStorage.getItem("user");
  document.addEventListener("keydown", handleKeydown);

  preparePageEntrance();
});

onUnmounted(() => {
  stopGalleryAutoPlay();
  document.removeEventListener("keydown", handleKeydown);
});

function handleKeydown(e) {
  if (activeTab.value !== "intro") return;
  if (e.key === "ArrowLeft") prevGalleryImage();
  if (e.key === "ArrowRight") nextGalleryImage();
}
</script>

<style scoped>
.detail-loading-fade-enter-active,
.detail-loading-fade-leave-active {
  transition: opacity 0.55s ease;
}

.detail-loading-fade-enter-from,
.detail-loading-fade-leave-to {
  opacity: 0;
}

.page-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(244, 240, 233, 0.22) 0%, rgba(231, 223, 210, 0.58) 58%, rgba(219, 211, 197, 0.78) 100%);
}

.mist-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(255, 251, 245, 0.78) 0%, rgba(241, 236, 227, 0.46) 28%, rgba(225, 217, 205, 0.18) 58%, rgba(225, 217, 205, 0) 78%),
    linear-gradient(180deg, rgba(240, 235, 226, 0.8), rgba(229, 221, 208, 0.68));
  animation: mistBackdropOpen 2.4s ease-out forwards;
}

.mist-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.mist-half {
  position: absolute;
  top: 50%;
  width: 72vw;
  max-width: 1050px;
  min-width: 560px;
  user-select: none;
  will-change: transform, opacity;
  backface-visibility: hidden;
  opacity: 1;
  filter: drop-shadow(0 10px 30px rgba(89, 80, 65, 0.08));
}

.mist-half.left {
  right: 20%;
  transform-origin: center center;
}

.mist-half.right {
  left: 20%;
  transform-origin: center center;
}

.mist-half.back.left {
   top: 78%;
  animation: mistOpenBackLeft 2.4s cubic-bezier(0.22, 0.8, 0.2, 1) forwards;
}

.mist-half.back.right {
   top: 78%;
  animation: mistOpenBackRight 2.4s cubic-bezier(0.22, 0.8, 0.2, 1) forwards;
}

.mist-half.front.left {
  top: 28%;
  animation: mistOpenFrontLeft 2.2s cubic-bezier(0.22, 0.8, 0.2, 1) forwards;
}

.mist-half.front.right {
  top: 28%;
  animation: mistOpenFrontRight 2.2s cubic-bezier(0.22, 0.8, 0.2, 1) forwards;
}

@keyframes mistBackdropOpen {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 0.90;
  }
  100% {
    opacity: 0.1;
  }
}

@keyframes mistOpenBackLeft {
  0% {
    transform: translate3d(-22%, -50%, 0) scale(1.18);
    opacity: 1;
  }
  60% {
    transform: translate3d(calc(-22% - 18vw), -50%, 0) scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: translate3d(calc(-22% - 34vw), -50%, 0) scale(1.22);
    opacity: 0;
  }
}

@keyframes mistOpenBackRight {
  0% {
    transform: translate3d(22%, -50%, 0) scaleX(-1) scale(1.18);
    opacity: 1;
  }
  60% {
    transform: translate3d(calc(22% + 18vw), -50%, 0) scaleX(-1) scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: translate3d(calc(22% + 34vw), -50%, 0) scaleX(-1) scale(1.22);
    opacity: 0;
  }
}

@keyframes mistOpenFrontLeft {
  0% {
    transform: translate3d(-14%, -50%, 0) scale(1.06);
    opacity: 1;
  }
  60% {
    transform: translate3d(calc(-14% - 24vw), -50%, 0) scale(1.09);
    opacity: 0.56;
  }
  100% {
    transform: translate3d(calc(-14% - 42vw), -50%, 0) scale(1.12);
    opacity: 0;
  }
}

@keyframes mistOpenFrontRight {
  0% {
    transform: translate3d(14%, -50%, 0) scaleX(-1) scale(1.06);
    opacity: 1;
  }
  60% {
    transform: translate3d(calc(14% + 24vw), -50%, 0) scaleX(-1) scale(1.09);
    opacity: 0.56;
  }
  100% {
    transform: translate3d(calc(14% + 42vw), -50%, 0) scaleX(-1) scale(1.12);
    opacity: 0;
  }
}

.mist-center-panel {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(460px, 82vw);
  transform: translate(-50%, -50%);
  padding: 28px 30px 24px;
  text-align: center;
  border-radius: 30px;
  background: rgba(255, 250, 242, 0.56);
  border: 1px solid rgba(172, 145, 112, 0.18);
  box-shadow: 0 18px 46px rgba(92, 72, 44, 0.12);
  opacity: 0;
}

.mist-title {
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #6a4823;
}

.mist-text {
  margin-bottom: 16px;
  font-size: 15px;
  line-height: 1.8;
  color: #89694a;
}

.mist-progress-bar {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(143, 108, 67, 0.14);
}

.mist-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(164, 126, 84, 0.7), rgba(202, 170, 130, 0.92));
}

* {
  box-sizing: border-box;
}


.detail-page {
  --wheel-size: clamp(940px, 62vw, 1040px);
  --wheel-left: calc(var(--wheel-size) * -0.59);
  --left-panel-width: clamp(300px, 24vw, 360px);
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
      rgba(239, 234, 226, 0.80) 0%,
      rgba(239, 234, 226, 0.70) 32%,
      rgba(244, 240, 233, 0.9) 60%,
      rgba(244, 240, 233, 0.90) 100%
    );
  backdrop-filter: blur(2px);
}

.left-wheel-wrap {
  position: relative;
  z-index: 2;
  width: var(--left-panel-width);
  min-width: 300px;
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
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 4;
  stroke-linejoin: round;
  transition: all 0.3s ease;
}

.sector-border.active {
  stroke: rgba(255, 255, 255, 0.5);
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
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  padding: 10px 28px 4px 0;
  display: flex;
  flex-direction: column;
  /* 隐藏滚动条 */
  scrollbar-width: none;  /* Firefox */
  -ms-overflow-style: none;  /* IE/Edge */
}
.right-panel::-webkit-scrollbar {
  display: none;  /* Chrome/Safari */
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
  margin-bottom: -40px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.title-box {
  width: 360px;
  max-width: 100%;
  margin: 0 auto 16px;
  text-align: center;
  border-radius: 16px;
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
  width: 284px;   /* 142 * 2 */
  height: 56px;
  margin: 0 auto;
  background: url(@/assets/imgs/jspl.png) no-repeat center center;
  background-size: 100% 100%;
  /* overflow: hidden; */
   border-radius: 12px;
  /* margin-bottom: 14px; */
}

.tab-btn {
  width: 142px;
  height: 56px;
  border: none;
  color: #8c331c;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
   background: transparent;
   
}

.tab-btn:first-child {
  border-radius: 12px 0 0 12px;
}

.tab-btn:last-child {
  border-left: none;
  border-radius: 0 12px 12px 0;
}

.tab-btn.active {
  box-shadow: inset 0 -4px 0 rgba(216, 177, 138, 0.45);
}

.content-box {
  flex: 0 1 auto;
  min-height: auto;
  border-radius: 16px;
  padding: 8px 8px;
  overflow: visible;
}

.intro-panel {
  height: auto;
  overflow-y: visible;
  display: grid;
  grid-template-columns: 700px 1fr;
  grid-template-rows: auto auto;
  gap: 2px;
  padding-right: 6px;
  align-content: start;
}

/* 轮播图区域 */
.intro-image {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  height: 400px;
  perspective: 1000px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-carousel-track {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-card {
  position: absolute;
  width: 300px;
  height: 320px;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.16);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.intro-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.7s ease;
}

.intro-card.center {
  z-index: 10;
  transform: scale(1.08) translateZ(0);
}

.intro-card.center img {
  filter: none;
}

.intro-card.left-1 {
  z-index: 6;
  transform: translateX(-130px) scale(0.9) translateZ(-90px);
  opacity: 0.92;
}

.intro-card.left-1 img {
  filter: grayscale(100%);
}

.intro-card.right-1 {
  z-index: 6;
  transform: translateX(130px) scale(0.9) translateZ(-90px);
  opacity: 0.92;
}

.intro-card.right-1 img {
  filter: grayscale(100%);
}

.intro-card.left-2 {
  z-index: 2;
  transform: translateX(-215px) scale(0.78) translateZ(-180px);
  opacity: 0.68;
}

.intro-card.left-2 img {
  filter: grayscale(100%);
}

.intro-card.right-2 {
  z-index: 2;
  transform: translateX(215px) scale(0.78) translateZ(-180px);
  opacity: 0.68;
}

.intro-card.right-2 img {
  filter: grayscale(100%);
}

.intro-card.hidden {
  opacity: 0;
  pointer-events: none;
}

.intro-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(125, 52, 33, 0.78);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.intro-nav-arrow:hover {
  transform: translateY(-50%) scale(1.08);
  background: rgba(111, 45, 29, 0.95);
}

.intro-nav-arrow.left {
  left: 14px;
}

.intro-nav-arrow.right {
  right: 14px;
}

.intro-dots {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 21;
}

.intro-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(125, 52, 33, 0.24);
  cursor: pointer;
  transition: all 0.25s ease;
}

.intro-dot.active {
  background: #7d3421;
  transform: scale(1.2);
}
.intro-text{
  background: url(@/assets/imgs/jieshao.png);
  background-size: cover;
  background-position: center;
  background-attachment: local;
  padding: 35px;
  height: 400px;           
  overflow-y: overlay;        
  display: flex;
  flex-direction: column;
  scrollbar-gutter: stable;
}

.intro-text h3 {
  margin: 0 0 5px;
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
  list-style: none;
  padding-left: 0; 
}

.intro-text::-webkit-scrollbar {
  width: 4px;
  height: 380px;
}
.intro-text::-webkit-scrollbar-track {
  background: transparent;
  margin: 35px 0; 
}
.intro-text::-webkit-scrollbar-thumb {
  background: rgba(125, 52, 33, 0.4);
  border-radius: 4px;
}

.action-row {
  margin-top: 15px;
  
}

.action-btn {
  border: none;
  background: linear-gradient(135deg, #fcd7c1, #c4a489);
  color: #fff;
  padding: 10px 26px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 15px;
  box-shadow: 0 8px 20px rgba(159, 74, 48, 0.26);
  
}

/* 美食流水线区域 */
.food-belt-section {
  grid-column: 1 / 3;
  margin-top: -4px;
  padding: 6px 0 0;
}

.food-belt-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
  margin-bottom: 14px;
  color: #7d3421;
}

.food-belt-header h3 {
  margin: 0;
  font-size: 22px;
}

.food-belt-header p {
  margin: 0;
  font-size: 13px;
  color: #8d6a58;
}

.food-belt-window {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  padding: 8px 0;
}

.food-belt-window::before,
.food-belt-window::after {
  content: "";
  position: absolute;
  top: 0;
  width: 90px;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.food-belt-window::before {
  left: 0;
  background: linear-gradient(90deg, rgba(244, 240, 233, 0.95), rgba(244, 240, 233, 0));
}

.food-belt-window::after {
  right: 0;
  background: linear-gradient(270deg, rgba(244, 240, 233, 0.95), rgba(244, 240, 233, 0));
}

.food-belt-track {
  display: flex;
  align-items: stretch;
  gap: 18px;
  width: max-content;
  animation: food-belt-scroll 24s linear infinite;
}

.food-belt-window:hover .food-belt-track {
  animation-play-state: paused;
}

.food-belt-card {
  width: 250px;
  min-width: 250px;
  height: 160px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(214, 195, 181, 0.72);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(117, 90, 67, 0.08);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(6px);
}

.food-belt-image {
  width: 100%;
  height: 120px;
  /* overflow: hidden; */
}

.food-belt-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.food-belt-card:hover .food-belt-image img {
  transform: scale(1.06);
}

.food-belt-info {
  padding: 10px 12px 12px;
}

.food-belt-info h4 {
  margin: 0;
  font-size: 16px;
  color: #6f2d1d;
  line-height: 1.2;
}

.food-belt-info span {
  display: inline-block;
  margin: 6px 0 8px;
  font-size: 12px;
  color: #a96f54;
  background: rgba(199, 119, 85, 0.12);
  border-radius: 999px;
  padding: 2px 10px;
}

.food-belt-info p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: #5c4a3d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes food-belt-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-33.333% - 6px));
  }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.comment-date {
  flex: 1;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-action {
  border: none;
  background: transparent;
  color: #a86b4c;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

.comment-action.like.active {
  color: #c85d39;
  font-weight: 700;
}

.comment-action.delete {
  color: #b04f35;
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
    grid-template-columns: 300px 1fr;
  }

  .intro-image {
    height: 320px;
  }
  .intro-text {
    height: 320px;  
  }

  .intro-card {
    width: 205px;
    height: 255px;
  }

  .intro-card.left-2 {
    transform: translateX(-150px) scale(0.78) translateZ(-180px);
  }

  .intro-card.right-2 {
    transform: translateX(150px) scale(0.78) translateZ(-180px);
  }

  .intro-card.left-1 {
    transform: translateX(-90px) scale(0.9) translateZ(-90px);
  }

  .intro-card.right-1 {
    transform: translateX(90px) scale(0.9) translateZ(-90px);
  }

  .food-belt-card {
    width: 220px;
    min-width: 220px;
  }
}

@media (max-width: 900px) {
  .detail-page {
    position: relative;  /* 移动端恢复相对定位 */
    display: block;
    overflow-y: auto;
    height: auto;
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
    overflow-y: visible;
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
    grid-template-rows: auto auto auto;
  }

  .intro-image {
    height: 300px;
  }

  .intro-card {
    width: 190px;
    height: 240px;
  }

  .intro-card.left-2 {
    transform: translateX(-120px) scale(0.74) translateZ(-150px);
  }

  .intro-card.right-2 {
    transform: translateX(120px) scale(0.74) translateZ(-150px);
  }

  .intro-card.left-1 {
    transform: translateX(-70px) scale(0.88) translateZ(-80px);
  }

  .intro-card.right-1 {
    transform: translateX(70px) scale(0.88) translateZ(-80px);
  }

  .food-belt-section {
    grid-column: 1 / 2;
  }

  .food-belt-window::before,
  .food-belt-window::after {
    width: 40px;
  }
}

@media (max-width: 640px) {
  .intro-image {
    height: 260px;
  }

  .intro-card {
    width: 150px;
    height: 190px;
  }

  .intro-card.left-2,
  .intro-card.right-2 {
    opacity: 0;
    pointer-events: none;
  }

  .intro-card.left-1 {
    transform: translateX(-52px) scale(0.84) translateZ(-60px);
  }

  .intro-card.right-1 {
    transform: translateX(52px) scale(0.84) translateZ(-60px);
  }

  .intro-nav-arrow {
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .food-belt-card {
    width: 190px;
    min-width: 190px;
    height: 168px;
  }

  .food-belt-image {
    height: 84px;
  }
}

@media (max-width: 900px) {
  .mist-half {
    width: 90vw;
    min-width: 420px;
  }

  .mist-center-panel {
    width: min(380px, 84vw);
    padding: 24px 22px 20px;
  }

  .mist-title {
    font-size: 22px;
  }

  .mist-text {
    font-size: 14px;
  }
}

</style>
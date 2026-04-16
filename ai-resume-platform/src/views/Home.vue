<template>
  <div class="home">
    <!-- 水墨晕染背景 -->
    <div class="ink-wash"></div>

    <!-- 宣纸纹理 -->
    <div class="paper-texture"></div>

    <!-- 古画地图容器 -->
    <div ref="mapContainerRef" class="map-container">
      <img :src="bgImg" class="map-img" />

      <!-- 白鹤 -->
      <img
        :src="baihe"
        class="crane"
        :class="{ flying: craneFlying, locked: navigating }"
        :style="craneStyle"
        alt="白鹤"
      />

      <!-- 地图题跋 -->
      <div class="map-inscription">
        <span class="inscription-text">江右九域图</span>
        <span class="inscription-seal">● 遊</span>
      </div>

      <!-- 山水印章装饰 -->
      <div class="map-seal top-left"></div>
      <div class="map-seal bottom-right"></div>

      <!-- 加载状态 -->
      <div v-if="regionLoading" class="region-loading">
        地区加载中...
      </div>

      <!-- 加载失败 -->
      <div v-else-if="regionError" class="region-loading error">
        {{ regionError }}
      </div>

      <!-- 地区标记 -->
      <div
        v-for="spot in regionList"
        :key="spot.id"
        class="spot"
        :style="{ left: spot.x + '%', top: spot.y + '%' }"
        @click="goRegion(spot, $event)"
      >
        <img v-if="spot.MapImg" :src="spot.MapImg" :alt="spot.name" />
      </div>

      <!-- 静态地图 -->
      <div class="static-maps">
        <img :src="Map1" class="static-map map1" />
        <img :src="Map2" class="static-map map2" />
        <img :src="Map3" class="static-map map3" />
        <img :src="Map4" class="static-map map4" />
        <img :src="Map5" class="static-map map5" />
      </div>
    </div>

    <!-- 古琴声波纹装饰 -->
    <div class="sound-wave"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { request } from "@/utils/request";
import bgImg from "../assets/imgs/JiangXiMap.png";

// 导入各城市印章图片
import Nanchang from "../assets/imgs/NanChang.png";
import Jiujiang from "../assets/imgs/JiuJiang.png";
import Shangrao from "../assets/imgs/ShangRao.png";
import Jingdezhen from "../assets/imgs/JingDeZhen.png";
import Jian from "../assets/imgs/JiAn.png";
import Ganzhou from "../assets/imgs/GanZhou.png";

import Map1 from "../assets/imgs/Map1.png";
import Map2 from "../assets/imgs/Map2.png";
import Map3 from "../assets/imgs/Map3.png";
import Map4 from "../assets/imgs/Map4.png";
import Map5 from "../assets/imgs/Map5.png";

// 白鹤GIF
import baihe from "../assets/imgs/crane_blue.gif";

const router = useRouter();

const regionList = ref([]);
const regionLoading = ref(false);
const regionError = ref("");
const mapContainerRef = ref(null);

// =========================
// 白鹤飞行状态
// =========================
const CRANE_WIDTH = 112;
const CRANE_HEIGHT = 112;

// 初始位置：左上角原地飞
const craneX = ref(28);
const craneY = ref(22);

// 1 表示朝右，-1 表示朝左
const craneDirection = ref(1);

// 是否正在飞行
const craneFlying = ref(false);

// 是否正在准备跳转，防止重复点击
const navigating = ref(false);

// 当前动画时长
const craneDuration = ref(0);

// 记录当前的飞行定时器
let flyTimer = null;

// 白鹤样式
const craneStyle = computed(() => {
  return {
    left: `${craneX.value}px`,
    top: `${craneY.value}px`,
    width: `${CRANE_WIDTH}px`,
    height: `${CRANE_HEIGHT}px`,
    transform: `translate(0, 0) scaleX(-1)`,
    transition: craneFlying.value
      ? `left ${craneDuration.value}ms cubic-bezier(0.22, 0.61, 0.36, 1), top ${craneDuration.value}ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.2s ease`
      : `transform 0.2s ease`
  };
});

// 地区名称与地图坐标的对应关系
const regionPositionMap = {
  南昌: {
    x: 88.1,
    y: 62.9,
    MapImg: Nanchang
  },
  九江: {
    x: 86.3,
    y: 58.4,
    MapImg: Jiujiang
  },
  上饶: {
    x: 92.15,
    y: 62,
    MapImg: Shangrao
  },
  景德镇: {
    x: 91.925,
    y: 58.6,
    MapImg: Jingdezhen
  },
  吉安: {
    x: 84.8,
    y: 73.3,
    MapImg: Jian
  },
  赣州: {
    x: 86.13,
    y: 80.4,
    MapImg: Ganzhou
  }
};

const fetchRegions = async () => {
  regionLoading.value = true;
  regionError.value = "";

  try {
    const res = await request("/api/regions", {
      method: "GET"
    });

    const list = Array.isArray(res?.data) ? res.data : [];

    regionList.value = list.map((item, index) => {
      const position = regionPositionMap[item.name] || {
        x: 50,
        y: 35 + index * 6,
        icon: "🏮"
      };

      return {
        ...item,
        ...position
      };
    });
  } catch (error) {
    regionList.value = [];
    regionError.value = error?.message || "地区获取失败";
  } finally {
    regionLoading.value = false;
  }
};

// 根据点击的 spot 计算白鹤目标坐标
const getTargetPointFromSpot = (event) => {
  const mapEl = mapContainerRef.value;
  const spotEl = event?.currentTarget;

  if (!mapEl || !spotEl) {
    return {
      x: craneX.value,
      y: craneY.value
    };
  }

  const mapRect = mapEl.getBoundingClientRect();
  const spotRect = spotEl.getBoundingClientRect();

  // spot 的中心点
  const spotCenterX = spotRect.left - mapRect.left + spotRect.width / 2;
  const spotCenterY = spotRect.top - mapRect.top + spotRect.height / 2;

  // 让白鹤中心更贴近印章中心，视觉上更自然
  const targetX = spotCenterX - CRANE_WIDTH / 2;
  const targetY = spotCenterY - CRANE_HEIGHT / 2 - 10;

  return {
    x: targetX,
    y: targetY
  };
};

// 计算飞行时长：距离越远，时间稍长，但限制范围
const getFlyDuration = (fromX, fromY, toX, toY) => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 你可以自行调这个速度参数
  const duration = distance * 2.2;

  return Math.max(700, Math.min(1800, Math.round(duration)));
};

// 飞到印章后再跳转
const flyToSpotThenNavigate = (item, event) => {
  const target = getTargetPointFromSpot(event);

  // 根据目标位置判断朝向
  craneDirection.value = target.x >= craneX.value ? 1 : -1;

  const duration = getFlyDuration(
    craneX.value,
    craneY.value,
    target.x,
    target.y
  );

  craneDuration.value = duration;
  craneFlying.value = true;

  // 开始飞
  craneX.value = target.x;
  craneY.value = target.y;

  // 飞行结束后停顿 0.3 秒再跳转
  flyTimer = window.setTimeout(() => {
    craneFlying.value = false;

    window.setTimeout(() => {
      sessionStorage.setItem(
        "jx_detail_transition",
        JSON.stringify({
          regionId: item.id,
          regionName: item.name,
          from: "home",
          time: Date.now()
        })
      );

      router.push({
        path: "/detail",
        query: {
          regionId: item.id,
          regionName: item.name
        }
      });
    }, 300);
  }, duration);
};

const goRegion = (item, event) => {
  if (navigating.value || craneFlying.value) return;

  navigating.value = true;
  flyToSpotThenNavigate(item, event);
};

onMounted(() => {
  fetchRegions();
});

onBeforeUnmount(() => {
  if (flyTimer) {
    clearTimeout(flyTimer);
    flyTimer = null;
  }
});
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #ede5d4;
}

/* 水墨晕染背景 */
.ink-wash {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(100, 80, 50, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 70%, rgba(80, 60, 40, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(120, 90, 60, 0.05) 0%, transparent 60%);
  pointer-events: none;
  z-index: 1;
}

/* 宣纸纹理 */
.paper-texture {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="none" stroke="rgba(100,70,40,0.08)" stroke-width="0.4" d="M15 25 L185 25 M15 45 L185 45 M15 65 L185 65 M15 85 L185 85 M15 105 L185 105 M15 125 L185 125 M15 145 L185 145 M15 165 L185 165 M15 185 L185 185 M35 10 L35 190 M55 10 L55 190 M75 10 L75 190 M95 10 L95 190 M115 10 L115 190 M135 10 L135 190 M155 10 L155 190 M175 10 L175 190"/></svg>');
  background-repeat: repeat;
  background-size: 35px 35px;
  opacity: 0.35;
  pointer-events: none;
  z-index: 1;
}

/* 地图容器 */
.map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
}

.map-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 58% center;
  filter: sepia(0.15) contrast(1.05) brightness(1.02);
  transition: all 0.3s;
}

/* 白鹤 */
.crane {
  position: absolute;
  z-index: 11;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  transform-origin: center center;
  filter: drop-shadow(0 8px 14px rgba(40, 60, 90, 0.16));
  transform: scaleX(-1);
  will-change: left, top, transform;
}

.crane.flying {
  filter: drop-shadow(0 12px 18px rgba(40, 60, 90, 0.22));
}

.crane.locked {
  pointer-events: none;
}

/* 地图题跋 */
.map-inscription {
  position: absolute;
  bottom: 20px;
  right: 25px;
  text-align: right;
  z-index: 3;
  background: rgba(240, 230, 210, 0.7);
  backdrop-filter: blur(4px);
  padding: 8px 16px;
  border-radius: 30px;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  pointer-events: none;
  border: 1px solid rgba(180, 140, 90, 0.4);
}

.inscription-text {
  font-size: 12px;
  color: #7a6230;
  letter-spacing: 2px;
  margin-right: 8px;
}

.inscription-seal {
  font-size: 11px;
  color: #b87c4a;
  border-left: 1px solid #c9aa5f;
  padding-left: 8px;
}

/* 地图印章装饰 */
.map-seal {
  position: absolute;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 100, 70, 0.2), rgba(140, 70, 50, 0.1));
  pointer-events: none;
  z-index: 2;
}

.map-seal.top-left {
  top: 30px;
  left: 30px;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(160, 100, 70, 0.15), transparent);
}

.map-seal.bottom-right {
  bottom: 40px;
  left: 40px;
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, rgba(140, 90, 60, 0.12), transparent);
}

/* 加载提示 */
.region-loading {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 12;
  padding: 10px 16px;
  border-radius: 14px;
  background: rgba(50, 40, 28, 0.82);
  color: #ecdba8;
  border: 1px solid rgba(200, 170, 100, 0.45);
  backdrop-filter: blur(4px);
  font-size: 14px;
  font-family: "STKaiti", serif;
}

.region-loading.error {
  color: #f0b199;
}

/* 标记容器 */
.spot {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
}

.spot img {
  object-fit: contain;
  transition: all 0.3s ease;
  display: block;
  margin: 0 auto;
  height: auto;
}

/* 根据不同城市调整大小 */
.spot img[alt="南昌"] {
  width: 3.4vw !important;
}

.spot img[alt="九江"] {
  width: 8.7vw !important;
}

.spot img[alt="上饶"] {
  width: 6.55vw !important;
}

.spot img[alt="景德镇"] {
  width: 2.25vw !important;
}

.spot img[alt="吉安"] {
  width: 6.5vw !important;
}

.spot img[alt="赣州"] {
  width: 8.5vw !important;
}

/* 悬停效果 */
.spot img:hover {
  transform: scale(1.1);
}

/* 点击按下效果 */
.spot img:active {
  transform: scale(0.95);
}

/* 静态地图图片容器 */
.static-maps {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.static-map {
  position: absolute;
  object-fit: contain;
  transform: translate(-50%, -50%);
}

/* 右一 */
.map1 {
  top: 65.4%;
  left: 91.4%;
  width: 2.5vw;
  height: auto;
}

/* 左上 */
.map2 {
  top: 65.1%;
  left: 85.35%;
  width: 6.8vw;
  height: auto;
}

/* 右下 */
.map3 {
  top: 70%;
  left: 89.5%;
  width: 5.3vw;
  height: auto;
}

/* 左下 */
.map4 {
  top: 70.5%;
  left: 82%;
  width: 2.3vw;
  height: auto;
}

/* 中 */
.map5 {
  top: 68.2%;
  left: 84.95%;
  width: 2.6vw;
  height: auto;
}

/* 古琴声波纹装饰 */
.sound-wave {
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 40px;
  pointer-events: none;
  z-index: 5;
  opacity: 0.4;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 3px,
    rgba(140, 100, 60, 0.3) 3px,
    rgba(140, 100, 60, 0.3) 5px
  );
  border-radius: 4px;
}
</style>
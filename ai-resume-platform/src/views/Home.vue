<template>
  <div class="home">
    <!-- 水墨晕染背景 -->
    <div class="ink-wash"></div>

    <!-- 宣纸纹理 -->
    <div class="paper-texture"></div>

    <!-- 古画地图容器 -->
    <div class="map-container">
      <img :src="bgImg" class="map-img" />

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
        @click="goRegion(spot)"
      >
        <img v-if="spot.MapImg" :src="spot.MapImg" :alt="spot.name" />
      </div>
    </div>
    <!-- 古琴声波纹装饰 -->
    <div class="sound-wave"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
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

const router = useRouter();

const regionList = ref([]);
const regionLoading = ref(false);
const regionError = ref("");

// 地区名称与地图坐标的对应关系
const regionPositionMap = {
  南昌: { 
    x: 87.55, y: 62.5, 
    MapImg: Nanchang
  }, 
  九江: { 
    x: 85.8, y: 58.2, 
    MapImg: Jiujiang
  }, 
  上饶: { 
    x: 91.5, y: 61.94, 
    MapImg: Shangrao
  }, 
  景德镇: { 
    x: 91.35, y: 58.3, 
    MapImg: Jingdezhen
  }, 
  吉安: { 
    x: 84.46, y: 72.7, 
    MapImg: Jian
  }, 
  赣州: { 
    x: 85.6, y: 79.7, 
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

const goRegion = (item) => {
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
};

onMounted(() => {
  fetchRegions();
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
  object-position: 60% center; 
  filter: sepia(0.15) contrast(1.05) brightness(1.02);
  transition: all 0.3s;
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
}
.spot:has(img[alt="南昌"]) {
  z-index: 20;
}

/* 南昌图片单独大小 */
.spot img[alt="南昌"] {
  width: 48px !important;
  height: 48px !important;
}
/* 九江图片单独大小 */
.spot img[alt="九江"] {
  width: 123.5px !important;
  height: 123.5px !important;
}
/* 上饶图片单独大小 */
.spot img[alt="上饶"] {
  width: 100px !important;
  height: 100px !important;
}
/* 景德镇图片单独大小 */
.spot img[alt="景德镇"] {
  width: 61px !important;
  height: 61px !important;
  transform: rotate(-10deg);
}
/* 吉安图片单独大小 */
.spot img[alt="吉安"] {
  width: 97px !important;
  height: 97px !important;
}
/* 赣州图片单独大小 */
.spot img[alt="赣州"] {
  width: 130px !important;
  height: 130px !important;
}

.spot img:hover {
  transform: scale(1.1);
}

/* 点击按下效果 */
.spot img:active {
  transform: scale(0.95);
}

/* 景德镇悬停：旋转+缩放 */
.spot img[alt="景德镇"]:hover {
  transform: rotate(-10deg) scale(1.1);
}

/* 景德镇点击按下：旋转+缩小 */
.spot img[alt="景德镇"]:active {
  transform: rotate(-10deg) scale(0.95);
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
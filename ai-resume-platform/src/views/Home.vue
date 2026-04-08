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
        <!-- 灯笼标记 -->
        <div class="lantern-marker" :style="{ '--color': spot.color }">
          <div class="lantern-head"></div>
          <div class="lantern-content" :style="{ background: spot.lightBg }">
            <img 
              v-if="spot.sealImg" 
              :src="spot.sealImg" 
              class="lantern-seal" 
              alt="印章"
            />
            <span class="lantern-name">{{ spot.name }}</span>
          </div>
          <div class="lantern-tassel"></div>
        </div>
        <div class="lantern-light" :style="{ '--color': spot.color }"></div>
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
import sealNanchang from "../assets/seal/NanChang.png";
import sealJiujiang from "../assets/seal/JiuJiang.png";
import sealShangrao from "../assets/seal/ShangRao.png";
import sealJingdezhen from "../assets/seal/JingDeZhen.png";
import sealJian from "../assets/seal/JiAn.png";
import sealGanzhou from "../assets/seal/GanZhou.png";

const router = useRouter();

const regionList = ref([]);
const regionLoading = ref(false);
const regionError = ref("");

// 地区名称与地图坐标的对应关系
const regionPositionMap = {
  南昌: { 
    x: 49.5, y: 30.5, 
    sealImg: sealNanchang, 
    color: "#D92B2B",
    lightBg: "rgba(245, 160, 160, 0.85)"  // 粉红 + 透明度
  }, 
  九江: { 
    x: 45.5, y: 19.5, 
    sealImg: sealJiujiang, 
    color: "#165DFF",
    lightBg: "rgba(168, 200, 255, 0.85)"  // 浅蓝 + 透明度
  }, 
  上饶: { 
    x: 61.5, y: 30.5, 
    sealImg: sealShangrao, 
    color: "#00B42A",
    lightBg: "rgba(160, 230, 176, 0.85)"  // 浅绿 + 透明度
  }, 
  景德镇: { 
    x: 57.5, y: 23.5, 
    sealImg: sealJingdezhen, 
    color: "#FF7D00",
    lightBg: "rgba(255, 209, 160, 0.85)"  // 浅橙 + 透明度
  }, 
  吉安: { 
    x: 42.5, y: 55.5, 
    sealImg: sealJian, 
    color: "#00C1D4",
    lightBg: "rgba(160, 240, 245, 0.85)"  // 浅青 + 透明度
  }, 
  赣州: { 
    x: 43.5, y: 75.5, 
    sealImg: sealGanzhou, 
    color: "#AB2893",
    lightBg: "rgba(229, 176, 216, 0.85)"  // 浅紫 + 透明度
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

/* 主体：雅致水墨挂牌 + 流苏组合 */
.lantern-marker {
  --color: #961e1e;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1));
}

/* 顶部挂绳（古风画轴感） */
.lantern-head {
  width: 18px;
  height: 8px;
  background: var(--color);
  border-radius: 50% 50% 0 0;
  margin-bottom: 0;
}
.lantern-seal {
  width: 20px;   
  height: 20px;  
  object-fit: contain; 
  filter: sepia(0.1) contrast(1.1); 
}
/* 主体牌：水墨圆角长牌 */
.lantern-content {
  min-height: 32px;
  padding: 8px 10px;
  border: 1px solid var(--color);
  border-radius: 50% 50% 40% 40%;
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

/* 多流苏 · 轻盈飘渺 */
.lantern-tassel {
  width: 20px;
  height: 24px;
  background: linear-gradient(to bottom,
    var(--color),
    var(--color) 1px,
    transparent 1px,
    transparent 2px,
    var(--color) 2px,
    var(--color) 3px,
    transparent 3px,
    transparent 4px,
    var(--color) 4px
  );
  opacity: 0.7;
  animation: tassel-swing 3s ease-in-out infinite alternate;
}
@keyframes tassel-swing {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

/* 图标：篆体小印 */
.lantern-icon {
  font-size: 16px;
  color: var(--color);
  font-weight: bold;
  font-family: "STKaiti", serif;
  text-shadow: 0 0 1px rgba(0,0,0,0.1);
}

/* 城市名：书法排版 */
.lantern-name {
  font-size: 14px;
  font-family: "STKaiti", "KaiTi", serif;
  color: #2b231c;
  letter-spacing: 1.5px;
  font-weight: 500;
}

/* 悬浮：轻轻上浮 + 墨色加深 */
.spot:hover .lantern-marker {
  transform: scale(1.06) translateY(-3px);
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.15));
}
.spot:hover .lantern-content {
  background: rgba(250, 240, 225, 0.95);
  border-color: var(--color);
}

/* 光晕：淡墨扩散 · 不刺眼 */
.lantern-light {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 180%;
  background: radial-gradient(circle, var(--color), transparent 80%);
  opacity: 0.1;
  border-radius: 50%;
  pointer-events: none;
  animation: glow 3s ease-in-out infinite alternate;
}
@keyframes glow {
  0% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0.18; transform: translate(-50%, -50%) scale(1.08); }
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

/* 响应式 */
@media (max-width: 500px) {
  .lantern-name { display: none; }
  .lantern-content { 
    min-width: unset; 
    padding: 6px 8px; /* 调整内边距 */
    justify-content: center; /* 印章居中 */
  }
  .lantern-seal {
    width: 18px; /* 移动端缩小印章 */
    height: 18px;
  }
}
</style>
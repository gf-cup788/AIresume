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
        <span class="inscription-text">江右胜迹图</span>
        <span class="inscription-seal">● 遊</span>
      </div>
      
      <!-- 山水印章装饰 -->
      <div class="map-seal top-left"></div>
      <div class="map-seal bottom-right"></div>
    </div>
    
    <!-- 景点标记 - 古风图钉 -->
    <div
      v-for="spot in scenicList"
      :key="spot.id"
      class="spot"
      :style="{
        left: spot.x + '%',
        top: spot.y + '%'
      }"
      @click="selectSpot(spot)"
    >
      <div class="spot-marker" :class="{ active: selected?.id === spot.id }">
        <span class="marker-icon">{{ spot.icon }}</span>
        <span class="marker-name">{{ spot.name }}</span>
      </div>
      <div class="spot-ripple"></div>
    </div>
    
    <!-- 景点诗签卡片 - 居中模态框 -->
    <div v-if="selected" class="modal-overlay" @click="closeCard">
      <div class="poem-card" @click.stop>
        <button class="close-btn" @click="closeCard">
          <span class="close-icon">✕</span>
        </button>
        
        <div class="card-scroll">
          <div class="card-header">
            <span class="header-left">❀</span>
            <span class="header-title">{{ selected.name }}</span>
            <span class="header-right">❀</span>
          </div>
          <div class="card-poem">{{ selected.poem }}</div>
          <div class="card-desc">{{ selected.desc }}</div>
          <div class="card-footer">
            <button class="enter-btn" @click="goDetail">
              <span class="btn-icon">🏮</span>
              <span>入画寻幽</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </div>
        <div class="card-seal"></div>
      </div>
    </div>
    
    <!-- 古琴声波纹装饰 -->
    <div class="sound-wave"></div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import bgImg from "../assets/imgs/bg.jpg";

const router = useRouter();

const selected = ref(null);

// 景点数据 - 增加古风元素
const scenicList = ref([
  {
    id: 1,
    name: "庐山",
    x: 55,
    y: 35,
    icon: "🏔️",
    poem: "飞流直下三千尺，疑是银河落九天",
    desc: "匡庐奇秀甲天下，云雾缭绕，瀑布如练，太白居士曾在此留下千古绝唱。"
  },
  {
    id: 2,
    name: "井冈山",
    x: 40,
    y: 70,
    icon: "⛰️",
    poem: "星星之火，可以燎原",
    desc: "中国革命的摇篮，红色精神的发源地，巍巍井冈，浩气长存。"
  },
  {
    id: 3,
    name: "婺源",
    x: 70,
    y: 45,
    icon: "🌸",
    poem: "黄萼裳裳绿叶稠，千村欣卜榨新油",
    desc: "中国最美乡村，白墙黛瓦，油菜花海，徽州人家，水墨江南。"
  }
]);

const selectSpot = (spot) => {
  selected.value = spot;
};

const closeCard = () => {
  selected.value = null;
};

const goDetail = () => {
  router.push({
    path: "/detail",
    query: { id: selected.value.id }
  });
};
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
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.map-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* 景点标记 - 古风设计 */
.spot {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.spot-marker {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(50, 40, 28, 0.85);
  backdrop-filter: blur(4px);
  padding: 6px 14px 6px 10px;
  border-radius: 40px;
  border: 1px solid rgba(200, 170, 100, 0.6);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.2s;
  position: relative;
  z-index: 2;
}

.spot:hover .spot-marker {
  transform: scale(1.08);
  background: rgba(80, 65, 45, 0.95);
  border-color: #c9aa5f;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.spot-marker.active {
  background: linear-gradient(135deg, #c9aa5f, #b88d4a);
  border-color: #ecdba8;
  box-shadow: 0 0 12px rgba(200, 170, 100, 0.5);
}

.spot-marker.active .marker-icon {
  filter: none;
}

.spot-marker.active .marker-name {
  color: #2a2418;
}

.marker-icon {
  font-size: 18px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
}

.marker-name {
  font-size: 13px;
  font-weight: 500;
  color: #ecdba8;
  font-family: "STKaiti", serif;
  letter-spacing: 1px;
}

.spot-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 170, 100, 0.4), transparent);
  opacity: 0;
  transition: all 0.3s;
  pointer-events: none;
}

.spot:hover .spot-ripple {
  animation: ripple 1.2s ease-out infinite;
}

@keyframes ripple {
  0% {
    width: 100%;
    height: 100%;
    opacity: 0.6;
  }
  100% {
    width: 180%;
    height: 180%;
    opacity: 0;
  }
}

/* ========== 模态框遮罩 ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 诗签卡片 - 居中显示 */
.poem-card {
  position: relative;
  width: 380px;
  max-width: 85vw;
  background: rgba(30, 24, 18, 0.96);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(200, 170, 100, 0.6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  animation: cardPop 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  z-index: 101;
}

@keyframes cardPop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(200, 170, 100, 0.2);
  border: 1px solid rgba(200, 170, 100, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
  font-size: 16px;
  color: #ecdba8;
}

.close-btn:hover {
  background: rgba(200, 170, 100, 0.4);
  transform: rotate(90deg);
  border-color: #c9aa5f;
}

.close-icon {
  font-size: 16px;
  line-height: 1;
}

.card-scroll {
  padding: 32px 24px 28px;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(200, 170, 100, 0.4);
}

.header-left, .header-right {
  font-size: 14px;
  color: #c9aa5f;
  opacity: 0.7;
}

.header-title {
  font-size: 28px;
  font-weight: 400;
  color: #ecdba8;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  letter-spacing: 6px;
}

.card-poem {
  text-align: center;
  font-size: 15px;
  color: #d4bc84;
  font-style: italic;
  line-height: 1.7;
  margin-bottom: 20px;
  padding: 14px;
  background: rgba(200, 170, 100, 0.1);
  border-radius: 16px;
  border-left: 2px solid #c9aa5f;
  border-right: 2px solid #c9aa5f;
  font-family: "STKaiti", serif;
}

.card-desc {
  font-size: 14px;
  color: #e0d0b0;
  line-height: 1.7;
  margin-bottom: 24px;
  text-align: justify;
}

.card-footer {
  text-align: center;
}

.enter-btn {
  background: linear-gradient(135deg, #c9aa5f, #b88d4a);
  border: none;
  padding: 12px 32px;
  border-radius: 50px;
  font-size: 15px;
  color: #2a2418;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: "STKaiti", serif;
  transition: all 0.3s;
  letter-spacing: 2px;
}

.enter-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #e0bc74, #c9aa5f);
  gap: 16px;
}

.btn-icon {
  font-size: 16px;
}

.btn-arrow {
  font-size: 14px;
  transition: transform 0.2s;
}

.enter-btn:hover .btn-arrow {
  transform: translateX(5px);
}

.card-seal {
  position: absolute;
  bottom: 16px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 100, 70, 0.5), rgba(160, 70, 50, 0.3));
  opacity: 0.5;
  pointer-events: none;
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
  background: repeating-linear-gradient(90deg, 
    transparent, 
    transparent 3px,
    rgba(140, 100, 60, 0.3) 3px,
    rgba(140, 100, 60, 0.3) 5px);
  border-radius: 4px;
}

/* 响应式 */
@media (max-width: 600px) {
  .poem-card {
    width: 90vw;
  }
  
  .card-scroll {
    padding: 28px 20px 24px;
  }
  
  .header-title {
    font-size: 22px;
    letter-spacing: 4px;
  }
  
  .card-poem {
    font-size: 13px;
  }
  
  .card-desc {
    font-size: 13px;
  }
  
  .close-btn {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
  }
  
  .marker-name {
    font-size: 11px;
  }
  
  .spot-marker {
    padding: 4px 10px 4px 8px;
  }
  
  .map-inscription {
    bottom: 12px;
    right: 12px;
    padding: 4px 12px;
  }
  
  .inscription-text {
    font-size: 10px;
  }
}

@media (max-width: 500px) {
  .marker-name {
    display: none;
  }
  
  .spot-marker {
    padding: 6px;
  }
  
  .marker-icon {
    font-size: 20px;
  }
}
</style>
<template>
  <div class="intro-page" ref="pageRef" @scroll="handleScroll">
    <!-- 开场页 -->
    <section class="hero-section">
      <!-- 背景 -->
      <div class="bg-layer">
        <div class="bg-image breathing-bg"></div>
        <div class="bg-mask"></div>
        <div class="bg-light light-breath"></div>
        <div class="mist mist-1 mist-move-1"></div>
        <div class="mist mist-2 mist-move-2"></div>
        <div class="mist mist-3 mist-move-3"></div>
      </div>

      <!-- 顶部按钮 
      <div class="top-actions">
        <button class="back-btn" @click="goSecondScreenSmooth">返回首页</button>
      </div>
      -->

      <!-- 标题 -->
      <div class="hero-content" :style="titleStyle">
        <div class="title-en fade-up delay-1">Jiangxi Cultural Travel</div>

        <div class="title-badge fade-up delay-2">赣鄱风华</div>

        <h1 class="title-main fade-up delay-3">云游江西</h1>

        <div class="title-sub fade-up delay-4">山水入画，烟火入城，人文入心</div>

        <div class="intro-text fade-up delay-5">
          从滕王阁的千古风流，到婺源的粉墙黛瓦；<br />
          从景德镇的窑火不息，到庐山云海的诗意流转。
        </div>

        <div class="scroll-tip fade-up delay-6" @click="scrollToHomeSmooth">
          <div class="tip-circle">
            <span>向下</span>
            <span class="arrow">↓</span>
          </div>
        </div>
      </div>

      <!-- 山体 -->
      <div class="mountain-layer">
        <!-- 左后 -->
        <div class="mountain left back mountain-float-slow" :style="leftBackStyle">
          <img :src="shanImg" alt="山" />
        </div>

        <!-- 左前 -->
        <div class="mountain left front mountain-float" :style="leftFrontStyle">
          <img :src="shanImg" alt="山" />
        </div>

        <!-- 右后 -->
        <div class="mountain right back mountain-float-slow" :style="rightBackStyle">
          <img :src="shanImg" alt="山" />
        </div>

        <!-- 右前 -->
        <div class="mountain right front mountain-float" :style="rightFrontStyle">
          <img :src="shanImg" alt="山" />
        </div>

        <div class="bottom-mask"></div>
      </div>
    </section>

    <!-- 第二屏 -->
    <section class="home-section">
      <Home />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import Home from './Home.vue'
import shanImg from '@/assets/imgs/shan.png'

const route = useRoute()

const pageRef = ref(null)
const scrollTop = ref(0)

const handleScroll = () => {
  if (!pageRef.value) return
  scrollTop.value = pageRef.value.scrollTop
}

const progress = computed(() => {
  const h = window.innerHeight || 900
  return Math.min(scrollTop.value / h, 1)
})

/* 标题动画 */
const titleStyle = computed(() => {
  const p = progress.value
  return {
    transform: `translate(-50%, calc(-50% - ${p * 80}px))`,
    opacity: 1 - p
  }
})

/* 四座山分开动画 */
const leftBackStyle = computed(() => {
  const p = progress.value
  return {
    transform: `translateX(-${p * 240}px)`
  }
})

const leftFrontStyle = computed(() => {
  const p = progress.value
  return {
    transform: `translateX(-${p * 350}px)`
  }
})

const rightBackStyle = computed(() => {
  const p = progress.value
  return {
    transform: `translateX(${p * 240}px)`
  }
})

const rightFrontStyle = computed(() => {
  const p = progress.value
  return {
    transform: `translateX(${p * 350}px)`
  }
})

/* 平滑滚到第二屏：IntroHome 内部点击时用 */
const scrollToHomeSmooth = () => {
  if (!pageRef.value) return
  pageRef.value.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  })
}

/* 瞬间到第二屏：其他页面跳过来时用 */
const scrollToHomeInstant = () => {
  if (!pageRef.value) return

  pageRef.value.style.scrollBehavior = 'auto'
  pageRef.value.scrollTop = window.innerHeight

  setTimeout(() => {
    pageRef.value.style.scrollBehavior = 'smooth'
  }, 0)
}

/* 当前页顶部按钮：保留滚动动画 */
const goSecondScreenSmooth = () => {
  scrollToHomeSmooth()
}

/* 根据路由参数决定进入时的位置 */
const handleRouteTarget = async () => {
  await nextTick()
  if (!pageRef.value) return

  if (route.query.target === 'home') {
    scrollToHomeInstant()
  } else {
    pageRef.value.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  }
}

onMounted(() => {
  handleRouteTarget()
})

watch(
  () => route.query.target,
  () => {
    handleRouteTarget()
  }
)
</script>

<style scoped>
.intro-page {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  background: #f4eee5;
  scrollbar-width: none;
}

.intro-page::-webkit-scrollbar {
  display: none;
}

.hero-section,
.home-section {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* 背景 */
.hero-section {
  overflow: hidden;
  background: url("@/assets/imgs/tenwangge.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.bg-image {
  position: absolute;
  inset: 0;
  background: url('@/assets/imgs/people.jpg') center/cover no-repeat;
  filter: blur(10px) brightness(1.1);
  opacity: 0.35;
}

.bg-mask {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
}

.bg-light {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 200, 150, 0.4), transparent);
  filter: blur(40px);
}

/* ===== 背景呼吸 ===== */
.breathing-bg {
  animation: bgBreath 8s ease-in-out infinite;
}

@keyframes bgBreath {
  0%, 100% {
    transform: scale(1);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.03);
    opacity: 0.42;
  }
}

/* ===== 暖光呼吸 ===== */
.light-breath {
  animation: lightBreath 5.5s ease-in-out infinite;
}

@keyframes lightBreath {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateX(-50%) scale(1.08);
    opacity: 1;
  }
}

.mist {
  position: absolute;
  width: 140%;
  left: -20%;
  height: 100px;
  background: rgba(255, 255, 255, 0.32);
  filter: blur(22px);
}

.mist-1 {
  top: 20%;
}

.mist-2 {
  top: 50%;
}

.mist-3 {
  bottom: 10%;
}

/* ===== 云雾飘动 ===== */
.mist-move-1 {
  animation: mistDrift1 16s ease-in-out infinite alternate;
}

.mist-move-2 {
  animation: mistDrift2 20s ease-in-out infinite alternate;
}

.mist-move-3 {
  animation: mistDrift3 18s ease-in-out infinite alternate;
}

@keyframes mistDrift1 {
  0% {
    transform: translateX(0);
    opacity: 0.26;
  }
  100% {
    transform: translateX(80px);
    opacity: 0.42;
  }
}

@keyframes mistDrift2 {
  0% {
    transform: translateX(0);
    opacity: 0.22;
  }
  100% {
    transform: translateX(-100px);
    opacity: 0.38;
  }
}

@keyframes mistDrift3 {
  0% {
    transform: translateX(0);
    opacity: 0.2;
  }
  100% {
    transform: translateX(60px);
    opacity: 0.34;
  }
}

/* 顶部按钮 */
/* .top-actions {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
}

.back-btn {
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  background: white;
  color: #8b5e3c;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(170, 145, 120, 0.12);
} */

/* 标题 */
.hero-content {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 20;
  width: 100%;
  padding: 0 20px;
}

.title-en {
  color: rgba(143, 106, 83, 0.78);
  font-size: 14px;
  letter-spacing: 4px;
  margin-bottom: 14px;
}

.title-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 98px;
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  margin-bottom: 18px;
  background: rgba(255, 255, 255, 0.52);
  color: #a15c3f;
  font-size: 14px;
  letter-spacing: 2px;
  box-shadow: 0 10px 18px rgba(184, 154, 129, 0.1);
}

.title-main {
  margin: 0;
  color: #8b3f2c;
  font-size: clamp(58px, 9vw, 118px);
  font-weight: 700;
  letter-spacing: 10px;
  line-height: 1.08;
  font-family: 'STKaiti', 'KaiTi', '华文楷体', serif;
  text-shadow: 0 10px 22px rgba(190, 162, 138, 0.2);
  animation: titleBreath 4.5s ease-in-out infinite;
}

@keyframes titleBreath {
  0%, 100% {
    text-shadow: 0 10px 22px rgba(190, 162, 138, 0.2);
    transform: scale(1);
  }
  50% {
    text-shadow: 0 14px 30px rgba(190, 162, 138, 0.3);
    transform: scale(1.015);
  }
}

.title-sub {
  margin-top: 18px;
  color: #9c7a64;
  font-size: 17px;
  letter-spacing: 3px;
}

.intro-text {
  margin: 20px auto 0;
  max-width: 660px;
  color: rgba(113, 95, 83, 0.82);
  font-size: 14px;
  line-height: 2;
  letter-spacing: 1px;
}

/* ===== 标题依次淡入 ===== */
.fade-up {
  opacity: 0;
  transform: translateY(26px);
  animation: fadeUpIn 1s ease forwards;
}

.delay-1 { animation-delay: 0.15s; }
.delay-2 { animation-delay: 0.3s; }
.delay-3 { animation-delay: 0.5s; }
.delay-4 { animation-delay: 0.75s; }
.delay-5 { animation-delay: 0.95s; }
.delay-6 { animation-delay: 1.15s; }

@keyframes fadeUpIn {
  0% {
    opacity: 0;
    transform: translateY(26px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 下滑按钮 */
.scroll-tip {
  margin-top: 34px;
  display: flex;
  justify-content: center;
}

.tip-circle {
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(177, 140, 114, 0.18);
  box-shadow:
    inset 0 0 20px rgba(255, 255, 255, 0.16),
    0 12px 28px rgba(186, 159, 135, 0.12);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s ease;
  cursor: pointer;
  user-select: none;
  animation: tipBreath 3.2s ease-in-out infinite;
}

.tip-circle:hover {
  transform: translateY(-4px);
}

@keyframes tipBreath {
  0%, 100% {
    box-shadow:
      inset 0 0 20px rgba(255, 255, 255, 0.16),
      0 12px 28px rgba(186, 159, 135, 0.12);
  }
  50% {
    box-shadow:
      inset 0 0 24px rgba(255, 255, 255, 0.24),
      0 16px 34px rgba(186, 159, 135, 0.2);
  }
}

.arrow {
  color: #a56547;
  font-size: 24px;
  animation: arrowMove 1.5s ease-in-out infinite;
}

@keyframes arrowMove {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.75;
  }
  50% {
    transform: translateY(6px);
    opacity: 1;
  }
}

/* 山体 */
.mountain-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

.mountain {
  position: absolute;
  bottom: 0;
  overflow: visible;
  transition: transform 0.03s linear;
  will-change: transform;
}

.mountain img {
  position: absolute;
  bottom: -65px;
  height: 100%;
  object-fit: fill;
  filter:
    saturate(0.75)
    brightness(1.04)
    contrast(0.9);
}

/* ===== 山体轻微浮动 ===== */
.mountain-float {
  animation: mountainFloat 6s ease-in-out infinite;
}

.mountain-float-slow {
  animation: mountainFloatSlow 8s ease-in-out infinite;
}

/* @keyframes mountainFloat {
  0%, 100% {
    margin-bottom: 0;
  }
  50% {
    margin-bottom: 8px;
  }
}

@keyframes mountainFloatSlow {
  0%, 100% {
    margin-bottom: 0;
  }
  50% {
    margin-bottom: 5px;
  }
} */

/* 前景山 */
.mountain.front {
  width: 32vw;
  height: 50vh;
  opacity: 0.9;
  z-index: 12;
}

.mountain.front img {
  width: 115%;
  opacity: 1;
}

/* 后景山 */
.mountain.back {
  width: 26vw;
  height: 38vh;
  opacity: 0.8;
  z-index: 11;
}

.mountain.back img {
  width: 150%;
  opacity: 0.9;
  filter:
    saturate(0.68)
    brightness(1.08)
    contrast(0.88);
}

/* 左侧 */
.left.front {
  left: 0;
  bottom: 0;
}

.left.front img {
  left: -28%;
}

.left.back {
  left: 8vw;
  bottom: 4vh;
}

.left.back img {
  left: -8%;
}

/* 右侧 */
.right.front {
  right: 0;
  bottom: 0;
}

.right.front img {
  right: -28%;
  transform: scaleX(-1);
}

.right.back {
  right: 8vw;
  bottom: 4vh;
}

.right.back img {
  right: -8%;
  transform: scaleX(-1);
}

.bottom-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 20vh;
  background: linear-gradient(
    to top,
    rgba(239, 232, 222, 0.98),
    rgba(239, 232, 222, 0.35),
    transparent
  );
}

/* 第二屏 */
.home-section {
  height: 100vh;
  background: #f4eee5;
}

@media (max-width: 900px) {
  .hero-content {
    top: 40%;
  }

  .title-main {
    letter-spacing: 4px;
  }

  .title-sub {
    font-size: 14px;
    letter-spacing: 2px;
  }

  .intro-text {
    max-width: 88%;
    font-size: 13px;
    line-height: 1.9;
  }

  .tip-circle {
    width: 92px;
    height: 92px;
  }

  .mountain.front {
    width: 52vw;
    height: 24vh;
  }

  .mountain.front img {
    width: 178%;
  }

  .mountain.back {
    width: 42vw;
    height: 18vh;
  }

  .mountain.back img {
    width: 172%;
  }

  .left.back {
    left: 4vw;
    bottom: 0;
  }

  .right.back {
    right: 4vw;
    bottom: 0;
  }

  .back-btn {
    padding: 8px 14px;
    font-size: 12px;
  }
}
</style>
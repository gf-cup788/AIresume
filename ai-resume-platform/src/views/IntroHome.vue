<template>
  <div class="intro-home-wrapper">

    <!-- 🎬 开场视频 -->
    <div
      v-if="showVideo"
      class="video-container"
      :class="{ freeze: videoEnded, fadeOut: videoFadeOut }"
    >
      <video
        ref="videoRef"
        class="opening-video"
        autoplay
        muted
        playsinline
        @ended="handleVideoEnd"
      >
        <source src="@/assets/imgs/open.mp4" type="video/mp4" />
      </video>

      <div class="blur-mask" :class="{ active: videoEnded }"></div>
      <div class="skip-btn" @click="skipVideo">跳过 >></div>
    </div>

    <!-- 页面内容 -->
    <div
      class="page-content"
      :class="{ show: pageVisible, preShow: showVideo }"
    >
      <div class="intro-page" ref="pageRef" @scroll="handleScroll">

        <!-- 开场页 -->
        <section class="hero-section">
          <div class="bg-layer">
            <div class="bg-image breathing-bg"></div>
            <div class="bg-mask"></div>
            <div class="bg-light light-breath"></div>
            <div class="mist mist-1 mist-move-1"></div>
            <div class="mist mist-2 mist-move-2"></div>
            <div class="mist mist-3 mist-move-3"></div>
          </div>

          <div class="hero-content" :style="titleStyle">
            <div class="title-badge fade-up delay-2">诗画新生</div>

            <div class="title-main fade-up delay-3">
              <img :src="titleImg" class="title-main-img" />
            </div>

            <div class="title-sub fade-up delay-4">
              山水入画，烟火入城，人文入心
            </div>

            <div class="intro-text fade-up delay-5">
              从滕王阁的千古风流，到婺源的粉墙黛瓦；<br />
              从景德镇的窑火不息，到庐山云海的诗意流转。
            </div>

            <div class="scroll-tip fade-up delay-6" @click="scrollToHomeSmooth">
              <div class="sunset-wrapper" :style="sunsetStyle">
                <div class="sunset-circle">
                  <div class="sun-core"></div>
                  <div class="sun-halo"></div>
                  <div class="ripple ripple-1"></div>
                  <div class="ripple ripple-2"></div>
                  <div class="ripple ripple-3"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 山 -->
          <div class="mountain-layer">
            <div class="mountain left back" :style="leftBackStyle">
              <img :src="shanImg" />
            </div>

            <div class="mountain left front" :style="leftFrontStyle">
              <img :src="shanImg" />
            </div>

            <div class="mountain right back" :style="rightBackStyle">
              <img :src="shanImg" />
            </div>

            <div class="mountain right front" :style="rightFrontStyle">
              <img :src="shanImg" />
            </div>

            <div class="bottom-mask"></div>
          </div>
        </section>

        <!-- 第二屏 -->
        <section class="home-section">
          <Home />
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import Home from './Home.vue'
import shanImg from '@/assets/imgs/shan.png'
import titleImg from '@/assets/imgs/biaoti.png'

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

const titleStyle = computed(() => {
  const p = progress.value
  return {
    transform: `translate(-50%, calc(-50% - ${p * 80}px))`,
    opacity: 1 - p
  }
})

const sunsetStyle = computed(() => {
  const p = progress.value
  return {
    transform: `translateY(${p * 400}px) scale(${1 - p * 0.2})`,
    opacity: 1 - p * 0.8
  }
})

const leftBackStyle = computed(() => ({
  transform: `translateX(-${progress.value * 240}px)`
}))
const leftFrontStyle = computed(() => ({
  transform: `translateX(-${progress.value * 350}px)`
}))
const rightBackStyle = computed(() => ({
  transform: `translateX(${progress.value * 240}px)`
}))
const rightFrontStyle = computed(() => ({
  transform: `translateX(${progress.value * 350}px)`
}))

const scrollToHomeSmooth = () => {
  pageRef.value?.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  })
}

const handleRouteTarget = async () => {
  await nextTick()
  if (!pageRef.value) return
  if (route.query.target === 'home') {
    pageRef.value.scrollTop = window.innerHeight
  }
}

/* ===== 视频逻辑 ===== */
const showVideo = ref(true)
const videoEnded = ref(false)
const videoFadeOut = ref(false)
const pageVisible = ref(false)
const videoRef = ref(null)
let speedUpTimer = null

const handleVideoEnd = () => {
  videoEnded.value = true
  setTimeout(startTransition, 600)
}

const skipVideo = () => {
  videoEnded.value = true
  startTransition()
}

const startTransition = () => {
  pageVisible.value = true
  setTimeout(() => (videoFadeOut.value = true), 200)
  setTimeout(() => (showVideo.value = false), 1000)
}

// 视频加速逻辑：在播放到 85% 时，将播放速率提高到 1.15 倍，实现“快一点点”
const setupSpeedUp = () => {
  const video = videoRef.value
  if (!video) return
  
  const checkProgress = () => {
    if (!video || videoEnded.value) return
    const progressPercent = video.currentTime / video.duration
    // 当播放进度达到 85% 且尚未加速时，加快播放速度
    if (progressPercent >= 0.85 && video.playbackRate === 1.0) {
      video.playbackRate = 1.15
      // 可选：清除定时器，避免重复检查
      if (speedUpTimer) clearInterval(speedUpTimer)
    }
  }
  
  // 监听 timeupdate 事件，实时检查进度
  video.addEventListener('timeupdate', checkProgress)
  // 清理事件的函数（可选，但不必须，因为视频结束后组件可能销毁）
  // 为了稳妥，在组件卸载时移除
  const cleanup = () => {
    video.removeEventListener('timeupdate', checkProgress)
    if (speedUpTimer) clearInterval(speedUpTimer)
  }
  // 将清理函数存储以便在 onBeforeUnmount 中调用
  return cleanup
}

onMounted(() => {
  handleRouteTarget()
  // 等待视频元素加载并开始播放
  const video = videoRef.value
  if (video) {
    video.play().catch(() => {})
    // 设置加速监听
    const cleanup = setupSpeedUp()
    // 如果需要在组件卸载时清理事件，可以存储 cleanup
    // 但当前没有 onBeforeUnmount，可以忽略或添加
  }
})

watch(() => route.query.target, handleRouteTarget)
</script>

<style scoped>
.intro-home-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* ===== 视频 ===== */
.video-container {
  position: fixed;
  inset: 0;
  z-index: 9999;
  transition: all 1s ease;
}
.video-container.freeze {
  transform: scale(1.05);
}
.video-container.fadeOut {
  opacity: 0;
}
.opening-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 模糊 */
.blur-mask {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(0);
  transition: all 0.8s;
}
.blur-mask.active {
  backdrop-filter: blur(10px);
}

/* 页面过渡 */
.page-content {
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: scale(1.02);
  filter: blur(10px);
  transition: all 1.2s ease;
}
.page-content.preShow {
  opacity: 0.15;
}
.page-content.show {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

/* 跳过 */
.skip-btn {
  position: absolute;
  top: 30px;
  right: 30px;
  color: white;
  cursor: pointer;
}

/* ===== 下面全部是你原来的样式（未改动） ===== */

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
.hero-section {
  overflow: hidden;
  background: url("@/assets/imgs/tenwangge.jpg") center/cover no-repeat;
}

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
  top: 35%;
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
  text-align: center;
}

.title-main-img {
  display: block;
  margin: 0 auto;
  height: auto;
  width: auto;
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 10px 22px rgba(190, 162, 138, 0.2));
  animation: titleBreath 4.5s ease-in-out infinite;
}

@keyframes titleBreath {
  0%, 100% {
    filter: drop-shadow(0 10px 22px rgba(190, 162, 138, 0.2));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 14px 30px rgba(190, 162, 138, 0.3));
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
.sunset-wrapper {
  display: flex;
  justify-content: center;
  transition: transform 0.03s linear, opacity 0.03s linear;
}

/* 落日按钮容器 */
.sunset-circle {
  width: 80px;
  height: 80px;
  background: transparent;
  border-radius: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  animation: tipBreath 3.2s ease-in-out infinite;
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
/* 落日核心（橙红渐变圆形） */
.sun-core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(253, 182, 120, 0.8) 0%,
    rgba(254, 158, 74, 0.8) 40%,
    rgba(236, 113, 5, 0.7) 70%,
    rgba(253, 122, 8, 0.6) 100%
  );
  /* 核心发光 */
  box-shadow: 
    inset 0 0 10px rgba(255, 120, 0, 0.9),
    0 0 40px rgba(255, 120, 0, 0.8);
  z-index: 1;
}

/* 落日光晕（外层淡色发光） */
.sun-halo {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  opacity: 0.5;
  background: radial-gradient(
    circle center,
    rgba(255, 206, 88, 0.6) 0%,
    rgba(254, 124, 43, 0.4) 70%,
    transparent 100%
  );
  filter: blur(15px);
  z-index: 0;
}
.ripple {
  position: absolute;
  width: 80%;
  height: 30px;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 0 0 50% 50% / 0 0 100% 100%;
  border: 2px solid rgba(248, 225, 208, 0.4);
  border-top: none;
  animation: downRipple 2s ease-out infinite;
  transition: opacity 0.3s linear, transform 0.3s linear;
  z-index: 0;
}
/* 第一条涟漪：无延迟（默认） */
.ripple-1 {
  animation-delay: 0s;
}

/* 第二条涟漪：延迟 0.6s */
.ripple-2 {
  animation-delay: 0.6s;
}

/* 第三条涟漪：延迟 1.2s */
.ripple-3 {
  animation-delay: 1.2s;
}
@keyframes downRipple {
  0% {
    /* 初始状态：紧贴按钮底部，完全不透明 */
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  100% {
    /* 结束状态：向下扩散、变淡消失 */
    transform: translateX(-50%) scale(1.5) translateY(20px);
    opacity: 0;
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

  .title-main-img {
    max-height: 80px;
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
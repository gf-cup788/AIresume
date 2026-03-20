<template>
  <div class="detail">
    <!-- 水墨背景遮罩 -->
    <div class="bg" :style="{ backgroundImage: 'url(' + scenic.img + ')' }"></div>
    <div class="ink-overlay"></div>
    
    <!-- 竹叶飘落装饰 -->
    <div class="bamboo-leaves"></div>
    
    <div class="content">
      <!-- 古风返回按钮 -->
      <button class="back-btn" @click="goBack">
        <span class="back-icon">⌂</span>
        <span>归园田居</span>
      </button>
      
      <!-- 景点题记区 - 匾额风格 -->
      <div class="scenic-plaque" v-if="scenic.name">
        <div class="plaque-header">
          <span class="plaque-ornament">✧</span>
          <span class="plaque-title">{{ scenic.name }}</span>
          <span class="plaque-ornament">✧</span>
        </div>
        <div class="plaque-poem">{{ scenicPoem }}</div>
        <p class="plaque-desc">{{ scenic.desc }}</p>
        
        <button class="dialogue-btn" @click="startDialogue">
          <span class="btn-icon" v-if="isLogin">🗣️</span>
          <span class="btn-icon" v-else>🎋</span>
          <span class="btn-text">{{ isLogin ? '入画问景' : '试游听风' }}</span>
        </button>
      </div>
      
      <!-- 游者题壁 - 评论区 -->
      <div class="comment-pavilion">
        <div class="pavilion-roof">
          <span class="roof-ridge"></span>
          <h3 class="pavilion-title">
            <span class="title-icon-left">✍️</span>
            游者题壁
            <span class="title-icon-right">📜</span>
          </h3>
          <span class="roof-ridge"></span>
        </div>
        <div class="pavilion-body">
          <div class="comment-count">
            <span class="count-number">{{ comments.length }}</span>
            <span class="count-text">处留墨</span>
          </div>
          
          <!-- 游客邀约 -->
          <div v-if="!isLogin" class="guest-invite">
            <div class="invite-card">
              <span class="invite-icon">🏮</span>
              <p class="invite-text">登楼留名，方得题壁之雅</p>
              <button class="invite-btn" @click="goLogin">登 楼 →</button>
            </div>
          </div>
          
          <!-- 题壁表单 -->
          <div v-else class="writing-form">
            <div class="form-header">
              <span class="form-label">择 题</span>
              <div class="tags-cloud">
                <span
                  v-for="tag in tagList"
                  :key="tag"
                  :class="{ active: selectedTag === tag }"
                  @click="selectTag(tag)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div class="writing-paper">
              <textarea
                v-model="content"
                placeholder="执笔留墨，记此时心境..."
                rows="3"
              ></textarea>
              <div class="paper-seal"></div>
            </div>
            
            <button class="submit-btn" @click="submitComment" :disabled="!selectedTag || !content">
              <span class="submit-icon">🖌️</span>
              题壁留名
            </button>
          </div>
          
          <!-- 题壁列表 -->
          <div class="inscriptions">
            <div v-for="item in comments" :key="item.id" class="inscription-card">
              <div class="card-roll"></div>
              <div class="inscription-header">
                <div class="author-info">
                  <span class="author-avatar">✍️</span>
                  <span class="author-name">{{ item.user }}</span>
                </div>
                <span class="inscription-tag">{{ item.tag }}</span>
              </div>
              <p class="inscription-content">{{ item.content }}</p>
              <div class="inscription-footer">
                <span class="inscription-date">{{ item.date || '近日' }}</span>
                <span class="inscription-seal">● 印</span>
              </div>
            </div>
            
            <div v-if="comments.length === 0" class="empty-inscription">
              <div class="empty-paper">
                <span class="empty-icon">📜</span>
                <p>壁上尚无墨迹</p>
                <span class="empty-sub">待君首题</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import lushan from "@/assets/imgs/lushan.jpg";
import jinggangshan from "@/assets/imgs/jinggangshan.jpg";
import wuyuan from "@/assets/imgs/wuyuan.jpg";

const router = useRouter();
const route = useRoute();

const scenic = reactive({});
const isLogin = ref(false);
const content = ref("");
const selectedTag = ref("");

const comments = ref([]);

// 景点诗句
const scenicPoems = {
  1: "匡庐奇秀甲天下，飞瀑流云入画来",
  2: "星火燎原井冈山，英雄气概贯长虹",
  3: "油菜花开满地金，徽州人家水墨中"
};

const scenicPoem = computed(() => scenicPoems[scenic.id] || "山水有相逢，此处最江南");

const tagList = ref(["山川壮丽", "人文深厚", "意境悠远", "心旷神怡", "流连忘返"]);

const scenicData = {
  1: { id: 1, name: "庐山", desc: "飞流直下三千尺，疑是银河落九天", img: lushan },
  2: { id: 2, name: "井冈山", desc: "中国革命的摇篮，红色精神的发源地", img: jinggangshan },
  3: { id: 3, name: "婺源", desc: "中国最美乡村，油菜花海与徽派建筑", img: wuyuan }
};

const loadComments = () => {
  const stored = localStorage.getItem(`comments_${scenic.id}`);
  if (stored) {
    comments.value = JSON.parse(stored);
  } else {
    comments.value = [
      { id: 1, user: "江南客", content: "登临此境，心旷神怡，真乃人间仙境", tag: "山川壮丽", date: "三月廿三" },
      { id: 2, user: "采芹生", content: "此地文脉悠长，令人思古", tag: "人文深厚", date: "三月廿一" }
    ];
  }
};

const saveComments = () => {
  localStorage.setItem(`comments_${scenic.id}`, JSON.stringify(comments.value));
};

const startDialogue = () => {
  if (!scenic.id) return;
  
  if (!isLogin.value) {
    router.push({
      path: "/dialogue",
      query: { id: scenic.id, demo: "true" }
    });
  } else {
    router.push({
      path: "/dialogue",
      query: { id: scenic.id }
    });
  }
};

const selectTag = (tag) => {
  selectedTag.value = tag;
};

const submitComment = () => {
  if (!content.value.trim() || !selectedTag.value) {
    alert("请择题并执笔留墨");
    return;
  }
  
  const user = JSON.parse(localStorage.getItem("user"));
  const lunarDates = ["今日", "昨日", "前日", "三月廿八", "三月廿七", "三月廿六"];
  const randomDate = lunarDates[Math.floor(Math.random() * lunarDates.length)];
  
  comments.value.unshift({
    id: Date.now(),
    user: user?.name || "过客",
    content: content.value.trim(),
    tag: selectedTag.value,
    date: randomDate
  });
  
  saveComments();
  
  content.value = "";
  selectedTag.value = "";
};

const goBack = () => {
  router.back();
};

const goLogin = () => {
  router.push({
    path: "/login",
    query: { redirect: `/detail?id=${scenic.id}` }
  });
};

onMounted(() => {
  const id = Number(route.query.id);
  
  if (scenicData[id]) {
    Object.assign(scenic, scenicData[id]);
    loadComments();
  } else {
    router.push("/");
  }
  
  const user = localStorage.getItem("user");
  isLogin.value = !!user;
});
</script>

<style scoped>
.detail {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: #2a2418;
  overflow-x: hidden;
}

.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.ink-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 40%, rgba(30, 24, 18, 0.3) 0%, rgba(20, 16, 12, 0.7) 100%);
  z-index: 1;
}

/* 竹叶飘落 */
.bamboo-leaves {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  background: repeating-linear-gradient(45deg, rgba(100, 80, 50, 0.02) 0px, rgba(100, 80, 50, 0.02) 2px, transparent 2px, transparent 8px);
}

.content {
  position: relative;
  z-index: 3;
  padding: 24px 20px 60px;
  max-width: 750px;
  margin: 0 auto;
}

/* 古风返回按钮 */
.back-btn {
  background: rgba(50, 40, 28, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200, 170, 100, 0.4);
  padding: 8px 20px;
  border-radius: 40px;
  color: #e8d8bc;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "STKaiti", serif;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(100, 80, 50, 0.7);
  border-color: rgba(200, 170, 100, 0.7);
  transform: translateX(-4px);
}

.back-icon {
  font-size: 16px;
}

/* 景点匾额 */
.scenic-plaque {
  text-align: center;
  margin-bottom: 40px;
  padding: 28px 20px;
  background: rgba(30, 24, 18, 0.55);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  border: 1px solid rgba(200, 170, 100, 0.3);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.plaque-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.plaque-ornament {
  font-size: 20px;
  color: #c9aa5f;
  opacity: 0.8;
}

.plaque-title {
  font-size: 40px;
  font-weight: 400;
  color: #f0e0bc;
  font-family: "STKaiti", "华文楷书", "KaiTi", serif;
  letter-spacing: 8px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.plaque-poem {
  font-size: 14px;
  color: #d4bc84;
  font-style: italic;
  letter-spacing: 2px;
  margin-bottom: 16px;
  border-top: 1px dashed rgba(200, 170, 100, 0.3);
  border-bottom: 1px dashed rgba(200, 170, 100, 0.3);
  display: inline-block;
  padding: 8px 20px;
}

.plaque-desc {
  font-size: 15px;
  color: #e0d0b0;
  line-height: 1.6;
  margin-bottom: 28px;
  opacity: 0.9;
}

.dialogue-btn {
  background: linear-gradient(135deg, #c9aa5f, #b88d4a);
  border: none;
  padding: 12px 32px;
  border-radius: 50px;
  font-size: 16px;
  color: #2a2418;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: "STKaiti", serif;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.dialogue-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  background: linear-gradient(135deg, #e0bc74, #c9aa5f);
}

.btn-icon {
  font-size: 18px;
}

.btn-text {
  letter-spacing: 2px;
}

/* 游者题壁 - 亭台样式 */
.comment-pavilion {
  background: rgba(40, 32, 24, 0.65);
  backdrop-filter: blur(12px);
  border-radius: 24px 24px 16px 16px;
  border: 1px solid rgba(200, 170, 100, 0.3);
  overflow: hidden;
  margin-top: 20px;
}

.pavilion-roof {
  background: linear-gradient(135deg, #4a3a28, #3a2e20);
  padding: 16px 20px;
  text-align: center;
  border-bottom: 2px solid #c9aa5f;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.roof-ridge {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #c9aa5f, #c9aa5f, transparent);
}

.pavilion-title {
  font-size: 18px;
  font-weight: 400;
  color: #ecdba8;
  font-family: "STKaiti", serif;
  letter-spacing: 4px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.title-icon-left, .title-icon-right {
  font-size: 16px;
  opacity: 0.8;
}

.pavilion-body {
  padding: 20px;
}

.comment-count {
  text-align: right;
  font-size: 12px;
  color: #b8a072;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(200, 170, 100, 0.3);
}

.count-number {
  font-size: 18px;
  color: #ecdba8;
  font-weight: bold;
  margin-right: 6px;
}

/* 游客邀约 */
.guest-invite {
  text-align: center;
  padding: 20px;
}

.invite-card {
  background: rgba(200, 170, 100, 0.1);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(200, 170, 100, 0.3);
}

.invite-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.invite-text {
  font-size: 14px;
  color: #e0d0b0;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.invite-btn {
  background: transparent;
  border: 1px solid #c9aa5f;
  padding: 8px 24px;
  border-radius: 40px;
  color: #c9aa5f;
  font-family: "STKaiti", serif;
  cursor: pointer;
  transition: all 0.3s;
}

.invite-btn:hover {
  background: rgba(200, 170, 100, 0.2);
  transform: translateY(-2px);
}

/* 题壁表单 */
.writing-form {
  margin-bottom: 30px;
}

.form-header {
  margin-bottom: 16px;
}

.form-label {
  font-size: 13px;
  color: #c9aa5f;
  margin-right: 12px;
  letter-spacing: 2px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.tags-cloud span {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(200, 170, 100, 0.15);
  border-radius: 30px;
  font-size: 12px;
  color: #e0d0b0;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(200, 170, 100, 0.3);
}

.tags-cloud span:hover {
  background: rgba(200, 170, 100, 0.3);
  border-color: #c9aa5f;
}

.tags-cloud .active {
  background: #c9aa5f;
  color: #2a2418;
  border-color: #c9aa5f;
}

.writing-paper {
  position: relative;
  margin-bottom: 16px;
}

.writing-paper textarea {
  width: 100%;
  padding: 16px;
  background: rgba(50, 40, 30, 0.8);
  border: 1px solid rgba(200, 170, 100, 0.4);
  border-radius: 16px;
  color: #f0e6d8;
  font-size: 14px;
  font-family: "STKaiti", serif;
  resize: none;
  line-height: 1.6;
}

.writing-paper textarea::placeholder {
  color: #8a7658;
}

.writing-paper textarea:focus {
  outline: none;
  border-color: #c9aa5f;
}

.paper-seal {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 100, 80, 0.4), rgba(160, 70, 50, 0.2));
  pointer-events: none;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #c9aa5f, #b88d4a);
  border: none;
  border-radius: 40px;
  color: #2a2418;
  font-family: "STKaiti", serif;
  font-size: 15px;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-icon {
  font-size: 14px;
}

/* 题壁列表 */
.inscriptions {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 4px;
}

.inscriptions::-webkit-scrollbar {
  width: 4px;
}

.inscriptions::-webkit-scrollbar-track {
  background: rgba(200, 170, 100, 0.1);
  border-radius: 4px;
}

.inscriptions::-webkit-scrollbar-thumb {
  background: #c9aa5f;
  border-radius: 4px;
}

.inscription-card {
  background: rgba(60, 48, 36, 0.6);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #c9aa5f;
  position: relative;
  transition: all 0.2s;
}

.inscription-card:hover {
  background: rgba(80, 64, 48, 0.7);
  transform: translateX(4px);
}

.card-roll {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 4px;
  background: #c9aa5f;
  border-radius: 2px;
  opacity: 0.5;
}

.inscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  font-size: 16px;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: #ecdba8;
}

.inscription-tag {
  font-size: 11px;
  color: #c9aa5f;
  background: rgba(200, 170, 100, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
}

.inscription-content {
  font-size: 14px;
  line-height: 1.6;
  color: #e0d0b0;
  margin-bottom: 12px;
  font-style: italic;
}

.inscription-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #9b8a6b;
  border-top: 1px dashed rgba(200, 170, 100, 0.2);
  padding-top: 10px;
}

.inscription-seal {
  font-size: 10px;
  letter-spacing: 1px;
}

/* 空状态 */
.empty-inscription {
  text-align: center;
  padding: 40px 20px;
}

.empty-paper {
  background: rgba(200, 170, 100, 0.08);
  border-radius: 20px;
  padding: 32px;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-paper p {
  font-size: 14px;
  color: #b8a072;
  margin-bottom: 8px;
}

.empty-sub {
  font-size: 11px;
  color: #8a7658;
  letter-spacing: 1px;
}

/* 响应式 */
@media (max-width: 600px) {
  .content {
    padding: 16px 16px 40px;
  }
  
  .plaque-title {
    font-size: 28px;
    letter-spacing: 4px;
  }
  
  .plaque-poem {
    font-size: 12px;
  }
  
  .plaque-desc {
    font-size: 13px;
  }
  
  .pavilion-title {
    font-size: 14px;
  }
  
  .tags-cloud span {
    padding: 4px 12px;
    font-size: 11px;
  }
}
</style>
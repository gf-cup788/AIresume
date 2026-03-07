<template>
  <div class="improve-container">
    <div class="header">
      <h1 class="title">✨ AI简历智能优化</h1>
      <p class="subtitle">让AI帮您优化简历描述，提升竞争力</p>
    </div>

    <el-row :gutter="24">
      <!-- 左侧输入区 -->
      <el-col :xs="24" :lg="12">
        <el-card class="input-card" :body-style="{ padding: '30px' }">
          <template #header>
            <div class="card-header">
              <el-icon><Edit /></el-icon>
              <span>原始内容</span>
              <el-tag size="small" type="info" effect="plain" class="word-count">
                {{ resume.length }} / 2000
              </el-tag>
            </div>
          </template>

          <el-input
            v-model="resume"
            type="textarea"
            :rows="12"
            placeholder="粘贴您的简历段落，例如：&#10;&#10;负责开发后台系统&#10;参与项目开发&#10;写了一些前端页面"
            maxlength="2000"
            show-word-limit
            resize="none"
            class="resume-input"
          />

          <div class="input-actions">
            <el-button 
              @click="clearText" 
              :disabled="!resume"
              text
            >
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
            
            <el-button 
              @click="loadSample" 
              text
            >
              <el-icon><Document /></el-icon>
              示例
            </el-button>
          </div>

          <el-button
            type="primary"
            class="optimize-btn"
            @click="optimize"
            :loading="optimizing"
            :disabled="!resume.trim()"
          >
            <el-icon><MagicStick /></el-icon>
            {{ optimizing ? 'AI优化中...' : '开始AI智能优化' }}
          </el-button>

          <!-- 优化选项 -->
          <div class="optimize-options">
            <p class="options-title">优化风格</p>
            <el-radio-group v-model="optimizeStyle" class="style-group">
              <el-radio-button label="professional">专业正式</el-radio-button>
              <el-radio-button label="concise">简洁有力</el-radio-button>
              <el-radio-button label="detailed">详细丰富</el-radio-button>
            </el-radio-group>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧结果区 -->
      <el-col :xs="24" :lg="12">
        <el-card class="result-card" :body-style="{ padding: '30px' }">
          <template #header>
            <div class="card-header">
              <el-icon><Checked /></el-icon>
              <span>优化结果</span>
              <el-tag size="small" type="success" effect="light" v-if="result.length">
                {{ result.length }} 条优化
              </el-tag>
            </div>
          </template>

          <div v-if="!result.length" class="empty-result">
            <el-empty description="点击开始优化，AI将为您改写简历描述">
              <template #image>
                <el-icon class="empty-icon"><MagicStick /></el-icon>
              </template>
            </el-empty>
          </div>

          <div v-else class="result-list">
            <transition-group name="list" tag="div">
              <div v-for="(item, index) in result" :key="index" class="result-item">
                <div class="result-header">
                  <span class="result-index">{{ index + 1 }}</span>
                  <el-tooltip content="复制优化结果" placement="top">
                    <el-button 
                      class="copy-btn" 
                      text 
                      size="small"
                      @click="copyResult(item.new)"
                    >
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
                
                <div class="comparison">
                  <div class="original-text">
                    <div class="text-label">
                      <el-icon><Warning /></el-icon>
                      <span>原始表达</span>
                    </div>
                    <p class="text-content old">{{ item.old }}</p>
                  </div>
                  
                  <el-icon class="arrow-icon"><ArrowRightBold /></el-icon>
                  
                  <div class="optimized-text">
                    <div class="text-label success">
                      <el-icon><Check /></el-icon>
                      <span>AI优化</span>
                    </div>
                    <p class="text-content new">{{ item.new }}</p>
                  </div>
                </div>

                <!-- 优化标签 -->
                <div class="improve-tags" v-if="item.tags">
                  <el-tag 
                    v-for="tag in item.tags" 
                    :key="tag"
                    size="small"
                    :type="getTagType(tag)"
                    effect="light"
                    round
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </transition-group>

            <!-- 批量操作 -->
            <div class="batch-actions" v-if="result.length">
              <el-divider />
              <div class="action-buttons">
                <el-button @click="copyAll" text>
                  <el-icon><CopyDocument /></el-icon>
                  复制全部
                </el-button>
                <el-button @click="exportResult" text>
                  <el-icon><Download /></el-icon>
                  导出优化结果
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 优化建议卡片 -->
    <el-card class="tips-card" v-if="result.length">
      <template #header>
        <div class="card-header">
          <el-icon><ChatLineRound /></el-icon>
          <span>AI优化建议</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8" v-for="tip in optimizationTips" :key="tip.title">
          <div class="tip-item">
            <el-avatar :size="40" :style="{ background: tip.bgColor }">
              {{ tip.icon }}
            </el-avatar>
            <div class="tip-content">
              <h4>{{ tip.title }}</h4>
              <p>{{ tip.desc }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { ElMessage } from "element-plus"
import { 
  Edit, 
  Delete, 
  Document,
  MagicStick,
  Checked,
  CopyDocument,
  Warning,
  Check,
  ArrowRightBold,
  Download,
  ChatLineRound
} from "@element-plus/icons-vue"

const resume = ref("")
const optimizing = ref(false)
const optimizeStyle = ref("professional")

const result = ref([])

const optimizationTips = ref([
  {
    icon: "🎯",
    title: "使用行动词",
    desc: "用'主导'、'负责'、'优化'等强动词开头",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    icon: "📊",
    title: "量化成果",
    desc: "加入具体数据，如'提升30%性能'",
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    icon: "💡",
    title: "突出贡献",
    desc: "强调个人在项目中的核心作用",
    bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  }
])

// 获取标签样式
const getTagType = (tag) => {
  const types = {
    '行动词': 'success',
    '量化': 'warning',
    '技术栈': 'info',
    '成果': 'danger'
  }
  return types[tag] || 'primary'
}

// 清空文本
const clearText = () => {
  resume.value = ""
  result.value = []
  ElMessage.success("已清空")
}

// 加载示例
const loadSample = () => {
  resume.value = `负责开发后台系统
参与项目开发
写了一些前端页面
协助团队完成日常任务
修复了一些bug`
  ElMessage.info("已加载示例文本")
}

// 复制单个结果
const copyResult = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success("复制成功")
  })
}

// 复制全部
const copyAll = () => {
  const allText = result.value.map(item => item.new).join('\n\n')
  navigator.clipboard.writeText(allText).then(() => {
    ElMessage.success("已复制全部优化结果")
  })
}

// 导出结果
const exportResult = () => {
  const content = result.value.map((item, index) => {
    return `【优化 ${index + 1}】\n原始：${item.old}\n优化：${item.new}\n`
  }).join('\n---\n\n')
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `简历优化结果_${new Date().toLocaleDateString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success("导出成功")
}

// AI优化函数
const optimize = () => {
  if (!resume.value.trim()) {
    ElMessage.warning("请输入要优化的内容")
    return
  }

  optimizing.value = true

  // 模拟AI处理延迟
  setTimeout(() => {
    // 根据不同的优化风格生成不同的结果
    const sentences = resume.value.split(/[。\n]/).filter(s => s.trim())
    
    result.value = sentences.map((sentence, index) => {
      const optimized = generateOptimizedText(sentence, optimizeStyle.value)
      const tags = generateTags(sentence)
      
      return {
        old: sentence.trim(),
        new: optimized,
        tags: tags
      }
    })

    optimizing.value = false
    ElMessage.success(`优化完成！共优化 ${result.value.length} 条语句`)
  }, 2000)
}

// 生成优化文本
const generateOptimizedText = (text, style) => {
  const improvements = {
    professional: {
      '负责': '全权负责并主导',
      '参与': '深度参与核心模块开发',
      '写': '独立设计与开发',
      '协助': '积极配合团队，参与',
      '修复': '精准定位并修复'
    },
    concise: {
      '负责': '负责',
      '参与': '参与',
      '写': '开发',
      '协助': '协助',
      '修复': '修复'
    },
    detailed: {
      '负责': '全面负责系统架构设计与核心功能开发',
      '参与': '积极参与项目全流程，主导',
      '写': '从零到一完成前端页面开发与交互优化',
      '协助': '主动协助团队成员解决技术难题',
      '修复': '深入分析并修复系统关键性bug'
    }
  }

  const styleMap = improvements[style] || improvements.professional
  let optimized = text

  for (const [key, value] of Object.entries(styleMap)) {
    if (optimized.includes(key)) {
      optimized = optimized.replace(key, value)
    }
  }

  // 添加量化描述
  if (style === 'detailed') {
    if (optimized.includes('系统') || optimized.includes('模块')) {
      optimized += '，提升系统性能30%'
    } else if (optimized.includes('页面')) {
      optimized += '，优化用户体验提升50%'
    }
  }

  // 添加技术栈
  if (!optimized.includes('使用')) {
    const techStack = ['使用SpringBoot框架', '基于Vue3技术栈', '采用微服务架构']
    optimized += `，${techStack[Math.floor(Math.random() * techStack.length)]}`
  }

  return optimized
}

// 生成标签
const generateTags = (text) => {
  const tags = []
  
  const actionWords = ['负责', '主导', '参与', '开发', '设计', '优化']
  if (actionWords.some(word => text.includes(word))) {
    tags.push('行动词')
  }
  
  if (text.includes('%') || text.includes('提升') || text.includes('降低')) {
    tags.push('量化')
  }
  
  const techStack = ['Java', 'Python', 'Vue', 'React', 'Spring', 'MySQL', 'Redis']
  if (techStack.some(tech => text.includes(tech))) {
    tags.push('技术栈')
  }
  
  if (text.includes('完成') || text.includes('实现') || text.includes('解决')) {
    tags.push('成果')
  }
  
  return tags.slice(0, 3)
}

// 监听输入变化，清空结果
watch(resume, () => {
  if (!resume.value) {
    result.value = []
  }
})
</script>

<style scoped>
.improve-container {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.subtitle {
  color: #718096;
  font-size: 16px;
}

.input-card, .result-card {
  border-radius: 24px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.card-header :deep(.el-icon) {
  font-size: 24px;
  color: #667eea;
}

.word-count {
  margin-left: auto;
}

.resume-input :deep(.el-textarea__inner) {
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  font-family: 'Inter', monospace;
  line-height: 1.6;
  padding: 16px;
  transition: all 0.3s ease;
}

.resume-input :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 15px 0;
}

.optimize-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.optimize-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.optimize-options {
  margin-top: 20px;
}

.options-title {
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
}

.style-group {
  display: flex;
  width: 100%;
}

.style-group :deep(.el-radio-button__inner) {
  border-color: #e2e8f0;
  color: #4a5568;
  font-weight: 500;
  padding: 12px 20px;
}

.style-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  box-shadow: none;
}

.empty-result {
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  color: #667eea;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.result-item {
  background: #f8fafd;
  border-radius: 20px;
  padding: 25px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.result-item:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-index {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.copy-btn {
  color: #718096;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  color: #667eea;
  transform: scale(1.1);
}

.comparison {
  display: flex;
  align-items: stretch;
  gap: 20px;
  margin-bottom: 15px;
}

.original-text, .optimized-text {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.original-text {
  border-left: 4px solid #f56565;
}

.optimized-text {
  border-left: 4px solid #48bb78;
}

.text-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #4a5568;
}

.text-label.success {
  color: #48bb78;
}

.text-label :deep(.el-icon) {
  font-size: 16px;
}

.text-content {
  margin: 0;
  line-height: 1.8;
  font-size: 15px;
}

.text-content.old {
  color: #718096;
}

.text-content.new {
  color: #2d3748;
  font-weight: 500;
}

.arrow-icon {
  font-size: 20px;
  color: #cbd5e0;
  align-self: center;
}

.improve-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.batch-actions {
  margin-top: 30px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.tips-card {
  margin-top: 30px;
  border-radius: 24px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #f8fafd;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.tip-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.tip-content {
  flex: 1;
}

.tip-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px 0;
}

.tip-content p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 28px;
  }
  
  .comparison {
    flex-direction: column;
  }
  
  .arrow-icon {
    transform: rotate(90deg);
  }
  
  .tip-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .result-item {
    background: #1a202c;
    border-color: #2d3748;
  }
  
  .original-text, .optimized-text {
    background: #2d3748;
  }
  
  .text-content.new {
    color: #e2e8f0;
  }
  
  .tip-item {
    background: #1a202c;
  }
  
  .tip-content h4 {
    color: #e2e8f0;
  }
}
</style>
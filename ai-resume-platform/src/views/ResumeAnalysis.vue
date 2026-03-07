<template>
  <div class="analysis-container">
    <div class="header">
      <h1 class="title">📊 AI简历智能分析平台</h1>
      <p class="subtitle">上传您的简历，AI将为您进行全面分析</p>
    </div>

    <!-- 上传区域 -->
    <el-card class="upload-card" :body-style="{ padding: '40px' }">
      <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        class="upload-area"
      >
        <div class="upload-content">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            <span class="main-text">拖拽简历到这里 或 点击上传</span>
            <span class="sub-text">支持 Word / PDF 格式，最大10MB</span>
          </div>
        </div>
      </el-upload>
      
      <el-button 
        type="primary" 
        class="analyze-btn" 
        @click="startAnalysis"
        :loading="loading"
        :disabled="!hasFile"
      >
        {{ loading ? 'AI分析中...' : '开始AI智能分析' }}
      </el-button>
    </el-card>

    <!-- 加载动画 -->
    <transition name="fade">
      <el-card v-if="loading" class="loading-card">
        <div class="loading-box">
          <div class="ai-thinking">
            <div class="ai-avatar">🤖</div>
            <div class="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <p class="loading-text">AI正在深度分析您的简历...</p>
          <p class="loading-sub">这大约需要15-30秒</p>
        </div>
      </el-card>
    </transition>

    <!-- 分析结果 -->
    <transition name="slide-up">
      <div v-if="showResult" class="results">
        <!-- AI流程步骤 -->
        <el-card class="result-section">
          <template #header>
            <div class="section-header">
              <el-icon><Connection /></el-icon>
              <span>AI分析流程</span>
            </div>
          </template>
          <el-steps :active="5" finish-status="success" simple>
            <el-step title="解析简历" icon="📄" />
            <el-step title="提取技能" icon="🎯" />
            <el-step title="评分计算" icon="📊" />
            <el-step title="岗位匹配" icon="🤝" />
            <el-step title="生成建议" icon="💡" />
          </el-steps>
        </el-card>

        <!-- 技能标签 -->
        <el-card class="result-section">
          <template #header>
            <div class="section-header">
              <el-icon><Coin /></el-icon>
              <span>技能识别</span>
            </div>
          </template>
          <div class="skills-cloud">
            <el-tag
              v-for="skill in skills"
              :key="skill"
              class="skill-tag"
              :type="getSkillType(skill)"
              size="large"
              effect="light"
              round
            >
              {{ skill }}
            </el-tag>
          </div>
        </el-card>

        <!-- 评分卡片 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="score-card">
              <div class="score-header">
                <span class="score-label">综合评分</span>
                <el-progress type="dashboard" :percentage="score" :color="scoreColors">
                  <template #default="{ percentage }">
                    <span class="score-value">{{ percentage }}</span>
                  </template>
                </el-progress>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="16">
            <el-card class="result-section">
              <template #header>
                <div class="section-header">
                  <el-icon><TrendCharts /></el-icon>
                  <span>维度分析</span>
                </div>
              </template>
              <div ref="radarChart" class="chart"></div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 技能掌握 -->
        <el-card class="result-section">
          <template #header>
            <div class="section-header">
              <el-icon><Histogram /></el-icon>
              <span>技能掌握程度</span>
            </div>
          </template>
          <div ref="skillChart" class="chart"></div>
        </el-card>

        <!-- 推荐岗位 -->
        <el-card class="result-section">
          <template #header>
            <div class="section-header">
              <el-icon><Briefcase /></el-icon>
              <span>推荐岗位</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8" v-for="job in jobs" :key="job.name">
              <el-card class="job-card" shadow="hover">
                <h3 class="job-name">{{ job.name }}</h3>
                <div class="job-match">
                  <span class="match-label">匹配度</span>
                  <span class="match-value" :style="{ color: getMatchColor(job.match) }">
                    {{ job.match }}%
                  </span>
                </div>
                <el-progress 
                  :percentage="job.match" 
                  :color="getMatchColor(job.match)"
                  :stroke-width="6"
                />
              </el-card>
            </el-col>
          </el-row>
        </el-card>

        <!-- 词云 -->
        <el-card class="result-section">
          <template #header>
            <div class="section-header">
              <el-icon><Cloudy /></el-icon>
              <span>技能词云</span>
            </div>
          </template>
          <div ref="wordCloud" class="chart"></div>
        </el-card>

        <!-- 优化建议 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="result-section">
              <template #header>
                <div class="section-header">
                  <el-icon><ChatLineRound /></el-icon>
                  <span>AI优化建议</span>
                </div>
              </template>
              <el-timeline>
                <el-timeline-item
                  v-for="(suggestion, index) in suggestions"
                  :key="index"
                  :type="index === 0 ? 'primary' : 'info'"
                  :size="index === 0 ? 'large' : 'normal'"
                  :hollow="index !== 0"
                >
                  {{ suggestion }}
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card class="result-section">
              <template #header>
                <div class="section-header">
                  <el-icon><School /></el-icon>
                  <span>推荐学习路线</span>
                </div>
              </template>
              <el-timeline>
                <el-timeline-item
                  v-for="(path, index) in learningPath"
                  :key="index"
                  :color="getPathColor(index)"
                >
                  {{ path }}
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
        </el-row>

        <!-- 行业趋势 -->
        <el-card class="result-section">
          <template #header>
            <div class="section-header">
              <el-icon><DataLine /></el-icon>
              <span>热门技能趋势</span>
            </div>
          </template>
          <div ref="trendChart" class="chart"></div>
        </el-card>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue"
import * as echarts from "echarts"
import "echarts-wordcloud"
import { 
  UploadFilled,
  Connection,
  Coin,
  TrendCharts,
  Histogram,
  Briefcase,
  Cloudy,
  ChatLineRound,
  School,
  DataLine
} from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

const loading = ref(false)
const showResult = ref(false)
const hasFile = ref(false)

const score = ref(78)
const scoreColors = ref([
  { color: '#f56c6c', percentage: 60 },
  { color: '#e6a23c', percentage: 80 },
  { color: '#5cb87a', percentage: 100 }
])

const skills = ref([
  "Java", "SpringBoot", "MySQL", "Vue", "Redis", "Docker",
  "JavaScript", "Python", "Git", "Linux", "MongoDB", "Nginx"
])

const jobs = ref([
  { name: "Java开发工程师", match: 82 },
  { name: "后端架构师", match: 76 },
  { name: "全栈工程师", match: 70 }
])

const suggestions = ref([
  "增加项目经验描述，突出个人贡献",
  "技能描述更具体化，补充使用场景",
  "增加成果量化指标，如性能提升百分比",
  "优化简历结构，突出核心竞争力"
])

const learningPath = ref([
  "深入SpringBoot源码与设计思想",
  "学习SpringCloud微服务架构",
  "掌握Redis缓存设计与优化",
  "学习Docker容器化部署",
  "了解Kubernetes容器编排"
])

const wordCloud = ref(null)
const radarChart = ref(null)
const skillChart = ref(null)
const trendChart = ref(null)

const handleFileChange = () => {
  hasFile.value = true
  ElMessage.success("简历上传成功")
}

const getSkillType = (skill) => {
  const types = ['', 'success', 'warning', 'danger', 'info']
  const index = skill.length % types.length
  return types[index]
}

const getMatchColor = (match) => {
  if (match >= 90) return '#67C23A'
  if (match >= 80) return '#E6A23C'
  if (match >= 70) return '#F56C6C'
  return '#909399'
}

const getPathColor = (index) => {
  const colors = ['#67C23A', '#409EFF', '#E6A23C', '#F56C6C', '#909399']
  return colors[index % colors.length]
}

function startAnalysis() {
  if (!hasFile.value) {
    ElMessage.warning("请先上传简历")
    return
  }
  
  loading.value = true
  showResult.value = false
  
  setTimeout(() => {
    loading.value = false
    showResult.value = true
    
    nextTick(() => {
      initCharts()
    })
    
    ElMessage.success("分析完成")
  }, 3000)
}

function initCharts() {
  // 词云
  const wordCloudChart = echarts.init(wordCloud.value)
  wordCloudChart.setOption({
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      width: '100%',
      height: '100%',
      sizeRange: [20, 60],
      rotationRange: [0, 0],
      textStyle: {
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: function() {
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')'
        }
      },
      data: skills.value.map(skill => ({
        name: skill,
        value: Math.floor(Math.random() * 100) + 50
      }))
    }]
  })

  // 雷达图
  const radarChartInstance = echarts.init(radarChart.value)
  radarChartInstance.setOption({
    radar: {
      indicator: [
        { name: '技术能力', max: 100 },
        { name: '项目经验', max: 100 },
        { name: '学习能力', max: 100 },
        { name: '沟通能力', max: 100 },
        { name: '问题解决', max: 100 },
        { name: '团队协作', max: 100 }
      ],
      center: ['50%', '50%'],
      radius: '60%',
      shape: 'circle',
      name: {
        textStyle: {
          color: '#4a5568',
          fontSize: 12
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [85, 75, 90, 70, 80, 75],
        name: '当前能力',
        areaStyle: {
          color: 'rgba(102, 126, 234, 0.3)'
        },
        lineStyle: {
          color: '#667eea',
          width: 2
        },
        itemStyle: {
          color: '#667eea'
        }
      }]
    }]
  })

  // 技能柱状图
  const skillChartInstance = echarts.init(skillChart.value)
  skillChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Java', 'SpringBoot', 'Vue', 'MySQL', 'Redis', 'Docker'],
      axisLabel: {
        color: '#4a5568'
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: '#4a5568'
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '掌握程度',
      type: 'bar',
      data: [90, 85, 70, 88, 75, 82],
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      },
      barWidth: '40%'
    }]
  })

  // 趋势图
  const trendChartInstance = echarts.init(trendChart.value)
  trendChartInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['2022 Q1', '2022 Q2', '2022 Q3', '2022 Q4', '2023 Q1', '2023 Q2'],
      axisLabel: {
        color: '#4a5568'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#4a5568'
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
          type: 'dashed'
        }
      }
    },
    series: [{
      name: 'Java需求',
      type: 'line',
      smooth: true,
      data: [70, 75, 80, 82, 85, 88],
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        color: '#667eea',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
        ])
      }
    }, {
      name: 'Python需求',
      type: 'line',
      smooth: true,
      data: [65, 72, 78, 85, 92, 98],
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        color: '#f59e0b',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
          { offset: 1, color: 'rgba(245, 158, 11, 0.1)' }
        ])
      }
    }]
  })
}
</script>

<style scoped>
.analysis-container {
  max-width: 1200px;
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

.upload-card {
  border-radius: 24px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.upload-area {
  cursor: pointer;
}

.upload-content {
  text-align: center;
  padding: 40px;
}

.upload-icon {
  font-size: 60px;
  color: #667eea;
  margin-bottom: 20px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.main-text {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.sub-text {
  font-size: 14px;
  color: #718096;
}

.analyze-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  margin-top: 20px;
}

.analyze-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.loading-card {
  border-radius: 24px;
  margin-top: 30px;
}

.loading-box {
  text-align: center;
    padding: 60px;
}

.ai-thinking {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.ai-avatar {
  font-size: 60px;
  animation: bounce 2s ease infinite;
}

.thinking-dots {
  display: flex;
  gap: 8px;
}

.thinking-dots span {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  animation: pulse 1.5s ease infinite;
}

.thinking-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.loading-text {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.loading-sub {
  color: #718096;
  font-size: 14px;
}

.results {
  margin-top: 30px;
}

.result-section {
  border-radius: 20px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.result-section:hover {
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.section-header :deep(.el-icon) {
  font-size: 24px;
  color: #667eea;
}

.skills-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px;
}

.skill-tag {
  font-size: 14px;
  padding: 8px 16px;
  border: none;
  transition: all 0.3s ease;
  cursor: default;
}

.skill-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.score-card {
  height: 100%;
  border-radius: 20px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.score-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.score-label {
  font-size: 18px;
  font-weight: 600;
  color: #4a5568;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  color: #2d3748;
}

.chart {
  height: 350px;
  width: 100%;
}

.job-card {
  border-radius: 16px;
  border: none;
  transition: all 0.3s ease;
}

.job-card:hover {
  transform: translateY(-5px);
}

.job-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
}

.job-match {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.match-label {
  color: #718096;
  font-size: 14px;
}

.match-value {
  font-size: 20px;
  font-weight: 700;
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

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 28px;
  }
  
  .skills-cloud {
    gap: 8px;
  }
  
  .skill-tag {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .chart {
    height: 250px;
  }
}
</style>
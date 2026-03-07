<template>
  <div class="job-match">
    <div class="header">
      <h2 class="title">🎯 AI岗位智能匹配</h2>
      <p class="subtitle">基于您的技能，为您推荐最适合的岗位</p>
    </div>

    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="8" v-for="stat in stats" :key="stat.label">
          <el-card class="stat-card" :body-style="{ padding: '20px' }">
            <div class="stat-icon" :style="{ background: stat.bgColor }">
              {{ stat.icon }}
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="job-grid">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="job in jobs"
        :key="job.name"
      >
        <el-card class="job-card" :body-style="{ padding: 0 }" shadow="hover">
          <div class="job-header" :style="{ background: getJobColor(job.match) }">
            <div class="job-match-badge">
              <span class="match-value">{{ job.match }}%</span>
              <span class="match-label">匹配度</span>
            </div>
            <h3 class="job-name">{{ job.name }}</h3>
          </div>
          
          <div class="job-body">
            <div class="job-salary">
              <span class="salary-icon">💰</span>
              <span class="salary-value">{{ job.salary }}</span>
            </div>
            
            <div class="job-skills">
              <p class="skills-label">所需技能</p>
              <div class="skills-tags">
                <el-tag
                  v-for="skill in job.skills"
                  :key="skill"
                  class="skill-tag"
                  effect="plain"
                  size="small"
                >
                  {{ skill }}
                </el-tag>
              </div>
            </div>

            <el-progress 
              :percentage="job.match" 
              :color="getProgressColor(job.match)"
              :stroke-width="8"
              class="job-progress"
            />
            
            <el-button class="apply-btn" type="primary" text>
              查看详情
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { ArrowRight } from "@element-plus/icons-vue"

const stats = ref([
  { icon: "📊", value: "85%", label: "平均匹配度", bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { icon: "🎯", value: "156", label: "推荐岗位", bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { icon: "🏢", value: "32", label: "合作企业", bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }
])

const jobs = ref([
  {
    name: "Java后端工程师",
    match: 92,
    salary: "15k-25k",
    skills: ["Java", "SpringBoot", "MySQL", "Redis", "Docker"]
  },
  {
    name: "全栈工程师",
    match: 85,
    salary: "18k-30k",
    skills: ["Vue", "Node", "MySQL", "TypeScript", "NestJS"]
  },
  {
    name: "AI应用开发工程师",
    match: 80,
    salary: "20k-35k",
    skills: ["Python", "TensorFlow", "PyTorch", "数据分析", "机器学习"]
  },
  {
    name: "前端架构师",
    match: 78,
    salary: "25k-40k",
    skills: ["Vue3", "React", "Webpack", "性能优化", "TypeScript"]
  },
  {
    name: "DevOps工程师",
    match: 75,
    salary: "20k-32k",
    skills: ["Docker", "K8s", "Jenkins", "AWS", "Linux"]
  },
  {
    name: "数据工程师",
    match: 72,
    salary: "18k-28k",
    skills: ["Python", "SQL", "Spark", "Hadoop", "数据仓库"]
  }
])

const getJobColor = (match) => {
  if (match >= 90) return "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  if (match >= 80) return "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}

const getProgressColor = (match) => {
  if (match >= 90) return "#67C23A"
  if (match >= 80) return "#E6A23C"
  return "#F56C6C"
}
</script>

<style scoped>
.job-match {
  animation: fadeIn 0.5s ease;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 32px;
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

.stats-cards {
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  border: none;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.2;
}

.stat-label {
  color: #718096;
  font-size: 14px;
}

.job-grid {
  margin-top: 30px;
}

.job-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  border: none;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.job-header {
  padding: 30px 20px;
  color: white;
  position: relative;
}

.job-match-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 40px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.match-value {
  font-size: 24px;
  font-weight: 700;
}

.match-label {
  font-size: 12px;
  opacity: 0.9;
}

.job-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  max-width: 70%;
}

.job-body {
  padding: 20px;
}

.job-salary {
  background: #f7fafc;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.salary-icon {
  font-size: 20px;
}

.salary-value {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.job-skills {
  margin-bottom: 20px;
}

.skills-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: #f7fafc;
  border: none;
  color: #4a5568;
  font-weight: 500;
  padding: 0 10px;
}

.job-progress {
  margin: 20px 0;
}

.apply-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #667eea;
  font-weight: 500;
}

.apply-btn:hover {
  background: rgba(102, 126, 234, 0.1);
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
</style>
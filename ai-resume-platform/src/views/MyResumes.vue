<template>
  <div class="my-resumes">
    <div class="header">
      <h1 class="title">📄 我的简历</h1>
      <p class="subtitle">管理您的所有简历版本</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.label">
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

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleUpload" class="upload-btn">
        <el-icon><Upload /></el-icon>
        上传新简历
      </el-button>
      
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索简历..."
          :prefix-icon="Search"
          clearable
        />
      </div>
    </div>

    <!-- 简历列表 -->
    <el-card class="resume-list-card">
      <el-tabs v-model="activeTab" class="resume-tabs">
        <el-tab-pane label="全部简历" name="all">
          <div class="resume-grid">
            <transition-group name="list" tag="div" class="grid-container">
              <div v-for="resume in filteredResumes" :key="resume.id" class="resume-item">
                <el-card class="resume-card" :body-style="{ padding: 0 }" shadow="hover">
                  <div class="resume-preview" :style="{ background: getPreviewBg(resume.type) }">
                    <div class="preview-icon">{{ getFileIcon(resume.format) }}</div>
                    <div class="preview-overlay">
                      <el-button-group>
                        <el-button size="small" @click="viewResume(resume)" text bg>
                          <el-icon><View /></el-icon>
                        </el-button>
                        <el-button size="small" @click="downloadResume(resume)" text bg>
                          <el-icon><Download /></el-icon>
                        </el-button>
                        <el-button size="small" @click="editResume(resume)" text bg>
                          <el-icon><Edit /></el-icon>
                        </el-button>
                      </el-button-group>
                    </div>
                  </div>
                  
                  <div class="resume-info">
                    <div class="info-header">
                      <h3 class="resume-name">{{ resume.name }}</h3>
                      <el-tag :type="resume.statusType" size="small" effect="light">
                        {{ resume.status }}
                      </el-tag>
                    </div>
                    
                    <div class="resume-meta">
                      <span class="meta-item">
                        <el-icon><Document /></el-icon>
                        {{ resume.format }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        {{ resume.updateTime }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Files /></el-icon>
                        {{ resume.size }}
                      </span>
                    </div>
                    
                    <div class="resume-analysis" v-if="resume.score">
                      <div class="score-info">
                        <span class="score-label">AI评分</span>
                        <span class="score-value" :style="{ color: getScoreColor(resume.score) }">
                          {{ resume.score }}
                        </span>
                      </div>
                      <el-progress 
                        :percentage="resume.score" 
                        :color="getScoreColor(resume.score)"
                        :stroke-width="6"
                        :show-text="false"
                      />
                    </div>
                    
                    <div class="resume-tags" v-if="resume.tags">
                      <el-tag 
                        v-for="tag in resume.tags" 
                        :key="tag"
                        size="small"
                        round
                        effect="plain"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                    
                    <div class="resume-actions">
                      <el-dropdown trigger="click">
                        <el-button text>
                          更多操作<el-icon><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="renameResume(resume)">
                              <el-icon><Edit /></el-icon>重命名
                            </el-dropdown-item>
                            <el-dropdown-item @click="analyzeResume(resume)">
                              <el-icon><DataAnalysis /></el-icon>AI分析
                            </el-dropdown-item>
                            <el-dropdown-item @click="shareResume(resume)">
                              <el-icon><Share /></el-icon>分享
                            </el-dropdown-item>
                            <el-dropdown-item divided @click="deleteResume(resume)">
                              <el-icon><Delete /></el-icon>删除
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                      
                      <el-button type="primary" size="small" @click="optimizeResume(resume)">
                        <el-icon><MagicStick /></el-icon>
                        AI优化
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </div>
            </transition-group>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已分析" name="analyzed">
          <div class="resume-grid">
            <!-- 类似的简历列表，只显示已分析的 -->
          </div>
        </el-tab-pane>

        <el-tab-pane label="待优化" name="pending">
          <div class="resume-grid">
            <!-- 类似的简历列表，只显示待优化的 -->
          </div>
        </el-tab-pane>

        <el-tab-pane label="收藏夹" name="favorites">
          <div class="resume-grid">
            <!-- 收藏的简历列表 -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传简历" width="500px">
      <el-upload
        class="upload-area"
        drag
        action="#"
        :multiple="true"
        :on-change="handleFileChange"
        :auto-upload="false"
      >
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">
          <span class="main-text">点击或拖拽文件到此区域上传</span>
          <span class="sub-text">支持 PDF、Word 格式，单个文件不超过10MB</span>
        </div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmUpload">开始上传</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreviewDialog" :title="currentResume?.name" width="800px">
      <div class="preview-content">
        <iframe :src="previewUrl" frameborder="0" class="preview-iframe"></iframe>
      </div>
    </el-dialog>

    <!-- 重命名对话框 -->
    <el-dialog v-model="showRenameDialog" title="重命名简历" width="400px">
      <el-input v-model="newName" placeholder="请输入新的文件名" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRenameDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  Upload,
  Search,
  View,
  Download,
  Edit,
  Delete,
  Document,
  Clock,
  Files,
  ArrowDown,
  DataAnalysis,
  Share,
  MagicStick,
  UploadFilled
} from "@element-plus/icons-vue"

const activeTab = ref("all")
const searchQuery = ref("")
const showUploadDialog = ref(false)
const showPreviewDialog = ref(false)
const showRenameDialog = ref(false)
const currentResume = ref(null)
const newName = ref("")
const previewUrl = ref("")

// 统计数据
const stats = ref([
  { icon: "📄", value: "12", label: "总简历", bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { icon: "✅", value: "8", label: "已分析", bgColor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { icon: "✨", value: "5", label: "已优化", bgColor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { icon: "🎯", value: "92%", label: "平均匹配度", bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }
])

// 简历列表数据
const resumes = ref([
  {
    id: 1,
    name: "Java开发工程师_张三_3年",
    format: "PDF",
    size: "2.3 MB",
    updateTime: "2024-03-15",
    status: "已分析",
    statusType: "success",
    score: 92,
    type: "technical",
    tags: ["Java", "SpringBoot", "后端"],
    favorite: true
  },
  {
    id: 2,
    name: "全栈开发_李四_简历",
    format: "DOCX",
    size: "1.8 MB",
    updateTime: "2024-03-14",
    status: "待优化",
    statusType: "warning",
    score: 76,
    type: "fullstack",
    tags: ["Vue", "Node", "全栈"],
    favorite: false
  },
  {
    id: 3,
    name: "前端工程师_王五_2024",
    format: "PDF",
    size: "1.5 MB",
    updateTime: "2024-03-13",
    status: "已分析",
    statusType: "success",
    score: 85,
    type: "frontend",
    tags: ["Vue3", "React", "前端"],
    favorite: true
  },
  {
    id: 4,
    name: "Python开发_赵六_简历",
    format: "PDF",
    size: "2.1 MB",
    updateTime: "2024-03-12",
    status: "草稿",
    statusType: "info",
    score: null,
    type: "python",
    tags: ["Python", "Django"],
    favorite: false
  },
  {
    id: 5,
    name: "数据分析师_钱七_3年",
    format: "DOCX",
    size: "1.9 MB",
    updateTime: "2024-03-11",
    status: "已分析",
    statusType: "success",
    score: 88,
    type: "data",
    tags: ["Python", "SQL", "数据分析"],
    favorite: true
  },
  {
    id: 6,
    name: "DevOps工程师_孙八",
    format: "PDF",
    size: "2.5 MB",
    updateTime: "2024-03-10",
    status: "待优化",
    statusType: "warning",
    score: 70,
    type: "devops",
    tags: ["Docker", "K8s", "AWS"],
    favorite: false
  }
])

// 过滤后的简历
const filteredResumes = computed(() => {
  if (!searchQuery.value) return resumes.value
  
  return resumes.value.filter(resume => 
    resume.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    resume.tags?.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// 获取文件图标
const getFileIcon = (format) => {
  const icons = {
    PDF: "📕",
    DOCX: "📘",
    DOC: "📗"
  }
  return icons[format] || "📄"
}

// 获取预览背景色
const getPreviewBg = (type) => {
  const backgrounds = {
    technical: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fullstack: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    frontend: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    python: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    data: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    devops: "linear-gradient(135deg, #6b73ff 0%, #000dff 100%)"
  }
  return backgrounds[type] || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}

// 获取评分颜色
const getScoreColor = (score) => {
  if (!score) return "#909399"
  if (score >= 90) return "#67C23A"
  if (score >= 80) return "#E6A23C"
  if (score >= 70) return "#F56C6C"
  return "#909399"
}

// 上传简历
const handleUpload = () => {
  showUploadDialog.value = true
}

// 文件变化
const handleFileChange = (file) => {
  console.log("文件已选择:", file)
}

// 确认上传
const confirmUpload = () => {
  showUploadDialog.value = false
  ElMessage.success("上传成功！AI分析已开始")
}

// 查看简历
const viewResume = (resume) => {
  currentResume.value = resume
  previewUrl.value = `https://example.com/preview/${resume.id}`
  showPreviewDialog.value = true
}

// 下载简历
const downloadResume = (resume) => {
  ElMessage.success(`开始下载: ${resume.name}`)
}

// 编辑简历
const editResume = (resume) => {
  ElMessage.info(`编辑功能开发中: ${resume.name}`)
}

// 重命名简历
const renameResume = (resume) => {
  currentResume.value = resume
  newName.value = resume.name
  showRenameDialog.value = true
}

// 确认重命名
const confirmRename = () => {
  if (currentResume.value) {
    currentResume.value.name = newName.value
    ElMessage.success("重命名成功")
  }
  showRenameDialog.value = false
}

// AI分析
const analyzeResume = (resume) => {
  ElMessage.info(`开始AI分析: ${resume.name}`)
}

// AI优化
const optimizeResume = (resume) => {
  ElMessage.info(`跳转到优化页面: ${resume.name}`)
  // 这里可以跳转到优化页面，并传递简历信息
}

// 分享简历
const shareResume = (resume) => {
  ElMessage.info(`分享功能开发中: ${resume.name}`)
}

// 删除简历
const deleteResume = (resume) => {
  ElMessageBox.confirm(
    `确定要删除 "${resume.name}" 吗？此操作不可恢复。`,
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    const index = resumes.value.findIndex(r => r.id === resume.id)
    if (index !== -1) {
      resumes.value.splice(index, 1)
      ElMessage.success("删除成功")
    }
  })
}
</script>

<style scoped>
.my-resumes {
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

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  border: none;
  border-radius: 20px;
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.upload-btn {
  height: 44px;
  padding: 0 25px;
  font-size: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.search-bar {
  width: 300px;
}

.search-bar :deep(.el-input__wrapper) {
  border-radius: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-bar :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.resume-list-card {
  border-radius: 24px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.resume-tabs :deep(.el-tabs__header) {
  margin-bottom: 30px;
  padding: 0 20px;
}

.resume-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

.resume-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
}

.resume-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 3px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  padding: 10px;
}

.resume-card {
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.resume-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.resume-preview {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.preview-icon {
  font-size: 60px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2));
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.resume-preview:hover .preview-overlay {
  opacity: 1;
}

.preview-overlay .el-button-group {
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.resume-preview:hover .preview-overlay .el-button-group {
  transform: translateY(0);
}

.resume-info {
  padding: 20px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.resume-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  flex: 1;
  margin-right: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  color: #718096;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-item .el-icon {
  font-size: 14px;
}

.resume-analysis {
  margin-bottom: 15px;
}

.score-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.score-label {
  color: #718096;
  font-size: 13px;
}

.score-value {
  font-size: 16px;
  font-weight: 600;
}

.resume-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.resume-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.upload-area {
  text-align: center;
  padding: 30px;
  background: #f8fafd;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
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

.preview-content {
  height: 600px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
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
  
  .action-bar {
    flex-direction: column;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .resume-meta {
    flex-wrap: wrap;
  }
  
  .preview-content {
    height: 400px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .resume-card {
    background: #1a202c;
    border-color: #2d3748;
  }
  
  .resume-name {
    color: #e2e8f0;
  }
  
  .stat-value {
    color: #e2e8f0;
  }
  
  .upload-area {
    background: #1a202c;
    border-color: #2d3748;
  }
  
  .main-text {
    color: #e2e8f0;
  }
}
</style>
<template>
  <div class="personal-center">
    <div class="header">
      <h1 class="title">👤 个人中心</h1>
      <p class="subtitle">管理您的个人信息和账号设置</p>
    </div>

    <el-row :gutter="24">
      <!-- 左侧个人信息卡片 -->
      <el-col :xs="24" :lg="8">
        <el-card class="profile-card" :body-style="{ padding: '30px' }">
          <div class="profile-header">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :src="userInfo.avatar" class="avatar">
                {{ userInfo.name.charAt(0) }}
              </el-avatar>
              <div class="avatar-upload" @click="handleAvatarUpload">
                <el-icon><Camera /></el-icon>
              </div>
            </div>
            <h2 class="user-name">{{ userInfo.name }}</h2>
            <p class="user-email">{{ userInfo.email }}</p>
            <p class="user-role">{{ userInfo.role }}</p>
          </div>

          <el-divider />

          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.resumeCount }}</span>
              <span class="stat-label">简历数量</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.analysisCount }}</span>
              <span class="stat-label">分析次数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userInfo.matchCount }}</span>
              <span class="stat-label">匹配次数</span>
            </div>
          </div>

          <el-divider />

          <div class="profile-info">
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>注册时间：{{ userInfo.joinDate }}</span>
            </div>
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span>所在地：{{ userInfo.location || '未设置' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>手机：{{ userInfo.phone || '未绑定' }}</span>
            </div>
          </div>

          <el-button class="edit-profile-btn" type="primary" text @click="editProfile">
            <el-icon><Edit /></el-icon>
            编辑资料
          </el-button>
        </el-card>
      </el-col>

      <!-- 右侧标签页内容 -->
      <el-col :xs="24" :lg="16">
        <el-card class="content-card">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <!-- 账号安全 -->
            <el-tab-pane label="账号安全" name="security">
              <div class="security-list">
                <div class="security-item" v-for="item in securityItems" :key="item.label">
                  <div class="security-info">
                    <el-icon :class="item.iconClass"><component :is="item.icon" /></el-icon>
                    <div class="security-text">
                      <span class="security-label">{{ item.label }}</span>
                      <span class="security-status" :class="item.statusClass">
                        {{ item.status }}
                      </span>
                    </div>
                  </div>
                  <el-button text type="primary" @click="handleSecurityAction(item)">
                    {{ item.action }}
                  </el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- 使用记录 -->
            <el-tab-pane label="使用记录" name="history">
              <el-timeline>
                <el-timeline-item
                  v-for="(record, index) in historyRecords"
                  :key="index"
                  :type="record.type"
                  :size="record.size"
                  :timestamp="record.time"
                >
                  <div class="record-item">
                    <h4>{{ record.title }}</h4>
                    <p>{{ record.description }}</p>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </el-tab-pane>

            <!-- 订阅管理 -->
            <el-tab-pane label="订阅管理" name="subscription">
              <div class="subscription-card">
                <div class="plan-header">
                  <div class="plan-icon">{{ currentPlan.icon }}</div>
                  <div class="plan-info">
                    <h3>{{ currentPlan.name }}</h3>
                    <p class="plan-price">¥{{ currentPlan.price }}/月</p>
                  </div>
                  <el-tag :type="currentPlan.tagType" effect="dark">{{ currentPlan.tag }}</el-tag>
                </div>

                <el-divider />

                <div class="plan-features">
                  <div class="feature-item" v-for="feature in currentPlan.features" :key="feature">
                    <el-icon><Check /></el-icon>
                    <span>{{ feature }}</span>
                  </div>
                </div>

                <div class="plan-actions">
                  <el-button type="primary" plain @click="upgradePlan">升级套餐</el-button>
                  <el-button text @click="cancelSubscription">取消订阅</el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- 通知设置 -->
            <el-tab-pane label="通知设置" name="notifications">
              <el-form label-width="120px">
                <el-form-item label="邮件通知">
                  <el-switch v-model="notifications.email" />
                </el-form-item>
                <el-form-item label="短信通知">
                  <el-switch v-model="notifications.sms" />
                </el-form-item>
                <el-form-item label="系统通知">
                  <el-switch v-model="notifications.system" />
                </el-form-item>
                <el-form-item label="每周报告">
                  <el-switch v-model="notifications.weekly" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveNotifications">保存设置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="所在地">
          <el-input v-model="editForm.location" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { ElMessage } from "element-plus"
import {
  Camera,
  Calendar,
  Location,
  Phone,
  Edit,
  Check,
  Lock,
  Message,
  Key,
  Monitor
} from "@element-plus/icons-vue"

const activeTab = ref("security")
const showEditDialog = ref(false)

// 用户信息
const userInfo = reactive({
  name: "张三",
  email: "zhangsan@example.com",
  role: "高级会员",
  avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
  resumeCount: 12,
  analysisCount: 48,
  matchCount: 156,
  joinDate: "2024-01-15",
  location: "上海",
  phone: "138****8888"
})

// 安全设置项
const securityItems = ref([
  {
    icon: "Lock",
    iconClass: "security-icon",
    label: "登录密码",
    status: "已设置",
    statusClass: "status-success",
    action: "修改",
    type: "password"
  },
  {
    icon: "Message",
    iconClass: "security-icon",
    label: "绑定手机",
    status: "已绑定 138****8888",
    statusClass: "status-success",
    action: "更换",
    type: "phone"
  },
  {
    icon: "Key",
    iconClass: "security-icon",
    label: "二次验证",
    status: "未开启",
    statusClass: "status-warning",
    action: "开启",
    type: "2fa"
  },
  {
    icon: "Monitor",
    iconClass: "security-icon",
    label: "登录设备",
    status: "2台设备在线",
    statusClass: "status-info",
    action: "管理",
    type: "devices"
  }
])

// 历史记录
const historyRecords = ref([
  {
    type: "primary",
    size: "large",
    time: "2024-03-15 14:30",
    title: "简历分析完成",
    description: "Java后端工程师简历分析完成，综合评分78分"
  },
  {
    type: "success",
    time: "2024-03-14 09:20",
    title: "简历优化成功",
    description: "3条简历描述已完成AI优化"
  },
  {
    type: "info",
    time: "2024-03-13 16:45",
    title: "岗位匹配完成",
    description: "找到6个匹配岗位，最高匹配度92%"
  },
  {
    type: "warning",
    time: "2024-03-12 11:10",
    title: "简历上传",
    description: "上传了新简历：张三_Java开发_3年.pdf"
  },
  {
    type: "danger",
    time: "2024-03-11 08:30",
    title: "订阅续费",
    description: "高级会员订阅已续费，有效期至2024-04-11"
  }
])

// 当前套餐
const currentPlan = ref({
  icon: "🚀",
  name: "高级会员",
  price: 99,
  tag: "当前套餐",
  tagType: "success",
  features: [
    "无限次AI简历分析",
    "高级AI优化功能",
    "精准岗位匹配推荐",
    "行业趋势报告",
    "优先客服支持"
  ]
})

// 通知设置
const notifications = ref({
  email: true,
  sms: false,
  system: true,
  weekly: true
})

// 编辑表单
const editForm = reactive({
  name: userInfo.name,
  email: userInfo.email,
  phone: userInfo.phone,
  location: userInfo.location
})

// 头像上传
const handleAvatarUpload = () => {
  ElMessage.info("头像上传功能开发中")
}

// 编辑资料
const editProfile = () => {
  editForm.name = userInfo.name
  editForm.email = userInfo.email
  editForm.phone = userInfo.phone
  editForm.location = userInfo.location
  showEditDialog.value = true
}

// 保存资料
const saveProfile = () => {
  userInfo.name = editForm.name
  userInfo.email = editForm.email
  userInfo.phone = editForm.phone
  userInfo.location = editForm.location
  showEditDialog.value = false
  ElMessage.success("资料已更新")
}

// 处理安全操作
const handleSecurityAction = (item) => {
  ElMessage.info(`${item.action}${item.label}功能开发中`)
}

// 升级套餐
const upgradePlan = () => {
  ElMessage.info("套餐升级功能开发中")
}

// 取消订阅
const cancelSubscription = () => {
  ElMessage.info("取消订阅功能开发中")
}

// 保存通知设置
const saveNotifications = () => {
  ElMessage.success("通知设置已保存")
}
</script>

<style scoped>
.personal-center {
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

.profile-card {
  border-radius: 24px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  height: 100%;
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
}

.profile-header {
  text-align: center;
  position: relative;
}

.avatar-wrapper {
  position: relative;
  width: fit-content;
  margin: 0 auto 20px;
}

.avatar {
  border: 4px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid white;
}

.avatar-upload:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.avatar-upload .el-icon {
  color: white;
  font-size: 16px;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 10px 0 5px;
}

.user-email {
  color: #718096;
  font-size: 14px;
  margin-bottom: 5px;
}

.user-role {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 40px;
  font-size: 12px;
  font-weight: 500;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.2;
}

.stat-label {
  color: #718096;
  font-size: 14px;
}

.profile-info {
  padding: 20px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: #4a5568;
}

.info-item .el-icon {
  color: #667eea;
  font-size: 18px;
}

.edit-profile-btn {
  width: 100%;
  margin-top: 10px;
  color: #667eea;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.content-card {
  border-radius: 24px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.profile-tabs :deep(.el-tabs__header) {
  margin-bottom: 30px;
}

.profile-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 20px;
}

.profile-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
}

.profile-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 3px;
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #f8fafd;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.security-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.security-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.security-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.security-text {
  display: flex;
  flex-direction: column;
}

.security-label {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.security-status {
  font-size: 13px;
}

.status-success {
  color: #48bb78;
}

.status-warning {
  color: #f6ad55;
}

.status-info {
  color: #667eea;
}

.record-item {
  padding: 10px 0;
}

.record-item h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px 0;
}

.record-item p {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

.subscription-card {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.plan-icon {
  font-size: 48px;
}

.plan-info {
  flex: 1;
}

.plan-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 5px 0;
}

.plan-price {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.plan-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 15px;
  border-radius: 40px;
  backdrop-filter: blur(10px);
}

.feature-item .el-icon {
  color: #4ade80;
  font-size: 16px;
}

.plan-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.plan-actions .el-button {
  flex: 1;
  height: 44px;
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
  
  .profile-stats {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .stat-item {
    width: calc(33.33% - 10px);
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .security-item .el-button {
    width: 100%;
  }
  
  .plan-header {
    flex-wrap: wrap;
  }
  
  .plan-features {
    grid-template-columns: 1fr;
  }
}
</style>
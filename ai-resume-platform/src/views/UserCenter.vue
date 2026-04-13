<template>
  <div class="profile-page" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">吾之小传</h1>
    </div>

    <!-- 左上：吾（用户信息） -->
    <div class="module-wrapper module-wrapper-user">
      <img :src="Border" class="border-img" />
      <div class="module module-user" @click="showUserDetailModal = true">
        <div class="module-header">
          <span class="module-icon">📖</span>
          <h2 class="module-title">吾</h2>
        </div>
        <div class="module-content">
          <div class="info-item">
            <span class="info-label">名号</span>
            <span class="info-value">{{ user.name || '未命名' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">手机</span>
            <span class="info-value">{{ user.phone }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右上：往言（历史评论） -->
    <div class="module-wrapper module-wrapper-comments">
      <img :src="Border" class="border-img" />
      <div class="module module-comments" @click="showCommentsModal = true">
        <div class="module-header">
          <span class="module-icon">💬</span>
          <h2 class="module-title">往言</h2>
        </div>
        <div class="module-content scroll-area">
          <ul v-if="myComments.length" class="list">
            <li v-for="(item, index) in myComments.slice(0, 5)" :key="index" class="list-item">
              <span class="item-name">{{ item.content?.slice(0, 15) }}{{ item.content?.length > 15 ? '...' : '' }}</span>
              <span class="item-detail">
                ❤️ {{ item.likeCount }} | {{ item.createTime }}
              </span>
            </li>
          </ul>
          <div v-else class="empty-text">暂无往言</div>
        </div>
      </div>
    </div>

    <!-- 左下：旧迹（打卡历史） -->
    <div class="module-wrapper module-wrapper-checkin">
      <img :src="Border" class="border-img" />
      <div class="module module-checkin">
        <div class="module-header">
          <span class="module-icon">📍</span>
          <h2 class="module-title">旧迹</h2>
        </div>
        <div class="module-content">
          <ul v-if="checkins.length" class="list">
            <li v-for="(item, index) in checkins" :key="item.id || index" class="list-item">
              <span class="item-name">{{ item.scenicName || '未知景点' }}</span>
              <span class="item-detail">{{ formatDate(item.checkinDate) }}</span>
            </li>
          </ul>
          <div v-else class="empty-text">暂无旧迹</div>
        </div>
      </div>
    </div>

    <!-- 右下：操作按钮 -->
    <div class="module-wrapper module-wrapper-actions">
      <img :src="Border" class="border-img" />
      <div class="module module-actions">
        <div class="module-header">
          <span class="module-icon">⚙️</span>
          <h2 class="module-title">行事</h2>
        </div>
        <div class="module-content">
          <div class="action-buttons">
            <button class="action-btn home-btn" @click="goHome">返回首页</button>
            <button class="action-btn logout-btn" @click="logout">退出登录</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间：用户形象（只能从6个预设中选择） -->
    <div class="avatar-wrapper">
      <div class="avatar-center">
        <div class="avatar-frame">
          <img :src="currentProfileImage" alt="人物形象" class="avatar-img" @click="showProfileImageModal = true" />
          <div class="avatar-hint">点击切换形象</div>
        </div>
      </div>
    </div>

    <!-- 弹窗1：切换用户形象（6个预设形象） -->
    <div v-if="showProfileImageModal" class="modal-overlay" @click="showProfileImageModal = false">
      <div class="modal-wrapper avatar-modal-wrapper">
        <img :src="Border" class="border-img-modal avatar-border-img" />
        <div class="modal-content avatar-modal-content" @click.stop>
          <div class="modal-header">
            <h3>选择人物形象</h3>
            <button class="modal-close" @click="showProfileImageModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div v-for="(profile, index) in profileImageList" :key="index" class="avatar-option" @click="selectProfileImage(profile)">
              <img :src="profile.url" :alt="profile.name" class="option-img" />
              <span>{{ profile.name }}</span>
              <span v-if="currentProfileImage === profile.url" class="check-mark">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗2：用户详细信息（包含头像上传） -->
    <div v-if="showUserDetailModal" class="modal-overlay" @click="showUserDetailModal = false">
      <div class="modal-wrapper user-modal-wrapper">
        <img :src="Border" class="border-img-modal user-border-img" />
        <div class="modal-content user-modal-content" @click.stop>
          <div class="modal-header">
            <h3>吾之详情</h3>
            <button class="modal-close" @click="showUserDetailModal = false">✕</button>
          </div>
          <div class="modal-body-user">
            <div class="user-edit-form">
              <!-- 头像区域 - 可上传图片 -->
              <div class="avatar-section">
                <div class="avatar-preview">
                  <img :src="editUser.avatar || defaultAvatar" alt="头像" class="avatar-preview-img" />
                </div>
                <input type="file" ref="avatarInput" @change="uploadAvatar" accept="image/*" style="display: none;" />
                <button class="upload-btn" @click="triggerAvatarUpload">上传头像</button>
                <span class="upload-hint">建议上传1:1比例图片</span>
              </div>

              <!-- 名号 -->
              <div class="form-group">
                <label>名号</label>
                <div class="input-wrapper">
                  <input type="text" v-model="editUser.name" placeholder="请输入名号" class="edit-input" />
                  <span class="clear-btn" @click="editUser.name = ''" v-if="editUser.name">✕</span>
                </div>
              </div>

              <!-- 手机 -->
              <div class="form-group">
                <label>手机</label>
                <div class="input-wrapper">
                  <input type="text" v-model="editUser.phone" placeholder="请输入手机" class="edit-input" />
                  <span class="clear-btn" @click="editUser.phone = ''" v-if="editUser.phone">✕</span>
                </div>
              </div>

              <!-- 邮箱 -->
              <div class="form-group">
                <label>邮箱</label>
                <div class="input-wrapper">
                  <input type="email" v-model="editUser.email" placeholder="请输入邮箱" class="edit-input" />
                  <span class="clear-btn" @click="editUser.email = ''" v-if="editUser.email">✕</span>
                </div>
              </div>

              <div class="form-actions">
                <button class="save-btn" @click="saveUserInfo">保存</button>
                <button class="cancel-btn" @click="showUserDetailModal = false">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗3：往言详情 -->
    <div v-if="showCommentsModal" class="modal-overlay" @click="showCommentsModal = false">
      <div class="modal-wrapper comments-modal-wrapper">
        <img :src="Border" class="border-img-modal comments-border-img" />
        <div class="modal-content comments-modal-content" @click.stop>
          <div class="modal-header">
            <h3>往言录</h3>
            <button class="modal-close" @click="showCommentsModal = false">✕</button>
          </div>
          <div class="modal-body-list">
            <div v-if="myComments.length" class="comments-list">
              <div v-for="(item, index) in myComments" :key="index" class="comment-item">
                <div class="comment-header">
                  <span class="comment-scene">{{ item.scenicName }}</span>
                  <span class="comment-date">{{ item.createTime }}</span>
                </div>
                <div class="comment-content">{{ item.content }}</div>
                <div class="comment-footer">
                  <span class="comment-likes">❤️ {{ item.likeCount }} 人喜欢</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-text-large">暂无往言记录</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签 -->
    <div class="tag left-top">
      <img :src="Border2" class="tag-border" />
      <div class="tag-text">
        <span class="benwo">本我</span>
      </div>
    </div>
    <div class="tag left-bottom">
      <img :src="Border4" class="tag-border" />
      <div class="tag-text">
        <span class="benwo">昔迹</span>
      </div>
    </div>
    <div class="tag right-top">
      <img :src="Border4" class="tag-border" />
      <div class="tag-text">
        <span class="benwo">陈论</span>
      </div>
    </div>
    <div class="tag right-bottom">
      <img :src="Border2" class="tag-border" />
      <div class="tag-text">
        <span class="benwo">游踪</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { GetUserProfile, UpdateUserProfile, GetCheckins, GetComments, UploadImage } from '@/api/auth.js'
import bgImage from '@/assets/imgs/grzx_bg.jpg'
import Border from '@/assets/imgs/border.png'
import Border2 from '@/assets/imgs/border2.png'
import Border3 from '@/assets/imgs/border3.png'
import Border4 from '@/assets/imgs/border4.png'

const router = useRouter()

// 弹窗显示控制
const showProfileImageModal = ref(false)  // 切换用户形象弹窗
const showUserDetailModal = ref(false)
const showCommentsModal = ref(false)

// 用户形象列表（6个预设形象）
const profileImageList = ref([
  { name: '侠客', url: new URL('@/assets/Characters/image1.png', import.meta.url).href },
  { name: '画师', url: new URL('@/assets/Characters/image2.png', import.meta.url).href },
  { name: '书生', url: new URL('@/assets/Characters/image3.png', import.meta.url).href },
  { name: '诗人', url: new URL('@/assets/Characters/image4.png', import.meta.url).href },
  { name: '郡主', url: new URL('@/assets/Characters/image5.png', import.meta.url).href },
  { name: '千金', url: new URL('@/assets/Characters/image6.png', import.meta.url).href },
])

const defaultAvatar = new URL('@/assets/imgs/red-soldier.png', import.meta.url).href
const defaultProfileImage = profileImageList.value[0].url

// 当前选中的用户形象（中间大图）
const currentProfileImage = ref(defaultProfileImage)

const user = reactive({
  name: '',
  avatar: '',      // 小头像（用户上传）
  phone: '',
  email: '',
  profileImage: '' // 用户形象（从6个预设中选择）
})

// 编辑用的用户数据副本
const editUser = reactive({
  name: '',
  avatar: '',
  phone: '',
  email: ''
})

const checkins = ref([])
const myComments = ref([])

const avatarInput = ref(null)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const loadUserComments = async () => {
  try {
    const res = await GetComments()
    if (res.code === 200 && res.data) {
      myComments.value = res.data.map(comment => ({
        id: comment.id,
        content: comment.content,
        likeCount: comment.likeCount,
        createTime: formatDate(comment.createTime),
        scenicName: comment.scenicName || '未知景点'
      }))
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败')
  }
}

const loadCheckins = async () => {
  try {
    const res = await GetCheckins()
    if (res.code === 200 && res.data) {
      checkins.value = res.data.map(item => ({
        id: item.id,
        scenicName: item.scenicName,
        checkinDate: item.checkinDate
      }))
    }
  } catch (error) {
    console.error('获取打卡记录失败:', error)
    ElMessage.error('获取打卡记录失败')
  }
}

const initUser = async () => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.replace('/login')
      return
    }
    
    const res = await GetUserProfile()
    if (res.code === 200 && res.data) {
      const userData = res.data
      
      user.name = userData.username || '旅行者'
      user.phone = userData.phone || ''
      user.email = userData.email || ''
      user.avatar = userData.avatar || ''
      user.profileImage = userData.profileImage || ''
      
      // 更新本地存储
      const localUser = JSON.parse(userStr)
      localUser.name = user.name
      localUser.phone = user.phone
      localUser.email = user.email
      localStorage.setItem('user', JSON.stringify(localUser))
      
      // 初始化编辑数据
      editUser.name = user.name
      editUser.phone = user.phone
      editUser.email = user.email
      editUser.avatar = user.avatar
      
      // 设置用户形象
      if (userData.profileImage) {
        currentProfileImage.value = userData.profileImage
      } else {
        currentProfileImage.value = defaultProfileImage
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

const initPageData = () => {
  initUser()
  loadCheckins()
  loadUserComments()
}

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value.click()
}

// 上传头像（调用 UploadImage 接口）
const uploadAvatar = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过2MB')
    return
  }
  
  const loading = ElLoading.service({
    lock: true,
    text: '上传中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await UploadImage(formData)
    if (res.code === 200 && res.data && res.data.url) {
      editUser.avatar = res.data.url
      ElMessage.success('头像上传成功，点击保存即可更新')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    loading.close()
  }
  
  event.target.value = ''
}

// 选择用户形象（先上传图片获取URL，再更新）
const selectProfileImage = async (profile) => {
  showProfileImageModal.value = false
  
  const loading = ElLoading.service({
    lock: true,
    text: '切换形象中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    // 将预设图片转为 File 对象并上传
    const response = await fetch(profile.url)
    const blob = await response.blob()
    const file = new File([blob], `${profile.name}.png`, { type: 'image/png' })
    
    const formData = new FormData()
    formData.append('file', file)
    
    const uploadRes = await UploadImage(formData)
    if (uploadRes.code === 200 && uploadRes.data && uploadRes.data.url) {
      const uploadedUrl = uploadRes.data.url
      
      // 更新本地显示
      currentProfileImage.value = uploadedUrl
      
      // 调用更新用户信息接口
      const updateRes = await UpdateUserProfile({
        nickname: user.name,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        profileImage: uploadedUrl
      })
      
      if (updateRes.code === 200) {
        user.profileImage = uploadedUrl
        localStorage.setItem('userProfileImage', uploadedUrl)
        ElMessage.success('切换形象成功！')
      } else {
        ElMessage.error(updateRes.message || '更新失败')
        // 恢复原来的形象
        currentProfileImage.value = user.profileImage || defaultProfileImage
      }
    } else {
      ElMessage.error(uploadRes.message || '上传形象失败')
    }
  } catch (error) {
    console.error('切换形象失败:', error)
    ElMessage.error('切换形象失败，请重试')
  } finally {
    loading.close()
  }
}

// 保存用户信息（名号、手机、邮箱、头像）
const saveUserInfo = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '保存中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    const res = await UpdateUserProfile({
      nickname: editUser.name,
      phone: editUser.phone,
      email: editUser.email,
      avatar: editUser.avatar,
      profileImage: currentProfileImage.value
    })
    
    if (res.code === 200) {
      // 更新本地存储
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const userData = JSON.parse(userStr)
        userData.name = editUser.name
        userData.phone = editUser.phone
        userData.email = editUser.email
        localStorage.setItem('user', JSON.stringify(userData))
      }
      
      // 更新响应式数据
      user.name = editUser.name
      user.phone = editUser.phone
      user.email = editUser.email
      user.avatar = editUser.avatar

      ElMessage.success('保存成功！')
      showUserDetailModal.value = false
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    loading.close()
  }
}

const goHome = () => {
  router.push({ path: '/', query: { target: 'home' } })
}

const logout = () => {
  ElMessageBox.confirm('确定退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('user')
    localStorage.removeItem('userProfileImage')
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}

onBeforeMount(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    router.replace('/login')
  }
})

onMounted(() => {
  initPageData()
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  padding: 30px 80px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 模块添加点击光标 */
.module {
  cursor: pointer;
  transition: all 0.3s ease;
}

.module:hover {
  transform: translateY(-5px);
  backdrop-filter: blur(8px);
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 64px;
  font-family: 'STKaiti', 'KaiTi', serif;
  color: #000000;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  letter-spacing: 8px;
  margin: 0;
  display: inline-block;
  padding: 0 30px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.5);
}

/* 模块包裹器 */
.module-wrapper {
  position: absolute;
  z-index: 2;
}

.module-wrapper-user {
  height: 225px;
  width: 250px;
  top: 10%;
  left: 10%;
  padding: 10px 10px;
}
.module-wrapper-user .border-img{
  top: -60px;
  left: -100px;
  width: calc(100% + 200px);
  height: calc(100% + 120px);
}

.module-wrapper-comments {
  height: 325px;
  width: 420px;
  top: 12%;
  right: 4%;
  padding: 15px 5px;
}
.module-wrapper-comments .border-img{
  top: -85px;
  left: -135px;
  width: calc(100% + 275px);
  height: calc(100% + 175px);
}
.module-wrapper-comments .scroll-area {
  max-height: 220px;   
  overflow-y: auto;    
}

.module-wrapper-checkin {
  height: auto;
  min-height: 350px;
  width: 300px;
  padding: 10px 10px;
  bottom: 6%;
  left: 12%;
}
.module-wrapper-checkin .border-img{
  top: -60px;
  left: -100px;
  width: calc(100% + 200px);
  height: calc(100% + 120px);
}
.module-wrapper-checkin .module-content {
  max-height: 280px;  
  overflow-y: auto;    
  padding-right: 5px;  
}

/* 滚动条美化（与现有样式保持一致） */
.module-wrapper-checkin .module-content::-webkit-scrollbar,
.module-wrapper-comments .scroll-area::-webkit-scrollbar {
  width: 4px;
}

.module-wrapper-checkin .module-content::-webkit-scrollbar-track,
.module-wrapper-comments .scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.module-wrapper-checkin .module-content::-webkit-scrollbar-thumb,
.module-wrapper-comments .scroll-area::-webkit-scrollbar-thumb {
  background: #c9aa5f;
  border-radius: 3px;
}
.module-wrapper-actions {
  height: 225px;
  width: 300px;
  bottom: 7%;
  right: 10%;
  padding: 5px 5px;
}
.module-wrapper-actions .border-img{
  top: -50px;
  left: -100px;
  width: calc(100% + 200px);
  height: calc(100% + 100px);
}

/* 操作按钮（淡雅古风） */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}

.action-btn {
  padding: 10px 20px;
  font-size: 16px;
  font-family: 'STKaiti', 'KaiTi', '楷体', serif;
  border: 1px solid #c9b896;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 2px;
  background: transparent;
  color: #5c4b32;
}

.action-btn:hover {
  background: rgba(201, 170, 95, 0.15);
  border-color: #b89850;
  transform: translateY(-2px);
}

/* 返回首页按钮 */
.home-btn {
  border-color: #8b9c6e;
  color: #6b7b4e;
}

.home-btn:hover {
  background: rgba(107, 123, 78, 0.15);
  border-color: #6b7b4e;
}

/* 退出登录按钮 */
.logout-btn {
  border-color: #c17a6e;
  color: #a85a4e;
}

.logout-btn:hover {
  background: rgba(168, 90, 78, 0.1);
  border-color: #a85a4e;
}

/* 边框图片 */
.border-img {
  position: absolute;
  z-index: 10;
  pointer-events: none;
}

/* 模块内容 */
.module {
  position: relative;
  padding: 20px 25px;
  box-sizing: border-box;
  z-index: 2;
  transition: all 0.3s ease;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-bottom: 10px;
  margin-bottom: 12px;
}

.module-icon {
  font-size: 28px;
}

.module-title {
  font-size: 30px;
  font-family: "LiSu", "隶书", serif;
  font-weight: 700;
  margin: 0;
  color: #515151;
}

.module-content {
  font-size: 14px;
  color: #333;
}

/* 信息列表 */
.info-item {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
}

.info-label {
  font-weight: 700;
  width: 45px;
  color: #555;
}

.info-value {
  flex: 1;
  color: #222;
  word-break: break-word;
}

/* 通用列表样式 */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.list-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 600;
  color: #2c2c2c;
}

.item-detail {
  font-size: 12px;
  color: #888;
}

.scroll-area {
  max-height: 180px;
  overflow-y: auto;
}

.empty-text {
  text-align: center;
  color: #999;
  padding: 20px 0;
  font-size: 13px;
}

/* 中间人物形象 */
.avatar-wrapper {
  position: absolute;
  left: 50%;
  top: 60%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.avatar-center {
  position: relative;
  text-align: center;
  z-index: 2;
}

.avatar-frame {
  width: 350px;
  height: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
}

.avatar-frame:hover {
  transform: scale(1.02);
}

.avatar-img {
  width: 80%;
  height: auto;
  object-fit: contain;
}

.avatar-hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(58, 57, 57, 0.8);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* 弹窗通用样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-wrapper {
  position: relative;
  max-width: 90%;
}

.modal-content {
  position: relative;
  background: rgba(246, 241, 232, 0.98);
  border-radius: 8px;
  overflow: hidden;
  z-index: 2;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px 15px 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-family: 'STKaiti', 'KaiTi', serif;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #a83b2a;
}

/* 弹窗1：人物形象边框样式 */
.avatar-modal-wrapper {
  width: 500px;
}
.avatar-modal-content {
  border-radius: 30px;
  z-index: 8;
}
.avatar-border-img {
  position: absolute;
  top: -157px;
  left: -210px;
  width: calc(100% + 420px);
  height: calc(100% + 320px);
  z-index: 9;
  pointer-events: none;
}

/* 弹窗2：用户信息边框样式 */
.user-modal-wrapper {
  width: 425px;
  position: relative;
}

.user-modal-content {
  padding: 0;
  position: relative;
  border-radius: 30px;
  z-index: 10;
}

.user-modal-content .modal-header {
  padding: 20px 45px;
  border-bottom: none;
}

.user-border-img {
  position: absolute;
  top: -140px;
  left: -172.5px;
  width: calc(100% + 345px);
  height: calc(100% + 285px);
  z-index: 11;
  pointer-events: none;
}

/* 用户编辑表单样式 */
.modal-body-user {
  padding: 20px 30px 30px 30px;
}

.user-edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #c9aa5f;
  background: #f5f0e8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  padding: 6px 24px;
  background: #c9aa5f;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #b89850;
  transform: translateY(-1px);
}

.upload-hint {
  font-size: 12px;
  color: #999;
}

/* 表单项 */
.form-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  width: 45px;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.edit-input {
  width: 100%;
  padding: 10px 30px 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fafafa;
}

.edit-input:focus {
  outline: none;
  border-color: #c9aa5f;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(201, 170, 95, 0.1);
}

.clear-btn {
  position: absolute;
  right: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ccc;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #999;
}

/* 按钮区域 */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.save-btn, .cancel-btn {
  padding: 8px 30px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: #c9aa5f;
  color: #fff;
}

.save-btn:hover {
  background: #b89850;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #eee;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

/* 弹窗3：往言边框样式 */
.comments-modal-wrapper {
  width: 520px;
  max-height: 80vh;
}
.comments-modal-content {
  border-radius: 30px;
  z-index: 8;
  display: flex;
  flex-direction: column;
  max-height: 70vh;  
  overflow: hidden;
}

.comments-border-img {
  position: absolute;
  top: -125px;
  left: -215px;
  width: calc(100% + 430px);
  height: calc(100% + 250px);
  z-index: 9;
  pointer-events: none;
}

/* 列表详情弹窗样式 */
.modal-body-list {
  padding: 20px 30px;
  flex: 1;
  overflow-y: auto;  
  max-height: 415px;
  min-height: 400px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border-left: 3px solid #c9aa5f;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.comment-scene {
  font-weight: 600;
  color: #c9aa5f;
}

.comment-date {
  font-size: 12px;
  color: #999;
}

.comment-content {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
}

.comment-footer {
  margin-top: 8px;
}

.comment-likes {
  font-size: 12px;
  color: #e74c3c;
}

.empty-text-large {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

/* 弹窗中的形象选项 */
.modal-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding-top: 20px;
}

.avatar-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.5);
}

.avatar-option:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-3px);
}

.option-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 10px;
}

.avatar-option span:first-of-type {
  font-size: 14px;
  color: #333;
}

.check-mark {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #67c23a;
  font-size: 20px;
  font-weight: bold;
}

/* 标签 */
.tag {
  position: absolute;        
  display: flex;      
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.tag.left-top {
  width: 475px;        
  height: 350px; 
  top: 12%;
  left: 23%;
  z-index: 2;
}

.tag.left-top .tag-border {
  transform: translate(-30%, -50%) rotate(180deg);
}

.tag.right-top {
  width: 400px;        
  height: 275px; 
  top: 10%;
  right: 25%;
  z-index: 2;
}

.tag.right-top .tag-border {
  transform: translate(-55%, -50%);
}

.tag.left-bottom {
  width: 375px;        
  height: 275px;
  bottom: 5%;
  left: 30%;
  z-index: 2;
}

.tag.left-bottom .tag-border {
  transform: translate(-44%, -50%) rotate(180deg);
}

.tag.right-bottom {
  width: 420px;        
  height: 300px;
  bottom: 12%;
  right: 25%;
  z-index: 2;
}

.tag.right-bottom .tag-border {
  transform: translate(-58%, -50%);
}

.tag-border {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 60px;
  z-index: 11;
  pointer-events: none;
}

.tag-text {
  font-family: '隶书','楷体';
  font-size: 22px;
  color: #333;
  z-index: 11;
}

/* 滚动条美化 */
.modal-body-list::-webkit-scrollbar,
.scroll-area::-webkit-scrollbar {
  width: 6px;
}

.modal-body-list::-webkit-scrollbar-track,
.scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.modal-body-list::-webkit-scrollbar-thumb,
.scroll-area::-webkit-scrollbar-thumb {
  background: #c9aa5f;
  border-radius: 3px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .profile-page {
    padding: 20px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .module-wrapper {
    position: relative;
    width: 90%;
    max-width: 320px;
    margin: 15px auto;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
  }
  
  .module {
    width: 100%;
  }
  
  .avatar-wrapper {
    position: relative;
    margin: 30px auto;
    transform: none;
    left: auto;
    top: auto;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 32px;
    letter-spacing: 4px;
  }
  
  .avatar-frame {
    width: 250px;
  }
  
  .modal-body {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .option-img {
    width: 70px;
    height: 70px;
  }
  
  .avatar-modal-wrapper,
  .user-modal-wrapper,
  .comments-modal-wrapper {
    width: 95%;
  }
  
  .modal-body-user,
  .modal-body-list {
    padding: 15px;
  }
  
  /* 小屏幕隐藏边框图片避免错位 */
  .border-img,
  .avatar-border-img,
  .user-border-img,
  .comments-border-img {
    display: none;
  }
}
</style>
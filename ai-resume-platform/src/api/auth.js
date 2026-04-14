import { request } from '@/utils/request'

export function loginApi(data) {
  return request('/api/auth/login', {
    method: 'POST',
    body: data,
    withToken: false
  })
}

export function registerApi(data) {
  return request('/api/auth/register', {
    method: 'POST',
    body: data,
    withToken: false
  })
}


// 用户中心
export function GetUserProfile() {
  return request('/api/user/profile', {
    method: 'get',
    withToken: true
  })
}

export function UpdateUserProfile(data) {
  return request('/api/user/profile', {
    method: 'put',
    body: data,
    withToken: true
  })
}

export function GetComments(data) {
  return request('/api/user/comments', {
    method: 'get',
    body: data,
    withToken: true
  })
}

export function GetCheckins(data) {
  return request('/api/user/checkins', {
    method: 'get',
    body: data,
    withToken: true
  })
}

export function GetScenics(ScenicId) {
  return request(`/api/scenics/${ScenicId}`, {
    method: 'get',
    withToken: true
  })
}

export function UploadImage(file) {
  return request('/api/file/upload/image', {
    method: 'post',
    body: file,
    withToken: true,
    isFormData: true 
  })
}
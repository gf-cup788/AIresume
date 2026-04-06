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
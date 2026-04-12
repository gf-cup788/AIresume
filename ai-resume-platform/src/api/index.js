import { request } from '@/utils/request'

export function aiChat(data) {
  return request('/api/ai/chat', {
    method: 'POST',
    body: data,
    withToken: true
  })
}
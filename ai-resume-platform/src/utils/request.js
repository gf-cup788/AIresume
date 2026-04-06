const BASE_URL = 'http://150.158.115.69:9012'

function getToken() {
  return localStorage.getItem('token') || ''
}

function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export async function request(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    withToken = true,
    timeout = 15000
  } = options

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }

  if (withToken) {
    const token = getToken()
    if (token) {
      finalHeaders.satoken = token
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    })

    clearTimeout(timer)

    let result = null
    try {
      result = await response.json()
    } catch (e) {
      throw new Error('服务器返回的不是合法 JSON')
    }

    if (!response.ok) {
      throw new Error(result?.message || `请求失败：HTTP ${response.status}`)
    }

    const success = result?.code === 200 || result?.code === 0

    if (!success) {
      if (
        result?.code === 401 ||
        result?.code === 403 ||
        /token|登录|认证|未登录/i.test(result?.message || '')
      ) {
        clearAuth()
      }
      throw new Error(result?.message || '请求失败')
    }

    return result
  } catch (error) {
    clearTimeout(timer)

    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试')
    }

    throw error
  }
}

export function saveLoginInfo({ token, user }) {
  if (token) {
    localStorage.setItem('token', token)
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export function getLoginUser() {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function logout() {
  clearAuth()
}
/**
 * Cliente HTTP central — integração React ↔ Spring Boot.
 *
 * - Base URL: VITE_API_URL (dev: /api com proxy Vite)
 * - JWT em localStorage (senai_token)
 * - Erros da API viram ApiError com mensagem legível
 */

const TOKEN_KEY = 'senai_token'

export const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function extractMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    if ('message' in body && typeof (body as { message: unknown }).message === 'string') {
      return (body as { message: string }).message
    }
    if (!Array.isArray(body)) {
      const values = Object.values(body as Record<string, string>)
      if (values.length > 0) return values.join(' ')
    }
  }
  if (status === 401) return 'Sessão expirada ou não autenticado. Faça login novamente.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  return `Erro na comunicação com o servidor (${status}).`
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers ?? {})
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const needsAuth = options.auth !== false
  if (needsAuth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    throw new ApiError(extractMessage(body, res.status), res.status)
  }

  if (res.status === 204 || !text) return undefined as T
  return body as T
}

import type { ConfigSummary, StoredConfig, TenantConfig, ValidationResult } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`

    try {
      const body = await response.json()
      detail = Array.isArray(body.detail) ? body.detail.join(', ') : body.detail
    } catch {
      // Keep the status-based message when the body is not JSON.
    }

    throw new Error(detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function validateConfig(config: TenantConfig) {
  return request<ValidationResult>('/configs/validate', {
    body: JSON.stringify({ config }),
    method: 'POST',
  })
}

export function saveConfig(config: TenantConfig) {
  return request<StoredConfig>('/configs', {
    body: JSON.stringify(config),
    method: 'POST',
  })
}

export function listConfigs() {
  return request<ConfigSummary[]>('/configs')
}

export function getConfig(configId: string) {
  return request<StoredConfig>(`/configs/${configId}`)
}

export function deleteConfig(configId: string) {
  return request<void>(`/configs/${configId}`, { method: 'DELETE' })
}

import type { TenantConfig } from './types'

export function isTenantConfig(value: unknown): value is TenantConfig {
  if (!value || typeof value !== 'object') {
    return false
  }

  const config = value as Partial<TenantConfig>

  return Boolean(
    typeof config.id === 'string' &&
      config.brand &&
      typeof config.brand.name === 'string' &&
      typeof config.brand.primaryColor === 'string' &&
      typeof config.brand.secondaryColor === 'string' &&
      config.features &&
      typeof config.features.mobileOrdering === 'boolean' &&
      typeof config.features.loyalty === 'boolean' &&
      typeof config.features.orderTracking === 'boolean' &&
      typeof config.features.guestCheckout === 'boolean' &&
      Array.isArray(config.navigation) &&
      config.menu &&
      Array.isArray(config.menu.categories),
  )
}

import type { MobileBuilderProject } from './types'

export function isMobileBuilderProject(
  value: unknown,
): value is MobileBuilderProject {
  if (!value || typeof value !== 'object') {
    return false
  }

  const project = value as Partial<MobileBuilderProject>

  return Boolean(
    typeof project.id === 'string' &&
      project.client &&
      typeof project.client.clientName === 'string' &&
      project.appConfig?.brand &&
      typeof project.appConfig.brand.brandName === 'string' &&
      typeof project.appConfig.brand.locationId === 'string' &&
      project.appConfig.theme &&
      typeof project.appConfig.theme.primary === 'string' &&
      Array.isArray(project.appConfig.enabledTabs) &&
      project.storeConfig &&
      typeof project.storeConfig.locationId === 'string' &&
      project.menu &&
      Array.isArray(project.menu.categories) &&
      project.homeCards &&
      Array.isArray(project.homeCards.cards) &&
      project.build &&
      typeof project.build.bundleId === 'string',
  )
}

export const isTenantConfig = isMobileBuilderProject

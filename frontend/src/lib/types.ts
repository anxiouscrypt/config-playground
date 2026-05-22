export type BrandConfig = {
  name: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
}

export type FeatureFlags = {
  mobileOrdering: boolean
  loyalty: boolean
  orderTracking: boolean
  guestCheckout: boolean
}

export type MenuCategory = {
  id: string
  name: string
  items: string[]
}

export type TenantConfig = {
  id: string
  brand: BrandConfig
  features: FeatureFlags
  navigation: string[]
  menu: {
    categories: MenuCategory[]
  }
}

export type ValidationState = {
  syntaxError: string | null
  schemaErrors: string[]
}

export type ConfigSummary = {
  id: string
  brandName: string
  updatedAt: string
}

export type StoredConfig = {
  id: string
  config: TenantConfig
  createdAt: string
  updatedAt: string
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
}

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

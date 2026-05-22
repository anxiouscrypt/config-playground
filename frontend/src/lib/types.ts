export type AppTab = 'home' | 'menu' | 'orders' | 'account'

export type AppConfigBrand = {
  brandId: string
  brandName: string
  locationId: string
  locationName: string
  marketLabel: string
}

export type AppConfigTheme = {
  background: string
  backgroundAlt: string
  surface: string
  surfaceMuted: string
  foreground: string
  foregroundMuted: string
  muted: string
  border: string
  primary: string
  accent: string
  fontFamily?: string
  displayFontFamily?: string
}

export type AppConfigHeader = {
  background: string
  foreground?: string
}

export type AppConfigFeatureFlags = {
  loyalty: boolean
  pushNotifications: boolean
  refunds: boolean
  orderTracking: boolean
  staffDashboard: boolean
  menuEditing: boolean
}

export type AppConfigPaymentCapabilities = {
  applePay: boolean
  card: boolean
  cash: boolean
  refunds: boolean
  stripe: {
    enabled: boolean
    onboarded: boolean
    dashboardEnabled: boolean
  }
}

export type FulfillmentMode = 'staff' | 'time_based'

export type AppConfigFulfillment = {
  mode: FulfillmentMode
  timeBasedScheduleMinutes: {
    inPrep: number
    ready: number
    completed: number
  }
}

export type AppConfigStoreCapabilities = {
  menu: {
    source: 'platform_managed' | 'external_sync'
  }
  operations: {
    fulfillmentMode: FulfillmentMode
    liveOrderTrackingEnabled: boolean
    dashboardEnabled: boolean
  }
  loyalty: {
    visible: boolean
  }
}

export type AppConfig = {
  brand: AppConfigBrand
  theme: AppConfigTheme
  header: AppConfigHeader
  enabledTabs: AppTab[]
  featureFlags: AppConfigFeatureFlags
  loyaltyEnabled: boolean
  paymentCapabilities: AppConfigPaymentCapabilities
  fulfillment: AppConfigFulfillment
  storeCapabilities: AppConfigStoreCapabilities
}

export type StoreConfig = {
  locationId: string
  hoursText: string
  isOpen: boolean
  nextOpenAt: string | null
  prepEtaMinutes: number
  taxRateBasisPoints: number
  pickupInstructions: string
}

export type MenuItem = {
  id: string
  name: string
  description: string
  imageUrl?: string
  priceCents: number
  badgeCodes: string[]
  visible: boolean
}

export type MenuCategory = {
  id: string
  title: string
  items: MenuItem[]
}

export type MenuResponse = {
  locationId: string
  currency: 'USD'
  categories: MenuCategory[]
}

export type HomeNewsCard = {
  cardId: string
  label: string
  title: string
  body: string
  note?: string
  sortOrder: number
  visible: boolean
}

export type HomeNewsCardsResponse = {
  locationId: string
  cards: HomeNewsCard[]
}

export type BuilderClient = {
  clientId: string
  clientName: string
  ownerEmail: string
  ownerName: string
}

export type BuildConfig = {
  appName: string
  bundleId: string
  releaseChannel: 'preview' | 'app_store'
  iconUrl: string
  splashImageUrl: string
}

export type PublishState = {
  status: 'draft' | 'validated' | 'published'
  lastValidatedAt: string | null
}

export type MobileBuilderProject = {
  id: string
  client: BuilderClient
  appConfig: AppConfig
  storeConfig: StoreConfig
  menu: MenuResponse
  homeCards: HomeNewsCardsResponse
  build: BuildConfig
  publish: PublishState
}

export type TenantConfig = MobileBuilderProject

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
  config: MobileBuilderProject
  createdAt: string
  updatedAt: string
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
}

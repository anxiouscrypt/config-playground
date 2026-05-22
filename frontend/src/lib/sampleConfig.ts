import type { TenantConfig } from './types'

export const sampleConfig: TenantConfig = {
  id: 'default-cafe',
  brand: {
    name: 'Rawaq Coffee',
    logoUrl: '',
    primaryColor: '#134733',
    secondaryColor: '#F5EFE6',
  },
  features: {
    mobileOrdering: true,
    loyalty: false,
    orderTracking: true,
    guestCheckout: true,
  },
  navigation: ['Home', 'Menu', 'Orders', 'Profile'],
  menu: {
    categories: [
      {
        id: 'coffee',
        name: 'Coffee & Espresso',
        items: ['Latte', 'Americano', 'Cappuccino'],
      },
      {
        id: 'tea',
        name: 'Tea',
        items: ['Mint Tea', 'Chamomile', 'Black Tea'],
      },
    ],
  },
}

export function formatConfig(config: TenantConfig) {
  return JSON.stringify(config, null, 2)
}

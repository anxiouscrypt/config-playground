import type { MobileBuilderProject } from './types'

export const sampleConfig: MobileBuilderProject = {
  id: 'gazelle-demo-coffee',
  client: {
    clientId: 'demo-coffee',
    clientName: 'Demo Coffee',
    ownerEmail: 'owner@democoffee.test',
    ownerName: 'Avery Demo',
  },
  appConfig: {
    brand: {
      brandId: 'demo-brand',
      brandName: 'Demo Coffee',
      locationId: 'demo-location',
      locationName: 'Demo Coffee Flagship',
      marketLabel: 'Pilot Market',
    },
    theme: {
      background: '#F7F4ED',
      backgroundAlt: '#F0ECE4',
      surface: '#FFFDF8',
      surfaceMuted: '#F3EFE7',
      foreground: '#171513',
      foregroundMuted: '#605B55',
      muted: '#9B9389',
      border: 'rgba(23, 21, 19, 0.08)',
      primary: '#1E1B18',
      accent: '#2D6A4F',
      fontFamily: 'System',
      displayFontFamily: 'Fraunces',
    },
    header: {
      background: '#F7F4ED',
      foreground: '#171513',
    },
    enabledTabs: ['home', 'menu', 'orders', 'account'],
    featureFlags: {
      loyalty: true,
      pushNotifications: true,
      refunds: true,
      orderTracking: true,
      staffDashboard: true,
      menuEditing: true,
    },
    loyaltyEnabled: true,
    paymentCapabilities: {
      applePay: true,
      card: true,
      cash: false,
      refunds: true,
      stripe: {
        enabled: false,
        onboarded: false,
        dashboardEnabled: false,
      },
    },
    fulfillment: {
      mode: 'staff',
      timeBasedScheduleMinutes: {
        inPrep: 5,
        ready: 10,
        completed: 15,
      },
    },
    storeCapabilities: {
      menu: {
        source: 'platform_managed',
      },
      operations: {
        fulfillmentMode: 'staff',
        liveOrderTrackingEnabled: true,
        dashboardEnabled: true,
      },
      loyalty: {
        visible: true,
      },
    },
  },
  storeConfig: {
    locationId: 'demo-location',
    hoursText: 'Daily · 7:00 AM - 6:00 PM',
    isOpen: true,
    nextOpenAt: null,
    prepEtaMinutes: 12,
    taxRateBasisPoints: 600,
    pickupInstructions: 'Pick up mobile orders at the counter near the espresso bar.',
  },
  menu: {
    locationId: 'demo-location',
    currency: 'USD',
    categories: [
      {
        id: 'coffee',
        title: 'Coffee & Espresso',
        items: [
          {
            id: 'latte',
            name: 'Latte',
            description: 'Espresso with steamed milk.',
            priceCents: 525,
            badgeCodes: ['popular'],
            visible: true,
          },
          {
            id: 'americano',
            name: 'Americano',
            description: 'Espresso lengthened with hot water.',
            priceCents: 375,
            badgeCodes: [],
            visible: true,
          },
        ],
      },
      {
        id: 'tea',
        title: 'Tea',
        items: [
          {
            id: 'mint-tea',
            name: 'Mint Tea',
            description: 'Fresh mint, hot water, light honey.',
            priceCents: 425,
            badgeCodes: [],
            visible: true,
          },
        ],
      },
    ],
  },
  homeCards: {
    locationId: 'demo-location',
    cards: [
      {
        cardId: 'seasonal-card',
        label: 'Seasonal',
        title: 'Spring espresso tonic',
        body: 'A bright rotating drink for the pilot menu.',
        note: 'Available this week',
        sortOrder: 0,
        visible: true,
      },
      {
        cardId: 'pickup-card',
        label: 'Pickup',
        title: 'Order ahead',
        body: 'Mobile pickup is ready at the counter.',
        sortOrder: 1,
        visible: true,
      },
    ],
  },
  build: {
    appName: 'Demo Coffee',
    bundleId: 'com.gazelle.demo.coffee',
    releaseChannel: 'preview',
    iconUrl: '',
    splashImageUrl: '',
  },
  publish: {
    status: 'draft',
    lastValidatedAt: null,
  },
}

export function formatConfig(config: MobileBuilderProject) {
  return JSON.stringify(config, null, 2)
}

import { Bell, Home, Menu, ReceiptText, UserRound } from 'lucide-react'
import type { AppTab, MobileBuilderProject } from '../lib/types'

type MobileAppPreviewProps = {
  config: MobileBuilderProject
}

const tabIcons: Record<AppTab, typeof Home> = {
  home: Home,
  menu: Menu,
  orders: ReceiptText,
  account: UserRound,
}

export function MobileAppPreview({ config }: MobileAppPreviewProps) {
  const { appConfig, homeCards, menu, storeConfig } = config
  const theme = appConfig.theme
  const visibleCards = homeCards.cards
    .filter((card) => card.visible)
    .sort((left, right) => left.sortOrder - right.sortOrder)
  const visibleCategories = menu.categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.visible),
    }))
    .filter((category) => category.items.length > 0)

  return (
    <div
      className="flex h-[690px] w-full max-w-[340px] flex-col overflow-hidden rounded-[30px] border-[10px] border-[#171513] shadow-2xl"
      style={{
        background: theme.background,
        color: theme.foreground,
        fontFamily: theme.fontFamily || 'system-ui',
      }}
    >
      <header
        className="px-5 pb-4 pt-7"
        style={{
          background: appConfig.header.background,
          color: appConfig.header.foreground ?? theme.foreground,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-65">
              {appConfig.brand.marketLabel}
            </p>
            <h3
              className="mt-1 text-2xl font-semibold leading-tight"
              style={{ fontFamily: theme.displayFontFamily || theme.fontFamily }}
            >
              {appConfig.brand.brandName}
            </h3>
            <p className="mt-1 text-sm opacity-70">{appConfig.brand.locationName}</p>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: theme.surface }}
          >
            <Bell className="h-4 w-4" />
          </div>
        </div>
        <div
          className="mt-5 rounded-xl px-4 py-3 text-sm"
          style={{ background: theme.surface, color: theme.foreground }}
        >
          <div className="flex items-center justify-between">
            <span>{storeConfig.isOpen ? 'Open now' : 'Closed'}</span>
            <span>{storeConfig.prepEtaMinutes} min pickup</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: theme.foregroundMuted }}>
            {storeConfig.hoursText}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {visibleCards[0] && (
          <section
            className="rounded-xl p-4"
            style={{ background: theme.primary, color: theme.background }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {visibleCards[0].label}
            </p>
            <h4 className="mt-2 text-lg font-semibold">{visibleCards[0].title}</h4>
            <p className="mt-1 text-sm opacity-80">{visibleCards[0].body}</p>
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.foregroundMuted }}>
              Menu
            </p>
            <span className="text-xs" style={{ color: theme.foregroundMuted }}>
              {appConfig.storeCapabilities.menu.source === 'platform_managed'
                ? 'Managed'
                : 'External'}
            </span>
          </div>
          <div className="space-y-3">
            {visibleCategories.map((category) => (
              <div
                className="rounded-xl p-3"
                key={category.id}
                style={{ background: theme.surface }}
              >
                <p className="text-sm font-semibold">{category.title}</p>
                <div className="mt-3 space-y-2">
                  {category.items.slice(0, 2).map((item) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                      key={item.id}
                      style={{ background: theme.surfaceMuted }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="truncate text-xs" style={{ color: theme.foregroundMuted }}>
                          {item.description}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        ${(item.priceCents / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-xl p-4 text-sm"
          style={{ background: theme.surface }}
        >
          <p className="font-semibold">Enabled experience</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Capability enabled={appConfig.featureFlags.loyalty} label="Loyalty" />
            <Capability enabled={appConfig.featureFlags.orderTracking} label="Tracking" />
            <Capability enabled={appConfig.paymentCapabilities.applePay} label="Apple Pay" />
            <Capability enabled={appConfig.featureFlags.staffDashboard} label="Staff dash" />
          </div>
        </section>
      </div>

      <nav className="grid border-t text-center text-[11px]" style={{ gridTemplateColumns: `repeat(${appConfig.enabledTabs.length}, minmax(0, 1fr))`, borderColor: theme.border, background: theme.surface }}>
        {appConfig.enabledTabs.map((tab) => {
          const Icon = tabIcons[tab]
          return (
            <span className="flex flex-col items-center gap-1 px-1 py-3 capitalize" key={tab}>
              <Icon className="h-4 w-4" />
              {tab}
            </span>
          )
        })}
      </nav>
    </div>
  )
}

function Capability({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span className={`rounded-full px-2 py-1 font-medium ${enabled ? 'bg-[#DDEBDD] text-[#22543D]' : 'bg-[#EFE7E7] text-[#8A3838]'}`}>
      {label}
    </span>
  )
}

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, ChevronRight, Coffee, Home, Minus, Plus, ReceiptText, UserRound } from 'lucide-react'
import type { AppTab, MenuItem, MobileBuilderProject } from '../lib/types'

type MobileRuntimeProps = {
  config: MobileBuilderProject
}

type RuntimeCartItem = {
  id: string
  name: string
  priceCents: number
  quantity: number
}

const tabIcons: Record<AppTab, typeof Home> = {
  home: Home,
  menu: Coffee,
  orders: ReceiptText,
  account: UserRound,
}

const fallbackPalette = {
  background: '#F7F4ED',
  backgroundAlt: '#F0ECE4',
  surfaceStrong: '#FFFDF8',
  surfaceMuted: '#F3EFE7',
  card: '#FFFDF8',
  text: '#171513',
  textSecondary: '#605B55',
  textMuted: '#9B9389',
  border: 'rgba(23, 21, 19, 0.08)',
  borderStrong: 'rgba(23, 21, 19, 0.14)',
  primary: '#1E1B18',
  primaryText: '#FFFFFF',
  accent: '#2D2823',
  success: '#4F7A63',
  warning: '#A46C2C',
}

export function MobileRuntime({ config }: MobileRuntimeProps) {
  const [activeTab, setActiveTab] = useState<AppTab>(
    config.appConfig.enabledTabs[0] ?? 'home',
  )
  const [cartItems, setCartItems] = useState<RuntimeCartItem[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)

  const palette = getRuntimePalette(config)
  const currentTab = config.appConfig.enabledTabs.includes(activeTab)
    ? activeTab
    : (config.appConfig.enabledTabs[0] ?? 'home')
  const visibleMenu = useMemo(
    () =>
      config.menu.categories
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => item.visible),
        }))
        .filter((category) => category.items.length > 0),
    [config.menu.categories],
  )
  const visibleCards = useMemo(
    () =>
      config.homeCards.cards
        .filter((card) => card.visible)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [config.homeCards.cards],
  )

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const subtotalCents = cartItems.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  )
  const taxCents = Math.round(
    subtotalCents * (config.storeConfig.taxRateBasisPoints / 10000),
  )
  const totalCents = subtotalCents + taxCents

  function addItem(item: MenuItem) {
    setOrderPlaced(false)
    setCartItems((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id)

      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: 1,
        },
      ]
    })
  }

  function removeItem(itemId: string) {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const screen =
    currentTab === 'menu' ? (
      <MenuScreen
        addItem={addItem}
        cartCount={cartCount}
        categories={visibleMenu}
        config={config}
        goToOrders={() => setActiveTab('orders')}
        palette={palette}
      />
    ) : currentTab === 'orders' ? (
      <OrdersScreen
        cartItems={cartItems}
        config={config}
        orderPlaced={orderPlaced}
        palette={palette}
        removeItem={removeItem}
        setOrderPlaced={setOrderPlaced}
        subtotalCents={subtotalCents}
        taxCents={taxCents}
        totalCents={totalCents}
      />
    ) : currentTab === 'account' ? (
      <AccountScreen config={config} palette={palette} />
    ) : (
      <HomeScreen
        cards={visibleCards}
        categories={visibleMenu}
        config={config}
        goToMenu={() => setActiveTab('menu')}
        palette={palette}
      />
    )

  return (
    <div
      className="relative h-[710px] w-full max-w-[350px] overflow-hidden rounded-[34px] border-[10px] border-[#171513] shadow-2xl"
      style={{
        background: palette.background,
        color: palette.text,
        fontFamily: config.appConfig.theme.fontFamily || 'system-ui',
      }}
    >
      <div
        className="absolute left-1/2 top-0 z-40 h-5 w-32 -translate-x-1/2 rounded-b-2xl bg-[#171513]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 overflow-y-auto pb-28">{screen}</div>
      <TabBarDepth palette={palette} />
      <RuntimeTabs
        activeTab={currentTab}
        cartCount={cartCount}
        config={config}
        palette={palette}
        setActiveTab={setActiveTab}
      />
    </div>
  )
}

function HomeScreen({
  cards,
  categories,
  config,
  goToMenu,
  palette,
}: {
  cards: MobileBuilderProject['homeCards']['cards']
  categories: MobileBuilderProject['menu']['categories']
  config: MobileBuilderProject
  goToMenu: () => void
  palette: ReturnType<typeof getRuntimePalette>
}) {
  return (
    <ScreenShell palette={palette}>
      <div
        className="sticky top-0 z-20 px-5 pb-4 pt-10"
        style={{
          background: config.appConfig.header.background || palette.background,
          color: config.appConfig.header.foreground ?? palette.text,
        }}
      >
        <h2 className="font-serif text-[40px] font-semibold leading-[46px]">
          {config.appConfig.brand.brandName}
        </h2>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="min-w-0 truncate font-serif text-[19px] font-semibold uppercase leading-[25px] tracking-[1.9px]">
            {config.appConfig.brand.locationName}
          </p>
          <button
            className="flex h-7 items-center gap-1 text-sm font-semibold"
            type="button"
            onClick={goToMenu}
          >
            Menu
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 px-5 pt-3">
        {cards.map((card) => (
          <GlassCard key={card.cardId} palette={palette}>
            <div className="flex min-h-[142px] flex-col justify-between gap-4">
              <div>
                <GlassTag label={card.label} palette={palette} />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold leading-7">
                  {card.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[22px]" style={{ color: palette.textSecondary }}>
                  {card.body}
                </p>
              </div>
              {card.note && (
                <p className="text-[13px] font-medium leading-[18px]" style={{ color: palette.textMuted }}>
                  {card.note}
                </p>
              )}
            </div>
          </GlassCard>
        ))}

        <section className="pt-2">
          <SectionHeader label="Featured" palette={palette} />
          <div className="border-t" style={{ borderColor: palette.border }}>
            {categories
              .flatMap((category) => category.items)
              .slice(0, 2)
              .map((item, index, items) => (
                <MenuRow
                  key={item.id}
                  isLast={index === items.length - 1}
                  item={item}
                  onAdd={() => undefined}
                  palette={palette}
                  showAdd={false}
                />
              ))}
          </div>
        </section>
      </div>
    </ScreenShell>
  )
}

function MenuScreen({
  addItem,
  cartCount,
  categories,
  config,
  goToOrders,
  palette,
}: {
  addItem: (item: MenuItem) => void
  cartCount: number
  categories: MobileBuilderProject['menu']['categories']
  config: MobileBuilderProject
  goToOrders: () => void
  palette: ReturnType<typeof getRuntimePalette>
}) {
  const sections = [
    {
      id: 'featured',
      title: 'Featured',
      items: categories.flatMap((category) => category.items).slice(0, 4),
    },
    ...categories.map((category) => ({
      id: category.id,
      title: category.title,
      items: category.items,
    })),
  ]

  return (
    <ScreenShell palette={palette}>
      <FloatingPageHeader
        background={config.appConfig.header.background}
        foreground={config.appConfig.header.foreground ?? palette.text}
        title={config.appConfig.brand.locationName}
        eyebrow={`Estimated pick-up is ${config.storeConfig.prepEtaMinutes} min`}
      >
        <p className="font-serif text-[28px] font-semibold leading-8">Menu</p>
      </FloatingPageHeader>

      <div className="space-y-0 px-5 pt-[156px]">
        {sections.map((section) => (
          <section key={section.id} className="pt-3">
            <button className="w-full" type="button">
              <div className="flex items-center justify-between pb-2">
                <SectionHeader label={section.title} palette={palette} />
                <ChevronDown className="h-4 w-4" style={{ color: palette.textMuted }} />
              </div>
            </button>
            <div className="border-t" style={{ borderColor: palette.border }}>
              {section.items.map((item, index) => (
                <MenuRow
                  key={`${section.id}-${item.id}`}
                  isLast={index === section.items.length - 1}
                  item={item}
                  onAdd={() => addItem(item)}
                  palette={palette}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {cartCount > 0 && (
        <button
          className="sticky bottom-2 mx-5 mt-4 flex h-12 items-center justify-between rounded-full px-5 text-sm font-semibold shadow-xl"
          style={{ background: palette.primary, color: palette.primaryText }}
          type="button"
          onClick={goToOrders}
        >
          <span>{cartCount} item{cartCount === 1 ? '' : 's'} in bag</span>
          <span>Review order</span>
        </button>
      )}
    </ScreenShell>
  )
}

function OrdersScreen({
  cartItems,
  config,
  orderPlaced,
  palette,
  removeItem,
  setOrderPlaced,
  subtotalCents,
  taxCents,
  totalCents,
}: {
  cartItems: RuntimeCartItem[]
  config: MobileBuilderProject
  orderPlaced: boolean
  palette: ReturnType<typeof getRuntimePalette>
  removeItem: (itemId: string) => void
  setOrderPlaced: (value: boolean) => void
  subtotalCents: number
  taxCents: number
  totalCents: number
}) {
  const title = orderPlaced ? 'Track your order' : 'Past Orders'

  return (
    <ScreenShell palette={palette}>
      <CompactHeader
        background={config.appConfig.header.background}
        foreground={config.appConfig.header.foreground ?? palette.text}
        title={title}
      />
      <div className="space-y-7 px-5 pt-[88px]">
        {orderPlaced && (
          <GlassCard palette={palette}>
            <div className="flex items-center justify-between">
              <StatusPill label="Received" palette={palette} />
              <p className="font-serif text-sm uppercase tracking-[1.4px]">
                {money(totalCents)}
              </p>
            </div>
            <h3 className="mt-5 font-serif text-[28px] font-bold leading-8">
              We have your order.
            </h3>
            <p className="mt-3 text-[15px] leading-6" style={{ color: palette.textSecondary }}>
              {config.appConfig.featureFlags.orderTracking
                ? 'Follow your pickup progress from here.'
                : 'Tracking is hidden for this app configuration.'}
            </p>
            <div className="mt-5 border-t pt-4" style={{ borderColor: palette.border }}>
              <p className="text-[11px] font-bold uppercase tracking-[1.1px]" style={{ color: palette.textMuted }}>
                Pickup code
              </p>
              <p className="mt-2 font-serif text-[34px] font-bold leading-10 tracking-[1.2px]">
                NMLY
              </p>
            </div>
          </GlassCard>
        )}

        <section>
          <div className="border-b pb-3" style={{ borderColor: palette.border }}>
            <SectionHeader
              action={cartItems.length > 0 ? `${cartItems.length} active` : undefined}
              label="Recent orders"
              palette={palette}
            />
          </div>

          {cartItems.length === 0 && !orderPlaced ? (
            <p className="mt-4 text-[15px] leading-[22px]" style={{ color: palette.textSecondary }}>
              Completed pickups and older orders will collect here.
            </p>
          ) : null}

          {cartItems.length > 0 && (
            <div className="mt-3 space-y-3">
              {cartItems.map((item) => (
                <div className="flex items-center justify-between gap-3 py-2" key={item.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold uppercase tracking-[1.2px]">
                      {item.name}
                    </p>
                    <p className="text-xs" style={{ color: palette.textSecondary }}>
                      Qty {item.quantity} · {money(item.priceCents)}
                    </p>
                  </div>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: palette.surfaceMuted }}
                    type="button"
                    onClick={() => removeItem(item.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {cartItems.length > 0 && (
          <GlassCard palette={palette}>
            <SectionHeader label="Checkout" palette={palette} />
            <div className="mt-4 space-y-2">
              <PriceRow label="Subtotal" value={subtotalCents} />
              <PriceRow label="Estimated tax" value={taxCents} />
              <div className="border-t pt-3" style={{ borderColor: palette.border }}>
                <PriceRow label="Total" strong value={totalCents} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Chip enabled={config.appConfig.paymentCapabilities.applePay} label="Apple Pay" />
              <Chip enabled={config.appConfig.paymentCapabilities.card} label="Card" />
              <Chip enabled={config.appConfig.paymentCapabilities.cash} label="Cash" />
              <Chip enabled={config.appConfig.paymentCapabilities.refunds} label="Refunds" />
            </div>
            <button
              className="mt-5 h-12 w-full rounded-full text-sm font-semibold"
              style={{ background: palette.primary, color: palette.primaryText }}
              type="button"
              onClick={() => setOrderPlaced(true)}
            >
              Place preview order
            </button>
          </GlassCard>
        )}
      </div>
    </ScreenShell>
  )
}

function AccountScreen({
  config,
  palette,
}: {
  config: MobileBuilderProject
  palette: ReturnType<typeof getRuntimePalette>
}) {
  const greeting = config.client.ownerName.trim() || 'Welcome back'

  return (
    <ScreenShell palette={palette}>
      <CompactHeader
        background={config.appConfig.header.background}
        foreground={config.appConfig.header.foreground ?? palette.text}
        title="Account"
      />
      <div className="space-y-7 px-5 pt-[106px]">
        <GlassCard palette={palette}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <SectionLabel label="Account" palette={palette} />
              <h3 className="mt-3 font-serif text-[30px] font-bold leading-[34px]">
                {greeting}
              </h3>
            </div>
            <Chip enabled={config.appConfig.loyaltyEnabled} label={config.appConfig.loyaltyEnabled ? 'Loyalty On' : 'Loyalty Off'} />
          </div>

          <div className="mt-6 border-t pt-5" style={{ borderColor: palette.border }}>
            <p className="text-[11px] font-bold uppercase tracking-[1.1px]" style={{ color: palette.textMuted }}>
              Available points
            </p>
            <p className="mt-3 font-serif text-[46px] font-bold leading-[50px]">
              {config.appConfig.loyaltyEnabled ? '420' : 'Off'}
            </p>
            <p className="mt-2 text-[13px] leading-[18px]" style={{ color: palette.textSecondary }}>
              {config.appConfig.loyaltyEnabled
                ? 'Lifetime 1,240 pts'
                : 'Loyalty unavailable'}
            </p>
          </div>
        </GlassCard>

        <section>
          <SectionLabel label="Account" palette={palette} />
          <div className="mt-3 border-t" style={{ borderColor: palette.border }}>
            <AccountRow label="Rewards activity" />
            <AccountRow label="Profile" />
            <AccountRow label="Settings" isLast />
          </div>
        </section>

        <div className="text-[12px] leading-5" style={{ color: palette.textSecondary }}>
          {config.build.appName} · {config.build.bundleId}
        </div>
      </div>
    </ScreenShell>
  )
}

function ScreenShell({
  children,
  palette,
}: {
  children: ReactNode
  palette: ReturnType<typeof getRuntimePalette>
}) {
  return (
    <div className="min-h-full" style={{ background: palette.background }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-44"
        style={{ background: 'rgba(255,255,255,0.20)' }}
      />
      {children}
    </div>
  )
}

function FloatingPageHeader({
  background,
  children,
  eyebrow,
  foreground,
  title,
}: {
  background: string
  children: ReactNode
  eyebrow: string
  foreground: string
  title: string
}) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-20 px-5 pb-4 pt-10"
      style={{ background, color: foreground }}
    >
      <p className="text-[13px] leading-[18px]">{eyebrow}</p>
      <p className="mt-1 font-serif text-[19px] font-semibold uppercase leading-6 tracking-[2px]">
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function CompactHeader({
  background,
  foreground,
  title,
}: {
  background: string
  foreground: string
  title: string
}) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-20 px-5 pb-3 pt-12"
      style={{ background, color: foreground }}
    >
      <p className="font-serif text-[17px] font-semibold uppercase leading-[18px] tracking-[1.2px]">
        {title}
      </p>
    </div>
  )
}

function MenuRow({
  isLast,
  item,
  onAdd,
  palette,
  showAdd = true,
}: {
  isLast: boolean
  item: MenuItem
  onAdd: () => void
  palette: ReturnType<typeof getRuntimePalette>
  showAdd?: boolean
}) {
  return (
    <article className="min-h-[132px]">
      <div className="flex w-full items-start gap-4">
        <div
          className="flex h-[132px] w-[108px] flex-none items-center justify-center overflow-hidden"
          style={{ background: '#D5D4CE' }}
        >
          {item.imageUrl ? (
            <img alt="" className="h-full w-full object-cover" src={item.imageUrl} />
          ) : (
            <Coffee className="h-6 w-6" style={{ color: palette.accent }} />
          )}
        </div>
        <div
          className={`flex min-h-[132px] min-w-0 flex-1 items-center py-2 ${
            isLast ? '' : 'border-b'
          }`}
          style={{ borderColor: palette.border }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="min-w-0 flex-1 truncate text-base font-medium uppercase leading-5 tracking-[1.3px]">
                {item.name}
              </h3>
              <p className="font-serif text-sm uppercase leading-5 tracking-[1.4px]">
                {money(item.priceCents)}
              </p>
            </div>
            <p className="mt-1 line-clamp-3 text-xs leading-[14px]" style={{ color: palette.textSecondary }}>
              {item.description}
            </p>
            {showAdd && (
              <button
                className="mt-3 inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold"
                style={{ background: palette.primary, color: palette.primaryText }}
                type="button"
                onClick={onAdd}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function RuntimeTabs({
  activeTab,
  cartCount,
  config,
  palette,
  setActiveTab,
}: {
  activeTab: AppTab
  cartCount: number
  config: MobileBuilderProject
  palette: ReturnType<typeof getRuntimePalette>
  setActiveTab: (tab: AppTab) => void
}) {
  const enabledTabs = config.appConfig.enabledTabs

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div
        className="pointer-events-auto relative h-[68px] w-full max-w-[314px] overflow-hidden rounded-full border p-[3px] shadow-2xl backdrop-blur-xl"
        style={{
          background: 'rgba(255, 253, 248, 0.72)',
          borderColor: 'rgba(255,255,255,0.42)',
        }}
      >
        <div
          className="absolute bottom-1 top-1 rounded-full transition-transform"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            left: 3,
            width: `calc((100% - 6px) / ${enabledTabs.length})`,
            transform: `translateX(${Math.max(enabledTabs.indexOf(activeTab), 0) * 100}%)`,
          }}
        />
        <div
          className="relative grid h-full"
          style={{ gridTemplateColumns: `repeat(${enabledTabs.length}, minmax(0, 1fr))` }}
        >
          {enabledTabs.map((tab) => {
            const Icon = tabIcons[tab]
            const active = activeTab === tab
            return (
              <button
                className="relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold capitalize"
                key={tab}
                style={{
                  color: active ? 'rgba(18,18,18,0.96)' : 'rgba(60,60,67,0.72)',
                }}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                <Icon className={tab === 'menu' ? 'h-6 w-6' : 'h-5 w-5'} />
                {tab}
                {tab === 'orders' && cartCount > 0 && (
                  <span
                    className="absolute right-4 top-2 h-2 w-2 rounded-full"
                    style={{ background: palette.accent }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TabBarDepth({ palette }: { palette: ReturnType<typeof getRuntimePalette> }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
      style={{
        background:
          'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.008) 45%, rgba(0,0,0,0.03) 70%, rgba(0,0,0,0.065))',
        mixBlendMode: palette.background === '#000000' ? 'normal' : 'multiply',
      }}
    />
  )
}

function GlassCard({
  children,
  palette,
}: {
  children: ReactNode
  palette: ReturnType<typeof getRuntimePalette>
}) {
  return (
    <div
      className="rounded-[32px] border p-5 shadow-sm backdrop-blur-xl"
      style={{
        background: 'rgba(255, 253, 248, 0.78)',
        borderColor: 'rgba(255,255,255,0.42)',
        color: palette.text,
      }}
    >
      {children}
    </div>
  )
}

function GlassTag({
  label,
  palette,
}: {
  label: string
  palette: ReturnType<typeof getRuntimePalette>
}) {
  return (
    <span
      className="inline-flex rounded-full border px-3 py-2 text-[11px] font-bold leading-[13px] tracking-[1.1px]"
      style={{
        background: 'rgba(255,255,255,0.36)',
        borderColor: 'rgba(255,255,255,0.28)',
        color: palette.textSecondary,
      }}
    >
      {label}
    </span>
  )
}

function SectionHeader({
  action,
  label,
  palette,
}: {
  action?: string
  label: string
  palette: ReturnType<typeof getRuntimePalette>
}) {
  return (
    <div className="flex flex-1 items-center justify-between gap-3">
      <SectionLabel label={label} palette={palette} />
      {action && <span className="text-xs leading-[18px]" style={{ color: palette.textMuted }}>{action}</span>}
    </div>
  )
}

function SectionLabel({
  label,
  palette,
}: {
  label: string
  palette: ReturnType<typeof getRuntimePalette>
}) {
  return (
    <p className="text-[11px] font-bold uppercase leading-[14px] tracking-[1.1px]" style={{ color: palette.textMuted }}>
      {label}
    </p>
  )
}

function StatusPill({
  label,
  palette,
}: {
  label: string
  palette: ReturnType<typeof getRuntimePalette>
}) {
  return (
    <span
      className="rounded-full border px-3 py-2 text-[11px] font-bold uppercase leading-[14px] tracking-[1px]"
      style={{
        background: 'rgba(255,255,255,0.40)',
        borderColor: palette.border,
        color: palette.text,
      }}
    >
      {label}
    </span>
  )
}

function Chip({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span
      className={`rounded-full border px-3 py-2 text-center text-xs font-bold ${
        enabled ? 'bg-[#FFFDF8] text-[#171513]' : 'bg-[#F3EFE7] text-[#9B9389]'
      }`}
    >
      {label}
    </span>
  )
}

function PriceRow({
  label,
  strong,
  value,
}: {
  label: string
  strong?: boolean
  value: number
}) {
  return (
    <div className={`flex items-center justify-between text-sm ${strong ? 'font-bold' : ''}`}>
      <span>{label}</span>
      <span>{money(value)}</span>
    </div>
  )
}

function AccountRow({ isLast = false, label }: { isLast?: boolean; label: string }) {
  return (
    <button
      className={`flex h-14 w-full items-center justify-between text-left text-[15px] ${
        isLast ? '' : 'border-b'
      }`}
      style={{ borderColor: fallbackPalette.border }}
      type="button"
    >
      <span>{label}</span>
      <ChevronRight className="h-4 w-4 opacity-50" />
    </button>
  )
}

function getRuntimePalette(config: MobileBuilderProject) {
  const theme = config.appConfig.theme

  return {
    ...fallbackPalette,
    background: theme.background || fallbackPalette.background,
    backgroundAlt: theme.backgroundAlt || fallbackPalette.backgroundAlt,
    surfaceStrong: theme.surface || fallbackPalette.surfaceStrong,
    surfaceMuted: theme.surfaceMuted || fallbackPalette.surfaceMuted,
    card: theme.surface || fallbackPalette.card,
    text: theme.foreground || fallbackPalette.text,
    textSecondary: theme.foregroundMuted || fallbackPalette.textSecondary,
    textMuted: theme.muted || fallbackPalette.textMuted,
    border: theme.border || fallbackPalette.border,
    primary: theme.primary || fallbackPalette.primary,
    accent: theme.accent || fallbackPalette.accent,
  }
}

function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100)
}

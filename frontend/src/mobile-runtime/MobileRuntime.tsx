import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Coffee,
  CreditCard,
  Home,
  Menu,
  Minus,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
} from 'lucide-react'
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
  menu: Menu,
  orders: ReceiptText,
  account: UserRound,
}

export function MobileRuntime({ config }: MobileRuntimeProps) {
  const [activeTab, setActiveTab] = useState<AppTab>(
    config.appConfig.enabledTabs[0] ?? 'home',
  )
  const [cartItems, setCartItems] = useState<RuntimeCartItem[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)

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
  const currentTab = config.appConfig.enabledTabs.includes(activeTab)
    ? activeTab
    : (config.appConfig.enabledTabs[0] ?? 'home')

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
        categories={visibleMenu}
        cartCount={cartCount}
        config={config}
        goToOrders={() => setActiveTab('orders')}
      />
    ) : currentTab === 'orders' ? (
      <OrdersScreen
        cartItems={cartItems}
        config={config}
        orderPlaced={orderPlaced}
        removeItem={removeItem}
        setOrderPlaced={setOrderPlaced}
        subtotalCents={subtotalCents}
        taxCents={taxCents}
        totalCents={totalCents}
      />
    ) : currentTab === 'account' ? (
      <AccountScreen config={config} />
    ) : (
      <HomeScreen
        cards={visibleCards}
        categories={visibleMenu}
        config={config}
        goToMenu={() => setActiveTab('menu')}
      />
    )

  return (
    <div
      className="flex h-[710px] w-full max-w-[350px] flex-col overflow-hidden rounded-[34px] border-[10px] border-[#171513] shadow-2xl"
      style={{
        background: config.appConfig.theme.background,
        color: config.appConfig.theme.foreground,
        fontFamily: config.appConfig.theme.fontFamily || 'system-ui',
      }}
    >
      <StatusBar config={config} />
      <RuntimeHeader activeTab={currentTab} cartCount={cartCount} config={config} />
      <div className="min-h-0 flex-1 overflow-y-auto">{screen}</div>
      <RuntimeTabs
        activeTab={currentTab}
        cartCount={cartCount}
        config={config}
        setActiveTab={setActiveTab}
      />
    </div>
  )
}

function StatusBar({ config }: { config: MobileBuilderProject }) {
  return (
    <div
      className="flex h-7 items-center justify-between px-6 text-[11px] font-semibold"
      style={{
        background: config.appConfig.header.background,
        color: config.appConfig.header.foreground ?? config.appConfig.theme.foreground,
      }}
    >
      <span>9:41</span>
      <span className="tracking-wide">LTE 100%</span>
    </div>
  )
}

function RuntimeHeader({
  activeTab,
  cartCount,
  config,
}: {
  activeTab: AppTab
  cartCount: number
  config: MobileBuilderProject
}) {
  const theme = config.appConfig.theme
  const title =
    activeTab === 'menu'
      ? 'Menu'
      : activeTab === 'orders'
        ? 'Orders'
        : activeTab === 'account'
          ? 'Account'
          : config.appConfig.brand.brandName

  return (
    <header
      className="px-5 pb-4 pt-2"
      style={{
        background: config.appConfig.header.background,
        color: config.appConfig.header.foreground ?? theme.foreground,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wide opacity-60">
            {config.appConfig.brand.marketLabel}
          </p>
          <h2
            className="mt-1 truncate text-2xl font-semibold leading-tight"
            style={{ fontFamily: theme.displayFontFamily || theme.fontFamily }}
          >
            {title}
          </h2>
          <p className="mt-1 truncate text-sm opacity-70">
            {config.appConfig.brand.locationName}
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton config={config} label="Notifications">
            <Bell className="h-4 w-4" />
          </IconButton>
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: theme.surface }}
            title="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                style={{ background: theme.accent, color: theme.background }}
              >
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function HomeScreen({
  cards,
  categories,
  config,
  goToMenu,
}: {
  cards: MobileBuilderProject['homeCards']['cards']
  categories: MobileBuilderProject['menu']['categories']
  config: MobileBuilderProject
  goToMenu: () => void
}) {
  const theme = config.appConfig.theme

  return (
    <div className="space-y-4 px-4 pb-5">
      <StoreStatus config={config} />

      {cards[0] && (
        <section
          className="rounded-2xl p-4"
          style={{ background: theme.primary, color: theme.background }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            {cards[0].label}
          </p>
          <h3 className="mt-2 text-xl font-semibold leading-tight">
            {cards[0].title}
          </h3>
          <p className="mt-2 text-sm opacity-85">{cards[0].body}</p>
          <button
            className="mt-4 h-10 rounded-full px-4 text-sm font-semibold"
            style={{ background: theme.background, color: theme.foreground }}
            type="button"
            onClick={goToMenu}
          >
            Start order
          </button>
        </section>
      )}

      <section>
        <SectionHeader action="View all" title="Featured menu" />
        <div className="mt-3 space-y-2">
          {categories.slice(0, 2).map((category) => (
            <div
              className="rounded-2xl p-3"
              key={category.id}
              style={{ background: theme.surface }}
            >
              <p className="text-sm font-semibold">{category.title}</p>
              <p className="mt-1 text-xs" style={{ color: theme.foregroundMuted }}>
                {category.items
                  .slice(0, 3)
                  .map((item) => item.name)
                  .join(', ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Experience" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Capability enabled={config.appConfig.featureFlags.loyalty} label="Loyalty" />
          <Capability enabled={config.appConfig.featureFlags.orderTracking} label="Tracking" />
          <Capability enabled={config.appConfig.paymentCapabilities.applePay} label="Apple Pay" />
          <Capability enabled={config.appConfig.featureFlags.pushNotifications} label="Push alerts" />
        </div>
      </section>
    </div>
  )
}

function MenuScreen({
  addItem,
  cartCount,
  categories,
  config,
  goToOrders,
}: {
  addItem: (item: MenuItem) => void
  cartCount: number
  categories: MobileBuilderProject['menu']['categories']
  config: MobileBuilderProject
  goToOrders: () => void
}) {
  const theme = config.appConfig.theme

  return (
    <div className="space-y-4 px-4 pb-5">
      <div
        className="flex h-11 items-center gap-2 rounded-full px-4 text-sm"
        style={{ background: theme.surface, color: theme.foregroundMuted }}
      >
        <Search className="h-4 w-4" />
        Search menu
      </div>

      {categories.map((category) => (
        <section key={category.id}>
          <SectionHeader title={category.title} />
          <div className="mt-3 space-y-3">
            {category.items.map((item) => (
              <article
                className="rounded-2xl p-3"
                key={item.id}
                style={{ background: theme.surface }}
              >
                <div className="flex gap-3">
                  <div
                    className="flex h-16 w-16 flex-none items-center justify-center rounded-xl"
                    style={{ background: theme.surfaceMuted }}
                  >
                    <Coffee className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                        <p
                          className="mt-1 line-clamp-2 text-xs"
                          style={{ color: theme.foregroundMuted }}
                        >
                          {item.description}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {money(item.priceCents)}
                      </span>
                    </div>
                    <button
                      className="mt-3 inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold"
                      style={{ background: theme.primary, color: theme.background }}
                      type="button"
                      onClick={() => addItem(item)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {cartCount > 0 && (
        <button
          className="sticky bottom-3 flex h-12 w-full items-center justify-between rounded-full px-5 text-sm font-semibold shadow-lg"
          style={{ background: theme.accent, color: theme.background }}
          type="button"
          onClick={goToOrders}
        >
          <span>{cartCount} item{cartCount === 1 ? '' : 's'} in bag</span>
          <span>Review order</span>
        </button>
      )}
    </div>
  )
}

function OrdersScreen({
  cartItems,
  config,
  orderPlaced,
  removeItem,
  setOrderPlaced,
  subtotalCents,
  taxCents,
  totalCents,
}: {
  cartItems: RuntimeCartItem[]
  config: MobileBuilderProject
  orderPlaced: boolean
  removeItem: (itemId: string) => void
  setOrderPlaced: (value: boolean) => void
  subtotalCents: number
  taxCents: number
  totalCents: number
}) {
  const theme = config.appConfig.theme

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <EmptyState
        config={config}
        icon={<ShoppingBag className="h-8 w-8" />}
        title="No active order"
        body="Add menu items to test the mobile ordering flow inside the simulator."
      />
    )
  }

  return (
    <div className="space-y-4 px-4 pb-5">
      {orderPlaced && (
        <section
          className="rounded-2xl p-4"
          style={{ background: theme.surface }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-7 w-7" style={{ color: theme.accent }} />
            <div>
              <h3 className="text-sm font-semibold">Preview order placed</h3>
              <p className="text-xs" style={{ color: theme.foregroundMuted }}>
                {config.appConfig.featureFlags.orderTracking
                  ? 'Tracking states are visible for this app.'
                  : 'Order tracking is hidden by config.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {cartItems.length > 0 && (
        <section
          className="rounded-2xl p-4"
          style={{ background: theme.surface }}
        >
          <SectionHeader title="Bag" />
          <div className="mt-3 space-y-3">
            {cartItems.map((item) => (
              <div className="flex items-center justify-between gap-3" key={item.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs" style={{ color: theme.foregroundMuted }}>
                    Qty {item.quantity} · {money(item.priceCents)}
                  </p>
                </div>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: theme.surfaceMuted }}
                  type="button"
                  onClick={() => removeItem(item.id)}
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section
        className="rounded-2xl p-4"
        style={{ background: theme.surface }}
      >
        <SectionHeader title="Checkout" />
        <PriceRow label="Subtotal" value={subtotalCents} />
        <PriceRow label="Estimated tax" value={taxCents} />
        <div className="mt-3 border-t pt-3" style={{ borderColor: theme.border }}>
          <PriceRow label="Total" strong value={totalCents} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <PaymentChip enabled={config.appConfig.paymentCapabilities.applePay} label="Apple Pay" />
          <PaymentChip enabled={config.appConfig.paymentCapabilities.card} label="Card" />
          <PaymentChip enabled={config.appConfig.paymentCapabilities.cash} label="Cash" />
          <PaymentChip enabled={config.appConfig.paymentCapabilities.refunds} label="Refunds" />
        </div>
        <button
          className="mt-4 h-11 w-full rounded-full text-sm font-semibold"
          disabled={cartItems.length === 0}
          style={{ background: theme.primary, color: theme.background }}
          type="button"
          onClick={() => setOrderPlaced(true)}
        >
          Place preview order
        </button>
      </section>
    </div>
  )
}

function AccountScreen({ config }: { config: MobileBuilderProject }) {
  const theme = config.appConfig.theme

  return (
    <div className="space-y-4 px-4 pb-5">
      <section
        className="rounded-2xl p-4"
        style={{ background: theme.surface }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold"
            style={{ background: theme.primary, color: theme.background }}
          >
            {config.client.ownerName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{config.client.ownerName}</h3>
            <p className="truncate text-xs" style={{ color: theme.foregroundMuted }}>
              {config.client.ownerEmail}
            </p>
          </div>
        </div>
      </section>

      {config.appConfig.loyaltyEnabled && (
        <section
          className="rounded-2xl p-4"
          style={{ background: theme.primary, color: theme.background }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                Loyalty
              </p>
              <h3 className="mt-1 text-2xl font-semibold">420 points</h3>
            </div>
            <Sparkles className="h-7 w-7" />
          </div>
        </section>
      )}

      <section
        className="overflow-hidden rounded-2xl"
        style={{ background: theme.surface }}
      >
        <AccountRow icon={<CreditCard className="h-4 w-4" />} label="Payment methods" />
        <AccountRow icon={<ReceiptText className="h-4 w-4" />} label="Order history" />
        <AccountRow icon={<Bell className="h-4 w-4" />} label="Notifications" />
      </section>

      <section className="rounded-2xl p-4 text-xs" style={{ background: theme.surface }}>
        <p className="font-semibold">Build profile</p>
        <p className="mt-2" style={{ color: theme.foregroundMuted }}>
          {config.build.appName} · {config.build.bundleId}
        </p>
      </section>
    </div>
  )
}

function RuntimeTabs({
  activeTab,
  cartCount,
  config,
  setActiveTab,
}: {
  activeTab: AppTab
  cartCount: number
  config: MobileBuilderProject
  setActiveTab: (tab: AppTab) => void
}) {
  const theme = config.appConfig.theme

  return (
    <nav
      className="grid border-t text-center text-[11px]"
      style={{
        gridTemplateColumns: `repeat(${config.appConfig.enabledTabs.length}, minmax(0, 1fr))`,
        borderColor: theme.border,
        background: theme.surface,
      }}
    >
      {config.appConfig.enabledTabs.map((tab) => {
        const Icon = tabIcons[tab]
        const active = activeTab === tab
        return (
          <button
            className="relative flex flex-col items-center gap-1 px-1 py-3 capitalize"
            key={tab}
            style={{ color: active ? theme.primary : theme.foregroundMuted }}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            <Icon className="h-4 w-4" />
            {tab}
            {tab === 'orders' && cartCount > 0 && (
              <span
                className="absolute right-4 top-2 h-2 w-2 rounded-full"
                style={{ background: theme.accent }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}

function StoreStatus({ config }: { config: MobileBuilderProject }) {
  const theme = config.appConfig.theme

  return (
    <section
      className="rounded-2xl px-4 py-3 text-sm"
      style={{ background: theme.surface, color: theme.foreground }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">
          {config.storeConfig.isOpen ? 'Open now' : 'Closed'}
        </span>
        <span>{config.storeConfig.prepEtaMinutes} min pickup</span>
      </div>
      <p className="mt-1 text-xs" style={{ color: theme.foregroundMuted }}>
        {config.storeConfig.hoursText}
      </p>
    </section>
  )
}

function SectionHeader({ action, title }: { action?: string; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {action && <span className="text-xs opacity-60">{action}</span>}
    </div>
  )
}

function Capability({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-2 text-center text-xs font-medium ${
        enabled ? 'bg-[#DDEBDD] text-[#22543D]' : 'bg-[#EFE7E7] text-[#8A3838]'
      }`}
    >
      {label}
    </span>
  )
}

function PaymentChip({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-2 text-center text-xs font-medium ${
        enabled ? 'bg-[#DDEBDD] text-[#22543D]' : 'bg-[#EFE7E7] text-[#8A3838]'
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
    <div
      className={`mt-2 flex items-center justify-between text-sm ${
        strong ? 'font-semibold' : ''
      }`}
    >
      <span>{label}</span>
      <span>{money(value)}</span>
    </div>
  )
}

function AccountRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      className="flex h-12 w-full items-center justify-between border-b border-black/5 px-4 text-left text-sm last:border-b-0"
      type="button"
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      <ChevronRight className="h-4 w-4 opacity-50" />
    </button>
  )
}

function EmptyState({
  body,
  config,
  icon,
  title,
}: {
  body: string
  config: MobileBuilderProject
  icon: ReactNode
  title: string
}) {
  const theme = config.appConfig.theme

  return (
    <div className="flex h-full items-center justify-center px-6 pb-12 text-center">
      <div>
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: theme.surface }}
        >
          {icon}
        </div>
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm" style={{ color: theme.foregroundMuted }}>
          {body}
        </p>
      </div>
    </div>
  )
}

function IconButton({
  children,
  config,
  label,
}: {
  children: ReactNode
  config: MobileBuilderProject
  label: string
}) {
  return (
    <button
      className="flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ background: config.appConfig.theme.surface }}
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}

function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100)
}

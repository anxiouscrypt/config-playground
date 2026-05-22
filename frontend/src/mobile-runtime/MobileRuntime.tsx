import { useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { AppTab, MenuItem, MobileBuilderProject } from '../lib/types'
import { ClassicPillTabBar as RuntimePillTabBar } from './navigation/ClassicPillTabBar'
import { GestureHandlerRootView } from './platform/gestureHandler'
import { SafeAreaProvider } from './platform/safeArea'

type MobileRuntimeProps = {
  config: MobileBuilderProject
}

type RuntimeCartItem = {
  id: string
  name: string
  priceCents: number
  quantity: number
}

type RuntimePalette = ReturnType<typeof getRuntimePalette>

const TAB_BAR_HEIGHT = 68
const TAB_BAR_BOTTOM = 16
const HOME_HEADER_EXPANDED_HEIGHT = 156
const MENU_HEADER_EXPANDED_HEIGHT = 156
const COMPACT_HEADER_HEIGHT = 88

const uiPalette = {
  background: '#F7F4ED',
  backgroundAlt: '#F0ECE4',
  surfaceStrong: '#FFFDF8',
  surfaceMuted: '#F3EFE7',
  surfaceGlass: 'rgba(255, 253, 248, 0.84)',
  card: '#FFFDF8',
  cardMuted: '#F7F2EA',
  text: '#171513',
  textSecondary: '#605B55',
  textMuted: '#9B9389',
  border: 'rgba(23, 21, 19, 0.08)',
  borderStrong: 'rgba(23, 21, 19, 0.14)',
  primary: '#1E1B18',
  primaryText: '#FFFFFF',
  accent: '#2D2823',
  accentSoft: 'rgba(30, 27, 24, 0.06)',
  brass: '#8E7761',
  walnut: '#31261F',
  charcoal: '#1D1A17',
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

  return (
    <GestureHandlerRootView>
      <View style={styles.runtimeRoot}>
        <SafeAreaProvider>
          <View style={[styles.device, { backgroundColor: palette.background }]}>
          <View style={styles.notch} />
          {currentTab === 'menu' ? (
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
          )}
          <TabBarDepth />
          <RuntimePillTabBar
            activeTab={currentTab}
            cartCount={cartCount}
            enabledTabs={config.appConfig.enabledTabs}
            setActiveTab={setActiveTab}
          />
          </View>
        </SafeAreaProvider>
      </View>
    </GestureHandlerRootView>
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
  palette: RuntimePalette
}) {
  const [scrollY, setScrollY] = useState(0)
  const progress = clamp(scrollY / 64, 0, 1)
  const headerHeight = interpolateNumber(HOME_HEADER_EXPANDED_HEIGHT, 116, progress)
  const titleSize = interpolateNumber(40, 28, progress)
  const titleLineHeight = interpolateNumber(46, 32, progress)
  const titleMarginTop = interpolateNumber(16, 6, progress)
  const storeRailMarginTop = interpolateNumber(16, 10, progress)

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScreenBackdrop palette={palette} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.homeScrollContent,
          { paddingTop: HOME_HEADER_EXPANDED_HEIGHT, paddingBottom: 132 },
        ]}
      >
        <View style={styles.cardGrid}>
          {cards.map((item) => (
            <GlassCard key={item.cardId} style={styles.newsCard}>
              <View style={styles.newsCardContent}>
                <View style={styles.newsCardHeader}>
                  <HomeNewsTag label={item.label} palette={palette} />
                </View>

                <View style={styles.newsCopy}>
                  <Text style={[styles.newsTitle, { color: palette.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.newsBody, { color: palette.textSecondary }]}>
                    {item.body}
                  </Text>
                </View>

                {item.note ? (
                  <Text style={[styles.newsNote, { color: palette.textMuted }]}>
                    {item.note}
                  </Text>
                ) : null}
              </View>
            </GlassCard>
          ))}

          <View style={styles.previewSection}>
            <SectionHeader label="Featured" palette={palette} />
            <View style={[styles.sectionList, { borderTopColor: palette.border }]}>
              {categories
                .flatMap((category) => category.items)
                .slice(0, 2)
                .map((item, index, items) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    isLast={index === items.length - 1}
                    onPress={goToMenu}
                    palette={palette}
                  />
                ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.homeHeaderShell,
          {
            height: headerHeight,
            backgroundColor: config.appConfig.header.background,
          },
        ]}
      >
        <View style={styles.hero}>
          <Text
            style={[
              styles.homeTitle,
              {
                color: config.appConfig.header.foreground ?? palette.text,
                fontSize: titleSize,
                lineHeight: titleLineHeight,
                marginTop: titleMarginTop,
              },
            ]}
          >
            {config.appConfig.brand.brandName}
          </Text>
        </View>

        <View style={[styles.storeRail, { marginTop: storeRailMarginTop }]}>
          <View style={styles.storeCopy}>
            <Text
              numberOfLines={1}
              style={[
                styles.storeTitle,
                { color: config.appConfig.header.foreground ?? palette.text },
              ]}
            >
              {config.appConfig.brand.locationName}
            </Text>
          </View>
          <Pressable onPress={goToMenu} style={styles.inlineLink}>
            <Text
              style={[
                styles.inlineLinkText,
                { color: config.appConfig.header.foreground ?? palette.text },
              ]}
            >
              Menu
            </Text>
            <Text style={{ color: config.appConfig.header.foreground ?? palette.text }}>
              ›
            </Text>
          </Pressable>
        </View>
      </View>
      <TabBarDepthBackdrop />
    </View>
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
  palette: RuntimePalette
}) {
  const [scrollY, setScrollY] = useState(0)
  const progress = clamp(scrollY / 78, 0, 1)
  const headerHeight = interpolateNumber(MENU_HEADER_EXPANDED_HEIGHT, 76, progress)
  const pickupOpacity = interpolateNumber(1, 0, progress)
  const tabOpacity = interpolateNumber(1, 0, progress)
  const locationSize = interpolateNumber(19, 17, progress)

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
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScreenBackdrop palette={palette} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.menuScrollContent,
          { paddingTop: MENU_HEADER_EXPANDED_HEIGHT, paddingBottom: 132 },
        ]}
      >
        {sections.map((section) => (
          <View key={section.id} style={styles.menuSectionBlock}>
            <Pressable style={styles.sectionStickyHeader}>
              <View
                style={[
                  styles.sectionHeaderRow,
                  { backgroundColor: palette.background },
                ]}
              >
                <SectionHeader label={section.title} palette={palette} />
                <Text style={[styles.chevronText, { color: palette.textMuted }]}>
                  ⌃
                </Text>
              </View>
            </Pressable>
            <View style={[styles.sectionList, { borderTopColor: palette.border }]}>
              {section.items.map((item, index) => (
                <MenuItemRow
                  key={`${section.id}-${item.id}`}
                  item={item}
                  isLast={index === section.items.length - 1}
                  onAdd={() => addItem(item)}
                  onPress={() => addItem(item)}
                  palette={palette}
                  showAdd
                />
              ))}
            </View>
          </View>
        ))}
        {cartCount > 0 ? (
          <Pressable
            onPress={goToOrders}
            style={({ pressed }: { pressed: boolean }) => [
              styles.reviewOrderButton,
              { backgroundColor: palette.primary },
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={[styles.reviewOrderText, { color: palette.primaryText }]}>
              {cartCount} item{cartCount === 1 ? '' : 's'} in bag
            </Text>
            <Text style={[styles.reviewOrderText, { color: palette.primaryText }]}>
              Review order
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.menuHeaderShell,
          {
            height: headerHeight,
            backgroundColor: config.appConfig.header.background,
          },
        ]}
      >
        <View style={styles.menuHeader}>
          <View style={styles.headerCopy}>
            <View style={[styles.pickupMetaWrap, { opacity: pickupOpacity }]}>
              <Text
                style={[
                  styles.pickupMeta,
                  { color: config.appConfig.header.foreground ?? palette.text },
                ]}
              >
                Estimated pick-up is {config.storeConfig.prepEtaMinutes} min
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.locationText,
                {
                  color: config.appConfig.header.foreground ?? palette.text,
                  fontSize: locationSize,
                },
              ]}
            >
              {config.appConfig.brand.locationName}
            </Text>
          </View>
        </View>
        <View style={[styles.tabsWrap, { opacity: tabOpacity }]}>
          <View style={styles.tabRow}>
            <Text
              style={[
                styles.activeTab,
                { color: config.appConfig.header.foreground ?? palette.text },
              ]}
            >
              Menu
            </Text>
          </View>
        </View>
      </View>
      <TabBarDepthBackdrop />
    </View>
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
  palette: RuntimePalette
  removeItem: (itemId: string) => void
  setOrderPlaced: (value: boolean) => void
  subtotalCents: number
  taxCents: number
  totalCents: number
}) {
  const title = orderPlaced ? 'Track your order' : 'Past Orders'

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScreenBackdrop palette={palette} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.staticContent,
          { paddingTop: COMPACT_HEADER_HEIGHT + 18, paddingBottom: 132 },
        ]}
      >
        {orderPlaced ? (
          <GlassCard style={styles.activePanelShell}>
            <View style={styles.activeTopRow}>
              <StatusPill label="Received" palette={palette} />
              <Text style={[styles.activeAmount, { color: palette.text }]}>
                {formatUsd(totalCents)}
              </Text>
            </View>
            <Text style={[styles.activeTitle, { color: palette.text }]}>
              We have your order.
            </Text>
            <Text style={[styles.activeBody, { color: palette.textSecondary }]}>
              {config.appConfig.featureFlags.orderTracking
                ? 'Follow your pickup progress from here.'
                : 'Tracking is hidden for this app configuration.'}
            </Text>
            <View style={[styles.pickupCodeBlock, { borderTopColor: palette.border }]}>
              <Text style={[styles.metricLabel, { color: palette.textMuted }]}>
                Pickup code
              </Text>
              <Text style={[styles.pickupCodeValue, { color: palette.text }]}>
                NMLY
              </Text>
            </View>
          </GlassCard>
        ) : null}

        <View style={styles.sectionBlock}>
          <View style={[styles.ordersSectionHeader, { borderBottomColor: palette.border }]}>
            <SectionHeader
              action={cartItems.length > 0 ? `${cartItems.length} active` : undefined}
              label="Recent orders"
              palette={palette}
            />
          </View>

          {cartItems.length === 0 && !orderPlaced ? (
            <Text style={[styles.sectionMessage, { color: palette.textSecondary }]}>
              Completed pickups and older orders will collect here.
            </Text>
          ) : null}

          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartRow}>
              <View style={styles.cartCopy}>
                <Text numberOfLines={1} style={[styles.cartTitle, { color: palette.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.cartMeta, { color: palette.textSecondary }]}>
                  Qty {item.quantity} · {formatUsd(item.priceCents)}
                </Text>
              </View>
              <Pressable
                onPress={() => removeItem(item.id)}
                style={[styles.removeButton, { backgroundColor: palette.surfaceMuted }]}
              >
                <Text style={{ color: palette.text }}>−</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {cartItems.length > 0 ? (
          <GlassCard style={styles.checkoutCard}>
            <SectionHeader label="Checkout" palette={palette} />
            <View style={styles.priceRows}>
              <PriceRow label="Subtotal" value={subtotalCents} />
              <PriceRow label="Estimated tax" value={taxCents} />
              <View style={[styles.totalRow, { borderTopColor: palette.border }]}>
                <PriceRow label="Total" strong value={totalCents} />
              </View>
            </View>
            <View style={styles.paymentGrid}>
              <Chip active={config.appConfig.paymentCapabilities.applePay} label="Apple Pay" />
              <Chip active={config.appConfig.paymentCapabilities.card} label="Card" />
              <Chip active={config.appConfig.paymentCapabilities.cash} label="Cash" />
              <Chip active={config.appConfig.paymentCapabilities.refunds} label="Refunds" />
            </View>
            <Pressable
              onPress={() => setOrderPlaced(true)}
              style={[styles.primaryButton, { backgroundColor: palette.primary }]}
            >
              <Text style={[styles.primaryButtonText, { color: palette.primaryText }]}>
                Place preview order
              </Text>
            </Pressable>
          </GlassCard>
        ) : null}
      </ScrollView>
      <CompactHeader
        backgroundColor={config.appConfig.header.background}
        foregroundColor={config.appConfig.header.foreground ?? palette.text}
        title={title}
      />
      <TabBarDepthBackdrop />
    </View>
  )
}

function AccountScreen({
  config,
  palette,
}: {
  config: MobileBuilderProject
  palette: RuntimePalette
}) {
  const accountGreeting = config.client.ownerName.trim() || 'Welcome back'

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScreenBackdrop palette={palette} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.staticContent,
          { paddingTop: COMPACT_HEADER_HEIGHT + 18, paddingBottom: 132 },
        ]}
      >
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <SectionLabel label="Account" palette={palette} />
              <Text style={[styles.heroTitle, { color: palette.text }]}>
                {accountGreeting}
              </Text>
            </View>
            <Chip
              active={config.appConfig.loyaltyEnabled}
              label={config.appConfig.loyaltyEnabled ? 'Loyalty On' : 'Loyalty Off'}
            />
          </View>

          <View style={[styles.pointsWrap, { borderTopColor: palette.border }]}>
            <Text style={[styles.pointsLabel, { color: palette.textMuted }]}>
              Available points
            </Text>
            <Text style={[styles.pointsValue, { color: palette.text }]}>
              {config.appConfig.loyaltyEnabled ? '420' : 'Off'}
            </Text>
            <Text style={[styles.pointsMeta, { color: palette.textSecondary }]}>
              {config.appConfig.loyaltyEnabled
                ? 'Lifetime 1,240 pts'
                : 'Loyalty unavailable'}
            </Text>
          </View>
        </GlassCard>

        <View style={styles.listSection}>
          <SectionLabel label="Account" palette={palette} />
          <View style={[styles.pageList, { borderTopColor: palette.border }]}>
            <AccountPageRow label="Rewards activity" palette={palette} />
            <AccountPageRow label="Profile" palette={palette} />
            <AccountPageRow isLast label="Settings" palette={palette} />
          </View>
        </View>
      </ScrollView>
      <CompactHeader
        backgroundColor={config.appConfig.header.background}
        foregroundColor={config.appConfig.header.foreground ?? palette.text}
        title="Account"
      />
      <TabBarDepthBackdrop />
    </View>
  )
}

function CompactHeader({
  backgroundColor,
  foregroundColor,
  title,
}: {
  backgroundColor: string
  foregroundColor: string
  title: string
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.pageHeaderFloating,
        { backgroundColor, height: COMPACT_HEADER_HEIGHT },
      ]}
    >
      <View style={styles.pageHeader}>
        <View style={styles.pageCopy}>
          <Text style={[styles.pageTitle, { color: foregroundColor }]}>{title}</Text>
        </View>
      </View>
    </View>
  )
}

function MenuItemRow({
  isLast,
  item,
  onAdd,
  onPress,
  palette,
  showAdd = false,
}: {
  isLast: boolean
  item: MenuItem
  onAdd?: () => void
  onPress: () => void
  palette: RuntimePalette
  showAdd?: boolean
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }: { pressed: boolean }) => [styles.menuRow, pressed ? styles.pressed : null]}>
      <View style={styles.menuRowMain}>
        <View style={styles.menuImage}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.menuImagePhoto} resizeMode="cover" />
          ) : (
            <Text style={[styles.menuArtworkFallback, { color: palette.accent }]}>☕</Text>
          )}
        </View>
        <View
          style={[
            styles.menuBodyWrap,
            !isLast ? [styles.menuBodyWrapWithDivider, { borderBottomColor: palette.border }] : null,
          ]}
        >
          <View style={styles.menuBodyContent}>
            <View style={styles.menuCopy}>
              <View style={styles.menuTitleRow}>
                <Text numberOfLines={1} style={[styles.menuTitle, { color: palette.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.menuMeta, { color: palette.text }]}>
                  {formatUsd(item.priceCents)}
                </Text>
              </View>
              <Text numberOfLines={3} style={[styles.menuDescription, { color: palette.textSecondary }]}>
                {item.description}
              </Text>
              {showAdd ? (
                <Pressable
                  onPress={onAdd}
                  style={[styles.addButton, { backgroundColor: palette.primary }]}
                >
                  <Text style={[styles.addButtonText, { color: palette.primaryText }]}>Add</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

function ScreenBackdrop({ palette }: { palette: RuntimePalette }) {
  return <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: palette.background }]} />
}

function TabBarDepthBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={styles.tabBarDepthBelowFade} />
    </View>
  )
}

function TabBarDepth() {
  return <View pointerEvents="none" style={styles.deviceTabDepth} />
}

function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode
  style?: object
}) {
  return (
    <View style={[styles.cardShell, style]}>
      <View style={styles.cardFallbackInner} />
      <View style={styles.cardContent}>{children}</View>
    </View>
  )
}

function HomeNewsTag({ label, palette }: { label: string; palette: RuntimePalette }) {
  return (
    <View style={styles.newsLabelShell}>
      <View style={styles.newsLabelFrame}>
        <View style={styles.newsLabelInner}>
          <Text style={[styles.newsLabelText, { color: palette.textSecondary }]}>
            {label}
          </Text>
        </View>
      </View>
    </View>
  )
}

function SectionHeader({
  action,
  label,
  palette,
}: {
  action?: string
  label: string
  palette: RuntimePalette
}) {
  return (
    <View style={styles.sectionHeaderContent}>
      <SectionLabel label={label} palette={palette} />
      {action ? (
        <Text style={[styles.sectionMeta, { color: palette.textMuted }]}>{action}</Text>
      ) : null}
    </View>
  )
}

function SectionLabel({ label, palette }: { label: string; palette: RuntimePalette }) {
  return <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{label}</Text>
}

function StatusPill({ label, palette }: { label: string; palette: RuntimePalette }) {
  return (
    <View style={[styles.statusPill, { borderColor: palette.border }]}>
      <Text style={[styles.statusPillText, { color: palette.text }]}>{label}</Text>
    </View>
  )
}

function Chip({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={[styles.chip, active ? styles.chipActive : null]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </View>
  )
}

function PriceRow({
  label,
  strong = false,
  value,
}: {
  label: string
  strong?: boolean
  value: number
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceText, strong ? styles.priceTextStrong : null]}>{label}</Text>
      <Text style={[styles.priceText, strong ? styles.priceTextStrong : null]}>{formatUsd(value)}</Text>
    </View>
  )
}

function AccountPageRow({
  isLast = false,
  label,
  palette,
}: {
  isLast?: boolean
  label: string
  palette: RuntimePalette
}) {
  return (
    <Pressable style={[styles.accountRow, !isLast ? { borderBottomColor: palette.border, borderBottomWidth: 1 } : null]}>
      <Text style={[styles.accountRowLabel, { color: palette.text }]}>{label}</Text>
      <Text style={[styles.accountChevron, { color: palette.textMuted }]}>›</Text>
    </Pressable>
  )
}

function getRuntimePalette(config: MobileBuilderProject) {
  const theme = config.appConfig.theme

  return {
    ...uiPalette,
    background: theme.background || uiPalette.background,
    backgroundAlt: theme.backgroundAlt || uiPalette.backgroundAlt,
    surfaceStrong: theme.surface || uiPalette.surfaceStrong,
    surfaceMuted: theme.surfaceMuted || uiPalette.surfaceMuted,
    surfaceGlass: theme.surface || uiPalette.surfaceGlass,
    card: theme.surface || uiPalette.card,
    text: theme.foreground || uiPalette.text,
    textSecondary: theme.foregroundMuted || uiPalette.textSecondary,
    textMuted: theme.muted || uiPalette.textMuted,
    border: theme.border || uiPalette.border,
    primary: theme.primary || uiPalette.primary,
    accent: theme.accent || uiPalette.accent,
    primaryText: theme.background || uiPalette.primaryText,
  }
}

function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(cents / 100)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function interpolateNumber(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

const styles = StyleSheet.create({
  runtimeRoot: {
    height: 710,
    width: '100%',
    maxWidth: 350,
  },
  device: {
    position: 'relative',
    height: 710,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    borderRadius: 34,
    borderWidth: 10,
    borderColor: '#171513',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 38,
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    zIndex: 50,
    width: 128,
    height: 20,
    marginLeft: -64,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#171513',
  },
  screen: {
    flex: 1,
    height: '100%',
  },
  homeScrollContent: {
    paddingHorizontal: 20,
  },
  menuScrollContent: {
    paddingHorizontal: 20,
  },
  staticContent: {
    paddingHorizontal: 20,
  },
  homeHeaderShell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingHorizontal: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  hero: {
    paddingTop: 0,
  },
  homeTitle: {
    marginTop: 16,
    fontSize: 40,
    lineHeight: 46,
    fontFamily: 'Georgia',
    fontWeight: '600',
    letterSpacing: -1.4,
  },
  storeRail: {
    marginTop: 16,
    paddingBottom: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  storeCopy: {
    flex: 1,
  },
  storeTitle: {
    marginTop: 2,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: 1.9,
    fontFamily: 'Georgia',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  inlineLinkText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  cardGrid: {
    paddingTop: 12,
    gap: 14,
  },
  previewSection: {
    paddingTop: 8,
  },
  newsCard: {
    width: '100%',
    minHeight: 142,
  },
  newsCardContent: {
    minHeight: 142,
    justifyContent: 'space-between',
    gap: 14,
  },
  newsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newsCopy: {
    gap: 6,
  },
  newsTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: 'Georgia',
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  newsBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  newsNote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  newsLabelShell: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  newsLabelFrame: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  newsLabelInner: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderColor: 'rgba(255,255,255,0.28)',
  },
  newsLabelText: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  menuHeaderShell: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 40,
    paddingHorizontal: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  pickupMetaWrap: {
    overflow: 'hidden',
    height: 18,
    marginBottom: 6,
  },
  pickupMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  locationText: {
    marginTop: 3,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  tabsWrap: {
    overflow: 'hidden',
    height: 34,
    marginTop: 9,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  menuSectionBlock: {
    marginTop: 14,
  },
  sectionStickyHeader: {
    marginTop: 0,
  },
  sectionHeaderRow: {
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  sectionMeta: {
    fontSize: 12,
    lineHeight: 18,
  },
  chevronText: {
    fontSize: 16,
    lineHeight: 18,
  },
  sectionList: {
    borderTopWidth: 1,
  },
  menuRow: {
    minHeight: 132,
  },
  menuRowMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
  },
  menuImage: {
    width: 108,
    height: 132,
    backgroundColor: '#D5D4CE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  menuImagePhoto: {
    width: '100%',
    height: '100%',
  },
  menuArtworkFallback: {
    fontSize: 22,
  },
  menuBodyWrap: {
    flex: 1,
    minWidth: 0,
    minHeight: 132,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'center',
  },
  menuBodyWrapWithDivider: {
    borderBottomWidth: 1,
  },
  menuBodyContent: {
    minHeight: 132,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  menuCopy: {
    justifyContent: 'center',
    gap: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  menuDescription: {
    fontSize: 12,
    lineHeight: 14,
  },
  menuMeta: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: 'Georgia',
    fontWeight: '400',
  },
  addButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  reviewOrderButton: {
    marginTop: 16,
    marginBottom: 8,
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  reviewOrderText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  pageHeaderFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingBottom: 11,
  },
  pageCopy: {
    flex: 1,
  },
  pageTitle: {
    marginTop: 3,
    fontSize: 17,
    lineHeight: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  sectionBlock: {
    marginTop: 28,
  },
  ordersSectionHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionMessage: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  activePanelShell: {
    borderRadius: 36,
  },
  activeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  activeAmount: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: 'Georgia',
    fontWeight: '400',
  },
  activeTitle: {
    marginTop: 18,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.9,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  activeBody: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
  },
  pickupCodeBlock: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  pickupCodeValue: {
    marginTop: 8,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 1.2,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  cartCopy: {
    flex: 1,
    minWidth: 0,
  },
  cartTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  cartMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutCard: {
    marginTop: 8,
  },
  priceRows: {
    marginTop: 14,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 14,
    lineHeight: 20,
    color: uiPalette.text,
  },
  priceTextStrong: {
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  paymentGrid: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  heroCard: {
    marginTop: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.8,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  pointsWrap: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  pointsLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  pointsValue: {
    marginTop: 10,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1.6,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  pointsMeta: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  listSection: {
    marginTop: 28,
  },
  pageList: {
    marginTop: 12,
    borderTopWidth: 1,
  },
  accountRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountRowLabel: {
    fontSize: 15,
    lineHeight: 22,
  },
  accountChevron: {
    fontSize: 22,
    lineHeight: 24,
  },
  cardShell: {
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
  },
  cardFallbackInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 253, 248, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 32,
  },
  cardContent: {
    padding: 22,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  statusPillText: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: uiPalette.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: uiPalette.surfaceMuted,
  },
  chipActive: {
    backgroundColor: uiPalette.surfaceStrong,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    color: uiPalette.textMuted,
  },
  chipTextActive: {
    color: uiPalette.text,
  },
  pressed: {
    opacity: 0.84,
  },
  tabShell: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: TAB_BAR_BOTTOM,
    height: TAB_BAR_HEIGHT,
    zIndex: 40,
  },
  dockWrap: {
    flex: 1,
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
  },
  blurShell: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 253, 248, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  dockInner: {
    flex: 1,
    padding: 3,
    borderRadius: 999,
  },
  tabRowRuntime: {
    position: 'relative',
    flex: 1,
    flexDirection: 'row',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    height: 24,
    lineHeight: 24,
    fontSize: 21,
  },
  tabIconMenu: {
    fontSize: 24,
  },
  tabIconActive: {
    color: 'rgba(18, 18, 18, 0.96)',
  },
  tabIconBase: {
    color: 'rgba(60, 60, 67, 0.72)',
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: 'rgba(18, 18, 18, 0.96)',
  },
  tabLabelBase: {
    color: 'rgba(60, 60, 67, 0.72)',
  },
  cartDot: {
    position: 'absolute',
    top: -2,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  tabBarDepthBelowFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 94,
    background:
      'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.008) 45%, rgba(0,0,0,0.03) 70%, rgba(0,0,0,0.065))',
  },
  deviceTabDepth: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    background:
      'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.008) 45%, rgba(0,0,0,0.03) 70%, rgba(0,0,0,0.065))',
  },
})

import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { AppTab } from '../../lib/types'
import { getTabBarBottomOffset, TAB_BAR_HEIGHT } from './tabBarMetrics'
import { uiPalette } from '../ui/system'

type ClassicPillTabBarProps = {
  activeTab: AppTab
  cartCount: number
  enabledTabs: AppTab[]
  setActiveTab: (tab: AppTab) => void
}

const labelMap: Record<AppTab, string> = {
  home: 'Home',
  menu: 'Menu',
  orders: 'Orders',
  account: 'Account',
}

const iconMap: Record<AppTab, string> = {
  home: '⌂',
  menu: '☕',
  orders: '▤',
  account: '◯',
}

export function ClassicPillTabBar({
  activeTab,
  cartCount,
  enabledTabs,
  setActiveTab,
}: ClassicPillTabBarProps) {
  const routeCount = Math.max(enabledTabs.length, 1)
  const activeIndex = Math.max(enabledTabs.indexOf(activeTab), 0)
  const slotPercent = 100 / routeCount

  return (
    <View pointerEvents="box-none" style={styles.shell}>
      <View style={styles.dockWrap}>
        <View style={styles.container}>
          <View style={styles.tabRow}>
            <View
              pointerEvents="none"
              style={[
                styles.activeIndicator,
                {
                  width: `${slotPercent}%`,
                  transform: [{ translateX: `${activeIndex * 100}%` }],
                },
              ]}
            />
            {enabledTabs.map((tab) => {
              const active = tab === activeTab
              return (
                <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabSlot}>
                  <View style={styles.tabContent}>
                    <Text style={[styles.tabIcon, active ? styles.tabIconActive : styles.tabIconBase]}>
                      {iconMap[tab]}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelBase]}
                    >
                      {labelMap[tab]}
                    </Text>
                    {tab === 'orders' && cartCount > 0 ? <View style={styles.cartDot} /> : null}
                  </View>
                </Pressable>
              )
            })}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: getTabBarBottomOffset(false),
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
  container: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 253, 248, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    padding: 3,
  },
  tabRow: {
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
    transitionDuration: '220ms',
    transitionProperty: 'transform',
    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
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
    fontSize: 22,
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
    backgroundColor: uiPalette.accent,
  },
})

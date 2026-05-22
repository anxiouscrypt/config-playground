/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from '../platform/LinearGradient'
import { BlurView, GlassView, isLiquidGlassAvailable } from '../platform/glass'
import { getTabBarBottomOffset } from '../navigation/tabBarMetrics'

export const uiPalette = {
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
  glow: 'rgba(255, 255, 255, 0.56)',
  warning: '#A46C2C',
  danger: '#B45B4F',
  success: '#4F7A63',
  chromeText: '#171513',
  chromeMuted: '#605B55',
} as const

export const uiTypography = {
  displayFamily: 'system-ui',
  headerFamily: 'Georgia',
  bodyFamily: 'system-ui',
  monoFamily: 'monospace',
} as const

type ScreenProps = {
  children: ReactNode
  bottomInset?: number
  contentContainerStyle?: unknown
}

export function ScreenScroll({ children, bottomInset = 132, contentContainerStyle }: ScreenProps) {
  return (
    <View style={styles.screen}>
      <ScreenBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: 18, paddingBottom: bottomInset },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
      <TabBarDepthBackdrop />
    </View>
  )
}

export function ScreenStatic({ children, style }: { children: ReactNode; style?: unknown }) {
  return (
    <View style={styles.screen}>
      <ScreenBackdrop />
      <View style={[styles.screenContent, { paddingTop: 18 }, style]}>{children}</View>
      <TabBarDepthBackdrop />
    </View>
  )
}

export function ScreenBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={[StyleSheet.absoluteFillObject, styles.backdropBase]} />
    </View>
  )
}

export function TabBarDepthBackdrop() {
  const dockBottom = getTabBarBottomOffset(false)

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={[styles.tabBarDepthBelowFade, { height: dockBottom + 10 }]}>
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0)',
            'rgba(0, 0, 0, 0.008)',
            'rgba(0, 0, 0, 0.03)',
            'rgba(0, 0, 0, 0.065)',
          ]}
          style={styles.tabBarDepthGradient}
        />
      </View>
    </View>
  )
}

export function GlassCard({
  children,
  contentStyle,
  style,
}: {
  children: ReactNode
  contentStyle?: unknown
  style?: unknown
}) {
  const useLiquidGlass = isLiquidGlassAvailable()

  return (
    <View style={[styles.cardShell, style]}>
      {useLiquidGlass ? (
        <GlassView style={styles.cardFrame}>
          <View style={styles.cardGlassInner} />
        </GlassView>
      ) : (
        <BlurView style={styles.cardFrame}>
          <View style={styles.cardFallbackInner} />
        </BlurView>
      )}
      <View style={[styles.cardContent, contentStyle]}>{children}</View>
    </View>
  )
}

export function Button({
  disabled = false,
  label,
  onPress,
  variant = 'primary',
}: {
  disabled?: boolean
  label: string
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.buttonBase,
        buttonVariantStyles[variant],
        disabled ? styles.buttonDisabled : null,
        pressed && !disabled ? styles.buttonPressed : null,
      ]}
    >
      <Text style={[styles.buttonText, buttonTextStyles[variant]]}>{label}</Text>
    </Pressable>
  )
}

export function Chip({ active = false, label }: { active?: boolean; label: string }) {
  return (
    <View style={[styles.chip, active ? styles.chipActive : null]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </View>
  )
}

export function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>
}

const buttonVariantStyles = StyleSheet.create({
  primary: {
    backgroundColor: uiPalette.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondary: {
    backgroundColor: uiPalette.surfaceStrong,
    borderWidth: 1,
    borderColor: uiPalette.borderStrong,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: uiPalette.border,
  },
})

const buttonTextStyles = StyleSheet.create({
  primary: { color: uiPalette.primaryText },
  secondary: { color: uiPalette.text },
  ghost: { color: uiPalette.text },
})

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiPalette.background,
  },
  screenContent: {
    paddingHorizontal: 20,
  },
  backdropBase: {
    backgroundColor: uiPalette.background,
  },
  tabBarDepthBelowFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarDepthGradient: {
    ...StyleSheet.absoluteFillObject,
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
  cardFrame: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: 'hidden',
  },
  cardGlassInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  cardFallbackInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 253, 248, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  cardContent: {
    padding: 22,
  },
  buttonBase: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
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
  sectionLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: uiPalette.textMuted,
    fontWeight: '700',
  },
})

/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import { View } from 'react-native'

type GlassProps = {
  children?: ReactNode
  style?: unknown
}

export function BlurView({ children, style }: GlassProps) {
  return <View style={style}>{children}</View>
}

export function GlassView({ children, style }: GlassProps) {
  return <View style={style}>{children}</View>
}

export function isLiquidGlassAvailable() {
  return false
}

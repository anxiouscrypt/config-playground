import type { ReactNode } from 'react'
import { View } from 'react-native'

type LinearGradientProps = {
  children?: ReactNode
  colors: string[]
  end?: { x: number; y: number }
  locations?: number[]
  start?: { x: number; y: number }
  style?: unknown
}

export function LinearGradient({ children, colors, style }: LinearGradientProps) {
  const background =
    colors.length > 1
      ? `linear-gradient(to bottom, ${colors.join(', ')})`
      : colors[0]

  return <View style={[style, { background }]}>{children}</View>
}

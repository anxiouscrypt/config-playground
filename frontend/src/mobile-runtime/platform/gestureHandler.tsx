import type { ReactNode } from 'react'
import { View } from 'react-native'

export function GestureHandlerRootView({
  children,
  style,
}: {
  children: ReactNode
  style?: unknown
}) {
  return <View style={style}>{children}</View>
}

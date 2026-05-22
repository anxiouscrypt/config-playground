/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  return children
}

export function useSafeAreaInsets() {
  return {
    bottom: 0,
    left: 0,
    right: 0,
    top: 24,
  }
}

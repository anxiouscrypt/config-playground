declare module 'react-native' {
  import type { CSSProperties, ReactNode } from 'react'

  type Style = CSSProperties & Record<string, unknown>
  type StyleProp<T = Style> = T | T[] | null | undefined | false | unknown

  export type ViewStyle = Style
  export type TextStyle = Style
  export type ImageStyle = Style

  export const View: (props: {
    children?: ReactNode
    pointerEvents?: string
    style?: StyleProp
  }) => JSX.Element

  export const Text: (props: {
    children?: ReactNode
    numberOfLines?: number
    style?: StyleProp
  }) => JSX.Element

  export const Pressable: (props: {
    children?: ReactNode
    disabled?: boolean
    onPress?: () => void
    style?: StyleProp | ((state: { pressed: boolean }) => StyleProp)
  }) => JSX.Element

  export const ScrollView: (props: {
    children?: ReactNode
    contentContainerStyle?: StyleProp
    showsVerticalScrollIndicator?: boolean
    style?: StyleProp
  }) => JSX.Element

  export const Image: (props: {
    source: { uri: string }
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
    style?: StyleProp
  }) => JSX.Element

  export const StyleSheet: {
    absoluteFillObject: Style
    hairlineWidth: number
    create<T extends Record<string, Style>>(styles: T): T
    flatten(style?: StyleProp): Style
  }
}

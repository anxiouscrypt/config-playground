import { Text } from 'react-native'

const glyphs: Record<string, string> = {
  'home': '⌂',
  'home-outline': '⌂',
  'cafe': '☕',
  'cafe-outline': '☕',
  'receipt': '▤',
  'receipt-outline': '▤',
  'person': '◯',
  'person-outline': '◯',
  'chevron-forward': '›',
  'chevron-up-outline': '⌃',
  'bag-outline': '◱',
  'logo-apple': '',
}

type IoniconProps = {
  color?: string
  name: string
  size?: number
}

export function Ionicons({ color = '#171513', name, size = 20 }: IoniconProps) {
  return (
    <Text style={{ color, fontSize: size, lineHeight: size + 2 }}>
      {glyphs[name] ?? '•'}
    </Text>
  )
}

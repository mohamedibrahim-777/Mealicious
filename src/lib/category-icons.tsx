import {
  Nut,
  Soup,
  Grape,
  Flame,
  Cherry,
  Gift,
  Salad,
  Package,
  type LucideIcon,
} from 'lucide-react'

export const categoryIconMap: Record<string, LucideIcon> = {
  Nut,
  Soup,
  Grape,
  Flame,
  Cherry,
  Gift,
  Salad,
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = categoryIconMap[name] ?? Package
  return <Icon className={className} />
}

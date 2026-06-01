import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  sub?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({ title, value, sub, icon: Icon, iconColor = 'text-orange-500' }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
          </div>
          <Icon className={`h-8 w-8 ${iconColor} opacity-80`} />
        </div>
      </CardContent>
    </Card>
  )
}

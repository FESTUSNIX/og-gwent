import { cn } from '@/lib/utils'

type Props = {
	children: React.ReactNode
	className?: string
}

export function Muted({ children, className }: Props) {
	return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

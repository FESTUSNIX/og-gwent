import { cn } from '@/lib/utils'

type Props = {
	children: React.ReactNode
	className?: string
}
export function H4({ children, className }: Props) {
	return <h4 className={cn('scroll-m-20 text-sm font-semibold tracking-tight', className)}>{children}</h4>
}

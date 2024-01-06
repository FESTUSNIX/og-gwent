import { cn } from '@/lib/utils'

type Props = {
	children: React.ReactNode
	className?: string
}
export function H2({ children, className }: Props) {
	return (
		<h2 className={cn('scroll-m-20 pb-2 text-2xl font-medium tracking-tight transition-colors first:mt-0', className)}>
			{children}
		</h2>
	)
}

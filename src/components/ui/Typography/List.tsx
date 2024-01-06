import { cn } from '@/lib/utils'

type Props = {
	children: React.ReactNode
	className?: string
}

export function List({ children, className }: Props) {
	return <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)}>{children}</ul>
}

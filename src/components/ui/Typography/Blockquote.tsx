import { cn } from '@/lib/utils'

type Props = {
	children: React.ReactNode
	className?: string
}

export function Blockquote({ children, className }: Props) {
	return <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)}>{children}</blockquote>
}

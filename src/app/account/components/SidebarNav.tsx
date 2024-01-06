'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon, LucideProps, User2, UserCircle, UserCircle2 } from 'lucide-react'
import { Icons } from '@/components/Icons'

const links: {
	title: string
	href: string
	Icon: LucideIcon | ((props: LucideProps) => JSX.Element)
}[] = [
	{
		title: 'Account',
		href: '/account/',
		Icon: UserCircle2
	},
	{
		title: 'Decks',
		href: '/account/decks',
		Icon: Icons.Cards
	}
]

const SidebarNav = () => {
	const segment = useSelectedLayoutSegment()

	const isSelected = useCallback((href: string) => segment === (href.split('/').pop() || null), [segment])

	return (
		<nav>
			<ul className='flex flex-col gap-2'>
				{links.map(link => (
					<li key={link.href}>
						<Link
							href={link.href}
							className={cn(
								'relative flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground duration-300 hover:text-secondary-foreground',
								isSelected(link.href) && 'font-medium text-secondary-foreground'
							)}>
							<link.Icon className='h-3.5 w-3.5' />
							<span className=''>{link.title}</span>
							{isSelected(link.href) ? (
								<motion.div
									className='absolute inset-0 -z-10 rounded-md bg-secondary'
									aria-hidden
									layoutId='highlight'
								/>
							) : null}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}

export default SidebarNav

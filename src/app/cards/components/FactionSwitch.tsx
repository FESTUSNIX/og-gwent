'use client'

import { FACTIONS } from '@/constants/FACTIONS'
import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

type Props = {}

export const FactionSwitch = (props: Props) => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const currentFaction = searchParams.get('faction') ?? FACTIONS[0].slug

	const [isPending, startTransition] = useTransition()

	const createQueryString = useCallback(
		(queries: { [key: string]: string | undefined }) => {
			const params = new URLSearchParams(searchParams as any)

			Object.entries(queries).map(([key, value]) => {
				if (value === undefined || value === null) return params.delete(key)

				return params.set(key, value)
			})

			return params.toString()
		},
		[searchParams]
	)

	return (
		<div className='flex items-center gap-4'>
			{FACTIONS.map(faction => (
				<button
					key={faction.slug}
					onClick={() => {
						const updatedQueryString = createQueryString({
							faction: faction.slug
						})

						startTransition(() => {
							router.push(pathname + '?' + updatedQueryString, {
								scroll: false
							})
						})
					}}
					className={cn('py-1 hover:underline', faction.slug === currentFaction && 'font-semibold underline')}>
					<span>{faction.name}</span>
				</button>
			))}
		</div>
	)
}

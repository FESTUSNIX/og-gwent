'use client'

import { Icons } from '@/components/Icons'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { cn } from '@/lib/utils'
import { Sword } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useTransition } from 'react'

type Props = {
	className?: string
	paramName?: string
}

const cardTypes = ['all', ...ROW_TYPES]

export const CardTypeSwitch = ({ className, paramName = 'type' }: Props) => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const currentType = searchParams.get(paramName) ?? cardTypes[0]

	const [isPending, startTransition] = useTransition()

	const createQueryString = useCallback(
		(queries: { [key: string]: string | undefined }) => {
			const params = new URLSearchParams(searchParams)

			Object.entries(queries).map(([key, value]) => {
				if (value === undefined || value === null) return params.delete(key)

				return params.set(key, value)
			})

			return params.toString()
		},
		[searchParams]
	)

	return (
		<div className={cn('flex items-center gap-10', className)}>
			{cardTypes.map(type => (
				<button
					key={type}
					onClick={() => {
						const updatedQueryString = createQueryString({ [paramName]: type })

						startTransition(() => {
							router.push(pathname + '?' + updatedQueryString, {
								scroll: false
							})
						})
					}}
					className={cn('cursor-pointer p-2 text-muted', type === currentType && 'text-foreground')}>
					<span className='h-10 w-10'>
						{type === 'all' && <Icons.Cards className='h-[inherit] w-[inherit] stroke-black' />}
						{type === 'melee' && <Sword className='h-[inherit] w-[inherit]' />}
						{type === 'range' && <Icons.BowArrow className='h-[inherit] w-[inherit]' />}
						{type === 'siege' && <Icons.Catapult className='h-[inherit] w-[inherit]' />}
					</span>
				</button>
			))}
		</div>
	)
}

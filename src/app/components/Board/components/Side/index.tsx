import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { cn } from '@/lib/utils'
import { Player } from '@/types/Player'
import React from 'react'

type Props = {
	player: Player
	side: 'host' | 'opponent'
}

export const Side = ({ player, side }: Props) => {
	return (
		<div className={cn('grid grid-rows-3 gap-1')}>
			{ROW_TYPES.map((row, i) => (
				<div key={row} className={cn('flex grow items-center')} style={{ order: side === 'opponent' ? -i : i }}>
					<div className='flex aspect-square h-full w-auto items-center justify-center bg-stone-800'>SLOT</div>
					<div className='flex h-full w-full grow items-center justify-center bg-stone-700'>{row}</div>
				</div>
			))}
		</div>
	)
}

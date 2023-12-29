import { Player } from '@/types/Player'
import React from 'react'

type Props = {
	player: Player
}

export const Hand = ({ player }: Props) => {
	return (
		<div className='h-44 w-full border-t bg-stone-700'>
			<div className='flex h-full w-full items-center justify-center gap-2'>CARDS IN HAND</div>
		</div>
	)
}

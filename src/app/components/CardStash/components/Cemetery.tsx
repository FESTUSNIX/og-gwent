import { Player } from '@/types/Player'
import React from 'react'

type Props = Pick<Player, 'deck'> & { side: 'host' | 'opponent' }

export const Cemetery = ({ deck, side }: Props) => {
	return <div className='flex aspect-[45/60]  w-28 items-center justify-center bg-stone-900'>Cemetery</div>
}

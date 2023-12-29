import { FactionType } from '@/types/Faction'
import { Player } from '@/types/Player'
import React from 'react'

type Props = Pick<Player, 'deck'> & { side: 'host' | 'opponent'; faction: FactionType }

export const Deck = ({ deck, side, faction }: Props) => {
	return <div className='flex aspect-[45/60]  w-28 items-center justify-center bg-stone-900'>Deck - {deck.length}</div>
}

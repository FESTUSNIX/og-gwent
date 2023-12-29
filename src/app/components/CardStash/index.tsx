import React from 'react'
import { Cemetery } from './components/Cemetery'
import { Deck } from './components/Deck'
import { Player } from '@/types/Player'

type Props = {
	player: Player
	side: 'host' | 'opponent'
}

export const CardStash = ({ player, side }: Props) => {
	return (
		<div className='flex items-center justify-between gap-10'>
			<Cemetery deck={player.deck} side={side} />
			<Deck deck={player.deck} side={side} faction={player.faction} />
		</div>
	)
}

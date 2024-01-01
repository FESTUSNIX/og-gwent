import { GamePlayer } from '@/types/Game'
import { Deck } from './components/Deck'
import { DiscardPile } from './components/DiscardPile'

type Props = {
	player: GamePlayer
	side: 'host' | 'opponent'
}

export const CardPiles = ({ player, side }: Props) => {
	return (
		<div className='flex items-center justify-between gap-12 pr-8'>
			<DiscardPile discardPile={player.discardPile} side={side} />
			<Deck deck={player.deck} side={side} faction={player.faction} />
		</div>
	)
}

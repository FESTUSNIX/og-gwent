import { cn } from '@/lib/utils'
import { GamePlayer } from '@/types/Game'
import { Deck } from './components/Deck'
import { DiscardPile } from './components/DiscardPile'

type Props = {
	player: GamePlayer
	side: 'host' | 'opponent'
}

export const CardPiles = ({ player, side }: Props) => {
	return (
		<div
			className={cn(
				'flex items-center justify-between gap-6 @6xl:gap-14 pr-6 @6xl:flex-row',
				side === 'host' ? 'flex-col' : 'flex-col-reverse'
			)}>
			<DiscardPile discardPile={player.discardPile} side={side} />
			<Deck deck={player.deck} side={side} faction={player.faction} />
		</div>
	)
}

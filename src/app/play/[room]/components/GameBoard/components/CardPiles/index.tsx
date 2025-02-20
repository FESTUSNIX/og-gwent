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
			className={cn('flex w-full flex-row items-center justify-between gap-[25%] pr-[9%]', side === 'host' ? '' : '')}>
			<DiscardPile discardPile={player.discardPile} side={side} />
			<Deck deck={player.deck} side={side} faction={player.faction} />
		</div>
	)
}

import { GamePlayer } from '@/types/Game'

type Props = Pick<GamePlayer, 'discardPile'> & { side: 'host' | 'opponent' }

export const DiscardPile = ({ discardPile, side }: Props) => {
	return (
		<div className='flex aspect-[45/60]  w-28 items-center justify-center bg-stone-900'>
			Discard - {discardPile.length}
		</div>
	)
}

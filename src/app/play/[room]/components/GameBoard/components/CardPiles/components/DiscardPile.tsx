import { Card } from '@/components/Card'
import { CardsPreview, CardsPreviewTrigger } from '@/components/CardsPreview'
import { GamePlayer } from '@/types/Game'

type Props = Pick<GamePlayer, 'discardPile'> & { side: 'host' | 'opponent' }

export const DiscardPile = ({ discardPile, side }: Props) => {
	discardPile = discardPile.slice().reverse()

	return (
		<div className='flex aspect-[45/60] w-28 items-center justify-center bg-stone-900 p-2'>
			{discardPile.length > 0 && (
				<CardsPreview cards={discardPile}>
					<CardsPreviewTrigger index={0} className='h-full w-full'>
						<Card card={discardPile[0]} mode='game' />
					</CardsPreviewTrigger>
				</CardsPreview>
			)}
		</div>
	)
}

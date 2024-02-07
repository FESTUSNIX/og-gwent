import { Card } from '@/components/Card'
import { CardsPreview, CardsPreviewTrigger } from '@/components/CardsPreview'
import { GamePlayer } from '@/types/Game'

type Props = Pick<GamePlayer, 'discardPile'> & { side: 'host' | 'opponent' }

export const DiscardPile = ({ discardPile: _discardPile, side }: Props) => {
	const discardPile = _discardPile.toReversed()

	return (
		<div className='relative flex aspect-[45/60] h-[8.5rem] items-center justify-center bg-stone-900 p-2'>
			<div className='relative z-10 h-full w-full'>
				{discardPile.length > 0 && (
					<CardsPreview cards={discardPile}>
						{discardPile.map((card, i) => (
							<CardsPreviewTrigger
								key={i}
								index={0}
								className='absolute h-full w-full'
								style={{
									transform: `translate(-${i * 1.5}px, -${i * 1.5}px)`
								}}>
								<Card card={_discardPile[i]} mode='game' />
							</CardsPreviewTrigger>
						))}
					</CardsPreview>
				)}
			</div>

			<div
				style={{ backgroundImage: `url('/game/board/discard_pile_icon.png')` }}
				className='absolute -right-0.5 top-1/2 aspect-[51/44] h-[25%] w-auto -translate-y-1/2 translate-x-full bg-contain bg-no-repeat'
			/>

			<div
				style={{ backgroundImage: `url('/game/board/card_pile.png')` }}
				className='absolute z-0 h-full w-full bg-cover bg-no-repeat'
			/>
		</div>
	)
}

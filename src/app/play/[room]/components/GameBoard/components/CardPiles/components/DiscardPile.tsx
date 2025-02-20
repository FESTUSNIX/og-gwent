import { Card } from '@/components/Card'
import { CardsPreview, CardsPreviewTrigger } from '@/components/CardsPreview'
import { cn } from '@/lib/utils'
import { GamePlayer } from '@/types/Game'

type Props = Pick<GamePlayer, 'discardPile'> & { side: 'host' | 'opponent' }

export const DiscardPile = ({ discardPile: _discardPile, side }: Props) => {
	const discardPile = _discardPile.toReversed()

	return (
		<div className='relative flex aspect-[45/60] w-[6.5rem] items-center justify-center p-2 @6xl:h-[8.5rem] @6xl:w-auto'>
			<div className='relative z-10 h-full w-full'>
				{discardPile.length > 0 && (
					<CardsPreview cards={discardPile}>
						{discardPile.map((card, i) => (
							<CardsPreviewTrigger
								key={i}
								index={0}
								className='absolute h-full w-full'
								style={{
									transform: `translate(-${i * 0.6}px, -${i * 0.6}px)`
								}}>
								<Card card={_discardPile[i]} mode='game' useLayoutAnimation />
							</CardsPreviewTrigger>
						))}
					</CardsPreview>
				)}
			</div>

			<div
				style={{ backgroundImage: `url('/game/board/discard_pile_icon.png')` }}
				className={cn(
					'absolute left-1/2 aspect-[51/44] h-[25%] w-auto -translate-x-1/2 bg-contain bg-no-repeat @6xl:-right-0.5 @6xl:left-auto @6xl:top-1/2 @6xl:-translate-y-1/2 @6xl:translate-x-full @6xl:rotate-0',
					side === 'host'
						? 'top-0 -mt-1 -translate-y-full -rotate-90 scale-y-[-1] @6xl:mt-0 @6xl:scale-y-100'
						: 'bottom-0 -mb-1 translate-y-full rotate-90 @6xl:mb-0'
				)}
			/>

			<div
				style={{ backgroundImage: `url('/game/board/card_pile.png')` }}
				className='absolute z-0 h-full w-full bg-cover bg-no-repeat'
			/>
		</div>
	)
}

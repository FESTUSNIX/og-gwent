import { Card } from '@/types/Card'

type Props = {
	deck: Card[]
}

export const DeckDetails = ({ deck }: Props) => {
	return (
		<div className='flex flex-col items-center gap-4'>
			<div className='text-center'>
				<p className='text-sm text-muted-foreground'>Total cards in deck</p>
				<p>{deck.length}</p>
			</div>
			{/* <div className='text-center'>
				<p className='text-sm text-muted-foreground'>Number of Unit cards</p>
				<p>22</p>
			</div> */}
			{/* <div className='text-center'>
				<p className='text-sm text-muted-foreground'>Special Cards</p>
				<p>8/10</p>
			</div> */}
			<div className='text-center'>
				<p className='text-sm text-muted-foreground'>Total Unit Card Strength</p>
				<p>{deck.reduce((acc, card) => acc + card.strength, 0)}</p>
			</div>
			<div className='text-center'>
				<p className='text-sm text-muted-foreground'>Hero Cards</p>
				<p>{deck.filter(card => card.isHero).length}</p>
			</div>
		</div>
	)
}

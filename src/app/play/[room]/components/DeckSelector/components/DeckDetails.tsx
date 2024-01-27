import { Card } from '@/types/Card'

type Props = {
	deck: Card[]
}

export const DeckDetails = ({ deck: _deck }: Props) => {
	const deck = _deck.flatMap(card => Array.from({ length: card.amount ?? 1 }, () => ({ ...card, amount: 1 })))

	return (
		<div className='flex flex-col items-center gap-4'>
			<div className='text-center'>
				<p className='text-sm text-muted-foreground'>Total cards in deck</p>
				<p>{deck.length}</p>
			</div>
			<div className='text-center'>
				<p className='text-sm text-muted-foreground'>Number of Unit cards</p>
				<p>{deck.filter(card => ['unit', 'hero'].includes(card.type)).length}</p>
			</div>
			<div className='text-center'>
				<p className='text-sm text-muted-foreground'>Special Cards</p>
				<p>{deck.filter(card => card.type === 'special').length}/10</p>
			</div>
			<div className='text-center'>
				<p className='text-sm text-muted-foreground'>Total Unit Card Strength</p>
				<p>{deck.reduce((acc, card) => acc + (card.strength ?? 0), 0)}</p>
			</div>
			<div className='text-center'>
				<p className='text-sm text-muted-foreground'>Hero Cards</p>
				<p>{deck.filter(card => card.type === 'hero').length}</p>
			</div>
		</div>
	)
}

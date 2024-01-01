'use client'

import { Card as CardUI } from '@/components/Card'
import { ConditionalWrapper } from '@/components/ConditionalWrapper'
import { cn } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import { createPortal } from 'react-dom'

type Props = {
	card: CardType
	setSelectedCard: (card: CardType) => void
	selectedCard: CardType | null
}

export const Card = ({ card, selectedCard, setSelectedCard }: Props) => {
	const isPreviewing = selectedCard?.id === card.id

	const handleCardClick = () => {
		setSelectedCard(card)
	}

	return (
		<>
			<ConditionalWrapper
				condition={isPreviewing}
				wrapper={children => createPortal(children, document.getElementById('card-preview-container')!)}>
				<button
					onClick={handleCardClick}
					className={cn(
						'relative h-full w-full max-w-full',
						isPreviewing ? 'absolute aspect-[8/15] h-auto w-full py-6' : 'duration-100 group-hover:mb-12'
					)}>
					<CardUI card={card} mode={isPreviewing ? 'preview' : 'game'} className={cn('border', isPreviewing && '')} />
				</button>
			</ConditionalWrapper>
		</>
	)
}

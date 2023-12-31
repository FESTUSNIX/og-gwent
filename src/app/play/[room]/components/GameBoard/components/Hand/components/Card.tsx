'use client'

import { Card as CardUI } from '@/components/Card'
import { ConditionalWrapper } from '@/components/ConditionalWrapper'
import { cn } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useOnClickOutside } from 'usehooks-ts'

type Props = {
	card: CardType
	setSelectedCard: (card: CardType | null) => void
	selectedCard: CardType | null
	disabled?: boolean
}

export const Card = ({ card, selectedCard, setSelectedCard, disabled }: Props) => {
	const cardRef = useRef(null)

	const isPreviewing = selectedCard?.id === card.id

	const handleCardClick = () => {
		setSelectedCard(card)
	}

	const handleClickOutside = () => {
		setSelectedCard(null)
	}

	useOnClickOutside(cardRef, handleClickOutside, 'mouseup')

	return (
		<>
			<ConditionalWrapper
				condition={isPreviewing}
				wrapper={children => createPortal(children, document.getElementById('card-preview-container')!)}>
				<button
					ref={isPreviewing ? cardRef : null}
					onClick={handleCardClick}
					disabled={disabled}
					className={cn(
						'relative h-full w-full max-w-full',
						isPreviewing ? 'absolute aspect-[8/15] h-auto w-full py-6' : 'duration-100 group-hover:mb-10'
					)}>
					<CardUI card={card} mode={isPreviewing ? 'preview' : 'game'} className={cn('border', isPreviewing && '')} />
				</button>
			</ConditionalWrapper>
		</>
	)
}

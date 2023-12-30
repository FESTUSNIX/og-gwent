'use client'

import { Card } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { Card as CardType } from '@/types/Card'
import { FactionType } from '@/types/Faction'
import { useEffect, useState } from 'react'
import { useDebounce } from 'usehooks-ts'
import { CardTypeSwitch } from './CardTypeSwitch'
import { DeckDetails } from './DeckDetails'
import { LeaderCardSelector } from './LeaderCardSelector'
import { toast } from 'sonner'

type Props = {
	cards: CardType[]
	currentFaction: FactionType
	collectionCardTypeParam: string
	inDeckCardTypeParam: string
}

export const ClientDeckSelector = ({ cards, currentFaction, collectionCardTypeParam, inDeckCardTypeParam }: Props) => {
	const [selectedDeck, setSelectedDeck] = useState<CardType[]>([])
	const debouncedSelectedDeck = useDebounce(selectedDeck, 1000)

	useEffect(() => {
		if (debouncedSelectedDeck.length === 0) return

		const selectedDeckString = JSON.stringify(debouncedSelectedDeck)
		localStorage.setItem(`deck-${currentFaction}`, selectedDeckString)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSelectedDeck])

	useEffect(() => {
		setSelectedDeck([])

		const selectedDeckString = localStorage.getItem(`deck-${currentFaction}`)

		if (selectedDeckString) {
			const selectedDeck = JSON.parse(selectedDeckString)
			setSelectedDeck(selectedDeck)
		}
	}, [currentFaction])

	return (
		<div className='grid grid-cols-[1fr_auto_1fr]'>
			<section>
				<CardTypeSwitch className='sticky top-0 z-10 mb-4 bg-background py-4' paramName='collection_card_type' />

				<ul className='grid max-h-full grid-cols-3 gap-4 overflow-y-hidden'>
					{cards
						.filter(
							c =>
								c.factions.includes(currentFaction) &&
								(collectionCardTypeParam === 'all' || c.type === collectionCardTypeParam) &&
								!selectedDeck.find(card => card.id === c.id)
						)
						.map(card => (
							<button
								key={card.id}
								onClick={() => {
									setSelectedDeck(prevDeck => [...prevDeck, card])
								}}>
								<Card card={card} mode='preview' />
							</button>
						))}
				</ul>
			</section>

			<section className='sticky top-16 mt-16 h-max px-16 py-8'>
				<div className='flex flex-col items-center'>
					<div className='mb-8'>
						<h3 className='mb-4 text-center'>Leader</h3>
						<LeaderCardSelector />
					</div>

					<DeckDetails deck={selectedDeck} />

					<div className='mt-8'>
						<Button
							variant={'secondary'}
							size={'sm'}
							onClick={() => {
								toast('Game started!', {
									description: (
										<div className='flex flex-col'>
											<p className='font-bold'>Your deck:</p>
											{selectedDeck.map(card => (
												<p key={card.id}>{card.name}</p>
											))}
										</div>
									)
								})
							}}>
							Start game
						</Button>
					</div>
				</div>
			</section>

			<section>
				<CardTypeSwitch className='sticky top-0 z-10 mb-4 bg-background py-4' paramName='in_deck_card_type' />

				<ul className='grid grid-cols-3 gap-4 overflow-y-hidden'>
					{cards
						.filter(
							c =>
								c.factions.includes(currentFaction) &&
								(inDeckCardTypeParam === 'all' || c.type === inDeckCardTypeParam) &&
								selectedDeck.find(card => card.id === c.id)
						)
						.map(card => (
							<button
								key={card.id}
								onClick={() => {
									setSelectedDeck(prevDeck => [...prevDeck.filter(c => c.id !== card.id)])
								}}>
								<Card key={card.id} card={card} mode='preview' />
							</button>
						))}
				</ul>
			</section>
		</div>
	)
}

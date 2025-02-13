'use client'

import { Card } from '@/components/Card'
import { Card as CardType } from '@/types/Card'
import { FactionType } from '@/types/Faction'
import { Tables } from '@/types/supabase'
import { useEffect, useState } from 'react'
import { useDebounce } from 'usehooks-ts'
import useGameContext from '../../../hooks/useGameContext'
import { CardTypeSwitch } from './CardTypeSwitch'
import { DeckDetails } from './DeckDetails'
import { GameStatusBar } from './GameStatusBar'
import { LeaderCardSelector } from './LeaderCardSelector'

type Props = {
	cards: CardType[]
	currentFaction: FactionType
	collectionCardTypeParam: string
	inDeckCardTypeParam: string
	user: Pick<Tables<'profiles'>, 'id' | 'username'>
}

export const ClientDeckSelector = ({
	cards,
	currentFaction,
	collectionCardTypeParam,
	inDeckCardTypeParam,
	user
}: Props) => {
	const { gameState } = useGameContext()

	const [selectedDeck, setSelectedDeck] = useState<CardType[]>([])
	const debouncedSelectedDeck = useDebounce(selectedDeck, 1000)

	const currentPlayer = gameState.players.find(p => p.id === user.id)

	const accepted = currentPlayer?.gameStatus === 'accepted'

	const calculateAmount = (card: CardType) => {
		const amountInDeck = selectedDeck.find(c => c.id === card.id)?.amount ?? 0
		const originalAmount = cards.find(c => c.id === card.id)?.amount ?? 1

		return originalAmount - amountInDeck
	}

	useEffect(() => {
		if (debouncedSelectedDeck.length === 0) return

		const selectedDeckString = JSON.stringify(debouncedSelectedDeck.map(c => ({ id: c.id, amount: c.amount })))
		localStorage.setItem(`deck-${currentFaction}`, selectedDeckString)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSelectedDeck])

	useEffect(() => {
		setSelectedDeck([])

		const selectedDeckString = localStorage.getItem(`deck-${currentFaction}`)

		if (selectedDeckString) {
			const savedDeck: { id: number; amount: number }[] = JSON.parse(selectedDeckString)

			const deck = savedDeck
				.map(({ id, amount }) => {
					const cardData = cards.find(c => c.id === id)
					if (!cardData) return
					return { ...cardData, amount }
				})
				.filter(c => c !== undefined) as CardType[]

			setSelectedDeck(deck)
		}
	}, [currentFaction, cards])

	const filterCards = (c: CardType, categoryParam: string, filterFor: 'collection' | 'selected') => {
		if (!c.factions.includes('neutral') && !c.factions.includes(currentFaction)) return false

		if (filterFor === 'collection' && selectedDeck.find(card => c.id === card.id) && calculateAmount(c) === 0)
			return false
		if (filterFor === 'selected' && (!selectedDeck.find(card => c.id === card.id) || c.amount === 0)) return false

		if (categoryParam === 'hero') return c.type === 'hero'
		if (categoryParam === 'special') return c.type === 'special'
		if (categoryParam === 'weather') return c.type === 'weather'

		if (categoryParam === 'all' || c.row === categoryParam) return true

		return false
	}

	return (
		<div className='grid grid-cols-[1fr_auto_1fr]'>
			<section>
				<CardTypeSwitch
					className='sticky top-0 z-10 mb-4 -translate-y-px bg-background/75 py-4 backdrop-blur-md'
					paramName='collection_card_type'
				/>

				<ul className='grid max-h-full grid-cols-3 gap-4 overflow-y-hidden'>
					{cards
						.filter(c => filterCards(c, collectionCardTypeParam, 'collection'))
						.sort((a, b) => {
							if (a.strength === b.strength) {
								if (a.name < b.name) return -1
								if (a.name > b.name) return 1
								return 0
							}

							if (a.strength === undefined) return -1
							if (b.strength === undefined) return 1

							return a.strength - b.strength
						})
						.map(card => (
							<button
								key={card.id}
								onClick={() => {
									const cardExists = selectedDeck.find(c => c.id === card.id)

									if (cardExists) {
										const updatedDeck = selectedDeck.map(c =>
											c.id === card.id ? { ...c, amount: (c.amount ?? 1) + 1 } : c
										)

										return setSelectedDeck(updatedDeck)
									}

									setSelectedDeck(prevDeck => [...prevDeck, { ...card, amount: 1 }])
								}}
								disabled={accepted}>
								<Card
									card={{ ...card, amount: calculateAmount(card) }}
									mode='preview'
									forceBanner={currentFaction}
									displayAmount
								/>
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
				</div>
			</section>

			<section>
				<CardTypeSwitch
					className='sticky top-0 z-10 mb-4 -translate-y-px bg-background/75 py-4 backdrop-blur-md'
					paramName='in_deck_card_type'
				/>

				<ul className='grid grid-cols-3 gap-4 overflow-y-hidden'>
					{selectedDeck
						.filter(c => filterCards(c, inDeckCardTypeParam, 'selected'))
						.map(card => (
							<button
								key={card.id}
								onClick={() => {
									if (card.amount === 1 || card.amount === 0) {
										return setSelectedDeck(prevDeck => prevDeck.filter(c => c.id !== card.id))
									}

									setSelectedDeck(prevDeck =>
										prevDeck.map(c => (c.id === card.id ? { ...c, amount: (c.amount ?? 1) - 1 } : c))
									)
								}}
								disabled={accepted}>
								<Card key={card.id} card={card} mode='preview' forceBanner={currentFaction} displayAmount />
							</button>
						))}
				</ul>
			</section>

			<GameStatusBar accepted={accepted} selectedDeck={selectedDeck} player={user} currentFaction={currentFaction} />
		</div>
	)
}

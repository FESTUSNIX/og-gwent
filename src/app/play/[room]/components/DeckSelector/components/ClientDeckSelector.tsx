'use client'

import { Card } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { Card as CardType } from '@/types/Card'
import { FactionType } from '@/types/Faction'
import { Tables } from '@/types/supabase'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from 'usehooks-ts'
import { initialPlayer } from '../../../context/GameContext'
import useGameContext from '../../../hooks/useGameContext'
import { CardTypeSwitch } from './CardTypeSwitch'
import { DeckDetails } from './DeckDetails'
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
	const { gameState, updatePlayerState } = useGameContext()

	const [selectedDeck, setSelectedDeck] = useState<CardType[]>([])
	const debouncedSelectedDeck = useDebounce(selectedDeck, 1000)

	const minDeckLength = 18
	const currentPlayer = gameState.players.find(p => p.id === user.id)

	const accepted = currentPlayer?.gameStatus === 'accepted'

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
								}}
								disabled={accepted}>
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
								toast('Accepted game!')

								updatePlayerState(user.id, {
									...initialPlayer,
									gameStatus: !accepted ? 'accepted' : 'select-deck',
									faction: currentFaction,
									deck: selectedDeck
								})
							}}
							disabled={selectedDeck.length < minDeckLength}>
							{!accepted ? 'Start game' : 'Cancel'}
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
								}}
								disabled={accepted}>
								<Card key={card.id} card={card} mode='preview' />
							</button>
						))}
				</ul>
			</section>
		</div>
	)
}

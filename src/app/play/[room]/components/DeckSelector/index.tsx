'use client'

import { FactionSwitch } from '@/app/cards/components/FactionSwitch'
import { FACTIONS } from '@/constants/FACTIONS'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { getFirstParamValue } from '@/lib/utils'
import { Card } from '@/types/Card'
import { Suspense } from 'react'
import { ClientDeckSelector } from './components/ClientDeckSelector'
import useGameContext from '../../hooks/useGameContext'

type Props = {
	cards: Card[]
	searchParams: { [key: string]: string | string[] | undefined }
}

const cardTypesOptions = [
	{
		value: 'all',
		label: 'All cards'
	},
	...ROW_TYPES.map(type => ({
		value: type,
		label: type.charAt(0).toUpperCase() + type.slice(1)
	}))
]

export const DeckSelector = ({ cards, searchParams }: Props) => {
	const { gameState } = useGameContext()

	if (gameState.players.filter(p => p.gameStatus !== 'select-deck').length === 2) return null

	const factionParam = getFirstParamValue(searchParams.faction, FACTIONS[0].slug)
	const currentFaction = FACTIONS.find(f => f.slug === factionParam)?.slug ?? FACTIONS[0].slug

	const inDeckCardTypeParam = getFirstParamValue(searchParams.in_deck_card_type, cardTypesOptions[0].value)!
	const collectionCardTypeParam = getFirstParamValue(searchParams.collection_card_type, cardTypesOptions[0].value)!

	return (
		<div className='mx-auto grid max-w-screen-2xl px-12 py-8'>
			<div className='mx-auto mb-4 flex items-center justify-center'>
				<Suspense>
					<FactionSwitch />
				</Suspense>
			</div>

			<div className='mb-4 flex items-center justify-between'>
				<div>
					<h3 className='text-2xl'>Card Collection</h3>
					<h4 className='text-lg uppercase'>
						{cardTypesOptions.find(c => c.value === collectionCardTypeParam)?.label}
					</h4>
				</div>

				<p className='text-muted-foreground'>Draw a card from your deck whenever you win a round.</p>

				<div className='text-end'>
					<h3 className='text-2xl'>Cards in Deck</h3>
					<h4 className='text-lg uppercase'>{cardTypesOptions.find(c => c.value === inDeckCardTypeParam)?.label}</h4>
				</div>
			</div>

			<ClientDeckSelector
				cards={cards}
				currentFaction={currentFaction}
				collectionCardTypeParam={collectionCardTypeParam}
				inDeckCardTypeParam={inDeckCardTypeParam}
			/>
		</div>
	)
}

'use client'

import { FACTIONS } from '@/constants/FACTIONS'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { getFirstParamValue } from '@/lib/utils'
import { Card } from '@/types/Card'
import { Tables } from '@/types/supabase'
import { Suspense } from 'react'
import useGameContext from '../../hooks/useGameContext'
import { ClientDeckSelector } from './components/ClientDeckSelector'
import { FactionSwitch } from './components/FactionSwitch'
import { useLocalStorage } from 'usehooks-ts'

type Props = {
	cards: Card[]
	searchParams: { [key: string]: string | string[] | undefined }
	user: Pick<Tables<'profiles'>, 'id' | 'username'>
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

export const DeckSelector = ({ cards, searchParams, user }: Props) => {
	const { gameState } = useGameContext()
	const [initialFaction, setInitialFaction] = useLocalStorage('recent-faction', FACTIONS[0].slug)

	if (gameState.players.length === 2 && !(gameState.players.filter(p => p?.gameStatus === 'select-deck').length >= 1))
		return null

	const factionParam = getFirstParamValue(searchParams.faction, initialFaction)
	const currentFaction = FACTIONS.find(f => f.slug === factionParam)?.slug ?? initialFaction

	const inDeckCardTypeParam = getFirstParamValue(searchParams.in_deck_card_type, cardTypesOptions[0].value)!
	const collectionCardTypeParam = getFirstParamValue(searchParams.collection_card_type, cardTypesOptions[0].value)!

	return (
		<main className='relative z-10 mx-auto my-auto flex h-full max-h-[980px] w-full max-w-[1740px] grow flex-col bg-background'>
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

					<p className='text-muted-foreground'>TODO: Faction passive ability</p>

					<div className='text-end'>
						<h3 className='text-2xl'>Cards in Deck</h3>
						<h4 className='text-lg uppercase'>{cardTypesOptions.find(c => c.value === inDeckCardTypeParam)?.label}</h4>
					</div>
				</div>

				<ClientDeckSelector
					cards={cards}
					user={user}
					currentFaction={currentFaction}
					collectionCardTypeParam={collectionCardTypeParam}
					inDeckCardTypeParam={inDeckCardTypeParam}
				/>
			</div>
		</main>
	)
}

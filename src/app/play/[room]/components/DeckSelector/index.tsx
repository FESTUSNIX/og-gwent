import { FactionSwitch } from '@/app/cards/components/FactionSwitch'
import { FACTIONS } from '@/constants/FACTIONS'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { getFirstParamValue } from '@/lib/utils'
import { getCards } from '@/queries/cards'
import { Player } from '@/types/Player'
import { Suspense } from 'react'
import { ClientDeckSelector } from './components/ClientDeckSelector'

export const host: Player = {
	id: 0,
	name: 'Geralt of Rivia',
	faction: 'northern-realms',
	deck: [0, 1, 2, 3]
}
export const opponent: Player = {
	id: 1,
	name: 'Yennefer',
	faction: 'nilfgaard',
	deck: [4, 5]
}

type Props = {
	roomId: string
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

export const DeckSelector = async ({ roomId, searchParams }: Props) => {
	const cards = await getCards()

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

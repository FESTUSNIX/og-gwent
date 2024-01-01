import { Player } from '@/types/Player'
import { DeckSelector } from './components/DeckSelector'
import { GameContextProvider } from './context/GameContext'
import { GameStateDisplay } from './components/GameStateDisplay'
import { getCards } from '@/queries/cards'
import { Card } from '@/types/Card'
import { GameBoard } from './components/GameBoard'

export const host: Player = {
	id: 0,
	name: 'Geralt of Rivia',
	faction: 'northern-realms'
}
export const opponent: Player = {
	id: 1,
	name: 'Yennefer',
	faction: 'nilfgaard'
}

type Props = {
	params: { room: string }
	searchParams: { [key: string]: string | string[] | undefined }
}

const RoomPage = async ({ params: { room }, searchParams }: Props) => {
	const cards = await getCards()

	return (
		<main className='flex grow flex-col'>
			<GameContextProvider>
				<DeckSelector searchParams={searchParams} cards={cards} />

				<GameBoard />

				<GameStateDisplay />
			</GameContextProvider>
		</main>
	)
}

export default RoomPage

export const opponentMockDeck: Card[] = [
	{
		name: 'Menno Coehorn',
		strength: 10,
		type: 'melee',
		factions: ['nilfgaard'],
		isHero: true,
		id: 45
	},
	{
		id: 4,
		name: 'Fringilla Vigo',
		strength: 6,
		isHero: false,
		type: 'range',
		factions: ['nilfgaard']
	},
	{
		name: 'Assire var Anahid',
		strength: 6,
		type: 'range',
		factions: ['nilfgaard'],
		isHero: false,
		id: 43
	},
	{
		name: 'Shilard Fitz-Oesterlen',
		strength: 7,
		type: 'melee',
		factions: ['nilfgaard'],
		isHero: false,
		id: 44
	},
	{
		name: 'Morvran Voorhis',
		strength: 10,
		type: 'siege',
		factions: ['nilfgaard'],
		isHero: true,
		id: 47
	},
	{
		name: 'Vattier de Rideaux',
		strength: 4,
		type: 'melee',
		factions: ['nilfgaard'],
		isHero: false,
		id: 46
	},
	{
		name: 'Stefan Skellen',
		strength: 9,
		type: 'melee',
		factions: ['nilfgaard'],
		isHero: false,
		id: 33
	},
	{
		name: 'Zerrikanian Fire Scorpion',
		strength: 5,
		type: 'siege',
		factions: ['nilfgaard'],
		isHero: false,
		id: 38
	},
	{
		name: 'Tibor Eggebracht',
		strength: 10,
		type: 'range',
		factions: ['nilfgaard'],
		isHero: true,
		id: 36
	},
	{
		name: 'Heavy Zerrikanian Fire Scorpion',
		strength: 10,
		type: 'siege',
		factions: ['nilfgaard'],
		isHero: false,
		id: 34
	}
]

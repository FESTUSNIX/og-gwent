import { supabaseServer } from '@/lib/supabase/supabaseServer'
import { getCards } from '@/queries/cards'
import { Card } from '@/types/Card'
import { Player } from '@/types/Player'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DeckSelector } from './components/DeckSelector'
import { GameBoard } from './components/GameBoard'
import { GameControls } from './components/GameControls'
import { GameContextProvider } from './context/GameContext'
// import { supabase } from '@/lib/supabase/supabase'

const player1: Player = {
	id: 'player-1',
	name: 'Geralt of Rivia',
	faction: 'northern-realms'
}
const player2: Player = {
	id: 'player-2',
	name: 'Yennefer',
	faction: 'nilfgaard'
}

export const mockPlayers = [player1, player2]

type Props = {
	params: { room: string }
	searchParams: { [key: string]: string | string[] | undefined }
}

const RoomPage = async ({ params: { room }, searchParams }: Props) => {
	const supabase = supabaseServer()

	const {
		data: { session }
	} = await supabase.auth.getSession()

	if (!session) {
		return redirect('/login')
	}

	const { data: user } = await supabase
		.from('profiles')
		.select('id, username, avatar_url')
		.eq('id', session?.user.id ?? '')
		.single()

	if (!user) return null
	const cards = await getCards()
	return (
		<main className='relative z-10 flex grow flex-col bg-background'>
			<GameContextProvider roomId={room} userId={user.id}>
				<Suspense>
					<DeckSelector searchParams={searchParams} cards={cards} user={user} />
				</Suspense>

				<GameBoard user={user} />

				<GameControls />
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

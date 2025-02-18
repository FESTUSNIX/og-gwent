import { createClient } from '@/lib/supabase/server'
import { Card } from '@/types/Card'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import cardsJson from '../../../../db/cards.json'
import { DeckSelector } from './components/DeckSelector'
import { GameBoard } from './components/GameBoard'
import { GameControls } from './components/GameControls'
import { GameContextProvider } from './context/GameContext'
import { NoticeProvider } from './context/NoticeContext'

type Props = {
	params: { room: string }
	searchParams: { [key: string]: string | string[] | undefined }
}

const RoomPage = async ({ params: { room }, searchParams }: Props) => {
	const supabase = await createClient()

	const { data: session } = await supabase.auth.getUser()

	if (!session || !session.user) {
		return redirect('/login')
	}

	const { data: user } = await supabase
		.from('profiles')
		.select('id, username, avatar_url, role')
		.eq('id', session?.user.id ?? '')
		.single()

	if (!user) return null

	const { data: roomPlayers } = await supabase.from('room_players').select('playerId').eq('roomId', room)
	const { data: roomExists } = await supabase.from('rooms').select('id').eq('id', room).single()

	const isInRoom = roomPlayers?.find(p => p.playerId === user.id)

	if ((roomPlayers && roomPlayers?.length >= 2 && !isInRoom) || !roomExists) return redirect('/')

	if (!isInRoom) {
		if (!roomExists) {
			console.error('Room does not exist')
			return redirect('/')
		}

		const initialPlayerData = {
			faction: null,
			preview: null,
			gameStatus: 'select-deck',
			hasPassed: false,
			lives: 2,
			deck: [],
			hand: [],
			discardPile: [],
			rows: {
				melee: { cards: [], effect: null, name: 'melee' },
				range: { cards: [], effect: null, name: 'range' },
				siege: { cards: [], effect: null, name: 'siege' }
			}
		}

		const { data } = await supabase
			.from('players')
			.upsert(
				[
					{
						id: user.id,
						name: user.username,
						...initialPlayerData
					}
				],
				{
					onConflict: 'id'
				}
			)
			.eq('id', user.id)
			.select('id')

		if (!data) return

		const { data: roomInsertData } = await supabase
			.from('room_players')
			.insert({
				playerId: user.id,
				roomId: room
			})
			.select('roomId')

		if (!roomInsertData) return
	}

	const cards = cardsJson.cards as Card[]

	return (
		<NoticeProvider>
			<GameContextProvider roomId={room} userId={user.id}>
				<Suspense>
					<DeckSelector searchParams={searchParams} cards={cards} user={user} />
				</Suspense>

				<GameBoard user={user} roomId={room} />

				{user.role === 'ADMIN' && <GameControls roomId={room} />}
			</GameContextProvider>
		</NoticeProvider>
	)
}

export default RoomPage

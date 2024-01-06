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
import cardsJson from '../../../../db/cards.json'
import { toast } from 'sonner'

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

	const { data: roomPlayers } = await supabase.from('room_players').select('playerId').eq('roomId', room)

	const isInRoom = roomPlayers?.find(p => p.playerId === user.id)

	if (roomPlayers && roomPlayers?.length >= 2 && !isInRoom) {
		return redirect('/')
	}

	if (!isInRoom) {
		const { data } = await supabase
			.from('players')
			.insert({
				id: user.id
			})
			.select('id')

		if (!data) return

		const { data: roomInsertData } = await supabase.from('room_players').insert({
			playerId: user.id,
			roomId: room
		})

		if (!roomInsertData) return
	}

	// const cards = await getCards()
	const cards = cardsJson.cards as Card[]

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

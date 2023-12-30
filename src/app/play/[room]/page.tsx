import { Player } from '@/types/Player'
import { DeckSelector } from './components/DeckSelector'

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
	params: { room: string }
	searchParams: { [key: string]: string | string[] | undefined }
}

const RoomPage = async ({ params: { room }, searchParams }: Props) => {
	return (
		<main>
			<DeckSelector searchParams={searchParams} roomId={room} />
		</main>
	)
}

export default RoomPage

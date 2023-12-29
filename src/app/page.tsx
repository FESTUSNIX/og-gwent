import { Player } from '@/types/Player'
import { Board } from './components/Board'
import { CardStash } from './components/CardStash'
import { Hand } from './components/Hand'
import { Sidebar } from './components/Sidebar'

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

export default function Home() {
	return (
		<main className='grid grow grid-cols-[375px_1fr]'>
			<Sidebar host={host} opponent={opponent} />

			<div className='flex h-full border-l bg-stone-600 pb-16 pl-12'>
				<div className='flex h-full grow flex-col'>
					<Board />

					<Hand player={host} />
				</div>

				<div className='flex h-full flex-col items-center justify-between border-l bg-stone-800 px-4 pt-8'>
					<CardStash player={opponent} side='opponent' />
					<CardStash player={host} side='host' />
				</div>
			</div>
		</main>
	)
}

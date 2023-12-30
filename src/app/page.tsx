import { buttonVariants } from '@/components/ui/button'
import { Player } from '@/types/Player'
import Link from 'next/link'

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
		<main className='grid-container py-24'>
			<header className='mx-auto text-center'>
				<h1 className='text-4xl'>Gwent Multiplayer</h1>
				<p className='mt-4 text-muted-foreground'>Play Gwent with your friends online!</p>
			</header>

			<div className='mt-8 flex justify-center'>
				<Link href='/play/test-room' className={buttonVariants()}>
					Create a room
				</Link>
			</div>
		</main>
	)
}

import { JoinGameForm } from '@/components/JoinGameForm'
import { Navbar } from '@/components/Navbar'
import { NewGameShell } from '@/components/NewGameShell'
import { H2 } from '@/components/ui/Typography/H2'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
	const supabase = createServerComponentClient<Database>({
		cookies
	})

	const {
		data: { session }
	} = await supabase.auth.getSession()

	if (!session) {
		redirect('/login')
	}

	const { data: room } = await supabase.from('room_players').select('roomId').eq('playerId', session.user.id).single()

	return (
		<>
			<Navbar />
			<main className='grid-container py-12'>
				<header className='mx-auto text-center'>
					<h1 className='text-3xl font-bold sm:text-4xl md:text-5xl'>Gwent Multiplayer</h1>
					<p className='mt-2 text-xl text-muted-foreground'>Play Gwent with your friends online!</p>
				</header>

				<div className='mx-auto mt-16 flex w-full max-w-lg flex-col items-center gap-16'>
					{!room && (
						<>
							<section className=''>
								<NewGameShell session={session}>
									<Button className='rounded-full px-6 py-7 font-normal md:text-lg'>Create a new room</Button>
								</NewGameShell>
							</section>

							<section className='w-full'>
								<div>
									<H2 className='pb-0'>Join a room</H2>
									<p className='text-muted-foreground'>
										Enter the room code provided by your friend to join their game.
									</p>
								</div>

								<div className='my-6'>
									<JoinGameForm />
								</div>
							</section>
						</>
					)}

					{room && (
						<section className='flex flex-col items-center gap-4'>
							<H2>You are already in a game.</H2>

							<Link href={`/play/${room.roomId}`} className={cn(buttonVariants())}>
								Click here to rejoin.
							</Link>
						</section>
					)}
				</div>
			</main>
		</>
	)
}

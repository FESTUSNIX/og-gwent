import { JoinGameForm } from '@/components/JoinGameForm'
import { Navbar } from '@/components/Navbar'
import { NewGameShell } from '@/components/NewGameShell'
import { H2 } from '@/components/ui/Typography/H2'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
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

	return (
		<>
			<Navbar />
			<main className='grid-container py-12'>
				<header className='mx-auto text-center'>
					<h1 className='text-3xl font-bold sm:text-4xl md:text-5xl'>Gwent Multiplayer</h1>
					<p className='mt-2 text-xl text-muted-foreground'>Play Gwent with your friends online!</p>
				</header>

				<div className='mx-auto mt-16 flex w-full max-w-lg flex-col items-center gap-16'>
					<section className=''>
						<NewGameShell session={session}>
							<Button className='rounded-full px-6 py-7 font-normal md:text-lg'>Create a new room</Button>
						</NewGameShell>
					</section>

					<section className='w-full'>
						<div>
							<H2 className='pb-0'>Join a room</H2>
							<p className='text-muted-foreground'>Enter the room code provided by your friend to join their game.</p>
						</div>

						<div className='my-6'>
							<JoinGameForm />
						</div>
					</section>
				</div>
			</main>
		</>
	)
}

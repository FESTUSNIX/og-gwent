import { buttonVariants } from '@/components/ui/button'
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

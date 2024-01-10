import { cn } from '@/lib/utils'
import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { NewGameShell } from '../NewGameShell'
import { Button, buttonVariants } from '../ui/button'
import AccountDropdown from './components/AccountDropdown'

type Props = {}

export const Navbar = async (props: Props) => {
	const supabase = createServerComponentClient<Database>({
		cookies
	})

	const {
		data: { session }
	} = await supabase.auth.getSession()

	const user = session?.user

	const { data: room } = user
		? await supabase.from('room_players').select('roomId').eq('playerId', user.id).single()
		: { data: null }

	return (
		<nav className='grid-container sticky top-0 z-40 w-full border-b bg-background py-4'>
			<div className='flex items-center justify-between'>
				<Link href={'/'}>
					<div className='text-2xl font-black'>Gwent</div>
				</Link>

				<div className='hidden sm:block'>
					{user && !room && (
						<NewGameShell session={session}>
							<Button className='rounded-full'>Start a new game</Button>
						</NewGameShell>
					)}

					{room && (
						<Link href={`/play/${room.roomId}`} className={cn(buttonVariants(), 'rounded-full')}>
							Continue playing
						</Link>
					)}
				</div>

				<div>
					{user && <AccountDropdown session={session} />}
					{!user && (
						<Link href={'/login'} className={cn(buttonVariants({}), 'rounded-full')}>
							Log in to play
						</Link>
					)}
				</div>
			</div>
		</nav>
	)
}

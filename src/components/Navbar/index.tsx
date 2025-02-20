import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import AccountDropdown from './components/AccountDropdown'

type Props = {}

export const Navbar = async (props: Props) => {
	const supabase = await createClient()

	const { data: session } = await supabase.auth.getUser()

	const user = session?.user

	const { data: room } = user
		? await supabase.from('room_players').select('roomId').eq('playerId', user.id).single()
		: { data: null }

	return (
		<nav className='grid-container sticky top-0 z-40 w-full bg-background/90 backdrop-blur-[2px]'>
			<div className='flex items-center justify-between border-b py-4'>
				<Link href={'/'}>
					<div className='font-heading text-3xl font-black duration-150 hover:text-foreground/80'>Gwent</div>
				</Link>

				<div className='hidden sm:block'>
					{room && (
						<Link href={`/play/${room.roomId}`} className={cn(buttonVariants(), 'rounded-full')}>
							Continue playing
						</Link>
					)}
				</div>

				<div>
					{user && <AccountDropdown userId={user.id} />}
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

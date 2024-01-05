import { cn } from '@/lib/utils'
import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import AccountDropdown from './components/AccountDropdown'

type Props = {}

export const Navbar = async (props: Props) => {
	const supabase = createServerComponentClient<Database>({
		cookies
	})

	const {
		data: { session }
	} = await supabase.auth.getSession()

	return (
		<nav className='grid-container fixed top-0 w-full border-b py-4'>
			<div className='flex items-center justify-between'>
				<Link href={'/'}>
					<div className='text-2xl font-black'>Gwent</div>
				</Link>

				<div>
					<Link href={'play/test-room'} className={cn(buttonVariants({}), 'rounded-full')}>
						Start a new game
					</Link>
				</div>

				<div>
					<AccountDropdown session={session} />
				</div>
			</div>
		</nav>
	)
}

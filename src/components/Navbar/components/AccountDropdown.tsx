import { LogIn, LogOut, User } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Session } from '@supabase/supabase-js'
import Link from 'next/link'
import { SignOutShell } from '@/components/SignOutShell'
import { UserAvatar } from '@/components/UserAvatar'
import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

type Props = {
	session: Session | null
}

const AccountDropdown = async ({ session }: Props) => {
	const supabase = createServerComponentClient<Database>({
		cookies
	})

	const { data, error } = await supabase
		.from('profiles')
		.select(`username, avatar_url`)
		.eq('id', session?.user?.id as string)
		.single()

	const user = data

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className='rounded-full'>
					<UserAvatar
						user={{ avatar_url: user?.avatar_url ?? null, username: user?.username ?? null }}
						className='cursor-pointer border duration-300 hover:shadow'
					/>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-56'>
				<DropdownMenuGroup>
					{user ? (
						<DropdownMenuItem asChild>
							<Link href={'/account'}>
								<User className='mr-2 h-4 w-4' />
								<span>Account</span>
							</Link>
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem asChild>
							<Link href={'/login'}>
								<LogIn className='mr-2 h-4 w-4' />
								<span>Log in</span>
							</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>

				{user && (
					<>
						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<SignOutShell>
									<button className='w-full'>
										<LogOut className='mr-2 h-4 w-4' />
										<span>Log out</span>
									</button>
								</SignOutShell>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default AccountDropdown

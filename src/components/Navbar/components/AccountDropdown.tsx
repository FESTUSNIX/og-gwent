import { SignOutShell } from '@/components/SignOutShell'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/UserAvatar'
import { createClient } from '@/lib/supabase/server'
import { LogIn, LogOut, User } from 'lucide-react'
import Link from 'next/link'

type Props = {
	userId: string
}

const AccountDropdown = async ({ userId }: Props) => {
	const supabase = await createClient()

	const { data: user, error } = await supabase
		.from('profiles')
		.select(`username, avatar_url`)
		.eq('id', userId as string)
		.single()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className='rounded-full'>
					<UserAvatar
						user={{ avatar_url: user?.avatar_url ?? null, username: user?.username ?? null }}
						className='border duration-300 hover:shadow'
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

import { SignOutShell } from '@/components/SignOutShell'
import { H1 } from '@/components/ui/Typography/H1'
import { H2 } from '@/components/ui/Typography/H2'
import { Muted } from '@/components/ui/Typography/Muted'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ManageAccountData } from './components/ManageAccountData'

export default async function AccountPage() {
	const supabase = await createClient()

	const { data: session } = await supabase.auth.getUser()

	if (!session?.user) {
		redirect('/login')
	}

	const { data: user } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url`)
		.eq('id', session.user.id)
		.single()

	if (!user) {
		return <div>Could not find user data.</div>
	}

	return (
		<div className='flex h-full flex-col gap-8'>
			<header>
				<H1>Account</H1>
				<Muted className='max-w-md text-base'>Manage your profile information and login credentials.</Muted>

				<Separator className='mt-4' />
			</header>

			<section className='space-y-2 pb-6'>
				<H2>Details</H2>

				<ManageAccountData user={{ ...user, email: session.user.email }} />
			</section>

			<div className='mt-auto self-end py-6'>
				<SignOutShell>
					<Button variant={'outline'} className='text-destructive hover:border-destructive hover:text-destructive'>
						<LogOut className='mr-2 h-4 w-4' />
						<span>Log out</span>
					</Button>
				</SignOutShell>
			</div>
		</div>
	)
}

import { H1 } from '@/components/ui/Typography/H1'
import { Muted } from '@/components/ui/Typography/Muted'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from './components/LoginForm'
import BgImage from '/public/images/auth-bg.jpg'

type Props = {}

const LoginPage = async (props: Props) => {
	const supabase = await createClient()

	const { data: session } = await supabase.auth.getUser()

	if (session.user) return redirect('/')

	return (
		<main className='ambient-background relative grid h-full grow grid-cols-1'>
			<div className='z-20 row-span-full flex h-full flex-col justify-center px-4 py-24 md:max-lg:col-span-2 lg:px-12'>
				<div className='fixed left-1/2 top-0 z-30 w-full -translate-x-1/2 bg-gradient-to-b from-black/60 to-black/0 pb-4 pt-8'>
					<Link href={'/'} className='mx-auto block w-max text-center font-heading text-3xl font-black text-white'>
						Gwent Multiplayer
					</Link>
				</div>

				<div className='container z-40 max-w-lg rounded-lg bg-background/10 px-6 py-8 shadow-sm backdrop-blur-lg md:shadow-none'>
					<div className='mb-8'>
						<H1 className=''>Log in with your credentials</H1>
					</div>

					<LoginForm />

					<Muted className='mt-4'>
						Don&apos;t have an account?{' '}
						<Link href={'/signup'} className='text-foreground hover:underline'>
							Sign up now
						</Link>
					</Muted>
				</div>

				<div className='fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-black/0 py-6 text-center'>
					<Muted className='text-white'>
						This is a fan-made project for demo purposes. All rights belong to CD Projekt Red.
					</Muted>
				</div>
			</div>
		</main>
	)
}

export default LoginPage

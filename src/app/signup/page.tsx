import { H1 } from '@/components/ui/Typography/H1'
import { Muted } from '@/components/ui/Typography/Muted'
import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignupForm } from './components/SignupForm'
import BgImage from '/public/images/auth-bg.jpg'
import HeadingImg from '/public/images/geralt-in-a-happy-place.jpg'

type Props = {}

const SignupPage = async (props: Props) => {
	const supabase = createServerComponentClient<Database>({ cookies })

	const {
		data: { session }
	} = await supabase.auth.getSession()

	if (session) return redirect('/')

	const heading = 'Create an account to play a round of Gwent'.split(' ')

	return (
		<main className='relative grid h-full grow grid-cols-1 grid-rows-1 md:grid-cols-3 lg:grid-cols-2'>
			<div
				className='absolute inset-0 col-span-1 row-span-full overflow-hidden bg-primary md:relative md:h-full'
				aria-hidden>
				<Image src={BgImage} alt='' priority quality={75} className='absolute inset-0 h-full w-full object-cover' />
				<div className='absolute inset-0 bg-black/30 backdrop-blur-sm' />
				<div className='absolute inset-0 bg-gradient-to-b from-black/50 via-black/0 to-black/50' />

				<div className='absolute left-0 top-0 flex h-full w-full flex-col px-4 py-8 md:relative md:h-full md:justify-between lg:px-12'>
					<Link href={'/'} className='z-30 w-max text-3xl font-black text-[#f5f5f5]'>
						Gwent
					</Link>

					<div className='hidden md:block'>
						<p className='text-sm text-[#f5f5f5]'>In progress...</p>
					</div>
				</div>
			</div>
			<div className='z-20 row-span-full flex h-full flex-col justify-center px-4 py-24 md:max-lg:col-span-2 lg:px-12'>
				<div className='container z-40 max-w-lg rounded-lg bg-background px-6 py-8 shadow-sm md:shadow-none'>
					<div className='mb-8'>
						<H1 className='inline-flex flex-wrap items-center'>
							{heading.map((item, i) => (
								<span key={i}>{item}&nbsp;</span>
							))}
							<span aria-hidden className='pointer-events-none pl-1'>
								<Image src={HeadingImg} alt='' className='h-8 w-8 rounded-full' />
							</span>
						</H1>
					</div>

					<SignupForm />

					<Muted className='mt-4'>
						Already have an account?{' '}
						<Link href={'/login'} className='text-foreground hover:underline'>
							Log in.
						</Link>
					</Muted>
				</div>
			</div>
		</main>
	)
}

export default SignupPage

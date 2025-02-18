import { Lobby } from '@/app/components/Lobby'
import { JoinGameForm } from '@/components/JoinGameForm'
import { SignOutShell } from '@/components/SignOutShell'
import LayoutContainer from '@/components/layout/container'
import { H2 } from '@/components/ui/Typography/H2'
import { H3 } from '@/components/ui/Typography/H3'
import { Muted } from '@/components/ui/Typography/Muted'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { RecentMatches } from './components/sections/RecentMatches'
import { UserStats } from './components/sections/user-stats'

export default async function Home() {
	const supabase = await createClient()

	const { data: session, error } = await supabase.auth.getUser()

	const { data: room } = await supabase
		.from('room_players')
		.select('roomId')
		.eq('playerId', session?.user?.id ?? '')
		.single()
	const { data: user } = await supabase
		.from('profiles')
		.select(`id, username, avatar_url`)
		.eq('id', session?.user?.id ?? '')
		.single()

	return (
		<LayoutContainer>
			<>
				<main className='grid-container z-0 my-auto py-12'>
					<div className='mx-auto mt-12 grid w-full max-w-lg grid-cols-1 gap-24 lg:max-w-full lg:grid-cols-2 xl:gap-36'>
						<div className='flex flex-col'>
							<header>
								<h1 className='font-heading text-3xl font-bold sm:text-4xl md:text-5xl'>Gwent Multiplayer</h1>
								<p className='mt-2 text-xl text-muted-foreground'>
									The Witcher 3&apos;s Gwent card game, now multiplayer.
								</p>

								<Separator className='my-6' />

								{!user && (
									<div className='space-y-8'>
										<div>
											<H2>How to play</H2>
											<p className='text-balance text-muted-foreground'>
												You can create a new room and invite your friends to join, or join a room that your friend has
												created.
											</p>
										</div>
										<div>
											<H2>Gwent tutorial</H2>

											<Link
												href={'https://www.youtube.com/watch?v=3-KEhKf4uqk'}
												target='_blank'
												rel='noopener'
												className='text-muted-foreground underline'>
												Watch the tutorial on YouTube
											</Link>
										</div>

										<Separator className='mt-6 lg:hidden' />
									</div>
								)}
							</header>

							{user && <UserStats user={user} />}
						</div>

						{user && (
							<div className='flex w-full flex-col justify-between lg:ml-auto'>
								<section>
									<H2>Join your friend</H2>
									<JoinGameForm isInGame={room !== null} />
								</section>

								<div className='my-10 flex items-center'>
									<Separator className='w-auto grow' />
									<span className='mx-2 shrink-0 text-xs leading-none text-muted-foreground'>OR</span>
									<Separator className='w-auto grow' />
								</div>

								<Lobby user={user} roomId={room?.roomId ?? null} />
							</div>
						)}

						{!user && (
							<div>
								<H3>Log in to play</H3>
								<p className='max-w-sm text-pretty text-muted-foreground'>
									You need to log in to play. If you don&apos;t have an account, you can create one for free.
								</p>

								<div className='mt-8 flex gap-2'>
									<SignOutShell>
										<Link href={'/login'} className={cn(buttonVariants())}>
											Log in
										</Link>
									</SignOutShell>
									<SignOutShell>
										<Link href={'/signup'} className={cn(buttonVariants())}>
											Sign up
										</Link>
									</SignOutShell>
								</div>
							</div>
						)}
					</div>

					{user && (
						<section className='py-32'>
							<H2 className='mb-6'>Recent games</H2>

							<RecentMatches userId={user.id} />
						</section>
					)}
				</main>

				<footer className='grid-container z-20 mt-auto w-full py-4 text-center backdrop-blur-md'>
					<Muted>This is a fan-made project for demo purposes. All rights belong to CD Projekt Red.</Muted>
				</footer>
			</>
		</LayoutContainer>
	)
}

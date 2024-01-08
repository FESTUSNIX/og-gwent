import { Icons } from '@/components/Icons'
import { UserAvatar } from '@/components/UserAvatar'
import { FACTIONS } from '@/constants/FACTIONS'
import { supabase } from '@/lib/supabase/supabase'
import { cn } from '@/lib/utils'
import { GamePlayer } from '@/types/Game'
import { useEffect, useState } from 'react'

type Props = {
	player: GamePlayer
	opponent: GamePlayer
	turn: GamePlayer['id'] | null
	side: 'host' | 'opponent'
}

const calculateScore = (p: GamePlayer) => {
	return Object.values(p?.rows).reduce((acc, row) => acc + row.cards.reduce((acc, card) => acc + card.strength, 0), 0)
}

export const PlayerStats = ({ player, opponent, side, turn }: Props) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const supabaseClient = supabase()

	const score = calculateScore(player)
	const opponentScore = calculateScore(opponent)
	const isWinning = score > opponentScore

	const hasPassed = player.hasPassed

	useEffect(() => {
		async function getAvatarUrl() {
			try {
				const { data: user } = await supabaseClient.from('profiles').select('avatar_url').eq('id', player.id).single()

				setAvatarUrl(user?.avatar_url ?? null)
			} catch (error) {
				console.log('Error fetching user: ', error)
			}
		}

		getAvatarUrl()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase])

	return (
		<div className={cn('flex flex-col gap-6', side === 'opponent' && 'flex-col-reverse')}>
			<div className='relative flex items-center gap-4 py-2.5 pl-12'>
				<div className='relative flex aspect-square h-full w-auto items-center justify-center overflow-hidden rounded-full border bg-stone-700'>
					<UserAvatar
						user={{ username: player.name, avatar_url: avatarUrl }}
						className='absolute h-full w-full object-cover'
					/>
				</div>

				<div
					className={cn('flex grow flex-col gap-4 pr-10', side === 'opponent' ? 'flex-col-reverse pb-2.5' : 'pt-2.5')}>
					<div className='flex items-center gap-8'>
						<div className='flex items-center gap-2'>
							<Icons.Cards className='h-6 w-6 stroke-black ' />
							<span className='text-2xl'>{player.hand.length}</span>
						</div>
						<div className='flex items-center gap-1'>
							{[0, 1].map((life, i) => (
								<div
									key={i}
									className={cn('aspect-square w-9 rounded-full bg-red-500', i >= player.lives && 'bg-gray-600')}
								/>
							))}
						</div>
					</div>

					<div>
						<h3 className='font-bold'>{player.name}</h3>
						<p className='w-max text-sm'>{FACTIONS.find(f => f.slug === player.faction)?.name}</p>
					</div>
				</div>

				{hasPassed && (
					<div className='absolute right-0 top-0 -translate-y-2 translate-x-1/2 text-2xl font-bold'>Passed</div>
				)}

				<div className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2'>
					<div
						className={cn(
							'relative z-10 flex aspect-square w-14 items-center justify-center rounded-full border text-black',
							side === 'host' ? 'bg-orange-300' : 'bg-blue-300'
						)}>
						<span className='text-3xl font-bold'>{score}</span>
					</div>
					<div
						className={cn(
							'absolute left-1/2 top-1/2 z-0 hidden aspect-square h-[calc(100%+1.75rem)] w-[calc(100%+1.75rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-orange-300 border-t-transparent',
							isWinning && 'block'
						)}
					/>
				</div>

				<div className='absolute inset-0 -z-10 h-full w-full bg-black/25' />
				{turn === player.id && (
					<div className='absolute inset-0 -z-20 flex items-center justify-center [clip-path:polygon(0%_0%,_0%_100%,_0%_100%,_0%_-100%,_100%_0%,_100%_200%,_0%_200%,_0%_100%,_100%_100%,_100%_0%)]'>
						<div className='h-[calc(100%+0.25rem)] w-full bg-gradient-to-r from-orange-300 to-orange-300/20 blur-[2px]' />
					</div>
				)}
			</div>

			<div className='ml-12 flex aspect-[45/60]  w-28 items-center justify-center bg-stone-900'>Leader Card</div>
		</div>
	)
}

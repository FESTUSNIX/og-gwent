import { UserAvatar } from '@/components/UserAvatar'
import { FACTIONS } from '@/constants/FACTIONS'
import { calculateGameScore } from '@/lib/calculateScores'
import { createClient } from '@/lib/supabase/client'
import { cn, getVw } from '@/lib/utils'
import { GamePlayer } from '@/types/Game'
import { WeatherEffect } from '@/types/WeatherEffect'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type Props = {
	player: GamePlayer
	opponent: GamePlayer
	turn: GamePlayer['id'] | null
	weatherEffects: WeatherEffect[] | undefined
	side: 'host' | 'opponent'
}

export const PlayerStats = ({ player, opponent, side, turn, weatherEffects }: Props) => {
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const supabase = createClient()

	const score = calculateGameScore(player.rows, weatherEffects)
	const opponentScore = calculateGameScore(opponent.rows, weatherEffects)
	const isWinning = score > opponentScore

	const hasPassed = player.hasPassed

	useEffect(() => {
		async function getAvatarUrl() {
			try {
				const { data: user } = await supabase.from('profiles').select('avatar_url').eq('id', player.id).single()

				setAvatarUrl(user?.avatar_url ?? null)
			} catch (error) {
				console.log('Error fetching user: ', error)
			}
		}

		getAvatarUrl()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const factionShieldImage = FACTIONS.find(f => f.slug === player.faction)?.images?.deckShield

	return (
		<div className={cn('flex flex-col', side === 'opponent' && 'flex-col-reverse')} style={{ gap: getVw(24) }}>
			<div className='relative flex items-center py-[2.2%] pl-[10%]' style={{ gap: getVw(16) }}>
				<div
					className={cn(
						'pointer-events-none relative flex aspect-square h-full w-auto select-none items-center justify-center rounded-full'
					)}>
					{avatarUrl && (
						<UserAvatar
							user={{ username: player.name, avatar_url: avatarUrl }}
							className='absolute h-[calc(100%-3%)] w-[calc(100%-3%)] object-cover'
						/>
					)}
					{!avatarUrl && (
						<Image
							src={'/game/icons/profile.png'}
							alt=''
							width={120}
							height={120}
							className='absolute h-[calc(100%-3%)] w-[calc(100%-3%)] rounded-full object-cover'
						/>
					)}

					<Image
						src={'/game/icons/icon_player_border.png'}
						alt=''
						width={120}
						height={120}
						className='absolute top-0 z-10 h-[calc(100%+8%)] w-[calc(100%+5%)]'
					/>

					{factionShieldImage && (
						<Image
							src={factionShieldImage}
							alt=''
							width={50}
							height={50}
							className={cn(
								'absolute left-0 z-10 h-auto w-[45%] translate-x-[-22%] ',
								side === 'opponent' ? 'top-0 translate-y-[-8%]' : 'bottom-0 translate-y-[19%]'
							)}
						/>
					)}
				</div>

				<div
					className={cn(
						'flex grow flex-col pr-[11%]',
						side === 'opponent' ? 'flex-col-reverse pb-[2.3%]' : 'pt-[2.3%]'
					)}
					style={{ gap: getVw(16) }}>
					<div className='flex items-center' style={{ gap: getVw(16) }}>
						<div className='flex items-center' style={{ gap: getVw(8) }}>
							<Image
								src={'/game/icons/icon_card_count.png'}
								alt=''
								width={28}
								height={40}
								className='pointer-events-none h-auto select-none object-contain'
								style={{ width: getVw(24) }}
							/>
							<span className='font-bold leading-tight' style={{ fontSize: getVw(30) }}>
								{player.hand.length}
							</span>
						</div>
						<div className='flex items-center' style={{ gap: getVw(4) }}>
							{[0, 1].map((life, i) => (
								<div key={i} className='aspect-square h-auto rounded-full' style={{ width: getVw(36) }}>
									<Image
										src={`/game/icons/icon_gem_${i >= player.lives ? 'off' : 'on'}.png`}
										alt=''
										width={42}
										height={42}
										className='pointer-events-none h-full w-full select-none'
									/>
								</div>
							))}
						</div>
					</div>

					<div>
						<h3 className='font-bold' style={{ fontSize: getVw(16) }}>
							{player.name}
						</h3>
						<p className='w-max leading-tight' style={{ fontSize: getVw(14) }}>
							{FACTIONS.find(f => f.slug === player.faction)?.name}
						</p>
					</div>
				</div>

				{hasPassed && (
					<div
						className='absolute right-0 top-0 z-10 translate-x-1/2 translate-y-[-25%] font-bold leading-tight'
						style={{ fontSize: getVw(24) }}>
						Passed
					</div>
				)}

				<div className='absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2'>
					<div
						className='relative z-10 flex aspect-square items-center justify-center rounded-full text-black'
						style={{ width: getVw(52) }}>
						<Image
							src={`/game/icons/score_total_${side}.png`}
							alt=''
							width={54}
							height={54}
							className='pointer-events-none absolute h-full w-full select-none'
						/>
						<span
							className='z-10 font-bold leading-tight [text-shadow:0px_0px_6px_#fff]'
							style={{ fontSize: getVw(30) }}>
							{score}
						</span>
					</div>
					{isWinning && (
						<div
							className={cn(
								'absolute left-1/2 top-1/2 z-0 h-[calc(100%+76.95%)] w-[calc(100%+76.95%)] -translate-x-1/2 -translate-y-1/2 rounded-full'
							)}>
							<Image
								src={'/game/icons/icon_high_score.png'}
								alt=''
								width={100}
								height={80}
								className='pointer-events-none absolute bottom-[4%] h-auto w-full select-none'
							/>
						</div>
					)}
				</div>

				<div className='absolute inset-0 -z-10 h-full w-full bg-black/50' />
				{turn === player.id && (
					<div className='absolute inset-0 -z-20 flex items-center justify-center [clip-path:polygon(0%_0%,_0%_100%,_0%_100%,_0%_-100%,_100%_0%,_100%_200%,_0%_200%,_0%_100%,_100%_100%,_100%_0%)]'>
						<div className='h-[calc(100%+0.25rem)] w-full bg-gradient-to-r from-orange-300 to-orange-300/20 blur-[2px]' />
					</div>
				)}
			</div>

			<div
				className='relative ml-[10%] flex aspect-[45/60] w-[24%] items-center justify-center bg-no-repeat shadow-[8px_8px_6px_#00000070] [background-size:100%_100%]'
				style={{ backgroundImage: `url('/game/board/leader_slot.png')` }}>
				<div
					style={{ backgroundImage: `url('/game/board/leader_ability.png')` }}
					className='absolute right-0 top-1/2 aspect-[5/4] h-[28%] w-auto -translate-y-1/2 translate-x-full bg-contain bg-no-repeat'
				/>
			</div>
		</div>
	)
}

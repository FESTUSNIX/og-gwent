import { UserAvatar } from '@/components/UserAvatar'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { GameState } from '@/types/Game'
import { Tables } from '@/types/supabase'
import { format } from 'date-fns'
import {} from 'lucide-react'
import { Fragment } from 'react'
import SkullIcon from '/public/assets/skull.svg'
import TrophyIcon from '/public/assets/trophy.svg'

type Props = {
	userId: string
	match: Tables<'matches'>
}

export const MatchCard = async ({ match, userId }: Props) => {
	const supabase = await createClient()

	const { player1, player2, date, id, player1_result, player2_result, scores } = match

	const { data: user } = await supabase.from('profiles').select('*').eq('id', userId).single()

	const opponentId = player1 === userId ? player2 : player1
	const { data: opponent } = await supabase.from('profiles').select('*').eq('id', opponentId).single()

	if (!user || !opponent) return null

	const players = [user, opponent]
	const rounds = scores as GameState['rounds']

	const hasWon = player1 === userId ? player1_result === 'win' : player2_result === 'win'

	const matchScore = rounds.reduce(
		(acc, round) => {
			const userScore = round.players.find(p => p.id === userId)?.score
			const opponentScore = round.players.find(p => p.id === opponentId)?.score

			if (userScore && opponentScore) {
				if (userScore > opponentScore) acc[0]++
				else if (opponentScore > userScore) acc[1]++
			}

			return acc
		},
		[0, 0]
	)

	return (
		<div
			className={cn(
				'relative z-0 grid grid-cols-3 overflow-hidden rounded-lg border border-border bg-background/10 px-8 py-4 shadow-md backdrop-blur-lg',
				hasWon ? 'border-yellow-700' : 'border-red-800'
			)}>
			<div
				className={cn(
					'absolute -left-8 top-0 z-20 size-48 rounded-full opacity-50 blur-[100px]',
					hasWon ? 'bg-yellow-800' : 'bg-red-800'
				)}>
				/
			</div>
			<div className='absolute top-0 -z-10 flex h-[120%] w-auto items-center justify-center opacity-15'>
				{hasWon ? (
					<TrophyIcon className='size-[150%] -translate-x-[30%] -translate-y-[0%] rotate-12 fill-yellow-700 stroke-background text-background' />
				) : (
					<SkullIcon className='size-[100%] -translate-x-[30%] -translate-y-[10%] rotate-12 text-red-800' />
				)}
			</div>

			<p
				className={cn(
					'pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-heading text-[9rem] font-bold uppercase leading-none opacity-5',
					hasWon ? 'text-yellow-800' : 'text-red-800'
				)}>
				<span className='mt-5 block'>{hasWon ? 'Victory' : 'Defeat'}</span>
			</p>

			{rounds && (
				<div
					className='relative grid h-max w-max gap-x-8 gap-y-6 self-center pr-12'
					style={{
						gridTemplateColumns: `repeat(${rounds.length}, 1fr)`,
						gridTemplateRows: `repeat(3, 1fr)`
					}}>
					{rounds.map((round, i) => (
						<div key={`round-${i}`} className='w-max'>
							<h3 className='text-base text-muted-foreground'>No. {i + 1}</h3>
						</div>
					))}

					{players.map(player => (
						<Fragment key={player.id}>
							{rounds.map((round, i) => {
								const roundPlayer = round.players.find(p => p.id === player.id)
								if (!roundPlayer) return

								return (
									<h4
										key={`round-${i}`}
										className={cn(
											'text-center text-xl',
											roundPlayer.score === Math.max(...round.players.map(p => p.score))
												? 'text-primary'
												: 'text-foreground'
										)}>
										{round.players.find(p => p.id === player.id)?.score}
									</h4>
								)
							})}
						</Fragment>
					))}
				</div>
			)}

			<div className='self-center justify-self-center'>
				<p className='font-heading text-7xl font-black'>
					{matchScore[0]}:{matchScore[1]}
				</p>
			</div>

			<div className='flex w-full items-start justify-end'>
				<div className='flex h-full flex-col items-center gap-1'>
					<div className='aspect-square h-full max-h-36 w-auto'>
						<UserAvatar user={opponent} className='h-auto w-auto border' />
					</div>
					<p className='w-max shrink-0 text-center text-lg text-muted-foreground'>{opponent.username}</p>
				</div>
			</div>
		</div>
	)
}

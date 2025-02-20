import { UserAvatar } from '@/components/UserAvatar'
import { getMatchesOfUser } from '@/lib/queries'
import { Tables } from '@/types/supabase'
import { FlameIcon, MedalIcon } from 'lucide-react'
import CrossedSabers from '/public/assets/crossed-sabers.svg'
import SkullIcon from '/public/assets/skull.svg'
import TrophyIcon from '/public/assets/trophy.svg'

type Props = {
	user: Pick<Tables<'profiles'>, 'id' | 'username' | 'avatar_url'>
}

export const UserStats = async ({ user }: Props) => {
	const matches = await getMatchesOfUser(user.id)

	const totalMatchesPlayed = matches.length
	const matchesWon = matches.filter(match => match.result === 'win').length
	const matchesLost = matches.filter(match => match.result === 'lose').length
	const matchesDrawn = matches.filter(match => match.result === 'draw').length

	const streak = (() => {
		let currentStreak = 0

		for (let i = 0; i <= matches.length - 1; i++) {
			if (matches[i].result === 'win') {
				currentStreak++
			} else {
				if (matches[i].result === 'draw') continue

				break
			}
		}

		return currentStreak
	})()

	const highestWinStreak = (() => {
		let maxStreak = 0
		let currentStreak = 0

		for (let i = 0; i < matches.length; i++) {
			if (matches[i].result === 'win') {
				currentStreak++
				maxStreak = Math.max(maxStreak, currentStreak)
			} else {
				if (matches[i].result === 'draw') continue
				currentStreak = 0
			}
		}

		return maxStreak
	})()

	return (
		<div className='flex h-full w-full flex-col justify-between overflow-hidden rounded-lg border bg-background/10 p-6 backdrop-blur-sm'>
			<div className='flex items-center gap-4'>
				<UserAvatar user={{ ...user }} className='size-12 border' />
				<div>
					<h3 className='text-lg font-semibold leading-tight'>{user.username}</h3>
					<p className='text-muted-foreground'>Matches played: {totalMatchesPlayed}</p>
				</div>
			</div>

			<div className='my-8 grid grid-cols-3 gap-1'>
				<div className='relative flex flex-col items-center gap-y-1 overflow-hidden rounded-md border px-2 py-2'>
					<span className='font-heading'>Wins</span>
					<span className='text-4xl font-bold'>{matchesWon}</span>

					<TrophyIcon className='absolute -z-10 size-[170%] translate-x-[0%] translate-y-[-15%] rotate-12 fill-yellow-700 stroke-background text-background opacity-25' />
				</div>
				<div className='relative flex flex-col items-center gap-y-1 overflow-hidden rounded-md border px-2 py-2'>
					<span className='font-heading'>Defeats</span>
					<span className='text-4xl font-bold'>{matchesLost}</span>
					<SkullIcon className='absolute -z-10 size-[120%] translate-x-[0%] translate-y-[-15%] rotate-12 text-red-800 opacity-25' />
				</div>
				<div className='relative flex flex-col items-center gap-y-1 overflow-hidden rounded-md border px-2 py-2'>
					<span className='font-heading'>Draws</span>
					<span className='text-4xl font-bold'>{matchesDrawn}</span>

					<CrossedSabers className='absolute -z-10 size-[150%] -translate-y-[20%] translate-x-[0%] rotate-12 stroke-black text-gray-600 opacity-25' />
				</div>
			</div>

			{matches.length > 0 && (
				<div
					className='relative grid h-2 w-full overflow-hidden rounded-full bg-primary'
					style={{
						gridTemplateColumns: `${(matchesWon / totalMatchesPlayed) * 100}% ${
							(matchesDrawn / totalMatchesPlayed) * 100
						}% ${(matchesLost / totalMatchesPlayed) * 100}%`
					}}>
					<div className='h-full w-full bg-green-500'></div>
					<div className='h-full w-full bg-gray-500'></div>
					<div className='h-full w-full bg-red-700'></div>
				</div>
			)}

			<div className='mt-8 grid grid-cols-2 gap-x-2'>
				<div className='relative flex flex-col items-center gap-y-1 overflow-hidden rounded-md border px-2 py-2'>
					<span className='font-heading'>Highest Streak</span>
					<span className='text-4xl font-bold'>{highestWinStreak}</span>

					<MedalIcon className='absolute -z-10 size-[150%] translate-x-[0%] translate-y-[-15%] rotate-12 fill-orange-700 stroke-background text-background opacity-25' />
				</div>
				<div className='relative flex flex-col items-center gap-y-1 overflow-hidden rounded-md border px-2 py-2'>
					<span className='font-heading'>Current Streak</span>
					<span className='text-4xl font-bold'>{streak}</span>

					<FlameIcon className='absolute -z-10 size-[150%] translate-x-[0%] translate-y-[-25%] fill-orange-700 stroke-background text-background opacity-25' />
				</div>
			</div>
		</div>
	)
}

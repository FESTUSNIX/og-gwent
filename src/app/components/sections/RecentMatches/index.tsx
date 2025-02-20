import { getMatchesOfUser } from '@/lib/queries'
import { MatchCard } from './card'

type Props = {
	userId: string
}

export const RecentMatches = async ({ userId }: Props) => {
	const matches = await getMatchesOfUser(userId)

	if (!matches.length) {
		return <div className='text-center text-muted-foreground'>No recent matches found</div>
	}

	return (
		<div className='flex w-full flex-col gap-4'>
			{matches.slice(0, 5).map(match => {
				return <MatchCard key={match.id} userId={userId} match={match} />
			})}
		</div>
	)
}

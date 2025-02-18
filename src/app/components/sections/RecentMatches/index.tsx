import { createClient } from '@/lib/supabase/server'
import React from 'react'
import { MatchCard } from './card'

type Props = {
	userId: string
}

export const RecentMatches = async ({ userId }: Props) => {
	const supabase = await createClient()

	// Fetch all the matches of the current user
	const { data: matches, error } = await supabase
		.from('matches')
		.select('*')
		.or(`player1.eq.${userId},player2.eq.${userId}`)

	if (error || !matches.length) {
		return <div className='text-center text-muted-foreground'>No recent matches found</div>
	}

	return (
		<div className='flex w-full flex-col gap-4'>
			{matches.map(match => {
				return <MatchCard key={match.id} userId={userId} match={match} />
			})}
		</div>
	)
}

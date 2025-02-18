import { Json, Tables } from '@/types/supabase'
import { createClient } from '../supabase/server'

export type Match = {
	id: string
	opponent: Pick<Tables<'profiles'>, 'id' | 'username' | 'avatar_url'>
	result: 'win' | 'lose' | 'draw'
	scores: Json[] | null
}

export const getMatchesOfUser = async (userId: string): Promise<Match[]> => {
	const supabase = await createClient()

	const { data: matches, error } = await supabase
		.from('matches')
		.select(
			`
            id,
            player1:profiles!player1 (id,username,avatar_url),
            player2:profiles!player2 (id,username,avatar_url),
            player1_result,
            player2_result,
            scores
            `
		)
		.or(`player1.eq.${userId},player2.eq.${userId}`)
		.order('date', { ascending: false })

	if (error || !matches.length) {
		return []
	}

	const transformedMatches = matches.map(match => {
		const opponent = match.player1.id === userId ? match.player2 : match.player1
		const result = (match.player1.id === userId ? match.player1_result : match.player2_result) as
			| 'win'
			| 'lose'
			| 'draw'

		return {
			id: match.id,
			opponent,
			result,
			scores: match.scores
		}
	})

	return transformedMatches
}

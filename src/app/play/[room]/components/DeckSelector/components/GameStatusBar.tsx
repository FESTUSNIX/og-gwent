'use client'

import { UserAvatar } from '@/components/UserAvatar'
import { supabase } from '@/lib/supabase/supabase'
import { cn } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { FactionType } from '@/types/Faction'
import { Tables } from '@/types/supabase'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import useGameContext from '../../../hooks/useGameContext'
import { StartGameButton } from './StartGameButton'

type Props = {
	selectedDeck: CardType[]
	accepted: boolean
	player: Pick<Tables<'profiles'>, 'id' | 'username'>
	currentFaction: FactionType
}

export const GameStatusBar = ({ accepted, currentFaction, player, selectedDeck }: Props) => {
	const { gameState } = useGameContext()

	const players = gameState.players

	const currentUser = players.find(p => p.id === player.id)
	const opponent = players.find(p => p.id !== player.id)

	const supabaseClient = supabase()
	const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null)
	const [opponentAvatar, setOpponentAvatar] = useState<string | null>(null)

	useEffect(() => {
		async function getAvatarUrl() {
			try {
				const { data: user } = await supabaseClient.from('profiles').select('avatar_url').eq('id', player.id).single()
				setCurrentUserAvatar(user?.avatar_url ?? null)

				if (!opponent) return

				const { data: opp } = await supabaseClient.from('profiles').select('avatar_url').eq('id', opponent?.id).single()
				setOpponentAvatar(opp?.avatar_url ?? null)
			} catch (error) {
				console.log('Error fetching user: ', error)
			}
		}

		getAvatarUrl()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase])

	return (
		<motion.div
			initial={{ y: 100 }}
			animate={{ y: 0 }}
			exit={{ y: 100 }}
			transition={{ duration: 0.5 }}
			className='fixed bottom-0 left-0 z-50 w-full border-t bg-background/75 py-4 backdrop-blur-lg'>
			<div className='mx-auto flex max-w-screen-2xl items-center justify-between px-12'>
				{/* Player */}
				{currentUser && (
					<div className='flex items-center gap-3'>
						<UserAvatar user={{ username: currentUser.name, avatar_url: currentUserAvatar }} className='size-12' />
						<div className=''>
							<p className='text-xl font-semibold leading-[1.1]'>{currentUser.name}</p>
							<p
								className={cn(
									'text-base text-muted-foreground',
									currentUser.gameStatus === 'select-deck' ? '' : 'text-green-600'
								)}>
								{currentUser.gameStatus === 'select-deck' ? 'Selecting deck...' : 'Ready'}
							</p>
						</div>
					</div>
				)}

				<div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2'>
					<StartGameButton
						accepted={accepted}
						selectedDeck={selectedDeck}
						player={player}
						currentFaction={currentFaction}
					/>
				</div>

				{/* Opponent */}
				{opponent && (
					<div className='flex items-center gap-3'>
						<div className='text-right'>
							<p className='text-xl font-semibold leading-[1.1]'>{opponent.name}</p>
							<p
								className={cn(
									'text-base text-muted-foreground',
									opponent.gameStatus === 'select-deck' ? '' : 'text-green-600'
								)}>
								{opponent.gameStatus === 'select-deck' ? 'Selecting deck...' : 'Ready'}
							</p>
						</div>
						<UserAvatar user={{ username: opponent.name, avatar_url: opponentAvatar }} className='size-12' />
					</div>
				)}
			</div>
		</motion.div>
	)
}

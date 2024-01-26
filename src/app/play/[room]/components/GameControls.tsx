'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Braces, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { initialGameState } from '../context/GameContext'
import useGameContext from '../hooks/useGameContext'

type Props = {
	roomId: string
}

export const GameControls = ({ roomId }: Props) => {
	const {
		gameState,
		synced,
		sync,
		actions: { setGameState }
	} = useGameContext()

	const supabase = createClientComponentClient<Database>()
	const router = useRouter()

	const [isVisible, setIsVisible] = useState(false)
	const toggleDataVisibility = () => setIsVisible(!isVisible)

	const resetGameState = async () => {
		setGameState(initialGameState)
		sync()

		const { error: roomPlayersError, data: playerIds } = await supabase
			.from('room_players')
			.delete()
			.eq('roomId', roomId)
			.select('playerId')
		if (roomPlayersError) return console.error(roomPlayersError)

		const { error: playersError } = await supabase
			.from('players')
			.delete()
			.in(
				'id',
				playerIds?.map(p => p.playerId)
			)
		if (playersError) return console.error(playersError)

		const { error: roomError } = await supabase.from('rooms').delete().eq('id', roomId)
		if (roomError) return console.error(roomError)

		router.replace('/')
	}

	return (
		<div className='fixed left-4 top-4 z-50 flex flex-row items-start gap-4'>
			<div className='relative'>
				<Button size={'icon'} variant={'secondary'} onClick={toggleDataVisibility} className='shadow-md'>
					<Braces />
				</Button>
				{isVisible && (
					<div
						className={cn(
							'absolute top-full flex translate-y-4 flex-col gap-2 rounded-lg border bg-secondary/95 px-2 py-2'
						)}>
						<ScrollArea className='h-[80vh] px-2'>
							{/* Filter out player hand, deck and discardPile on gameState */}
							<pre className='text-xs'>
								{JSON.stringify(
									{
										turn: gameState.turn,
										rounds: gameState.rounds,
										players: gameState.players.map(({ hand, deck, discardPile, rows, ...rest }) => rest),
										synced,
										roomOwner: gameState.roomOwner
									},
									null,
									2
								)}
							</pre>
						</ScrollArea>
					</div>
				)}
			</div>
			<Button size={'icon'} variant={'secondary'} onClick={resetGameState} className='shadow-md'>
				<Trash2 />
			</Button>
		</div>
	)
}

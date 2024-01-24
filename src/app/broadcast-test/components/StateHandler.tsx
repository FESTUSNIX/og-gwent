'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React, { useEffect } from 'react'
import { Controls } from './Controls'
import { H1 } from '@/components/ui/Typography/H1'
import { H3 } from '@/components/ui/Typography/H3'

type Props = {
	userId: string
	userName: string
}
type GameState = {
	players: {
		id: string
		name: string
	}[]
}

export const StateHandler = ({ userId, userName }: Props) => {
	const supabase = createClientComponentClient<Database>()

	const [gameState, setGameState] = React.useState<GameState>({
		players: []
	})

	const [synced, setSynced] = React.useState(0)

	const [newPlayerName, setNewPlayerName] = React.useState('')
	const [newOpponentName, setNewOpponentName] = React.useState('')

	const isInRoom = !!gameState.players.find(player => player.id === userId)

	const sync = () => {
		// setTimeout(() => {
		setSynced(prevSynced => prevSynced + 1)
		// }, 0)
	}

	const updatePlayerName = async (playerId: string, newName: string) => {
		setGameState({
			...gameState,
			players: gameState.players.map(player => {
				if (player.id === playerId) {
					return {
						...player,
						name: newName
					}
				}
				return player
			})
		})
		sync()
	}

	const joinRoom = () => {
		console.log('ROOM JOIN')
		setGameState(prevState => ({
			...prevState,
			players: [
				...prevState.players.filter(player => {
					return !prevState.players.find(p => p.id === userId)
				}),
				{
					id: userId,
					name: userName
				}
			]
		}))
		sync()
	}

	const onRecive = (payload: { [key: string]: any; type: 'broadcast'; event: string }) => {
		if (synced === payload.payload.synced) return

		const newGameState: GameState = payload.payload.gameState

		setGameState({
			...newGameState
		})
	}

	useEffect(() => {
		const roomChannel = supabase.channel(`room=broadcast-test`, {
			config: {
				broadcast: { ack: true }
			}
		})

		roomChannel
			.on('broadcast', { event: 'game' }, payload => onRecive(payload))
			.subscribe(async status => {
				if (status !== 'SUBSCRIBED') {
					return null
				}

				const broadcastResponse = await roomChannel.send({
					type: 'broadcast',
					event: 'game',
					payload: { gameState, synced }
				})
			})

		return () => {
			roomChannel.unsubscribe()
		}
	}, [synced])

	if (gameState.players.length !== 2)
		return (
			<div>
				<H1 className='mb-8'>Queue</H1>

				<div className='mb-6'>
					<H3>{gameState.players.length} / 2 Players</H3>

					<div className='flex flex-col'>
						{gameState.players.map(player => (
							<p key={player.id}>{player.name}</p>
						))}
					</div>
				</div>

				<Button
					onClick={() => {
						joinRoom()
					}}
					disabled={isInRoom}>
					{isInRoom ? 'Waiting for opponent' : 'Join Room'}
				</Button>

				<Controls gameState={gameState} />
			</div>
		)

	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-2'>
				<Input type='text' value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} />

				<Button
					onClick={() => {
						updatePlayerName(userId, newPlayerName)
						setNewPlayerName('')
					}}>
					Update name
				</Button>
			</div>
			<div className='flex items-center gap-2'>
				<Input type='text' value={newOpponentName} onChange={e => setNewOpponentName(e.target.value)} />

				<Button
					onClick={() => {
						const opponentId = gameState.players.find(player => player.id !== userId)?.id!

						updatePlayerName(opponentId, newOpponentName)
						setNewOpponentName('')
					}}>
					Update opponent
				</Button>
			</div>

			<Controls gameState={{ ...gameState, synced }} />
		</div>
	)
}

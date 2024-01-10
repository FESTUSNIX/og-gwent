'use client'

import { deepEqual } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { GamePlayer, GameState } from '@/types/Game'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { initialRow } from '../context/GameContext'
import { useNoticeContext } from '../context/NoticeContext'
import useGameContext from '../hooks/useGameContext'
import { GameOverNotice } from './GameOverNotice'

type Props = {
	roomId: string
	userId: string
}

export const GameStateHandler = ({ roomId, userId }: Props) => {
	const { gameState, setGameState, updatePlayerState } = useGameContext()
	const { notice, isResolving } = useNoticeContext()

	const supabase = createClientComponentClient<Database>()
	const router = useRouter()

	const currentPlayer = gameState.players.find(player => player?.id === userId)
	const opponentPlayer = gameState.players.find(player => player?.id !== userId)
	const gameStarted = currentPlayer?.gameStatus === 'play' && opponentPlayer?.gameStatus === 'play'

	const updateCurrentUserOnServer = async (newPlayerState: GamePlayer) => {
		const { error } = await supabase
			.from('players')
			.upsert({ ...newPlayerState })
			.eq('id', userId)

		if (error) {
			console.error(error)
			toast.error(error.message)
		}
	}

	const updateGameStateOnServer = async (newGameState: Pick<GameState, 'rounds' | 'turn'>) => {
		const { error } = await supabase
			.from('rooms')
			.upsert({
				id: roomId,
				rounds: newGameState.rounds,
				turn: newGameState.turn
			})
			.eq('id', roomId)

		if (error) {
			console.error(error)
			toast.error(error.message)
		}
	}

	// Fetch game state from database on mount
	useEffect(() => {
		const fetchGameState = async () => {
			const { data: players } = await supabase.from('room_players').select('playerId(*)').eq('roomId', roomId)
			if (!players) return

			const { data: roomData } = await supabase.from('rooms').select('turn, rounds').eq('id', roomId).limit(1)
			if (!roomData) return

			const newPlayers = players.map(player => player.playerId).flat(1)

			const newGameState: GameState = {
				players: newPlayers as GameState['players'],
				turn: roomData[0].turn,
				rounds: (roomData[0].rounds ?? []) as GameState['rounds']
			}

			setGameState(newGameState)
		}

		fetchGameState()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId])

	async function onBroadcast(payload: { [key: string]: any; type: 'broadcast'; event: string }) {
		const newOtherPlayer = payload.payload.otherPlayer
		const currentOtherPlayer = gameState.players.find(player => player?.id === newOtherPlayer?.id)

		const newGameState: GameState = {
			...gameState,
			turn: payload.payload.turn,
			players: gameState.players.map(player => (player.id === newOtherPlayer?.id ? newOtherPlayer : player))
		}

		if (!newOtherPlayer && deepEqual(newOtherPlayer ?? {}, currentOtherPlayer ?? {})) return null

		setGameState(newGameState)

		if (currentPlayer && newOtherPlayer) {
			await hasPassedNotice(currentPlayer.hasPassed, newOtherPlayer.hasPassed, 'disable-host')

			if (currentPlayer.hasPassed && newOtherPlayer.hasPassed) {
				await handleRoundEnd(currentPlayer, newOtherPlayer)
			} else if (newGameState.turn && !isResolving && newGameState.players.filter(p => p.hasPassed).length === 0) {
				await turnNotice(newGameState.turn)
			}
		}
	}

	const hasPassedNotice = async (
		hostHasPassed: boolean,
		opponentHasPassed: boolean,
		disable?: 'disable-host' | 'disable-opponent'
	) => {
		if (hostHasPassed && opponentHasPassed) return

		if (hostHasPassed === true && disable !== 'disable-host') {
			await notice({
				title: 'Round passed'
			})

			return
		}

		if (
			opponentHasPassed === true &&
			opponentHasPassed !== opponentPlayer?.hasPassed &&
			disable !== 'disable-opponent'
		) {
			await notice({
				title: 'Your opponent has passed'
			})

			return
		}
	}

	const turnNotice = async (turn: string) => {
		if (!gameStarted) return

		if (turn === currentPlayer.id) {
			await notice({
				title: 'Your turn'
			})
			return
		}

		if (turn === opponentPlayer.id) {
			await notice({
				title: "Opponent's turn"
			})
			return
		}
	}

	const resetGameState = async () => {
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

	const onGameOver = async (host: GamePlayer, opponent: GamePlayer, rounds: GameState['rounds']) => {
		if (!host || !opponent) return

		const gameResult: 'win' | 'lose' | 'draw' =
			host.lives === 0 && opponent.lives === 0 ? 'draw' : host.lives === 0 ? 'lose' : 'win'

		await notice(
			{
				duration: 15000,
				onClose: async () => {
					await resetGameState()
				}
			},
			<GameOverNotice gameResult={gameResult} rounds={rounds} players={[host, opponent]} />
		)
	}

	const handleRoundEnd = async (host: GamePlayer, opponent: GamePlayer) => {
		if (!host?.hasPassed || !opponent?.hasPassed) return

		const hostScore = Object.values(host?.rows ?? {}).reduce(
			(acc, row) => acc + row.cards.reduce((acc, card) => acc + card.strength, 0),
			0
		)
		const opponentScore = Object.values(opponent?.rows ?? {}).reduce(
			(acc, row) => acc + row.cards.reduce((acc, card) => acc + card.strength, 0),
			0
		)

		const winner = hostScore === opponentScore ? 'draw' : hostScore > opponentScore ? host.id : opponent.id

		const hostLives = winner === host.id ? host.lives : host.lives - 1
		const opponentLives = winner === opponent.id ? opponent.lives : opponent.lives - 1

		const gameOver = hostLives === 0 || opponentLives === 0

		await notice({
			title:
				winner === 'draw' ? 'Round draw' : winner === host.id ? 'You won the round!' : 'Your opponent won the round'
		})

		const newGameState: GameState = {
			rounds: [
				...gameState.rounds,
				{
					players: [
						{ id: host.id, score: hostScore },
						{ id: opponent.id, score: opponentScore }
					]
				}
			],
			turn: gameOver ? null : winner === 'draw' ? (Math.random() < 0.5 ? host.id : opponent.id) : winner,
			players: gameState.players.map(p =>
				p.id === host.id
					? {
							...p,
							hasPassed: false,
							discardPile: [
								...p.discardPile,
								...Object.values(p.rows).reduce((acc, row) => [...acc, ...row.cards], [] as CardType[])
							],
							rows: {
								melee: initialRow,
								range: initialRow,
								siege: initialRow
							},
							preview: null,
							lives: winner === p.id ? p.lives : p.lives - 1
					  }
					: p
			)
		}

		setGameState(newGameState)

		if (host && opponent && gameOver) {
			await onGameOver({ ...host, lives: hostLives }, { ...opponent, lives: opponentLives }, newGameState.rounds)
			return
		}

		await notice({
			title: 'Round Start'
		})

		newGameState.turn && (await turnNotice(newGameState.turn))
	}

	const currentPlayerChangesToListenTo: Partial<GamePlayer> | {} = useMemo(() => {
		const { preview, ...rest } = currentPlayer ?? {}
		return rest
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		currentPlayer?.deck,
		currentPlayer?.discardPile,
		currentPlayer?.hand,
		currentPlayer?.gameStatus,
		currentPlayer?.hasPassed,
		currentPlayer?.lives,
		currentPlayer?.rows
	])

	useEffect(() => {
		const roomChannel = supabase.channel(`room=${roomId}`, {
			config: {
				broadcast: { ack: true }
			}
		})

		roomChannel
			.on('broadcast', { event: 'game' }, payload => onBroadcast(payload))
			.subscribe(async status => {
				if (status !== 'SUBSCRIBED') {
					return null
				}

				const broadcastResponse = await roomChannel.send({
					type: 'broadcast',
					event: 'game',
					payload: { otherPlayer: currentPlayer, turn: gameState.turn, rounds: gameState.rounds }
				})

				if (currentPlayer && opponentPlayer) {
					await hasPassedNotice(currentPlayer.hasPassed, opponentPlayer.hasPassed, 'disable-opponent')

					if (currentPlayer.hasPassed && opponentPlayer.hasPassed) {
						await handleRoundEnd(currentPlayer, opponentPlayer)
					} else if (gameState.turn && !isResolving && gameState.players.filter(p => p.hasPassed).length === 0) {
						await turnNotice(gameState.turn)
					}
				}

				if (currentPlayer) await updateCurrentUserOnServer(currentPlayer)
				await updateGameStateOnServer({ rounds: gameState.rounds, turn: gameState.turn })
			})

		return () => {
			roomChannel.unsubscribe()
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId, currentPlayerChangesToListenTo, gameState.turn])

	useEffect(() => {
		const setPass = () => {
			if (currentPlayer?.hand.length === 0 && gameStarted) {
				updatePlayerState(currentPlayer.id, {
					hasPassed: true
				})
			}
		}

		setPass()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPlayer?.hand])

	if (gameState) return null

	return (
		<div className='fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black/75 text-3xl'>
			<div className='flex items-center justify-center gap-4'>
				<Loader2 className='h-8 w-8 animate-spin' />
				<span>Loading game...</span>
			</div>
		</div>
	)
}

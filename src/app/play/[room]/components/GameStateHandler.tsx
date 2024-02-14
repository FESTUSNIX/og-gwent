'use client'

import { calculateGameScore } from '@/lib/calculateScores'
import { CardType } from '@/types/Card'
import { GamePlayer, GameState } from '@/types/Game'
import { WeatherEffect } from '@/types/WeatherEffect'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { initialRow } from '../context/GameContext'
import { useNoticeContext } from '../context/NoticeContext'
import useGameContext from '../hooks/useGameContext'
import usePrevious from '../hooks/usePrevious'
import { GameOverNotice } from './GameOverNotice'

type Props = {
	roomId: string
	userId: string
}

export const GameStateHandler = ({ roomId, userId }: Props) => {
	const {
		gameState,
		synced,
		sync,
		actions: { setGameState, updatePlayerState }
	} = useGameContext()
	const { notice, isResolving } = useNoticeContext()

	const supabase = createClientComponentClient<Database>()
	const router = useRouter()

	const currentPlayer = useMemo(() => gameState.players.find(player => player?.id === userId), [gameState, userId])
	const previousCurrentPlayer = usePrevious(currentPlayer)

	const opponentPlayer = useMemo(() => gameState.players.find(player => player?.id !== userId), [gameState, userId])
	const gameStarted = currentPlayer?.gameStatus === 'play' && opponentPlayer?.gameStatus === 'play'

	const updateUsersOnServer = async (players: GamePlayer[]) => {
		const gameOver = players.some(player => player.lives === 0)

		if (currentPlayer?.id !== gameState.roomOwner || gameOver) return

		players.map(async player => {
			const { error } = await supabase
				.from('players')
				.upsert({ ...player })
				.in('id', [userId, opponentPlayer?.id])

			if (error) {
				console.error(error)
				toast.error(error.message)
			}
		})
	}

	const updateGameStateOnServer = async (newGameState: GameState) => {
		if (currentPlayer?.id !== gameState.roomOwner) return

		const { error } = await supabase
			.from('rooms')
			.upsert({
				id: roomId,
				rounds: newGameState.rounds,
				turn: newGameState.turn,
				roomOwner: newGameState.roomOwner,
				weatherEffects: newGameState.weatherEffects
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

			const { data: roomData } = await supabase
				.from('rooms')
				.select('turn, rounds, roomOwner, weatherEffects')
				.eq('id', roomId)
				.limit(1)
				.single()
			if (!roomData) return

			const newPlayers = players.flatMap(player => player.playerId)

			const newGameState: GameState = {
				players: newPlayers as GameState['players'],
				turn: roomData.turn,
				rounds: (roomData.rounds ?? []) as GameState['rounds'],
				roomOwner: roomData.roomOwner,
				weatherEffects: roomData.weatherEffects as GameState['weatherEffects']
			}

			setGameState(newGameState)
		}

		fetchGameState()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId])

	async function onRecieve(payload: { [key: string]: any; type: 'broadcast'; event: string }) {
		if (synced === payload.payload.synced) return

		const { gameState: newGameState, synced: newSynced }: { gameState: GameState; synced: number } = payload.payload

		const newOpponent = newGameState.players.find(player => player?.id !== userId)

		setGameState(newGameState)
		sync(newSynced)

		if (currentPlayer && newOpponent) {
			if (newOpponent.hasPassed !== opponentPlayer?.hasPassed) {
				await hasPassedNotice(currentPlayer.hasPassed, newOpponent.hasPassed, newGameState.turn, 'disable-host')
			}

			if (currentPlayer.hasPassed && newOpponent.hasPassed) {
				await handleRoundEnd(currentPlayer, newOpponent)
			} else if (
				newGameState.turn &&
				newGameState.turn !== gameState.turn &&
				!isResolving &&
				newGameState.players.filter(p => p.hasPassed).length === 0
			) {
				await turnNotice(newGameState.turn)
			}
		}
	}

	const hasPassedNotice = async (
		hostHasPassed: boolean,
		opponentHasPassed: boolean,
		turn: string | null,
		disable?: 'disable-host' | 'disable-opponent'
	) => {
		if (hostHasPassed && opponentHasPassed) return

		if (hostHasPassed === true && disable !== 'disable-host') {
			await notice({
				title: 'Round passed',
				image: '/game/icons/notice/round_pass.png'
			})
			turn && (await turnNotice(turn))
			return
		}

		if (
			opponentHasPassed === true &&
			opponentHasPassed !== opponentPlayer?.hasPassed &&
			disable !== 'disable-opponent'
		) {
			await notice({
				title: 'Your opponent has passed',
				image: '/game/icons/notice/round_pass.png'
			})
			turn && (await turnNotice(turn))
			return
		}
	}

	const turnNotice = async (turn: string) => {
		if (!gameStarted) return

		if (turn === currentPlayer.id) {
			await notice({
				title: 'Your turn',
				image: '/game/icons/notice/turn_host.png'
			})
			return
		}

		if (turn === opponentPlayer.id) {
			await notice({
				title: "Opponent's turn",
				image: '/game/icons/notice/turn_opponent.png'
			})
			return
		}
	}

	const resetGameState = async () => {
		const { error: playersError } = await supabase
			.from('players')
			.delete()
			.in('id', [currentPlayer?.id, opponentPlayer?.id])
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

		const weatherEffects: WeatherEffect[] | undefined = gameState.weatherEffects?.map(
			effect => effect.ability as WeatherEffect
		)

		const hostScore = calculateGameScore(host.rows, weatherEffects)
		const opponentScore = calculateGameScore(opponent.rows, weatherEffects)

		const winner = hostScore === opponentScore ? 'draw' : hostScore > opponentScore ? host.id : opponent.id

		const hostLives = winner === host.id ? host.lives : host.lives - 1
		const opponentLives = winner === opponent.id ? opponent.lives : opponent.lives - 1

		const gameOver = hostLives === 0 || opponentLives === 0

		await notice({
			title:
				winner === 'draw' ? 'Round draw' : winner === host.id ? 'You won the round!' : 'Your opponent won the round',
			image: `/game/icons/notice/round_${winner === 'draw' ? 'draw' : winner === host.id ? 'win' : 'defeat'}.png`
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
			players: gameState.players.map(p => ({
				...p,
				hasPassed: false,
				discardPile: [
					...p.discardPile,
					...Object.values(p.rows).reduce((acc, row) => [...acc, ...row.cards], [] as CardType[]),
					...(gameState.weatherEffects?.filter(effect => effect.owner === p.id) ?? [])
				],
				rows: {
					melee: { ...initialRow, name: 'melee' },
					range: { ...initialRow, name: 'range' },
					siege: { ...initialRow, name: 'siege' }
				},
				preview: null,
				lives: winner === p.id ? p.lives : p.lives - 1
			})),
			roomOwner: gameState.roomOwner,
			weatherEffects: []
		}

		setGameState(newGameState)

		if (host && opponent && gameOver) {
			await onGameOver({ ...host, lives: hostLives }, { ...opponent, lives: opponentLives }, newGameState.rounds)
			return newGameState
		}

		sync()

		await notice({
			title: 'Round Start',
			image: '/game/icons/notice/round_start.png'
		})

		newGameState.turn && (await turnNotice(newGameState.turn))

		return newGameState
	}

	useEffect(() => {
		const roomChannel = supabase.channel(`room=${roomId}`, {
			config: {
				broadcast: { ack: true }
			}
		})

		roomChannel
			.on('broadcast', { event: 'game' }, payload => onRecieve(payload))
			.subscribe(async status => {
				if (status !== 'SUBSCRIBED' || synced === 0) return null

				const broadcastResponse = await roomChannel.send({
					type: 'broadcast',
					event: 'game',
					payload: { gameState, synced }
				})

				let gameStateAfterRoundEnd = undefined

				if (currentPlayer && opponentPlayer) {
					if (currentPlayer.hasPassed !== previousCurrentPlayer?.hasPassed) {
						await hasPassedNotice(currentPlayer.hasPassed, opponentPlayer.hasPassed, gameState.turn, 'disable-opponent')
					}

					if (currentPlayer.hasPassed && opponentPlayer.hasPassed) {
						gameStateAfterRoundEnd = await handleRoundEnd(currentPlayer, opponentPlayer)
					} else if (gameState.turn && !isResolving && gameState.players.filter(p => p.hasPassed).length === 0) {
						await turnNotice(gameState.turn)
					}
				}

				await updateGameStateOnServer(gameStateAfterRoundEnd ?? gameState)
				if (currentPlayer && opponentPlayer) {
					await updateUsersOnServer(
						gameStateAfterRoundEnd ? gameStateAfterRoundEnd?.players : [currentPlayer, opponentPlayer]
					)
				}
			})

		return () => {
			roomChannel.unsubscribe()
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId, synced])

	useEffect(() => {
		const setPass = () => {
			if (currentPlayer?.hand.length === 0 && gameStarted && !currentPlayer.hasPassed) {
				updatePlayerState(currentPlayer.id, {
					hasPassed: true
				})
				sync()
			}
		}

		setPass()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPlayer?.hand.length])

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

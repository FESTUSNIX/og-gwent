'use client'

import { calculateGameScore } from '@/lib/calculateScores'
import { CardType } from '@/types/Card'
import { GamePlayer, GameRow, GameState } from '@/types/Game'
import { WeatherEffect } from '@/types/WeatherEffect'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { drawCard, handleMonstersDeckAbility } from '../actions/utils'
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

		let winner = hostScore === opponentScore ? 'draw' : hostScore > opponentScore ? host.id : opponent.id

		// Nilfgaard faction ability
		if (winner === 'draw') {
			const nilfgaardPlayers = [host, opponent].filter(player => player.faction === 'nilfgaard')
			if (nilfgaardPlayers.length === 1) {
				winner = nilfgaardPlayers[0].id

				await notice({
					title: 'Nilfgaard faction ability triggered - Nilfgaard wins the tie.',
					image: `/game/icons/notice/nilfgaard.png`
				})
			}
		}
		//

		const hostLives = winner === host.id ? host.lives : host.lives - 1
		const opponentLives = winner === opponent.id ? opponent.lives : opponent.lives - 1

		const gameOver = hostLives === 0 || opponentLives === 0

		await notice({
			title:
				winner === 'draw' ? 'Round draw' : winner === host.id ? 'You won the round!' : 'Your opponent won the round',
			image: `/game/icons/notice/round_${winner === 'draw' ? 'draw' : winner === host.id ? 'win' : 'defeat'}.png`
		})

		let monstersAbilityNotice = false

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
			players: gameState.players.map(p => {
				let monstersDeckAbility: {
					rows: { melee: GameRow; range: GameRow; siege: GameRow }
					cardToKeepInstance: string | null
				} | null = null

				if (p.faction === 'monsters') {
					const randomCode = `${gameState.roomOwner}-${p.id}-${gameState.rounds.length}`
					monstersDeckAbility = handleMonstersDeckAbility({ rows: p.rows, randomCode })
					monstersAbilityNotice = !!monstersDeckAbility?.cardToKeepInstance
				}

				return {
					...p,
					hasPassed: false,
					discardPile: [
						...p.discardPile,
						...Object.values(p.rows)
							.reduce((acc, row) => [...acc, ...row.cards], [] as CardType[])
							.filter(c => (monstersDeckAbility ? c.instance !== monstersDeckAbility.cardToKeepInstance : true)),
						...(gameState.weatherEffects?.filter(effect => effect.owner === p.id) ?? [])
					],
					rows:
						p.faction === 'monsters' && monstersDeckAbility
							? monstersDeckAbility.rows
							: {
									melee: { ...initialRow, name: 'melee' },
									range: { ...initialRow, name: 'range' },
									siege: { ...initialRow, name: 'siege' }
							  },
					preview: null,
					lives: winner === p.id ? p.lives : p.lives - 1
				}
			}),
			roomOwner: gameState.roomOwner,
			weatherEffects: []
		}

		setGameState(newGameState)

		if (host && opponent && gameOver) {
			await onGameOver({ ...host, lives: hostLives }, { ...opponent, lives: opponentLives }, newGameState.rounds)
			return newGameState
		}

		sync()

		if (monstersAbilityNotice) {
			await notice({
				title: 'Monsters faction ability triggered - one randomly-chosen Monster Unit Card stays on the board',
				image: '/game/icons/notice/monsters.png'
			})
		}

		await notice({
			title: 'Round Start',
			image: '/game/icons/notice/round_start.png'
		})

		newGameState.turn && (await turnNotice(newGameState.turn))

		// Northern Realms faction ability
		const realmsAbilityNotice = async () => {
			await notice({
				title: 'Northern Realms faction ability triggered - North draws an additional card.',
				image: '/game/icons/notice/north.png'
			})
		}
		if (host.faction === 'northern-realms' && winner === host.id) {
			const newState = drawCard({ gameState: newGameState, playerId: host.id })
			if (!newState) return

			setGameState(newState)
			sync()

			await realmsAbilityNotice()
		}
		if (opponent.faction === 'northern-realms' && winner === opponent.id) await realmsAbilityNotice()
		//

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

				let hostState = currentPlayer

				if (hostState?.hand.length === 0 && gameStarted && !hostState.hasPassed) {
					console.log('AUTO PASS')
					updatePlayerState(hostState.id, {
						hasPassed: true
					})
					hostState = { ...hostState, hasPassed: true }
				}

				const broadcastResponse = await roomChannel.send({
					type: 'broadcast',
					event: 'game',
					payload: {
						gameState: {
							...gameState,
							players: gameState.players.map(p => (p.id === hostState?.id ? hostState : p))
						},
						synced
					}
				})

				let gameStateAfterRoundEnd = undefined

				if (hostState && opponentPlayer) {
					if (hostState.hasPassed !== previousCurrentPlayer?.hasPassed) {
						await hasPassedNotice(hostState.hasPassed, opponentPlayer.hasPassed, gameState.turn, 'disable-opponent')
					}

					if (hostState.hasPassed && opponentPlayer.hasPassed) {
						gameStateAfterRoundEnd = await handleRoundEnd(hostState, opponentPlayer)
					} else if (gameState.turn && !isResolving && gameState.players.filter(p => p.hasPassed).length === 0) {
						await turnNotice(gameState.turn)
					}
				}

				await updateGameStateOnServer(gameStateAfterRoundEnd ?? gameState)
				if (hostState && opponentPlayer) {
					await updateUsersOnServer(
						gameStateAfterRoundEnd ? gameStateAfterRoundEnd?.players : [hostState, opponentPlayer]
					)
				}
			})

		return () => {
			roomChannel.unsubscribe()
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId, synced])

	if (!gameState)
		return (
			<div className='fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black/75 text-3xl'>
				<div className='flex items-center justify-center gap-4'>
					<Loader2 className='h-8 w-8 animate-spin' />
					<span>Loading game...</span>
				</div>
			</div>
		)

	return null
}

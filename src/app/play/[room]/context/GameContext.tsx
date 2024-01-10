'use client'

import { deepEqual } from '@/lib/utils'
import { Card, CardType } from '@/types/Card'
import { GamePlayer, GameRow, GameState } from '@/types/Game'
import { Player } from '@/types/Player'
import { RowType } from '@/types/RowType'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import React, { createContext, useEffect, useMemo, useReducer } from 'react'
import { toast } from 'sonner'
import { Action, actions } from '../actions'
import { useNoticeContext } from './NoticeContext'

export const initialGameState: GameState = {
	players: [],
	rounds: [],
	turn: null
}

export const initialRow: GameRow = {
	cards: []
}

export const initialPlayer: Omit<GamePlayer, 'id' | 'name' | 'faction'> = {
	preview: null,
	gameStatus: 'select-deck',
	hasPassed: false,
	lives: 2,
	deck: [],
	hand: [],
	discardPile: [],
	rows: {
		melee: initialRow,
		range: initialRow,
		siege: initialRow
	}
}

export type CardContainers = 'deck' | 'hand' | 'discardPile'

type CUSTOM = {
	type: 'CUSTOM'
	gameState: GameState
	ignoreBroadcast?: boolean
}

const gameReducer = (state: GameState, action: Action | CUSTOM) => {
	switch (action.type) {
		case 'CUSTOM':
			return { ...action.gameState, ignoreBroadcast: action.ignoreBroadcast }
		case 'ACCEPT_GAME':
			return actions.acceptGame(state, action)
		case 'ADD_TO_CONTAINER':
			return actions.addToContainer(state, action)
		case 'REMOVE_FROM_CONTAINER':
			return actions.removeFromContainer(state, action)
		case 'ADD_TO_ROW':
			return actions.addToRow(state, action)
		case 'ADD_TO_PREVIEW':
			return actions.addToPreview(state, action)
		case 'CLEAR_PREVIEW':
			return actions.clearPreview(state, action)
		case 'SET_TURN':
			return actions.setTurn(state, action)
		case 'SET_PLAYER_GAME_STATUS':
			return actions.setPlayerGameStatus(state, action)
		case 'UPDATE_PLAYER_STATE':
			return actions.updatePlayerState(state, action)
		case 'SAVE_ROUND_SCORES':
			return actions.saveRoundScores(state, action)
		default:
			return initialGameState
	}
}

type GameContextProps = {
	acceptGame: (player: Player, startingDeck: Card[]) => void
	addToContainer: (playerId: Player['id'], cards: Card[], destination: CardContainers, shouldReplace?: boolean) => void
	removeFromContainer: (playerId: Player['id'], cards: Card[], source: CardContainers) => void
	addToRow: (playerId: Player['id'], card: Card, rowType: RowType) => void
	addToPreview: (playerId: Player['id'], card: Card) => void
	clearPreview: (playerId: Player['id']) => void
	setTurn: (playerId: Player['id'] | null) => void
	setPlayerGameStatus: (playerId: Player['id'], gameStatus: GamePlayer['gameStatus']) => void
	updatePlayerState: (playerId: Player['id'], playerState: Partial<GamePlayer>) => void
	setGameState: (newGameState: GameState) => void
	saveRoundScores: (players: { id: GamePlayer['id']; score: number }[]) => void
	gameState: GameState
}

const initialState: GameContextProps = {
	acceptGame: () => {},
	addToContainer: () => {},
	removeFromContainer: () => {},
	addToRow: () => {},
	addToPreview: () => {},
	clearPreview: () => {},
	setTurn: () => {},
	setPlayerGameStatus: () => {},
	updatePlayerState: () => {},
	setGameState: () => {},
	saveRoundScores: () => {},
	gameState: initialGameState
}

export const GameContext = createContext(initialState)

export const GameContextProvider = ({
	children,
	roomId,
	userId
}: {
	children: React.ReactNode
	roomId: string
	userId: string
}) => {
	const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

	const supabase = createClientComponentClient<Database>()
	const { notice, isResolving } = useNoticeContext()

	const router = useRouter()

	// Actions

	const acceptGame = (player: Player, startingDeck: Card[]) => dispatch({ type: 'ACCEPT_GAME', player, startingDeck })

	const addToContainer = (
		playerId: Player['id'],
		cards: Card[],
		destination: CardContainers,
		shouldReplace?: boolean
	) => dispatch({ type: 'ADD_TO_CONTAINER', playerId, cards, destination, shouldReplace })

	const removeFromContainer = (playerId: Player['id'], cards: Card[], source: CardContainers) =>
		dispatch({ type: 'REMOVE_FROM_CONTAINER', playerId, cards, source })

	const addToRow = (playerId: Player['id'], card: Card, rowType: RowType) =>
		dispatch({ type: 'ADD_TO_ROW', playerId, card, rowType })

	const addToPreview = (playerId: Player['id'], card: Card) => dispatch({ type: 'ADD_TO_PREVIEW', playerId, card })
	const clearPreview = (playerId: Player['id']) => dispatch({ type: 'CLEAR_PREVIEW', playerId })

	const setTurn = (playerId: Player['id'] | null) => dispatch({ type: 'SET_TURN', playerId })

	const setPlayerGameStatus = (playerId: Player['id'], gameStatus: GamePlayer['gameStatus']) =>
		dispatch({ type: 'SET_PLAYER_GAME_STATUS', playerId, status: gameStatus })

	const setGameState = (newGameState: GameState, ignoreBroadcast?: boolean) =>
		dispatch({ type: 'CUSTOM', gameState: newGameState, ignoreBroadcast })

	const updatePlayerState = (playerId: Player['id'], playerState: Partial<GamePlayer>) =>
		dispatch({ type: 'UPDATE_PLAYER_STATE', playerId, playerState })

	const saveRoundScores = (players: { id: GamePlayer['id']; score: number }[]) =>
		dispatch({ type: 'SAVE_ROUND_SCORES', players })

	// Functions

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

			dispatch({ type: 'CUSTOM', gameState: newGameState })
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
			await notice('CUSTOM', {
				title: 'Round passed'
			})

			return
		}

		if (
			opponentHasPassed === true &&
			opponentHasPassed !== opponentPlayer?.hasPassed &&
			disable !== 'disable-opponent'
		) {
			await notice('CUSTOM', {
				title: 'Your opponent has passed'
			})

			return
		}
	}

	const turnNotice = async (turn: string) => {
		if (!gameStarted) return

		if (turn === currentPlayer.id) {
			await notice('CUSTOM', {
				title: 'Your turn'
			})
			return
		}

		if (turn === opponentPlayer.id) {
			await notice('CUSTOM', {
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

	const onGameOver = async (host: GamePlayer, opponent: GamePlayer) => {
		if (!host || !opponent) return

		const winner = host.lives === 0 && opponent.lives === 0 ? 'draw' : host.lives === 0 ? opponent.name : host.name

		await notice('CUSTOM', {
			title: winner === 'draw' ? 'Draw' : winner === host.name ? 'Victory!' : 'Defeat',
			duration: 15000,
			onClose: async () => {
				await resetGameState()
			}
		})
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

		await notice('CUSTOM', {
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
			await onGameOver({ ...host, lives: hostLives }, { ...opponent, lives: opponentLives })
			return
		}

		await notice('CUSTOM', {
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

	// useEffect(() => {
	// 	const turnNotice = () => {
	// 		if (!gameStarted) return

	// 		if (gameState.turn === userId) {
	// 			return notice('CUSTOM', {
	// 				title: 'Your turn'
	// 			})
	// 		}

	// 		if (gameState.turn === opponentPlayer.id) {
	// 			return notice('CUSTOM', {
	// 				title: "Opponent's turn"
	// 			})
	// 		}
	// 	}

	// 	turnNotice()

	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [gameState.turn])

	return (
		<GameContext.Provider
			value={{
				gameState,
				acceptGame,
				addToContainer,
				removeFromContainer,
				addToRow,
				addToPreview,
				clearPreview,
				setTurn,
				setPlayerGameStatus,
				updatePlayerState,
				setGameState,
				saveRoundScores
			}}>
			{children}
		</GameContext.Provider>
	)
}

'use client'

import { deepEqual } from '@/lib/utils'
import { Card, CardType } from '@/types/Card'
import { GamePlayer, GameRow, GameState } from '@/types/Game'
import { Player } from '@/types/Player'
import { RowType } from '@/types/RowType'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React, { createContext, useEffect, useMemo, useReducer } from 'react'
import { toast } from 'sonner'
import { Action, actions } from '../actions'

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

	function onBroadcast(payload: { [key: string]: any; type: 'broadcast'; event: string }) {
		const newOtherPlayer = payload.payload.otherPlayer
		const currentOtherPlayer = gameState.players.find(player => player?.id === newOtherPlayer?.id)

		const newGameState: GameState = {
			...gameState,
			turn: payload.payload.turn,
			players: gameState.players.map(player => (player.id === newOtherPlayer?.id ? newOtherPlayer : player))
		}

		if (!newOtherPlayer && deepEqual(newOtherPlayer ?? {}, currentOtherPlayer ?? {})) {
			return null
		}

		dispatch({ type: 'CUSTOM', gameState: newGameState })

		if (currentPlayer?.hasPassed && newOtherPlayer?.hasPassed) {
			handleRoundEnd(currentPlayer, newOtherPlayer)
		}
	}

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

	const onGameEnd = (host: GamePlayer, opponent: GamePlayer) => {
		if (!host || !opponent) return

		// Winner is the player that doesnt have 0 lives (if both have 0 lives, it's a draw)
		const winner = host.lives === 0 && opponent.lives === 0 ? 'draw' : host.lives === 0 ? opponent.name : host.name

		toast('Game over', {
			description: winner === 'draw' ? 'It was a draw!' : `${winner} won!`
		})

		updatePlayerState(host.id, {
			...initialPlayer,
			gameStatus: 'game-over'
		})
		updatePlayerState(opponent.id, {
			...initialPlayer,
			gameStatus: 'game-over'
		})
		setTurn(null)
	}

	const handleRoundEnd = (host: GamePlayer, opponent: GamePlayer) => {
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
			turn: winner === 'draw' ? (Math.random() < 0.5 ? host.id : opponent.id) : winner,
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
							lives: (winner === p.id ? p.lives : p.lives - 1) as 0 | 1 | 2
					  }
					: p
			)
		}

		setGameState(newGameState)
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

				if (currentPlayer?.hasPassed && opponentPlayer?.hasPassed) {
					handleRoundEnd(currentPlayer, opponentPlayer)
				}

				if (currentPlayer) await updateCurrentUserOnServer(currentPlayer)
				await updateGameStateOnServer({ rounds: gameState.rounds, turn: gameState.turn })
			})

		return () => {
			roomChannel.unsubscribe()
		}
	}, [roomId, currentPlayerChangesToListenTo, gameState.turn])

	useEffect(() => {
		if (currentPlayer && opponentPlayer && (currentPlayer?.lives === 0 || opponentPlayer?.lives === 0)) {
			onGameEnd(currentPlayer, opponentPlayer)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPlayer?.lives, opponentPlayer?.lives])

	useEffect(() => {
		const setPass = () => {
			if (currentPlayer?.hand.length === 0 && gameStarted) {
				updatePlayerState(currentPlayer.id, {
					hasPassed: true
				})
			}
		}

		setPass()
	}, [currentPlayer?.hand])

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

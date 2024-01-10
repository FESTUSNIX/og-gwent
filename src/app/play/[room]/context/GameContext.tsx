'use client'

import { Card } from '@/types/Card'
import { GamePlayer, GameRow, GameState } from '@/types/Game'
import { Player } from '@/types/Player'
import { RowType } from '@/types/RowType'
import React, { createContext, useReducer } from 'react'
import { Action, actions } from '../actions'
import { GameStateHandler } from '../components/GameStateHandler'

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
			<GameStateHandler roomId={roomId} userId={userId} />
			{children}
		</GameContext.Provider>
	)
}

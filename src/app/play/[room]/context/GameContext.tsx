'use client'

import { Card } from '@/types/Card'
import { GamePlayer, GameRow, GameState } from '@/types/Game'
import { Player } from '@/types/Player'
import { RowType } from '@/types/RowType'
import React, { createContext, useEffect, useReducer } from 'react'
import { Action, actions } from '../actions'

export const initialGameState: GameState = {
	players: [],
	rounds: []
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
}

const gameReducer = (state: GameState, action: Action | CUSTOM) => {
	switch (action.type) {
		case 'CUSTOM':
			return action.gameState
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
		default:
			return initialGameState
	}
}

type GameContextProps = {
	acceptGame: (player: Player, startingDeck: Card[]) => void
	addToContainer: (playerId: number, cards: Card[], destination: CardContainers, shouldReplace?: boolean) => void
	removeFromContainer: (playerId: number, cards: Card[], source: CardContainers) => void
	addToRow: (playerId: number, card: Card, rowType: RowType) => void
	addToPreview: (playerId: number, card: Card) => void
	clearPreview: (playerId: number) => void
	setGameState: (newGameState: GameState) => void
	gameState: GameState
}

const initialState: GameContextProps = {
	acceptGame: () => {},
	addToContainer: () => {},
	removeFromContainer: () => {},
	addToRow: () => {},
	addToPreview: () => {},
	clearPreview: () => {},
	setGameState: () => {},
	gameState: initialGameState
}

export const GameContext = createContext(initialState)

export const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

	const acceptGame = (player: Player, startingDeck: Card[]) => dispatch({ type: 'ACCEPT_GAME', player, startingDeck })

	const addToContainer = (playerId: number, cards: Card[], destination: CardContainers, shouldReplace?: boolean) =>
		dispatch({ type: 'ADD_TO_CONTAINER', playerId, cards, destination, shouldReplace })

	const removeFromContainer = (playerId: number, cards: Card[], source: CardContainers) =>
		dispatch({ type: 'REMOVE_FROM_CONTAINER', playerId, cards, source })

	const addToRow = (playerId: number, card: Card, rowType: RowType) =>
		dispatch({ type: 'ADD_TO_ROW', playerId, card, rowType })

	const addToPreview = (playerId: number, card: Card) => dispatch({ type: 'ADD_TO_PREVIEW', playerId, card })
	const clearPreview = (playerId: number) => dispatch({ type: 'CLEAR_PREVIEW', playerId })

	const setGameState = (newGameState: GameState) => {
		dispatch({
			type: 'CUSTOM',
			gameState: newGameState
		})
	}

	// On mount, load the state from local storage
	useEffect(() => {
		const gameStateFromLocalStorage = window.localStorage.getItem('gameState')

		if (gameStateFromLocalStorage) {
			const parsedGameState = JSON.parse(gameStateFromLocalStorage)
			dispatch({ type: 'CUSTOM', gameState: parsedGameState })
		}
	}, [])

	// On change save the state to local storage
	useEffect(() => {
		if (gameState === initialGameState) return

		window.localStorage.setItem('gameState', JSON.stringify(gameState))
	}, [gameState])

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
				setGameState
			}}>
			{children}
		</GameContext.Provider>
	)
}

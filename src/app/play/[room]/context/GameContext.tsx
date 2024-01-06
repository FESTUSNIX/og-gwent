'use client'

import { supabase } from '@/lib/supabase/supabase'
import { Card } from '@/types/Card'
import { GamePlayer, GameRow, GameState } from '@/types/Game'
import { Player } from '@/types/Player'
import { RowType } from '@/types/RowType'
import React, { createContext, useEffect, useReducer } from 'react'
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
		case 'SET_TURN':
			return actions.setTurn(state, action)
		case 'SET_PLAYER_GAME_STATUS':
			return actions.setPlayerGameStatus(state, action)
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
	setTurn: () => {},
	setPlayerGameStatus: () => {},
	setGameState: () => {},
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
	const supabaseClient = supabase()

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

	const setGameState = (newGameState: GameState) => {
		dispatch({
			type: 'CUSTOM',
			gameState: newGameState
		})
	}

	function onBroadcast(payload: { [key: string]: any; type: 'broadcast'; event: string }) {
		const newOtherPlayer = payload.payload.otherPlayer
		const currentOtherPlayer = gameState.players.find(player => player.id === newOtherPlayer?.id)

		const newGameState: GameState = {
			...payload.payload,
			players: [...gameState.players.filter(player => player.id !== newOtherPlayer?.id), newOtherPlayer]
		}

		if (!newOtherPlayer && deepEqual(newOtherPlayer ?? {}, currentOtherPlayer ?? {})) return null

		dispatch({ type: 'CUSTOM', gameState: newGameState })
	}

	const currentPlayer = gameState.players.find(player => player.id === userId)

	useEffect(() => {
		const roomChannel = supabaseClient.channel(`room=${roomId}`)

		roomChannel
			.on('broadcast', { event: 'game' }, payload => onBroadcast(payload))
			.subscribe(status => {
				if (status !== 'SUBSCRIBED') {
					return null
				}

				const currentPlayerGameState = gameState.players.find(player => player.id === userId)

				roomChannel.send({
					type: 'broadcast',
					event: 'game',
					payload: { otherPlayer: currentPlayerGameState, turn: gameState.turn }
				})
			})

		return () => {
			roomChannel.unsubscribe()
		}
	}, [roomId, currentPlayer])

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
				setGameState
			}}>
			{children}
		</GameContext.Provider>
	)
}

function deepEqual(object1: any, object2: any) {
	const keys1 = Object.keys(object1)
	const keys2 = Object.keys(object2)

	if (keys1.length !== keys2.length) {
		return false
	}

	for (const key of keys1) {
		const val1 = object1[key]
		const val2 = object2[key]
		const areObjects = isObject(val1) && isObject(val2)
		if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
			return false
		}
	}

	return true
}

function isObject(object: any) {
	return object != null && typeof object === 'object'
}

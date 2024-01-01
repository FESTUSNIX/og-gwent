'use client'

import { Card } from '@/types/Card'
import { GamePlayer, GameRow, GameState } from '@/types/Game'
import { Player } from '@/types/Player'
import React, { createContext, useReducer } from 'react'

const initialGameState: GameState = {
	players: [],
	rounds: []
}

const initialRow: GameRow = {
	cards: []
}

const initialPlayer: Omit<GamePlayer, 'id' | 'name' | 'faction'> = {
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

type ACCEPT_GAME = {
	type: 'ACCEPT_GAME'
	player: Player
	startingDeck: Card[]
}

type ADD_CARDS_TO_HAND = {
	type: 'ADD_CARDS_TO_HAND'
	playerId: number
	cards: Card[]
	shouldReplace?: boolean
}

type MOVE_CARDS_TO_DECK = {
	type: 'MOVE_CARDS_TO_DECK'
	playerId: number
	cards: Card[]
	shouldReplace?: boolean
}

type CUSTOM = {
	type: 'CUSTOM'
	gameState: GameState
}

const gameReducer = (state: GameState, action: ACCEPT_GAME | ADD_CARDS_TO_HAND | MOVE_CARDS_TO_DECK | CUSTOM) => {
	if (action.type === 'CUSTOM') {
		return action.gameState
	} else if (action.type === 'ACCEPT_GAME') {
		const newPlayer: GamePlayer = {
			...initialPlayer,
			...action.player,
			deck: action.startingDeck,
			gameStatus: 'accepted'
		}

		const newPlayers = state.players.length < 2 ? [...state.players, newPlayer] : state.players

		const payload: GameState = {
			...state,
			players: newPlayers
		}

		return payload
	} else if (action.type === 'ADD_CARDS_TO_HAND') {
		const player = state.players.find(p => p.id === action.playerId)
		if (!player) return state

		const newHand = action.shouldReplace
			? action.cards
			: [...player.hand, ...action.cards].filter((c, i, a) => a.indexOf(c) === i)

		const newPlayerState: GamePlayer = {
			...player,
			hand: newHand,
			deck: player.deck.filter(c => !action.cards.includes(c))
		}

		const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

		return {
			...state,
			players: newPlayersState
		}
	} else if (action.type === 'MOVE_CARDS_TO_DECK') {
		const player = state.players.find(p => p.id === action.playerId)
		if (!player) return state

		const newDeck = action.shouldReplace
			? action.cards
			: [...player.deck, ...action.cards].filter((c, i, a) => a.indexOf(c) === i)

		const newPlayerState: GamePlayer = {
			...player,
			deck: newDeck
		}

		const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

		return {
			...state,
			players: newPlayersState
		}
	} else {
		return initialGameState
	}
}

type GameContextProps = {
	acceptGame: (player: Player, startingDeck: Card[]) => void
	addCardsToHand: (playerId: number, cards: Card[], shouldReplace?: boolean) => void
	moveCardsToDeck: (playerId: number, cards: Card[], shouldReplace?: boolean) => void
	setGameState: (newGameState: GameState) => void
	gameState: GameState
}

const initialState: GameContextProps = {
	acceptGame: () => {},
	addCardsToHand: () => {},
	moveCardsToDeck: () => {},
	setGameState: () => {},
	gameState: initialGameState
}

export const GameContext = createContext(initialState)

export const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

	const acceptGame = (player: Player, startingDeck: Card[]) => {
		dispatch({ type: 'ACCEPT_GAME', player, startingDeck })
	}

	const addCardsToHand = (playerId: number, cards: Card[], shouldReplace?: boolean) => {
		dispatch({ type: 'ADD_CARDS_TO_HAND', playerId, cards, shouldReplace })
	}

	const moveCardsToDeck = (playerId: number, cards: Card[], shouldReplace?: boolean) => {
		dispatch({ type: 'MOVE_CARDS_TO_DECK', playerId, cards, shouldReplace })
	}

	const setGameState = (newGameState: GameState) => {
		dispatch({
			type: 'CUSTOM',
			gameState: newGameState
		})
	}

	return (
		<GameContext.Provider value={{ gameState, acceptGame, addCardsToHand, moveCardsToDeck, setGameState }}>
			{children}
		</GameContext.Provider>
	)
}

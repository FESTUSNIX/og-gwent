import { Card } from '@/types/Card'
import { GamePlayer, GameState } from '@/types/Game'
import { Player } from '@/types/Player'
import { RowType } from '@/types/RowType'
import { CardContainers, initialPlayer } from '../context/GameContext'

type ACCEPT_GAME = {
	type: 'ACCEPT_GAME'
	player: Player
	startingDeck: Card[]
}

const acceptGame = (state: GameState, action: ACCEPT_GAME) => {
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
}

type ADD_TO_CONTAINER = {
	type: 'ADD_TO_CONTAINER'
	playerId: Player['id']
	cards: Card[]
	destination: CardContainers
	shouldReplace?: boolean
}

const addToContainer = (state: GameState, action: ADD_TO_CONTAINER) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	let newCards: Card[] = action.shouldReplace
		? action.cards
		: [...player[action.destination], ...action.cards].filter((c, i, a) => a.indexOf(c) === i)

	const newPlayerState: GamePlayer = {
		...player,
		[action.destination]: newCards
	}

	const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

	return {
		...state,
		players: newPlayersState
	}
}

type REMOVE_FROM_CONTAINER = {
	type: 'REMOVE_FROM_CONTAINER'
	playerId: Player['id']
	cards: Card[]
	source: CardContainers
}

const removeFromContainer = (state: GameState, action: REMOVE_FROM_CONTAINER) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	const newPlayerState: GamePlayer = {
		...player,
		[action.source]: player[action.source].filter(c => !action.cards.includes(c))
	}

	const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

	return {
		...state,
		players: newPlayersState
	}
}

type ADD_TO_ROW = {
	type: 'ADD_TO_ROW'
	playerId: Player['id']
	card: Card
	rowType: RowType
}

const addToRow = (state: GameState, action: ADD_TO_ROW) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	const rowToModify = player.rows[action.rowType]

	const newPlayerState: GamePlayer = {
		...player,
		rows: {
			...player.rows,
			[action.rowType]: {
				...rowToModify,
				cards: [...rowToModify.cards, action.card]
			}
		}
	}

	const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

	return {
		...state,
		players: newPlayersState
	}
}

type ADD_TO_PREVIEW = {
	type: 'ADD_TO_PREVIEW'
	playerId: Player['id']
	card: Card
}

const addToPreview = (state: GameState, action: ADD_TO_PREVIEW) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	const newPlayerState: GamePlayer = {
		...player,
		preview: action.card
	}

	const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

	return {
		...state,
		players: newPlayersState
	}
}

type CLEAR_PREVIEW = {
	type: 'CLEAR_PREVIEW'
	playerId: Player['id']
}

const clearPreview = (state: GameState, action: CLEAR_PREVIEW) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	const newPlayerState: GamePlayer = {
		...player,
		preview: null
	}

	const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

	return {
		...state,
		players: newPlayersState
	}
}

type SET_TURN = {
	type: 'SET_TURN'
	playerId: Player['id'] | null
}

const setTurn = (state: GameState, action: SET_TURN) => {
	return {
		...state,
		turn: action.playerId
	}
}

type SET_PLAYER_GAME_STATUS = {
	type: 'SET_PLAYER_GAME_STATUS'
	playerId: Player['id']
	status: GamePlayer['gameStatus']
}

const setPlayerGameStatus = (state: GameState, action: SET_PLAYER_GAME_STATUS) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	const newPlayerState: GamePlayer = {
		...player,
		gameStatus: action.status
	}

	const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

	return {
		...state,
		players: newPlayersState
	}
}

type Action =
	| ACCEPT_GAME
	| ADD_TO_CONTAINER
	| ADD_TO_ROW
	| ADD_TO_PREVIEW
	| CLEAR_PREVIEW
	| REMOVE_FROM_CONTAINER
	| SET_TURN
	| SET_PLAYER_GAME_STATUS

const actions = {
	acceptGame,
	addToContainer,
	removeFromContainer,
	addToRow,
	addToPreview,
	setTurn,
	setPlayerGameStatus,
	clearPreview
}

export { actions, type Action }

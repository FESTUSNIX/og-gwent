import { Card } from '@/types/Card'
import { GamePlayer, GameState } from '@/types/Game'
import { Player } from '@/types/Player'
import { BoardRowTypes } from '@/types/RowType'
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

	const newPlayers = state.players.map(p => (p.id === action.player.id ? newPlayer : p))

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
		: [...player[action.destination], ...action.cards].filter(
				(card, i, self) => i === self.findIndex(t => t.instance === card.instance)
		  )

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
		[action.source]: player[action.source].filter(c => !action.cards.find(ac => ac.instance === c.instance))
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
	rowType: BoardRowTypes
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

type REMOVE_FROM_ROW = {
	type: 'REMOVE_FROM_ROW'
	playerId: Player['id']
	cards: (Card | undefined)[]
	rowType: BoardRowTypes
}

const removeFromRow = (state: GameState, action: REMOVE_FROM_ROW) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	const rowToModify = player.rows[action.rowType]

	const newPlayerState: GamePlayer = {
		...player,
		rows: {
			...player.rows,
			[action.rowType]: {
				...rowToModify,
				cards: rowToModify.cards.filter(c =>
					action.cards.map(actionCard => actionCard?.instance === c.instance).includes(true) ? false : true
				)
			}
		}
	}

	const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

	return {
		...state,
		players: newPlayersState
	}
}

type SET_ROW_EFFECT = {
	type: 'SET_ROW_EFFECT'
	playerId: Player['id']
	effect: Card
	rowType: BoardRowTypes
}

const setRowEffect = (state: GameState, action: SET_ROW_EFFECT) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	const rowToModify = player.rows[action.rowType]

	const newPlayerState: GamePlayer = {
		...player,
		rows: {
			...player.rows,
			[action.rowType]: {
				...rowToModify,
				effect: action.effect
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

type UPDATE_PLAYER_STATE = {
	type: 'UPDATE_PLAYER_STATE'
	playerId: Player['id']
	playerState: Partial<GamePlayer>
}

const updatePlayerState = (state: GameState, action: UPDATE_PLAYER_STATE) => {
	const player = state.players.find(p => p.id === action.playerId)
	if (!player) return state

	const newPlayerState: GamePlayer = {
		...player,
		...action.playerState
	}

	const newPlayersState = state.players.map(p => (p.id === action.playerId ? newPlayerState : p))

	return {
		...state,
		players: newPlayersState
	}
}

type SAVE_ROUND_SCORES = {
	type: 'SAVE_ROUND_SCORES'
	players: {
		id: GamePlayer['id']
		score: number
	}[]
}

const saveRoundScores = (state: GameState, action: SAVE_ROUND_SCORES) => {
	return {
		...state,
		rounds: [
			...state.rounds,
			{
				players: action.players
			}
		]
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
	| UPDATE_PLAYER_STATE
	| SAVE_ROUND_SCORES
	| SET_ROW_EFFECT
	| REMOVE_FROM_ROW

const actions = {
	acceptGame,
	addToContainer,
	removeFromContainer,
	addToRow,
	addToPreview,
	setTurn,
	setPlayerGameStatus,
	clearPreview,
	updatePlayerState,
	saveRoundScores,
	setRowEffect,
	removeFromRow
}

export { actions, type Action }

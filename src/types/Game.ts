import { Card } from './Card'
import { FactionType } from './Faction'

export type GameRow = {
	cards: Card[]
	// TODO: specialEffect
}

export type GamePlayer = {
	id: string
	name: string
	faction: FactionType
	preview: Card | null
	hasPassed: boolean
	gameStatus: 'select-deck' | 'accepted' | 'play'
	lives: 0 | 1 | 2
	deck: Card[]
	hand: Card[]
	discardPile: Card[]
	rows: {
		melee: GameRow
		range: GameRow
		siege: GameRow
	}
	// TODO: leaderCard
}

export type GameState = {
	players: GamePlayer[]
	rounds: {
		players: {
			id: GamePlayer['id']
			score: number
		}[]
	}[]
	turn: GamePlayer['id'] | null
	// TODO: weatherCard
}

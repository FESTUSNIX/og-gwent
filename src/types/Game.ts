import { Card } from './Card'
import { Player } from './Player'

export type GameRow = {
	cards: Card[]
	// TODO: specialEffect
}

export type GamePlayer = Player & {
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
		players: GamePlayer[]
		winner: number | 'draw'
	}[]
	// TODO: weatherCard
}

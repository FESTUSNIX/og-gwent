import { getRandomEntries } from '@/lib/utils';
import { GameRow, GameState } from '@/types/Game';
import { BoardRowTypes } from '@/types/RowType';

export const drawCard = ({ gameState, playerId }: { gameState: GameState; playerId: string }): GameState | null => {
	const player = gameState.players.find(p => p.id === playerId)
	if (!player) return null

	const deck = player.deck
	const hand = player.hand

	if (deck.length === 0) return null

	const card = getRandomEntries(deck, 1)[0]

	const newDeck = deck.filter(c => c.instance !== card.instance)
	const newHand = [...hand, card]

	return {
		...gameState,
		players: gameState.players.map(p =>
			p.id === playerId
				? {
						...p,
						deck: newDeck,
						hand: newHand
				  }
				: p
		)
	}
}

type BoardRows = {
	melee: GameRow
	range: GameRow
	siege: GameRow
}

const initialRow: GameRow = {
	cards: [],
	effect: null,
	name: null
}

function hashCodeOfString(str: string) {
	let hash = 0
	if (str.length === 0) return hash
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

function getRandomItemBasedOnCode<T>(arr: T[], inputCode: string): T {
	const hashCode = hashCodeOfString(inputCode)
	return arr[Math.abs(hashCode) % arr.length]
}

export const handleMonstersDeckAbility = ({
	rows,
	randomCode
}: {
	rows: BoardRows
	randomCode: string
}): { rows: BoardRows; cardToKeepInstance: string | null } => {
	const rowsWithCards = Object.entries(rows)
		.map(([_, row]) => ({ ...row, cards: row.cards.filter(c => c.type === 'unit') }))
		.filter(row => row.cards.length > 0)

	if (!rowsWithCards) return { rows, cardToKeepInstance: null }

	const randomRowName = getRandomItemBasedOnCode(rowsWithCards.map(r => r.name) as BoardRowTypes[], randomCode)

	const randomRow = rows[randomRowName]
	const cardToKeep = getRandomItemBasedOnCode(
		randomRow.cards.filter(c => c.type === 'unit'),
		randomCode
	)

	const newRows: BoardRows = {
		melee: { ...initialRow, name: 'melee' },
		range: { ...initialRow, name: 'range' },
		siege: { ...initialRow, name: 'siege' },
		[randomRowName]: {
			...randomRow,
			cards: [cardToKeep]
		}
	}

	return { rows: newRows, cardToKeepInstance: cardToKeep.instance }
}

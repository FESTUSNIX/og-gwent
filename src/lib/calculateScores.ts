import { CardType } from '@/types/Card'
import { GameRow } from '@/types/Game'

export const hasHorn = (row: GameRow) => {
	return row.effect?.ability === 'horn' || row.cards.find(c => c.ability === 'horn')
}

export const calculateCardScore = (card: CardType, row?: GameRow) => {
	if (card.strength === undefined) return undefined
	return row && hasHorn(row) && card.type !== 'hero' ? card.strength * 2 : card.strength
}

export const calculateRowScore = (row: GameRow) => {
	return row.cards.reduce((acc, card) => acc + (calculateCardScore(card, row) ?? 0), 0)
}

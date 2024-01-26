import { CardType } from '@/types/Card'
import { GameRow } from '@/types/Game'

export const hasHorn = (row: GameRow) => {
	return row.effect?.ability === 'horn' || row.cards.find(c => c.ability === 'horn')
}

export const hasMoraleBoost = (row: GameRow) => {
	return row.cards.find(c => c.ability === 'morale_boost')
}

export const calculateCardStrength = (card: CardType, row?: GameRow) => {
	let strength = card.strength

	if (strength === undefined) return undefined
	if (card.type === 'hero' || !row) return strength

	// Handle horn effect
	if (hasHorn(row) && card.ability !== 'horn') strength *= 2

	// Handle morale boost
	if (hasMoraleBoost(row) && card.ability !== 'morale_boost') strength += 1

	return strength
}

export const calculateRowScore = (row: GameRow) => {
	return row.cards.reduce((acc, card) => acc + (calculateCardStrength(card, row) ?? 0), 0)
}

export const calculateGameScore = (rows: { melee: GameRow; range: GameRow; siege: GameRow } | GameRow[]) => {
	return Object.values(rows).reduce((acc, row) => acc + calculateRowScore(row), 0)
}

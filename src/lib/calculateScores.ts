import { CardType } from '@/types/Card'
import { GameRow } from '@/types/Game'
import { ROW_TO_WEATHER_EFFECT, WeatherEffect } from '@/types/WeatherEffect'

export const hasHorn = (row: GameRow) => {
	return row.effect?.ability === 'horn' || row.cards.find(c => c.ability === 'horn')
}

export const getMoraleBoostCards = (row: GameRow, card: CardType) => {
	return row.cards.filter(c => c.ability === 'morale_boost' && card.instance !== c.instance)
}

export const hasTightBond = (row: GameRow, card: CardType) => {
	return row.cards.find(
		c =>
			(card.group === undefined ? card.id === c.id : card.group === c.group) &&
			c.ability === 'tight_bond' &&
			card.ability === 'tight_bond'
	)
}

export const calculateCardStrength = (card: CardType, row?: GameRow, weatherEffect?: WeatherEffect) => {
	let strength = card.strength

	if (strength === undefined) return undefined
	if (card.type === 'hero' || !row) return strength

	const isWeather = weatherEffect && row.name && ROW_TO_WEATHER_EFFECT[row.name] === weatherEffect

	// Handle weather effect
	if (isWeather) strength = 1

	// Handle tight bond
	if (hasTightBond(row, card)) {
		const tightBondCards = row.cards.filter(
			c => c.group === card.group && c.ability === 'tight_bond' && card.ability === 'tight_bond'
		)
		strength += (strength ?? 0) * (tightBondCards.length - 1)
	}

	// Handle horn effect
	if (hasHorn(row) && card.ability !== 'horn') strength *= 2

	// Handle morale boost
	const moraleBoostCards = getMoraleBoostCards(row, card)
	if (moraleBoostCards.length > 0) strength += moraleBoostCards.length

	return strength
}

export const calculateRowScore = (row: GameRow, weatherEffect?: WeatherEffect) => {
	return row.cards.reduce((acc, card) => acc + (calculateCardStrength(card, row, weatherEffect) ?? 0), 0)
}

export const calculateGameScore = (
	rows: { melee: GameRow; range: GameRow; siege: GameRow } | GameRow[],
	weatherEffects?: WeatherEffect[]
) => {
	return Object.values(rows).reduce(
		(acc, row) =>
			acc +
			calculateRowScore(
				row,
				(row.name && weatherEffects?.find(effect => effect === ROW_TO_WEATHER_EFFECT[row.name!])) ?? undefined
			),
		0
	)
}

import { FactionType } from './Faction'
import { RowType } from './RowType'

type Card = {
	id: number
	slug: string
	name: string
	strength: number
	type: RowType
	factions: FactionType[]
	description: string
	isHero: boolean
}

export { type Card, type Card as CardType }

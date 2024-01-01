import { FactionType } from './Faction'
import { RowType } from './RowType'

type Card = {
	id: number
	name: string
	strength: number
	type: RowType
	factions: FactionType[]
	isHero: boolean
}

export { type Card, type Card as CardType }

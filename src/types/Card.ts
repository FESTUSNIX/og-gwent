import { FactionType } from './Faction'
import { RowType } from './RowType'

export type Card = {
	id: number
	name: string
	strength: number
	type: RowType
	factions: FactionType[]
	isHero: boolean
}

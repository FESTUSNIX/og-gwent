import { Ability } from './Ability'
import { FactionType } from './Faction'
import { RowType } from './RowType'

type Card = {
	id: number
	slug: string
	name: string
	strength?: number
	row?: RowType
	ability?: Ability
	type: 'unit' | 'special' | 'hero' | 'weather'
	factions: FactionType[]
	description?: string
}

export { type Card, type Card as CardType }

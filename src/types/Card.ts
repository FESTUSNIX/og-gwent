import { Ability } from './Ability'
import { FactionType } from './Faction'
import { RowType } from './RowType'

type Card = {
	id: number
	slug: string
	name: string
	type: 'unit' | 'special' | 'hero' | 'weather'
	factions: FactionType[]
	strength?: number
	row?: RowType
	ability?: Ability
	description?: string
	group?: string
	amount?: number
	instance: string
}

export { type Card, type Card as CardType }

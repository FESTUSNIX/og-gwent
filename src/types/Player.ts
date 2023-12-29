import { FactionType } from './Faction'

export type Player = {
	id: number
	name: string
	faction: FactionType
	deck: number[]
}

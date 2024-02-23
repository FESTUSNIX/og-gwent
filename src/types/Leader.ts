import { FactionType } from './Faction'

export type LeaderCard = {
	slug: string
	name: string
	faction: Omit<FactionType, 'neutral'>
	description: string
	ability: () => void
}

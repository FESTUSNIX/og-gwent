import { FACTIONS } from '@/constants/FACTIONS'

export type Faction = {
	slug: string
	name: string
}

export type FactionType = Pick<(typeof FACTIONS)[number], 'slug'>['slug']
